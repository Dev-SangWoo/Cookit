const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors()); // CORS 허용
app.use(morgan('combined')); // 로깅
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱

// 라우터 import
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const recipeRoutes = require('./routes/recipes');
const aiRoutes = require('./routes/ai');

// 라우터 사용
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ai', aiRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Cookit API 서버가 실행 중입니다!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 에러 핸들링
app.use((req, res, next) => {
  res.status(404).json({
    error: '요청하신 리소스를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Cookit 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

module.exports = app; 