# 📝 Note Frontend

> Django 풀스택으로 개발된 기존 note 프로젝트를 **FE / BE 분리** 구현한 개인 정보 관리 웹 애플리케이션

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [주요 기능](#-주요-기능)
- [시작하기](#-시작하기)
- [환경 설정](#-환경-설정)
- [배포](#-배포)
- [API 엔드포인트](#-api-엔드포인트)
- [권한 체계](#-권한-체계)

---

## 🗂 프로젝트 개요

**Notepad**는 React + TypeScript 기반의 개인 정보 관리 SPA입니다.
Django REST Framework 백엔드와 JWT 인증으로 통신하며,
계좌번호·시리얼 번호·노트·방명록 등 개인 데이터를 통합 관리합니다.

---

## 🛠 기술 스택

| 분류                | 기술                            |
| ------------------- | ------------------------------- |
| **프레임워크**      | React 19, TypeScript 5          |
| **번들러**          | Vite 8                          |
| **UI 라이브러리**   | Ant Design 6                    |
| **라우팅**          | React Router DOM 7              |
| **HTTP 클라이언트** | Axios 1                         |
| **상태 관리/캐싱**  | TanStack Query (React Query) v5 |
| **인증**            | JWT (jwt-decode)                |
| **날짜 처리**       | Moment.js                       |
| **테이블 리사이즈** | react-resizable                 |
| **웹 서버**         | Nginx (Alpine)                  |
| **컨테이너**        | Docker / Docker Compose         |

---

## 📁 프로젝트 구조

```
note_frontend/
├── src/
│   ├── App.tsx                         # 앱 루트 컴포넌트
│   ├── index.tsx                       # 엔트리 포인트
│   ├── index.css                       # 전역 스타일
│   └── components/
│       ├── api/
│       │   └── api_client.tsx          # Axios 인스턴스 + 인터셉터
│       ├── error/
│       │   ├── forbidden.tsx           # 403 Forbidden 페이지
│       │   └── not_found.tsx           # 404 Not Found 페이지
│       ├── router.tsx                  # 라우트 정의
│       ├── layout.tsx                  # 사이드바 내비게이션
│       ├── secure_route.tsx            # 인증/권한 가드 + 공통 레이아웃
│       ├── login.tsx                   # 로그인 페이지
│       ├── dashboard.tsx               # 대시보드 (통계 카드)
│       ├── bank_account.tsx            # 계좌번호 관리
│       ├── serial.tsx                  # 시리얼 번호 관리
│       ├── note.tsx                    # 노트 관리
│       ├── guest_book.tsx              # 결혼식 방명록
│       ├── lotto.tsx                   # 로또 번호 생성
│       ├── audit_log.tsx               # 감사 로그 (관리자 전용)
│       ├── settings.tsx                # 환경 설정 드로어
│       ├── settings_context.tsx        # 전역 설정 Context
│       ├── notification_context.tsx    # 전역 알림 Context
│       └── SmartTable.tsx              # 드래그/리사이즈 가능한 커스텀 테이블
├── nginx/
│   └── nginx.conf                      # Nginx 설정 (HTTPS)
├── Dockerfile                          # 멀티스테이지 Docker 빌드
├── docker-compose.yml                  # Docker Compose 설정
├── vite.config.ts                      # Vite 빌드 설정
├── tsconfig.json                       # TypeScript 설정
└── .env                                # 환경 변수 (로컬)
```

---

## ✨ 주요 기능

### 🔐 인증 & 보안

- **JWT 기반 인증** — Access Token + Refresh Token 자동 갱신
- **권한 기반 라우팅** — 사용자 / 관리자 그룹별 접근 제어
- **비밀번호 변경** — 현재/새/확인 비밀번호 3단계 검증
- **세션 만료 처리** — Refresh 실패 시 자동 로그아웃

### 📊 대시보드

- 계좌번호 / 시리얼 번호 / 노트 / 방명록 데이터 건수 실시간 조회
- 그라디언트 카드 클릭으로 해당 모듈 즉시 이동

### 🏦 계좌번호 관리 (`/bank-account`)

- 은행명 / 계좌번호 / 예금주 / 설명 / 생성 일자 CRUD
- 컬럼 정렬, 필드 표시/숨기기, 페이지네이션

### 🔑 시리얼 번호 관리 (`/serial`)

- 유형(게임/운영체제/유틸) / 제품명 / 시리얼 번호 / 생성 일자 CRUD
- 유형 필터, 제품명 검색, 정렬

### 📓 노트 (`/note`)

- 제목 / 내용 / 생성 일자 CRUD
- 제목 검색 필터, 생성 일자 정렬

### 💒 결혼식 방명록 (`/guest-book`)

- 이름 / 금액 / 일자 / 장소 / 참석여부 / 설명 / 생성 일자 CRUD
- 참석 여부 필터(참석/미참석/미정), 금액 천 단위 포맷

### 🎰 로또 번호 생성 (`/lotto`)

- 백엔드 API 호출로 로또 번호 자동 생성
- 게임 수 및 생성 번호 표시

### 📋 감사 로그 (`/audit-log`) — **관리자 전용**

- 사용자 / IP / 카테고리 / 내용 / 결과 / 생성 일자 조회
- 카테고리, 결과 필터 + 텍스트 검색
- 분 단위(HH:mm)까지 조절 가능한 상세 기간(Date Range) 필터링 지원
- **데이터 내보내기** — 조회된 모든 로그를 엑셀 파일로 생성 및 ZIP 압축하여 다운로드 지원

### 📥 데이터 내보내기 (Excel/ZIP Export)

- **공통 기능** — 계좌번호, 시리얼 번호, 노트, 방명록, 감사 로그 메뉴에 적용
- **데이터 보존** — 현재 적용된 **필터 및 정렬 상태를 유지**한 채로 전체 데이터를 내보냄
- **보안 유지** — 암호화된 필드(계좌번호, 시리얼, 노트 등)는 **복호화**되어 엑셀에 포함
- **파일 포맷** — `메뉴명_YYYYMMDDHHMMSS.zip` (내부에 엑셀 파일 포함)


### 🎛 SmartTable — 고급 테이블 컴포넌트

- **데이터 페칭 및 캐싱** — TanStack Query 기반 로컬 캐시를 통한 쾌적한 테이블 뷰어 제공
- **고급 페이징 정보** — 마지막 새로고침 시간, 총 데이터 수/현재 범위 표시, 동적 페이지 사이즈 조절
- **드래그 앤 드롭** 컬럼 순서 변경
- **마우스 드래그** 컬럼 너비 리사이즈
- 설정 **localStorage 자동 저장** (키: `smart_table_{tableId}`)
- 전역 설정 초기화 시 테이블 설정도 함께 초기화

### ⚙ 환경 설정

- **테이블 밀도** — 조밀 / 기본 / 넓게
- **테마** — 라이트 / 다크 모드
- **레이아웃 색상** — 7가지 프리셋 + 커스텀 컬러 피커
- **사이드바 너비** — 마우스 드래그 리사이즈 (160px ~ 400px)
- 설정은 `localStorage`에 자동 저장

### 🔔 알림 시스템

- 모든 `antd message` 호출을 자동 인터셉트하여 알림 히스토리 관리
- 헤더 벨 아이콘 — 미읽은 알림 배지, 최근 50개 보관
- 클릭 시 전체 읽음 처리, 개별 삭제 / 전체 삭제

### 📱 반응형 레이아웃

- **데스크톱** — 고정 사이드바 + 헤더 (Sider 컴포넌트)
- **모바일** (< 768px) — Drawer 기반 슬라이드 사이드바
- CSS 변수(`--layout-color`)로 동적 색상 테마 적용

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 22+
- npm 10+

### 로컬 개발 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (아래 환경 설정 섹션 참고)
cp .env.example .env

# 3. 개발 서버 시작 (http://localhost:3000)
npm start
```

---

## ⚙ 환경 설정

### `.env` 파일

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
VITE_API_URL=https://your-backend-api-url
```

### SSL 인증서 (Docker 배포 시 필요)

```
cert/cert.pem
cert/privkey.pem
```

Let's Encrypt 또는 자체 서명 인증서를 위 경로에 배치하세요.

---

## 🐳 배포

### Docker Compose (권장)

```bash
# 빌드 및 실행
docker compose up -d --build

# 로그 확인
docker compose logs -f note_frontend

# 중지
docker compose down
```

컨테이너는 **포트 3000(호스트) → 443(컨테이너 HTTPS)** 으로 매핑됩니다.

### Docker 단독 빌드

```bash
# 이미지 빌드
docker build -t note_frontend .

# 컨테이너 실행
docker run -d -p 3000:443 --name note_frontend note_frontend
```

### 프로덕션 빌드만 생성

```bash
npm run build
# 빌드 결과물: ./build/
```

---

## 🔌 API 엔드포인트

> Base URL: `VITE_API_URL/api/v1`

| 모듈        | 메서드     | 경로                 | 설명               |
| ----------- | ---------- | -------------------- | ------------------ |
| 대시보드    | GET        | `/dashboard/stats`   | 모듈별 데이터 건수 |
| 계좌번호    | GET/POST   | `/bank-account`      | 목록 조회 / 추가   |
| 계좌번호    | PUT/DELETE | `/bank-account/{id}` | 수정 / 삭제        |
| 시리얼 번호 | GET/POST   | `/serial`            | 목록 조회 / 추가   |
| 시리얼 번호 | PUT/DELETE | `/serial/{id}`       | 수정 / 삭제        |
| 노트        | GET/POST   | `/note`              | 목록 조회 / 추가   |
| 노트        | PUT/DELETE | `/note/{id}`         | 수정 / 삭제        |
| 방명록      | GET/POST   | `/guest-book`        | 목록 조회 / 추가   |
| 방명록      | PUT/DELETE | `/guest-book/{id}`   | 수정 / 삭제        |
| 로또        | GET        | `/lotto`             | 로또 번호 생성     |
| 감사 로그   | GET        | `/audit-log`         | 감사 로그 목록     |
| 사용자      | PUT        | `/account/user`      | 비밀번호 변경      |
| 내보내기    | GET        | `/{module}/export`   | 엑셀/ZIP 다운로드  |


> 인증 엔드포인트(`/token`, `/token/verify`, `/token/refresh`)는 Base URL 직하 경로 사용

---

## 🔑 권한 체계

| 역할       | 접근 가능 메뉴                                      |
| ---------- | --------------------------------------------------- |
| **사용자** | 대시보드, 계좌번호, 시리얼 번호, 노트, 방명록, 로또 |
| **관리자** | 사용자 메뉴 전체 + **감사 로그**                    |

권한은 JWT 토큰의 `groups` 클레임을 디코딩하여 확인합니다.

---

## 📜 라이선스

[Apache License 2.0](LICENSE)

---

> COPYRIGHT © HWANG HADONG. ALL RIGHTS RESERVED
