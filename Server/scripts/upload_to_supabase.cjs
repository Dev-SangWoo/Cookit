const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ✅ Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || "https://ujqdizvpkrjunyrcpvtf.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ✅ ffmpeg 경로 명시
const ffmpegPath = "C:\\ffmpeg\\bin\\ffmpeg.exe";
process.env.PATH = process.env.PATH + `;${path.dirname(ffmpegPath)}`;

// ✅ CLI 인자
const videoId = process.argv[2];
if (!videoId) {
  console.error("❌ 사용법: node upload_to_supabase.js [videoId]");
  process.exit(1);
}

// ✅ 경로 설정 (scripts 폴더 기준, 상위 디렉토리로 이동)
const serverRoot = path.join(__dirname, "..");
const resultPath = path.join(serverRoot, "result_out", `${videoId}_summary.txt`);
const thumbnailDir = path.join(serverRoot, "thumbnails");
const thumbnailPath = path.join(thumbnailDir, `${videoId}.jpg`);
const fallbackImagePath = path.join(serverRoot, "assets", "default_thumbnail.png"); // 기본 썸네일 이미지

// ✅ fetch import (Node 18+)
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

(async () => {
  try {
    if (!fs.existsSync(resultPath)) throw new Error(`❌ 결과 파일이 없습니다: ${resultPath}`);
    console.log(`📂 결과 파일 로드 중: ${resultPath}`);

    // 1️⃣ Gemini 결과 파일 로드
    let jsonText = fs.readFileSync(resultPath, "utf-8")
      .replace(/```json\s*/g, "")
      .replace(/```/g, "")
      .trim();

    let recipeData;
    try {
      recipeData = JSON.parse(jsonText);
    } catch {
      console.warn("⚠️ JSON 파싱 실패 — 자동 복구 시도 중...");
      jsonText = jsonText
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"')
        .replace(/\r?\n\s*/g, " ")
        .replace(/,\s*([}\]])/g, "$1");
      recipeData = JSON.parse(jsonText);
      console.log("✅ JSON 자동 복구 성공!");
    }

    // ✅ (이전 중복 검사 로직 완전히 제거됨)

    // 2️⃣ 썸네일 다운로드 (yt-dlp 의존 최소화)
    const videoUrl = recipeData.source_url || recipeData.video_url;
    if (!videoUrl) throw new Error("❌ recipeData에서 영상 URL을 찾을 수 없습니다.");

    if (!fs.existsSync(thumbnailDir)) fs.mkdirSync(thumbnailDir, { recursive: true });

    console.log(`🖼 썸네일 다운로드 중...`);
    try {
      // ✅ 유튜브 기본 썸네일 직접 요청
      const directUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      const res = await fetch(directUrl);
      const imageUrl = res.ok ? directUrl : fallbackUrl;

      const buffer = Buffer.from(await (await fetch(imageUrl)).arrayBuffer());
      fs.writeFileSync(thumbnailPath, buffer);
      console.log(`✅ 유튜브 기본 썸네일 저장 완료: ${thumbnailPath}`);
    } catch (err) {
      console.warn("⚠️ 직접 썸네일 다운로드 실패 — yt-dlp로 재시도합니다.");
      try {
        execSync(
          `yt-dlp --ffmpeg-location "${ffmpegPath}" --skip-download --write-thumbnail -o "${path.join(thumbnailDir, `${videoId}.%(ext)s`)}" "${videoUrl}"`,
          { stdio: "inherit" }
        );

        const webpPath = path.join(thumbnailDir, `${videoId}.webp`);
        if (fs.existsSync(webpPath)) {
          execSync(`"${ffmpegPath}" -y -i "${webpPath}" "${thumbnailPath}"`, { stdio: "inherit" });
          fs.unlinkSync(webpPath);
          console.log(`✅ 썸네일 변환 완료: ${thumbnailPath}`);
        } else if (fs.existsSync(fallbackImagePath)) {
          fs.copyFileSync(fallbackImagePath, thumbnailPath);
          console.log(`✅ 기본 썸네일 사용: ${thumbnailPath}`);
        }
      } catch {
        console.warn("⚠️ yt-dlp 재시도 실패 — 기본 썸네일로 대체합니다.");
        if (fs.existsSync(fallbackImagePath)) {
          fs.copyFileSync(fallbackImagePath, thumbnailPath);
          console.log(`✅ 기본 썸네일 사용: ${thumbnailPath}`);
        }
      }
    }

    // 3️⃣ Supabase Storage 업로드
    let imageUrls = [];
    if (fs.existsSync(thumbnailPath)) {
      console.log("📤 Supabase Storage에 썸네일 업로드 중...");
      const fileBuffer = fs.readFileSync(thumbnailPath);

      const { error: uploadError } = await supabase.storage
        .from("recipe-thumbnails")
        .upload(`${videoId}.jpg`, fileBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.warn("⚠️ 썸네일 업로드 실패:", uploadError.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("recipe-thumbnails")
          .getPublicUrl(`${videoId}.jpg`);

        if (publicUrlData?.publicUrl) {
          imageUrls.push(publicUrlData.publicUrl);
          console.log(`✅ 썸네일 URL: ${publicUrlData.publicUrl}`);
        }
      }
    }

    // 4️⃣ Supabase recipes 업로드 (중복 시 자동 update)
    recipeData.image_urls = imageUrls.length > 0 ? imageUrls : null;
    recipeData.video_id = videoId;

    // 🧩 [추가] category_name → category_id 자동 매핑
    if (recipeData.category_name) {
      console.log(`🔍 카테고리 이름(${recipeData.category_name})에 해당하는 ID 조회 중...`);
      const { data: catData, error: catError } = await supabase
        .from("recipe_categories")
        .select("id, name")
        .ilike("name", `%${recipeData.category_name}%`)
        .limit(1)
        .maybeSingle();

      if (catError) {
        console.warn(`⚠️ category_id 조회 오류: ${catError.message}`);
      } else if (catData) {
        recipeData.category_id = catData.id;
        console.log(`✅ category_id 매핑 완료: ${catData.id} (${catData.name})`);
      } else {
        console.warn(`⚠️ '${recipeData.category_name}' 매칭되는 카테고리가 없습니다. 기본값으로 진행합니다.`);
        // 기본 카테고리 설정 (예: '기타' 카테고리 ID 사용)
        const { data: defaultCat } = await supabase
          .from("recipe_categories")
          .select("id")
          .eq("name", "기타")
          .limit(1)
          .maybeSingle();
        
        if (defaultCat) {
          recipeData.category_id = defaultCat.id;
          console.log(`✅ 기본 카테고리 '기타'로 매핑됨: ${defaultCat.id}`);
        }
      }
      
      // category_name은 DB 컬럼이 아니므로 제거
      delete recipeData.category_name;
    }

    console.log("🚀 Supabase 'recipes' 테이블에 업로드 중...");
    const { data, error } = await supabase
      .from("recipes")
      .upsert([recipeData], { onConflict: "video_id" }) // ✅ 중복 시 update
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ 업로드 완료!`);
    console.log(`🆔 recipe_id: ${data.id}`);
    console.log(`📘 title: ${data.title}`);
    console.log(`🖼 image_urls: ${JSON.stringify(data.image_urls)}`);

    // 4.5️⃣ recipe_stats 자동 생성/업데이트
    console.log("📊 recipe_stats 확인/생성 중...");
    const { data: existingStats, error: statsCheckError } = await supabase
      .from("recipe_stats")
      .select("*")
      .eq("recipe_id", data.id)
      .maybeSingle();

    if (!existingStats && statsCheckError?.code !== 'PGRST116') {
      // PGRST116은 "no rows returned" 오류 (정상)
      console.error("⚠️ recipe_stats 조회 오류:", statsCheckError);
    }

    if (!existingStats) {
      // recipe_stats가 없으면 새로 생성
      console.log("📊 recipe_stats 초기 생성 중...");
      const { error: statsInsertError } = await supabase
        .from("recipe_stats")
        .insert({
          recipe_id: data.id,
          view_count: 0,
          favorite_count: 0,
          cook_count: 0,
          average_rating: 0.0,
        });

      if (statsInsertError) {
        console.error("❌ recipe_stats 생성 실패:", statsInsertError.message);
      } else {
        console.log("✅ recipe_stats 초기 생성 완료!");
      }
    } else {
      console.log("✅ recipe_stats가 이미 존재합니다.");
    }

    // 5️⃣ 로컬 파일 정리
    if (fs.existsSync(resultPath)) {
      fs.unlinkSync(resultPath);
      console.log(`🧹 result_out 파일 삭제 완료: ${resultPath}`);
    }
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log(`🧹 썸네일 파일 삭제 완료: ${thumbnailPath}`);
    }

    console.log("✅ 전체 업로드 및 정리 완료!");
  } catch (error) {
    console.error(`❌ Supabase 업로드 중 오류 발생: ${error.message}`);
  }
})();
