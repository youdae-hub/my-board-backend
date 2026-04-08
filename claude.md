# My Board Backend - 개발 규칙

## 개발 방법론
- **Test-Driven Development (TDD)** 적용
  - 테스트 코드를 먼저 작성하고, 테스트를 통과하는 최소한의 코드를 구현
  - Red → Green → Refactor 사이클 준수
  - 모든 API 엔드포인트는 반드시 테스트를 거쳐 검증

## 코드 스타일
- 코드 내 주석은 최소화 (자명한 코드에는 주석 금지)
- 주석은 "왜(Why)"에 대해서만 작성, "무엇(What)"은 코드로 표현

## 기술 스택
- Node.js + Express
- PostgreSQL + Prisma
- JWT + bcrypt
- 배포: Render

## Phase별 진행
- 각 Phase 완료 시 plan.md, progress.md 업데이트
- Phase별로 테스트 작성 → 구현 → 검증 순서로 진행
