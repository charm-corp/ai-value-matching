# Claude Code Project Configuration

## Project Overview

AI 기반 가치관 매칭 플랫폼 (CHARM_INYEON) - Node.js/Express 백엔드

## Development Commands

- `pnpm run dev` - 개발 서버 실행 (nodemon)
- `pnpm start` - 프로덕션 서버 실행
- `pnpm test` - Jest 테스트 실행
- `pnpm run lint` - ESLint 코드 검사
- `pnpm run format` - Prettier 코드 포맷팅

## Key Technologies(핵심 기술 스택)

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **Security**: Helmet, CORS, Rate Limiting, XSS 보호
- **Real-time**: Socket.IO(필요시)
- **File Upload**: Multer, Sharp (이미지 처리)
- **API Documentation**: Swagger

## Project Structure

├── models/ # MongoDB 스키마 정의
├── routes/ # API 라우트 핸들러
├── middleware/ # 인증, 보안, 검증 미들웨어
├── services/ # 비즈니스 로직 서비스
├── utils/ # 유틸리티 함수
└── uploads/ # 파일 업로드 저장소

## Code Quality Tools

- ESLint로 코드 품질 관리
- Prettier로 코드 스타일 통일
- Jest로 단위 테스트

## Testing Strategy

- `pnpm test` 명령어로 Jest 테스트 실행
- 통합 테스트: test-integration.html 파일 존재

## 개발 히스토리 추적 시스템

모든 개발 활동과 Claude Code 대화가 자동으로 기록됩니다.

### 사용 명령어

- `npm run dev-session [세션명]` - 개발 세션 시작 (모든 활동 자동 기록)
- `npm run save-conversation` - 현재 대화 수동 저장

### 저장 위치

- `dev-history/` - 하위 폴더별 분류 저장
- Git 커밋 시 자동 변경 사항 기록

## AI 개발 지침

### 언어 사용 규칙

- **코드 주석**: 한국어로 작성, 함수 목적과 매개변수 설명 필수
- **API 응답 메시지**: 사용자 친화적 한국어로 제공
- **에러 메시지**: 구체적이고 해결 방안을 포함한 한국어 메시지
- **로그 메시지**: 디버깅용은 영어, 사용자 대상은 한국어

### 코딩 컨벤션

- **변수명**: camelCase 사용 (예: userName, createdAt)
- **상수명**: UPPER_SNAKE_CASE 사용 (예: MAX_LOGIN_ATTEMPTS)
- **함수명**: 동사로 시작하는 camelCase (예: getUserData, validateEmail)
- **파일명**: kebab-case 사용 (예: user-service.js, auth-middleware.js)
- **주석**: 한국어로 목적과 매개변수 설명
- **API 응답**: 사용자 친화적 한국어 메시지

### API 응답 표준

- **성공**: { success: true, data: {...}, message: "성공 메시지" }
- **실패**: { success: false, error: "에러 메시지", code: "ERROR_CODE" }

## Rules

## 하이브리드 협업형 개발 가이드

### 협업 철학

- 우리는 신뢰 기반의 창의적 파트너십을 지향합니다.
- 목표는 명확히, 방법은 당신의 창의성에 맡깁니다
- 세부 지시보다는 자율적 문제해결을 신뢰합니다
- 확인이 필요하면 솔직하게 질문해주세요

### 3단계 협업 프로세스

Phase 1: 상황 파악

- 관련 파일과 코드 패턴 확인
- 기존 구조와 규칙 분석
- 추측하지 말고 실제 확인하기

Phase 2: 계획 수립

- 목표와 기존 패턴의 조화
- 실용적이고 확장 가능한 설계
- 1인 개발자 현실 고려

Phase 3: 협업 구현

- 단계별 구현과 검증
- 품질과 일관성 유지
- 함께 검토하며 개선

### 프로젝트 CHARM_INYEON - 중장년층 가치관 매칭 플랫폼

- 목표 : 40~60대 진정한 연결과 의미 있는 만남
- 특성 : 안정성, 신뢰성, 가치관 중심 매칭

## 🚨 1인 개발자 제약사항

### 복잡도 관리 원칙

```javascript
// ✅ 권장: 단순하고 검증된 패턴
const user = await User.findById(userId);

// ❌ 지양: 과도한 추상화나 복잡한 패턴
const user = await this.userRepository
  .createQueryBuilder('user')
  .withComplexJoins()...
```

### 운영 비용 최적화

- **MongoDB Atlas**: 무료 tier 512MB 우선 사용
- **이미지 저장**: Cloudinary 무료 tier (10GB) 활용
- **실시간 기능**: Socket.IO 대신 필요시 Server-Sent Events 고려
- **배포**: Vercel/Railway 무료 tier 우선

### 시간 관리 제약

- **기능 우선순위**: 핵심 매칭 로직 > 부가 기능
- **기술 부채**: 일주일에 한 번씩 리팩토링 시간 확보
- **문서화**: 코드 작성과 동시에 주석 필수

### 지원 체계 부족 대응

- **에러 모니터링**: 콘솔 로깅 + 간단한 에러 수집
- **백업**: 자동화된 DB 백업 스크립트 필수
- **모니터링**: PM2로 프로세스 관리 및 재시작

## 🛡️ 환각 방지 규칙

### 추측 금지 원칙

```javascript
// ❌ 추측 기반 코딩 금지
// "아마 이 필드가 있을 것이다" 가정 금지

// ✅ 확인 후 진행
// 1. 스키마 파일 확인
// 2. 기존 코드 패턴 분석
// 3. 불확실하면 명시적 질문
```

### 필수 확인 체크리스트

- [ ] **파일 존재 확인**: 수정/참조할 파일이 실제 존재하는가?
- [ ] **스키마 확인**: MongoDB 모델 필드가 정확한가?
- [ ] **라이브러리 확인**: package.json에 해당 패키지가 있는가?
- [ ] **API 엔드포인트**: 기존 라우트와 충돌하지 않는가?

### 불확실한 경우 대응

```javascript
// 모르는 경우 정직하게 표현
'이 부분은 기존 코드를 확인한 후 정확히 답변드리겠습니다.';

// 추정하는 경우 명시적 표현
'일반적인 패턴으로는 다음과 같지만, 프로젝트 특성상 다를 수 있습니다.';
```

### 검증 우선 개발

- **Step 1**: 기존 코드/스키마 분석
- **Step 2**: 요구사항과 기존 패턴 매칭
- **Step 3**: 일관성 있는 구현
- **Step 4**: 테스트 가능한 코드 작성

## 🇰🇷 한국 시장 특화 고려사항

### 사용자 인증 & 소셜 로그인

```javascript
// 한국 주요 소셜 로그인 우선순위
1. 카카오톡 로그인 (필수)
2. 네이버 로그인 (권장)
3. 구글 로그인 (글로벌 대응)
4. 전화번호 인증 (본인 확인)
```

### 모바일 우선 설계

- **반응형 디자인**: 모바일 75% 트래픽 고려
- **터치 인터페이스**: 버튼 크기 44px 이상
- **로딩 속도**: 3G 환경에서 3초 이내 로딩
- **오프라인 대응**: 기본적인 캐싱 전략

### 한국어 처리 최적화

```javascript
// 한국어 텍스트 처리 고려사항
- 자음/모음 분리 검색
- 초성 검색 지원
- 띄어쓰기 관대한 검색
- 이모티콘 및 특수문자 처리
```

### 결제 및 금융

- **토스페이먼츠**: 간편결제 우선
- **아임포트**: 다양한 PG 연동
- **계좌이체**: 실시간 계좌이체 옵션
- **현금영수증**: 필수 연동

### 개인정보보호법(PIPA) 준수

```javascript
// 필수 준수 사항
- 개인정보 수집 최소화
- 명시적 동의 절차
- 14세 미만 법정대리인 동의
- 개인정보 처리방침 명시
- 정보 삭제 요청 대응
```

### 고객 지원 채널

- **카카오톡 채널**: 1:1 문의 연동
- **전화 상담**: 업무시간 내 응답
- **FAQ**: 자주 묻는 질문 한국어 정리
- **공지사항**: 서비스 변경사항 안내

## 💰 비즈니스 로직 & 수익화

### 가치관 매칭 핵심 로직

````javascript
// 매칭 성공률 목표: 70% 이상
const matchingScore = {
  compatibility: 40,    // 가치관 호환성 (40%)
  interests: 30,        // 관심사 유사도 (30%)
  lifestyle: 20,        // 라이프스타일 (20%)
  location: 10          // 지역적 근접성 (10%)
};

// 매칭 임계값: 65점 이상
const MATCHING_THRESHOLD = 65;

### 수익화 전략
```javascript
// 주요 수익원
1. 프리미엄 멤버십: 월 9,900원
   - 무제한 매칭
   - 고급 필터링
   - 우선 매칭 큐

2. 부가 서비스: 건당 과금
   - 매칭 부스터: 2,000원 (상위 노출)
   - 자세한 프로필 열람: 1,000원
   - 매칭 결과 재분석: 3,000원

3. 파트너십 수익
   - 데이트 장소 추천 수수료: 5-10%
   - 연인/결혼 관련 서비스 제휴
````

### 사용자 유지 전략

```javascript
// 타겟 지표
- DAU(일 활성 사용자): 1,000명
- 월 유지율: 40% 이상
- 프리미엄 전환율: 15% 목표
- 평균 세션 시간: 8분 이상

// 유지 방법
- 매일 새로운 매칭 추천 (push 알림)
- 주간 매칭 성과 리포트
- 가치관 테스트 결과 업데이트
- 이벤트 및 커뮤니티 활동
```

### KPI 관리

```javascript
// 매칭 성과 지표
matchingMetrics: {
  totalMatches: 0,           // 총 매칭 수
  successfulConnections: 0,  // 성공적 연결 수
  averageResponseTime: 0,    // 평균 응답 시간
  userSatisfactionScore: 0   // 사용자 만족도 (1-5)
}

// 비즈니스 지표
businessMetrics: {
  monthlyRecurringRevenue: 0,  // 월 반복 수익
  customerAcquisitionCost: 0,  // 고객 획득 비용
  lifetimeValue: 0,            // 고객 평생 가치
  churnRate: 0                 // 이탈률
}
```

### 성장 전략

- **바이럴 요소**: 친구 추천 시 매칭 크레딧 제공
- **SEO 최적화**: 가치관 테스트 콘텐츠로 유입
- **소셜 미디어**: 성공 사례 및 팁 콘텐츠
- **오프라인 연계**: 대학교/직장 매칭 이벤트

### 협업 성공 요소

- ✅3단계 프로세스 준수
- ✅확인 기반 개발(추측 금지)
- ✅목표 달성 + 창의적 방법 선택
- ✅중장년층 사용자 특성 고려
- ✅1인 개발자 현실적 제약 반영

### 함께 훌륭한 중장년층 매칭 플랫폼을 만들어 봅시다
