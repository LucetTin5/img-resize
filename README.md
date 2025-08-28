# Image Resizer

Sharp와 Electron을 사용한 이미지 일괄 리사이즈 Windows 데스크톱 앱입니다.

## 주요 기능

- 다중 이미지 파일 선택 및 처리
- 크기 조정 방식 선택:
  - 픽셀 단위 (가로/세로 지정)
  - 백분율 (%)
- 이미지 포맷 변환 지원:
  - 원본 포맷 유지
  - JPEG, PNG, WebP, BMP, TIFF
- 품질 설정 (1-100)
- 출력 파일명: 원본파일명-resized.확장자
- 진행상황 실시간 표시

## 설치 및 실행

### 개발 환경에서 실행

1. Node.js와 pnpm 설치가 필요합니다
2. 의존성 설치:
   ```bash
   pnpm install
   ```
3. 개발 모드 실행:
   ```bash
   pnpm dev
   ```

### Windows 빌드

현재 WSL 환경에서는 Windows 크로스 빌드에 제한이 있습니다. Windows 환경에서 빌드하려면:

1. Windows에서 Node.js와 pnpm 설치
2. 프로젝트 파일을 Windows로 복사
3. Windows에서 빌드 실행:
   ```cmd
   pnpm install
   pnpm build:win
   ```

또는 portable 실행파일 생성:
```cmd
pnpm build
```

## 프로젝트 구조

```
resize/
├── main.js              # Electron 메인 프로세스
├── preload.js           # 프리로드 스크립트 (보안 컨텍스트)
├── package.json         # 프로젝트 설정 및 빌드 구성
├── renderer/            # 렌더러 프로세스 (UI)
│   ├── index.html      # 메인 UI
│   ├── styles.css      # 스타일시트
│   └── renderer.js     # UI 로직
└── assets/
    └── icon.svg        # 앱 아이콘
```

## 사용 방법

1. **파일 선택**: "이미지 파일 선택" 버튼으로 처리할 이미지들을 선택
2. **크기 조정 설정**:
   - 픽셀 단위: 가로/세로 픽셀 값 입력 (하나만 입력시 비율 유지)
   - 백분율: 원본 대비 백분율 입력
3. **포맷 및 품질 설정**: 원하는 출력 포맷과 품질 선택
4. **출력 폴더**: 선택하지 않으면 원본과 같은 폴더에 저장
5. **처리 시작**: "이미지 처리 시작" 버튼으로 일괄 처리 시작

## 기술 스택

- **Electron**: 크로스 플랫폼 데스크톱 앱 프레임워크
- **Sharp**: 고성능 이미지 처리 라이브러리
- **HTML/CSS/JavaScript**: 사용자 인터페이스
- **electron-builder**: Windows 실행파일 빌드

## 지원 이미지 포맷

### 입력 포맷
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- TIFF (.tiff)
- WebP (.webp)

### 출력 포맷
- 원본 포맷 유지 (기본값)
- JPEG
- PNG
- WebP
- BMP
- TIFF

## 문제 해결

### WSL에서 실행 문제
WSL 환경에서는 GUI 앱 실행에 제한이 있을 수 있습니다. Windows에서 직접 실행하시기 바랍니다.

### 빌드 문제
Windows 크로스 빌드시 wine이 필요할 수 있습니다. Windows 환경에서 빌드하는 것을 권장합니다.

### 메모리 사용량
대용량 이미지나 많은 수의 파일 처리시 메모리 사용량이 증가할 수 있습니다.