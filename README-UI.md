# 중장년층을 위한 직관적이고 따뜻한 UI/UX

CHARM_INYEON의 중장년층 특화 사용자 인터페이스입니다. 큰 글씨, 간단한 네비게이션, 음성 안내 등 중장년층의 특성을 고려한 접근성 중심의 디자인을 제공합니다.

## 🎯 주요 특징

### 1. **중장년층 친화적 디자인**

- **큰 글씨**: 기본 18px, 제목 38px로 가독성 최적화
- **넉넉한 여백**: 최소 16px 이상의 여백으로 시각적 편안함
- **따뜻한 색상**: 부드럽고 편안한 색상 팔레트 적용
- **높은 대비**: WCAG 4.5:1 이상의 색상 대비 유지

### 2. **접근성 최우선**

- **음성 안내**: 모든 UI 요소에 대한 음성 가이드 제공
- **키보드 네비게이션**: Tab 키로 모든 기능 접근 가능
- **스크린 리더 지원**: ARIA 레이블 및 의미론적 마크업
- **포커스 관리**: 명확한 포커스 표시 및 트랩 구현

### 3. **직관적인 사용성**

- **단순한 네비게이션**: 4개 이하의 주요 메뉴로 구성
- **단계별 안내**: 3단계 회원가입 프로세스
- **진행률 표시**: 모든 과정에서 현재 위치 표시
- **도움말 툴팁**: 필요한 곳에 상세한 설명 제공

## 📁 파일 구조

```
UI/UX 관련 파일:
├── senior-styles.css          # 중장년층 특화 스타일시트
├── senior-ui.html            # 메인 랜딩 페이지
├── senior-ui.js              # 인터랙션 및 접근성 기능
├── matching-visualization.html # 매칭 결과 시각화 페이지
├── accessibility-test.html    # 접근성 테스트 도구
└── README-UI.md              # 이 문서
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: #6B73FF (메인 브랜드 컬러)
- **Secondary**: #FF6B6B (강조 컬러)
- **Accent**: #4ECDC4 (포인트 컬러)
- **Success**: #45B7D1 (성공/안전)
- **Warning**: #FFA726 (주의/정보)
- **Error**: #EF5350 (오류/위험)

### 타이포그래피

```css
--font-size-small: 16px /* 보조 텍스트 */ --font-size-base: 18px /* 기본 텍스트 */
  --font-size-large: 22px /* 중요 텍스트 */ --font-size-xl: 26px /* 서브 제목 */
  --font-size-xxl: 32px /* 제목 */ --font-size-title: 38px /* 메인 제목 */;
```

### 간격 시스템

```css
--spacing-xs: 8px /* 최소 간격 */ --spacing-sm: 16px /* 작은 간격 */ --spacing-md: 24px
  /* 보통 간격 */ --spacing-lg: 32px /* 큰 간격 */ --spacing-xl: 48px /* 매우 큰 간격 */
  --spacing-xxl: 64px /* 섹션 간격 */;
```

## 🔊 음성 안내 시스템

### 기능

- **자동 안내**: 페이지 로드 시 환영 메시지
- **요소별 안내**: 마우스 호버/포커스 시 설명
- **상태 알림**: 버튼 클릭, 폼 제출 등 피드백
- **오류 안내**: 입력 오류 시 음성으로 안내

### 사용법

```javascript
// 음성 안내 켜기/끄기
const voiceToggle = document.getElementById('voiceToggle');
voiceToggle.click();

// 커스텀 음성 메시지
seniorUI.speak('사용자 정의 메시지');
```

## 📱 반응형 디자인

### 브레이크포인트

- **Mobile**: 768px 이하
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px 이상

### 모바일 최적화

- **터치 타겟**: 최소 60px × 60px 크기
- **글씨 크기**: 모바일에서 20px 기본
- **네비게이션**: 세로 스택 레이아웃
- **여백 조정**: 모바일에서 여백 축소

## 🔧 주요 컴포넌트

### 1. 버튼 (`.btn`)

```html
<button class="btn btn-primary btn-large">
  <span>텍스트</span>
  <svg class="btn-icon">...</svg>
</button>
```

### 2. 폼 입력 (`.form-input`)

```html
<div class="form-group">
  <label class="form-label required">라벨</label>
  <input type="text" class="form-input" placeholder="입력하세요" />
  <div class="form-help">도움말 텍스트</div>
</div>
```

### 3. 카드 (`.card`)

```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">제목</h3>
    <p class="card-subtitle">부제목</p>
  </div>
  <div class="card-content">내용</div>
</div>
```

### 4. 알림 (`.alert`)

```html
<div class="alert alert-success">
  <svg>아이콘</svg>
  <span>메시지 내용</span>
</div>
```

## 🎭 회원가입 도우미

### 3단계 프로세스

1. **기본 정보**: 이름, 연령대, 성별, 거주지
2. **연락처**: 이메일, 전화번호, 비밀번호
3. **약관 동의**: 이용약관, 개인정보처리방침

### 특징

- **진행률 표시**: 시각적 진행 바
- **실시간 검증**: 입력 즉시 유효성 검사
- **도움말**: 각 단계별 상세 안내
- **음성 가이드**: 단계 이동 시 음성 안내

## 📊 매칭 결과 시각화

### 호환성 표시

- **원형 차트**: 전체 호환성 점수
- **요소별 분석**: 6개 영역 세부 점수
- **AI 인사이트**: 특별한 공통점 발견
- **대화 가이드**: 맞춤형 대화 주제 제안

### 애니메이션

- **점수 카운트업**: 0에서 실제 점수까지 애니메이션
- **프로그레스 바**: 좌에서 우로 채워지는 효과
- **요소 등장**: Intersection Observer 활용

## ♿ 접근성 기준

### WCAG 2.1 AA 준수

- **색상 대비**: 4.5:1 이상 유지
- **키보드 접근**: 모든 기능 키보드로 조작 가능
- **포커스 관리**: 명확한 포커스 표시
- **대체 텍스트**: 모든 이미지에 alt 속성

### 중장년층 특화

- **큰 터치 영역**: 44px × 44px 이상
- **느린 애니메이션**: 0.5초 이상의 전환 시간
- **단순한 구조**: 3클릭 이내 주요 기능 접근
- **일관된 레이아웃**: 예측 가능한 UI 패턴

## 🧪 테스트 도구

### 자동 접근성 검사 (`accessibility-test.html`)

- **색상 대비 테스트**: 자동 대비율 계산
- **글꼴 크기 검사**: 최소 크기 준수 확인
- **터치 타겟**: 충분한 크기 검증
- **키보드 네비게이션**: Tab 순서 및 포커스 검사
- **의미론적 마크업**: HTML5 시맨틱 요소 확인
- **ARIA 속성**: 접근성 속성 사용 검증

### 사용법

1. `accessibility-test.html` 파일 열기
2. "전체 테스트 실행" 버튼 클릭
3. 결과 확인 및 개선사항 적용

## 🚀 사용 방법

### 1. 기본 페이지 생성

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>페이지 제목</title>
    <link rel="stylesheet" href="senior-styles.css" />
  </head>
  <body>
    <!-- 음성 컨트롤러 -->
    <div class="voice-controller">...</div>

    <!-- 글씨 크기 조절 -->
    <div class="font-size-controller">...</div>

    <!-- 컨텐츠 -->
    <main>...</main>

    <script src="senior-ui.js"></script>
  </body>
</html>
```

### 2. JavaScript 초기화

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const seniorUI = new SeniorUI();
});
```

### 3. 음성 안내 추가

```html
<button data-voice="버튼 설명">클릭하세요</button>
```

## 🔧 커스터마이징

### 색상 변경

```css
:root {
  --primary-color: #새로운색상;
  --font-size-base: 20px; /* 글씨 크기 조정 */
}
```

### 음성 설정

```javascript
// 음성 속도 조정
utterance.rate = 0.8; // 0.1 - 2.0

// 음성 언어 설정
utterance.lang = 'ko-KR';
```

## 📈 성능 최적화

### 이미지 최적화

- **WebP 포맷**: 지원 브라우저에서 WebP 사용
- **지연 로딩**: `loading="lazy"` 속성 활용
- **적절한 크기**: 레티나 디스플레이 대응

### CSS 최적화

- **Critical CSS**: 초기 화면 렌더링에 필요한 CSS 우선 로드
- **미디어 쿼리**: 필요한 경우에만 스타일 적용
- **CSS Grid/Flexbox**: 효율적인 레이아웃 구성

### JavaScript 최적화

- **이벤트 위임**: 동적 요소에 대한 효율적 이벤트 처리
- **Intersection Observer**: 스크롤 이벤트 대신 사용
- **Web API 활용**: 음성 합성, 진동 등 네이티브 기능 활용

## 🐛 알려진 이슈

### 음성 합성

- **iOS Safari**: 사용자 제스처 후에만 음성 재생 가능
- **Chrome**: 자동재생 정책으로 인한 제한
- **해결책**: 사용자가 직접 음성 버튼을 클릭하도록 유도

### 폰트 크기

- **브라우저 설정**: 사용자 브라우저 설정과 충돌 가능
- **해결책**: `rem` 단위와 `px` 단위 혼용으로 일관성 유지

## 📞 지원 및 피드백

문제점이나 개선사항이 있으시면 다음으로 연락해주세요:

- **이메일**: dev@charminyeon.co.kr
- **이슈 트래커**: GitHub Issues
- **문서 개선**: Pull Request 환영

## 📝 라이선스

이 UI/UX 시스템은 CHARM_INYEON 프로젝트의 일부이며, 해당 프로젝트의 라이선스를 따릅니다.
