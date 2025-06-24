# Claude Code Project Configuration

## Project Overview
AI 기반 가치관 매칭 플랫폼 (CHARM_INYEON) - Node.js/Express 백엔드

## Development Commands
- `npm run dev` - 개발 서버 실행 (nodemon)
- `npm start` - 프로덕션 서버 실행
- `npm test` - Jest 테스트 실행
- `npm run lint` - ESLint 코드 검사
- `npm run format` - Prettier 코드 포맷팅

## Key Technologies
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **Real-time**: Socket.IO
- **File Upload**: Multer, Sharp (이미지 처리)
- **Security**: Helmet, CORS, Rate Limiting, XSS 보호
- **API Documentation**: Swagger

## Project Structure
```
├── models/          # MongoDB 스키마 정의
├── routes/          # API 라우트 핸들러
├── middleware/      # 인증, 보안, 검증 미들웨어
├── services/        # 비즈니스 로직 서비스
├── utils/           # 유틸리티 함수
└── uploads/         # 파일 업로드 저장소
```

## Code Quality Tools
- ESLint로 코드 품질 관리
- Prettier로 코드 스타일 통일
- Jest로 단위 테스트

## Testing Strategy
- `npm test` 명령어로 Jest 테스트 실행
- 통합 테스트: test-integration.html 파일 존재

## 개발 히스토리 추적 시스템
모든 개발 활동과 Claude Code 대화가 자동으로 기록됩니다.

### 사용 명령어
- `npm run dev-session [세션명]` - 개발 세션 시작 (모든 활동 자동 기록)
- `npm run save-conversation` - 현재 대화 수동 저장
- `npm run dev-log [제목] [내용]` - 개발 로그 수동 기록
- `npm run backup-history` - 전체 히스토리 백업
- `npm run log-code-change [설명]` - 코드 변경사항 수동 기록

### 자동 기록 기능
- Git 커밋 시 자동으로 변경사항 기록
- 매일 자정 자동 백업 (cron 설정 시)
- 모든 대화와 코드 변경사항 타임스탬프 기록

### 저장 위치
- `dev-history/conversations/` - Claude Code 대화 기록
- `dev-history/daily-logs/` - 일별 개발 활동 로그
- `dev-history/code-changes/` - 코드 변경 히스토리
- `dev-history/backups/` - 정기 백업 파일
```