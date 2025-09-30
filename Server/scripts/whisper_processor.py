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

#MP3 파일에 대해 음성 인식 수행 (타임스탬프 포함)
result = model.transcribe(audio_path, language="ko", verbose=False)

# whisper_sub 폴더를 Server/uploads/temp에 생성
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, "../uploads/temp/whisper_sub")
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 출력 파일명: audio.txt (텍스트만), audio_timestamps.txt (타임스탬프 포함)
output_path = os.path.join(output_dir, "audio.txt")
timestamps_path = os.path.join(output_dir, "audio_timestamps.txt")

# 1. 텍스트만 저장 (기존 호환성)
with open(output_path, "w", encoding="utf-8") as f:
    f.write(result["text"].strip())

# 2. 타임스탬프 포함 세그먼트 저장
with open(timestamps_path, "w", encoding="utf-8") as f:
    for segment in result["segments"]:
        start_time = segment["start"]
        end_time = segment["end"]
        text = segment["text"].strip()
        
        # 시:분:초 형식으로 변환
        start_formatted = f"{int(start_time // 3600):02d}:{int((start_time % 3600) // 60):02d}:{int(start_time % 60):02d}"
        end_formatted = f"{int(end_time // 3600):02d}:{int((end_time % 3600) // 60):02d}:{int(end_time % 60):02d}"
        
        f.write(f"[{start_formatted} --> {end_formatted}]\n{text}\n\n")

#실행 시간 측정 종료
end_time = time.time()
elapsed_time = end_time - start_time

# 분:초:밀리초 형식으로 변환
minutes = int(elapsed_time // 60)
seconds = int(elapsed_time % 60)
milliseconds = int((elapsed_time - int(elapsed_time)) * 1000)

# 결과 출력
print(f"\n✅ Whisper 텍스트 저장 완료 → {output_path}")
print(f"✅ Whisper 타임스탬프 저장 완료 → {timestamps_path}")
print(f"⏱ 실행 시간: {minutes:02d}분 {seconds:02d}초 {milliseconds:03d}밀리초")