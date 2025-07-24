const express = require('express');
const router = express.Router();

// 모든 레시피 조회
router.get('/', (req, res) => {
  try {
    // TODO: 실제 레시피 데이터 조회 로직 구현
    res.json({
      success: true,
      data: [
        {
          id: 1,
          title: '김치볶음밥',
          description: '간단하고 맛있는 김치볶음밥 레시피',
          cookingTime: '15분',
          difficulty: '쉬움',
          ingredients: ['밥', '김치', '계란', '대파', '참기름'],
          author: {
            id: 1,
            name: '김쿡잇'
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: '토마토 파스타',
          description: '진짜 이탈리아식 토마토 파스타',
          cookingTime: '25분',
          difficulty: '보통',
          ingredients: ['파스타면', '토마토', '마늘', '바질', '올리브오일'],
          author: {
            id: 2,
            name: '이요리'
          },
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '레시피 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 특정 레시피 조회
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 실제 레시피 데이터 조회 로직 구현
    res.json({
      success: true,
      data: {
        id: parseInt(id),
        title: '김치볶음밥',
        description: '간단하고 맛있는 김치볶음밥 레시피',
        cookingTime: '15분',
        difficulty: '쉬움',
        servings: 2,
        ingredients: [
          { name: '밥', amount: '2공기' },
          { name: '김치', amount: '1컵' },
          { name: '계란', amount: '2개' },
          { name: '대파', amount: '1대' },
          { name: '참기름', amount: '1큰술' }
        ],
        instructions: [
          '팬에 기름을 두르고 김치를 볶아주세요.',
          '밥을 넣고 김치와 잘 섞어주세요.',
          '계란을 풀어서 넣고 볶아주세요.',
          '대파와 참기름을 넣고 마무리하세요.'
        ],
        author: {
          id: 1,
          name: '김쿡잇'
        },
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: '레시피를 찾을 수 없습니다.',
      error: error.message
    });
  }
});

// 새 레시피 생성
router.post('/', (req, res) => {
  try {
    const { title, description, cookingTime, difficulty, ingredients, instructions } = req.body;
    
    // TODO: 실제 레시피 생성 로직 구현
    res.status(201).json({
      success: true,
      message: '레시피가 성공적으로 생성되었습니다.',
      data: {
        id: Date.now(),
        title,
        description,
        cookingTime,
        difficulty,
        ingredients,
        instructions,
        author: {
          id: 1,
          name: '사용자'
        },
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '레시피 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 레시피 수정
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, cookingTime, difficulty, ingredients, instructions } = req.body;
    
    // TODO: 실제 레시피 수정 로직 구현
    res.json({
      success: true,
      message: '레시피가 성공적으로 수정되었습니다.',
      data: {
        id: parseInt(id),
        title,
        description,
        cookingTime,
        difficulty,
        ingredients,
        instructions,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '레시피 수정 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 레시피 삭제
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 실제 레시피 삭제 로직 구현
    res.json({
      success: true,
      message: '레시피가 성공적으로 삭제되었습니다.',
      deletedId: parseInt(id)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '레시피 삭제 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

module.exports = router; 