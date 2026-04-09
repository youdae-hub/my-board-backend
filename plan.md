# My Board Backend - 개발 계획

## Phase 1: 프로젝트 초기 세팅 ✅
- [x] Express 프로젝트 생성 (npm init, 패키지 설치)
- [x] 폴더 구조 잡기 (routes, controllers, middleware, prisma)
- [x] Prisma 설정 및 DB 연결 (DATABASE_URL 환경변수)
- [x] CORS 설정 (프론트엔드 localhost:5173 허용)
- [x] 헬스체크 API (GET /api/health)
- [x] 테스트 환경 구성 (Jest + Supertest)
- [x] GitHub 초기 커밋 & 푸시

## Phase 2: 회원가입 ✅
- [x] Prisma로 users 테이블 스키마 정의
- [x] POST /api/auth/signup API 구현
- [x] 테스트 작성 및 검증 (4개 통과)

## Phase 3: 로그인 ✅
- [x] POST /api/auth/login API 구현
- [x] JWT 인증 미들웨어 작성
- [x] GET /api/auth/me (미들웨어 검증용)
- [x] 테스트 작성 및 검증 (7개 통과)

## Phase 4: 글 목록 조회 ✅
- [x] Prisma로 posts 테이블 생성 (migration)
- [x] GET /api/posts API 구현 (작성자 닉네임 포함, 최신순 정렬)
- [x] 테스트 작성 및 검증 (3개 통과)

## Phase 5: 글 작성 ✅
- [x] POST /api/posts API 구현 (JWT 인증 적용)
- [x] 테스트 작성 및 검증 (4개 통과)

## Phase 6: 글 상세 / 수정 / 삭제 ✅
- [x] GET /api/posts/:id 구현 (작성자 닉네임 포함)
- [x] PUT /api/posts/:id 구현 (본인만 수정)
- [x] DELETE /api/posts/:id 구현 (본인만 삭제)
- [x] 테스트 작성 및 검증 (10개 통과)

## Admin Phase A: 인증 + EJS 로그인 ✅
- [x] Admin 모델, AdminLog, UserActivityLog 스키마 추가
- [x] adminAuth, adminSession, requireRole 미들웨어
- [x] 관리자 로그인 API (POST /api/admin/auth/login)
- [x] EJS 로그인 페이지, 대시보드
- [x] 테스트 7개 통과

## Admin Phase B: 관리자 계정 관리 ✅
- [x] 관리자 생성/목록/비활성화/활성화 API (SUPER 전용)
- [x] EJS 관리자 목록/생성 페이지
- [x] 테스트 9개 통과

## Admin Phase C: 회원 관리 ✅
- [x] 회원 목록/상세/수정/삭제 API
- [x] EJS 회원 목록/상세 페이지
- [x] 테스트 8개 통과

## Admin Phase D: 게시판 관리 ✅
- [x] 게시글 목록(검색)/상세/수정/삭제 API
- [x] EJS 게시글 목록/상세 페이지
- [x] 테스트 7개 통과

## Admin Phase E: 로그 관리 ✅
- [x] logAction 유틸 (logAdminAction, logUserActivity)
- [x] 관리자 로그/사용자 로그 조회 API
- [x] 모든 컨트롤러에 로그 기록 추가
- [x] EJS 로그 페이지 (관리자 로그, 사용자 로그)
- [x] 테스트 4개 통과

## Admin Phase F: Seed + 마무리 ✅
- [x] prisma/seed.js (초기 SUPER 관리자)
- [x] 전체 테스트 65개 통과
- [x] 모든 EJS 페이지 라우트 연결

## Phase 7: 배포
- [ ] Render에 GitHub 레포 연결
- [ ] 환경 변수 설정
- [ ] 배포 URL 테스트
