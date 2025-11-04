import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();

/**
 * 인증 미들웨어
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: '인증 토큰이 필요합니다.' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    const authClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    const { data: { user }, error } = await authClient.auth.getUser(token);

    if (error || !user) {
      console.error('토큰 검증 오류:', error);
      return res.status(401).json({ 
        success: false, 
        error: '유효하지 않은 인증 토큰입니다.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('인증 오류:', error);
    res.status(401).json({ 
      success: false, 
      error: '인증 처리 중 오류가 발생했습니다.' 
    });
  }
};

/**
 * @route GET /api/receipt-items
 * @desc 현재 사용자의 재료 목록 조회
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('receipt_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 프론트엔드 호환성을 위해 필드명 변환
    const transformedData = (data || []).map(item => ({
      ...item,
      name: item.product_name,
      expiration_date: item.expiry_date,
      storage_type: item.storage_type || '냉장' // 기본값 냉장
    }));

    res.json({
      success: true,
      items: transformedData
    });

  } catch (error) {
    console.error('재료 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '재료 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route POST /api/receipt-items
 * @desc 재료 추가
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, quantity, unit, expiration_date, storage_type } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '재료 이름은 필수입니다.' 
      });
    }

    // storage_type 유효성 검사
    const validStorageTypes = ['냉장', '냉동', '실온'];
    const finalStorageType = storage_type && validStorageTypes.includes(storage_type) 
      ? storage_type 
      : '냉장'; // 기본값

    const { data, error } = await supabase
      .from('receipt_items')
      .insert({
        user_id: userId,
        product_name: name.trim(), // DB 컬럼명: product_name
        quantity: quantity || 1,
        unit: unit || null,
        expiry_date: expiration_date || null, // DB 컬럼명: expiry_date
        storage_type: finalStorageType
      })
      .select()
      .single();

    if (error) throw error;

    // 프론트엔드 호환성을 위해 필드명 변환
    const transformedItem = {
      ...data,
      name: data.product_name,
      expiration_date: data.expiry_date
    };

    res.status(201).json({
      success: true,
      message: '재료가 추가되었습니다.',
      item: transformedItem
    });

  } catch (error) {
    console.error('재료 추가 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '재료 추가 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route POST /api/receipt-items/bulk
 * @desc 여러 재료 일괄 추가
 */
router.post('/bulk', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '유효한 재료 목록이 필요합니다.' 
      });
    }

    // storage_type 유효성 검사
    const validStorageTypes = ['냉장', '냉동', '실온'];
    
    const itemsToInsert = items.map(item => ({
      user_id: userId,
      product_name: item.name?.trim(), // DB 컬럼명: product_name
      quantity: item.quantity || 1,
      unit: item.unit || null,
      expiry_date: item.expiration_date || null, // DB 컬럼명: expiry_date
      storage_type: item.storage_type && validStorageTypes.includes(item.storage_type) 
        ? item.storage_type 
        : '냉장' // 기본값
    }));

    const { data, error } = await supabase
      .from('receipt_items')
      .insert(itemsToInsert)
      .select();

    if (error) throw error;

    // 프론트엔드 호환성을 위해 필드명 변환
    const transformedData = (data || []).map(item => ({
      ...item,
      name: item.product_name,
      expiration_date: item.expiry_date
    }));

    res.status(201).json({
      success: true,
      message: `${transformedData.length}개의 재료가 추가되었습니다.`,
      items: transformedData
    });

  } catch (error) {
    console.error('재료 일괄 추가 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '재료 일괄 추가 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route PUT /api/receipt-items/:itemId
 * @desc 재료 수정
 */
router.put('/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { name, quantity, unit, expiration_date, category, storage_type } = req.body;

    // 소유권 확인
    const { data: existingItem, error: checkError } = await supabase
      .from('receipt_items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (checkError || !existingItem) {
      return res.status(404).json({ 
        success: false, 
        error: '재료를 찾을 수 없습니다.' 
      });
    }

    if (existingItem.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '수정 권한이 없습니다.' 
      });
    }

    // storage_type 유효성 검사
    const validStorageTypes = ['냉장', '냉동', '실온'];
    
    const updateData = {};
    if (name !== undefined) updateData.product_name = name.trim(); // DB 컬럼명: product_name
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unit !== undefined) updateData.unit = unit;
    if (expiration_date !== undefined) updateData.expiry_date = expiration_date; // DB 컬럼명: expiry_date
    if (storage_type !== undefined) {
      updateData.storage_type = validStorageTypes.includes(storage_type) 
        ? storage_type 
        : '냉장'; // 기본값
    }

    const { data, error } = await supabase
      .from('receipt_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;

    // 프론트엔드 호환성을 위해 필드명 변환
    const transformedItem = {
      ...data,
      name: data.product_name,
      expiration_date: data.expiry_date
    };

    res.json({
      success: true,
      message: '재료가 수정되었습니다.',
      item: transformedItem
    });

  } catch (error) {
    console.error('재료 수정 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '재료 수정 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route DELETE /api/receipt-items/:itemId
 * @desc 재료 삭제
 */
router.delete('/:itemId', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // 소유권 확인
    const { data: existingItem, error: checkError } = await supabase
      .from('receipt_items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (checkError || !existingItem) {
      return res.status(404).json({ 
        success: false, 
        error: '재료를 찾을 수 없습니다.' 
      });
    }

    if (existingItem.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '삭제 권한이 없습니다.' 
      });
    }

    const { error } = await supabase
      .from('receipt_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    res.json({
      success: true,
      message: '재료가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('재료 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '재료 삭제 중 오류가 발생했습니다.' 
    });
  }
});

export default router;

