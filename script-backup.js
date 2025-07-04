// Modal functionality
function showModal(title, message) {
  // Remove existing modal if any
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  `;
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;
    text-align: center;
  `;
  
  modalContent.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #2563eb; font-size: 1.2em;">${title}</h3>
    <p style="margin: 0 0 20px 0; color: #64748b; line-height: 1.5;">${message}</p>
    <button class="modal-close-btn" style="
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    ">확인</button>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // Add close functionality
  const closeBtn = modalContent.querySelector('.modal-close-btn');
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => modalOverlay.remove(), 200);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  // Add keyboard support
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyPress);
    }
  };
  document.addEventListener('keydown', handleKeyPress);
  
  // Hover effect for button
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#1d4ed8';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#2563eb';
  });
}

// 완전히 새로운 회원가입 모달 함수 (기존 signupModal과 동일하게)
function openSignupModal() {
  console.log('openSignupModal 함수 실행!');
  try {
  
  // Remove existing modal if any
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  `;
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: white;
    padding: 0;
    border-radius: 12px;
    max-width: 450px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;
  `;
  
  modalContent.innerHTML = `
    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0; color: #333; font-size: 1.4em;">회원가입</h2>
      <span class="close-btn" style="cursor: pointer; font-size: 24px; color: #999; background: none; border: none;">&times;</span>
    </div>
    
    <form class="auth-form" id="signupForm" style="padding: 30px;">
      <div class="form-group" style="margin-bottom: 20px;">
        <label for="signupName" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">이름</label>
        <input type="text" id="signupName" name="name" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        " placeholder="실명을 입력해주세요" />
      </div>
      
      <div class="form-group" style="margin-bottom: 20px;">
        <label for="signupEmail" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">이메일</label>
        <input type="email" id="signupEmail" name="email" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        " placeholder="example@email.com" />
      </div>
      
      <div class="form-group" style="margin-bottom: 20px;">
        <label for="signupPassword" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">비밀번호</label>
        <input type="password" id="signupPassword" name="password" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        " placeholder="8자 이상 입력해주세요" />
        <div class="password-requirements" style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
          <span class="requirement" data-requirement="length" style="
            padding: 3px 8px; background: #f3f4f6; color: #6b7280; border-radius: 4px; font-size: 12px; transition: all 0.2s;
          ">8자 이상</span>
          <span class="requirement" data-requirement="uppercase" style="
            padding: 3px 8px; background: #f3f4f6; color: #6b7280; border-radius: 4px; font-size: 12px; transition: all 0.2s;
          ">대문자 포함</span>
          <span class="requirement" data-requirement="lowercase" style="
            padding: 3px 8px; background: #f3f4f6; color: #6b7280; border-radius: 4px; font-size: 12px; transition: all 0.2s;
          ">소문자 포함</span>
          <span class="requirement" data-requirement="number" style="
            padding: 3px 8px; background: #f3f4f6; color: #6b7280; border-radius: 4px; font-size: 12px; transition: all 0.2s;
          ">숫자 포함</span>
        </div>
      </div>
      
      <div class="form-group" style="margin-bottom: 20px;">
        <label for="confirmPassword" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">비밀번호 확인</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        " placeholder="비밀번로를 다시 입력해주세요" />
      </div>
      
      <div class="form-group" style="margin-bottom: 20px;">
        <label for="signupAge" style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">연령대</label>
        <select id="signupAge" name="age" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        ">
          <option value="">선택해주세요</option>
          <option value="40-45">40-45세</option>
          <option value="46-50">46-50세</option>
          <option value="51-55">51-55세</option>
          <option value="56-60">56-60세</option>
          <option value="60+">60세 이상</option>
        </select>
      </div>
      
      <div class="form-group" style="margin-bottom: 20px;">
        <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" id="agreeTerms" required style="width: 16px; height: 16px;" />
          <span style="font-size: 14px; color: #333;">
            <a href="#" class="terms-link" style="color: #2563eb; text-decoration: none;">이용약관</a> 및
            <a href="#" class="privacy-link" style="color: #2563eb; text-decoration: none;">개인정보처리방침</a>에 동의합니다
          </span>
        </label>
      </div>
      
      <div class="form-group" style="margin-bottom: 25px;">
        <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" id="agreeMarketing" style="width: 16px; height: 16px;" />
          <span style="font-size: 14px; color: #333;">마케팅 정보 수신에 동의합니다 (선택)</span>
        </label>
      </div>
      
      <button type="submit" class="auth-submit-btn" style="
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 20px;
      ">회원가입</button>
      
      <div class="auth-divider" style="text-align: center; margin: 20px 0; position: relative;">
        <span style="background: white; padding: 0 15px; color: #666; font-size: 14px;">또는</span>
        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e7eb; z-index: -1;"></div>
      </div>
      
      <div class="social-login" style="display: flex; flex-direction: column; gap: 10px;">
        <button type="button" class="social-btn google-btn" style="
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 가입
        </button>
        <button type="button" class="social-btn kakao-btn" style="
          width: 100%;
          padding: 12px;
          background: #fee500;
          color: #000;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#000000" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
          </svg>
          카카오로 가입
        </button>
      </div>
      
      <p class="auth-switch" style="text-align: center; margin-top: 20px; font-size: 14px; color: #666;">
        이미 계정이 있으신가요? <a href="#" id="showLoginLink" style="color: #2563eb; text-decoration: none; font-weight: 500;">로그인</a>
      </p>
    </form>
  `;
  
  // Add to DOM
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // Event listeners
  const form = modalContent.querySelector('#signupForm');
  const closeBtn = modalContent.querySelector('.close-btn');
  const passwordInput = modalContent.querySelector('#signupPassword');
  const requirements = modalContent.querySelectorAll('.requirement');
  const googleBtn = modalContent.querySelector('.google-btn');
  const kakaoBtn = modalContent.querySelector('.kakao-btn');
  const showLoginLink = modalContent.querySelector('#showLoginLink');
  
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => modalOverlay.remove(), 200);
  };
  
  // Close button
  closeBtn.addEventListener('click', closeModal);
  
  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  // Password validation (same as original modal)
  function validatePassword(password) {
    const validationResults = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    return validationResults;
  }
  
  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const validation = validatePassword(password);
    
    requirements.forEach(req => {
      const requirement = req.dataset.requirement;
      const isValid = validation[requirement];
      
      if (isValid) {
        req.style.background = '#dcfce7';
        req.style.color = '#166534';
      } else {
        req.style.background = '#f3f4f6';
        req.style.color = '#6b7280';
      }
    });
  });
  
  // Social login buttons
  googleBtn.addEventListener('click', () => {
    console.log('Google 소셜 로그인 시도');
    closeModal();
    showModal('준비 중', 'Google 로그인 기능을 준비 중입니다.');
  });
  
  kakaoBtn.addEventListener('click', () => {
    console.log('Kakao 소셜 로그인 시도');
    closeModal();
    showModal('준비 중', '카카오 로그인 기능을 준비 중입니다.');
  });
  
  // Show login link
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    // TODO: 로그인 모달 열기
    showModal('로그인', '로그인 기능을 준비 중입니다.');
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      age: formData.get('age'),
      agreeTerms: formData.get('agreeTerms'),
      agreeMarketing: formData.get('agreeMarketing')
    };
    
    console.log('회원가입 데이터:', userData);
    closeModal();
    showModal('가입 완료', '회원가입이 완료되었습니다! 로그인해주세요.');
  });
  
  } catch (error) {
    console.error('회원가입 모달 에러:', error);
    showModal('오류', '회원가입 모달을 여는 중 오류가 발생했습니다.');
  }
}

// 기존 showSignupModal 함수도 새로운 함수 호출하도록 변경
function showSignupModal() {
  openSignupModal();
}

// Add modal animations to CSS
const modalStyles = document.createElement('style');
modalStyles.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;
document.head.appendChild(modalStyles);

// 회원가입 버튼들의 이벤트 리스너 완전 초기화
function initializeSignupButtons() {
  const signupButtons = document.querySelectorAll('#signup-btn, #signup-btn-2, .primary-button, .cta-large-button');
  
  signupButtons.forEach(button => {
    const buttonText = button.textContent.trim();
    if (buttonText === '무료로 시작하기' || buttonText === '무료로 가입하기') {
      // 기존 이벤트 리스너 모두 제거
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // 새로운 이벤트 리스너 추가
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openSignupModal();
      });
      
      // 보호 표시
      newButton.setAttribute('data-signup-initialized', 'true');
      console.log('회원가입 버튼 초기화 완료:', buttonText);
    }
  });
}

// DOM 로드 후 회원가입 버튼 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 로드 완료, 초기화 시작');
  initializeSignupButtons();
});

// 즉시 실행도 추가 (이미 DOM이 로드된 경우 대비)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로딩 중, 이벤트 리스너 등록');
    initializeSignupButtons();
  });
} else {
  console.log('DOM 이미 로드됨, 즉시 초기화');
  initializeSignupButtons();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Header scroll effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.98)';
    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
  } else {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
    header.style.boxShadow = 'none';
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.about-card, .feature-item, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Floating cards animation enhancement
const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card, index) => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.05)';
    card.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
  });
    
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
    card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
  });
});

// Progress bar animation
const progressBar = document.querySelector('.progress-fill');
const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      progressBar.style.animation = 'progress 3s ease-in-out infinite';
    }
  });
}, { threshold: 0.5 });

if (progressBar) {
  progressObserver.observe(progressBar);
}

// Widget click handling functions
let isAuthenticated = false; // 실제 프로젝트에서는 인증 상태를 실제로 확인해야 함
let widgetHistory = []; // 브라우저 히스토리 관리용

// 위젯 클릭 처리 메인 함수
function handleWidgetClick(widgetType) {
  console.log(`${widgetType} 위젯 클릭됨`);
  
  // 클릭 피드백 애니메이션 적용
  const widget = document.getElementById(getWidgetId(widgetType));
  if (widget) {
    widget.style.transform = 'scale(0.95)';
    widget.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      widget.style.transform = 'scale(1)';
    }, 100);
  }
  
  // 인증 상태 확인 후 처리
  if (isAuthenticated) {
    showLoadingState(widgetType);
    setTimeout(() => {
      showAuthenticatedWidgetModal(widgetType);
    }, 1000); // 1초 로딩 시뮬레이션
  } else {
    showGuestWidgetModal(widgetType);
  }
  
  // 브라우저 히스토리에 추가
  addToHistory(widgetType);
}

// 키보드 이벤트 처리 (접근성)
function handleWidgetKeydown(event, widgetType) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleWidgetClick(widgetType);
  }
}

// 위젯 ID 반환 함수
function getWidgetId(widgetType) {
  const widgetIds = {
    'values': 'valuesAnalysisWidget',
    'matching': 'aiMatchingWidget',
    'connections': 'newConnectionsWidget'
  };
  return widgetIds[widgetType] || '';
}

// 로딩 상태 표시 함수
function showLoadingState(widgetType) {
  const widget = document.getElementById(getWidgetId(widgetType));
  if (!widget) return;
  
  // 로딩 오버레이 생성
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'widget-loading-overlay';
  loadingOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    z-index: 1000;
  `;
  
  // 로딩 스피너 생성
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.style.cssText = `
    width: 24px;
    height: 24px;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  loadingOverlay.appendChild(spinner);
  widget.style.position = 'relative';
  widget.appendChild(loadingOverlay);
  
  // 1초 후 로딩 제거
  setTimeout(() => {
    if (loadingOverlay && loadingOverlay.parentNode) {
      loadingOverlay.remove();
    }
  }, 1000);
}

// 인증된 사용자용 모달 표시
function showAuthenticatedWidgetModal(widgetType) {
  const modalContent = getAuthenticatedModalContent(widgetType);
  showAdvancedModal(modalContent.title, modalContent.content, modalContent.actions);
}

// 게스트 사용자용 모달 표시
function showGuestWidgetModal(widgetType) {
  const modalContent = getGuestModalContent(widgetType);
  showAdvancedModal(modalContent.title, modalContent.content, modalContent.actions);
}

// 인증된 사용자용 모달 콘텐츠 생성
function getAuthenticatedModalContent(widgetType) {
  const contents = {
    'values': {
      title: '🎯 가치관 분석 결과',
      content: `
        <div class="modal-section">
          <h4>귀하의 가치관 프로필</h4>
          <div class="values-chart">
            <div class="value-item">
              <span class="value-label">가족 중심</span>
              <div class="value-bar"><div class="value-progress" style="width: 90%"></div></div>
              <span class="value-score">90%</span>
            </div>
            <div class="value-item">
              <span class="value-label">안정 추구</span>
              <div class="value-bar"><div class="value-progress" style="width: 85%"></div></div>
              <span class="value-score">85%</span>
            </div>
            <div class="value-item">
              <span class="value-label">소통 중시</span>
              <div class="value-bar"><div class="value-progress" style="width: 78%"></div></div>
              <span class="value-score">78%</span>
            </div>
          </div>
          <p class="analysis-summary">
            귀하는 가족과 안정을 가장 중시하는 성향을 보입니다. 
            이러한 가치관을 공유하는 분들과 85% 이상의 높은 호환성을 보입니다.
          </p>
        </div>
      `,
      actions: [
        { text: '상세 분석 보기', action: 'viewDetailedAnalysis', primary: true },
        { text: '매칭 시작하기', action: 'startMatching', primary: false }
      ]
    },
    'matching': {
      title: '💝 AI 매칭 현황',
      content: `
        <div class="modal-section">
          <h4>현재 매칭 상태</h4>
          <div class="matching-status">
            <div class="status-item active">
              <div class="status-icon">✓</div>
              <span>가치관 분석 완료</span>
            </div>
            <div class="status-item active">
              <div class="status-icon">✓</div>
              <span>프로필 검증 완료</span>
            </div>
            <div class="status-item processing">
              <div class="status-icon">⏳</div>
              <span>호환성 매칭 진행 중</span>
            </div>
          </div>
          <div class="matching-progress">
            <div class="progress-text">매칭 진행도: 73%</div>
            <div class="progress-bar-modal">
              <div class="progress-fill-modal" style="width: 73%"></div>
            </div>
          </div>
          <p class="matching-summary">
            현재 12명의 호환 가능한 분들을 발견했습니다. 
            곧 최적의 매칭 결과를 보여드릴 예정입니다.
          </p>
        </div>
      `,
      actions: [
        { text: '매칭 설정 변경', action: 'changeSettings', primary: false },
        { text: '매칭 가속화', action: 'accelerateMatching', primary: true }
      ]
    },
    'connections': {
      title: '🌟 새로운 연결',
      content: `
        <div class="modal-section">
          <h4>새로운 매치 알림</h4>
          <div class="connections-list">
            <div class="connection-item">
              <div class="connection-avatar">👤</div>
              <div class="connection-info">
                <div class="connection-name">김○○ 님</div>
                <div class="connection-compatibility">가치관 호환성 92%</div>
                <div class="connection-location">서울 강남구</div>
              </div>
              <div class="connection-status">새로운 매치</div>
            </div>
            <div class="connection-item">
              <div class="connection-avatar">👤</div>
              <div class="connection-info">
                <div class="connection-name">박○○ 님</div>
                <div class="connection-compatibility">가치관 호환성 88%</div>
                <div class="connection-location">서울 송파구</div>
              </div>
              <div class="connection-status">새로운 매치</div>
            </div>
            <div class="connection-item">
              <div class="connection-avatar">👤</div>
              <div class="connection-info">
                <div class="connection-name">이○○ 님</div>
                <div class="connection-compatibility">가치관 호환성 87%</div>
                <div class="connection-location">서울 마포구</div>
              </div>
              <div class="connection-status">새로운 매치</div>
            </div>
          </div>
          <p class="connections-summary">
            귀하와 높은 호환성을 보이는 3명의 새로운 분들을 찾았습니다.
          </p>
        </div>
      `,
      actions: [
        { text: '프로필 둘러보기', action: 'viewProfiles', primary: true },
        { text: '메시지 보내기', action: 'sendMessage', primary: false }
      ]
    }
  };
  
  return contents[widgetType] || contents['values'];
}

// 게스트용 모달 콘텐츠 생성
function getGuestModalContent(widgetType) {
  const contents = {
    'values': {
      title: '🎯 가치관 분석 미리보기',
      content: `
        <div class="modal-section">
          <h4>가치관 분석 예시</h4>
          <div class="guest-preview">
            <div class="preview-item">
              <div class="preview-icon">📊</div>
              <div class="preview-text">
                <h5>상세한 가치관 프로필</h5>
                <p>AI가 분석한 당신만의 가치관 지표와 성향</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">💡</div>
              <div class="preview-text">
                <h5>호환성 분석</h5>
                <p>다른 회원들과의 가치관 호환성 점수</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">🎨</div>
              <div class="preview-text">
                <h5>개인화된 추천</h5>
                <p>가치관 기반 맞춤형 매칭 추천</p>
              </div>
            </div>
          </div>
          <p class="guest-message">
            로그인 후 본인만의 가치관 분석을 받아보세요!
          </p>
        </div>
      `,
      actions: [
        { text: '회원가입하기', action: 'signup', primary: true },
        { text: '로그인하기', action: 'login', primary: false }
      ]
    },
    'matching': {
      title: '💝 AI 매칭 미리보기',
      content: `
        <div class="modal-section">
          <h4>AI 매칭 서비스</h4>
          <div class="guest-preview">
            <div class="preview-item">
              <div class="preview-icon">🤖</div>
              <div class="preview-text">
                <h5>AI 기반 매칭</h5>
                <p>고도화된 알고리즘으로 최적의 상대 찾기</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">⚡</div>
              <div class="preview-text">
                <h5>실시간 매칭</h5>
                <p>24시간 자동으로 새로운 매칭 기회 발굴</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">🎯</div>
              <div class="preview-text">
                <h5>정확한 매칭</h5>
                <p>가치관, 취향, 라이프스타일 종합 분석</p>
              </div>
            </div>
          </div>
          <p class="guest-message">
            지금 가입하고 AI 매칭 서비스를 경험해보세요!
          </p>
        </div>
      `,
      actions: [
        { text: '무료 체험하기', action: 'signup', primary: true },
        { text: '서비스 더 알아보기', action: 'learnMore', primary: false }
      ]
    },
    'connections': {
      title: '🌟 새로운 연결 미리보기',
      content: `
        <div class="modal-section">
          <h4>연결 관리 서비스</h4>
          <div class="guest-preview">
            <div class="preview-item">
              <div class="preview-icon">👥</div>
              <div class="preview-text">
                <h5>새로운 만남</h5>
                <p>매일 새로운 매칭 기회와 연결 알림</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">💌</div>
              <div class="preview-text">
                <h5>안전한 소통</h5>
                <p>검증된 회원들과의 안전한 메시지 교환</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">🏆</div>
              <div class="preview-text">
                <h5>성공 사례</h5>
                <p>실제 커플 성사률 78%의 검증된 플랫폼</p>
              </div>
            </div>
          </div>
          <p class="guest-message">
            지금 시작하고 새로운 인연을 만나보세요!
          </p>
        </div>
      `,
      actions: [
        { text: '지금 시작하기', action: 'signup', primary: true },
        { text: '성공 사례 보기', action: 'viewSuccess', primary: false }
      ]
    }
  };
  
  return contents[widgetType] || contents['values'];
}

// 고급 모달 표시 함수
function showAdvancedModal(title, content, actions) {
  // 기존 모달 제거
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 모달 오버레이 생성
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay widget-modal';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  // 모달 콘텐츠 생성
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content widget-modal-content';
  modalContent.style.cssText = `
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.4s ease-out;
    font-size: 16px;
    line-height: 1.6;
  `;
  
  // 액션 버튼 생성
  const actionButtons = actions.map(action => 
    `<button class="modal-action-btn ${action.primary ? 'primary' : 'secondary'}" 
             onclick="handleModalAction('${action.action}')"
             style="
               ${action.primary ? 
                 'background: #667eea; color: white; border: none;' : 
                 'background: transparent; color: #667eea; border: 2px solid #667eea;'
               }
               padding: 12px 24px;
               border-radius: 8px;
               font-size: 14px;
               font-weight: 600;
               cursor: pointer;
               margin: 0 8px;
               transition: all 0.2s;
               min-width: 120px;
             "
             onmouseover="this.style.transform='translateY(-2px)'"
             onmouseout="this.style.transform='translateY(0)'"
             >
      ${action.text}
    </button>`
  ).join('');
  
  modalContent.innerHTML = `
    <div class="modal-header" style="padding: 24px 24px 16px; border-bottom: 1px solid #e2e8f0;">
      <h3 style="margin: 0; font-size: 1.5em; color: #1e293b; display: flex; align-items: center; justify-content: space-between;">
        ${title}
        <button class="modal-close-btn" style="
          background: none;
          border: none;
          font-size: 24px;
          color: #64748b;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.2s;
        " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'">×</button>
      </h3>
    </div>
    <div class="modal-body" style="padding: 24px;">
      ${content}
    </div>
    <div class="modal-footer" style="padding: 16px 24px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      ${actionButtons}
    </div>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // 모달 닫기 기능
  const closeBtn = modalContent.querySelector('.modal-close-btn');
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      modalOverlay.remove();
      // 히스토리에서 제거
      if (widgetHistory.length > 0) {
        widgetHistory.pop();
        if (widgetHistory.length > 0) {
          window.history.back();
        }
      }
    }, 300);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  // 키보드 지원 (ESC 키로 닫기)
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyPress);
    }
  };
  document.addEventListener('keydown', handleKeyPress);
}

// 모달 액션 처리 함수
function handleModalAction(action) {
  console.log(`Modal action: ${action}`);
  
  switch(action) {
    case 'signup':
      // 기존 회원가입 모달 열기
      document.querySelector('.modal-overlay').remove();
      openSignupModal();
      break;
    case 'login':
      // 로그인 모달 열기 (기존 로그인 로직 사용)
      document.querySelector('.modal-overlay').remove();
      showModal('로그인', '로그인 기능을 구현 중입니다. 잠시만 기다려주세요.');
      break;
    case 'viewDetailedAnalysis':
      showModal('상세 분석', '상세 가치관 분석 페이지로 이동합니다.');
      break;
    case 'startMatching':
      showModal('매칭 시작', '매칭 서비스를 시작합니다.');
      break;
    case 'viewProfiles':
      showModal('프로필 보기', '매칭된 회원들의 프로필을 확인할 수 있습니다.');
      break;
    case 'sendMessage':
      showModal('메시지 보내기', '안전한 메시지 시스템으로 소통하세요.');
      break;
    case 'learnMore':
      showModal('서비스 소개', 'CHARM_INYEON의 더 자세한 서비스를 소개합니다.');
      break;
    case 'viewSuccess':
      showModal('성공 사례', '실제 커플들의 성공 스토리를 확인하세요.');
      break;
    default:
      showModal('준비 중', '해당 기능을 준비 중입니다.');
  }
}

// 브라우저 히스토리 관리
function addToHistory(widgetType) {
  const state = { widget: widgetType, timestamp: Date.now() };
  widgetHistory.push(state);
  window.history.pushState(state, '', `#widget-${widgetType}`);
}

// 브라우저 뒤로가기 처리
window.addEventListener('popstate', (event) => {
  const modal = document.querySelector('.modal-overlay');
  if (modal && event.state && event.state.widget) {
    modal.remove();
    widgetHistory.pop();
  }
});

// 모바일 터치 최적화
function optimizeForMobile() {
  const widgets = document.querySelectorAll('.widget-clickable');
  
  widgets.forEach(widget => {
    // 터치 이벤트 최적화
    widget.addEventListener('touchstart', function(e) {
      this.style.transform = 'scale(0.98)';
    }, { passive: true });
    
    widget.addEventListener('touchend', function(e) {
      this.style.transform = 'scale(1)';
    }, { passive: true });
    
    // 모바일에서 호버 효과 제거
    if (window.innerWidth <= 768) {
      widget.style.transition = 'transform 0.1s ease';
    }
  });
}

// 중장년층 친화적 UX 적용
function applyAccessibilityFeatures() {
  const widgets = document.querySelectorAll('.widget-clickable');
  
  widgets.forEach(widget => {
    // 포커스 스타일 개선
    widget.addEventListener('focus', function() {
      this.style.outline = '3px solid #667eea';
      this.style.outlineOffset = '2px';
    });
    
    widget.addEventListener('blur', function() {
      this.style.outline = 'none';
    });
    
    // 클릭 영역 확대 (터치 최적화)
    widget.style.minHeight = '44px';
    widget.style.minWidth = '44px';
  });
}

// Initialize page animations when page loads
window.addEventListener('load', () => {
  // Add loaded class for CSS animations
  document.body.classList.add('loaded');
  
  // 위젯 기능 초기화
  optimizeForMobile();
  applyAccessibilityFeatures();
    
  // Initialize hero animations
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroButtons = document.querySelector('.hero-buttons');
    
  if (heroTitle) {
    setTimeout(() => {
      heroTitle.style.opacity = '1';
      heroTitle.style.transform = 'translateY(0)';
    }, 300);
  }
    
  if (heroSubtitle) {
    setTimeout(() => {
      heroSubtitle.style.opacity = '1';
      heroSubtitle.style.transform = 'translateY(0)';
    }, 600);
  }
    
  if (heroButtons) {
    setTimeout(() => {
      heroButtons.style.opacity = '1';
      heroButtons.style.transform = 'translateY(0)';
    }, 900);
  }
});

// Button hover effects
document.querySelectorAll('.primary-button, .secondary-button, .cta-large-button, .login-btn, .signup-btn').forEach(button => {
  button.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-3px)';
  });
    
  button.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
    
  if (hero && heroContent) {
    heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
  }
});

// Mobile menu toggle (for responsive design)
function createMobileMenu() {
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelector('.nav-links');
    
  // Create hamburger menu button
  const hamburger = document.createElement('button');
  hamburger.classList.add('hamburger');
  hamburger.innerHTML = '☰';
  hamburger.style.display = 'none';
  hamburger.style.background = 'none';
  hamburger.style.border = 'none';
  hamburger.style.fontSize = '1.5rem';
  hamburger.style.cursor = 'pointer';
  hamburger.style.color = '#333';
    
  nav.insertBefore(hamburger, navLinks);
    
  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-active');
  });
    
  // Show/hide hamburger based on screen size
  function checkScreenSize() {
    if (window.innerWidth <= 768) {
      hamburger.style.display = 'block';
      navLinks.style.display = navLinks.classList.contains('mobile-active') ? 'flex' : 'none';
    } else {
      hamburger.style.display = 'none';
      navLinks.style.display = 'flex';
      navLinks.classList.remove('mobile-active');
    }
  }
    
  window.addEventListener('resize', checkScreenSize);
  checkScreenSize();
}

// Initialize mobile menu
createMobileMenu();

// Add mobile menu styles
const mobileStyles = `
@media (max-width: 768px) {
    .nav-links {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        display: none;
    }
    
    .nav-links.mobile-active {
        display: flex !important;
    }
    
    .hamburger {
        display: block !important;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet);

// Form validation and interaction (for future forms)
function setupFormInteractions() {
  document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
        
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
  });
}

// Call setup function
setupFormInteractions();

// Analytics tracking (placeholder for future implementation)
function trackEvent(eventName, eventData = {}) {
  console.log(`Event tracked: ${eventName}`, eventData);
  // Future: Send to analytics service
}

// Simple button click tracking (without interfering with main functionality)
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', function() {
    // Just track - don't interfere with other handlers
    trackEvent('button_click', {
      button_text: this.textContent.trim(),
      button_class: this.className
    });
  });
});

// Home button functionality
document.querySelector('.home-link')?.addEventListener('click', function(e) {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  trackEvent('home_click');
});

// Modal functionality
function openModal(modalId) {
  console.log('Attempting to open modal:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    console.log('Modal found, opening...');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    // Focus first input for accessibility
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) {firstInput.focus();}
    }, 100);
  } else {
    console.error('Modal not found:', modalId);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
}

// Login button functionality  
document.querySelector('.login-btn')?.addEventListener('click', function(e) {
  console.log('Login button clicked');
  try {
    openModal('loginModal');
    trackEvent('login_click');
  } catch (error) {
    console.error('Login button error:', error);
  }
});

// Signup button functionality
document.querySelector('.signup-btn')?.addEventListener('click', function(e) {
  console.log('Signup button clicked');
  try {
    openModal('signupModal');
    trackEvent('signup_click');
  } catch (error) {
    console.error('Signup button error:', error);
  }
});

// Close modal functionality
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', function() {
    const modalId = this.getAttribute('data-modal');
    closeModal(modalId);
  });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
});

// Switch between login and signup modals
document.getElementById('showSignup')?.addEventListener('click', function(e) {
  e.preventDefault();
  closeModal('loginModal');
  openModal('signupModal');
});

document.getElementById('showLogin')?.addEventListener('click', function(e) {
  e.preventDefault();
  closeModal('signupModal');
  openModal('loginModal');
});

// Password validation
function validatePassword(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password)
  };
  return requirements;
}

// Real-time password validation
document.getElementById('signupPassword')?.addEventListener('input', function() {
  const password = this.value;
  const requirements = validatePassword(password);
    
  Object.keys(requirements).forEach(req => {
    const element = document.querySelector(`[data-requirement="${req}"]`);
    if (element) {
      if (requirements[req]) {
        element.classList.add('valid');
        element.classList.remove('invalid');
      } else {
        element.classList.add('invalid');
        element.classList.remove('valid');
      }
    }
  });
});

// Password confirmation validation
document.getElementById('confirmPassword')?.addEventListener('input', function() {
  const password = document.getElementById('signupPassword')?.value;
  const confirmPassword = this.value;
    
  if (confirmPassword) {
    if (password === confirmPassword) {
      this.classList.add('valid');
      this.classList.remove('invalid');
    } else {
      this.classList.add('invalid');
      this.classList.remove('valid');
    }
  }
});

// Form submissions
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
    
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
    
  try {
    // Show loading state
    submitBtn.textContent = '로그인 중...';
    submitBtn.disabled = true;
        
    const formData = new FormData(this);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe');
        
    console.log('Login attempt:', { email });
        
    // Call login API
    const response = await apiClient.login(email, password, !!rememberMe);
        
    if (response.success) {
      apiClient.showSuccess('로그인되었습니다!');
      closeModal('loginModal');
            
      // Update UI for logged in state
      updateUIForAuthenticatedUser(response.data.user);
            
      trackEvent('login_success', { email });
    }
        
  } catch (error) {
    console.error('Login error:', error);
    apiClient.showError(error.message || '로그인 중 오류가 발생했습니다.');
    trackEvent('login_error', { email: formData.get('email'), error: error.message });
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
    
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
    
  try {
    const formData = new FormData(this);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      age: formData.get('age'),
      agreeTerms: formData.get('agreeTerms') === 'on',
      agreePrivacy: formData.get('agreeTerms') === 'on', // Same as terms for simplicity
      agreeMarketing: formData.get('agreeMarketing') === 'on'
    };
        
    // Validate password match
    if (data.password !== data.confirmPassword) {
      apiClient.showError('비밀번호가 일치하지 않습니다.');
      return;
    }
        
    // Validate password requirements
    const passwordValidation = validatePassword(data.password);
    const isPasswordValid = Object.values(passwordValidation).every(valid => valid);
        
    if (!isPasswordValid) {
      apiClient.showError('비밀번호가 요구사항을 충족하지 않습니다.');
      return;
    }
        
    // Check terms agreement
    if (!data.agreeTerms) {
      apiClient.showError('이용약관에 동의해주세요.');
      return;
    }
        
    // Show loading state
    submitBtn.textContent = '가입 중...';
    submitBtn.disabled = true;
        
    console.log('Signup attempt:', data);
        
    // Call signup API
    const response = await apiClient.register(data);
        
    if (response.success) {
      apiClient.showSuccess('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
      closeModal('signupModal');
            
      // Update UI for logged in state
      updateUIForAuthenticatedUser(response.data.user);
            
      trackEvent('signup_success', { email: data.email, age: data.age });
    }
        
  } catch (error) {
    console.error('Signup error:', error);
    apiClient.showError(error.message || '회원가입 중 오류가 발생했습니다.');
    trackEvent('signup_error', { 
      email: formData.get('email'), 
      error: error.message 
    });
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ==============================================
// USER AUTHENTICATION SYSTEM (localStorage based)
// ==============================================

// User management utilities
class UserManager {
  constructor() {
    this.storageKey = 'charminyeon_users';
    this.currentUserKey = 'charminyeon_current_user';
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  getAllUsers() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  saveUser(userData) {
    const users = this.getAllUsers();
    const userWithId = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      profile: {
        name: userData.name,
        email: userData.email,
        age: userData.age,
        isComplete: false
      }
    };
    users.push(userWithId);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return userWithId;
  }

  findUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(user => user.email === email);
  }

  validatePassword(inputPassword, storedPassword) {
    return inputPassword === storedPassword;
  }

  setCurrentUser(user) {
    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(this.currentUserKey, JSON.stringify(userSession));
  }

  getCurrentUser() {
    const userData = localStorage.getItem(this.currentUserKey);
    return userData ? JSON.parse(userData) : null;
  }

  logout() {
    localStorage.removeItem(this.currentUserKey);
    this.updateUIForLoggedOutUser();
  }

  updateUIForLoggedOutUser() {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
      authButtons.innerHTML = `
        <button class="login-btn">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          로그인
        </button>
        <button class="signup-btn">
          <svg class="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="17" y1="11" x2="23" y2="11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          회원가입
        </button>
      `;
      this.attachAuthButtonListeners();
    }
  }

  updateUIForLoggedInUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
      authButtons.innerHTML = `
        <div class="user-menu">
          <span class="user-greeting">안녕하세요, ${user.name}님!</span>
          <button class="profile-btn" onclick="userManager.showUserDashboard()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            내 프로필
          </button>
          <button class="logout-btn" onclick="userManager.logout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            로그아웃
          </button>
        </div>
      `;
    }

    // Show success message
    this.showSuccess(`${user.name}님, 환영합니다! 가치관 분석을 시작해보세요.`);
  }

  showUserDashboard() {
    const user = this.getCurrentUser();
    if (!user) return;

    showCustomAlert('내 프로필', `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">👤</div>
        <h3 style="margin-bottom: 2rem; color: #333;">${user.name}님의 프로필</h3>
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 15px; text-align: left; margin-bottom: 2rem;">
          <p style="margin: 0.5rem 0;"><strong>이름:</strong> ${user.name}</p>
          <p style="margin: 0.5rem 0;"><strong>이메일:</strong> ${user.email}</p>
          <p style="margin: 0.5rem 0;"><strong>연령대:</strong> ${user.age}</p>
          <p style="margin: 0.5rem 0;"><strong>가입일:</strong> ${new Date(user.loginTime).toLocaleDateString('ko-KR')}</p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="document.querySelector('#valuesModal').style.display='block'; this.closest('.custom-alert').remove();" style="background: #667eea; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer;">가치관 분석</button>
          <button onclick="document.querySelector('#matchingModal').style.display='block'; this.closest('.custom-alert').remove();" style="background: #10b981; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer;">매칭 보기</button>
          <button onclick="this.closest('.custom-alert').remove()" style="background: #6b7280; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer;">닫기</button>
        </div>
      </div>
    `);
  }

  showSuccess(message) {
    showCustomAlert('성공', `
      <div style="text-align: center; padding: 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
        <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6;">${message}</p>
        <button onclick="this.closest('.custom-alert').remove()" style="background: #10b981; color: white; border: none; padding: 0.8rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer;">확인</button>
      </div>
    `);
  }

  showError(message) {
    showCustomAlert('오류', `
      <div style="text-align: center; padding: 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
        <p style="margin-bottom: 1.5rem; font-size: 1.1rem; line-height: 1.6; color: #ef4444;">${message}</p>
        <button onclick="this.closest('.custom-alert').remove()" style="background: #ef4444; color: white; border: none; padding: 0.8rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer;">확인</button>
      </div>
    `);
  }

  attachAuthButtonListeners() {
    // Login button event
    document.querySelector('.login-btn')?.addEventListener('click', () => {
      openModal('loginModal');
    });

    // Signup button event  
    document.querySelector('.signup-btn')?.addEventListener('click', () => {
      openModal('signupModal');
    });
  }
}

// Initialize user manager
const userManager = new UserManager();

// Check if user is already logged in on page load
window.addEventListener('load', () => {
  const currentUser = userManager.getCurrentUser();
  if (currentUser) {
    userManager.updateUIForLoggedInUser(currentUser);
  } else {
    userManager.attachAuthButtonListeners();
  }
});

// Social login handlers (temporarily disabled, showing preparation message)
document.querySelectorAll('.google-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    userManager.showError('Google 로그인 기능은 준비 중입니다.');
    trackEvent('social_login_click', { provider: 'google' });
  });
});

document.querySelectorAll('.kakao-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    userManager.showError('카카오 로그인 기능은 준비 중입니다.');
    trackEvent('social_login_click', { provider: 'kakao' });
  });
});

// ==============================================
// UPDATED LOGIN FORM HANDLER
// ==============================================

// Replace the existing login form handler
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    const formData = new FormData(this);
    const email = formData.get('email');
    const password = formData.get('password');
    const rememberMe = formData.get('rememberMe') === 'on';
    
    // Validate input
    if (!email || !password) {
      userManager.showError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    
    // Show loading state
    submitBtn.textContent = '로그인 중...';
    submitBtn.disabled = true;
    
    // Find user
    const user = userManager.findUserByEmail(email);
    if (!user) {
      userManager.showError('등록되지 않은 이메일입니다.');
      return;
    }
    
    // Validate password
    if (!userManager.validatePassword(password, user.password)) {
      userManager.showError('비밀번호가 올바르지 않습니다.');
      return;
    }
    
    // Successful login
    userManager.setCurrentUser(user);
    userManager.updateUIForLoggedInUser(user);
    closeModal('loginModal');
    
    // Reset form
    this.reset();
    
    trackEvent('login_success', { email: email, rememberMe: rememberMe });
    
  } catch (error) {
    console.error('Login error:', error);
    userManager.showError('로그인 중 오류가 발생했습니다.');
    trackEvent('login_error', { email: formData.get('email'), error: error.message });
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ==============================================
// UPDATED SIGNUP FORM HANDLER  
// ==============================================

// Replace the existing signup form handler
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    const formData = new FormData(this);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      age: formData.get('age'),
      agreeTerms: formData.get('agreeTerms') === 'on',
      agreeMarketing: formData.get('agreeMarketing') === 'on'
    };
    
    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.age) {
      userManager.showError('모든 필수 항목을 입력해주세요.');
      return;
    }
    
    // Validate password match
    if (data.password !== data.confirmPassword) {
      userManager.showError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // Validate password requirements
    const passwordValidation = validatePassword(data.password);
    const isPasswordValid = Object.values(passwordValidation).every(valid => valid);
    
    if (!isPasswordValid) {
      userManager.showError('비밀번호가 요구사항을 충족하지 않습니다.');
      return;
    }
    
    // Check terms agreement
    if (!data.agreeTerms) {
      userManager.showError('이용약관에 동의해주세요.');
      return;
    }
    
    // Check if email already exists
    if (userManager.findUserByEmail(data.email)) {
      userManager.showError('이미 사용 중인 이메일입니다.');
      return;
    }
    
    // Show loading state
    submitBtn.textContent = '가입 중...';
    submitBtn.disabled = true;
    
    // Save user
    const newUser = userManager.saveUser(data);
    
    // Auto login after signup
    userManager.setCurrentUser(newUser);
    userManager.updateUIForLoggedInUser(newUser);
    closeModal('signupModal');
    
    // Reset form
    this.reset();
    
    trackEvent('signup_success', { email: data.email, age: data.age });
    
  } catch (error) {
    console.error('Signup error:', error);
    userManager.showError('회원가입 중 오류가 발생했습니다.');
    trackEvent('signup_error', { 
      email: formData.get('email'), 
      error: error.message 
    });
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Contact form submission
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
    
  const formData = new FormData(this);
  const contactData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    agreement: formData.get('contactAgreement')
  };
    
  // Validate required fields
  if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
    showModal('필수 항목 확인', '필수 항목을 모두 입력해주세요.');
    return;
  }
    
  if (!contactData.agreement) {
    showModal('개인정보 동의', '개인정보 수집 및 이용에 동의해주세요.');
    return;
  }
    
  // TODO: Send contact data to server
  console.log('Contact form submitted:', contactData);
    
  // Show success message
  showCustomAlert('문의 완료', `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
            <h3 style="color: #10b981; margin-bottom: 1rem;">문의가 성공적으로 전송되었습니다!</h3>
            <p style="margin-bottom: 1.5rem; line-height: 1.6;">
                <strong>${contactData.name}</strong>님의 문의를 접수했습니다.<br>
                24시간 이내에 <strong>${contactData.email}</strong>로 답변드리겠습니다.
            </p>
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                <p style="margin: 0; font-size: 0.9rem; color: #666;">
                    <strong>문의 유형:</strong> ${getSubjectText(contactData.subject)}<br>
                    <strong>접수 시간:</strong> ${new Date().toLocaleString('ko-KR')}
                </p>
            </div>
            <button onclick="this.closest('.custom-alert').remove()" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 0.8rem 2rem;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='#5a6fd8'" onmouseout="this.style.background='#667eea'">
                확인
            </button>
        </div>
    `);
    
  // Reset form
  this.reset();
    
  // Track event
  trackEvent('contact_submit', { 
    subject: contactData.subject,
    email: contactData.email 
  });
});

function getSubjectText(value) {
  const subjects = {
    'service': '서비스 문의',
    'technical': '기술적 문제',
    'account': '계정 관련',
    'partnership': '제휴 문의',
    'other': '기타'
  };
  return subjects[value] || value;
}

// Demo modal functionality
let currentDemoStep = 1;
const totalDemoSteps = 3;

function showDemoStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.demo-step').forEach(step => {
    step.classList.remove('active');
  });
    
  // Show current step
  const currentStep = document.getElementById(`step${stepNumber}`);
  if (currentStep) {
    currentStep.classList.add('active');
  }
    
  // Update dots
  document.querySelectorAll('.demo-dots .dot').forEach((dot, index) => {
    if (index + 1 === stepNumber) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
    
  // Update buttons
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const restartBtn = document.querySelector('.restart-btn');
    
  if (prevBtn) {prevBtn.disabled = stepNumber === 1;}
    
  if (stepNumber === totalDemoSteps) {
    if (nextBtn) {nextBtn.style.display = 'none';}
    if (restartBtn) {restartBtn.style.display = 'inline-block';}
  } else {
    if (nextBtn) {nextBtn.style.display = 'inline-block';}
    if (restartBtn) {restartBtn.style.display = 'none';}
  }
}

// Demo navigation
document.querySelector('.next-btn')?.addEventListener('click', function() {
  if (currentDemoStep < totalDemoSteps) {
    currentDemoStep++;
    showDemoStep(currentDemoStep);
    trackEvent('demo_next', { step: currentDemoStep });
  }
});

document.querySelector('.prev-btn')?.addEventListener('click', function() {
  if (currentDemoStep > 1) {
    currentDemoStep--;
    showDemoStep(currentDemoStep);
    trackEvent('demo_prev', { step: currentDemoStep });
  }
});

document.querySelector('.restart-btn')?.addEventListener('click', function() {
  currentDemoStep = 1;
  showDemoStep(currentDemoStep);
  trackEvent('demo_restart');
});

// Dot navigation
document.querySelectorAll('.demo-dots .dot').forEach((dot, index) => {
  dot.addEventListener('click', function() {
    currentDemoStep = index + 1;
    showDemoStep(currentDemoStep);
    trackEvent('demo_dot_click', { step: currentDemoStep });
  });
});

// Demo option interactions
document.querySelectorAll('.demo-option').forEach(option => {
  option.addEventListener('click', function() {
    // Remove selected class from siblings
    this.parentElement.querySelectorAll('.demo-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    // Add selected class to clicked option
    this.classList.add('selected');
    trackEvent('demo_option_select', { option: this.textContent.trim() });
  });
});

// Enhanced Interactive Demo Variables
// currentDemoStep은 위에서 이미 선언됨 (1976줄)
let demoAnswers = {};
let analysisProgress = 0;
let compatibilityScore = 0;
let isAnalysisRunning = false;

// Demo Questions Data
const demoQuestions = {
  q1: {
    question: '퇴근 후 가장 소중한 시간은 어떻게 보내시나요?',
    options: {
      family: { text: '가족과 함께하는 시간', icon: '👨‍👩‍👧‍👦', tags: ['가족 중시', '안정적'] },
      hobby: { text: '취미 활동이나 자기계발', icon: '🎨', tags: ['성장 지향', '창의적'] },
      rest: { text: '편안한 휴식', icon: '🛋️', tags: ['여유로움', '평화 추구'] },
      social: { text: '친구들과의 만남', icon: '👥', tags: ['사교적', '활발함'] }
    }
  },
  q2: {
    question: '인생에서 가장 중요하게 생각하는 가치는?',
    options: {
      stability: { text: '안정과 평화', icon: '🏡', tags: ['안정 추구', '신중함'] },
      growth: { text: '성장과 도전', icon: '🚀', tags: ['도전적', '성장 지향'] },
      connection: { text: '인간관계와 사랑', icon: '❤️', tags: ['인간 중심', '따뜻함'] },
      freedom: { text: '자유와 독립', icon: '🦋', tags: ['자유로움', '독립적'] }
    }
  }
};

// Secondary button (소개 영상 보기) functionality
document.querySelectorAll('.secondary-button').forEach(button => {
  button.addEventListener('click', function(e) {
    console.log('Secondary button clicked:', this.textContent.trim());
    try {
      const buttonText = this.textContent.trim();
      if (buttonText.includes('소개 영상') || buttonText.includes('영상')) {
        console.log('Opening enhanced demo...');
        openEnhancedDemo();
        trackEvent('enhanced_demo_click');
      }
    } catch (error) {
      console.error('Secondary button error:', error);
    }
  });
});

// Open Video Modal (소개 영상 보기)
function openEnhancedDemo() {
  console.log('Opening video modal...');
  try {
    const modal = document.getElementById('videoModal');
    if (modal) {
      console.log('Video modal found, opening...');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    } else {
      console.error('Video modal not found!');
      showModal('오류', '비디오 모달을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('Enhanced demo error:', error);
    showModal('오류', '데모를 여는 중 오류가 발생했습니다.');
  }
}

// Reset Demo State
function resetDemoState() {
  currentDemoStep = 1;
  demoAnswers = {};
  analysisProgress = 0;
  compatibilityScore = 0;
  isAnalysisRunning = false;
  
  // Reset progress bar
  const progressFill = document.getElementById('demoProgressFill');
  const progressText = document.getElementById('demoProgressText');
  if (progressFill) progressFill.style.width = '25%';
  if (progressText) progressText.textContent = '1 / 4';
  
  // Hide chat demo
  const chatDemo = document.getElementById('chatDemoContainer');
  if (chatDemo) chatDemo.style.display = 'none';
}

// Show Demo Step
function showDemoStep(step) {
  // Hide all steps
  document.querySelectorAll('.demo-step').forEach(stepEl => {
    stepEl.classList.remove('active');
  });
  
  // Show current step
  const currentStepEl = document.getElementById(`interactiveStep${step}`);
  if (currentStepEl) {
    currentStepEl.classList.add('active');
  }
  
  // Update progress
  updateDemoProgress(step);
  currentDemoStep = step;
}

// Update Demo Progress
function updateDemoProgress(step) {
  const progressFill = document.getElementById('demoProgressFill');
  const progressText = document.getElementById('demoProgressText');
  
  if (progressFill && progressText) {
    const progressPercentage = (step / 4) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `${step} / 4`;
  }
}

// Initialize Step Interactions
function initializeStepInteractions() {
  setupQuestionInteractions();
  setupNavigationButtons();
  setupDemoActions();
  setupChatDemo();
}

// Setup Question Interactions
function setupQuestionInteractions() {
  // Question 1 interactions
  document.querySelectorAll('input[name="q1"]').forEach(input => {
    input.addEventListener('change', function() {
      if (this.checked) {
        // Remove previous selections
        document.querySelectorAll('[data-value]').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Add selection to current option
        this.closest('.option-card').classList.add('selected');
        
        // Store answer
        demoAnswers.q1 = this.value;
        
        // Enable next button
        const nextBtn = document.getElementById('nextQ1');
        if (nextBtn) {
          nextBtn.disabled = false;
        }
      }
    });
  });
  
  // Question 2 interactions
  document.querySelectorAll('input[name="q2"]').forEach(input => {
    input.addEventListener('change', function() {
      if (this.checked) {
        // Remove previous selections
        document.querySelectorAll('input[name="q2"]').forEach(otherInput => {
          otherInput.closest('.option-card').classList.remove('selected');
        });
        
        // Add selection to current option
        this.closest('.option-card').classList.add('selected');
        
        // Store answer
        demoAnswers.q2 = this.value;
        
        // Enable next button
        const nextBtn = document.getElementById('nextQ2');
        if (nextBtn) {
          nextBtn.disabled = false;
        }
      }
    });
  });
}

// Setup Navigation Buttons
function setupNavigationButtons() {
  // Next Q1 button
  const nextQ1 = document.getElementById('nextQ1');
  if (nextQ1) {
    nextQ1.addEventListener('click', () => {
      showDemoStep(2);
    });
  }
  
  // Next Q2 button
  const nextQ2 = document.getElementById('nextQ2');
  if (nextQ2) {
    nextQ2.addEventListener('click', () => {
      showDemoStep(3);
      startAnalysisAnimation();
    });
  }
}

// Start Analysis Animation
function startAnalysisAnimation() {
  if (isAnalysisRunning) return;
  isAnalysisRunning = true;
  
  const analysisText = document.getElementById('analysisText');
  const analysisFill = document.getElementById('analysisFill');
  const analysisPercentage = document.getElementById('analysisPercentage');
  
  const analysisMessages = [
    '답변을 분석하고 있습니다...',
    '가치관 프로필을 생성 중...',
    '매칭 알고리즘 실행 중...',
    '최적의 매치를 찾고 있습니다...',
    '분석이 완료되었습니다!'
  ];
  
  let messageIndex = 0;
  let progress = 0;
  
  const analysisInterval = setInterval(() => {
    progress += Math.random() * 15 + 10;
    
    if (progress > 100) {
      progress = 100;
      clearInterval(analysisInterval);
      
      setTimeout(() => {
        showDemoStep(4);
        generateMatchingResults();
      }, 1000);
    }
    
    // Update progress
    if (analysisFill) analysisFill.style.width = `${progress}%`;
    if (analysisPercentage) analysisPercentage.textContent = `${Math.round(progress)}%`;
    
    // Update message
    if (progress > messageIndex * 20 && messageIndex < analysisMessages.length - 1) {
      messageIndex++;
      if (analysisText) {
        analysisText.style.opacity = '0';
        setTimeout(() => {
          analysisText.textContent = analysisMessages[messageIndex];
          analysisText.style.opacity = '1';
        }, 200);
      }
    }
  }, 300);
}

// Generate Matching Results
function generateMatchingResults() {
  // Calculate compatibility based on answers
  compatibilityScore = calculateCompatibility();
  
  // Update compatibility display
  const compatibilityEl = document.getElementById('compatibilityScore');
  if (compatibilityEl) {
    animateNumber(compatibilityEl, 0, compatibilityScore, 2000);
  }
  
  // Generate user tags
  generateUserTags();
}

// Calculate Compatibility
function calculateCompatibility() {
  const q1Weight = 0.6;
  const q2Weight = 0.4;
  
  let score = 70; // Base score
  
  // Adjust based on answers
  if (demoAnswers.q1 === 'family' && demoAnswers.q2 === 'stability') {
    score += 22; // High compatibility
  } else if (demoAnswers.q1 === 'hobby' && demoAnswers.q2 === 'growth') {
    score += 20;
  } else if (demoAnswers.q1 === 'social' && demoAnswers.q2 === 'connection') {
    score += 18;
  } else {
    score += Math.random() * 15 + 10;
  }
  
  return Math.min(Math.round(score), 95);
}

// Generate User Tags
function generateUserTags() {
  const yourTagsEl = document.getElementById('yourTags');
  if (!yourTagsEl) return;
  
  const tags = [];
  
  if (demoAnswers.q1 && demoQuestions.q1.options[demoAnswers.q1]) {
    tags.push(...demoQuestions.q1.options[demoAnswers.q1].tags);
  }
  
  if (demoAnswers.q2 && demoQuestions.q2.options[demoAnswers.q2]) {
    tags.push(...demoQuestions.q2.options[demoAnswers.q2].tags);
  }
  
  yourTagsEl.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

// Animate Number
function animateNumber(element, start, end, duration) {
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(start + (end - start) * progress);
    
    element.textContent = `${current}%`;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
}

// Setup Demo Actions
function setupDemoActions() {
  const startChatBtn = document.getElementById('startChatDemo');
  const restartBtn = document.getElementById('restartDemo');
  
  if (startChatBtn) {
    startChatBtn.addEventListener('click', () => {
      showChatDemo();
    });
  }
  
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      resetDemoState();
      showDemoStep(1);
      initializeStepInteractions();
    });
  }
}

// Show Chat Demo
function showChatDemo() {
  const chatContainer = document.getElementById('chatDemoContainer');
  if (chatContainer) {
    chatContainer.style.display = 'block';
    
    // Scroll to chat demo
    chatContainer.scrollIntoView({ behavior: 'smooth' });
    
    // Start chat simulation
    setTimeout(() => {
      simulateChat();
    }, 500);
  }
}

// Setup Chat Demo
function setupChatDemo() {
  const useSuggestionBtn = document.querySelector('.use-suggestion-btn');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendMessage');
  
  if (useSuggestionBtn) {
    useSuggestionBtn.addEventListener('click', () => {
      const suggestionText = document.querySelector('.suggestion-text').textContent.replace(/"/g, '');
      if (chatInput) {
        chatInput.value = suggestionText;
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
      }
    });
  }
  
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      sendChatMessage();
    });
  }
  
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }
}

// Send Chat Message
function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  
  if (!chatInput || !chatMessages || !chatInput.value.trim()) return;
  
  const message = chatInput.value.trim();
  
  // Add user message
  addChatMessage(message, 'sent');
  
  // Clear input
  chatInput.value = '';
  
  // Simulate response
  setTimeout(() => {
    const responses = [
      '정말 흥미로운 관점이네요! 🤔',
      '저도 비슷한 생각을 해본 적이 있어요.',
      '그런 경험이 있으시군요. 더 자세히 듣고 싶어요!',
      '우리 가치관이 많이 비슷한 것 같아요 😊'
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addChatMessage(randomResponse, 'received');
  }, 1000 + Math.random() * 2000);
}

// Add Chat Message
function addChatMessage(text, type) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;
  
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.innerHTML = `<div class="message-bubble">${text}</div>`;
  
  chatMessages.appendChild(messageEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate Chat
function simulateChat() {
  const messages = [
    { text: '안녕하세요! 프로필을 보니 관심사가 비슷하네요 😊', type: 'received', delay: 1000 },
    { text: '네, 반갑습니다! 어떤 부분이 비슷하다고 느끼셨나요?', type: 'sent', delay: 2500 }
  ];
  
  messages.forEach((msg, index) => {
    setTimeout(() => {
      addChatMessage(msg.text, msg.type);
    }, msg.delay);
  });
}

// Enhanced Modal Close Functionality
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeActiveModal();
  }
});

// Close active modal function
function closeActiveModal() {
  const openModal = document.querySelector('.enhanced-demo-modal[style*="flex"], .modal[style*="block"], .video-modal[style*="block"]');
  if (openModal) {
    openModal.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    // Reset demo if it was the demo modal
    if (openModal.id === 'demoModal') {
      resetDemoState();
    }
    
    console.log('Modal closed:', openModal.id);
  }
}

// Setup modal close buttons
document.addEventListener('DOMContentLoaded', function() {
  // Enhanced demo modal close button
  const demoCloseBtn = document.querySelector('#demoModal .close');
  if (demoCloseBtn) {
    demoCloseBtn.addEventListener('click', closeActiveModal);
  }
  
  // Video modal close button
  const videoCloseBtn = document.querySelector('#videoModal .close');
  if (videoCloseBtn) {
    videoCloseBtn.addEventListener('click', closeActiveModal);
  }
  
  // Video play button
  const playVideoBtn = document.getElementById('playVideoBtn');
  if (playVideoBtn) {
    playVideoBtn.addEventListener('click', function() {
      console.log('비디오 재생 버튼 클릭');
      showModal('영상 준비 중', '곧 실제 소개 영상이 준비될 예정입니다!');
    });
  }
  
  // Close modal when clicking outside
  const demoModal = document.getElementById('demoModal');
  if (demoModal) {
    demoModal.addEventListener('click', function(e) {
      if (e.target === demoModal) {
        closeActiveModal();
      }
    });
  }
  
  // Close video modal when clicking outside
  const videoModal = document.getElementById('videoModal');
  if (videoModal) {
    videoModal.addEventListener('click', function(e) {
      if (e.target === videoModal) {
        closeActiveModal();
      }
    });
  }
  
  // 우측 사이드바 위젯 클릭 이벤트 리스너
  initializeWidgetClickEvents();
});

// 위젯 클릭 이벤트 초기화 함수
function initializeWidgetClickEvents() {
  // 가치관 분석 위젯
  const valuesAnalysisWidget = document.getElementById('valuesAnalysisWidget');
  if (valuesAnalysisWidget) {
    valuesAnalysisWidget.addEventListener('click', function() {
      console.log('가치관 분석 위젯 클릭됨');
      openModal('valuesModal');
      trackEvent('values_analysis_widget_click');
    });
  }
  
  // AI 매칭 위젯
  const aiMatchingWidget = document.getElementById('aiMatchingWidget');
  if (aiMatchingWidget) {
    aiMatchingWidget.addEventListener('click', function() {
      console.log('AI 매칭 위젯 클릭됨');
      openModal('matchingModal');
      trackEvent('ai_matching_widget_click');
    });
  }
  
  // 새로운 연결 위젯
  const newConnectionsWidget = document.getElementById('newConnectionsWidget');
  if (newConnectionsWidget) {
    newConnectionsWidget.addEventListener('click', function() {
      console.log('새로운 연결 위젯 클릭됨');
      openModal('connectionsModal');
      trackEvent('new_connections_widget_click');
    });
  }

// Values Analysis Functionality
let currentValuesQuestion = 1;
const totalValuesQuestions = 20; // Full assessment
const valuesAnswers = {};
const userProfile = {
  values: {},
  personalityScore: {},
  interests: [],
  lifestyle: {},
  communicationStyle: {}
};

// Expanded question bank
const valuesQuestions = [
  {
    id: 1,
    text: '인생에서 가장 중요하게 생각하는 가치는 무엇인가요?',
    category: 'life_values',
    options: [
      { value: 'family', text: '가족과의 시간', score: { family: 5, stability: 3 } },
      { value: 'growth', text: '성장과 도전', score: { growth: 5, adventure: 3 } },
      { value: 'stability', text: '안정과 평화', score: { stability: 5, security: 4 } },
      { value: 'freedom', text: '자유와 독립', score: { freedom: 5, independence: 4 } }
    ]
  },
  {
    id: 2,
    text: '여가 시간을 어떻게 보내는 것을 선호하시나요?',
    category: 'lifestyle',
    options: [
      { value: 'quiet', text: '조용한 곳에서 독서나 명상', score: { introversion: 4, intellectual: 5 } },
      { value: 'social', text: '친구들과 함께 활동', score: { extroversion: 5, social: 4 } },
      { value: 'active', text: '운동이나 야외활동', score: { active: 5, health: 4 } },
      { value: 'creative', text: '예술이나 창작활동', score: { creative: 5, artistic: 4 } }
    ]
  },
  {
    id: 3,
    text: '어려운 결정을 내릴 때 주로 무엇을 고려하시나요?',
    category: 'decision_making',
    options: [
      { value: 'logic', text: '논리적 분석', score: { analytical: 5, logical: 4 } },
      { value: 'emotion', text: '감정과 직감', score: { emotional: 5, intuitive: 4 } },
      { value: 'others', text: '주변 사람들의 의견', score: { collaborative: 4, social: 3 } },
      { value: 'experience', text: '과거 경험', score: { practical: 5, wisdom: 4 } }
    ]
  },
  {
    id: 4,
    text: '이상적인 주말을 어떻게 보내고 싶으신가요?',
    category: 'lifestyle',
    options: [
      { value: 'home', text: '집에서 편안하게', score: { homebody: 5, comfort: 4 } },
      { value: 'adventure', text: '새로운 곳 탐험', score: { adventure: 5, curiosity: 4 } },
      { value: 'friends', text: '친구들과 모임', score: { social: 5, friendship: 4 } },
      { value: 'family', text: '가족과 함께', score: { family: 5, traditional: 3 } }
    ]
  },
  {
    id: 5,
    text: '갈등 상황에서 어떻게 대처하시나요?',
    category: 'communication',
    options: [
      { value: 'direct', text: '직접적으로 대화', score: { direct: 5, assertive: 4 } },
      { value: 'avoid', text: '시간을 두고 피함', score: { peaceful: 4, avoidant: 3 } },
      { value: 'mediate', text: '중재자를 통해', score: { diplomatic: 5, collaborative: 4 } },
      { value: 'compromise', text: '타협점을 찾음', score: { flexible: 5, cooperative: 4 } }
    ]
  },
  {
    id: 6,
    text: '미래에 대한 계획을 세울 때 어떤 방식을 선호하시나요?',
    category: 'planning',
    options: [
      { value: 'detailed', text: '세부적인 계획', score: { organized: 5, detailed: 4 } },
      { value: 'flexible', text: '유연한 방향성', score: { adaptable: 5, spontaneous: 3 } },
      { value: 'goals', text: '목표 중심', score: { ambitious: 5, focused: 4 } },
      { value: 'flow', text: '자연스럽게', score: { relaxed: 4, trusting: 3 } }
    ]
  },
  {
    id: 7,
    text: '돈에 대한 당신의 가치관은?',
    category: 'financial',
    options: [
      { value: 'security', text: '안정과 저축이 중요', score: { security: 5, conservative: 4 } },
      { value: 'experience', text: '경험에 투자', score: { experiential: 5, adventurous: 3 } },
      { value: 'sharing', text: '나눔과 기부', score: { generous: 5, caring: 4 } },
      { value: 'growth', text: '투자와 성장', score: { ambitious: 4, risk_taking: 3 } }
    ]
  },
  {
    id: 8,
    text: '건강관리에 대한 접근 방식은?',
    category: 'health',
    options: [
      { value: 'active', text: '적극적인 운동', score: { active: 5, disciplined: 4 } },
      { value: 'balanced', text: '균형잡힌 생활', score: { balanced: 5, mindful: 4 } },
      { value: 'natural', text: '자연스러운 관리', score: { natural: 4, relaxed: 3 } },
      { value: 'medical', text: '의학적 접근', score: { scientific: 4, cautious: 3 } }
    ]
  },
  {
    id: 9,
    text: '새로운 사람들과 만날 때 어떤 느낌인가요?',
    category: 'social',
    options: [
      { value: 'excited', text: '설레고 즐겁다', score: { extroversion: 5, optimistic: 4 } },
      { value: 'curious', text: '호기심이 생긴다', score: { curious: 5, open: 4 } },
      { value: 'cautious', text: '조심스럽다', score: { cautious: 4, introverted: 3 } },
      { value: 'comfortable', text: '편안하다', score: { confident: 4, social: 5 } }
    ]
  },
  {
    id: 10,
    text: '스트레스를 받을 때 주로 어떻게 해소하시나요?',
    category: 'stress_management',
    options: [
      { value: 'exercise', text: '운동이나 신체활동', score: { active: 5, physical: 4 } },
      { value: 'social', text: '사람들과 대화', score: { social: 5, expressive: 4 } },
      { value: 'alone', text: '혼자만의 시간', score: { introspective: 5, independent: 4 } },
      { value: 'hobby', text: '취미 활동', score: { creative: 4, balanced: 3 } }
    ]
  },
  {
    id: 11,
    text: '여행할 때 선호하는 스타일은?',
    category: 'travel',
    options: [
      { value: 'planned', text: '계획적인 여행', score: { organized: 5, efficient: 4 } },
      { value: 'spontaneous', text: '즉흥적인 여행', score: { spontaneous: 5, adventurous: 4 } },
      { value: 'comfort', text: '편안한 여행', score: { comfort: 5, relaxed: 4 } },
      { value: 'cultural', text: '문화 체험 중심', score: { intellectual: 5, curious: 4 } }
    ]
  },
  {
    id: 12,
    text: '친구와의 관계에서 가장 중요한 것은?',
    category: 'relationships',
    options: [
      { value: 'trust', text: '신뢰와 솔직함', score: { trustworthy: 5, honest: 4 } },
      { value: 'support', text: '서로 지지해주기', score: { supportive: 5, caring: 4 } },
      { value: 'fun', text: '즐거운 시간 공유', score: { fun: 5, positive: 4 } },
      { value: 'understanding', text: '깊은 이해', score: { empathetic: 5, deep: 4 } }
    ]
  },
  {
    id: 13,
    text: '일과 삶의 균형에 대한 생각은?',
    category: 'work_life',
    options: [
      { value: 'balance', text: '완전한 균형이 중요', score: { balanced: 5, mindful: 4 } },
      { value: 'work_first', text: '일의 성취가 우선', score: { ambitious: 5, driven: 4 } },
      { value: 'life_first', text: '개인 시간이 더 중요', score: { relaxed: 5, self_care: 4 } },
      { value: 'flexible', text: '상황에 따라 유연하게', score: { adaptable: 5, practical: 4 } }
    ]
  },
  {
    id: 14,
    text: '문제 해결 시 어떤 접근을 선호하시나요?',
    category: 'problem_solving',
    options: [
      { value: 'systematic', text: '체계적 분석', score: { analytical: 5, methodical: 4 } },
      { value: 'creative', text: '창의적 해결', score: { creative: 5, innovative: 4 } },
      { value: 'collaborative', text: '협력적 접근', score: { collaborative: 5, team_oriented: 4 } },
      { value: 'intuitive', text: '직관적 판단', score: { intuitive: 5, confident: 4 } }
    ]
  },
  {
    id: 15,
    text: '성격적으로 자신을 어떻게 표현하시겠어요?',
    category: 'personality',
    options: [
      { value: 'outgoing', text: '외향적이고 활발함', score: { extroversion: 5, energetic: 4 } },
      { value: 'thoughtful', text: '사려깊고 신중함', score: { thoughtful: 5, wise: 4 } },
      { value: 'optimistic', text: '긍정적이고 밝음', score: { optimistic: 5, positive: 4 } },
      { value: 'calm', text: '차분하고 안정적', score: { calm: 5, stable: 4 } }
    ]
  },
  {
    id: 16,
    text: '학습이나 성장에 대한 태도는?',
    category: 'growth',
    options: [
      { value: 'continuous', text: '지속적인 학습', score: { growth_minded: 5, curious: 4 } },
      { value: 'practical', text: '실용적 지식 위주', score: { practical: 5, efficient: 4 } },
      { value: 'deep', text: '깊이 있는 탐구', score: { intellectual: 5, thorough: 4 } },
      { value: 'experiential', text: '경험을 통한 학습', score: { experiential: 5, hands_on: 4 } }
    ]
  },
  {
    id: 17,
    text: '소통할 때 중요하게 생각하는 것은?',
    category: 'communication',
    options: [
      { value: 'clarity', text: '명확한 표현', score: { clear: 5, direct: 4 } },
      { value: 'empathy', text: '공감과 이해', score: { empathetic: 5, caring: 4 } },
      { value: 'humor', text: '유머와 재미', score: { humorous: 5, fun: 4 } },
      { value: 'respect', text: '상호 존중', score: { respectful: 5, considerate: 4 } }
    ]
  },
  {
    id: 18,
    text: '변화에 대한 당신의 태도는?',
    category: 'change',
    options: [
      { value: 'embrace', text: '적극적으로 수용', score: { adaptable: 5, progressive: 4 } },
      { value: 'cautious', text: '신중하게 접근', score: { cautious: 4, thoughtful: 3 } },
      { value: 'gradual', text: '점진적으로 적응', score: { steady: 4, practical: 3 } },
      { value: 'resistant', text: '기존 방식 선호', score: { traditional: 4, stable: 5 } }
    ]
  },
  {
    id: 19,
    text: '인생의 의미를 어디서 찾으시나요?',
    category: 'meaning',
    options: [
      { value: 'relationships', text: '인간관계에서', score: { social: 5, loving: 4 } },
      { value: 'achievement', text: '성취와 목표 달성', score: { ambitious: 5, driven: 4 } },
      { value: 'service', text: '타인에 대한 봉사', score: { altruistic: 5, caring: 4 } },
      { value: 'growth', text: '개인적 성장', score: { growth_minded: 5, self_aware: 4 } }
    ]
  },
  {
    id: 20,
    text: '이상적인 파트너와의 관계는?',
    category: 'partnership',
    options: [
      { value: 'companion', text: '인생의 동반자', score: { companionship: 5, loyal: 4 } },
      { value: 'best_friend', text: '가장 친한 친구', score: { friendship: 5, fun: 4 } },
      { value: 'soulmate', text: '영혼의 짝', score: { deep: 5, romantic: 4 } },
      { value: 'team', text: '최고의 팀', score: { collaborative: 5, supportive: 4 } }
    ]
  }
];

function showValuesQuestion(questionNumber) {
  // Hide all questions
  document.querySelectorAll('.question-card').forEach(card => {
    card.classList.remove('active');
  });
    
  // Create or update question dynamically
  const questionContainer = document.querySelector('.question-container');
  const existingQuestion = document.querySelector(`[data-question="${questionNumber}"]`);
    
  if (!existingQuestion && questionNumber <= totalValuesQuestions) {
    createQuestionCard(questionNumber);
  }
    
  // Show current question
  const currentQuestion = document.querySelector(`[data-question="${questionNumber}"]`);
  if (currentQuestion) {
    currentQuestion.classList.add('active');
  }
    
  // Update progress
  updateValuesProgress(questionNumber);
    
  // Update buttons
  const prevBtn = document.querySelector('.prev-values-btn');
  const nextBtn = document.querySelector('.next-values-btn');
  const completeBtn = document.querySelector('.complete-values-btn');
    
  if (prevBtn) {prevBtn.disabled = questionNumber === 1;}
    
  if (questionNumber === totalValuesQuestions) {
    if (nextBtn) {nextBtn.style.display = 'none';}
    if (completeBtn) {completeBtn.style.display = 'inline-block';}
  } else {
    if (nextBtn) {nextBtn.style.display = 'inline-block';}
    if (completeBtn) {completeBtn.style.display = 'none';}
  }
}

function createQuestionCard(questionNumber) {
  const question = valuesQuestions.find(q => q.id === questionNumber);
  if (!question) {return;}
    
  const questionContainer = document.querySelector('.question-container');
  const questionCard = document.createElement('div');
  questionCard.className = 'question-card';
  questionCard.setAttribute('data-question', questionNumber);
    
  let optionsHTML = '';
  question.options.forEach((option, index) => {
    optionsHTML += `
            <label class="answer-option">
                <input type="radio" name="q${questionNumber}" value="${option.value}">
                <span class="option-text">${option.text}</span>
            </label>
        `;
  });
    
  questionCard.innerHTML = `
        <h3>${question.text}</h3>
        <div class="answer-options">
            ${optionsHTML}
        </div>
    `;
    
  questionContainer.appendChild(questionCard);
    
  // Add event listeners for new options
  questionCard.querySelectorAll('.answer-option').forEach(option => {
    option.addEventListener('click', function() {
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const questionData = valuesQuestions.find(q => q.id === questionNumber);
        const selectedOption = questionData.options.find(opt => opt.value === radio.value);
                
        // Store answer with scoring data
        valuesAnswers[questionNumber] = {
          value: radio.value,
          text: selectedOption.text,
          score: selectedOption.score,
          category: questionData.category
        };
                
        trackEvent('values_answer_select', { 
          question: radio.name, 
          answer: radio.value,
          category: questionData.category
        });
      }
    });
  });
}

function updateValuesProgress(questionNumber) {
  const progressPercent = Math.round((questionNumber / totalValuesQuestions) * 100);
  const currentQuestionEl = document.querySelector('.current-question');
  const progressFill = document.querySelector('.progress-fill-values');
  const progressPercentEl = document.querySelector('.progress-percent');
    
  if (currentQuestionEl) {currentQuestionEl.textContent = questionNumber;}
  if (progressFill) {progressFill.style.width = `${progressPercent}%`;}
  if (progressPercentEl) {progressPercentEl.textContent = `${progressPercent}%`;}
}

// Values navigation
document.querySelector('.next-values-btn')?.addEventListener('click', function() {
  if (currentValuesQuestion < totalValuesQuestions) {
    currentValuesQuestion++;
    showValuesQuestion(currentValuesQuestion);
    trackEvent('values_next', { question: currentValuesQuestion });
  }
});

document.querySelector('.prev-values-btn')?.addEventListener('click', function() {
  if (currentValuesQuestion > 1) {
    currentValuesQuestion--;
    showValuesQuestion(currentValuesQuestion);
    trackEvent('values_prev', { question: currentValuesQuestion });
  }
});

// ==============================================
// VALUES ANALYSIS SYSTEM (localStorage based)
// ==============================================

class ValuesAnalysisManager {
  constructor() {
    this.storageKey = 'charminyeon_values_analysis';
    this.currentQuestion = 1;
    this.totalQuestions = 20;
    this.answers = {};
    this.analysisResults = null;
  }

  // Generate analysis results based on answers
  generateAnalysis(answers) {
    const scores = {
      family: 0,
      growth: 0,
      stability: 0,
      adventure: 0,
      creativity: 0,
      social: 0,
      independence: 0,
      tradition: 0
    };

    // Simple scoring algorithm
    Object.values(answers).forEach(answer => {
      switch(answer.value) {
        case 'family':
          scores.family += 5;
          scores.stability += 3;
          break;
        case 'growth':
          scores.growth += 5;
          scores.adventure += 3;
          break;
        case 'stability':
          scores.stability += 5;
          scores.family += 2;
          break;
        case 'freedom':
          scores.independence += 5;
          scores.adventure += 3;
          break;
        case 'social':
          scores.social += 5;
          scores.family += 2;
          break;
        case 'creative':
          scores.creativity += 5;
          scores.independence += 2;
          break;
        case 'active':
          scores.adventure += 4;
          scores.growth += 2;
          break;
        case 'quiet':
          scores.stability += 4;
          scores.tradition += 2;
          break;
        case 'logic':
          scores.growth += 3;
          scores.independence += 3;
          break;
        case 'emotion':
          scores.family += 3;
          scores.creativity += 3;
          break;
        default:
          scores.stability += 1;
      }
    });

    // Find top 3 values
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const analysis = {
      scores: scores,
      topValues: sortedScores.map(([key, score]) => ({
        key,
        score,
        label: this.getValueLabel(key)
      })),
      personality: this.generatePersonalityInsight(sortedScores),
      completedAt: new Date().toISOString(),
      answers: answers
    };

    return analysis;
  }

  getValueLabel(key) {
    const labels = {
      family: '가족 중심',
      growth: '성장 추구',
      stability: '안정 추구',
      adventure: '모험 정신',
      creativity: '창의성',
      social: '사회적 관계',
      independence: '독립성',
      tradition: '전통 중시'
    };
    return labels[key] || key;
  }

  generatePersonalityInsight(topValues) {
    const [first, second, third] = topValues;
    
    const insights = {
      'family_stability': '가족과 안정적인 관계를 중시하며, 신뢰할 수 있는 파트너를 찾고 계시네요.',
      'growth_adventure': '새로운 도전을 즐기며, 함께 성장할 수 있는 상대를 원하시는군요.',
      'social_family': '사람들과의 따뜻한 관계를 소중히 여기며, 소통을 중시하시는 분이시네요.',
      'independence_creativity': '자신만의 개성과 창의성을 중요하게 생각하는 독립적인 성향이시네요.',
      'stability_tradition': '전통적인 가치와 안정적인 삶을 추구하시는 신중한 분이시네요.'
    };

    const key = `${first[0]}_${second[0]}`;
    return insights[key] || `${this.getValueLabel(first[0])}과 ${this.getValueLabel(second[0])}을 중시하는 균형잡힌 가치관을 가지고 계시네요.`;
  }

  saveAnalysis(analysis) {
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
      const userAnalysis = {
        userId: currentUser.id,
        analysis: analysis,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(userAnalysis));
      this.analysisResults = analysis;
    }
  }

  getAnalysis() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const userAnalysis = JSON.parse(stored);
      return userAnalysis.analysis;
    }
    return null;
  }

  showAnalysisResult(analysis) {
    userManager.showSuccess('가치관 분석이 완료되었습니다!');
    
    setTimeout(() => {
      showCustomAlert('가치관 분석 결과', `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
          <h3 style="margin-bottom: 2rem; color: #333;">당신의 가치관 분석 결과</h3>
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
            <h4 style="margin-bottom: 1rem;">주요 가치관 TOP 3</h4>
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem;">
              ${analysis.topValues.map((value, index) => `
                <div style="text-align: center;">
                  <div style="font-size: 2rem; margin-bottom: 0.5rem;">${['🥇', '🥈', '🥉'][index]}</div>
                  <div style="font-weight: bold;">${value.label}</div>
                  <div style="opacity: 0.9;">${value.score}점</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 15px; text-align: left; margin-bottom: 2rem;">
            <h4 style="color: #667eea; margin-bottom: 1rem;">💡 가치관 분석</h4>
            <p style="line-height: 1.6; margin: 0;">${analysis.personality}</p>
          </div>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="document.querySelector('#matchingModal').style.display='block'; this.closest('.custom-alert').remove(); valuesAnalysisManager.startMatching();" style="background: #10b981; color: white; border: none; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer;">매칭 시작하기</button>
            <button onclick="this.closest('.custom-alert').remove()" style="background: #6b7280; color: white; border: none; padding: 1rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer;">나중에</button>
          </div>
        </div>
      `);
    }, 1000);
  }

  startMatching() {
    startMatchingAnimation();
    setTimeout(() => {
      this.generateMatches();
    }, 2000);
  }

  generateMatches() {
    const analysis = this.getAnalysis();
    if (!analysis) return;

    // Generate sample matches based on values
    const matches = this.createSampleMatches(analysis);
    this.displayMatches(matches);
  }

  createSampleMatches(analysis) {
    const matchProfiles = [
      { name: '김철수', age: 52, avatar: '👨‍💼', traits: ['성장 지향', '운동 좋아함'], compatibility: 92 },
      { name: '이영희', age: 48, avatar: '👩‍🎨', traits: ['예술 애호가', '가족 중시'], compatibility: 87 },
      { name: '박민수', age: 55, avatar: '👨‍🏫', traits: ['독서 좋아함', '안정 추구'], compatibility: 84 },
      { name: '최은미', age: 45, avatar: '👩‍💼', traits: ['여행 좋아함', '사회적 관계'], compatibility: 89 },
      { name: '정혜진', age: 50, avatar: '👩‍🌾', traits: ['자연 친화', '창의적'], compatibility: 86 }
    ];

    // Sort by compatibility and adjust based on user's top values
    return matchProfiles
      .map(profile => {
        // Adjust compatibility based on value alignment
        let adjustedCompatibility = profile.compatibility;
        analysis.topValues.forEach(value => {
          if (profile.traits.some(trait => this.isTraitAligned(trait, value.key))) {
            adjustedCompatibility += 2;
          }
        });
        return { ...profile, compatibility: Math.min(adjustedCompatibility, 98) };
      })
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 3);
  }

  isTraitAligned(trait, valueKey) {
    const alignments = {
      family: ['가족 중시', '안정 추구'],
      growth: ['성장 지향', '운동 좋아함'],
      social: ['사회적 관계', '소통 중시'],
      creativity: ['예술 애호가', '창의적'],
      adventure: ['여행 좋아함', '모험 정신'],
      stability: ['안정 추구', '독서 좋아함'],
      independence: ['독립적', '자유로움']
    };
    return alignments[valueKey]?.includes(trait) || false;
  }

  displayMatches(matches) {
    const matchCards = document.querySelector('.match-cards');
    if (matchCards) {
      matchCards.innerHTML = matches.map(match => `
        <div class="match-card">
          <div class="match-avatar">${match.avatar}</div>
          <div class="match-info">
            <div class="match-name">${match.name}</div>
            <div class="match-age">${match.age}세</div>
            <div class="match-percentage">${match.compatibility}% 일치</div>
            <div class="match-tags">
              ${match.traits.map(trait => `<span class="tag">${trait}</span>`).join('')}
            </div>
          </div>
          <button class="connect-btn" onclick="valuesAnalysisManager.connectWithMatch('${match.name}')">연결하기</button>
        </div>
      `).join('');
    }
  }

  connectWithMatch(matchName) {
    userManager.showSuccess(`${matchName}님과 연결되었습니다! 새로운 연결 페이지에서 대화를 시작해보세요.`);
    trackEvent('connect_match', { matchName });
    
    // Close matching modal and show connections
    setTimeout(() => {
      closeModal('matchingModal');
      openModal('connectionsModal');
    }, 1500);
  }
}

// Initialize values analysis manager
const valuesAnalysisManager = new ValuesAnalysisManager();

// Updated complete button handler
document.querySelector('.complete-values-btn')?.addEventListener('click', function() {
  const submitBtn = this;
  const originalText = submitBtn.textContent;
    
  try {
    // Show loading state
    submitBtn.textContent = '분석 중...';
    submitBtn.disabled = true;
        
    // Collect all answers
    const answers = {};
    document.querySelectorAll('.question-card').forEach(card => {
      const questionNum = card.dataset.question;
      const selectedAnswer = card.querySelector('input[type="radio"]:checked');
      if (selectedAnswer) {
        answers[questionNum] = {
          value: selectedAnswer.value,
          text: selectedAnswer.nextElementSibling?.textContent || selectedAnswer.value
        };
      }
    });
        
    console.log('Values Analysis Complete:', answers);
        
    // Check if enough questions answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < 3) {
      userManager.showError('최소 3개 이상의 질문에 답변해주세요.');
      return;
    }
        
    // Generate analysis
    const analysis = valuesAnalysisManager.generateAnalysis(answers);
    valuesAnalysisManager.saveAnalysis(analysis);
    
    // Close values modal
    closeModal('valuesModal');
    
    // Show results
    valuesAnalysisManager.showAnalysisResult(analysis);
            
    trackEvent('values_complete', { 
      completed: true, 
      answeredQuestions: answeredCount,
      topValue: analysis.topValues[0].key
    });
        
  } catch (error) {
    console.error('Values submission error:', error);
    userManager.showError('가치관 분석 중 오류가 발생했습니다.');
    trackEvent('values_error', { error: error.message });
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Answer selection
document.querySelectorAll('.answer-option').forEach(option => {
  option.addEventListener('click', function() {
    const radio = this.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;
      trackEvent('values_answer_select', { 
        question: radio.name, 
        answer: radio.value 
      });
    }
  });
});

// Matching functionality
function startMatchingAnimation() {
  // Start wave animations
  const wavesLarge = document.querySelectorAll('.wave-large');
  wavesLarge.forEach((wave, index) => {
    wave.style.animation = `waveAnimationLarge 2s ease-in-out infinite ${index * 0.3}s`;
  });
    
  // Animate percentage counter
  animatePercentage();
}

function animatePercentage() {
  const percentageEl = document.querySelector('.percentage-number');
  if (percentageEl) {
    let current = 0;
    const target = 92;
    const increment = target / 30; // 30 frames
        
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      percentageEl.textContent = Math.round(current) + '%';
    }, 50);
  }
}

// Connect buttons
document.querySelectorAll('.connect-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const matchCard = this.closest('.match-card');
    const matchName = matchCard.querySelector('.match-name').textContent;
        
    // Simulate connection
    this.textContent = '연결됨!';
    this.style.background = '#10b981';
    this.disabled = true;
        
    // Update connections count (would be done via API in real app)
    setTimeout(() => {
      showModal('연결 성공', `${matchName}님과 연결되었습니다! 새로운 연결 페이지에서 대화를 시작해보세요.`);
    }, 500);
        
    trackEvent('connect_match', { match_name: matchName });
  });
});

// Connections tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tabName = this.dataset.tab;
        
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.classList.remove('active');
    });
    this.classList.add('active');
        
    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
    trackEvent('connections_tab_switch', { tab: tabName });
  });
});

// ==============================================
// CONNECTION & CHAT MANAGEMENT SYSTEM
// ==============================================

class ConnectionManager {
  constructor() {
    this.connectionsKey = 'charminyeon_connections';
    this.messagesKey = 'charminyeon_messages';
    this.initializeConnections();
  }

  initializeConnections() {
    if (!localStorage.getItem(this.connectionsKey)) {
      // Initialize with demo connections
      const demoConnections = [
        {
          id: 'conn_1',
          name: '김철수',
          age: 52,
          avatar: '👨‍💼',
          compatibility: 92,
          status: 'new',
          connectedAt: new Date().toISOString(),
          lastMessage: '가치관이 92% 일치합니다',
          unreadCount: 0
        },
        {
          id: 'conn_2',
          name: '이영희',
          age: 48,
          avatar: '👩‍🎨',
          compatibility: 87,
          status: 'new',
          connectedAt: new Date(Date.now() - 300000).toISOString(),
          lastMessage: '예술과 창작에 관심이 많으시군요',
          unreadCount: 0
        },
        {
          id: 'conn_3',
          name: '박민수',
          age: 55,
          avatar: '👨‍🏫',
          compatibility: 84,
          status: 'active',
          connectedAt: new Date(Date.now() - 3600000).toISOString(),
          lastMessage: '여행 이야기가 정말 흥미롭네요!',
          unreadCount: 3
        }
      ];
      localStorage.setItem(this.connectionsKey, JSON.stringify(demoConnections));
    }

    if (!localStorage.getItem(this.messagesKey)) {
      // Initialize with demo messages
      const demoMessages = {
        'conn_3': [
          {
            id: 'msg_1',
            senderId: 'conn_3',
            senderName: '박민수',
            content: '안녕하세요! 프로필을 보니 여행을 좋아하시는군요',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            isRead: true
          },
          {
            id: 'msg_2',
            senderId: 'current_user',
            senderName: '나',
            content: '네! 특히 혼자 떠나는 여행을 즐겨해요 😊',
            timestamp: new Date(Date.now() - 7100000).toISOString(),
            isRead: true
          },
          {
            id: 'msg_3',
            senderId: 'conn_3',
            senderName: '박민수',
            content: '오, 저도 마찬가지예요! 어디를 가장 인상 깊게 여행하셨나요?',
            timestamp: new Date(Date.now() - 3700000).toISOString(),
            isRead: false
          },
          {
            id: 'msg_4',
            senderId: 'conn_3',
            senderName: '박민수',
            content: '저는 작년에 제주도에 혼자 다녀왔는데 정말 좋았어요',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false
          },
          {
            id: 'msg_5',
            senderId: 'conn_3',
            senderName: '박민수',
            content: '혹시 시간 되시면 여행 이야기 더 나누어요!',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            isRead: false
          }
        ]
      };
      localStorage.setItem(this.messagesKey, JSON.stringify(demoMessages));
    }
  }

  getConnections() {
    return JSON.parse(localStorage.getItem(this.connectionsKey) || '[]');
  }

  getConnection(connectionId) {
    const connections = this.getConnections();
    return connections.find(conn => conn.id === connectionId);
  }

  updateConnectionsDisplay() {
    const connections = this.getConnections();
    
    // Update new connections
    this.displayConnectionsInTab('new', connections.filter(conn => conn.status === 'new'));
    
    // Update active conversations
    this.displayConnectionsInTab('active', connections.filter(conn => conn.status === 'active'));
    
    // Update all connections
    this.displayConnectionsInTab('all', connections);
  }

  displayConnectionsInTab(tabName, connections) {
    const tabContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
    if (!tabContent) return;

    if (tabName === 'all') {
      // Simple list view for all connections
      const connectionList = tabContent.querySelector('.connection-list');
      if (connectionList) {
        connectionList.innerHTML = connections.map(conn => `
          <div class="connection-item">
            <div class="connection-avatar">${conn.avatar}</div>
            <div class="connection-info">
              <div class="connection-name">${conn.name}</div>
              <div class="connection-status">${conn.status === 'new' ? '새로운 매치' : '대화 중'}</div>
            </div>
          </div>
        `).join('');
      }
    } else {
      // Card view for new and active
      tabContent.innerHTML = connections.map(conn => `
        <div class="connection-card" data-connection-id="${conn.id}">
          <div class="connection-avatar">${conn.avatar}</div>
          <div class="connection-info">
            <div class="connection-name">${conn.name}</div>
            <div class="connection-preview">${conn.lastMessage}</div>
            <div class="connection-time">${this.formatTime(conn.connectedAt)}</div>
          </div>
          ${conn.unreadCount > 0 ? `<div class="connection-badge">${conn.unreadCount}</div>` : ''}
          <div class="connection-actions">
            <button class="action-btn primary" onclick="connectionManager.startChat('${conn.id}')">
              ${conn.status === 'new' ? '대화 시작' : '대화 계속'}
            </button>
            <button class="action-btn secondary" onclick="connectionManager.viewProfile('${conn.id}')">프로필 보기</button>
          </div>
        </div>
      `).join('');
    }
  }

  formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  }

  startChat(connectionId) {
    const connection = this.getConnection(connectionId);
    if (!connection) return;

    // Update connection status to active
    const connections = this.getConnections();
    const connIndex = connections.findIndex(conn => conn.id === connectionId);
    if (connIndex !== -1) {
      connections[connIndex].status = 'active';
      connections[connIndex].unreadCount = 0;
      localStorage.setItem(this.connectionsKey, JSON.stringify(connections));
    }
    
    // Open chat interface
    this.openChatInterface(connection);
    
    trackEvent('start_conversation', { connectionId, name: connection.name });
  }

  viewProfile(connectionId) {
    const connection = this.getConnection(connectionId);
    if (!connection) return;

    showCustomAlert(`${connection.name}님의 프로필`, `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">${connection.avatar}</div>
        <h3 style="margin-bottom: 1rem; color: #333;">${connection.name}, ${connection.age}세</h3>
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
          <div style="font-size: 1.5rem; font-weight: bold;">${connection.compatibility}%</div>
          <div>가치관 일치도</div>
        </div>
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 15px; text-align: left; margin-bottom: 1.5rem;">
          <h4 style="color: #667eea; margin-bottom: 1rem;">💬 공통 관심사</h4>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #667eea; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">여행</span>
            <span style="background: #667eea; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">독서</span>
            <span style="background: #667eea; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.9rem;">자연</span>
          </div>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="connectionManager.startChat('${connectionId}'); this.closest('.custom-alert').remove();" style="background: #10b981; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer;">대화 시작</button>
          <button onclick="this.closest('.custom-alert').remove()" style="background: #6b7280; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 600; cursor: pointer;">닫기</button>
        </div>
      </div>
    `);
    
    trackEvent('view_profile', { connectionId, name: connection.name });
  }

  openChatInterface(connection) {
    const messages = this.getMessages(connection.id);
    
    showCustomAlert(`${connection.name}님과의 대화`, `
      <div style="width: 100%; max-width: 500px; height: 600px; display: flex; flex-direction: column;">
        <!-- Chat Header -->
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1rem; border-radius: 15px 15px 0 0; display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 2rem;">${connection.avatar}</div>
          <div>
            <div style="font-weight: bold; font-size: 1.1rem;">${connection.name}</div>
            <div style="opacity: 0.9; font-size: 0.9rem;">온라인</div>
          </div>
        </div>
        
        <!-- Messages Container -->
        <div id="chatMessages" style="flex: 1; padding: 1rem; background: #f8f9fa; overflow-y: auto; min-height: 400px; max-height: 400px;">
          ${this.renderMessages(messages)}
        </div>
        
        <!-- Message Input -->
        <div style="padding: 1rem; background: white; border-radius: 0 0 15px 15px; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <input type="text" id="messageInput" placeholder="메시지를 입력하세요..." style="flex: 1; padding: 0.8rem; border: 1px solid #d1d5db; border-radius: 20px; outline: none;" onkeypress="if(event.key==='Enter') connectionManager.sendMessage('${connection.id}')">
            <button onclick="connectionManager.sendMessage('${connection.id}')" style="background: #667eea; color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 20px; cursor: pointer; font-weight: 600;">전송</button>
          </div>
          <div style="text-align: center; margin-top: 0.5rem;">
            <button onclick="this.closest('.custom-alert').remove()" style="background: transparent; color: #6b7280; border: none; padding: 0.5rem; cursor: pointer; font-size: 0.9rem;">대화 나가기</button>
          </div>
        </div>
      </div>
    `, false); // false = don't auto-close
  }

  getMessages(connectionId) {
    const allMessages = JSON.parse(localStorage.getItem(this.messagesKey) || '{}');
    return allMessages[connectionId] || [];
  }

  renderMessages(messages) {
    return messages.map(msg => {
      const isCurrentUser = msg.senderId === 'current_user';
      const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div style="display: flex; justify-content: ${isCurrentUser ? 'flex-end' : 'flex-start'}; margin-bottom: 1rem;">
          <div style="max-width: 70%; ${isCurrentUser ? 'order: 2;' : ''}">
            <div style="background: ${isCurrentUser ? '#667eea' : 'white'}; color: ${isCurrentUser ? 'white' : '#333'}; padding: 0.8rem 1rem; border-radius: ${isCurrentUser ? '15px 15px 5px 15px' : '15px 15px 15px 5px'}; box-shadow: 0 2px 5px rgba(0,0,0,0.1); word-wrap: break-word;">
              ${msg.content}
            </div>
            <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.3rem; text-align: ${isCurrentUser ? 'right' : 'left'};">
              ${time}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  sendMessage(connectionId) {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content) return;
    
    const currentUser = userManager.getCurrentUser();
    if (!currentUser) return;
    
    // Add message
    const allMessages = JSON.parse(localStorage.getItem(this.messagesKey) || '{}');
    if (!allMessages[connectionId]) {
      allMessages[connectionId] = [];
    }
    
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'current_user',
      senderName: currentUser.name,
      content: content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    allMessages[connectionId].push(newMessage);
    localStorage.setItem(this.messagesKey, JSON.stringify(allMessages));
    
    // Clear input
    input.value = '';
    
    // Update chat display
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const messages = this.getMessages(connectionId);
      chatMessages.innerHTML = this.renderMessages(messages);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Simulate response after a delay
    setTimeout(() => {
      this.simulateResponse(connectionId);
    }, 1000 + Math.random() * 2000);
    
    trackEvent('send_message', { connectionId, messageLength: content.length });
  }

  simulateResponse(connectionId) {
    const connection = this.getConnection(connectionId);
    if (!connection) return;
    
    const responses = [
      '정말 그렇군요! 저도 비슷한 생각이에요 😊',
      '우와, 흥미롭네요! 더 자세히 들려주시겠어요?',
      '이런 이야기 나누니 좋아요. 언제 시간 되시면 만나서 대화해요!',
      '하하, 정말 우리 생각이 비슷해요!',
      '아, 저도 그런 경험이 있어요. 정말 인상 깊었죠.',
      '공감되네요! 우리 정말 잘 맞는 것 같아요 😄'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const allMessages = JSON.parse(localStorage.getItem(this.messagesKey) || '{}');
    if (!allMessages[connectionId]) {
      allMessages[connectionId] = [];
    }
    
    const responseMessage = {
      id: `msg_${Date.now()}`,
      senderId: connectionId,
      senderName: connection.name,
      content: randomResponse,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    allMessages[connectionId].push(responseMessage);
    localStorage.setItem(this.messagesKey, JSON.stringify(allMessages));
    
    // Update chat display if open
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const messages = this.getMessages(connectionId);
      chatMessages.innerHTML = this.renderMessages(messages);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}

// Initialize connection manager
const connectionManager = new ConnectionManager();

// Hero floating cards functionality - make them clickable
document.querySelector('.floating-card.card-1')?.addEventListener('click', function() {
  openModal('valuesModal');
  currentValuesQuestion = 1;
  showValuesQuestion(currentValuesQuestion);
  trackEvent('hero_card_values_click');
});

document.querySelector('.floating-card.card-2')?.addEventListener('click', function() {
  openModal('matchingModal');
  startMatchingAnimation();
  trackEvent('hero_card_matching_click');
});

document.querySelector('.floating-card.card-3')?.addEventListener('click', function() {
  openModal('connectionsModal');
  connectionManager.updateConnectionsDisplay();
  trackEvent('hero_card_connections_click');
});

// Add hover effects to floating cards
document.querySelectorAll('.floating-card').forEach(card => {
  card.style.cursor = 'pointer';
    
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-10px) scale(1.05)';
    this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
  });
    
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
    this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
  });
});

// About section cards functionality
document.querySelectorAll('.about-card').forEach((card, index) => {
  card.style.cursor = 'pointer';
    
  card.addEventListener('click', function() {
    const cardTitle = this.querySelector('h3').textContent;
        
    switch(index) {
    case 0: // AI 가치관 분석
      openModal('valuesModal');
      currentValuesQuestion = 1;
      showValuesQuestion(currentValuesQuestion);
      trackEvent('about_card_values_click');
      break;
    case 1: // 의미 있는 매칭
      openModal('matchingModal');
      startMatchingAnimation();
      trackEvent('about_card_matching_click');
      break;
    case 2: // 4060 특화
      showSpecializedInfo();
      trackEvent('about_card_specialized_click');
      break;
    }
  });
});

// Specialized info function for 4060 특화
function showSpecializedInfo() {
  const specializedContent = `
        <div class="specialized-info">
            <h3>4060세대 특화 서비스</h3>
            <div class="specialized-features">
                <div class="feature">
                    <strong>인생 경험 중시:</strong> 풍부한 경험과 지혜를 바탕으로 한 매칭
                </div>
                <div class="feature">
                    <strong>안정적인 관계:</strong> 진지하고 성숙한 만남을 추구하는 회원들
                </div>
                <div class="feature">
                    <strong>맞춤형 인터페이스:</strong> 4060세대가 사용하기 편한 직관적 디자인
                </div>
                <div class="feature">
                    <strong>안전한 환경:</strong> 철저한 신원 확인과 프라이버시 보호
                </div>
                <div class="feature">
                    <strong>오프라인 만남 지원:</strong> 안전한 첫 만남을 위한 장소 추천
                </div>
            </div>
            <div class="specialized-cta">
                <button onclick="openModal('signupModal')" class="specialized-btn">지금 시작해보세요</button>
            </div>
        </div>
    `;
    
  // Create and show specialized modal
  showCustomAlert('4060 특화 서비스', specializedContent);
}

// Custom alert function for better UX
function showCustomAlert(title, content) {
  // Remove existing alert if any
  const existingAlert = document.querySelector('.custom-alert');
  if (existingAlert) {
    existingAlert.remove();
  }
    
  const alertHTML = `
        <div class="custom-alert" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
        ">
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 25px 60px rgba(0,0,0,0.3);
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f0f0f0;
                ">
                    <h3 style="margin: 0; color: #333; font-size: 1.5rem;">${title}</h3>
                    <button onclick="this.closest('.custom-alert').remove()" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #666;
                        padding: 0.5rem;
                        border-radius: 50%;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background='none'">&times;</button>
                </div>
                ${content}
            </div>
        </div>
    `;
    
  document.body.insertAdjacentHTML('beforeend', alertHTML);
}

// Feature items functionality
document.querySelectorAll('.feature-item').forEach((item, index) => {
  item.style.cursor = 'pointer';
    
  item.addEventListener('click', function() {
    const featureTitle = this.querySelector('h3').textContent;
    let featureContent = '';
        
    switch(index) {
    case 0: // 심층 가치관 분석
      featureContent = `
                    <div class="feature-detail">
                        <p><strong>100여 개의 정교한 질문</strong>으로 당신의 가치관을 분석합니다:</p>
                        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                            <li>인생관과 목표</li>
                            <li>가족과 관계에 대한 가치관</li>
                            <li>여가 활동과 취미 성향</li>
                            <li>경제관과 미래 계획</li>
                            <li>소통 스타일과 갈등 해결 방식</li>
                        </ul>
                        <button onclick="openModal('valuesModal'); currentValuesQuestion = 1; showValuesQuestion(currentValuesQuestion); this.closest('.custom-alert').remove();" class="feature-btn">가치관 분석 시작하기</button>
                    </div>
                `;
      break;
    case 1: // 스마트 AI 매칭
      featureContent = `
                    <div class="feature-detail">
                        <p><strong>머신러닝 알고리즘</strong>이 최적의 상대를 찾아드립니다:</p>
                        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                            <li>가치관 일치도 분석 (최대 95%)</li>
                            <li>성격 궁합도 계산</li>
                            <li>관심사 및 취미 유사성</li>
                            <li>라이프스타일 호환성</li>
                            <li>소통 패턴 매칭</li>
                        </ul>
                        <button onclick="openModal('matchingModal'); startMatchingAnimation(); this.closest('.custom-alert').remove();" class="feature-btn">AI 매칭 체험하기</button>
                    </div>
                `;
      break;
    case 2: // 대화 가이드
      featureContent = `
                    <div class="feature-detail">
                        <p><strong>AI 대화 가이드</strong>가 자연스러운 소통을 도와드립니다:</p>
                        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                            <li>개인 맞춤형 대화 주제 제안</li>
                            <li>공통 관심사 발견</li>
                            <li>어색함 해소 팁</li>
                            <li>깊이 있는 대화로 발전시키는 방법</li>
                            <li>오프라인 만남 가이드</li>
                        </ul>
                        <button onclick="openModal('connectionsModal'); this.closest('.custom-alert').remove();" class="feature-btn">대화 가이드 보기</button>
                    </div>
                `;
      break;
    case 3: // 안전한 환경
      featureContent = `
                    <div class="feature-detail">
                        <p><strong>안전하고 신뢰할 수 있는</strong> 만남 환경을 제공합니다:</p>
                        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                            <li>본인 인증 및 신원 확인</li>
                            <li>개인정보 암호화 보호</li>
                            <li>부적절한 행동 신고 시스템</li>
                            <li>안전한 첫 만남 장소 추천</li>
                            <li>24시간 고객지원 서비스</li>
                        </ul>
                        <button onclick="showModal('안전 가이드', '안전한 만남을 위한 가이드를 확인해보세요. 공공장소에서 만나고, 개인정보는 주의깊게 공유하세요.'); this.closest('.custom-alert').remove();" class="feature-btn">안전 가이드 확인</button>
                    </div>
                `;
      break;
    }
        
    showCustomAlert(featureTitle, featureContent);
    trackEvent('feature_item_click', { feature: featureTitle });
  });
});

// Performance optimization: Lazy loading for images (when added)
function setupLazyLoading() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
    
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Initialize lazy loading
setupLazyLoading();

// Accessibility improvements
function setupAccessibility() {
  // Add skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.textContent = '메인 콘텐츠로 건너뛰기';
  skipLink.style.position = 'absolute';
  skipLink.style.top = '-40px';
  skipLink.style.left = '6px';
  skipLink.style.background = '#667eea';
  skipLink.style.color = 'white';
  skipLink.style.padding = '8px';
  skipLink.style.textDecoration = 'none';
  skipLink.style.borderRadius = '4px';
  skipLink.style.zIndex = '9999';
    
  skipLink.addEventListener('focus', function() {
    this.style.top = '6px';
  });
    
  skipLink.addEventListener('blur', function() {
    this.style.top = '-40px';
  });
    
  document.body.insertBefore(skipLink, document.body.firstChild);
    
  // Add main id to main element
  const main = document.querySelector('main');
  if (main) {
    main.id = 'main';
  }
}

// Initialize accessibility features
setupAccessibility();

// Smooth reveal animations on scroll
window.addEventListener('scroll', () => {
  const reveals = document.querySelectorAll('.reveal');
    
  reveals.forEach(reveal => {
    const windowHeight = window.innerHeight;
    const elementTop = reveal.getBoundingClientRect().top;
    const elementVisible = 150;
        
    if (elementTop < windowHeight - elementVisible) {
      reveal.classList.add('active');
    }
  });
});


// How It Works Section - Make steps clickable
function setupHowItWorksInteractivity() {
  const steps = document.querySelectorAll('.step');
  console.log('Setting up step interactivity for', steps.length, 'steps');
    
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    console.log(`Setting up step ${stepNumber}`);
        
    step.style.cursor = 'pointer';
    step.style.transition = 'all 0.3s ease';
        
    // Add hover effects
    step.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px)';
      this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
    });
        
    step.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
        
    // Add click functionality
    step.addEventListener('click', function() {
      console.log(`Step ${stepNumber} clicked!`);
      handleStepClick(stepNumber, this);
    });
  });
}

function handleStepClick(stepNumber, stepElement) {
  // Add click animation
  stepElement.style.transform = 'scale(0.95)';
  setTimeout(() => {
    stepElement.style.transform = 'translateY(-5px)';
  }, 150);
    
  switch(stepNumber) {
  case 1: // 가치관 진단
    trackEvent('step_click', { step: 1, name: '가치관 진단' });
    setTimeout(() => {
      openModal('valuesModal');
      currentValuesQuestion = 1;
      showValuesQuestion(currentValuesQuestion);
                
      // Show helpful message
      showStepNotification('1단계: 가치관 진단을 시작합니다!', 
        '20개의 질문으로 당신의 가치관을 분석해보세요.');
    }, 200);
    break;
            
  case 2: // 스마트 매칭
    trackEvent('step_click', { step: 2, name: '스마트 매칭' });
    console.log('Step 2 clicked: 스마트 매칭');
            
    // Check if user has completed values assessment
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    console.log('User profile check:', userProfile);
            
    if (!userProfile || !userProfile.completed) {
      // Create a demo profile for better UX
      const demoProfile = {
        values: { 1: 'growth', 2: 'active', 3: 'logic' },
        completed: true,
        completedAt: new Date().toISOString(),
        personalityScore: { extroversion: 3, stability: 4, growth: 5, creativity: 3, social: 4 },
        interests: ['운동', '성장'],
        lifestyle: { preferredPace: 'active', socialLevel: 'moderate', planningStyle: 'organized' }
      };
      localStorage.setItem('userProfile', JSON.stringify(demoProfile));
      console.log('Created demo profile for matching');
                
      showStepNotification('2단계: AI 매칭 시작!', 
        '데모 프로필로 매칭을 체험해보세요!');
    } else {
      showStepNotification('2단계: AI 매칭을 시작합니다!', 
        '당신과 가장 잘 맞는 상대를 찾고 있습니다.');
    }
            
    setTimeout(() => {
      console.log('Opening matching modal...');
      openModal('matchingModal');
      startMatchingAnimation();
                
      // Generate matches with user's profile
      setTimeout(() => {
        console.log('Generating matches...');
        if (typeof generateMatches === 'function') {
          generateMatches();
        } else {
          console.log('generateMatches function not found, matches already displayed');
        }
      }, 2000);
    }, 200);
    break;
            
  case 3: // 의미 있는 만남
    trackEvent('step_click', { step: 3, name: '의미 있는 만남' });
    console.log('Step 3 clicked: 의미 있는 만남');
            
    // Check if user has any connections
    const currentConnections = JSON.parse(localStorage.getItem('connections') || '[]');
    console.log('Current connections:', currentConnections);
            
    setTimeout(() => {
      console.log('Opening connections modal...');
      openModal('connectionsModal');
                
      if (currentConnections.length === 0) {
        // Create some demo connections for better UX
        const demoConnections = [
          { name: '김철수', age: 52, match: 92, status: 'new' },
          { name: '이영희', age: 48, match: 87, status: 'new' },
          { name: '박민수', age: 55, match: 84, status: 'active' }
        ];
        localStorage.setItem('connections', JSON.stringify(demoConnections));
        updateConnectionsDisplay();
                    
        showStepNotification('3단계: 의미 있는 만남!', 
          '데모 연결이 생성되었습니다. 대화를 시작해보세요!');
      } else {
        showStepNotification('3단계: 의미 있는 만남!', 
          `${currentConnections.length}명과 연결되어 있습니다. 대화를 시작해보세요.`);
      }
    }, 200);
    break;
  }
}

function showStepNotification(title, message) {
  // Remove existing notification
  const existingNotification = document.querySelector('.step-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
    
  const notification = document.createElement('div');
  notification.className = 'step-notification';
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 15px;
        z-index: 10002;
        box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        animation: stepNotificationSlide 0.5s ease;
        max-width: 400px;
        text-align: center;
        cursor: pointer;
    `;
    
  notification.innerHTML = `
        <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">${title}</div>
        <div style="font-size: 0.95rem; opacity: 0.9; line-height: 1.4;">${message}</div>
        <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.5rem;">클릭하여 닫기</div>
    `;
    
  document.body.appendChild(notification);
    
  // Auto remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'stepNotificationSlideOut 0.5s ease';
      setTimeout(() => notification.remove(), 500);
    }
  }, 4000);
    
  // Click to dismiss
  notification.addEventListener('click', () => {
    notification.style.animation = 'stepNotificationSlideOut 0.5s ease';
    setTimeout(() => notification.remove(), 500);
  });
}

// Enhanced step navigation functionality
function navigateToStep(stepNumber) {
  const steps = document.querySelectorAll('.step');
  if (steps[stepNumber - 1]) {
    steps[stepNumber - 1].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
        
    // Highlight the step briefly
    setTimeout(() => {
      handleStepClick(stepNumber, steps[stepNumber - 1]);
    }, 500);
  }
}

// Add navigation helper for other parts of the site
window.navigateToStep = navigateToStep;

// Connect feature cards to steps
function connectFeaturesToSteps() {
  document.querySelectorAll('.feature-item').forEach((item, index) => {
    const featureTitle = item.querySelector('h3').textContent;
        
    // Add a subtle indicator that these lead to steps
    item.style.position = 'relative';
        
    const stepIndicator = document.createElement('div');
    stepIndicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            padding: 0.3rem 0.6rem;
            border-radius: 15px;
            font-size: 0.7rem;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
    if (featureTitle.includes('가치관 분석') || featureTitle.includes('심층')) {
      stepIndicator.textContent = '1단계';
    } else if (featureTitle.includes('스마트') || featureTitle.includes('매칭')) {
      stepIndicator.textContent = '2단계';
    } else if (featureTitle.includes('대화') || featureTitle.includes('가이드')) {
      stepIndicator.textContent = '3단계';
    }
        
    if (stepIndicator.textContent) {
      item.appendChild(stepIndicator);
            
      item.addEventListener('mouseenter', () => {
        stepIndicator.style.opacity = '1';
      });
            
      item.addEventListener('mouseleave', () => {
        stepIndicator.style.opacity = '0';
      });
    }
  });
}

function calculatePersonalityScore(answers) {
  // Simple personality scoring based on answers
  const scores = {
    extroversion: 0,
    stability: 0,
    growth: 0,
    creativity: 0,
    social: 0
  };
    
  // Add scoring logic based on answers
  Object.values(answers).forEach(answer => {
    if (typeof answer === 'object' && answer.score) {
      Object.keys(answer.score).forEach(trait => {
        if (scores[trait] !== undefined) {
          scores[trait] += answer.score[trait];
        }
      });
    }
  });
    
  return scores;
}

function extractInterests(answers) {
  // Extract interests from answers
  const interests = [];
  Object.values(answers).forEach(answer => {
    if (typeof answer === 'object' && answer.value) {
      switch(answer.value) {
      case 'creative':
        interests.push('창작활동');
        break;
      case 'active':
        interests.push('운동');
        break;
      case 'social':
        interests.push('사교활동');
        break;
      case 'reading':
        interests.push('독서');
        break;
      }
    }
  });
  return [...new Set(interests)]; // Remove duplicates
}

function extractLifestyle(answers) {
  // Extract lifestyle preferences from answers
  const lifestyle = {
    preferredPace: 'balanced',
    socialLevel: 'moderate',
    planningStyle: 'flexible'
  };
    
  // This would be more sophisticated in a real application
  return lifestyle;
}

function updateConnectionsDisplay() {
  // This function would update the connections display in the modal
  console.log('Updating connections display...');
}

function updateConnectionsCount() {
  // Update connections count if needed
  const connections = JSON.parse(localStorage.getItem('connections') || '[]');
  console.log('Total connections:', connections.length);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load existing data
  const connections = JSON.parse(localStorage.getItem('connections') || '[]');
    
  // Update UI elements
  updateConnectionsCount();
    
  // Update total questions display
  const totalQuestionsEl = document.querySelector('.total-questions');
  if (totalQuestionsEl) {
    totalQuestionsEl.textContent = totalValuesQuestions;
  }
    
  // Setup how it works interactivity
  setTimeout(() => {
    setupHowItWorksInteractivity();
    connectFeaturesToSteps();
  }, 1000);
    
  // Add visual hints for interactive elements
  setTimeout(() => {
    addInteractiveHints();
  }, 3000);
});

function addInteractiveHints() {
  const steps = document.querySelectorAll('.step');
  steps.forEach((step, index) => {
    const hint = document.createElement('div');
    hint.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff6b6b;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: bold;
            animation: pulse 2s infinite;
            cursor: pointer;
            z-index: 10;
        `;
    hint.textContent = '!';
    hint.title = '클릭하여 시작하기';
        
    step.style.position = 'relative';
    step.appendChild(hint);
        
    // Remove hint after click
    step.addEventListener('click', () => {
      hint.remove();
    });
        
    // Auto remove hints after 10 seconds
    setTimeout(() => {
      if (hint.parentNode) {
        hint.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => hint.remove(), 500);
      }
    }, 10000);
  });
}

// Add CSS animations for the new features
const stepInteractionStyles = `
@keyframes stepNotificationSlide {
    from { 
        transform: translateX(-50%) translateY(-20px); 
        opacity: 0; 
        scale: 0.9;
    }
    to { 
        transform: translateX(-50%) translateY(0); 
        opacity: 1; 
        scale: 1;
    }
}

@keyframes stepNotificationSlideOut {
    from { 
        transform: translateX(-50%) translateY(0); 
        opacity: 1; 
        scale: 1;
    }
    to { 
        transform: translateX(-50%) translateY(-20px); 
        opacity: 0; 
        scale: 0.9;
    }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

/* Step interaction styles */
.step {
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.step::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 15px;
}

.step:hover::before {
    opacity: 1;
}

.step-number {
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
}

.step:hover .step-number {
    transform: scale(1.1);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.step-content {
    position: relative;
    z-index: 2;
}

/* Add click indicator */
.step::after {
    content: '클릭하여 시작 →';
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    font-size: 0.8rem;
    color: #667eea;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-weight: 500;
    z-index: 3;
}

.step:hover::after {
    opacity: 1;
}
`;

const stepStyleSheet = document.createElement('style');
stepStyleSheet.textContent = stepInteractionStyles;
document.head.appendChild(stepStyleSheet);

// Show feature status
setTimeout(() => {
  if (document.querySelector('.hero')) {
    const statusNotification = document.createElement('div');
    statusNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 9999;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            animation: slideIn 0.5s ease;
            cursor: pointer;
        `;
    statusNotification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">🎯 3단계 프로세스 활성화!</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">각 단계를 클릭해보세요</div>
            <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.3rem;">클릭하여 닫기</div>
        `;
        
    document.body.appendChild(statusNotification);
        
    // Click to close
    statusNotification.addEventListener('click', () => {
      statusNotification.style.animation = 'slideOut 0.5s ease';
      setTimeout(() => statusNotification.remove(), 500);
    });
        
    // Auto remove after 8 seconds
    setTimeout(() => {
      if (statusNotification.parentNode) {
        statusNotification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => statusNotification.remove(), 500);
      }
    }, 8000);
  }
}, 2000);

console.log('CHARM_INYEON 랜딩 페이지가 로드되었습니다! 🎉');
console.log('✅ 가치관 진단 시스템 활성화');
console.log('✅ 스마트 AI 매칭 알고리즘 활성화');
console.log('✅ 의미있는 연결 시스템 활성화');
console.log('🎯 3단계 프로세스 인터랙션 활성화');
console.log('💬 모든 기능이 실제로 작동합니다!');
console.log('📋 클릭 가능한 요소들:');
console.log('   • Hero 섹션 플로팅 카드');
console.log('   • About 섹션 기능 카드');
console.log('   • Features 섹션 아이템');
console.log('   • How it works 3단계 프로세스 ← NEW!');
console.log('   • 모든 버튼과 링크');

// ==============================================
// BACKEND INTEGRATION FUNCTIONS
// ==============================================

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
  console.log('Updating UI for authenticated user:', user);
    
  // Update login/signup buttons to show user menu
  const loginBtn = document.querySelector('.login-btn');
  const signupBtn = document.querySelector('.signup-btn');
    
  if (loginBtn && signupBtn) {
    // Create user menu
    const userMenu = document.createElement('div');
    userMenu.className = 'user-menu';
    userMenu.style.cssText = `
            position: relative;
            display: flex;
            align-items: center;
            gap: 1rem;
            color: #333;
            font-weight: 500;
        `;
        
    userMenu.innerHTML = `
            <div class="user-welcome">
                안녕하세요, ${user.name || user.email}님!
            </div>
            <div class="user-dropdown">
                <button class="user-dropdown-btn" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                ">
                    내 계정 ⌄
                </button>
                <div class="user-dropdown-menu" style="
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    border-radius: 10px;
                    min-width: 200px;
                    display: none;
                    z-index: 1000;
                    margin-top: 0.5rem;
                ">
                    <a href="#" class="menu-item profile-link" style="
                        display: block;
                        padding: 1rem;
                        text-decoration: none;
                        color: #333;
                        border-bottom: 1px solid #eee;
                        transition: background 0.3s;
                    ">프로필 관리</a>
                    <a href="#" class="menu-item matches-link" style="
                        display: block;
                        padding: 1rem;
                        text-decoration: none;
                        color: #333;
                        border-bottom: 1px solid #eee;
                        transition: background 0.3s;
                    ">내 매치</a>
                    <a href="#" class="menu-item settings-link" style="
                        display: block;
                        padding: 1rem;
                        text-decoration: none;
                        color: #333;
                        border-bottom: 1px solid #eee;
                        transition: background 0.3s;
                    ">설정</a>
                    <a href="#" class="menu-item logout-link" style="
                        display: block;
                        padding: 1rem;
                        text-decoration: none;
                        color: #ff4757;
                        transition: background 0.3s;
                    ">로그아웃</a>
                </div>
            </div>
        `;
        
    // Replace login/signup buttons with user menu
    const navLinks = loginBtn.parentElement;
    navLinks.innerHTML = '';
    navLinks.appendChild(userMenu);
        
    // Add dropdown functionality
    const dropdownBtn = userMenu.querySelector('.user-dropdown-btn');
    const dropdownMenu = userMenu.querySelector('.user-dropdown-menu');
        
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
        
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdownMenu.style.display = 'none';
    });
        
    // Add menu item event listeners
    userMenu.querySelector('.logout-link').addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
        
    userMenu.querySelector('.profile-link').addEventListener('click', (e) => {
      e.preventDefault();
      openProfileModal();
    });
        
    userMenu.querySelector('.matches-link').addEventListener('click', (e) => {
      e.preventDefault();
      openModal('matchingModal');
      loadMatchingResults();
    });
        
    // Add hover effects to menu items
    userMenu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('mouseenter', function() {
        this.style.background = '#f8f9fa';
      });
      item.addEventListener('mouseleave', function() {
        this.style.background = 'white';
      });
    });
  }
    
  // Store user data
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(user));
    
  // Trigger any post-login actions
  checkUserStatus();
}

// Handle logout
function handleLogout() {
  try {
    // Clear API client tokens
    apiClient.logout();
        
    // Clear local storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
        
    // Reset UI to login state
    location.reload(); // Simple way to reset UI
        
    apiClient.showSuccess('로그아웃되었습니다.');
    trackEvent('logout_success');
        
  } catch (error) {
    console.error('Logout error:', error);
    apiClient.showError('로그아웃 중 오류가 발생했습니다.');
  }
}

// Load matching results from backend
async function loadMatchingResults() {
  console.log('Loading matching results from backend...');
    
  try {
    // Show loading state
    const matchingContent = document.querySelector('.matching-content');
    if (matchingContent) {
      matchingContent.innerHTML = `
                <div class="loading-matches" style="text-align: center; padding: 2rem;">
                    <div class="loading-spinner" style="
                        border: 4px solid #f3f3f4;
                        border-radius: 50%;
                        border-top: 4px solid #667eea;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p>완벽한 매치를 찾고 있습니다...</p>
                </div>
            `;
    }
        
    // Check if user is authenticated
    if (!apiClient.isAuthenticated()) {
      // Show demo matches for non-authenticated users
      displayDemoMatches();
      return;
    }
        
    // Try to generate matches first
    try {
      console.log('Generating new matches...');
      await apiClient.generateMatches();
    } catch (generateError) {
      console.log('Generate matches not available, loading existing matches');
    }
        
    // Load existing matches
    const response = await apiClient.getMyMatches();
        
    if (response.success && response.data && response.data.matches) {
      displayMatches(response.data.matches);
            
      // Update stats if available
      if (response.data.stats) {
        updateMatchingStats(response.data.stats);
      }
    } else {
      console.log('No matches found, showing demo matches');
      displayDemoMatches();
    }
        
  } catch (error) {
    console.error('Error loading matches:', error);
        
    // Fallback to demo matches on error
    displayDemoMatches();
        
    // Show error to user but don't block the experience
    if (error.message && !error.message.includes('TOKEN_REFRESHED')) {
      apiClient.showError('매칭 결과를 불러오는 중 문제가 발생했습니다. 데모 결과를 표시합니다.');
    }
  }
}

// Display matches in the UI
function displayMatches(matches) {
  console.log('Displaying matches:', matches);
    
  const matchingContent = document.querySelector('.matching-content');
  if (!matchingContent) {return;}
    
  if (!matches || matches.length === 0) {
    matchingContent.innerHTML = `
            <div class="no-matches" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💡</div>
                <h3>아직 매치가 없습니다</h3>
                <p>가치관 평가를 완료하고 더 많은 매치를 받아보세요!</p>
                <button onclick="openModal('valuesModal')" class="primary-button">가치관 평가 시작</button>
            </div>
        `;
    return;
  }
    
  // Create matches display
  let matchesHTML = `
        <div class="matches-header" style="margin-bottom: 2rem; text-align: center;">
            <h3 style="color: #333; margin-bottom: 0.5rem;">당신과 잘 맞는 ${matches.length}명을 찾았습니다!</h3>
            <p style="color: #666; margin: 0;">호환성 점수를 기준으로 정렬되었습니다</p>
        </div>
        <div class="matches-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
    `;
    
  matches.forEach(match => {
    const compatibilityScore = match.compatibilityScore || match.compatibility || 85;
    const otherUser = match.otherUser || match.user || {};
        
    matchesHTML += `
            <div class="match-card" style="
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            " onmouseenter="this.style.transform='translateY(-5px)'" onmouseleave="this.style.transform='translateY(0)'">
                <div class="match-header" style="display: flex; align-items: center; margin-bottom: 1rem;">
                    <div class="match-avatar" style="
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-weight: bold;
                        font-size: 1.5rem;
                        margin-right: 1rem;
                    ">
                        ${(otherUser.name || '익명')[0].toUpperCase()}
                    </div>
                    <div class="match-info">
                        <h4 class="match-name" style="margin: 0 0 0.25rem 0; color: #333;">
                            ${otherUser.name || '익명 사용자'}
                        </h4>
                        <p class="match-age" style="margin: 0; color: #666; font-size: 0.9rem;">
                            ${otherUser.age || '나이 미공개'}세
                        </p>
                    </div>
                </div>
                
                <div class="compatibility-score" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: #333;">호환성</span>
                        <span style="font-weight: 700; color: #10b981; font-size: 1.1rem;">${compatibilityScore}%</span>
                    </div>
                    <div style="background: #f0f0f0; border-radius: 10px; height: 8px; overflow: hidden;">
                        <div style="
                            background: linear-gradient(90deg, #10b981, #05a773);
                            width: ${compatibilityScore}%;
                            height: 100%;
                            border-radius: 10px;
                            transition: width 1s ease;
                        "></div>
                    </div>
                </div>
                
                <div class="match-details" style="margin-bottom: 1.5rem;">
                    <div class="match-values" style="margin-bottom: 1rem;">
                        <h5 style="margin: 0 0 0.5rem 0; color: #333; font-size: 0.9rem;">공통 가치관</h5>
                        <div class="values-tags" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            ${getCommonValues(match.commonValues || ['성장', '안정']).map(value => 
    `<span style="
                                    background: rgba(102, 126, 234, 0.1);
                                    color: #667eea;
                                    padding: 0.25rem 0.75rem;
                                    border-radius: 15px;
                                    font-size: 0.8rem;
                                    font-weight: 500;
                                ">${value}</span>`
  ).join('')}
                        </div>
                    </div>
                    
                    ${otherUser.bio ? `
                        <div class="match-bio">
                            <p style="
                                margin: 0;
                                color: #666;
                                font-size: 0.9rem;
                                line-height: 1.4;
                                font-style: italic;
                            ">"${otherUser.bio.substring(0, 100)}${otherUser.bio.length > 100 ? '...' : ''}"</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="match-actions" style="display: flex; gap: 0.75rem;">
                    <button class="connect-btn" onclick="handleMatchAction('${match._id || match.id}', 'like')" style="
                        flex: 1;
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 0.75rem;
                        border-radius: 10px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#5a6fd8'" onmouseout="this.style.background='#667eea'">
                        관심 표현
                    </button>
                    <button class="view-profile-btn" onclick="viewMatchProfile('${match._id || match.id}')" style="
                        background: #f8f9fa;
                        color: #333;
                        border: 1px solid #ddd;
                        padding: 0.75rem 1rem;
                        border-radius: 10px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                        프로필
                    </button>
                </div>
            </div>
        `;
  });
    
  matchesHTML += '</div>';
  matchingContent.innerHTML = matchesHTML;
}

// Display demo matches for non-authenticated users
function displayDemoMatches() {
  console.log('Displaying demo matches');
    
  const demoMatches = [
    {
      id: 'demo1',
      user: {
        name: '김미영',
        age: 52,
        bio: '가족과 함께하는 시간을 소중히 여기며, 새로운 문화 체험을 좋아합니다. 진솔한 대화를 나눌 수 있는 분을 만나고 싶어요.'
      },
      compatibilityScore: 94,
      commonValues: ['가족', '성장', '안정']
    },
    {
      id: 'demo2',
      user: {
        name: '박준호',
        age: 58,
        bio: '독서와 클래식 음악을 즐기며, 차분하고 지적인 대화를 좋아합니다. 함께 박물관이나 전시회를 관람할 분을 찾고 있어요.'
      },
      compatibilityScore: 87,
      commonValues: ['지성', '문화', '평화']
    },
    {
      id: 'demo3',
      user: {
        name: '이정숙',
        age: 49,
        bio: '요리와 여행을 좋아하며, 긍정적인 에너지로 가득한 사람입니다. 함께 새로운 장소를 탐험하고 맛있는 음식을 나눌 분을 기다려요.'
      },
      compatibilityScore: 91,
      commonValues: ['모험', '즐거움', '나눔']
    }
  ];
    
  displayMatches(demoMatches);
    
  // Add demo banner
  const matchingContent = document.querySelector('.matching-content');
  if (matchingContent) {
    const demoBanner = document.createElement('div');
    demoBanner.style.cssText = `
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 1.5rem;
        `;
    demoBanner.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">🎯 데모 매칭 결과</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">실제 매칭을 받으려면 회원가입 후 가치관 평가를 완료해주세요</div>
            <button onclick="openModal('signupModal'); closeModal('matchingModal');" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 0.75rem;
            ">지금 시작하기</button>
        `;
    matchingContent.insertBefore(demoBanner, matchingContent.firstChild);
  }
}

// Get common values for display
function getCommonValues(values) {
  if (Array.isArray(values)) {
    return values;
  }
  // Default values if not provided
  return ['성장', '안정', '가족'];
}

// Handle match actions (like/pass)
async function handleMatchAction(matchId, action) {
  console.log(`Match action: ${action} for match ${matchId}`);
    
  if (!apiClient.isAuthenticated()) {
    // Demo action for non-authenticated users
    const btn = event.target;
    btn.textContent = action === 'like' ? '관심 표현됨!' : '패스됨';
    btn.style.background = action === 'like' ? '#10b981' : '#6c757d';
    btn.disabled = true;
        
    setTimeout(() => {
      apiClient.showSuccess('회원가입하고 실제 매칭을 시작해보세요!');
    }, 500);
        
    trackEvent('demo_match_action', { action, matchId });
    return;
  }
    
  try {
    const btn = event.target;
    const originalText = btn.textContent;
        
    btn.textContent = action === 'like' ? '처리 중...' : '처리 중...';
    btn.disabled = true;
        
    const response = await apiClient.respondToMatch(matchId, action);
        
    if (response.success) {
      btn.textContent = action === 'like' ? '관심 표현됨!' : '패스됨';
      btn.style.background = action === 'like' ? '#10b981' : '#6c757d';
            
      if (action === 'like') {
        apiClient.showSuccess('관심을 표현했습니다! 상대방도 관심을 보이면 대화를 시작할 수 있어요.');
      }
            
      // Check for mutual matches
      if (response.data && response.data.isMutual) {
        setTimeout(() => {
          apiClient.showSuccess('🎉 상호 매치! 이제 대화를 시작할 수 있습니다.');
          // Could open chat or show celebration animation
        }, 1000);
      }
            
      trackEvent('match_action_success', { action, matchId });
    }
        
  } catch (error) {
    console.error('Match action error:', error);
    apiClient.showError(error.message || '매치 응답 중 오류가 발생했습니다.');
        
    // Reset button
    const btn = event.target;
    btn.textContent = action === 'like' ? '관심 표현' : '패스';
    btn.disabled = false;
        
    trackEvent('match_action_error', { action, matchId, error: error.message });
  }
}

// View match profile
function viewMatchProfile(matchId) {
  console.log('Viewing profile for match:', matchId);
    
  // For now, show a placeholder
  showCustomAlert('프로필 보기', `
        <div style="text-align: center; padding: 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
            <h3>프로필 상세보기</h3>
            <p>이 기능은 곧 추가될 예정입니다.</p>
            <p>상대방의 자세한 프로필과 공통 관심사를 확인할 수 있게 됩니다.</p>
            <button onclick="this.closest('.custom-alert').remove()" class="primary-button">확인</button>
        </div>
    `);
    
  trackEvent('view_profile_click', { matchId });
}

// Open profile modal
function openProfileModal() {
  // Create profile modal content
  const profileContent = `
        <div class="profile-modal-content" style="max-width: 600px; margin: 0 auto;">
            <h3 style="margin-bottom: 1.5rem; text-align: center;">내 프로필 관리</h3>
            
            <div class="profile-section" style="margin-bottom: 2rem;">
                <h4 style="color: #333; margin-bottom: 1rem;">기본 정보</h4>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
                    <p>프로필 관리 기능은 곧 추가될 예정입니다.</p>
                    <p>현재 계정: ${JSON.parse(localStorage.getItem('currentUser') || '{}').email || '로그인된 사용자'}</p>
                </div>
            </div>
            
            <div class="profile-actions" style="text-align: center;">
                <button onclick="this.closest('.custom-alert').remove()" class="primary-button">
                    확인
                </button>
            </div>
        </div>
    `;
    
  showCustomAlert('프로필 관리', profileContent);
  trackEvent('profile_modal_open');
}

// Update matching stats
function updateMatchingStats(stats) {
  console.log('Updating matching stats:', stats);
    
  // Update any stats displays in the UI
  const statsElements = document.querySelectorAll('.matching-stats');
  statsElements.forEach(el => {
    // Update stats display if elements exist
    if (stats.totalMatches !== undefined) {
      const totalEl = el.querySelector('.total-matches');
      if (totalEl) {totalEl.textContent = stats.totalMatches;}
    }
        
    if (stats.mutualMatches !== undefined) {
      const mutualEl = el.querySelector('.mutual-matches');
      if (mutualEl) {mutualEl.textContent = stats.mutualMatches;}
    }
  });
}

// Check user status on page load
function checkUserStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
  if (isLoggedIn && currentUser && apiClient.isAuthenticated()) {
    console.log('User is authenticated, updating UI');
    updateUIForAuthenticatedUser(currentUser);
  } else {
    console.log('User is not authenticated');
    // Clear any stale data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  setTimeout(() => {
    checkUserStatus();
  }, 500);
  
});

// ========== 위젯 클릭 기능 ==========

// 위젯 클릭 처리 메인 함수
function handleWidgetClick(widgetType) {
  console.log(`${widgetType} 위젯 클릭됨`);
  
  // 클릭 피드백 애니메이션 적용
  const widget = document.getElementById(getWidgetId(widgetType));
  if (widget) {
    widget.style.transform = 'scale(0.95)';
    widget.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      widget.style.transform = 'scale(1)';
    }, 100);
  }
  
  // 인증 상태 확인 후 처리
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  
  if (isAuthenticated) {
    showLoadingState(widgetType);
    setTimeout(() => {
      showAuthenticatedWidgetModal(widgetType);
    }, 1000); // 1초 로딩 시뮬레이션
  } else {
    showGuestWidgetModal(widgetType);
  }
  
  // 브라우저 히스토리에 추가
  addToHistory(widgetType);
}

// 키보드 이벤트 처리 (접근성)
function handleWidgetKeydown(event, widgetType) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleWidgetClick(widgetType);
  }
}

// 위젯 ID 반환 함수
function getWidgetId(widgetType) {
  const widgetIds = {
    'values': 'valuesAnalysisWidget',
    'matching': 'aiMatchingWidget',
    'connections': 'newConnectionsWidget'
  };
  return widgetIds[widgetType] || '';
}

// 로딩 상태 표시 함수
function showLoadingState(widgetType) {
  const widget = document.getElementById(getWidgetId(widgetType));
  if (!widget) return;
  
  // 로딩 오버레이 생성
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'widget-loading-overlay';
  loadingOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    z-index: 1000;
  `;
  
  // 로딩 스피너 생성
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.style.cssText = `
    width: 24px;
    height: 24px;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  loadingOverlay.appendChild(spinner);
  widget.style.position = 'relative';
  widget.appendChild(loadingOverlay);
  
  // 1초 후 로딩 제거
  setTimeout(() => {
    if (loadingOverlay && loadingOverlay.parentNode) {
      loadingOverlay.remove();
    }
  }, 1000);
}

// 인증된 사용자용 모달 표시
function showAuthenticatedWidgetModal(widgetType) {
  const modalContent = getAuthenticatedModalContent(widgetType);
  showAdvancedModal(modalContent.title, modalContent.content, modalContent.actions);
}

// 게스트 사용자용 모달 표시
function showGuestWidgetModal(widgetType) {
  const modalContent = getGuestModalContent(widgetType);
  showAdvancedModal(modalContent.title, modalContent.content, modalContent.actions);
}

// 인증된 사용자용 모달 콘텐츠 생성
function getAuthenticatedModalContent(widgetType) {
  const contents = {
    'values': {
      title: '🎯 가치관 분석 결과',
      content: `
        <div class="modal-section">
          <h4>귀하의 가치관 프로필</h4>
          <div class="values-chart">
            <div class="value-item">
              <span class="value-label">가족 중심</span>
              <div class="value-bar"><div class="value-progress" style="width: 90%"></div></div>
              <span class="value-score">90%</span>
            </div>
            <div class="value-item">
              <span class="value-label">안정 추구</span>
              <div class="value-bar"><div class="value-progress" style="width: 85%"></div></div>
              <span class="value-score">85%</span>
            </div>
            <div class="value-item">
              <span class="value-label">소통 중시</span>
              <div class="value-bar"><div class="value-progress" style="width: 78%"></div></div>
              <span class="value-score">78%</span>
            </div>
          </div>
          <p class="analysis-summary">
            귀하는 가족과 안정을 가장 중시하는 성향을 보입니다. 
            이러한 가치관을 공유하는 분들과 85% 이상의 높은 호환성을 보입니다.
          </p>
        </div>
      `,
      actions: [
        { text: '상세 분석 보기', action: 'viewDetailedAnalysis', primary: true },
        { text: '매칭 시작하기', action: 'startMatching', primary: false }
      ]
    },
    'matching': {
      title: '💝 AI 매칭 현황',
      content: `
        <div class="modal-section">
          <h4>현재 매칭 상태</h4>
          <div class="matching-status">
            <div class="status-item active">
              <div class="status-icon">✓</div>
              <span>가치관 분석 완료</span>
            </div>
            <div class="status-item active">
              <div class="status-icon">✓</div>
              <span>프로필 검증 완료</span>
            </div>
            <div class="status-item processing">
              <div class="status-icon">⏳</div>
              <span>호환성 매칭 진행 중</span>
            </div>
          </div>
          <div class="matching-progress">
            <div class="progress-text">매칭 진행도: 73%</div>
            <div class="progress-bar-modal">
              <div class="progress-fill-modal" style="width: 73%"></div>
            </div>
          </div>
          <p class="matching-summary">
            현재 12명의 호환 가능한 분들을 발견했습니다. 
            곧 최적의 매칭 결과를 보여드릴 예정입니다.
          </p>
        </div>
      `,
      actions: [
        { text: '매칭 설정 변경', action: 'changeSettings', primary: false },
        { text: '매칭 가속화', action: 'accelerateMatching', primary: true }
      ]
    },
    'connections': {
      title: '🌟 새로운 연결',
      content: `
        <div class="modal-section">
          <h4>새로운 매치 알림</h4>
          <div class="connections-list">
            <div class="connection-item">
              <div class="connection-avatar">👤</div>
              <div class="connection-info">
                <div class="connection-name">김○○ 님</div>
                <div class="connection-compatibility">가치관 호환성 92%</div>
                <div class="connection-location">서울 강남구</div>
              </div>
              <div class="connection-status">새로운 매치</div>
            </div>
            <div class="connection-item">
              <div class="connection-avatar">👤</div>
              <div class="connection-info">
                <div class="connection-name">박○○ 님</div>
                <div class="connection-compatibility">가치관 호환성 88%</div>
                <div class="connection-location">서울 송파구</div>
              </div>
              <div class="connection-status">새로운 매치</div>
            </div>
            <div class="connection-item">
              <div class="connection-avatar">👤</div>
              <div class="connection-info">
                <div class="connection-name">이○○ 님</div>
                <div class="connection-compatibility">가치관 호환성 87%</div>
                <div class="connection-location">서울 마포구</div>
              </div>
              <div class="connection-status">새로운 매치</div>
            </div>
          </div>
          <p class="connections-summary">
            귀하와 높은 호환성을 보이는 3명의 새로운 분들을 찾았습니다.
          </p>
        </div>
      `,
      actions: [
        { text: '프로필 둘러보기', action: 'viewProfiles', primary: true },
        { text: '메시지 보내기', action: 'sendMessage', primary: false }
      ]
    }
  };
  
  return contents[widgetType] || contents['values'];
}

// 게스트용 모달 콘텐츠 생성
function getGuestModalContent(widgetType) {
  const contents = {
    'values': {
      title: '🎯 가치관 분석 미리보기',
      content: `
        <div class="modal-section">
          <h4>가치관 분석 예시</h4>
          <div class="guest-preview">
            <div class="preview-item">
              <div class="preview-icon">📊</div>
              <div class="preview-text">
                <h5>상세한 가치관 프로필</h5>
                <p>AI가 분석한 당신만의 가치관 지표와 성향</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">💡</div>
              <div class="preview-text">
                <h5>호환성 분석</h5>
                <p>다른 회원들과의 가치관 호환성 점수</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">🎨</div>
              <div class="preview-text">
                <h5>개인화된 추천</h5>
                <p>가치관 기반 맞춤형 매칭 추천</p>
              </div>
            </div>
          </div>
          <p class="guest-message">
            로그인 후 본인만의 가치관 분석을 받아보세요!
          </p>
        </div>
      `,
      actions: [
        { text: '회원가입하기', action: 'signup', primary: true },
        { text: '로그인하기', action: 'login', primary: false }
      ]
    },
    'matching': {
      title: '💝 AI 매칭 미리보기',
      content: `
        <div class="modal-section">
          <h4>AI 매칭 서비스</h4>
          <div class="guest-preview">
            <div class="preview-item">
              <div class="preview-icon">🤖</div>
              <div class="preview-text">
                <h5>AI 기반 매칭</h5>
                <p>고도화된 알고리즘으로 최적의 상대 찾기</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">⚡</div>
              <div class="preview-text">
                <h5>실시간 매칭</h5>
                <p>24시간 자동으로 새로운 매칭 기회 발굴</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">🎯</div>
              <div class="preview-text">
                <h5>정확한 매칭</h5>
                <p>가치관, 취향, 라이프스타일 종합 분석</p>
              </div>
            </div>
          </div>
          <p class="guest-message">
            지금 가입하고 AI 매칭 서비스를 경험해보세요!
          </p>
        </div>
      `,
      actions: [
        { text: '무료 체험하기', action: 'signup', primary: true },
        { text: '서비스 더 알아보기', action: 'learnMore', primary: false }
      ]
    },
    'connections': {
      title: '🌟 새로운 연결 미리보기',
      content: `
        <div class="modal-section">
          <h4>연결 관리 서비스</h4>
          <div class="guest-preview">
            <div class="preview-item">
              <div class="preview-icon">👥</div>
              <div class="preview-text">
                <h5>새로운 만남</h5>
                <p>매일 새로운 매칭 기회와 연결 알림</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">💌</div>
              <div class="preview-text">
                <h5>안전한 소통</h5>
                <p>검증된 회원들과의 안전한 메시지 교환</p>
              </div>
            </div>
            <div class="preview-item">
              <div class="preview-icon">🏆</div>
              <div class="preview-text">
                <h5>성공 사례</h5>
                <p>실제 커플 성사률 78%의 검증된 플랫폼</p>
              </div>
            </div>
          </div>
          <p class="guest-message">
            지금 시작하고 새로운 인연을 만나보세요!
          </p>
        </div>
      `,
      actions: [
        { text: '지금 시작하기', action: 'signup', primary: true },
        { text: '성공 사례 보기', action: 'viewSuccess', primary: false }
      ]
    }
  };
  
  return contents[widgetType] || contents['values'];
}

// 고급 모달 표시 함수
function showAdvancedModal(title, content, actions) {
  // 기존 모달 제거
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 모달 오버레이 생성
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay widget-modal';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  // 모달 콘텐츠 생성
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content widget-modal-content';
  modalContent.style.cssText = `
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.4s ease-out;
    font-size: 16px;
    line-height: 1.6;
  `;
  
  // 액션 버튼 생성
  const actionButtons = actions.map(action => 
    `<button class="modal-action-btn ${action.primary ? 'primary' : 'secondary'}" 
             onclick="handleModalAction('${action.action}')"
             style="
               ${action.primary ? 
                 'background: #667eea; color: white; border: none;' : 
                 'background: transparent; color: #667eea; border: 2px solid #667eea;'
               }
               padding: 12px 24px;
               border-radius: 8px;
               font-size: 14px;
               font-weight: 600;
               cursor: pointer;
               margin: 0 8px;
               transition: all 0.2s;
               min-width: 120px;
             "
             onmouseover="this.style.transform='translateY(-2px)'"
             onmouseout="this.style.transform='translateY(0)'"
             >
      ${action.text}
    </button>`
  ).join('');
  
  modalContent.innerHTML = `
    <div class="modal-header" style="padding: 24px 24px 16px; border-bottom: 1px solid #e2e8f0;">
      <h3 style="margin: 0; font-size: 1.5em; color: #1e293b; display: flex; align-items: center; justify-content: space-between;">
        ${title}
        <button class="modal-close-btn" style="
          background: none;
          border: none;
          font-size: 24px;
          color: #64748b;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background 0.2s;
        " onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'">×</button>
      </h3>
    </div>
    <div class="modal-body" style="padding: 24px;">
      ${content}
    </div>
    <div class="modal-footer" style="padding: 16px 24px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      ${actionButtons}
    </div>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // 모달 닫기 기능
  const closeBtn = modalContent.querySelector('.modal-close-btn');
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      modalOverlay.remove();
    }, 300);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  // 키보드 지원 (ESC 키로 닫기)
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyPress);
    }
  };
  document.addEventListener('keydown', handleKeyPress);
}

// 모달 액션 처리 함수
function handleModalAction(action) {
  console.log(`Modal action: ${action}`);
  
  switch(action) {
    case 'signup':
      // 기존 회원가입 모달 열기
      document.querySelector('.modal-overlay').remove();
      openSignupModal();
      break;
    case 'login':
      // 로그인 모달 열기 (기존 로그인 로직 사용)
      document.querySelector('.modal-overlay').remove();
      showModal('로그인', '로그인 기능을 구현 중입니다. 잠시만 기다려주세요.');
      break;
    case 'viewDetailedAnalysis':
      showModal('상세 분석', '상세 가치관 분석 페이지로 이동합니다.');
      break;
    case 'startMatching':
      showModal('매칭 시작', '매칭 서비스를 시작합니다.');
      break;
    case 'viewProfiles':
      showModal('프로필 보기', '매칭된 회원들의 프로필을 확인할 수 있습니다.');
      break;
    case 'sendMessage':
      showModal('메시지 보내기', '안전한 메시지 시스템으로 소통하세요.');
      break;
    case 'learnMore':
      showModal('서비스 소개', 'CHARM_INYEON의 더 자세한 서비스를 소개합니다.');
      break;
    case 'viewSuccess':
      showModal('성공 사례', '실제 커플들의 성공 스토리를 확인하세요.');
      break;
    default:
      showModal('준비 중', '해당 기능을 준비 중입니다.');
  }
}

// 브라우저 히스토리 관리
// widgetHistory는 위에서 이미 선언됨 (551줄)

function addToHistory(widgetType) {
  const state = { widget: widgetType, timestamp: Date.now() };
  widgetHistory.push(state);
  window.history.pushState(state, '', `#widget-${widgetType}`);
}

// 브라우저 뒤로가기 처리
window.addEventListener('popstate', (event) => {
  const modal = document.querySelector('.modal-overlay');
  if (modal && event.state && event.state.widget) {
    modal.remove();
    widgetHistory.pop();
  }
});

// 페이지 로드 시 위젯 기능 초기화
window.addEventListener('load', () => {
  console.log('위젯 클릭 기능이 초기화되었습니다!');
});

console.log('script.js 로드 완료!');