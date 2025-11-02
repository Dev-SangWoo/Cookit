import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// 환경 변수 로드
dotenv.config();

// __dirname 대체 코드 (ESM 환경)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Supabase 클라이언트 설정
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ✅ CORS 설정 (환경변수 ALLOWED_ORIGINS 기반)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // 모바일 환경은 origin이 undefined일 수 있음 (Expo 환경)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 차단된 Origin 요청: ${origin}`);
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true,
}));

// ✅ 기타 보안/로깅/파서 미들웨어
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 라우터 import
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';
import userRecipeRoutes from './routes/userRecipes.js';
import recipeLikesRoutes from './routes/recipeLikes.js';
import userPostsRoutes from './routes/userPosts.js';
import recipeCategoriesRoutes from './routes/recipeCategories.js';
import receiptItemsRoutes from './routes/receiptItems.js';
import commentsRoutes from './routes/comments.js';
import postLikesRoutes from './routes/postLikes.js';
import aiRoutes from './routes/ai.js';
import youtubeRoutes from './routes/youtube.js';
import receiptListRoutes from './routes/receiptList.js';

// ✅ 라우터 등록
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/user-recipes', userRecipeRoutes);
app.use('/api/recipe-likes', recipeLikesRoutes);
app.use('/api/user-posts', userPostsRoutes);
app.use('/api/recipe-categories', recipeCategoriesRoutes);
app.use('/api/receipt-items', receiptItemsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/post-likes', postLikesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/receipt-list', receiptListRoutes);

// ✅ AI 분석 상태 확인 라우트
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

// ✅ 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Cookit 서버 실행 중: 포트 ${PORT}`);
  console.log(`🌐 허용 Origin: ${allowedOrigins.join(', ')}`);
  console.log(`📱 환경: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
