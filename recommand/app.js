// ===============================
// file: Server/app.js
// ===============================

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ⚙️ CORS 설정
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://192.168.55.225:8081',
      'exp://192.168.55.225:8081', // ✅ Expo용
      'http://192.168.55.225:3000',
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('exp://') ||
        origin.startsWith('http://192.168.')
      ) {
        callback(null, true);
      } else {
        console.warn(`🚫 차단된 Origin 요청: ${origin}`);
        callback(new Error('CORS 정책에 의해 차단됨'));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 라우트 import
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';
import userRecipeRoutes from './routes/userRecipes.js';
import aiRoutes from './routes/ai.js';
import recommendationRoutes from './routes/recommendations.js'; // ✅ 추가됨

// ✅ 라우트 연결
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/user-recipes', userRecipeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recommendations', recommendationRoutes); // ✅ 추가됨

// ✅ AI 분석 상태 확인
app.get('/api/ai/status/:id', async (요청, 응답) => {
  const videoId = 요청.params.id.trim();

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*', { head: false })
      .ilike('video_id', videoId)
      .maybeSingle();

    if (error) {
      console.error('❌ Supabase 조회 오류:', error.message);
      return 응답.status(500).json({
        success: false,
        status: 'error',
        message: 'Supabase 조회 중 오류 발생',
      });
    }

    if (data) {
      console.log(`✅ [STATUS] 분석 완료된 영상: ${videoId}`);
      return 응답.status(200).json({
        success: true,
        status: 'completed',
        message: 'AI 분석이 완료되었습니다.',
        videoId,
        recipe: data,
      });
    }

    console.log(`⏳ [STATUS] 아직 분석 중인 영상: ${videoId}`);
    return 응답.status(200).json({
      success: true,
      status: 'processing',
      message: 'AI 분석이 아직 진행 중입니다.',
      videoId,
    });
  } catch (err) {
    console.error('❌ 상태 조회 중 오류:', err.message);
    return 응답.status(500).json({
      success: false,
      status: 'error',
      message: '상태 조회 중 내부 오류 발생',
    });
  }
});

// ✅ 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Cookit API 서버가 실행 중입니다!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ✅ 404 처리
app.use((req, res) => {
  res.status(404).json({
    error: '요청하신 리소스를 찾을 수 없습니다.',
    path: req.originalUrl,
  });
});

// ✅ 글로벌 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Cookit 서버 실행 중: 포트 ${PORT}`);
  console.log(`🌐 허용 Origin: ${allowedOrigins.join(', ')}`);
  console.log(`📱 환경: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
