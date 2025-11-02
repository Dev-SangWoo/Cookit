const express = require('express');
const router = express.Router();

// 모든 사용자 조회
router.get('/', (req, res) => {
  try {
    // TODO: 실제 사용자 데이터 조회 로직 구현
    res.json({
      success: true,
      data: [
        {
          id: 1,
          name: '김쿡잇',
          email: 'kim@cookit.com',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: '이요리',
          email: 'lee@cookit.com',
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '사용자 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 사용자 조회
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 실제 사용자 데이터 조회 로직 구현
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        name: '김쿡잇',
        email: 'kim@cookit.com',
        profile: {
          bio: '요리를 사랑하는 사람',
          favoriteFood: '파스타'
        },
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: '사용자를 찾을 수 없습니다.',
      error: error.message
    });
  }
});

// 사용자 정보 수정
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio } = req.body;
    
    // TODO: 실제 사용자 정보 수정 로직 구현
    res.json({
      success: true,
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      data: {
        id: parseInt(id),
        name,
        email,
        bio,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '사용자 정보 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 사용자 삭제
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 실제 사용자 삭제 로직 구현
    res.json({
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.',
      deletedId: parseInt(id)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '사용자 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router; 