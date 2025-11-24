# Creta Easy 사용 가이드

## 빠른 참조

```bash
Creta_easy.exe --file "파일경로" --devices 디바이스ID --autosend        # 파일 자동 전송
Creta_easy.exe --text "텍스트" --devices 디바이스ID --autosend          # 텍스트 자동 전송
Creta_easy.exe --text "텍스트" --bg "배경이미지" --devices  디바이스ID --autosend  # 텍스트+배경 자동 전송
```

**주요 옵션**: `--file` (파일), `--text` (텍스트), `--bg` (배경), `--devices` (디바이스), `--autosend` (자동전송)  
**옵션 순서**: 무관 | **우선순위**: `--file` > `--text` + `--bg` | **제약**: `--bg`는 `--text`와 함께 사용

---

## 개요

Creta Easy는 파일이나 텍스트를 Creta 디바이스로 손쉽게 전송할 수 있는 데스크톱 애플리케이션입니다. GUI 모드와 커맨드 라인 모드를 모두 지원합니다.

---

## 실행 방법

### 1. GUI 모드 (기본)

```bash
Creta_easy.exe
```

프로그램을 실행하면 그래픽 사용자 인터페이스가 표시되며, 드래그 앤 드롭 또는 파일 선택을 통해 콘텐츠를 전송할 수 있습니다.

### 2. 커맨드 라인 모드

커맨드 라인 옵션을 사용하여 프로그램을 자동화하거나 스크립트로 실행할 수 있습니다.

---

## 커맨드 라인 옵션

### 기본 문법

```bash
Creta_easy.exe [옵션] [인자]
```

**중요**: 옵션의 순서는 상관없습니다. 모든 조합이 정상적으로 동작합니다.

---

## 옵션 상세 설명

### `--file <파일경로>`

파일이나 폴더를 지정하여 전송합니다.

**사용 예시:**
```bash
# 단일 파일 전송
Creta_easy.exe --file "C:\Users\username\Pictures\image.jpg"

# 폴더 전송 (폴더 내 모든 지원 파일)
Creta_easy.exe --file "C:\Users\username\Videos\presentation"
```

**지원 파일 형식:**
- **이미지**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`
- **동영상**: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`, `.wmv`
- **문서**: `.pdf`, `.ppt`, `.pptx`

**참고:**
- `--file` 옵션이 있으면 `--text`와 `--bg` 옵션은 무시됩니다.
- 상대 경로와 절대 경로 모두 지원합니다.

---

### `--text <텍스트내용>`

텍스트 콘텐츠를 전송합니다.

**사용 예시:**
```bash
# 단순 텍스트
Creta_easy.exe --text "안녕하세요"

# 공백이 포함된 텍스트 (따옴표 필수)
Creta_easy.exe --text "여러 줄의 텍스트를 입력할 수 있습니다"

# 특수문자 포함
Creta_easy.exe --text "긴급 공지: 오늘 오후 3시 회의!"
```

**참고:**
- 텍스트는 마지막으로 설정된 텍스트 속성(폰트, 색상, 크기, 애니메이션 등)을 사용합니다.
- 여러 줄 텍스트를 입력할 수 있습니다.
- CretaBook 이름은 텍스트의 첫 줄에서 자동으로 생성됩니다.

---

### `--bg <배경이미지경로>`

텍스트 콘텐츠의 배경 이미지 또는 동영상을 지정합니다.

**사용 예시:**
```bash
# 텍스트 + 배경 이미지
Creta_easy.exe --text "공지사항" --bg "C:\Images\background.jpg"

# 텍스트 + 배경 동영상
Creta_easy.exe --text "환영합니다" --bg "C:\Videos\intro.mp4"
```

**중요 제약사항:**
- `--bg` 옵션은 **반드시 `--text` 옵션과 함께 사용**해야 합니다.
- `--text` 없이 `--bg`만 사용하면 무시됩니다.
- `--file` 옵션이 있으면 `--bg` 옵션은 무시됩니다.

**지원 형식:**
- 이미지: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- 동영상: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`

---

### `--devices <디바이스ID> [<디바이스ID2> ...]`

콘텐츠를 전송할 대상 디바이스를 지정합니다.

**사용 예시:**
```bash
# 단일 디바이스
Creta_easy.exe --file "image.jpg" --devices SQI-00001

# 여러 디바이스
Creta_easy.exe --file "video.mp4" --devices SQI-00001 SQI-00002 SQI-00003

# 텍스트 전송
Creta_easy.exe --text "공지" --devices DEVICE-A DEVICE-B
```

**참고:**
- 디바이스 ID는 공백으로 구분하여 여러 개를 지정할 수 있습니다.
- 다음 `--` 옵션이 나오기 전까지 모든 인자를 디바이스 ID로 인식합니다.
- 지정된 디바이스가 존재하지 않으면 경고 메시지가 표시됩니다.
- 로그인된 계정에 연결된 디바이스만 사용 가능합니다.

---

### `--autosend`

로그인 후 자동으로 콘텐츠를 전송하고 프로그램을 종료합니다.

**사용 예시:**
```bash
# 파일 자동 전송
Creta_easy.exe --file "presentation.pdf" --devices SQI-00001 --autosend

# 텍스트 자동 전송
Creta_easy.exe --text "긴급 공지" --devices SQI-00001 --autosend

# 옵션 순서 무관
Creta_easy.exe --autosend --devices SQI-00001 --text "Hello World"
```

**동작 방식:**
1. 프로그램이 시작되고 자동 로그인을 시도합니다.
2. 로그인 성공 후 지정된 디바이스로 콘텐츠를 자동 전송합니다.
3. 전송 성공 다이얼로그가 표시됩니다.
4. **2초 후 프로그램이 자동으로 종료됩니다.**

**참고:**
- 이전에 "자동 로그인" 설정을 활성화해야 합니다.
- `--devices` 옵션 없이 사용하면 자동 전송이 실행되지 않습니다.
- 같은 이름의 CretaBook이 있으면 자동으로 번호를 추가하여 새 북을 생성합니다.
- 수동으로 "확인 후 종료" 버튼을 클릭하여 즉시 종료할 수도 있습니다.

---

### 레거시 모드 (파일 경로만)

`--` 접두사 없이 첫 번째 인자로 파일 경로를 지정할 수 있습니다.

**사용 예시:**
```bash
Creta_easy.exe "C:\Users\username\Pictures\image.jpg"
```

**참고:**
- 이 모드에서는 다른 옵션들이 모두 무시됩니다.
- 하위 호환성을 위해 제공되는 기능입니다.
- 새로운 스크립트에서는 `--file` 옵션 사용을 권장합니다.

---

## 옵션 조합 규칙

### 우선순위

1. **`--file` 옵션이 최우선**: `--file`이 지정되면 `--text`와 `--bg`는 무시됩니다.
2. **`--bg`는 `--text`에 종속**: `--bg`는 `--text`가 있을 때만 유효합니다.

### 유효한 조합

✅ **파일만 전송**
```bash
Creta_easy.exe --file "video.mp4"
```

✅ **파일 + 디바이스 지정**
```bash
Creta_easy.exe --file "image.jpg" --devices SQI-00001
```

✅ **파일 + 디바이스 + 자동 전송**
```bash
Creta_easy.exe --file "document.pdf" --devices SQI-00001 --autosend
```

✅ **텍스트만 전송**
```bash
Creta_easy.exe --text "공지사항"
```

✅ **텍스트 + 배경**
```bash
Creta_easy.exe --text "환영합니다" --bg "background.jpg"
```

✅ **텍스트 + 배경 + 디바이스 + 자동 전송**
```bash
Creta_easy.exe --text "긴급 공지" --bg "alert.jpg" --devices SQI-00001 SQI-00002 --autosend
```

✅ **옵션 순서 바꾸기 (모두 동일하게 동작)**
```bash
Creta_easy.exe --autosend --devices SQI-00001 --text "Hello"
Creta_easy.exe --text "Hello" --autosend --devices SQI-00001
Creta_easy.exe --devices SQI-00001 --autosend --text "Hello"
```

### 무효한 조합

❌ **`--file`과 `--text` 동시 사용** (--file이 우선 적용됨)
```bash
# --text와 --bg는 무시됩니다
Creta_easy.exe --file "video.mp4" --text "Hello" --bg "bg.jpg"
```

❌ **`--bg`만 단독 사용** (무시됨)
```bash
# --text가 없으므로 --bg는 무시됩니다
Creta_easy.exe --bg "background.jpg"
```

❌ **`--autosend`를 `--devices` 없이 사용** (전송 실패)
```bash
# 디바이스가 지정되지 않아 전송되지 않습니다
Creta_easy.exe --file "video.mp4" --autosend
```

---

## 실제 사용 시나리오

### 시나리오 1: 수동 파일 전송

사용자가 GUI를 통해 파일을 확인하고 전송합니다.

```bash
Creta_easy.exe --file "C:\Presentations\quarterly_report.pdf"
```

**결과**: 프로그램이 열리고 파일이 자동으로 로드됩니다. 사용자가 디바이스를 선택하고 "전송" 버튼을 클릭합니다.

---

### 시나리오 2: 스크립트로 자동 전송

배치 파일이나 스케줄러를 통해 정기적으로 콘텐츠를 전송합니다.

```bash
@echo off
echo Starting Creta Easy auto-send...
"C:\SQISOFT\Creta\Creta_easy.exe" --file "C:\Shared\daily_bulletin.jpg" --devices SQI-00001 SQI-00002 --autosend
echo Content sent successfully!
```

**결과**: 프로그램이 실행되고, 로그인 후 자동으로 파일을 전송한 뒤 2초 후 종료됩니다.

---

### 시나리오 3: 동적 텍스트 생성 및 전송

스크립트에서 동적으로 텍스트를 생성하여 전송합니다.

```bash
@echo off
set CURRENT_TIME=%TIME:~0,5%
set MESSAGE=현재 시각: %CURRENT_TIME% - 회의 시작합니다

"C:\SQISOFT\Creta\Creta_easy.exe" --text "%MESSAGE%" --devices OFFICE-MAIN --autosend
```

**결과**: 현재 시각이 포함된 메시지가 디바이스로 전송됩니다.

---

### 시나리오 4: 여러 디바이스에 대량 전송

회의실, 로비, 엘리베이터 등 여러 디스플레이에 동시 전송합니다.

```bash
Creta_easy.exe ^
  --file "C:\Announcements\emergency_notice.mp4" ^
  --devices LOBBY-01 MEETING-A MEETING-B ELEVATOR-1F ELEVATOR-2F ^
  --autosend
```

**결과**: 지정된 5개의 디바이스에 동시에 동영상이 전송됩니다.

---

### 시나리오 5: 텍스트 + 배경 전송

시각적으로 강조된 공지사항을 전송합니다.

```bash
Creta_easy.exe ^
  --text "📢 긴급 공지: 오늘 오후 3시 전체 회의가 있습니다" ^
  --bg "C:\Templates\urgent_background.jpg" ^
  --devices ALL-DISPLAYS ^
  --autosend
```

**결과**: 배경 이미지 위에 텍스트가 오버레이되어 표시됩니다.

---

## 환경 변수 (고급)

### `serverType`

서버 타입을 지정합니다. (기본값: `firebase`)

```bash
# Firebase 서버 사용
Creta_easy.exe -DserverType=firebase

# Supabase 서버 사용
Creta_easy.exe -DserverType=supabase
```

**사용 가능한 값**: `firebase`, `supabase`

---

### `logLevel`

로그 레벨을 지정합니다. (기본값: `warning`)

```bash
# 상세한 디버그 로그 출력
Creta_easy.exe -DlogLevel=info

# 모든 로그 출력
Creta_easy.exe -DlogLevel=all
```

**사용 가능한 값**: `all`, `fine`, `finer`, `finest`, `info`, `warning`, `severe`, `shout`, `off`

---

## 오류 메시지 및 해결 방법

### "No devices selected for auto-send"

**원인**: `--autosend` 옵션을 사용했지만 `--devices` 옵션이 없거나 디바이스를 찾을 수 없습니다.

**해결**:
```bash
# 올바른 사용법
Creta_easy.exe --file "video.mp4" --devices SQI-00001 --autosend
```

---

### "--bg option requires --text option"

**원인**: `--bg` 옵션을 `--text` 없이 단독으로 사용했습니다.

**해결**:
```bash
# 올바른 사용법
Creta_easy.exe --text "공지" --bg "background.jpg"
```

---

### "--file option present, ignoring --text and --bg"

**원인**: `--file`, `--text`, `--bg`를 동시에 사용했습니다. `--file`이 우선 적용됩니다.

**해결**: 의도에 맞게 옵션을 선택하세요.
```bash
# 파일 전송만
Creta_easy.exe --file "video.mp4"

# 또는 텍스트 + 배경
Creta_easy.exe --text "공지" --bg "background.jpg"
```

---

### "No matching devices found"

**원인**: 지정된 디바이스 ID가 계정에 등록되지 않았거나 잘못되었습니다.

**해결**:
1. GUI에서 디바이스 목록을 확인하세요.
2. 올바른 디바이스 ID(Host ID)를 사용하세요.
3. 디바이스가 온라인 상태인지 확인하세요.

---

## 추가 정보

### 자동 로그인 설정

`--autosend` 옵션을 사용하려면 먼저 자동 로그인을 설정해야 합니다.

1. Creta Easy를 실행합니다.
2. 로그인 화면에서 "자동 로그인" 체크박스를 활성화합니다.
3. ID와 비밀번호를 입력하고 로그인합니다.
4. 이후 프로그램 실행 시 자동으로 로그인됩니다.

---

### 텍스트 속성 설정

텍스트 전송 시 사용되는 폰트, 색상, 애니메이션 등은 다음과 같이 설정됩니다:

1. GUI에서 "텍스트 입력" 모드로 전환합니다.
2. 원하는 텍스트 속성(폰트, 크기, 색상, 애니메이션 등)을 설정합니다.
3. 설정이 자동으로 저장됩니다.
4. 이후 `--text` 옵션 사용 시 저장된 속성이 적용됩니다.

**저장되는 속성**:
- 폰트 (Pretendard, Noto Sans 등)
- 폰트 크기
- 폰트 색상
- 텍스트 스타일 (굵게, 기울임, 밑줄)
- 배경 색상
- 그림자 설정 (색상, 블러, 강도)
- 애니메이션 타입 (옆으로 흐르기, 글자 반짝이기)
- 애니메이션 속도

---

### 컨텍스트 메뉴 등록

Windows 탐색기에서 파일을 마우스 오른쪽 버튼으로 클릭하여 바로 Creta Easy로 전송할 수 있습니다.

**등록 방법**:
1. Creta Easy 실행
2. 설정 > "컨텍스트 메뉴 등록" 클릭
3. Windows 탐색기에서 파일 우클릭 > "Send with Creta Easy" 메뉴 사용

---

### 서버 URL 설정

다른 Creta 서버로 연결하려면:

1. Creta Easy 실행
2. 설정 > "서버 주소 설정" 클릭
3. 홈 URL 입력 (예: `https://lets-creta.com`)
4. 스튜디오 홈 URL은 자동으로 생성됩니다
5. "저장" 클릭 → 프로그램이 자동으로 재시작됩니다

---

## 문의 및 지원

- **웹사이트**: https://lets-creta.com
- **문서**: Creta 스튜디오 사용자 가이드
- **버전 정보**: 앱바 > 설정 > "시스템 정보"에서 확인

---

## 버전 히스토리

### 최신 버전
- ✅ `--text` 옵션 지원
- ✅ `--bg` 배경 이미지/동영상 지원
- ✅ `--autosend` 자동 전송 및 종료
- ✅ 여러 디바이스 동시 전송
- ✅ 텍스트 애니메이션 (옆으로 흐르기, 글자 반짝이기)
- ✅ 서버 URL 설정 기능
- ✅ 다국어 지원 (한국어, 영어, 일본어)

---

## 라이선스

Copyright © SQISOFT. All rights reserved.

