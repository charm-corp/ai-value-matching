// 🚀 실제 백엔드 API 연결 클라이언트
class MatchingAPIClient {
  constructor() {
    this.baseURL = '/api';
    this.authToken = this.getAuthToken();
  }

  // 로컬 스토리지에서 인증 토큰 가져오기
  getAuthToken() {
    return localStorage.getItem('authToken') || null;
  }

  // API 요청 헬퍼 함수
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API 요청 실패 [${endpoint}]:`, error);
      throw error;
    }
  }

  // 🧭 지능형 호환성 분석 (하트 나침반용)
  async getIntelligentCompatibility(targetUserId) {
    return await this.makeRequest(`/matching/intelligent-compatibility/${targetUserId}`);
  }

  // 👥 사용자 프로필 정보 가져오기
  async getUserProfile(userId) {
    return await this.makeRequest(`/users/${userId}`);
  }

  // 🎯 매칭 결과 생성
  async generateMatches() {
    return await this.makeRequest('/matching/generate', { method: 'POST' });
  }

  // 📊 가치관 평가 결과 가져오기
  async getValuesAssessment(userId) {
    return await this.makeRequest(`/values/assessment/${userId}`);
  }
}

// 중장년층 친화적 UI/UX JavaScript
class SeniorUI {
  constructor() {
    this.isVoiceEnabled = false;
    this.currentSignupStep = 1;
    this.speechSynthesis = window.speechSynthesis;
    this.currentVoice = null;
    this.currentUtterance = null; // 현재 재생 중인 음성
    this.currentFontSize = 'normal';
    this.statusHideTimer = null; // 상태 배지 숨김 타이머
    
    // 🚀 실제 API 클라이언트 초기화
    this.apiClient = new MatchingAPIClient();

    this.init();
  }

  init() {
    this.setupVoiceSystem();
    this.setupFontSizeControl();
    this.setupNavigation();
    this.setupModals();
    this.setupSignupFlow();
    this.setupFormValidation();
    this.setupAccessibility();
    this.initHeartCompass(); // 🧭💕 하트 나침반 초기화
    this.addLoadingAnimation(); // 로딩 애니메이션 스타일 추가
    this.announcePageLoad();
    
    // 🚨 긴급 추가: 페이지 로드 시 연결 상태 자동 체크
    setTimeout(() => this.performInitialConnectionCheck(), 1000);
  }

  // 🚨 긴급 추가: 초기 연결 상태 체크
  async performInitialConnectionCheck() {
    console.log('🔍 초기 연결 상태 체크 시작');
    
    try {
      // 간단한 API 가용성 체크
      const response = await fetch('/api/matching/health', { 
        method: 'GET', 
        timeout: 3000 
      });
      
      if (response.ok) {
        this.updateConnectionStatus('connected', '백엔드 서버 연결 확인! 실제 매칭 데이터를 사용할 수 있습니다.');
        if (this.isVoiceEnabled) {
          this.speak('백엔드 서버와 정상적으로 연결되었습니다.');
        }
      } else {
        throw new Error('서버 응답 오류');
      }
    } catch (error) {
      console.log('🔄 백엔드 연결 불가 - 데모 모드 활성화');
      this.updateConnectionStatus('demo', '백엔드 서버에 연결할 수 없습니다. 고품질 데모 모드로 모든 기능을 체험하세요!');
      
      if (this.isVoiceEnabled) {
        setTimeout(() => {
          this.speak('현재 데모 모드입니다. 모든 기능을 완벽하게 체험하실 수 있습니다.');
        }, 2000);
      }
    }
  }

  // 음성 안내 시스템
  setupVoiceSystem() {
    const voiceToggle = document.getElementById('voiceToggle');
    const voiceStatus = document.getElementById('voiceStatus');

    // 음성 목록 로드
    if (this.speechSynthesis) {
      this.speechSynthesis.onvoiceschanged = () => {
        const voices = this.speechSynthesis.getVoices();
        // 한국어 음성 우선 선택
        this.currentVoice = voices.find(voice => voice.lang.includes('ko')) || voices[0];
      };
    }

    voiceToggle.addEventListener('click', () => {
      this.isVoiceEnabled = !this.isVoiceEnabled;
      voiceToggle.classList.toggle('active', this.isVoiceEnabled);
      voiceToggle.setAttribute('aria-pressed', this.isVoiceEnabled);
      voiceStatus.textContent = this.isVoiceEnabled ? '켜짐' : '꺼짐';

      if (this.isVoiceEnabled) {
        this.speak(
          '음성 안내가 켜졌습니다. 버튼이나 링크에 마우스를 올리면 설명을 들을 수 있습니다.'
        );
        this.setupVoiceEvents();
      } else {
        this.speak('음성 안내가 꺼졌습니다.');
        this.removeVoiceEvents();
      }
    });
  }

  speak(text, priority = false) {
    if (!this.isVoiceEnabled || !this.speechSynthesis) {
      return;
    }

    // 기존 음성 중지 (무한 반복 방지)
    if (priority || this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.currentVoice;
    utterance.rate = 0.8; // 조금 천천히
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    // 음성 종료 이벤트 바인딩 (무한 반복 방지)
    utterance.onend = () => {
      console.log('🎵 음성 재생 완료');
      this.currentUtterance = null;
    };
    
    utterance.onerror = (error) => {
      console.error('🚨 음성 재생 에러:', error);
      this.currentUtterance = null;
    };
    
    this.currentUtterance = utterance;
    this.speechSynthesis.speak(utterance);
    
    console.log('🎵 음성 재생 시작:', text.substring(0, 30) + '...');
  }
  
  // 음성 중지 함수 추가
  stopSpeaking() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
      this.currentUtterance = null;
      console.log('🔇 음성 재생 중지');
      return true;
    }
    return false;
  }

  setupVoiceEvents() {
    // 버튼과 링크에 음성 안내 추가
    const elements = document.querySelectorAll('button, a, [data-voice]');

    elements.forEach(element => {
      element.addEventListener('mouseenter', this.handleVoiceHover.bind(this));
      element.addEventListener('focus', this.handleVoiceHover.bind(this));
    });
  }

  removeVoiceEvents() {
    const elements = document.querySelectorAll('button, a, [data-voice]');

    elements.forEach(element => {
      element.removeEventListener('mouseenter', this.handleVoiceHover.bind(this));
      element.removeEventListener('focus', this.handleVoiceHover.bind(this));
    });
  }

  handleVoiceHover(event) {
    const element = event.target;
    let text = element.getAttribute('data-voice');

    if (!text) {
      text =
        element.textContent.trim() ||
        element.getAttribute('aria-label') ||
        element.getAttribute('title');
    }

    if (text) {
      this.speak(text);
    }
  }

  announcePageLoad() {
    setTimeout(() => {
      if (this.isVoiceEnabled) {
        this.speak(
          'CHARM_INYEON 홈페이지에 오신 것을 환영합니다. 중장년층을 위한 따뜻한 만남의 공간입니다.',
          true
        );
      }
    }, 1000);
  }

  // 글씨 크기 조절
  setupFontSizeControl() {
    const fontSizeButtons = document.querySelectorAll('.font-size-btn');

    fontSizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-size');
        this.changeFontSize(size);

        // 활성 상태 업데이트
        fontSizeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (this.isVoiceEnabled) {
          this.speak(
            `글씨 크기를 ${size === 'small' ? '작게' : size === 'large' ? '크게' : '보통으로'} 변경했습니다.`
          );
        }
      });
    });

    // 키보드 단축키
    document.addEventListener('keydown', e => {
      if (e.ctrlKey) {
        if (e.key === '=') {
          e.preventDefault();
          this.changeFontSize('large');
        } else if (e.key === '-') {
          e.preventDefault();
          this.changeFontSize('small');
        } else if (e.key === '0') {
          e.preventDefault();
          this.changeFontSize('normal');
        }
      }
    });
  }

  changeFontSize(size) {
    const root = document.documentElement;
    this.currentFontSize = size;

    switch (size) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'large':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
    }

    // 로컬 스토리지에 저장
    localStorage.setItem('fontSize', size);
  }

  // 네비게이션
  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-item a');

    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.getAttribute('href');

        if (target.startsWith('#')) {
          this.smoothScrollTo(target);

          if (this.isVoiceEnabled) {
            this.speak(`${link.textContent} 섹션으로 이동합니다.`);
          }
        }
      });
    });

    // 모바일 메뉴 토글 (필요시)
    this.setupMobileMenu();
  }

  smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }

  setupMobileMenu() {
    // 모바일에서 터치 친화적 메뉴 구현
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      const nav = document.querySelector('.senior-nav');
      nav.style.padding = 'var(--spacing-lg) 0';
    }
  }

  // 모달 관리
  setupModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.modal-close');

    // 모달 열기
    document.getElementById('startJourneyBtn').addEventListener('click', () => {
      this.openModal('signupModal');
    });

    document.getElementById('startSignupBtn').addEventListener('click', () => {
      this.openModal('signupModal');
    });

    // 모달 닫기
    closeButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        const modal = e.target.closest('.modal-overlay');
        this.closeModal(modal.id);
      });
    });

    // 배경 클릭으로 닫기
    modals.forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay[style*="block"]');
        if (openModal) {
          this.closeModal(openModal.id);
        }
      }
    });
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');

      // 포커스 트랩
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      if (this.isVoiceEnabled) {
        this.speak('회원가입 창이 열렸습니다. 단계별로 정보를 입력해주세요.');
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');

      if (this.isVoiceEnabled) {
        this.speak('창이 닫혔습니다.');
      }
    }
  }

  // 회원가입 플로우
  setupSignupFlow() {
    // 전역 함수로 등록 (HTML에서 호출)
    window.nextSignupStep = () => this.nextSignupStep();
    window.prevSignupStep = () => this.prevSignupStep();

    // 3단계 폼 제출
    document.getElementById('signupStep3').addEventListener('submit', e => {
      e.preventDefault();
      this.completeSignup();
    });
  }

  nextSignupStep() {
    const currentStep = document.getElementById(`signupStep${this.currentSignupStep}`);

    if (!this.validateCurrentStep()) {
      return;
    }

    // 현재 단계 숨기기
    currentStep.style.display = 'none';

    // 다음 단계로
    this.currentSignupStep++;

    // 다음 단계 보이기
    const nextStep = document.getElementById(`signupStep${this.currentSignupStep}`);
    nextStep.style.display = 'block';

    // 진행률 업데이트
    this.updateSignupProgress();

    if (this.isVoiceEnabled) {
      this.speak(`${this.currentSignupStep}단계로 이동했습니다.`);
    }

    // 첫 번째 입력 필드에 포커스
    const firstInput = nextStep.querySelector('input, select');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  prevSignupStep() {
    const currentStep = document.getElementById(`signupStep${this.currentSignupStep}`);

    // 현재 단계 숨기기
    currentStep.style.display = 'none';

    // 이전 단계로
    this.currentSignupStep--;

    // 이전 단계 보이기
    const prevStep = document.getElementById(`signupStep${this.currentSignupStep}`);
    prevStep.style.display = 'block';

    // 진행률 업데이트
    this.updateSignupProgress();

    if (this.isVoiceEnabled) {
      this.speak(`${this.currentSignupStep}단계로 돌아왔습니다.`);
    }
  }

  updateSignupProgress() {
    const progress = (this.currentSignupStep / 3) * 100;
    const progressBar = document.getElementById('signupProgressBar');
    const progressText = document.getElementById('signupProgress');

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${this.currentSignupStep}/3`;
  }

  validateCurrentStep() {
    const currentStep = document.getElementById(`signupStep${this.currentSignupStep}`);
    const inputs = currentStep.querySelectorAll('input[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        this.showFieldError(input, '이 필드는 필수입니다.');
        isValid = false;
      } else {
        this.clearFieldError(input);
      }
    });

    // 2단계 추가 검증
    if (this.currentSignupStep === 2) {
      const email = document.getElementById('signup-email');
      const password = document.getElementById('signup-password');
      const passwordConfirm = document.getElementById('signup-password-confirm');

      if (!this.validateEmail(email.value)) {
        this.showFieldError(email, '올바른 이메일 형식이 아닙니다.');
        isValid = false;
      }

      if (password.value.length < 8) {
        this.showFieldError(password, '비밀번호는 8자 이상이어야 합니다.');
        isValid = false;
      }

      if (password.value !== passwordConfirm.value) {
        this.showFieldError(passwordConfirm, '비밀번호가 일치하지 않습니다.');
        isValid = false;
      }
    }

    if (!isValid && this.isVoiceEnabled) {
      this.speak('입력하지 않은 필수 항목이 있습니다. 확인해주세요.');
    }

    return isValid;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  completeSignup() {
    const agreeTerms = document.getElementById('agree-terms').checked;
    const agreePrivacy = document.getElementById('agree-privacy').checked;

    if (!agreeTerms || !agreePrivacy) {
      if (this.isVoiceEnabled) {
        this.speak('필수 약관에 동의해주세요.');
      }
      return;
    }

    // 회원가입 데이터 수집
    const signupData = {
      name: document.getElementById('signup-name').value,
      age: document.getElementById('signup-age').value,
      gender: document.getElementById('signup-gender').value,
      location: document.getElementById('signup-location').value,
      email: document.getElementById('signup-email').value,
      phone: document.getElementById('signup-phone').value,
      password: document.getElementById('signup-password').value,
      agreeMarketing: document.getElementById('agree-marketing').checked,
    };

    // 실제 API 호출 (여기서는 시뮬레이션)
    this.submitSignup(signupData);
  }

  async submitSignup(data) {
    // 로딩 상태 표시
    const submitBtn = document.querySelector('#signupStep3 button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>가입 중...</span>';
    submitBtn.disabled = true;

    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (this.isVoiceEnabled) {
        this.speak('회원가입이 완료되었습니다. 환영합니다!');
      }

      // 성공 메시지 표시
      this.showSignupSuccess();
    } catch (error) {
      if (this.isVoiceEnabled) {
        this.speak('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      this.showAlert('회원가입 중 오류가 발생했습니다.', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  showSignupSuccess() {
    const modalBody = document.querySelector('#signupModal .modal-body');
    modalBody.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-xl);">
                <div style="width: 80px; height: 80px; background: var(--success-color); border-radius: 50%; margin: 0 auto var(--spacing-lg); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                    ✓
                </div>
                <h3 style="color: var(--success-color); margin-bottom: var(--spacing-md);">가입을 축하합니다!</h3>
                <p style="margin-bottom: var(--spacing-lg);">
                    CHARM_INYEON에 오신 것을 환영합니다.<br>
                    이제 가치관 분석을 통해 특별한 만남을 시작해보세요.
                </p>
                <button class="btn btn-primary btn-large" onclick="window.location.reload()">
                    <span>가치관 분석 시작하기</span>
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M5 12H19M12 5L19 12L12 19"/>
                    </svg>
                </button>
            </div>
        `;
  }

  // 폼 검증
  setupFormValidation() {
    const inputs = document.querySelectorAll('.form-input');

    inputs.forEach(input => {
      // 실시간 검증
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      // 입력 중 에러 제거
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.clearFieldError(input);
        }
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    if (field.hasAttribute('required') && !value) {
      isValid = false;
      message = '이 필드는 필수입니다.';
    } else if (field.type === 'email' && value && !this.validateEmail(value)) {
      isValid = false;
      message = '올바른 이메일 형식이 아닙니다.';
    } else if (field.type === 'tel' && value && !this.validatePhone(value)) {
      isValid = false;
      message = '올바른 전화번호 형식이 아닙니다.';
    }

    if (!isValid) {
      this.showFieldError(field, message);
    } else {
      this.clearFieldError(field);
    }

    return isValid;
  }

  validatePhone(phone) {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  }

  // 접근성
  setupAccessibility() {
    // 키보드 네비게이션 개선
    this.setupKeyboardNavigation();

    // 포커스 관리
    this.setupFocusManagement();

    // 스크린 리더 지원
    this.setupScreenReaderSupport();

    // 사용자 설정 복원
    this.restoreUserSettings();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', e => {
      // Tab 키 네비게이션 개선
      if (e.key === 'Tab') {
        this.highlightFocusedElement();
      }

      // Enter 키로 버튼 활성화
      if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.target.click();
      }
    });
  }

  highlightFocusedElement() {
    // 포커스된 요소를 더 명확하게 표시
    const focused = document.activeElement;
    if (focused && focused !== document.body) {
      focused.style.outline = '3px solid var(--primary-color)';
      focused.style.outlineOffset = '2px';
    }
  }

  setupFocusManagement() {
    // 모달이 열릴 때 포커스 트랩
    const trapFocus = modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      modal.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      });
    };

    // 모든 모달에 포커스 트랩 적용
    document.querySelectorAll('.modal-overlay').forEach(trapFocus);
  }

  setupScreenReaderSupport() {
    // 동적 콘텐츠 변경 알림
    this.announceToScreenReader = message => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };
  }

  restoreUserSettings() {
    // 저장된 글씨 크기 복원
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      this.changeFontSize(savedFontSize);

      // 버튼 상태 업데이트
      document.querySelectorAll('.font-size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-size') === savedFontSize);
      });
    }

    // 저장된 음성 설정 복원
    const savedVoice = localStorage.getItem('voiceEnabled');
    if (savedVoice === 'true') {
      document.getElementById('voiceToggle').click();
    }
  }

  // 유틸리티 메서드
  showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.left = '50%';
    alert.style.transform = 'translateX(-50%)';
    alert.style.zIndex = '10001';
    alert.style.minWidth = '300px';
    alert.style.textAlign = 'center';

    alert.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: var(--spacing-sm); background: none; border: none; font-size: 1.2em; cursor: pointer;">&times;</button>
        `;

    document.body.appendChild(alert);

    // 3초 후 자동 제거
    setTimeout(() => {
      if (alert.parentElement) {
        alert.remove();
      }
    }, 3000);

    if (this.isVoiceEnabled) {
      this.speak(message);
    }
  }

  // 반응형 디자인 지원
  handleResize() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // 모바일 최적화
      this.optimizeForMobile();
    } else {
      // 데스크톱 최적화
      this.optimizeForDesktop();
    }
  }

  optimizeForMobile() {
    // 터치 이벤트 최적화
    document.querySelectorAll('.btn').forEach(btn => {
      btn.style.minHeight = '60px';
      btn.style.fontSize = 'var(--font-size-large)';
    });

    // 네비게이션 최적화
    const nav = document.querySelector('.senior-nav .nav-menu');
    if (nav) {
      nav.style.flexDirection = 'column';
      nav.style.gap = 'var(--spacing-sm)';
    }
  }

  optimizeForDesktop() {
    // 데스크톱 최적화 복원
    document.querySelectorAll('.btn').forEach(btn => {
      btn.style.minHeight = '56px';
      btn.style.fontSize = 'var(--font-size-base)';
    });
  }

  // 🧭💕 하트 나침반 (Heart Compass) 기능
  initHeartCompass() {
    // 모든 하트 나침반 요소 초기화
    const compasses = document.querySelectorAll('.heart-compass');
    compasses.forEach(compass => {
      this.setupCompassInteraction(compass);
    });
  }

  // 매칭도를 나침반 각도로 변환하는 함수
  calculateHeartNeedleAngle(matchingPercentage) {
    // 90% 이상: 완전히 북쪽(0도) - True Love
    if (matchingPercentage >= 90) return 0;
    
    // 80-89%: 약간 비스듬히 (15도 이내)
    if (matchingPercentage >= 80) return (90 - matchingPercentage) * 1.5;
    
    // 70-79%: 탐색 중 (30도 이내)  
    if (matchingPercentage >= 70) return (90 - matchingPercentage) * 3;
    
    // 60-69%: 더 기울어짐 (60도 이내)
    if (matchingPercentage >= 60) return (90 - matchingPercentage) * 6;
    
    // 60% 미만: 많이 벗어남 (180도까지)
    return Math.min(180, (90 - matchingPercentage) * 4);
  }

  // 매칭도별 메시지 반환
  getMatchingMessage(percentage) {
    const messages = {
      90: "🎉 운명적 인연을 발견했습니다! True Love를 향해 나아가세요!",
      80: "💕 매우 높은 호환성! 설렘 가득한 만남이 기다립니다!",
      70: "✨ 좋은 궁합이에요! 서로를 더 알아가 보세요!",
      60: "🌟 흥미로운 만남! 새로운 가능성을 탐험해보세요!",
      50: "🧭 조금 더 탐색이 필요해요. 다른 인연도 살펴보세요!"
    };

    for (const threshold of [90, 80, 70, 60, 50]) {
      if (percentage >= threshold) {
        return messages[threshold];
      }
    }
    return messages[50];
  }

  // 🎪 v2.1 하트 나침반 애니메이션 실행 (창우님을 위한 긴급 수정)
  showMatchingResult(compassElement, matchingPercentage) {
    console.log('🚨 showMatchingResult 호출:', { compassElement, matchingPercentage });
    
    // 🚨 요소 존재 확인
    if (!compassElement) {
      console.error('❌ 나침반 요소를 찾을 수 없습니다!');
      alert('⚠️ 나침반을 찾을 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    const needle = compassElement.querySelector('.heart-needle');
    if (!needle) {
      console.error('❌ 하트 바늘 요소를 찾을 수 없습니다!');
      console.log('🔍 나침반 내부 구조:', compassElement.innerHTML);
      alert('⚠️ 하트 바늘을 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ 하트 바늘 요소 발견:', needle);
    
    const angle = this.calculateHeartNeedleAngle(matchingPercentage);
    console.log('🎯 계산된 각도:', angle, '도 (매칭도:', matchingPercentage, '%)');
    
    // 시작 전 나래이션 (v2.1 추가)
    if (this.isVoiceEnabled) {
      this.speak("나침반이 당신의 운명을 찾고 있습니다...");
    }
    
    // 🚨 긴급 수정: 기존 애니메이션 완전 리셋
    needle.classList.remove('matching-reveal');
    compassElement.classList.remove('high-compatibility');
    
    // 바늘 위치 초기화 (180도에서 시작 - CSS와 일치)
    needle.style.transform = 'translate(-50%, -85%) rotate(180deg)';
    needle.style.transformOrigin = 'center bottom';
    needle.style.transition = 'none';
    
    // 강제로 스타일 리플로우 발생 (중요!)
    needle.offsetHeight;
    
    // CSS 변수로 각도 설정
    compassElement.style.setProperty('--matching-angle', `${angle}deg`);
    compassElement.setAttribute('data-matching-score', matchingPercentage);
    
    console.log('✅ CSS 변수 설정:', compassElement.style.getPropertyValue('--matching-angle'));
    
    // 바늘 애니메이션 시작
    setTimeout(() => {
      console.log('🎬 바늘 회전 애니메이션 시작:', angle + 'deg');
      
      // CSS 애니메이션을 사용하여 부드러운 회전 효과
      needle.classList.add('matching-reveal');
      
      console.log('🎬 CSS 애니메이션 클래스 추가 완료');
      
      // 3초 후에 애니메이션 완료 후 최종 위치 고정
      setTimeout(() => {
        needle.classList.remove('matching-reveal');
        needle.style.transform = `translate(-50%, -85%) rotate(${angle}deg)`;
        needle.style.transition = 'transform 0.3s ease';
        console.log('🎯 바늘 최종 위치 고정 완료');
      }, 3000);
    }, 100);
    
    // 높은 호환성일 때 특별 효과
    if (matchingPercentage >= 90) {
      compassElement.classList.add('high-compatibility');
      console.log('🌟 높은 호환성 효과 적용');
      
      // True Love 메시지 강조
      const trueLoveMark = compassElement.querySelector('.true-love-mark');
      if (trueLoveMark) {
        trueLoveMark.style.animation = 'heartPulse 1.5s infinite';
        trueLoveMark.style.color = 'var(--heart-red)';
        trueLoveMark.style.fontWeight = 'bold';
      }
    }
    
    // 중간 진행 나래이션 (v2.1 추가)
    if (this.isVoiceEnabled) {
      setTimeout(() => {
        this.speak("마음과 마음이 서로를 찾아가는 중이에요...");
      }, 1500);
    }
    
    // 결과 발표 음성 안내 (타이밍 개선)
    if (this.isVoiceEnabled) {
      setTimeout(() => {
        const message = this.getMatchingMessage(matchingPercentage);
        this.speak(`${matchingPercentage}퍼센트 호환성! ${message}`);
      }, 3200); // 애니메이션 완료 직후
    }

    // 애니메이션 완료 후 상세 분석 버튼 나타내기
    setTimeout(() => {
      needle.classList.remove('matching-reveal');
      
      // 상세 분석 버튼 서서히 나타내기
      const detailBtn = compassElement.querySelector('.compass-detail-btn');
      if (detailBtn) {
        detailBtn.style.opacity = '0.7';
        detailBtn.style.pointerEvents = 'auto';
      }
      
      // 호환성 점수 업데이트
      const scoreElement = compassElement.closest('.compass-container').querySelector('.compatibility-score');
      if (scoreElement) {
        scoreElement.textContent = matchingPercentage;
      }
      
    }, 3500);

    // v2.1 추가: 감성적 마무리 효과
    setTimeout(() => {
      if (matchingPercentage >= 90) {
        // True Love 달성 시 특별한 시각 효과
        const compass = compassElement;
        compass.style.boxShadow = '0 0 30px rgba(231, 76, 60, 0.6)';
        setTimeout(() => {
          compass.style.boxShadow = '';
        }, 2000);
      }
    }, 4000);
  }

  // 나침반 인터랙션 설정
  setupCompassInteraction(compass) {
    // 나침반 클릭 시 재애니메이션
    compass.addEventListener('click', () => {
      const currentAngle = compass.style.getPropertyValue('--matching-angle') || '0deg';
      const matchingPercent = this.angleToPercentage(parseFloat(currentAngle));
      
      // 재애니메이션 실행
      this.showMatchingResult(compass, matchingPercent);
      
      if (this.isVoiceEnabled) {
        this.speak('나침반을 다시 돌려보겠습니다');
      }
    });

    // 호버 시 설명
    compass.addEventListener('mouseenter', () => {
      if (this.isVoiceEnabled) {
        this.speak('하트 나침반입니다. 매칭 호환성을 나침반으로 표현합니다. 클릭하면 애니메이션을 다시 볼 수 있습니다.');
      }
    });
  }

  // 각도를 퍼센트로 역계산 (대략적)
  angleToPercentage(angle) {
    if (angle <= 15) return 92; // 높은 호환성
    if (angle <= 30) return 75; // 좋은 호환성
    if (angle <= 60) return 65; // 보통 호환성
    return 45; // 낮은 호환성
  }

  // 모든 나침반에 데모 애니메이션 적용
  startCompassDemo() {
    const compasses = document.querySelectorAll('.heart-compass');
    compasses.forEach((compass, index) => {
      setTimeout(() => {
        // 각 나침반마다 다른 매칭도로 데모
        const demoPercentages = [92, 78, 65];
        const percentage = demoPercentages[index] || 75;
        this.showMatchingResult(compass, percentage);
      }, index * 1000); // 1초 간격으로 순차 실행
    });
  }

  // 🚨 긴급 수정: 강화된 API 연결 + 폴백 시스템
  async fetchRealMatchingData(targetUserId) {
    // 🔧 상태 배지 업데이트
    this.updateConnectionStatus('checking', '백엔드 API 연결 시도 중...');
    
    try {
      console.log(`🎯 실제 API 호출: /api/matching/intelligent-compatibility/${targetUserId}`);
      
      // 🚨 targetUserId 검증 추가
      if (!targetUserId || targetUserId === 'undefined') {
        throw new Error('잘못된 사용자 ID');
      }
      
      // 실제 IntelligentMatchingEngine 사용
      const result = await this.apiClient.getIntelligentCompatibility(targetUserId);
      
      if (result.success && result.data) {
        const { overallScore, compatibility, matchingReasons } = result.data;
        
        // ✅ API 연결 성공
        this.updateConnectionStatus('connected', '실제 백엔드 API 연결 성공!');
        
        if (this.isVoiceEnabled) {
          this.speak('백엔드 API 연결에 성공했습니다! 실제 분석 결과를 보여드립니다.');
        }
        
        return {
          compatibility: overallScore,
          breakdown: compatibility.breakdown,
          reasons: matchingReasons,
          message: this.getMatchingMessage(overallScore),
          isRealData: true
        };
      }
      
      throw new Error('API 응답 데이터 형식 오류');
      
    } catch (error) {
      console.error('🚨 실제 매칭 데이터 로드 실패:', error);
      
      // 🚨 상태 배지를 데모 모드로 업데이트
      this.updateConnectionStatus('demo', '백엔드 연결 실패 - 데모 모드로 진행');
      
      // 사용자 친화적 안내
      if (this.isVoiceEnabled) {
        if (error.message.includes('401') || error.message.includes('토큰')) {
          this.speak('로그인이 필요합니다. 지금은 데모 모드로 체험해보세요.');
        } else if (error.message.includes('404')) {
          this.speak('백엔드 서버에 연결할 수 없습니다. 데모 모드로 완벽한 기능을 체험해보세요.');
        } else {
          this.speak('일시적인 연결 문제가 발생했습니다. 데모 모드로 진행합니다.');
        }
      }
      
      // 🎯 고품질 데모 데이터 반환
      return this.getDemoMatchingData(targetUserId);
    }
  }

  // 🚨 연결 상태 배지 업데이트 (창우님을 위한 긴급 추가 + 지속성 개선)
  updateConnectionStatus(status, message) {
    const badge = document.getElementById('connection-status-badge');
    const description = document.getElementById('status-description');
    
    if (!badge || !description) return;
    
    // 기존 타이머 제거 (지속성을 위해)
    if (this.statusHideTimer) {
      clearTimeout(this.statusHideTimer);
      this.statusHideTimer = null;
    }
    
    // 상태별 스타일 설정
    const statusStyles = {
      checking: {
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        icon: '🔄',
        text: '연결 확인 중'
      },
      connected: {
        background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
        icon: '🎯',
        text: '실제 API 연결'
      },
      demo: {
        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
        icon: '📊',
        text: '데모 모드'
      }
    };
    
    const style = statusStyles[status] || statusStyles.demo;
    
    // 배지 업데이트
    badge.style.background = style.background;
    badge.innerHTML = `${style.icon} ${style.text}`;
    
    // 설명 업데이트
    description.textContent = message;
    
    // 배지 표시 (숨겨진 상태에서 보이게)
    const statusContainer = badge.closest('.connection-status');
    if (statusContainer) {
      statusContainer.style.opacity = '1';
      statusContainer.style.visibility = 'visible';
      statusContainer.style.transform = 'translateY(0)';
    }
    
    // 부드러운 애니메이션 효과
    badge.style.transform = 'scale(1.05)';
    setTimeout(() => {
      badge.style.transform = 'scale(1)';
    }, 200);
    
    // 성공/연결 상태는 더 오래 유지 (30초), 데모는 15초
    const hideDelay = status === 'connected' ? 30000 : (status === 'demo' ? 15000 : 5000);
    
    this.statusHideTimer = setTimeout(() => {
      if (statusContainer) {
        statusContainer.style.opacity = '0.7'; // 완전히 숨기지 않고 낮은 투명도로
        statusContainer.style.transform = 'translateY(-5px)';
      }
    }, hideDelay);
    
    console.log(`🔔 상태 업데이트: ${status} - ${message} (지속: ${hideDelay/1000}초)`);
  }

  // 🎯 호환성 레벨 텍스트 반환
  getCompatibilityLevel(score) {
    if (score >= 90) return "완벽한 궁합!";
    if (score >= 80) return "매우 좋은 호환성!";
    if (score >= 70) return "좋은 궁합!";
    if (score >= 60) return "흥미로운 만남!";
    return "탐색이 필요한 인연";
  }

  // 📊 데모 매칭 데이터 (백엔드 없을 때 사용)
  getDemoMatchingData(targetUserId) {
    const demoProfiles = {
      'kim-chulsoo': { compatibility: 92, name: '김철수님' },
      'lee-younghee': { compatibility: 87, name: '이영희님' },
      'park-minsu': { compatibility: 84, name: '박민수님' }
    };
    
    const profile = demoProfiles[targetUserId] || { compatibility: 75, name: '새로운 인연' };
    
    return {
      compatibility: profile.compatibility,
      breakdown: {
        coreValues: profile.compatibility - 5,
        personalityFit: profile.compatibility - 3,
        lifestyleCompat: profile.compatibility + 2,
        communicationSync: profile.compatibility - 8,
        growthPotential: profile.compatibility - 10
      },
      reasons: [
        `${profile.name}과(와) 가치관이 잘 맞습니다`,
        '소통 스타일이 조화롭습니다',
        '인생 목표가 비슷합니다'
      ],
      message: this.getMatchingMessage(profile.compatibility),
      isRealData: false
    };
  }

  // 🚨 긴급 추가: API 연결 테스트 전용 함수 (창우님용)
  async testAPIConnection(targetId, compassElement) {
    console.log('🔌 API 연결 테스트 시작:', { targetId, compassElement });
    
    // 버튼 상태 변경
    const button = event?.target?.closest('button');
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<span>🔄 테스트 중...</span>';
      button.disabled = true;
      
      // 3초 후 원복
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      }, 3000);
    }
    
    // 음성 안내
    if (this.isVoiceEnabled) {
      this.speak('API 연결 테스트를 시작합니다. 백엔드 서버와의 연결을 확인하고 있습니다.');
    }
    
    // 실제 API 연결 시도
    await this.updateCompassWithRealData(compassElement, 'demo-user', targetId);
  }

  // 🚀 실제 API 데이터로 나침반 업데이트 (v2.1 백엔드 연동)
  async updateCompassWithRealData(compassElement, userId, targetId) {
    console.log(`🧭 하트 나침반 실제 API 연동 시작: ${userId} → ${targetId}`);
    
    // 로딩 상태 표시
    const needle = compassElement.querySelector('.heart-needle');
    if (needle) {
      needle.style.animation = 'spin 2s linear infinite';
    }
    
    // 음성 안내 (v2.1)
    if (this.isVoiceEnabled) {
      this.speak('지능형 매칭 엔진이 분석 중입니다. 잠시만 기다려주세요.');
    }

    try {
      // 🎯 실제 IntelligentMatchingEngine API 호출
      const matchingData = await this.fetchRealMatchingData(targetId);
      
      console.log('🎉 실제 매칭 데이터 수신:', matchingData);
      
      // 로딩 애니메이션 중지
      if (needle) {
        needle.style.animation = '';
      }
      
      // 🧭 실제 데이터로 하트 나침반 업데이트
      this.showMatchingResult(compassElement, matchingData.compatibility);
      
      // 💬 상세 메시지 업데이트
      const messageElement = compassElement.parentElement.querySelector('[data-message]');
      if (messageElement) {
        const dataSource = matchingData.isRealData ? '🎯 실제 분석 결과' : '📊 데모 모드';
        messageElement.innerHTML = `
          <div style="margin-bottom: 8px;">${matchingData.message}</div>
          <div style="font-size: 0.8em; opacity: 0.8; color: #666;">
            <span style="color: ${matchingData.isRealData ? '#4CAF50' : '#FF9800'};">
              ${dataSource}
            </span>
          </div>
        `;
      }

      // 🎵 성공 음성 피드백 (v2.1)
      if (this.isVoiceEnabled) {
        const feedback = matchingData.isRealData 
          ? `실제 분석 완료! ${matchingData.compatibility}퍼센트 호환성입니다.`
          : `데모 모드 결과: ${matchingData.compatibility}퍼센트 호환성입니다.`;
        
        setTimeout(() => this.speak(feedback), 1500);
      }

      // 📊 상세 분석 버튼에 실제 데이터 연결
      const detailBtn = compassElement.querySelector('.compass-detail-btn');
      if (detailBtn && matchingData.breakdown) {
        detailBtn.onclick = () => this.showDetailedAnalysis(compassElement, matchingData);
      }

    } catch (error) {
      console.error('🚨 매칭 데이터 업데이트 실패:', error);
      
      // 에러 시 기본 데모 표시
      if (needle) {
        needle.style.animation = '';
      }
      
      const fallbackData = this.getDemoMatchingData(targetId);
      this.showMatchingResult(compassElement, fallbackData.compatibility);
      
      // 에러 메시지 표시
      const messageElement = compassElement.parentElement.querySelector('[data-message]');
      if (messageElement) {
        messageElement.innerHTML = `
          <div style="color: #FF5722;">⚠️ 연결 오류 - 데모 모드로 진행</div>
          <div style="font-size: 0.8em; opacity: 0.8;">${fallbackData.message}</div>
        `;
      }
      
      if (this.isVoiceEnabled) {
        this.speak('연결에 문제가 발생했습니다. 데모 모드로 진행합니다.');
      }
    }
  }

  // 로딩 회전 애니메이션 추가
  addLoadingAnimation() {
    if (!document.querySelector('#loading-animation-style')) {
      const style = document.createElement('style');
      style.id = 'loading-animation-style';
      style.textContent = `
        @keyframes spin {
          from { transform: translate(-50%, -85%) rotate(0deg); }
          to { transform: translate(-50%, -85%) rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 🎭 v2.1 감동적인 음성 나래이션 시스템 (창우님을 위한 토글 기능 추가)
  playMatchingNarration(matchingScore) {
    console.log('🎵 음성 나래이션 호출:', matchingScore);
    
    const btn = event?.target || document.querySelector('.voice-narration-btn');
    
    // 🚨 음성 토글 기능 추가
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      console.log('🔇 음성 중지');
      this.speechSynthesis.cancel();
      if (btn) {
        btn.classList.remove('playing');
        btn.innerHTML = '🎵 감동 메시지 듣기';
      }
      return;
    }
    
    if (btn) {
      btn.classList.add('playing');
      btn.innerHTML = '🔇 음성 중지하기';
    }

    // 매칭도에 따른 감동적인 나래이션 스크립트
    const narrationScripts = {
      90: {
        start: "나침반이 당신의 운명을 찾고 있습니다...",
        progress: "두 마음이 하나의 방향으로 모이고 있어요...",
        result: "92퍼센트 호환성! 정말 특별한 인연을 발견했습니다! 이분과 함께하는 시간들이 얼마나 소중할지 상상해보세요."
      },
      80: {
        start: "하트 나침반이 두 분의 마음을 탐색 중입니다...",
        progress: "공통된 가치관들이 하나씩 발견되고 있어요...",
        result: "87퍼센트 호환성! 매우 높은 호환성으로 설렘 가득한 만남이 기다립니다!"
      },
      70: {
        start: "나침반이 당신들의 연결고리를 찾고 있습니다...",
        progress: "서로를 이해할 수 있는 부분들을 찾아가고 있어요...",
        result: "84퍼센트 호환성! 좋은 궁합이에요. 서로를 더 알아가 보세요!"
      }
    };

    // 점수 구간별 스크립트 선택
    let script = narrationScripts[90]; // 기본값
    if (matchingScore >= 90) script = narrationScripts[90];
    else if (matchingScore >= 80) script = narrationScripts[80];
    else script = narrationScripts[70];
    
    // 🎪 개선된 나래이션 시퀀스 실행 (중단 가능)
    this.speak(script.start, true);
    
    setTimeout(() => {
      if (this.speechSynthesis.speaking || btn?.classList.contains('playing')) {
        this.speak(script.progress, true);
      }
    }, 3000);
    
    setTimeout(() => {
      if (this.speechSynthesis.speaking || btn?.classList.contains('playing')) {
        this.speak(script.result, true);
        
        // 나래이션 완료 후 버튼 상태 리셋
        setTimeout(() => {
          if (btn) {
            btn.classList.remove('playing');
            btn.innerHTML = '🎵 감동 메시지 듣기';
          }
        }, 8000); // 마지막 메시지 재생 완료 후
      }
    }, 6000);
    
    console.log('🎵 나래이션 시퀀스 시작:', script);
  }

  // 🚨 창우님을 위한 API 연결 테스트 함수 (긴급 수정)
  async testAPIConnection(targetUserId, compassElement) {
    console.log('🔌 API 연결 테스트 시작:', { targetUserId, compassElement });
    
    if (!compassElement) {
      alert('⚠️ 나침반 요소를 찾을 수 없습니다.');
      return;
    }
    
    try {
      // 실제 백엔드 API 연동으로 나침반 업데이트
      await this.updateCompassWithRealData(compassElement, 'current-user', targetUserId);
      
      console.log('✅ API 테스트 완료');
      
      if (this.isVoiceEnabled) {
        this.speak('API 연결 테스트가 성공적으로 완료되었습니다!', true);
      }
      
    } catch (error) {
      console.error('❌ API 테스트 실패:', error);
      
      if (this.isVoiceEnabled) {
        this.speak('API 연결에 문제가 발생했습니다. 데모 모드로 진행합니다.', true);
      }
    }
  }

  // 🧠 상세 매칭 분석 모달창 표시 (v2.1 실제 백엔드 데이터)
  showDetailedAnalysis(compassElement, realMatchingData = null) {
    const matchingScore = parseInt(compassElement.getAttribute('data-matching-score')) || 92;
    
    console.log('📊 상세 분석 모달 열기:', { matchingScore, realMatchingData });
    
    // 매칭도별 상세 분석 데이터 (프리미엄 v1.0 업그레이드)
    const analysisData = {
      92: {
        title: "92% 완벽한 궁합! 🎉",
        subtitle: "이런 부분에서 특히 잘 맞아요!",
        details: [
          { category: "가족 가치관", score: 98, description: "가족을 중시하는 마음이 완전히 일치해요" },
          { category: "여행 취향", score: 89, description: "새로운 경험을 함께 즐길 수 있어요" },
          { category: "인생 철학", score: 95, description: "삶을 바라보는 관점이 매우 비슷해요" },
          { category: "소통 방식", score: 88, description: "서로를 이해하고 배려하는 방식이 잘 맞아요" },
          { category: "미래 계획", score: 91, description: "앞으로의 꿈과 목표가 조화롭게 어우러져요" }
        ],
        conclusion: "정말 드문 인연입니다! 두 분이 함께하면 서로를 더욱 성장시킬 수 있는 관계가 될 것 같아요. 💕"
      },
      87: {
        title: "87% 매우 좋은 호환성! 💕",
        subtitle: "이런 면에서 서로 잘 통해요!",
        details: [
          { category: "예술 감성", score: 94, description: "문화와 예술에 대한 깊은 공감대가 있어요" },
          { category: "성장 마인드", score: 89, description: "배움과 발전을 추구하는 마음이 통해요" },
          { category: "독서 취향", score: 85, description: "지적 대화를 나눌 수 있어요" },
          { category: "소통 스타일", score: 88, description: "예술적 감성으로 대화가 풍부해져요" },
          { category: "생활 철학", score: 82, description: "아름다운 것을 추구하는 마음이 비슷해요" }
        ],
        conclusion: "예술적 감성을 공유할 수 있는 아름다운 만남이 될 것 같아요! 함께 문화생활을 즐기며 더욱 깊어질 관계예요. ✨"
      },
      84: {
        title: "84% 좋은 궁합! 🌟",
        subtitle: "이런 면에서 서로 어울려요!",
        details: [
          { category: "인생 지혜", score: 92, description: "경험에서 우러나온 깊은 통찰력을 공유해요" },
          { category: "여행 철학", score: 88, description: "새로운 세상을 탐험하는 열정이 같아요" },
          { category: "소통 능력", score: 85, description: "진솔하고 깊이 있는 대화가 가능해요" },
          { category: "성장 의지", score: 79, description: "나이와 상관없이 계속 발전하려는 마음" },
          { category: "포용력", score: 86, description: "상대방을 이해하고 받아들이는 마음이 넓어요" }
        ],
        conclusion: "지혜롭고 성숙한 관계를 만들어갈 수 있는 좋은 인연이에요! 서로의 경험을 나누며 더욱 풍요로운 삶을 만들어가실 수 있을 거예요. 🌟"
      }
    };

    // 🚀 실제 백엔드 데이터 사용 또는 기본 데이터 (v2.1)
    let data;
    
    if (realMatchingData && realMatchingData.breakdown && realMatchingData.isRealData) {
      console.log('📊 실제 백엔드 데이터로 상세 분석 생성');
      
      // 실제 IntelligentMatchingEngine 결과를 사용
      const breakdown = realMatchingData.breakdown;
      const reasons = realMatchingData.reasons || [];
      
      data = {
        title: `${matchingScore}% ${this.getCompatibilityLevel(matchingScore)} 🎯`,
        subtitle: "IntelligentMatchingEngine 실제 분석 결과",
        details: [
          { 
            category: "핵심 가치관", 
            score: Math.round(breakdown.coreValues || matchingScore - 5), 
            description: "인생에서 중요하게 생각하는 가치관이 얼마나 일치하는지" 
          },
          { 
            category: "성격 호환성", 
            score: Math.round(breakdown.personalityFit || matchingScore - 3), 
            description: "성격적 특성이 서로 얼마나 잘 맞는지" 
          },
          { 
            category: "라이프스타일", 
            score: Math.round(breakdown.lifestyleCompat || matchingScore + 2), 
            description: "생활 방식과 일상 패턴의 조화 정도" 
          },
          { 
            category: "소통 방식", 
            score: Math.round(breakdown.communicationSync || matchingScore - 8), 
            description: "의사소통 스타일과 대화 방식의 궁합" 
          },
          { 
            category: "성장 가능성", 
            score: Math.round(breakdown.growthPotential || matchingScore - 10), 
            description: "함께 발전하고 성장할 수 있는 잠재력" 
          }
        ],
        conclusion: reasons.length > 0 
          ? `💡 매칭 이유: ${reasons.slice(0, 2).join(', ')}. 실제 분석 결과입니다!`
          : `${matchingScore}% 호환성으로 좋은 인연이 될 것 같습니다! (실제 분석 완료)`,
        isRealData: true
      };
    } else {
      console.log('📊 데모 데이터로 상세 분석 생성');
      data = analysisData[matchingScore] || analysisData[92];
      data.isRealData = false;
    }
    
    // 호환성 레벨 표시 추가
    const dataSourceIndicator = data.isRealData 
      ? '<span style="color: #4CAF50; font-size: 0.9em;">🎯 실제 분석</span>'
      : '<span style="color: #FF9800; font-size: 0.9em;">📊 데모 모드</span>';
    
    // 기존 모달 제거
    const existingModal = document.querySelector('.detailed-analysis-modal');
    if (existingModal) existingModal.remove();

    // 모달 HTML 생성
    const modalHTML = `
      <div class="detailed-analysis-modal">
        <div class="analysis-content">
          <div class="analysis-header">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
              <h2 style="color: var(--heart-red); margin: 0;">${data.title}</h2>
              ${dataSourceIndicator}
            </div>
            <p style="color: var(--text-secondary);">${data.subtitle}</p>
          </div>
          
          <div class="analysis-details">
            ${data.details.map(item => `
              <div class="analysis-item">
                <div>
                  <div style="font-weight: 600; margin-bottom: 4px;">${item.category}</div>
                  <div style="font-size: var(--font-size-small); color: var(--text-secondary);">${item.description}</div>
                </div>
                <div class="analysis-score">${item.score}점</div>
              </div>
            `).join('')}
          </div>
          
          <div style="
            margin-top: var(--spacing-xl); 
            padding: var(--spacing-lg); 
            background: linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(192, 57, 43, 0.1) 100%); 
            border-radius: var(--radius-md);
            border-left: 4px solid var(--heart-red);
          ">
            <p style="text-align: center; font-style: italic; color: var(--text-primary);">
              ${data.conclusion}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: var(--spacing-xl);">
            <button onclick="this.closest('.detailed-analysis-modal').remove()" style="
              background: var(--heart-red);
              color: white;
              border: none;
              padding: var(--spacing-md) var(--spacing-xl);
              border-radius: 25px;
              cursor: pointer;
              font-size: var(--font-size-normal);
              transition: all 0.3s ease;
            ">
              💕 이해했어요!
            </button>
          </div>
        </div>
      </div>
    `;

    // 모달을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 애니메이션을 위해 약간의 지연 후 show 클래스 추가
    setTimeout(() => {
      const modal = document.querySelector('.detailed-analysis-modal');
      if (modal) modal.classList.add('show');
    }, 10);

    // 음성 안내
    if (this.isVoiceEnabled) {
      this.speak(`${data.title.replace(/[🎉💕✨]/g, '')} 상세 분석 결과를 보여드리겠습니다.`);
    }

    // 모달 외부 클릭 시 닫기
    document.querySelector('.detailed-analysis-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        e.target.remove();
      }
    });
  }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  const seniorUI = new SeniorUI();
  
  // 전역 접근을 위해 window 객체에 할당
  window.seniorUI = seniorUI;

  // 윈도우 리사이즈 처리
  window.addEventListener('resize', () => {
    seniorUI.handleResize();
  });

  // 초기 리사이즈 처리
  seniorUI.handleResize();

  // 🧭💕 하트 나침반 데모 애니메이션 시작 (3초 후)
  setTimeout(() => {
    seniorUI.startCompassDemo();
  }, 3000);
});

// 페이지 언로드 시 설정 저장
window.addEventListener('beforeunload', () => {
  const voiceToggle = document.getElementById('voiceToggle');
  if (voiceToggle) {
    localStorage.setItem('voiceEnabled', voiceToggle.classList.contains('active'));
  }
});
