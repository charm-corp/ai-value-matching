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
                this.speak('음성 안내가 켜졌습니다. 버튼이나 링크에 마우스를 올리면 설명을 들을 수 있습니다.');
                this.setupVoiceEvents();
            } else {
                this.speak('음성 안내가 꺼졌습니다.');
                this.removeVoiceEvents();
            }
        });
    }

    speak(text, priority = false) {
        if (!this.isVoiceEnabled || !this.speechSynthesis) return;

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
            text = element.textContent.trim() || element.getAttribute('aria-label') || element.getAttribute('title');
        }
        
        if (text) {
            this.speak(text);
        }
    }

    announcePageLoad() {
        setTimeout(() => {
            if (this.isVoiceEnabled) {
                this.speak('CHARM_INYEON 홈페이지에 오신 것을 환영합니다. 중장년층을 위한 따뜻한 만남의 공간입니다.', true);
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
                    this.speak(`글씨 크기를 ${size === 'small' ? '작게' : size === 'large' ? '크게' : '보통으로'} 변경했습니다.`);
                }
            });
        });

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
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
            link.addEventListener('click', (e) => {
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
                behavior: 'smooth'
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
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                this.closeModal(modal.id);
            });
        });

        // 배경 클릭으로 닫기
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
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
        document.getElementById('signupStep3').addEventListener('submit', (e) => {
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
            agreeMarketing: document.getElementById('agree-marketing').checked
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
        document.addEventListener('keydown', (e) => {
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
        const trapFocus = (modal) => {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length === 0) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            modal.addEventListener('keydown', (e) => {
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
        this.announceToScreenReader = (message) => {
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
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    const seniorUI = new SeniorUI();
    
    // 윈도우 리사이즈 처리
    window.addEventListener('resize', () => {
        seniorUI.handleResize();
    });
    
    // 초기 리사이즈 처리
    seniorUI.handleResize();
});

// 페이지 언로드 시 설정 저장
window.addEventListener('beforeunload', () => {
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
        localStorage.setItem('voiceEnabled', voiceToggle.classList.contains('active'));
    }
});