# Rhino Context 파일 설정 가이드

## 문제 상황
Context 파일(.rhn)에서 반환되는 intent 이름이 코드와 일치하지 않는 경우가 발생합니다.

## 해결 방법

### 방법 1: 코드 수정 (권장) ✅
현재 코드는 한국어와 영어 intent 이름을 모두 지원하도록 수정되었습니다.

**지원되는 intent 이름:**
- 다음 단계: `'next'` 또는 `'다음'`
- 이전 단계: `'previous'` 또는 `'이전'`
- 타이머: `'timer'` 또는 `'타이머'`
- 중지: `'stop'`, `'중지'`, 또는 `'정지'`

### 방법 2: Context 파일 재생성 (선택사항)
Picovoice Console에서 Context를 다시 생성할 때 영어 intent 이름을 사용하면 됩니다.

## Context 파일 설정 예시

### Picovoice Console에서 설정할 때:

**Intent 이름 (영어 권장):**
```
next
previous
timer
stop
```

**Expressions (한국어 발화):**
```
next:
  - "다음"
  - "다음 단계"
  - "넥스트"
  - "다음으로"

previous:
  - "이전"
  - "이전 단계"
  - "뒤로"
  - "이전으로"

timer:
  - "타이머 $minutes:number 분"
  - "$minutes:number 분 타이머"
  - "타이머 시작 $minutes:number 분"

stop:
  - "중지"
  - "정지"
  - "스톱"
  - "멈춰"
```

**Slots:**
```
number:
  - "일"
  - "이"
  - "삼"
  - "사"
  - "오"
  - "육"
  - "칠"
  - "팔"
  - "구"
  - "십"
```

## 중요 사항

1. **Intent 이름은 영어로 권장**: 코드에서 일관되게 사용하기 위해
2. **Expressions는 한국어로**: 사용자가 말하는 내용은 한국어
3. **Slots는 한국어 숫자 지원**: "삼 분" 같은 표현을 인식하기 위해

## 현재 코드 동작

코드는 다음 intent 이름을 모두 지원합니다:
- `'next'` 또는 `'다음'` → 다음 단계
- `'previous'` 또는 `'이전'` → 이전 단계
- `'timer'` 또는 `'타이머'` → 타이머 시작
- `'stop'`, `'중지'`, `'정지'` → 타이머 중지

따라서 Context 파일이 어떤 intent 이름을 사용하든 정상 작동합니다.

