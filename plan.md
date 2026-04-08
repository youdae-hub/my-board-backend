# My Board Backend - 개발 계획

## Phase 1: 프로젝트 초기 세팅 ✅
- [x] Express 프로젝트 생성 (npm init, 패키지 설치)
- [x] 폴더 구조 잡기 (routes, controllers, middleware, prisma)
- [x] Prisma 설정 및 DB 연결 (DATABASE_URL 환경변수)
- [x] CORS 설정 (프론트엔드 localhost:5173 허용)
- [x] 헬스체크 API (GET /api/health)
- [x] 테스트 환경 구성 (Jest + Supertest)
- [ ] GitHub 초기 커밋 & 푸시

## Phase 2: 회원가입
- [ ] Prisma로 users 테이블 생성 (migration)
- [ ] POST /api/auth/signup API 구현
- [ ] 테스트 작성 및 검증

## Phase 3: 로그인
- [ ] POST /api/auth/login API 구현
- [ ] JWT 인증 미들웨어 작성
- [ ] 테스트 작성 및 검증

## Phase 4: 글 목록 조회
- [ ] Prisma로 posts 테이블 생성 (migration)
- [ ] GET /api/posts API 구현
- [ ] 테스트 작성 및 검증

## Phase 5: 글 작성
- [ ] POST /api/posts API 구현 (JWT 인증 적용)
- [ ] 테스트 작성 및 검증

## Phase 6: 글 상세 / 수정 / 삭제
- [ ] GET /api/posts/:id 구현
- [ ] PUT /api/posts/:id 구현 (본인만)
- [ ] DELETE /api/posts/:id 구현 (본인만)
- [ ] 테스트 작성 및 검증

## Phase 7: 배포
- [ ] Render에 GitHub 레포 연결
- [ ] 환경 변수 설정
- [ ] 배포 URL 테스트
