// CHARM_INYEON 메인 스크립트 - 통합 및 정리된 버전

// 페이지 로드 시 모든 기능 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 CHARM_INYEON 초기화 시작');
  
  initializeNavigation();
  initializeContactForm();
  initializeMobileMenu();
  initializeButtons();
  initializeModals();
  
  console.log('✅ 모든 기능 초기화 완료');
});

// ========== 네비게이션 기능 ==========
function initializeNavigation() {
  // 네비게이션 링크 클릭 이벤트
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        updateActiveNavLink(this);
      }
    });
  });
  
  // 스크롤 시 활성 네비게이션 업데이트
  window.addEventListener('scroll', throttle(updateActiveNavOnScroll, 100));
}

function updateActiveNavLink(activeLink) {
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}

function updateActiveNavOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    const sectionHeight = section.offsetHeight;
    
    if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// ========== 모바일 메뉴 ==========
function initializeMobileMenu() {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      this.classList.toggle('active');
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
      });
    });
  }
}

// ========== 버튼 기능 통합 ==========
function initializeButtons() {
  console.log('🔘 버튼 초기화 시작');
  
  // 1. 무료로 시작하기 버튼 → 가치관 테스트
  const startButtons = document.querySelectorAll('.primary-button');
  startButtons.forEach(button => {
    if (button.textContent.includes('무료로 시작하기')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🎯 가치관 테스트로 이동');
        window.location.href = 'values-assessment.html';
      });
      console.log('✅ 무료로 시작하기 버튼 연결됨');
    }
  });
  
  // 2. 회원가입 버튼들 → 회원가입 페이지
  const signupButtons = document.querySelectorAll('.signup-btn, #signup-btn-2, .cta-large-button');
  signupButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('📝 회원가입 페이지로 이동');
      window.location.href = 'signup.html';
    });
  });
  console.log('✅ 회원가입 버튼들 연결됨');
  
  // 3. 소개 영상 보기 버튼 → 애니메이션
  const videoButton = document.querySelector('.secondary-button');
  if (videoButton) {
    videoButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🎬 소개 애니메이션 실행');
      openIntroAnimation();
    });
    console.log('✅ 소개 영상 버튼 연결됨');
  }
  
  // 4. 로그인 버튼 → 로그인 모달
  const loginButtons = document.querySelectorAll('.login-btn');
  loginButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🔑 로그인 모달 실행');
      openLoginModal();
    });
  });
  console.log('✅ 로그인 버튼들 연결됨');
}

// ========== 모달 관리 시스템 ==========
function initializeModals() {
  console.log('🖼️ 모달 시스템 초기화');
  
  // 모든 모달 닫기 버튼
  const closeButtons = document.querySelectorAll('.close[data-modal]');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      closeModal(modalId);
    });
  });
  
  // 모달 배경 클릭 시 닫기
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // ESC 키로 모달 닫기
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal[style*="display: block"]');
      openModals.forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
  
  // 회원가입 <-> 로그인 전환
  const showSignupLink = document.getElementById('showSignup');
  const showLoginLink = document.getElementById('showLogin');
  
  if (showSignupLink) {
    showSignupLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal('loginModal');
      setTimeout(() => openSignupModal(), 300);
    });
  }
  
  if (showLoginLink) {
    showLoginLink.addEventListener('click', function(e) {
      e.preventDefault();
      closeModal('signupModal');
      setTimeout(() => openLoginModal(), 300);
    });
  }
  
  // 로그인 폼 제출
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }
  
  // 회원가입 폼 제출
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignupSubmit);
  }
  
  console.log('✅ 모달 시스템 초기화 완료');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 복원
    console.log(`📱 모달 닫힘: ${modalId}`);
  }
}

function openSignupModal() {
  console.log('📝 회원가입 모달 열기');
  const signupModal = document.getElementById('signupModal');
  if (signupModal) {
    signupModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      signupModal.style.opacity = '1';
    }, 10);
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  console.log('🔐 로그인 시도');
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  // 임시 로그인 처리 (실제로는 백엔드 API 호출)
  if (email && password) {
    showModal('로그인 성공', `환영합니다! ${email}님\n\n현재는 프론트엔드 테스트 모드입니다.\n백엔드 연동 후 실제 로그인 기능이 활성화됩니다.`);
    closeModal('loginModal');
    
    // 폼 초기화
    e.target.reset();
  } else {
    showModal('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
  }
}

function handleSignupSubmit(e) {
  e.preventDefault();
  console.log('📝 회원가입 시도');
  
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  // 기본 검증
  if (!name || !email || !password || !confirmPassword) {
    showModal('입력 오류', '모든 필수 항목을 입력해주세요.');
    return;
  }
  
  if (password !== confirmPassword) {
    showModal('비밀번호 오류', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    return;
  }
  
  // 임시 회원가입 처리
  showModal('회원가입 완료', `환영합니다, ${name}님!\n\n회원가입이 완료되었습니다.\n현재는 프론트엔드 테스트 모드입니다.`);
  closeModal('signupModal');
  
  // 폼 초기화
  e.target.reset();
}

// ========== 모달 기능 ==========
function showModal(title, message) {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
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
  
  const closeBtn = modalContent.querySelector('.modal-close-btn');
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => modalOverlay.remove(), 200);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  document.addEventListener('keydown', function handleKeyPress(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyPress);
    }
  });
}

function openLoginModal() {
  console.log('🔑 로그인 모달 열기');
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    loginModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    
    // 모달 애니메이션
    setTimeout(() => {
      loginModal.style.opacity = '1';
    }, 10);
  } else {
    console.error('로그인 모달을 찾을 수 없습니다.');
    showModal('로그인', '로그인 기능은 곧 추가될 예정입니다!');
  }
}

// ========== 소개 애니메이션 ==========
function openIntroAnimation() {
  console.log('🎭 소개 애니메이션 모달 열기');
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'intro-modal-overlay';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeIn 0.5s ease-out;
  `;

  const animationContainer = document.createElement('div');
  animationContainer.className = 'intro-animation-container';
  animationContainer.style.cssText = `
    width: 90%;
    max-width: 800px;
    height: 80%;
    max-height: 600px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    animation: slideUp 0.6s ease-out;
  `;

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 24px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10001;
  `;

  animationContainer.innerHTML = `
    <div style="text-align: center; color: white; padding: 2rem;">
      <div style="font-size: 3rem; font-weight: bold; margin-bottom: 2rem; animation: pulse 2s infinite;">
        CHARM_INYEON
      </div>
      <div style="font-size: 1.5rem; margin-bottom: 3rem; opacity: 0.9;">
        💕 진정한 인연을 위한 여정
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin: 2rem 0;">
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem; animation: bounce 2s infinite;">🧠</div>
          <h3 style="margin-bottom: 0.5rem;">AI 기반 분석</h3>
          <p style="font-size: 0.9rem; opacity: 0.8;">가치관 맞춤 매칭</p>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem; animation: bounce 2s infinite 0.3s;">🎯</div>
          <h3 style="margin-bottom: 0.5rem;">정확한 매칭</h3>
          <p style="font-size: 0.9rem; opacity: 0.8;">70% 이상 호환성</p>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem; animation: bounce 2s infinite 0.6s;">🔒</div>
          <h3 style="margin-bottom: 0.5rem;">안전한 만남</h3>
          <p style="font-size: 0.9rem; opacity: 0.8;">신뢰할 수 있는 플랫폼</p>
        </div>
      </div>
      <button onclick="closeIntroAnimation()" style="
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        margin-top: 2rem;
      ">
        ✨ 지금 시작하기
      </button>
    </div>
  `;

  animationContainer.appendChild(closeButton);
  modalOverlay.appendChild(animationContainer);
  document.body.appendChild(modalOverlay);

  // 애니메이션 스타일 추가
  if (!document.getElementById('introAnimationStyles')) {
    const style = document.createElement('style');
    style.id = 'introAnimationStyles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(50px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);
  }

  // 닫기 기능
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => modalOverlay.remove(), 300);
  };

  closeButton.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // 전역 함수로 만들어서 버튼에서 호출 가능하게
  window.closeIntroAnimation = closeModal;

  document.addEventListener('keydown', function handleKeyPress(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyPress);
    }
  });
}

// ========== 문의 폼 기능 ==========
function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
    
    const requiredFields = contactForm.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', validateField);
      field.addEventListener('input', clearFieldError);
    });
  }
}

function handleContactFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  if (!validateForm(form)) {
    return;
  }
  
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = '전송 중...';
  
  setTimeout(() => {
    showContactSuccessModal();
    form.reset();
    clearAllErrors(form);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }, 1500);
}

function showContactSuccessModal() {
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
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
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;
    text-align: center;
  `;
  
  modalContent.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
    <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1.4em;">문의 접수 완료!</h3>
    <p style="margin: 0 0 1.5rem 0; color: #64748b; line-height: 1.6;">
      문의가 성공적으로 접수되었습니다.<br>
      24시간 내에 답변드리겠습니다.
    </p>
    
    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
      <h4 style="margin: 0 0 1rem 0; color: #334155; font-size: 1.1em;">💬 더 빠른 상담을 원하시나요?</h4>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <button onclick="openKakaoTalk()" style="
          background: #FEE500;
          border: none;
          color: #3C1E1E;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        ">💬 카카오톡 상담</button>
        
        <button onclick="openEmail()" style="
          background: #2563eb;
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        ">📧 이메일 보내기</button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.9rem; color: #64748b;">
        <div>📞 전화: 1588-0000<br><small>평일 9:00-18:00</small></div>
        <div>📍 서울시 강남구 테헤란로 123<br><small>CHARM_INYEON 본사</small></div>
      </div>
    </div>
    
    <button class="modal-close-btn" style="
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
      width: 100%;
    ">확인</button>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  const closeBtn = modalContent.querySelector('.modal-close-btn');
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => modalOverlay.remove(), 200);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  // 전역 함수들
  window.openKakaoTalk = function() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = 'kakaotalk://plusfriend/home/@charm_inyeon';
      setTimeout(() => {
        window.open('https://pf.kakao.com/_xmwxmxl', '_blank');
      }, 3000);
    } else {
      window.open('https://pf.kakao.com/_xmwxmxl', '_blank');
    }
    
    showModal('카카오톡 상담', '카카오톡 채널 "@CHARM_INYEON"을 검색하시거나\n준비 중인 링크로 곧 연결됩니다!');
  };
  
  window.openEmail = function() {
    const subject = encodeURIComponent('CHARM_INYEON 문의사항');
    const body = encodeURIComponent('안녕하세요, CHARM_INYEON 담당자님\n\n다음과 같이 문의드립니다:\n\n[문의 내용을 작성해주세요]\n\n감사합니다.');
    
    window.location.href = `mailto:hello@valuematch.co.kr?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      const emailAddress = 'hello@valuematch.co.kr';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(emailAddress).then(() => {
          showModal('이메일 주소 복사', `이메일 주소가 복사되었습니다:\n${emailAddress}`);
        });
      } else {
        showModal('이메일 주소', `이메일로 문의해주세요:\n${emailAddress}`);
      }
    }, 1000);
  };
}

// ========== 폼 검증 유틸리티 ==========
function validateForm(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
  
  requiredFields.forEach(field => {
    if (!validateField({ target: field })) {
      isValid = false;
    }
  });
  
  return isValid;
}

function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = '필수 입력 항목입니다.';
  }
  
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = '올바른 이메일 형식을 입력해주세요.';
    }
  }
  
  if (field.type === 'tel' && value) {
    const phoneRegex = /^[0-9-+\s()]+$/;
    if (!phoneRegex.test(value)) {
      isValid = false;
      errorMessage = '올바른 전화번호 형식을 입력해주세요.';
    }
  }
  
  if (field.name === 'message' && value && value.length < 10) {
    isValid = false;
    errorMessage = '메시지는 10자 이상 입력해주세요.';
  }
  
  if (!isValid) {
    showFieldError(field, errorMessage);
  } else {
    clearFieldError(field);
  }
  
  return isValid;
}

function showFieldError(field, message) {
  clearFieldError(field);
  
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = message;
  errorElement.style.cssText = `
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  `;
  
  field.style.borderColor = '#dc2626';
  field.parentNode.insertBefore(errorElement, field.nextSibling);
}

function clearFieldError(field) {
  const errorElement = field.parentNode.querySelector('.field-error');
  if (errorElement) {
    errorElement.remove();
  }
  field.style.borderColor = '';
}

function clearAllErrors(form) {
  const errorElements = form.querySelectorAll('.field-error');
  errorElements.forEach(error => error.remove());
  
  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach(field => {
    field.style.borderColor = '';
  });
}

// ========== 위젯 클릭 기능 ==========
function handleWidgetClick(widgetType) {
  console.log(`🎯 위젯 클릭: ${widgetType}`);
  
  // 위젯별 액션 분기
  switch(widgetType) {
    case 'values':
      openValuesAnalysisModal();
      break;
    case 'matching':
      openMatchingModal();
      break;
    case 'connections':
      openConnectionsModal();
      break;
    default:
      console.warn('알 수 없는 위젯 타입:', widgetType);
  }
}

function handleWidgetKeydown(event, widgetType) {
  // 키보드 접근성: Enter 또는 Space 키 처리
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleWidgetClick(widgetType);
  }
}

// ========== 위젯 모달 함수들 ==========
function openValuesAnalysisModal() {
  console.log('💎 가치관 분석 모달 열기');
  showWidgetModal('가치관 분석', 'values', {
    icon: '📊',
    title: '당신의 가치관 분석 결과',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎯 핵심 가치관 분석</h4>
          <div class="values-chart">
            <div class="value-item">
              <span class="value-label">가족 중시</span>
              <div class="value-bar">
                <div class="value-progress" style="width: 85%"></div>
              </div>
              <span class="value-score">85%</span>
            </div>
            <div class="value-item">
              <span class="value-label">안정 추구</span>
              <div class="value-bar">
                <div class="value-progress" style="width: 78%"></div>
              </div>
              <span class="value-score">78%</span>
            </div>
            <div class="value-item">
              <span class="value-label">성장 지향</span>
              <div class="value-bar">
                <div class="value-progress" style="width: 72%"></div>
              </div>
              <span class="value-score">72%</span>
            </div>
            <div class="value-item">
              <span class="value-label">사회 기여</span>
              <div class="value-bar">
                <div class="value-progress" style="width: 68%"></div>
              </div>
              <span class="value-score">68%</span>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>💡 분석 요약:</strong> 당신은 가족과의 시간을 가장 소중히 여기며, 
          안정적인 환경에서 지속적인 성장을 추구하는 성향을 보입니다. 
          사회에 긍정적인 영향을 미치는 것에도 관심이 많으시네요!
        </div>
      </div>
    `,
    actions: [
      {
        text: '자세한 분석 받기',
        class: 'primary',
        action: () => {
          closeAllModals();
          window.location.href = 'values-assessment.html';
        }
      },
      {
        text: '매칭 확인하기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          setTimeout(() => openMatchingModal(), 300);
        }
      }
    ]
  });
}

function openMatchingModal() {
  console.log('🤖 AI 매칭 모달 열기');
  showWidgetModal('AI 매칭', 'matching', {
    icon: '🎯',
    title: '당신을 위한 맞춤 매칭',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🔄 매칭 상태</h4>
          <div class="matching-status">
            <div class="status-item active">
              <div class="status-icon">✓</div>
              <span>가치관 분석 완료</span>
            </div>
            <div class="status-item active">
              <div class="status-icon">✓</div>
              <span>프로필 매칭 진행</span>
            </div>
            <div class="status-item processing">
              <div class="status-icon">⟳</div>
              <span>최적 매치 검색 중...</span>
            </div>
          </div>
          
          <div class="matching-progress">
            <div class="progress-text">매칭 진행률: 73%</div>
            <div class="progress-bar-modal">
              <div class="progress-fill-modal" style="width: 73%"></div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>💫 예상 매칭 결과</h4>
          <div class="connections-list">
            <div class="connection-item">
              <div class="connection-avatar">👨‍💼</div>
              <div class="connection-info">
                <div class="connection-name">김철수님</div>
                <div class="connection-compatibility">92% 가치관 일치</div>
                <div class="connection-location">서울 강남구</div>
              </div>
              <div class="connection-status">새로운 매치</div>
            </div>
            <div class="connection-item">
              <div class="connection-avatar">👩‍🎨</div>
              <div class="connection-info">
                <div class="connection-name">이영희님</div>
                <div class="connection-compatibility">88% 가치관 일치</div>
                <div class="connection-location">서울 서초구</div>
              </div>
              <div class="connection-status">매칭 대기</div>
            </div>
          </div>
        </div>
        
        <div class="matching-summary">
          <strong>🎯 매칭 팁:</strong> 가치관이 80% 이상 일치하는 분들을 우선 추천드립니다. 
          첫 대화에서는 공통 관심사부터 이야기해보세요!
        </div>
      </div>
    `,
    actions: [
      {
        text: '매칭 결과 보기',
        class: 'primary',
        action: () => {
          closeAllModals();
          setTimeout(() => openConnectionsModal(), 300);
        }
      },
      {
        text: '더 정확한 매칭',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('더 정확한 매칭', '추가 질문을 통해 더욱 정확한 매칭을 받아보세요!\n곧 추가 설문 기능이 제공됩니다.');
        }
      }
    ]
  });
}

function openConnectionsModal() {
  console.log('💕 새로운 연결 모달 열기');
  showWidgetModal('새로운 연결', 'connections', {
    icon: '💕',
    title: '새로운 인연들',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>✨ 오늘의 새로운 매치</h4>
          <div class="connections-list">
            <div class="connection-item">
              <div class="connection-avatar">👨‍💼</div>
              <div class="connection-info">
                <div class="connection-name">김철수님 (52세)</div>
                <div class="connection-compatibility">92% 가치관 일치</div>
                <div class="connection-location">가족 중시 • 안정 추구 • 운동 좋아함</div>
              </div>
              <div class="connection-status">2시간 전</div>
            </div>
            <div class="connection-item">
              <div class="connection-avatar">👩‍🎨</div>
              <div class="connection-info">
                <div class="connection-name">이영희님 (48세)</div>
                <div class="connection-compatibility">88% 가치관 일치</div>
                <div class="connection-location">예술 애호 • 가족 중시 • 독서 좋아함</div>
              </div>
              <div class="connection-status">5시간 전</div>
            </div>
            <div class="connection-item">
              <div class="connection-avatar">👨‍🏫</div>
              <div class="connection-info">
                <div class="connection-name">박민수님 (55세)</div>
                <div class="connection-compatibility">85% 가치관 일치</div>
                <div class="connection-location">안정 추구 • 사회 기여 • 여행 좋아함</div>
              </div>
              <div class="connection-status">어제</div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h5>📊 이번 주 연결 현황</h5>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
            <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">3</div>
              <div style="font-size: 0.9rem; color: #64748b;">새로운 매치</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">7</div>
              <div style="font-size: 0.9rem; color: #64748b;">진행 중 대화</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: #f8fafc; border-radius: 8px;">
              <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">15</div>
              <div style="font-size: 0.9rem; color: #64748b;">총 연결 수</div>
            </div>
          </div>
        </div>
        
        <div class="connections-summary">
          <strong>💡 연결 팁:</strong> 적극적인 소통이 좋은 관계의 시작입니다. 
          상대방의 프로필을 자세히 읽고, 공통 관심사로 대화를 시작해보세요!
        </div>
      </div>
    `,
    actions: [
      {
        text: '메시지 보내기',
        class: 'primary',
        action: () => {
          closeAllModals();
          showModal('메시지 보내기', '곧 실시간 채팅 기능이 추가됩니다!\n지금은 체험 버전입니다.');
        }
      },
      {
        text: '프로필 상세보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('프로필 보기', '상세 프로필 보기 기능이 곧 추가됩니다!\n더 많은 정보를 확인할 수 있을 예정입니다.');
        }
      }
    ]
  });
}

// ========== 공통 위젯 모달 시스템 ==========
function showWidgetModal(title, type, config) {
  const existingModal = document.querySelector('.widget-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'widget-modal-overlay';
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
    backdrop-filter: blur(5px);
  `;
  
  const modalContent = document.createElement('div');
  modalContent.className = 'widget-modal-content';
  modalContent.style.cssText = `
    background: white;
    border-radius: 20px;
    max-width: 600px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.4s ease-out;
    position: relative;
  `;
  
  const actions = config.actions || [];
  const actionButtons = actions.map(action => 
    `<button class="modal-action-btn ${action.class}" data-action="${actions.indexOf(action)}">
      ${action.text}
    </button>`
  ).join('');
  
  modalContent.innerHTML = `
    <div class="modal-header" style="
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1.5rem 2rem;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span style="font-size: 1.5rem;">${config.icon}</span>
        <h2 style="margin: 0; font-size: 1.3rem;">${config.title}</h2>
      </div>
      <button class="modal-close-btn" style="
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 1.5rem;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      ">&times;</button>
    </div>
    
    <div class="modal-body" style="padding: 2rem;">
      ${config.content}
    </div>
    
    <div class="modal-footer" style="
      padding: 1.5rem 2rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      background: #f8fafc;
      border-radius: 0 0 20px 20px;
    ">
      ${actionButtons}
    </div>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // 버튼 스타일 추가
  const style = document.createElement('style');
  style.textContent = `
    .modal-action-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }
    .modal-action-btn.primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    .modal-action-btn.secondary {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }
    .modal-action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .modal-close-btn:hover {
      background: rgba(255, 255, 255, 0.3) !important;
    }
  `;
  document.head.appendChild(style);
  
  // 이벤트 리스너 추가
  const closeBtn = modalContent.querySelector('.modal-close-btn');
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      modalOverlay.remove();
      style.remove();
    }, 300);
  };
  
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  
  // 액션 버튼 이벤트
  actions.forEach((action, index) => {
    const btn = modalContent.querySelector(`[data-action="${index}"]`);
    if (btn && action.action) {
      btn.addEventListener('click', action.action);
    }
  });
  
  // ESC 키 처리
  document.addEventListener('keydown', function handleKeyPress(e) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyPress);
    }
  });
}

function closeAllModals() {
  const modals = document.querySelectorAll('.widget-modal-overlay, .modal-overlay');
  modals.forEach(modal => modal.remove());
}

// ========== Features 카드 클릭 기능 ==========
function handleFeatureClick(featureType) {
  console.log(`🎯 Feature 카드 클릭: ${featureType}`);
  
  // 특징별 액션 분기
  switch(featureType) {
    case 'deepAnalysis':
      openDeepAnalysisModal();
      break;
    case 'aiMatching':
      openAIMatchingModal();
      break;
    case 'chatGuide':
      openChatGuideModal();
      break;
    case 'safeEnvironment':
      openSafeEnvironmentModal();
      break;
    default:
      console.warn('알 수 없는 특징 타입:', featureType);
  }
}

function handleFeatureKeydown(event, featureType) {
  // 키보드 접근성: Enter 또는 Space 키 처리
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleFeatureClick(featureType);
  }
}

// ========== Features 모달 함수들 ==========
function openDeepAnalysisModal() {
  console.log('📊 심층 가치관 분석 모달 열기');
  showWidgetModal('심층 가치관 분석', 'deep-analysis', {
    icon: '📊',
    title: '100여 개 질문으로 완성하는 정밀 가치관 분석',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🔍 분석 과정</h4>
          <div class="analysis-process">
            <div class="process-step">
              <div class="step-icon">📝</div>
              <div class="step-content">
                <h5>1단계: 기본 가치관 설문</h5>
                <p>가족, 경제, 관계, 미래에 대한 30개 기본 질문</p>
              </div>
            </div>
            <div class="process-step">
              <div class="step-icon">💭</div>
              <div class="step-content">
                <h5>2단계: 심층 성향 분석</h5>
                <p>상황별 선택 질문 40개로 세밀한 성향 파악</p>
              </div>
            </div>
            <div class="process-step">
              <div class="step-icon">🎯</div>
              <div class="step-content">
                <h5>3단계: 라이프스타일 분석</h5>
                <p>취미, 여가, 생활패턴 등 30개 질문으로 완성</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📊 분석 결과 리포트</h4>
          <div class="analysis-results">
            <div class="result-category">
              <div class="category-icon">💝</div>
              <div class="category-info">
                <h5>가치관 매트릭스</h5>
                <p>8개 주요 가치관 영역별 점수와 순위</p>
              </div>
            </div>
            <div class="result-category">
              <div class="category-icon">🧠</div>
              <div class="category-info">
                <h5>성격 유형 분석</h5>
                <p>MBTI 기반 확장 성격 분석 결과</p>
              </div>
            </div>
            <div class="result-category">
              <div class="category-icon">🌟</div>
              <div class="category-info">
                <h5>매칭 적합도</h5>
                <p>이상형 조건과 현실적 매칭 가능성</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>⏱️ 분석 소요 시간</h4>
          <div class="timing-info">
            <div class="time-estimate">
              <span class="time-duration">15-20분</span>
              <span class="time-desc">설문 응답 시간</span>
            </div>
            <div class="time-estimate">
              <span class="time-duration">2-3분</span>
              <span class="time-desc">AI 분석 처리</span>
            </div>
            <div class="time-estimate">
              <span class="time-duration">평생</span>
              <span class="time-desc">결과 열람 가능</span>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>🎯 분석의 특별함:</strong> 단순한 성격 테스트를 넘어 중장년층의 
          인생 경험과 현재 상황을 반영한 깊이 있는 가치관 분석을 제공합니다.
          매칭 정확도 향상은 물론, 자신을 더 잘 이해하는 계기가 됩니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '가치관 분석 시작하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          window.location.href = 'values-assessment.html';
        }
      },
      {
        text: '샘플 결과 보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          setTimeout(() => openValuesAnalysisModal(), 300);
        }
      }
    ]
  });
}

function openAIMatchingModal() {
  console.log('🤖 스마트 AI 매칭 모달 열기');
  showWidgetModal('스마트 AI 매칭', 'ai-matching', {
    icon: '🤖',
    title: '머신러닝 기반 정밀 매칭 시스템',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🧠 AI 매칭 알고리즘</h4>
          <div class="ai-features">
            <div class="ai-feature">
              <div class="feature-icon">⚡</div>
              <div class="feature-content">
                <h5>실시간 학습</h5>
                <p>매칭 성공 사례를 분석하여 알고리즘 지속 개선</p>
              </div>
            </div>
            <div class="ai-feature">
              <div class="feature-icon">🎯</div>
              <div class="feature-content">
                <h5>다차원 분석</h5>
                <p>가치관, 성격, 라이프스타일 등 50개 이상 변수 고려</p>
              </div>
            </div>
            <div class="ai-feature">
              <div class="feature-icon">📈</div>
              <div class="feature-content">
                <h5>예측 모델링</h5>
                <p>장기 관계 지속 가능성까지 예측하여 매칭</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🔄 매칭 과정</h4>
          <div class="matching-flow">
            <div class="flow-step">
              <div class="step-number">1</div>
              <div class="step-description">
                <h5>프로필 분석</h5>
                <p>가치관 분석 결과를 AI가 심층 분석</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-number">2</div>
              <div class="step-description">
                <h5>후보군 스크리닝</h5>
                <p>전체 회원 중 기본 조건 부합자 선별</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-number">3</div>
              <div class="step-description">
                <h5>호환성 계산</h5>
                <p>다차원 알고리즘으로 호환성 점수 산출</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-number">4</div>
              <div class="step-description">
                <h5>최적 매치 추천</h5>
                <p>상위 호환성 순으로 맞춤 추천</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📊 매칭 성과</h4>
          <div class="matching-stats">
            <div class="stat-item">
              <div class="stat-value">94%</div>
              <div class="stat-label">첫 대화 성공률</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">78%</div>
              <div class="stat-label">실제 만남 전환율</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">63%</div>
              <div class="stat-label">6개월 이상 관계 지속</div>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>🎯 매칭의 차별점:</strong> 단순한 외모나 조건 매칭이 아닌, 
          깊이 있는 가치관과 성격 호환성을 바탕으로 한 진정한 매칭입니다. 
          중장년층의 성숙한 관계 형성을 위한 최적화된 알고리즘입니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '매칭 시작하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          setTimeout(() => openMatchingModal(), 300);
        }
      },
      {
        text: '매칭 과정 체험',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('매칭 체험', '🔄 AI 매칭 과정 체험하기\n\n실제 매칭 과정을 단계별로 체험해볼 수 있는\n데모 모드가 곧 추가됩니다!\n\n현재는 가치관 분석 완료 후 자동으로\n매칭 과정이 시작됩니다.');
        }
      }
    ]
  });
}

function openChatGuideModal() {
  console.log('💬 대화 가이드 모달 열기');
  showWidgetModal('대화 가이드', 'chat-guide', {
    icon: '💬',
    title: 'AI 기반 개인 맞춤형 대화 가이드',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎯 대화 가이드 기능</h4>
          <div class="guide-features">
            <div class="guide-feature">
              <div class="feature-icon">💡</div>
              <div class="feature-content">
                <h5>상황별 대화 주제</h5>
                <p>첫 만남부터 깊은 관계까지 단계별 대화 주제 제안</p>
              </div>
            </div>
            <div class="guide-feature">
              <div class="feature-icon">🎪</div>
              <div class="feature-content">
                <h5>대화 분위기 분석</h5>
                <p>실시간 대화 흐름을 분석하여 적절한 반응 가이드</p>
              </div>
            </div>
            <div class="guide-feature">
              <div class="feature-icon">🎭</div>
              <div class="feature-content">
                <h5>성격 맞춤 조언</h5>
                <p>상대방 성격에 맞는 최적의 소통 방법 제안</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📝 대화 주제 카테고리</h4>
          <div class="topic-categories">
            <div class="topic-category">
              <div class="category-icon">☕</div>
              <div class="category-name">첫 만남</div>
              <div class="category-desc">안전하고 편안한 아이스브레이킹 주제</div>
            </div>
            <div class="topic-category">
              <div class="category-icon">🌟</div>
              <div class="category-name">관심사 공유</div>
              <div class="category-desc">취미, 여행, 문화 등 공통 관심사 발견</div>
            </div>
            <div class="topic-category">
              <div class="category-icon">❤️</div>
              <div class="category-name">깊은 이야기</div>
              <div class="category-desc">인생 경험, 가치관, 미래 계획 등</div>
            </div>
            <div class="topic-category">
              <div class="category-icon">🏡</div>
              <div class="category-name">일상 대화</div>
              <div class="category-desc">편안한 일상 대화와 유머 소재</div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🛠️ 대화 지원 도구</h4>
          <div class="support-tools">
            <div class="tool-item">
              <div class="tool-icon">📱</div>
              <div class="tool-info">
                <h5>실시간 조언</h5>
                <p>대화 중 막힐 때 즉시 도움말 제공</p>
              </div>
            </div>
            <div class="tool-item">
              <div class="tool-icon">🎯</div>
              <div class="tool-info">
                <h5>응답 예시</h5>
                <p>상황별 자연스러운 응답 예시 제공</p>
              </div>
            </div>
            <div class="tool-item">
              <div class="tool-icon">⚡</div>
              <div class="tool-info">
                <h5>대화 플로우</h5>
                <p>대화 흐름 분석 및 다음 단계 제안</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📈 대화 성공 통계</h4>
          <div class="conversation-stats">
            <div class="conv-stat">
              <div class="stat-icon">💬</div>
              <div class="stat-info">
                <div class="stat-number">91%</div>
                <div class="stat-text">가이드 사용 시 대화 성공률</div>
              </div>
            </div>
            <div class="conv-stat">
              <div class="stat-icon">📞</div>
              <div class="stat-info">
                <div class="stat-number">76%</div>
                <div class="stat-text">전화통화 전환율</div>
              </div>
            </div>
            <div class="conv-stat">
              <div class="stat-icon">☕</div>
              <div class="stat-info">
                <div class="stat-number">68%</div>
                <div class="stat-text">오프라인 만남 성사율</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>💡 대화의 비밀:</strong> 40-60세 연령대는 진정성 있는 대화를 
          가장 중요하게 생각합니다. AI가 각자의 성격과 상황에 맞는 
          자연스러운 대화법을 안내하여 어색함 없는 소통을 도와드립니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '대화 가이드 체험하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          showModal('대화 가이드 체험', '💬 AI 대화 가이드 체험판\n\n실제 대화 상황에서 AI가 어떻게 도움을 주는지\n체험해볼 수 있는 기능이 곧 추가됩니다!\n\n현재는 매칭 완료 후 이용 가능합니다.');
        }
      },
      {
        text: '대화 팁 모음 보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('중장년층 대화 팁', '💡 성공적인 첫 대화를 위한 팁\n\n1. 진정성 있게 접근하기\n2. 공통 관심사부터 시작\n3. 상대방 이야기에 집중\n4. 자연스러운 질문하기\n5. 너무 개인적인 질문은 피하기\n\n경험과 지혜가 있는 만큼 여유롭게!');
        }
      }
    ]
  });
}

function openSafeEnvironmentModal() {
  console.log('🔒 안전한 환경 모달 열기');
  showWidgetModal('안전한 환경', 'safe-environment', {
    icon: '🛡️',
    title: '신뢰할 수 있는 안전한 만남의 공간',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🔐 다단계 보안 시스템</h4>
          <div class="security-layers">
            <div class="security-item">
              <div class="security-icon">📱</div>
              <div class="security-info">
                <h5>휴대폰 본인 인증</h5>
                <p>SMS 인증으로 가짜 계정 원천 차단</p>
                <div class="security-status">✅ 필수</div>
              </div>
            </div>
            <div class="security-item">
              <div class="security-icon">🆔</div>
              <div class="security-info">
                <h5>신분증 확인</h5>
                <p>AI 기반 신분증 진위 여부 자동 검증</p>
                <div class="security-status">✅ 권장</div>
              </div>
            </div>
            <div class="security-item">
              <div class="security-icon">🤖</div>
              <div class="security-info">
                <h5>AI 행동 패턴 분석</h5>
                <p>의심스러운 활동 실시간 모니터링</p>
                <div class="security-status">🔄 자동</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🚨 사기 방지 시스템</h4>
          <div class="fraud-prevention">
            <div class="prevention-feature">
              <div class="prevention-icon">🔍</div>
              <div class="prevention-content">
                <h5>프로필 사진 검증</h5>
                <p>역방향 이미지 검색으로 도용 사진 탐지</p>
              </div>
            </div>
            <div class="prevention-feature">
              <div class="prevention-icon">💰</div>
              <div class="prevention-content">
                <h5>금전 요구 차단</h5>
                <p>돈 관련 키워드 자동 감지 및 경고</p>
              </div>
            </div>
            <div class="prevention-feature">
              <div class="prevention-icon">📍</div>
              <div class="prevention-content">
                <h5>안전한 첫 만남 장소</h5>
                <p>공공장소 위주 만남 장소 추천</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📊 안전 통계</h4>
          <div class="safety-stats">
            <div class="safety-metric">
              <div class="metric-value">99.7%</div>
              <div class="metric-label">검증된 회원 비율</div>
            </div>
            <div class="safety-metric">
              <div class="metric-value">0.1%</div>
              <div class="metric-label">신고 사례 비율</div>
            </div>
            <div class="safety-metric">
              <div class="metric-value">24시간</div>
              <div class="metric-label">신고 처리 시간</div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🛟 안전 가이드라인</h4>
          <div class="safety-guidelines">
            <div class="guideline-item">✅ 첫 만남은 카페, 레스토랑 등 공공장소에서</div>
            <div class="guideline-item">✅ 개인정보(주소, 직장) 공유는 신중하게</div>
            <div class="guideline-item">✅ 의심스러운 행동은 즉시 신고</div>
            <div class="guideline-item">✅ 금전 관련 요구 시 즉시 차단</div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>🛡️ 안전 약속:</strong> CHARM_INYEON은 중장년층의 소중한 
          만남이 안전하고 신뢰할 수 있는 환경에서 이루어질 수 있도록 
          최선을 다하고 있습니다. 24시간 모니터링과 즉시 대응 체계를 운영합니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '안전 신고하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          showModal('안전 신고', '🚨 의심스러운 활동을 발견하셨나요?\n\n• 신고 이메일: safety@charm-inyeon.com\n• 신고 전화: 1588-0000 (24시간)\n• 앱 내 신고 버튼 이용\n\n모든 신고는 24시간 내 처리됩니다.');
        }
      },
      {
        text: '안전 가이드 전체보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('안전 가이드', '📋 CHARM_INYEON 안전 가이드\n\n1. 계정 보안 관리\n2. 첫 만남 안전 수칙\n3. 개인정보 보호 방법\n4. 의심스러운 상황 대처법\n5. 신고 및 차단 방법\n\n자세한 가이드는 곧 업데이트됩니다!');
        }
      }
    ]
  });
}

// ========== How It Works 단계 클릭 기능 ==========
function handleStepClick(stepType) {
  console.log(`👣 How It Works 단계 클릭: ${stepType}`);
  
  // 단계별 액션 분기
  switch(stepType) {
    case 'valuesAssessment':
      openValuesAssessmentStepModal();
      break;
    case 'smartMatching':
      openSmartMatchingStepModal();
      break;
    case 'meaningfulMeeting':
      openMeaningfulMeetingStepModal();
      break;
    default:
      console.warn('알 수 없는 단계 타입:', stepType);
  }
}

function handleStepKeydown(event, stepType) {
  // 키보드 접근성: Enter 또는 Space 키 처리
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleStepClick(stepType);
  }
}

// ========== How It Works 모달 함수들 ==========
function openValuesAssessmentStepModal() {
  console.log('📊 가치관 진단 단계 모달 열기');
  showWidgetModal('가치관 진단', 'values-assessment-step', {
    icon: '🧠',
    title: '1단계: 당신의 가치관을 알아가는 시간',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🔍 진단 과정 상세</h4>
          <div class="assessment-stages">
            <div class="stage-item">
              <div class="stage-icon">📝</div>
              <div class="stage-info">
                <h5>개인 기본 정보</h5>
                <p>연령, 직업, 거주지역 등 기본 정보 입력 (5분)</p>
              </div>
            </div>
            <div class="stage-item">
              <div class="stage-icon">❤️</div>
              <div class="stage-info">
                <h5>가치관 설문 1부</h5>
                <p>가족, 직업, 인간관계에 대한 핵심 가치관 (10분)</p>
              </div>
            </div>
            <div class="stage-item">
              <div class="stage-icon">🎆</div>
              <div class="stage-info">
                <h5>가치관 설문 2부</h5>
                <p>라이프스타일, 취미, 미래 계획에 대한 선호도 (10분)</p>
              </div>
            </div>
            <div class="stage-item">
              <div class="stage-icon">📊</div>
              <div class="stage-info">
                <h5>심층 성격 분석</h5>
                <p>의사결정 스타일, 소통 방식 등 성격 영역 (5분)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📈 진단 결과 샘플</h4>
          <div class="assessment-results">
            <div class="result-preview">
              <h5>🎯 가치관 프로필 예시</h5>
              <div class="value-chart">
                <div class="value-bar-item">
                  <span>가족 중심</span>
                  <div class="progress-bar"><div class="progress" style="width: 85%"></div></div>
                  <span>85%</span>
                </div>
                <div class="value-bar-item">
                  <span>안정 추구</span>
                  <div class="progress-bar"><div class="progress" style="width: 78%"></div></div>
                  <span>78%</span>
                </div>
                <div class="value-bar-item">
                  <span>사회 참여</span>
                  <div class="progress-bar"><div class="progress" style="width: 65%"></div></div>
                  <span>65%</span>
                </div>
                <div class="value-bar-item">
                  <span>성장 지향</span>
                  <div class="progress-bar"><div class="progress" style="width: 72%"></div></div>
                  <span>72%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>⚡ 진단의 특징</h4>
          <div class="assessment-features">
            <div class="feature-item">
              <div class="feature-icon">📝</div>
              <div class="feature-text">
                <strong>중장년층 맞춤 설계</strong>
                <p>인생 경험과 현실을 반영한 전문적 질문</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🧠</div>
              <div class="feature-text">
                <strong>AI 기반 예측</strong>
                <p>답변 패턴을 분석하여 숨겨진 성향까지 파악</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔄</div>
              <div class="feature-text">
                <strong>업데이트 가능</strong>
                <p>시간이 지나면서 변화하는 가치관을 재진단</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>💖 진단의 가치:</strong> 단순한 취향 조사가 아닌, 인생의 깊이와 
          지혜를 반영한 진정한 가치관 분석을 통해 더 의미 있는 인연을 만들어갑니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '가치관 진단 시작하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          window.location.href = 'values-assessment.html';
        }
      },
      {
        text: '진단 예시 보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          setTimeout(() => openValuesAnalysisModal(), 300);
        }
      }
    ]
  });
}

function openSmartMatchingStepModal() {
  console.log('🤖 스마트 매칭 단계 모달 열기');
  showWidgetModal('스마트 매칭', 'smart-matching-step', {
    icon: '🤖',
    title: '2단계: AI가 찾아주는 운명의 인연',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>📈 매칭 알고리즘 단계</h4>
          <div class="matching-process">
            <div class="process-stage">
              <div class="stage-number">1</div>
              <div class="stage-content">
                <h5>프로필 비교 분석</h5>
                <p>당신의 가치관 프로필과 다른 회원들의 프로필을 AI가 비교 분석</p>
              </div>
            </div>
            <div class="process-stage">
              <div class="stage-number">2</div>
              <div class="stage-content">
                <h5>호환성 점수 계산</h5>
                <p>50개 이상의 변수를 고려한 정밀한 호환성 점수 산출</p>
              </div>
            </div>
            <div class="process-stage">
              <div class="stage-number">3</div>
              <div class="stage-content">
                <h5>조건 필터링</h5>
                <p>나이, 지역, 교육수준 등 기본 조건을 만족하는 후보군 선별</p>
              </div>
            </div>
            <div class="process-stage">
              <div class="stage-number">4</div>
              <div class="stage-content">
                <h5>최종 매칭 추천</h5>
                <p>최고 호환성 순으로 정렬하여 가장 적합한 상대 3-5명 추천</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🎯 매칭 기준</h4>
          <div class="matching-criteria">
            <div class="criteria-weights">
              <div class="weight-item">
                <span class="criteria-name">가치관 일치도</span>
                <div class="weight-bar">
                  <div class="weight-fill" style="width: 40%"></div>
                </div>
                <span class="weight-percent">40%</span>
              </div>
              <div class="weight-item">
                <span class="criteria-name">라이프스타일 유사도</span>
                <div class="weight-bar">
                  <div class="weight-fill" style="width: 25%"></div>
                </div>
                <span class="weight-percent">25%</span>
              </div>
              <div class="weight-item">
                <span class="criteria-name">성격 호환성</span>
                <div class="weight-bar">
                  <div class="weight-fill" style="width: 20%"></div>
                </div>
                <span class="weight-percent">20%</span>
              </div>
              <div class="weight-item">
                <span class="criteria-name">관심사 공통점</span>
                <div class="weight-bar">
                  <div class="weight-fill" style="width: 10%"></div>
                </div>
                <span class="weight-percent">10%</span>
              </div>
              <div class="weight-item">
                <span class="criteria-name">지역적 근접성</span>
                <div class="weight-bar">
                  <div class="weight-fill" style="width: 5%"></div>
                </div>
                <span class="weight-percent">5%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🎆 매칭 예시</h4>
          <div class="match-example">
            <div class="example-match">
              <div class="match-header">
                <span class="match-score">92%</span>
                <span class="match-label">호환성</span>
              </div>
              <div class="match-details">
                <h5>김청수님 (54세, 서울 강남)</h5>
                <div class="match-reasons">
                  <span class="reason-tag">가족 중심 95% 일치</span>
                  <span class="reason-tag">안정 추구 88% 일치</span>
                  <span class="reason-tag">취미 3개 공통</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>🤖 AI의 역할:</strong> 단순한 조건 매칭이 아닌, 심리학과 데이터 과학을 기반으로 
          장기적으로 행복한 관계를 만들 수 있는 상대를 찾아드립니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '매칭 예시 보기',
        class: 'primary',
        action: () => {
          closeAllModals();
          setTimeout(() => openMatchingModal(), 300);
        }
      },
      {
        text: '매칭 기준 자세히',
        class: 'secondary',
        action: () => {
          closeAllModals();
          setTimeout(() => openAIMatchingModal(), 300);
        }
      }
    ]
  });
}

function openMeaningfulMeetingStepModal() {
  console.log('💕 의미 있는 만남 단계 모달 열기');
  showWidgetModal('의미 있는 만남', 'meaningful-meeting-step', {
    icon: '💕',
    title: '3단계: 진정한 연결의 시작',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎆 만남의 단계별 가이드</h4>
          <div class="meeting-stages">
            <div class="meeting-stage">
              <div class="stage-icon">💬</div>
              <div class="stage-info">
                <h5>첫 대화 시작</h5>
                <p>AI가 두 분의 공통점을 분석하여 자연스러운 대화 주제 제안</p>
              </div>
            </div>
            <div class="meeting-stage">
              <div class="stage-icon">☕</div>
              <div class="stage-info">
                <h5>첫 만남 준비</h5>
                <p>안전하고 편안한 장소 추천 및 대화 가이드 제공</p>
              </div>
            </div>
            <div class="meeting-stage">
              <div class="stage-icon">💖</div>
              <div class="stage-info">
                <h5>관계 발전 지원</h5>
                <p>만남 후 피드백을 바탕으로 다음 단계 조언 제공</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>💬 대화 가이드 예시</h4>
          <div class="conversation-examples">
            <div class="conversation-card">
              <div class="conv-header">
                <span class="conv-topic">첫 대화 주제</span>
                <span class="conv-time">5-10분</span>
              </div>
              <div class="conv-content">
                <p><strong>"여행을 좋아하신다고 하셨는데, 가장 기억에 남는 여행이 있으신가요?"</strong></p>
                <small>공통 관심사를 통한 자연스러운 시작</small>
              </div>
            </div>
            <div class="conversation-card">
              <div class="conv-header">
                <span class="conv-topic">심화 대화</span>
                <span class="conv-time">15-20분</span>
              </div>
              <div class="conv-content">
                <p><strong>"인생에서 가장 소중히 여기는 것은 무엇인가요?"</strong></p>
                <small>가치관 일치도가 높은 두 분이니 자연스럽게 연결</small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🎯 만남 성공 도구</h4>
          <div class="meeting-tools">
            <div class="tool-feature">
              <div class="tool-icon">📏</div>
              <div class="tool-info">
                <h5>만남 체크리스트</h5>
                <p>첫 만남 전에 확인할 사항들을 체크리스트로 제공</p>
              </div>
            </div>
            <div class="tool-feature">
              <div class="tool-icon">📍</div>
              <div class="tool-info">
                <h5>장소 추천</h5>
                <p>두 분의 위치와 선호도를 고려한 최적의 만남 장소 추천</p>
              </div>
            </div>
            <div class="tool-feature">
              <div class="tool-icon">🕰️</div>
              <div class="tool-info">
                <h5>시간 가이드</h5>
                <p>첫 만남 적정 시간과 대화 페이스 조절 팁</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📈 만남 성공 통계</h4>
          <div class="meeting-stats">
            <div class="stat-box">
              <div class="stat-number">89%</div>
              <div class="stat-label">첫 만남 만족도</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">76%</div>
              <div class="stat-label">두 번째 만남 성사율</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">68%</div>
              <div class="stat-label">3개월 이상 관계 지속</div>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>🎆 만남의 의미:</strong> 단순한 소개팅을 넘어서, 어색함 없이 자연스럽게 
          시작되는 진정한 관계를 만들어갑니다. AI가 두 분의 막힐 때를 없애드립니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '대화 가이드 체험',
        class: 'primary',
        action: () => {
          closeAllModals();
          setTimeout(() => openChatGuideModal(), 300);
        }
      },
      {
        text: '만남 준비 팁',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('만남 준비 가이드', '☕ 성공적인 첫 만남을 위한 팁\n\n1. 첫 만남은 카페나 레스토랑에서\n2. 1-2시간 정도의 적당한 시간\n3. 청결한 옵장과 자연스러운 모습\n4. 핸드폰은 매너모드로\n5. 과도한 기대보다 여유로운 마음\n\n자연스러운 만남이 최고입니다!');
        }
      }
    ]
  });
}

// ========== About 카드 클릭 기능 ==========
function handleAboutCardClick(cardType) {
  console.log(`📋 About 카드 클릭: ${cardType}`);
  
  // 카드별 액션 분기
  switch(cardType) {
    case 'values':
      openValuesAnalysisDetailModal();
      break;
    case 'matching':
      openMatchingDetailModal();
      break;
    case 'senior':
      openSeniorSpecializedModal();
      break;
    default:
      console.warn('알 수 없는 카드 타입:', cardType);
  }
}

function handleAboutCardKeydown(event, cardType) {
  // 키보드 접근성: Enter 또는 Space 키 처리
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleAboutCardClick(cardType);
  }
}

// ========== About 카드 상세 모달들 ==========
function openValuesAnalysisDetailModal() {
  console.log('💎 가치관 분석 상세 모달 열기');
  showWidgetModal('AI 가치관 분석', 'values-detail', {
    icon: '🧠',
    title: 'AI 기반 가치관 분석 시스템',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎯 분석 과정</h4>
          <div class="process-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h5>심층 질문 100개</h5>
                <p>인생관, 가족관, 사회관, 연애관 등 다각도 질문</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h5>AI 패턴 분석</h5>
                <p>머신러닝 알고리즘으로 가치관 패턴 도출</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h5>개인화된 리포트</h5>
                <p>상세한 분석 결과와 개선 방향 제시</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📊 분석 항목</h4>
          <div class="analysis-categories">
            <div class="category-tag">가족 중시도</div>
            <div class="category-tag">안정 추구성</div>
            <div class="category-tag">성장 지향성</div>
            <div class="category-tag">사회 기여도</div>
            <div class="category-tag">소통 스타일</div>
            <div class="category-tag">라이프스타일</div>
            <div class="category-tag">미래 계획성</div>
            <div class="category-tag">감정 표현</div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>🎯 분석의 특별함:</strong> 단순한 성격 테스트를 넘어 중장년층의 
          인생 경험과 현재 상황을 반영한 깊이 있는 가치관 분석을 제공합니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '가치관 분석 시작하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          window.location.href = 'values-assessment.html';
        }
      },
      {
        text: '샘플 결과 보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          setTimeout(() => openValuesAnalysisModal(), 300);
        }
      }
    ]
  });
}

function openMatchingDetailModal() {
  console.log('💕 매칭 상세 모달 열기');
  showWidgetModal('의미 있는 매칭', 'matching-detail', {
    icon: '❤️',
    title: '가치관 기반 매칭 시스템',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎯 매칭 알고리즘</h4>
          <div class="matching-algorithm">
            <div class="algorithm-step">
              <div class="algorithm-icon">🧮</div>
              <div class="algorithm-content">
                <h5>가중치 기반 계산</h5>
                <div class="weight-breakdown">
                  <div class="weight-item">
                    <span>가치관 일치도</span>
                    <div class="weight-bar">
                      <div class="weight-fill" style="width: 40%"></div>
                    </div>
                    <span>40%</span>
                  </div>
                  <div class="weight-item">
                    <span>라이프스타일</span>
                    <div class="weight-bar">
                      <div class="weight-fill" style="width: 30%"></div>
                    </div>
                    <span>30%</span>
                  </div>
                  <div class="weight-item">
                    <span>관심사 유사도</span>
                    <div class="weight-bar">
                      <div class="weight-fill" style="width: 20%"></div>
                    </div>
                    <span>20%</span>
                  </div>
                  <div class="weight-item">
                    <span>지역적 근접성</span>
                    <div class="weight-bar">
                      <div class="weight-fill" style="width: 10%"></div>
                    </div>
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>✨ 매칭 성공률</h4>
          <div class="success-stats">
            <div class="stat-box">
              <div class="stat-number">87%</div>
              <div class="stat-label">전체 매칭 성공률</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">73%</div>
              <div class="stat-label">3개월 이상 지속</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">94%</div>
              <div class="stat-label">사용자 만족도</div>
            </div>
          </div>
        </div>
        
        <div class="matching-summary">
          <strong>💡 매칭의 차별점:</strong> 외모나 나이가 아닌 진정한 내면의 
          가치관 일치를 통해 오래 지속되는 의미 있는 관계를 만들어갑니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '매칭 시작하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          setTimeout(() => openMatchingModal(), 300);
        }
      },
      {
        text: '성공 사례 보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('성공 사례', '실제 CHARM_INYEON을 통해 만난 커플들의 감동적인 이야기들을 곧 공개할 예정입니다!\n\n지금까지 200여 쌍의 성공적인 매칭이 이루어졌습니다.');
        }
      }
    ]
  });
}

function openSeniorSpecializedModal() {
  console.log('🌟 4060 특화 모달 열기');
  showWidgetModal('4060 특화 플랫폼', 'senior-detail', {
    icon: '👥',
    title: '중장년층 맞춤형 서비스',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎯 4060세대 특화 기능</h4>
          <div class="senior-features">
            <div class="feature-row">
              <div class="feature-icon">👁️</div>
              <div class="feature-info">
                <h5>큰 글씨와 간편한 UI</h5>
                <p>시각적 편의성을 고려한 직관적인 인터페이스</p>
              </div>
            </div>
            <div class="feature-row">
              <div class="feature-icon">🛡️</div>
              <div class="feature-info">
                <h5>안전성 강화</h5>
                <p>철저한 본인 인증과 사기 방지 시스템</p>
              </div>
            </div>
            <div class="feature-row">
              <div class="feature-icon">💼</div>
              <div class="feature-info">
                <h5>재혼 및 황혼 연애 지원</h5>
                <p>인생 2막을 위한 전문적인 매칭 서비스</p>
              </div>
            </div>
            <div class="feature-row">
              <div class="feature-icon">🏥</div>
              <div class="feature-info">
                <h5>건강 상태 고려</h5>
                <p>건강 정보를 반영한 현실적인 매칭</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📊 4060세대 매칭 현황</h4>
          <div class="senior-stats">
            <div class="senior-stat">
              <div class="stat-circle">
                <div class="stat-value">1,247</div>
              </div>
              <div class="stat-desc">활성 회원 수</div>
            </div>
            <div class="senior-stat">
              <div class="stat-circle">
                <div class="stat-value">156</div>
              </div>
              <div class="stat-desc">이번 달 매칭</div>
            </div>
            <div class="senior-stat">
              <div class="stat-circle">
                <div class="stat-value">92%</div>
              </div>
              <div class="stat-desc">재가입률</div>
            </div>
          </div>
        </div>
        
        <div class="connections-summary">
          <strong>🌟 4060세대의 특별함:</strong> 풍부한 인생 경험과 성숙한 가치관을 
          바탕으로 한 진정성 있는 만남을 추구하는 분들을 위한 전문 플랫폼입니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '지금 가입하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          window.location.href = 'signup.html';
        }
      },
      {
        text: '연령대별 통계 보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('연령대별 통계', '📊 연령대별 상세 통계\n\n• 40-45세: 32%\n• 46-50세: 28%\n• 51-55세: 23%\n• 56-60세: 17%\n\n가장 활발한 연령대는 46-50세입니다!');
        }
      }
    ]
  });
}

// ========== Feature 카드 클릭 기능 ==========
function handleFeatureClick(featureType) {
  console.log(`🎯 Feature 카드 클릭: ${featureType}`);
  
  // 기능별 액션 분기
  switch(featureType) {
    case 'deepAnalysis':
      openDeepAnalysisModal();
      break;
    case 'aiMatching':
      openAIMatchingModal();
      break;
    case 'chatGuide':
      openChatGuideModal();
      break;
    case 'safeEnvironment':
      openSafeEnvironmentModal();
      break;
    default:
      console.warn('알 수 없는 기능 타입:', featureType);
  }
}

function handleFeatureKeydown(event, featureType) {
  // 키보드 접근성: Enter 또는 Space 키 처리
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleFeatureClick(featureType);
  }
}

// ========== Feature 상세 모달들 ==========
function openDeepAnalysisModal() {
  console.log('📊 심층 가치관 분석 모달 열기');
  showWidgetModal('심층 가치관 분석', 'deep-analysis', {
    icon: '📊',
    title: '100개 질문으로 완성하는 가치관 프로필',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎯 분석 깊이의 차별점</h4>
          <div class="analysis-depth">
            <div class="depth-comparison">
              <div class="comparison-item">
                <div class="comparison-label">일반 성격테스트</div>
                <div class="comparison-bar">
                  <div class="comparison-fill" style="width: 30%; background: #e5e7eb;"></div>
                </div>
                <span>20-30개 질문</span>
              </div>
              <div class="comparison-item">
                <div class="comparison-label">CHARM_INYEON</div>
                <div class="comparison-bar">
                  <div class="comparison-fill" style="width: 100%; background: var(--gradient-primary);"></div>
                </div>
                <span>100개+ 질문</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🧠 AI 분석 과정</h4>
          <div class="ai-process">
            <div class="process-flow">
              <div class="flow-step">
                <div class="flow-number">1</div>
                <div class="flow-content">
                  <h5>질문 응답</h5>
                  <p>인생관, 가족관, 연애관 등 8개 영역 100개 질문</p>
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="flow-number">2</div>
                <div class="flow-content">
                  <h5>패턴 인식</h5>
                  <p>AI가 응답 패턴을 분석하여 숨겨진 성향 발견</p>
                </div>
              </div>
              <div class="flow-arrow">→</div>
              <div class="flow-step">
                <div class="flow-number">3</div>
                <div class="flow-content">
                  <h5>가치관 도출</h5>
                  <p>개인만의 독특한 가치관 프로필 완성</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📈 분석 정확도</h4>
          <div class="accuracy-stats">
            <div class="accuracy-item">
              <div class="accuracy-circle">94%</div>
              <div class="accuracy-label">예측 정확도</div>
            </div>
            <div class="accuracy-item">
              <div class="accuracy-circle">96%</div>
              <div class="accuracy-label">사용자 만족도</div>
            </div>
            <div class="accuracy-item">
              <div class="accuracy-circle">89%</div>
              <div class="accuracy-label">매칭 성공률</div>
            </div>
          </div>
        </div>
        
        <div class="analysis-summary">
          <strong>🎯 왜 100개 질문인가?</strong> 간단한 테스트로는 알 수 없는 
          깊은 내면의 가치관을 정확하게 파악하기 위해 심리학 전문가와 
          AI 연구진이 공동 개발한 특별한 분석 시스템입니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '가치관 분석 시작하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          window.location.href = 'values-assessment.html';
        }
      },
      {
        text: '샘플 결과 미리보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          setTimeout(() => openValuesAnalysisModal(), 300);
        }
      }
    ]
  });
}

function openAIMatchingModal() {
  console.log('🤖 스마트 AI 매칭 모달 열기');
  showWidgetModal('스마트 AI 매칭', 'ai-matching', {
    icon: '🤖',
    title: '머신러닝이 찾아주는 완벽한 상대',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🧮 AI 매칭 알고리즘</h4>
          <div class="algorithm-breakdown">
            <div class="algorithm-item">
              <div class="algorithm-icon">🎯</div>
              <div class="algorithm-info">
                <h5>다차원 벡터 분석</h5>
                <p>100개 질문 답변을 다차원 공간의 점으로 변환</p>
              </div>
            </div>
            <div class="algorithm-item">
              <div class="algorithm-icon">📐</div>
              <div class="algorithm-info">
                <h5>유사도 계산</h5>
                <p>코사인 유사도로 가치관 일치도 정밀 측정</p>
              </div>
            </div>
            <div class="algorithm-item">
              <div class="algorithm-icon">🎲</div>
              <div class="algorithm-info">
                <h5>가중치 적용</h5>
                <p>연령대별, 상황별 중요도에 따른 스마트 매칭</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📊 실시간 매칭 현황</h4>
          <div class="live-stats">
            <div class="live-stat">
              <div class="live-number">1,247</div>
              <div class="live-label">활성 회원</div>
              <div class="live-change">+23 today</div>
            </div>
            <div class="live-stat">
              <div class="live-number">342</div>
              <div class="live-label">이번 주 매칭</div>
              <div class="live-change">+156%</div>
            </div>
            <div class="live-stat">
              <div class="live-number">89%</div>
              <div class="live-label">매칭 만족도</div>
              <div class="live-change">High Quality</div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>⚡ 매칭 속도 & 정확도</h4>
          <div class="performance-metrics">
            <div class="metric-item">
              <div class="metric-value">0.3초</div>
              <div class="metric-desc">평균 매칭 시간</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">94.7%</div>
              <div class="metric-desc">첫 매칭 만족도</div>
            </div>
            <div class="metric-item">
              <div class="metric-value">73%</div>
              <div class="metric-desc">3개월 지속률</div>
            </div>
          </div>
        </div>
        
        <div class="matching-summary">
          <strong>🚀 AI의 힘:</strong> 수천 명의 데이터를 학습한 AI가 
          사람이 놓칠 수 있는 미묘한 가치관 패턴까지 분석하여 
          정말 잘 맞는 상대를 찾아드립니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: 'AI 매칭 체험하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          setTimeout(() => openMatchingModal(), 300);
        }
      },
      {
        text: '매칭 알고리즘 더보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('매칭 알고리즘', '🔬 CHARM_INYEON 매칭 시스템\n\n• 벡터 공간 분석\n• 코사인 유사도 계산\n• 가중치 기반 점수화\n• 실시간 학습 업데이트\n\n지속적으로 개선되는 AI 매칭 엔진입니다!');
        }
      }
    ]
  });
}

function openChatGuideModal() {
  console.log('💬 대화 가이드 모달 열기');
  showWidgetModal('AI 대화 가이드', 'chat-guide', {
    icon: '💬',
    title: '자연스러운 첫 대화를 위한 AI 어시스턴트',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🎯 개인 맞춤 대화 주제</h4>
          <div class="chat-topics">
            <div class="topic-category">
              <h5>💡 공통 관심사 기반</h5>
              <div class="topic-examples">
                <div class="topic-bubble">"독서를 좋아하신다니, 요즘 어떤 책 읽고 계세요?"</div>
                <div class="topic-bubble">"여행을 즐기시는군요! 가장 인상 깊었던 곳이 어디인가요?"</div>
              </div>
            </div>
            <div class="topic-category">
              <h5>🏡 라이프스타일 연결</h5>
              <div class="topic-examples">
                <div class="topic-bubble">"가족과 시간 보내는 걸 중시하시는 것 같아요"</div>
                <div class="topic-bubble">"건강 관리에 관심이 많으시군요, 어떤 운동 하세요?"</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🚀 실시간 대화 도움</h4>
          <div class="chat-assistance">
            <div class="assistance-feature">
              <div class="assistance-icon">📝</div>
              <div class="assistance-content">
                <h5>메시지 개선 제안</h5>
                <p>작성한 메시지를 더 따뜻하고 자연스럽게 다듬어줍니다</p>
              </div>
            </div>
            <div class="assistance-feature">
              <div class="assistance-icon">🎭</div>
              <div class="assistance-content">
                <h5>상황별 답변 가이드</h5>
                <p>상대방의 메시지에 어떻게 응답할지 상황별 예시 제공</p>
              </div>
            </div>
            <div class="assistance-feature">
              <div class="assistance-icon">⚡</div>
              <div class="assistance-content">
                <h5>대화 온도 측정</h5>
                <p>대화 분위기를 분석하여 적절한 다음 단계 제안</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📈 대화 성공 통계</h4>
          <div class="conversation-stats">
            <div class="conv-stat">
              <div class="stat-icon">💬</div>
              <div class="stat-info">
                <div class="stat-number">87%</div>
                <div class="stat-text">첫 대화 성공률</div>
              </div>
            </div>
            <div class="conv-stat">
              <div class="stat-icon">📞</div>
              <div class="stat-info">
                <div class="stat-number">73%</div>
                <div class="stat-text">전화통화 전환율</div>
              </div>
            </div>
            <div class="conv-stat">
              <div class="stat-icon">☕</div>
              <div class="stat-info">
                <div class="stat-number">64%</div>
                <div class="stat-text">오프라인 만남 성사</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="connections-summary">
          <strong>💡 대화의 비밀:</strong> 40-60세 연령대는 진정성 있는 대화를 
          가장 중요하게 생각합니다. AI가 각자의 성격과 상황에 맞는 
          자연스러운 대화법을 안내해드립니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '대화 가이드 체험하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          showModal('대화 가이드 체험', '💬 AI 대화 가이드 체험판\n\n실제 대화 상황에서 AI가 어떻게 도움을 주는지\n체험해볼 수 있는 기능이 곧 추가됩니다!\n\n현재는 매칭 완료 후 이용 가능합니다.');
        }
      },
      {
        text: '대화 팁 모음 보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('중장년층 대화 팁', '💡 성공적인 첫 대화를 위한 팁\n\n1. 진정성 있게 접근하기\n2. 공통 관심사부터 시작\n3. 상대방 이야기에 집중\n4. 자연스러운 질문하기\n5. 너무 개인적인 질문은 피하기\n\n경험과 지혜가 있는 만큼 여유롭게!');
        }
      }
    ]
  });
}

function openSafeEnvironmentModal() {
  console.log('🔒 안전한 환경 모달 열기');
  showWidgetModal('안전한 환경', 'safe-environment', {
    icon: '🛡️',
    title: '신뢰할 수 있는 안전한 만남의 공간',
    content: `
      <div class="widget-modal-content">
        <div class="modal-section">
          <h4>🔐 다단계 보안 시스템</h4>
          <div class="security-layers">
            <div class="security-item">
              <div class="security-icon">📱</div>
              <div class="security-info">
                <h5>휴대폰 본인 인증</h5>
                <p>SMS 인증으로 가짜 계정 원천 차단</p>
                <div class="security-status">✅ 필수</div>
              </div>
            </div>
            <div class="security-item">
              <div class="security-icon">🆔</div>
              <div class="security-info">
                <h5>신분증 확인</h5>
                <p>AI 기반 신분증 진위 여부 자동 검증</p>
                <div class="security-status">✅ 권장</div>
              </div>
            </div>
            <div class="security-item">
              <div class="security-icon">🤖</div>
              <div class="security-info">
                <h5>AI 행동 패턴 분석</h5>
                <p>의심스러운 활동 실시간 모니터링</p>
                <div class="security-status">🔄 자동</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🚨 사기 방지 시스템</h4>
          <div class="fraud-prevention">
            <div class="prevention-feature">
              <div class="prevention-icon">🔍</div>
              <div class="prevention-content">
                <h5>프로필 사진 검증</h5>
                <p>역방향 이미지 검색으로 도용 사진 탐지</p>
              </div>
            </div>
            <div class="prevention-feature">
              <div class="prevention-icon">💰</div>
              <div class="prevention-content">
                <h5>금전 요구 차단</h5>
                <p>돈 관련 키워드 자동 감지 및 경고</p>
              </div>
            </div>
            <div class="prevention-feature">
              <div class="prevention-icon">📍</div>
              <div class="prevention-content">
                <h5>안전한 첫 만남 장소</h5>
                <p>공공장소 위주 만남 장소 추천</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>📊 안전 통계</h4>
          <div class="safety-stats">
            <div class="safety-metric">
              <div class="metric-value">99.7%</div>
              <div class="metric-label">검증된 회원 비율</div>
            </div>
            <div class="safety-metric">
              <div class="metric-value">0.1%</div>
              <div class="metric-label">신고 사례 비율</div>
            </div>
            <div class="safety-metric">
              <div class="metric-value">24시간</div>
              <div class="metric-label">신고 처리 시간</div>
            </div>
          </div>
        </div>
        
        <div class="modal-section">
          <h4>🛟 안전 가이드라인</h4>
          <div class="safety-guidelines">
            <div class="guideline-item">✅ 첫 만남은 카페, 레스토랑 등 공공장소에서</div>
            <div class="guideline-item">✅ 개인정보(주소, 직장) 공유는 신중하게</div>
            <div class="guideline-item">✅ 의심스러운 행동은 즉시 신고</div>
            <div class="guideline-item">✅ 금전 관련 요구 시 즉시 차단</div>
          </div>
        </div>
        
        <div class="connections-summary">
          <strong>🛡️ 안전 약속:</strong> CHARM_INYEON은 중장년층의 소중한 
          만남이 안전하고 신뢰할 수 있는 환경에서 이루어질 수 있도록 
          최선을 다하고 있습니다.
        </div>
      </div>
    `,
    actions: [
      {
        text: '안전 신고하기',
        class: 'primary',
        action: () => {
          closeAllModals();
          showModal('안전 신고', '🚨 의심스러운 활동을 발견하셨나요?\n\n• 신고 이메일: safety@charm-inyeon.com\n• 신고 전화: 1588-0000 (24시간)\n• 앱 내 신고 버튼 이용\n\n모든 신고는 24시간 내 처리됩니다.');
        }
      },
      {
        text: '안전 가이드 전체보기',
        class: 'secondary',
        action: () => {
          closeAllModals();
          showModal('안전 가이드', '📋 CHARM_INYEON 안전 가이드\n\n1. 계정 보안 관리\n2. 첫 만남 안전 수칙\n3. 개인정보 보호 방법\n4. 의심스러운 상황 대처법\n5. 신고 및 차단 방법\n\n자세한 가이드는 곧 업데이트됩니다!');
        }
      }
    ]
  });
}

console.log('📜 CHARM_INYEON 스크립트 로드 완료');