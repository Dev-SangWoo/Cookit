# file: test_whisper.py
import whisper
import sys
import time
import os

# 실행 시간 측정 시작
start_time = time.time()

# 명령줄 인자로부터 오디오 경로 받기
if len(sys.argv) < 2:
    print("❌ audio_path 인자가 필요합니다.")
    sys.exit(1)

audio_path = sys.argv[1]

# Whisper large-v3 모델 불러오기
model = whisper.load_model("large-v3")

# MP3 파일에 대해 음성 인식 수행
result = model.transcribe(audio_path, language="ko")

# whisper_sub 폴더 없으면 생성
output_dir = "whisper_sub"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 출력 파일명: whisper_sub/원본파일명.txt
filename = os.path.splitext(os.path.basename(audio_path))[0]
output_path = os.path.join(output_dir, f"{filename}.txt")

with open(output_path, "w", encoding="utf-8") as f:
    f.write(result["text"].strip())

# 실행 시간 측정 종료
end_time = time.time()
elapsed_time = end_time - start_time

# 분:초:밀리초 형식으로 변환
minutes = int(elapsed_time // 60)
seconds = int(elapsed_time % 60)
milliseconds = int((elapsed_time - int(elapsed_time)) * 1000)

# ✅ 인코딩 깨짐 방지용: 이모지, 화살표 제거
print(f"\nWhisper 결과 저장 완료 -> {output_path}")
print(f"실행 시간: {minutes:02d}분 {seconds:02d}초 {milliseconds:03d}밀리초")
