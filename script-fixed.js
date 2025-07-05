// CHARM_INYEON 메인 스크립트 - 통합 및 정리된 버전

// 페이지 로드 시 모든 기능 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 CHARM_INYEON 초기화 시작');
  
  initializeNavigation();
  initializeContactForm();
  initializeMobileMenu();
  initializeButtons();
  
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
  showModal('로그인', '로그인 기능은 곧 추가될 예정입니다!');
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

console.log('📜 CHARM_INYEON 스크립트 로드 완료');