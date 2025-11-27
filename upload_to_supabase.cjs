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

// ✅ 경로 설정
const serverRoot = path.join(__dirname, "..");
const resultPath = path.join(serverRoot, "result_out", `${videoId}_summary.txt`);
const thumbnailDir = path.join(serverRoot, "thumbnails");
const thumbnailPath = path.join(thumbnailDir, `${videoId}.jpg`);
const fallbackImagePath = path.join(serverRoot, "assets", "default_thumbnail.png");
const stepThumbDir = path.join(serverRoot, "step_thumbnails", videoId); // 👈 단계별 썸네일 디렉토리

// 새 fetch 로딩
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

    // 2️⃣ 썸네일 다운로드
    const videoUrl = recipeData.source_url || recipeData.video_url;
    if (!videoUrl) throw new Error("❌ recipeData에서 영상 URL을 찾을 수 없습니다.");

    if (!fs.existsSync(thumbnailDir)) fs.mkdirSync(thumbnailDir, { recursive: true });

    console.log(`🖼 썸네일 다운로드 중...`);
    try {
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

    // 3️⃣ Supabase Storage 업로드 (기본 썸네일)
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

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("recipe-thumbnails")
          .getPublicUrl(`${videoId}.jpg`);

        if (publicUrlData?.publicUrl) {
          imageUrls.push(publicUrlData.publicUrl);
          console.log(`✅ 썸네일 URL: ${publicUrlData.publicUrl}`);
        }
      }
    }

    // 3.5️⃣ 단계별 타임라인 이미지 업로드
    let stepImageUrls = [];
    let stepImageMap = {}; // step index → 이미지 URL

    if (fs.existsSync(stepThumbDir)) {
      const stepFiles = fs.readdirSync(stepThumbDir).filter(f => f.toLowerCase().endsWith(".jpg"));
      console.log(`🖼 단계별 이미지 업로드 (${stepFiles.length}개)...`);

      for (const file of stepFiles) {
        const localPath = path.join(stepThumbDir, file);
        const storagePath = `${videoId}/${file}`;

        const buffer = fs.readFileSync(localPath);

        const { error: upErr } = await supabase.storage
          .from("recipe-step-thumbnails")
          .upload(storagePath, buffer, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (upErr) {
          console.warn(`⚠️ ${file} 업로드 실패:`, upErr.message);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("recipe-step-thumbnails")
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          stepImageUrls.push(publicUrlData.publicUrl);

          // step_1.jpg → 1
          const match = file.match(/step_(\d+)\.jpg/);
          if (match) {
            const idx = parseInt(match[1], 10) - 1;
            stepImageMap[idx] = publicUrlData.publicUrl;
          }

          console.log(`✅ ${file} 업로드 완료 → ${publicUrlData.publicUrl}`);
        }
      }

      console.log(`📦 단계별 이미지 업로드 완료 (${stepImageUrls.length}개)`);
    } else {
      console.warn("⚠️ step_thumbnails 폴더가 존재하지 않음:", stepThumbDir);
    }

    // 🔥 instructions에 단계별 썸네일 삽입
    if (Array.isArray(recipeData.instructions)) {
      console.log("🧩 instructions에 thumbnail_url 매핑 중...");

      recipeData.instructions = recipeData.instructions.map((stepObj, index) => {
        const thumb = stepImageMap[index] || null;
        return {
          ...stepObj,
          thumbnail_url: thumb,
        };
      });

      console.log("✅ instructions에 썸네일 URL 삽입 완료");
    }

    // 4️⃣ Supabase recipes 업로드
    recipeData.image_urls = imageUrls.length > 0 ? imageUrls : null;
    recipeData.step_images = stepImageUrls.length > 0 ? stepImageUrls : null;
    recipeData.video_id = videoId;

    // 🧩 category_name → category_id 자동 매핑
    if (recipeData.category_name) {
      const { data: cat } = await supabase
        .from("recipe_categories")
        .select("id, name")
        .ilike("name", `%${recipeData.category_name}%`)
        .limit(1)
        .maybeSingle();

      if (cat) {
        recipeData.category_id = cat.id;
      }
      delete recipeData.category_name;
    }

    console.log("🚀 Supabase 'recipes' 테이블에 업로드 중...");
    const { data, error } = await supabase
      .from("recipes")
      .upsert([recipeData], { onConflict: "video_id" })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ 업로드 완료!`);
    console.log(`🆔 recipe_id: ${data.id}`);
    console.log(`🖼 step_images: ${JSON.stringify(recipeData.step_images)}`);

    // recipe_stats 처리
    const { data: stats } = await supabase
      .from("recipe_stats")
      .select("*")
      .eq("recipe_id", data.id)
      .maybeSingle();

    if (!stats) {
      const { error: statsInsertError } = await supabase
        .from("recipe_stats")
        .insert({
          recipe_id: data.id,
          view_count: 0,
          favorite_count: 0,
          cook_count: 0,
          average_rating: 0.0,
        });
      if (!statsInsertError) console.log("✅ recipe_stats 초기 생성 완료!");
    }

    // 5️⃣ 파일 정리
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
