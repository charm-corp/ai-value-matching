CHARM_INYEON - AI 매칭 플랫폼
🎯 프로젝트 개요
한국 시장 맞춤형 가치관 기반 매칭 서비스
목표: 70% 매칭 정확도, 월 1000명 DAU 달성

🛠️ 기술 스택
Backend: Node.js, Express.js, MongoDB
Authentication: JWT + 카카오/네이버 로그인
Real-time: Socket.IO (필요시)
Deploy: Railway/Vercel 무료 tier 우선
Payment: 토스페이먼츠/아임포트

👤 개발 철학
💡 1인 개발자 우선순위
// ✅ 선호하는 방식: 단순하고 검증된 패턴
const user = await User.findById(userId);

// ⚠️ 피하고 싶은 방식: 과도한 추상화
const user = await this.userRepository.createQueryBuilder()...
🚀 협업 스타일
대화형 개발: 자연스러운 요청-응답 선호
빠른 프로토타이핑: 완벽함보다 동작하는 코드 우선
점진적 개선: 작은 기능부터 차근차근
📱 한국 특화 고려사항
모바일 우선: 75% 모바일 트래픽 대응
간편 로그인: 카카오톡 > 네이버 > 구글 순
결제: 토스페이, 카카오페이 우선
개인정보보호: PIPA 준수 필수

🎨 개발 컨벤션
네이밍 규칙
// 변수: camelCase
const userName = "김개발";
const createdAt = new Date();

// 상수: UPPER_SNAKE_CASE  
const MAX_LOGIN_ATTEMPTS = 3;

// 함수: 동사로 시작
function getUserData() {}
function validateEmail() {}

// 파일: kebab-case
user-service.js
auth-middleware.js
API 응답 형식
// 성공
{
success: true,
data: {...},
message: "성공적으로 처리되었습니다"
}

// 실패
{
success: false,
error: "구체적인 에러 메시지",
code: "ERROR_CODE"
}

💰 비즈니스 로직
매칭 알고리즘 가중치
const matchingScore = {
compatibility: 40, // 가치관 호환성
interests: 30, // 관심사 유사도  
 lifestyle: 20, // 라이프스타일
location: 10 // 지역 근접성
};

const MATCHING_THRESHOLD = 65; // 65점 이상 매칭 성공
수익화 모델
프리미엄: 월 9,900원 (무제한 매칭)
부스터: 2,000원 (상위 노출)
자세히 보기: 1,000원 (프로필 열람)

🔧 개발 명령어

# 개발 서버

npm run dev

# 테스트

npm test

# 코드 정리

npm run lint
npm run format

# 히스토리 관리 (선택사항)

npm run dev-session
npm run save-conversation
npm run backup-history

🤝 협업 가이드
권장하는 개발 흐름
컨텍스트 파악: "어떤 기능을 만들까요?"
함께 탐색: "관련 파일들 확인해볼까요?"
계획 수립: "어떤 순서로 진행할까요?"
단계별 구현: "하나씩 만들어가요"
중간 체크: "지금까지 어떤가요?"
품질 관리 포인트
파일 확인: 추측보다 실제 확인 선호
기존 패턴: 일관성 있는 코드 스타일 유지
테스트: 핵심 기능은 간단한 테스트 추가
백업: Git 커밋 자주, 의미있는 메시지

🎯 프로젝트 목표
단기 목표 (1개월)
[ ] 사용자 인증 (카카오 로그인)
[ ] 기본 프로필 등록
[ ] 매칭 알고리즘 v1
[ ] 간단한 매칭 결과 표시
장기 목표 (3개월)
[ ] 실시간 채팅
[ ] 결제 시스템
[ ] 관리자 대시보드
[ ] 모바일 최적화

💡 참고사항
이 가이드는 함께 만들어가는 기준입니다. 더 좋은 아이디어나 효율적인 방법이 있다면 언제든 제안해주세요!
목표는 성공적인 매칭 플랫폼 구축이니까요. 🚀

🔄 참고: 체계적 개발 접근법 (선택사항)
혹시 더 체계적으로 진행하고 싶다면, 이런 3단계 접근법도 고려해볼 수 있어요:
1단계: 프로젝트 탐색 (현황 파악)
📁 관련 파일들 확인해보기
🔍 기존 코드 패턴 살펴보기  
📋 사용 중인 라이브러리나 컨벤션 정리
2단계: 구현 계획 (로드맵 그리기)
🎯 구체적인 작업 단계들 나열
✅ 완료 기준 명확히 하기
⚡ 1인 개발 제약사항 고려
🇰🇷 한국 특화 요소 반영
3단계: 실제 구현 (코딩하기)
💻 단계별로 구현하면서 확인
🔄 중간중간 테스트해보기
📝 기존 컨벤션 따라가기
✨ 품질 체크하며 완성
물론 이 과정을 꼭 따를 필요는 없어요! 상황에 맞게 자유롭게 진행하시면 됩니다. 😊

마지막 수정: 2025년 7월
