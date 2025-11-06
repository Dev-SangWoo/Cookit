import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { supabase } from '../services/supabaseClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


// ===================================================
// ✅ 1️⃣ YouTube 영상 분석 요청 (중복 검사 → 새 분석 실행)
// ===================================================
router.post('/analyze-youtube', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'YouTube URL이 필요합니다.' });
    }

    console.log(`🎬 AI 분석 요청 수신: ${url}`);

    // ✅ videoId 추출
    const videoIdMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) {
      return res.status(400).json({ success: false, error: '유효한 YouTube URL이 아닙니다.' });
    }

    // ✅ Supabase에서 중복 분석 여부 확인
    console.log(`🔍 Supabase 중복 확인 중: video_id = ${videoId}`);
    const { data: existingRecipe, error: checkError } = await supabase
      .from('recipes')
      .select('*')
      .eq('video_id', videoId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Supabase 중복 조회 오류:', checkError.message);
      return res.status(500).json({
        success: false,
        message: 'Supabase 중복 확인 중 오류 발생',
      });
    }

    // ✅ 이미 분석된 영상이면 즉시 기존 결과 반환
    if (existingRecipe) {
      console.log(`⚡ 이미 분석된 영상입니다: ${videoId}`);
      return res.status(200).json({
        success: true,
        status: 'completed',
        message: '이미 분석된 영상입니다. 기존 결과를 반환합니다.',
        videoId,
        recipe: existingRecipe,
      });
    }

    // ✅ 중복 아님 → 새 분석 시작
    console.log(`🚀 새 영상 분석 시작: ${videoId}`);

    const serverRoot = path.join(__dirname, '../');
    const pipelinePath = path.join(serverRoot, 'scripts', 'run_full_pipeline.cjs');

    // 로그 디렉토리 생성
    const logDir = path.join(serverRoot, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const logFile = path.join(logDir, `${videoId}.log`);
    console.log(`🧠 백그라운드 실행 (로그 파일: ${logFile})`);

    // 실행 명령어: stdout/stderr을 파일로 리다이렉트
    const cmd = `node "${pipelinePath}" "${url}" >> "${logFile}" 2>&1`;

    // ✅ 비동기 실행 (백그라운드)
    exec(cmd, { cwd: serverRoot, windowsHide: true }, (error) => {
      if (error) {
        fs.appendFileSync(logFile, `\n❌ 오류 발생: ${error.message}\n`);
      } else {
        fs.appendFileSync(logFile, `\n✅ 실행 완료\n`);
      }
    });

    // ✅ 요청 즉시 응답
    return res.status(202).json({
      success: true,
      status: 'processing',
      message: 'AI 분석이 백그라운드에서 실행 중입니다.',
      youtubeUrl: url,
      videoId,
    });
  } catch (error) {
    console.error('❌ 분석 요청 처리 오류:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================================
// ✅ 2️⃣ 분석 상태 조회 (폴링용 API)
// ===================================================
router.get('/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'videoId가 필요합니다.' });
    }

    // ✅ Supabase에서 바로 확인 (파일 확인보다 정확)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('video_id', videoId)
      .maybeSingle();

    if (error) {
      console.error('❌ Supabase 상태 조회 오류:', error.message);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Supabase 상태 조회 중 오류 발생',
      });
    }

    if (data) {
      console.log(`✅ [STATUS] 분석 완료된 영상: ${videoId}`);
      return res.json({
        success: true,
        status: 'completed',
        message: 'AI 분석이 완료되었습니다.',
        videoId,
        recipe: data,
      });
    }

    // ✅ 데이터가 없으면 아직 진행 중
    console.log(`⏳ [STATUS] 분석 중: ${videoId}`);
    return res.json({
      success: true,
      status: 'processing',
      message: 'AI 분석이 아직 진행 중입니다.',
      videoId,
    });
  } catch (error) {
    console.error('❌ 상태 확인 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================================
// ✅ 3️⃣ 서버 상태 확인용 (기존 유지)
// ===================================================
router.get('/status', (req, res) => {
  try {
    res.json({
      success: true,
      status: 'active',
      version: '1.0.0',
      services: {
        newAIPipeline: true,
        whisper: true,
        ocr: true,
        gemini: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
