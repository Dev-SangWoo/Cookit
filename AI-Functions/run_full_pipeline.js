const { execSync } = require("child_process");
const { performance } = require("perf_hooks");
const path = require("path");

// 유튜브 링크 파라미터 확인
const videoUrl = process.argv[2];
if (!videoUrl) {
  console.error("❌ 사용법: node run_full_pipeline.js [유튜브 링크]");
  process.exit(1);
}

// 시작 시간 기록
const startTime = performance.now();

try {
  console.log(`🔗 입력된 유튜브 링크: ${videoUrl}`);

  // 1. app.js 실행
  console.log("\n▶️ [1/4] app.js 실행 중...");
  execSync(`node app.js "${videoUrl}"`, { stdio: "inherit" });

  // 2. video ID 추출
  const urlObj = new URL(videoUrl);
  const videoId = urlObj.searchParams.get("v");
  if (!videoId) {
    throw new Error("유효한 video ID를 추출하지 못했습니다.");
  }

  // 3. generate_combined_text.js 실행
  console.log("\n▶️ [2/4] 텍스트 통합 중...");
  execSync(`node generate_combined_text.js ${videoId}`, { stdio: "inherit" });

  // 4. generate_prompt.js 실행
  console.log("\n▶️ [3/4] 프롬프트 생성 중...");
  execSync(`node generate_prompt.js ${videoId} "${videoUrl}"`, { stdio: "inherit" });

  // 5. send_to_gemini.js 실행
  console.log("\n▶️ [4/4] Gemini API 요청 중...");
  execSync(`node send_to_gemini.js ${videoId}`, { stdio: "inherit" });

  // 종료 시간 기록
  const endTime = performance.now();
  const duration = endTime - startTime;
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);

  console.log(`\n✅ 전체 실행 완료 (소요 시간: ${minutes}분 ${seconds}초)`);

} catch (err) {
  console.error("\n❌ 오류 발생:", err.message);
}
