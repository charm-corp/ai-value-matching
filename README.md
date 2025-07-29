# CHARM_INYEON - AI 기반 가치관 매칭 플랫폼

4060세대를 위한 진정한 가치관 기반 매칭 서비스

## 🌟 주요 기능

### 프론트엔드

- 반응형 랜딩 페이지
- 가치관 평가 시스템 (20개 질문)
- AI 매칭 시뮬레이션
- 실시간 사용자 인터랙션
- 모달 기반 회원가입/로그인

### 백엔드 API

- JWT 기반 사용자 인증
- 가치관 평가 시스템
- AI 매칭 알고리즘
- 실시간 채팅 (Socket.IO)
- 프로필 관리
- 파일 업로드

## 🚀 기술 스택

### Frontend

- HTML5, CSS3, JavaScript (ES6+)
- 모던 CSS (Grid, Flexbox, 애니메이션)
- 반응형 디자인

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO (실시간 통신)
- JWT 인증
- Multer (파일 업로드)
- bcryptjs (암호화)

### 개발 도구

- Swagger (API 문서화)
- Morgan (로깅)
- Helmet (보안)
- Compression (압축)

## 📦 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd "AI Projects/AI_matching platform"
```

### 2. 의존성 설치

```bash
npm install
```

### 3. MongoDB 설정

MongoDB를 로컬에 설치하거나 MongoDB Atlas 사용:

```bash
# MongoDB 서비스 시작
mongod
```

### 4. 환경 변수 설정

`.env` 파일이 이미 설정되어 있습니다. 필요시 수정:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/charm_inyeon
JWT_SECRET=your_secret_key
```

### 5. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

### 6. 프론트엔드 접속

브라우저에서 `index.html` 파일을 열거나 Live Server 사용

## 📖 API 문서

서버 실행 후 Swagger 문서 확인:

```
http://localhost:3000/api-docs
```

## 🔑 주요 API 엔드포인트

### 인증 (Auth)

- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/refresh` - 토큰 갱신

### 가치관 평가 (Values)

- `GET /api/values/questions` - 질문 목록
- `POST /api/values/assessment` - 답변 제출
- `GET /api/values/assessment` - 평가 결과 조회

### 매칭 (Matching)

- `POST /api/matching/generate` - 매치 생성
- `GET /api/matching/my-matches` - 내 매치 목록
- `POST /api/matching/matches/:id/respond` - 매치 응답

### 채팅 (Chat)

- `GET /api/chat/conversations` - 대화 목록
- `POST /api/chat/conversations/start` - 대화 시작
- `POST /api/chat/conversations/:id/messages` - 메시지 전송

### 프로필 (Profile)

- `PUT /api/users/profile` - 프로필 업데이트
- `POST /api/profile/upload-image` - 프로필 이미지 업로드
- `GET /api/profile/complete` - 프로필 완성도

## 🎯 주요 특징

### 1. 심층 가치관 분석

- 20개의 정교한 질문
- Big 5 성격 모델 기반
- 10개 가치관 카테고리 분석
- AI 기반 성격 유형 판정

### 2. 스마트 매칭 알고리즘

- 가치관 일치도 (40% 가중치)
- 성격 호환성 (35% 가중치)
- 라이프스타일 일치 (25% 가중치)
- 지리적 근접성 고려

### 3. 안전한 플랫폼

- 이메일 인증 시스템
- JWT 토큰 기반 보안
- 개인정보 암호화
- Rate Limiting

### 4. 실시간 소통

- Socket.IO 기반 실시간 채팅
- 타이핑 상태 표시
- 메시지 읽음 표시
- 이모지 반응

## 📊 데이터베이스 스키마

### User (사용자)

- 기본 정보 (이름, 나이, 성별)
- 인증 정보 (이메일, 비밀번호)
- 위치 정보 (GeoJSON)
- 설정 및 통계

### ValuesAssessment (가치관 평가)

- 20개 질문 답변
- 성격 점수 (Big 5 + 추가)
- 가치관 카테고리 점수
- AI 분석 결과

### Match (매치)

- 사용자 간 매칭 정보
- 호환성 점수 (0-100)
- 매치 상태 관리
- 상호작용 기록

### Conversation & Message (대화 & 메시지)

- 1:1 대화 관리
- 메시지 히스토리
- 읽음 상태 추적
- 미디어 첨부 지원

## 🔧 개발 가이드

### 새로운 API 엔드포인트 추가

1. `routes/` 폴더에 라우터 파일 생성
2. `middleware/validation.js`에 검증 로직 추가
3. `server.js`에 라우터 등록
4. Swagger 문서 추가

### 새로운 기능 개발

1. 모델 스키마 설계 (`models/`)
2. API 엔드포인트 구현 (`routes/`)
3. 미들웨어 추가 (`middleware/`)
4. 프론트엔드 연동 (`script.js`)

## 🧪 테스트

### API 테스트

```bash
# 단위 테스트
npm test

# API 테스트 (Postman Collection 제공)
```

### 프론트엔드 테스트

- 모든 모달 기능 동작 확인
- 가치관 평가 플로우 테스트
- 매칭 시뮬레이션 확인

## 🚀 배포

### 환경 설정

1. 프로덕션 환경변수 설정
2. MongoDB Atlas 연결
3. 이메일 서비스 설정 (SendGrid, etc.)
4. 파일 스토리지 설정 (AWS S3, etc.)

### 보안 체크리스트

- [ ] JWT 시크릿 키 보안
- [ ] 데이터베이스 접근 제한
- [ ] HTTPS 적용
- [ ] Rate Limiting 설정
- [ ] 입력 데이터 검증

## 📈 향후 개선 계획

### 단기 목표

- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 이메일 알림 시스템
- [ ] 프로필 이미지 최적화
- [ ] 모바일 앱 개발

### 장기 목표

- [ ] 머신러닝 모델 고도화
- [ ] 화상 통화 기능
- [ ] 오프라인 만남 중개
- [ ] 성공 스토리 공유

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

MIT License

## 📞 문의

- 이메일: hello@charm-inyeon.com
- 전화: 1588-0000

---

💝 **CHARM_INYEON** - 4060세대의 새로운 만남을 위한 특별한 플랫폼
