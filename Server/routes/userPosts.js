import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();

/**
 * 사용자 프로필 확인/생성 헬퍼 함수
 */
async function ensureUserProfile(userId, user) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!profile) {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: user?.email,
        display_name: user?.user_metadata?.name || 
                     user?.user_metadata?.full_name || 
                     user?.email?.split('@')[0] || 
                     'User',
      });

    if (error) {
      console.error('User profile creation failed:', error);
      throw error;
    }
  }
}

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
    
    // ANON_KEY를 사용한 별도 클라이언트로 토큰 검증
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
 * @route POST /api/user-posts
 * @desc 게시글 작성
 * @body { title, content, recipe_id?, tags, image_urls? }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, recipe_id, tags, image_urls } = req.body;
    const userId = req.user.id;

    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '제목을 입력해주세요.' 
      });
    }

    // 사용자 프로필 확인/생성
    await ensureUserProfile(userId, req.user);

    // tags 검증 (배열이어야 함)
    const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : ['공개']);
    
    const { data, error } = await supabase
      .from('user_posts')
      .insert({
        user_id: userId,
        title: title.trim(),
        content: (content && content.trim()) || '',
        recipe_id: recipe_id || null,
        tags: tagsArray,
        image_urls: image_urls || [],
      })
      .select(`
        post_id, title, content, image_urls, created_at, updated_at, tags,
        user_profiles ( id, display_name, avatar_url ),
        recipe_id
      `)
      .single();

    if (error) {
      console.error('게시글 작성 오류:', error);
      throw error;
    }

    res.json({
      success: true,
      message: '게시글이 작성되었습니다.',
      post: data
    });

  } catch (error) {
    console.error('게시글 작성 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 작성 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/user-posts
 * @desc 게시글 목록 조회
 * @query { tags?, page?, limit? }
 */
router.get('/', async (req, res) => {
  try {
    const { tags, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('user_posts')
      .select(`
        post_id, title, content, image_urls, created_at, updated_at, tags,
        user_profiles ( id, display_name, avatar_url ),
        user_post_likes ( id ),
        user_post_comments ( id ),
        recipe_id
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // tags 필터링
    if (tags) {
      // Supabase에서 배열 필드에 특정 값이 포함되어 있는지 확인
      // PostgREST의 contains 연산자 사용: tags 배열에 해당 값이 포함된 게시글만 조회
      query = query.contains('tags', [tags]);
    }
    
    console.log('🔍 게시글 조회 쿼리:', { tags, page, limit });

    const { data, error } = await query;

    if (error) {
      console.error('게시글 목록 조회 오류:', error);
      throw error;
    }

    const posts = data.map(post => ({
      ...post,
      like_count: post.user_post_likes?.length || 0,
      comment_count: post.user_post_comments?.length || 0,
    }));

    console.log('✅ 조회된 게시글 개수:', posts.length);
    console.log('✅ 첫 번째 게시글 샘플:', posts[0] ? {
      post_id: posts[0].post_id,
      title: posts[0].title,
      tags: posts[0].tags,
      image_urls: posts[0].image_urls
    } : '없음');

    res.json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: posts.length
      }
    });

  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route GET /api/user-posts/:postId
 * @desc 게시글 상세 조회
 */
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    const { data, error } = await supabase
      .from('user_posts')
      .select(`
        post_id, title, content, image_urls, created_at, updated_at, tags,
        user_profiles ( id, display_name, avatar_url ),
        recipe_id,
        recipes (
          id,
          title,
          description,
          image_urls
        )
      `)
      .eq('post_id', postId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: '게시글을 찾을 수 없습니다.' 
        });
      }
      throw error;
    }

    res.json({
      success: true,
      post: data
    });

  } catch (error) {
    console.error('게시글 상세 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route PUT /api/user-posts/:postId
 * @desc 게시글 수정
 * @body { title?, content?, image_urls?, tags? }
 */
router.put('/:postId', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, image_urls, tags } = req.body;
    const userId = req.user.id;

    // 게시글 소유자 확인
    const { data: existingPost, error: checkError } = await supabase
      .from('user_posts')
      .select('user_id')
      .eq('post_id', postId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: '게시글을 찾을 수 없습니다.' 
        });
      }
      throw checkError;
    }

    if (existingPost.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '게시글을 수정할 권한이 없습니다.' 
      });
    }

    // 업데이트 데이터 구성
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content?.trim() || null;
    if (image_urls !== undefined) updateData.image_urls = image_urls;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : [tags];
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('user_posts')
      .update(updateData)
      .eq('post_id', postId)
      .select(`
        post_id, title, content, image_urls, created_at, updated_at, tags,
        user_profiles ( id, display_name, avatar_url ),
        recipe_id
      `)
      .single();

    if (error) {
      console.error('게시글 수정 오류:', error);
      throw error;
    }

    res.json({
      success: true,
      message: '게시글이 수정되었습니다.',
      post: data
    });

  } catch (error) {
    console.error('게시글 수정 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 수정 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * @route DELETE /api/user-posts/:postId
 * @desc 게시글 삭제
 */
router.delete('/:postId', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // 게시글 소유자 확인
    const { data: existingPost, error: checkError } = await supabase
      .from('user_posts')
      .select('user_id')
      .eq('post_id', postId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          error: '게시글을 찾을 수 없습니다.' 
        });
      }
      throw checkError;
    }

    if (existingPost.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: '게시글을 삭제할 권한이 없습니다.' 
      });
    }

    const { error } = await supabase
      .from('user_posts')
      .delete()
      .eq('post_id', postId);

    if (error) {
      console.error('게시글 삭제 오류:', error);
      throw error;
    }

    res.json({
      success: true,
      message: '게시글이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '게시글 삭제 중 오류가 발생했습니다.' 
    });
  }
});

export default router;

