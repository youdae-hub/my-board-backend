# My Board - Backend 개발 가이드

## 프로젝트 개요

회원가입 + 게시판 CRUD 기능을 가진 풀스택 프로젝트의 **백엔드 API 서버**입니다.
프론트엔드와 별도 레포지토리로 관리하며, 독립적으로 배포합니다.

---

## 기술 스택

| 구분 | 기술 | 설명 |
|------|------|------|
| 런타임 | Node.js | JavaScript 서버 실행 환경 |
| 프레임워크 | Express | REST API 서버 프레임워크 |
| 데이터베이스 | PostgreSQL | Supabase 또는 Neon에서 호스팅 |
| ORM | Prisma | DB 테이블 관리 및 쿼리 |
| 인증 | JWT + bcrypt | 토큰 기반 인증, 비밀번호 해싱 |
| 배포 | Render | 백엔드 서버 호스팅 |
| 소스 관리 | Git + GitHub | 레포지토리명: `my-board-backend` |

---

## 프론트엔드 정보 (참고용)

- 별도 레포지토리: `my-board-frontend`
- 기술: React (Vite) → Vercel 배포
- 이 백엔드의 API를 호출하여 화면을 구성함
- 로컬 개발 시 프론트는 `http://localhost:5173`에서 실행됨

---

## DB 테이블 설계

### users 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL (PK) | 자동 증가 고유 ID |
| email | VARCHAR UNIQUE | 로그인용 이메일 |
| password | VARCHAR | bcrypt 해싱된 비밀번호 |
| nickname | VARCHAR | 게시판에 표시될 닉네임 |
| created_at | TIMESTAMP | 가입 일시 |

### posts 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL (PK) | 자동 증가 고유 ID |
| title | VARCHAR | 게시글 제목 |
| content | TEXT | 게시글 본문 |
| user_id | INTEGER (FK) | 작성자 (users.id 참조) |
| created_at | TIMESTAMP | 작성 일시 |
| updated_at | TIMESTAMP | 수정 일시 |

---

## API 엔드포인트 목록

### 인증 API

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| POST | /api/auth/signup | 회원가입 | X |
| POST | /api/auth/login | 로그인 (JWT 발급) | X |

### 게시판 API

| 메서드 | 경로 | 설명 | 인증 필요 |
|--------|------|------|-----------|
| GET | /api/posts | 글 목록 조회 | X |
| GET | /api/posts/:id | 글 상세 조회 | X |
| POST | /api/posts | 글 작성 | O |
| PUT | /api/posts/:id | 글 수정 (본인만) | O |
| DELETE | /api/posts/:id | 글 삭제 (본인만) | O |

---

## 개발 진행 순서 (Phase별)

각 Phase에서 백엔드 작업을 먼저 완료하고, Postman으로 테스트한 뒤,
프론트엔드 대화창에서 화면 작업을 진행합니다.

### Phase 1: 프로젝트 초기 세팅

- Express 프로젝트 생성 (`npm init`, 패키지 설치)
- 폴더 구조 잡기 (routes, controllers, middleware, prisma)
- Prisma 설정 및 DB 연결 (DATABASE_URL 환경변수)
- CORS 설정 (프론트엔드 `http://localhost:5173` 허용)
- 헬스체크 API (`GET /api/health`) 만들어서 서버 동작 확인
- GitHub에 초기 커밋 & 푸시

### Phase 2: 회원가입

- Prisma로 users 테이블 생성 (migration)
- `POST /api/auth/signup` API 구현
  - 이메일 중복 체크
  - bcrypt로 비밀번호 해싱
  - DB에 유저 저장
- Postman으로 테스트 → 성공 시 커밋
- **→ 프론트엔드에서 회원가입 화면 작업**

### Phase 3: 로그인

- `POST /api/auth/login` API 구현
  - 이메일로 유저 조회
  - bcrypt로 비밀번호 비교
  - JWT 토큰 생성 및 반환
- JWT 인증 미들웨어 작성 (이후 Phase에서 사용)
- Postman으로 테스트 → 성공 시 커밋
- **→ 프론트엔드에서 로그인 화면 작업**

### Phase 4: 글 목록 조회

- Prisma로 posts 테이블 생성 (migration)
- `GET /api/posts` API 구현
  - 작성자 닉네임 포함 (JOIN)
  - 최신순 정렬
- DB에 테스트 데이터 직접 삽입해서 확인
- Postman으로 테스트 → 성공 시 커밋
- **→ 프론트엔드에서 게시판 목록 화면 작업**

### Phase 5: 글 작성

- `POST /api/posts` API 구현
  - JWT 인증 미들웨어 적용
  - 토큰에서 user_id 추출하여 작성자 지정
- Postman으로 토큰 포함 요청 테스트 → 성공 시 커밋
- **→ 프론트엔드에서 글 작성 화면 작업**

### Phase 6: 글 상세 / 수정 / 삭제

- `GET /api/posts/:id` 구현 (작성자 정보 포함)
- `PUT /api/posts/:id` 구현 (본인 글만 수정 가능)
- `DELETE /api/posts/:id` 구현 (본인 글만 삭제 가능)
- Postman으로 각각 테스트 → 성공 시 커밋
- **→ 프론트엔드에서 상세/수정/삭제 화면 작업**

### Phase 7: 배포

- Render에 GitHub 레포 연결
- 환경 변수 설정 (DATABASE_URL, JWT_SECRET)
- 배포 완료 후 Postman으로 배포 URL 테스트
- 프론트엔드에 배포된 API URL 전달

---

## 참고: 클로드 코드 사용 팁

- 한 Phase씩 순서대로 요청하기
- "Phase 2 회원가입 API 만들어줘"처럼 구체적으로 요청
- 코드가 생성되면 직접 읽어보고 이해한 뒤 다음으로 넘어가기
- 궁금한 코드가 있으면 "이 코드에서 bcrypt.hash가 하는 역할 설명해줘"처럼 질문
- 각 Phase 완료 후 직접 `git add . → git commit → git push`
