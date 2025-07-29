// 중장년층 친화적 UI/UX JavaScript
class SeniorUI {
  constructor() {
    this.isVoiceEnabled = false;
    this.currentSignupStep = 1;
    this.speechSynthesis = window.speechSynthesis;
    this.currentVoice = null;
    this.currentFontSize = 'normal';

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

    if (priority) {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.currentVoice;
    utterance.rate = 0.8; // 조금 천천히
    utterance.pitch = 1;
    utterance.volume = 0.8;

    this.speechSynthesis.speak(utterance);
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

  // 🎪 v2.1 하트 나침반 애니메이션 실행 (감동 극대화)
  showMatchingResult(compassElement, matchingPercentage) {
    const needle = compassElement.querySelector('.heart-needle');
    const angle = this.calculateHeartNeedleAngle(matchingPercentage);
    
    // 시작 전 나래이션 (v2.1 추가)
    if (this.isVoiceEnabled) {
      this.speak("나침반이 당신의 운명을 찾고 있습니다...");
    }
    
    // CSS 변수로 각도 설정
    compassElement.style.setProperty('--matching-angle', `${angle}deg`);
    compassElement.setAttribute('data-matching-score', matchingPercentage);
    
    // 높은 호환성일 때 특별 효과
    if (matchingPercentage >= 90) {
      compassElement.classList.add('high-compatibility');
      // True Love 메시지 강조
      const trueLoveMark = compassElement.querySelector('.true-love-mark');
      if (trueLoveMark) {
        trueLoveMark.style.animation = 'heartPulse 1.5s infinite';
        trueLoveMark.style.color = 'var(--heart-red)';
        trueLoveMark.style.fontWeight = 'bold';
      }
    }

    // 바늘 애니메이션 시작
    needle.classList.add('matching-reveal');
    
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

  // 🔌 백엔드 API 연동 기능
  async fetchMatchingData(userId, targetId) {
    try {
      const response = await fetch(`/api/matching/${userId}/${targetId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('매칭 데이터를 불러오는데 실패했습니다:', error);
      // 폴백 데이터 반환
      return {
        compatibility: 75,
        needleAngle: 45,
        message: "매칭 분석 중입니다. 잠시 후 다시 시도해주세요."
      };
    }
  }

  // 실제 API 데이터로 나침반 업데이트
  async updateCompassWithRealData(compassElement, userId, targetId) {
    // 로딩 상태 표시
    const needle = compassElement.querySelector('.heart-needle');
    needle.style.animation = 'spin 2s linear infinite';
    
    if (this.isVoiceEnabled) {
      this.speak('매칭 분석 중입니다. 잠시만 기다려주세요.');
    }

    try {
      const matchingData = await this.fetchMatchingData(userId, targetId);
      
      // 로딩 애니메이션 중지
      needle.style.animation = '';
      
      // 실제 데이터로 나침반 업데이트
      this.showMatchingResult(compassElement, matchingData.compatibility);
      
      // 하단 메시지 업데이트
      const messageElement = compassElement.parentElement.querySelector('[data-message]');
      if (messageElement) {
        messageElement.textContent = matchingData.message || this.getMatchingMessage(matchingData.compatibility);
      }

    } catch (error) {
      console.error('매칭 데이터 업데이트 실패:', error);
      
      // 에러 시 기본 데모 표시
      needle.style.animation = '';
      this.showMatchingResult(compassElement, 75);
      
      if (this.isVoiceEnabled) {
        this.speak('매칭 분석에 문제가 발생했습니다. 기본 결과를 표시합니다.');
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

  // 🎭 v2.1 감동적인 음성 나래이션 시스템
  playMatchingNarration(matchingScore) {
    const btn = document.querySelector('.voice-narration-btn');
    if (btn) btn.classList.add('playing');

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
    else if (matchingScore >= 70) script = narrationScripts[70];

    // 3단계 나래이션 실행
    this.speak(script.start);
    
    setTimeout(() => {
      this.speak(script.progress);
    }, 3000);

    setTimeout(() => {
      this.speak(script.result);
      if (btn) btn.classList.remove('playing');
    }, 6000);
  }

  // 🧠 상세 매칭 분석 모달창 표시
  showDetailedAnalysis(compassElement) {
    const matchingScore = parseInt(compassElement.getAttribute('data-matching-score')) || 92;
    
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

    const data = analysisData[matchingScore] || analysisData[92];
    
    // 기존 모달 제거
    const existingModal = document.querySelector('.detailed-analysis-modal');
    if (existingModal) existingModal.remove();

    // 모달 HTML 생성
    const modalHTML = `
      <div class="detailed-analysis-modal">
        <div class="analysis-content">
          <div class="analysis-header">
            <h2 style="color: var(--heart-red); margin-bottom: var(--spacing-sm);">${data.title}</h2>
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
