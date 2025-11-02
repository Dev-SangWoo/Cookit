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

# Whisper base 모델 불러오기 (테스트용)
model = whisper.load_model("base")

#MP3 파일에 대해 음성 인식 수행
result = model.transcribe(audio_path, language="ko")

# whisper_sub 폴더를 Server/uploads/temp에 생성
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, "../uploads/temp/whisper_sub")
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 출력 파일명: audio.txt (일관성을 위해)
output_path = os.path.join(output_dir, "audio.txt")

with open(output_path, "w", encoding="utf-8") as f:
    f.write(result["text"].strip())

#실행 시간 측정 종료
end_time = time.time()
elapsed_time = end_time - start_time

# 분:초:밀리초 형식으로 변환
minutes = int(elapsed_time // 60)
seconds = int(elapsed_time % 60)
milliseconds = int((elapsed_time - int(elapsed_time)) * 1000)

# 결과 출력
print(f"\n✅ Whisper 결과 저장 완료 → {output_path}")
print(f"⏱ 실행 시간: {minutes:02d}분 {seconds:02d}초 {milliseconds:03d}밀리초")