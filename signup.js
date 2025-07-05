// 회원가입 관리 객체
const SignupManager = {
    currentStep: 1,
    totalSteps: 3,
    formData: {},
    
    init() {
        this.loadAssessmentResult();
        this.initializeEventListeners();
        this.validateCurrentStep();
    },
    
    // 가치관 테스트 결과 로드
    loadAssessmentResult() {
        const urlParams = new URLSearchParams(window.location.search);
        const fromAssessment = urlParams.get('from') === 'assessment';
        
        if (fromAssessment) {
            const result = localStorage.getItem('valuesAssessmentResult');
            if (result) {
                const assessment = JSON.parse(result);
                const resultDiv = document.getElementById('assessmentResult');
                const typeElement = document.getElementById('resultType');
                const descElement = document.getElementById('resultDescription');
                
                typeElement.textContent = `🎉 당신의 성격 유형: ${assessment.personalityType}`;
                descElement.textContent = '가치관 테스트 결과를 바탕으로 더 정확한 매칭을 제공해드립니다!';
                resultDiv.style.display = 'block';
                
                // 폼 데이터에 저장
                this.formData.assessmentResult = assessment;
            }
        }
    },
    
    // 이벤트 리스너 초기화
    initializeEventListeners() {
        // 입력 필드 실시간 검증
        const inputs = document.querySelectorAll('.form-input, .form-select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        // 비밀번호 확인 실시간 검증
        document.getElementById('passwordConfirm').addEventListener('input', () => {
            this.validatePasswordMatch();
        });
        
        // 프로필 사진 업로드
        document.getElementById('profilePhoto').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });
        
        // 전체 동의 체크박스
        document.getElementById('agreeAll').addEventListener('change', (e) => {
            this.toggleAllAgreements(e.target.checked);
        });
        
        // 개별 동의 체크박스들
        const agreementCheckboxes = document.querySelectorAll('input[name="agreements"]');
        agreementCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateAllAgreementState());
        });
    },
    
    // 다음 단계로
    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }
        
        this.saveCurrentStepData();
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            
            if (this.currentStep === this.totalSteps) {
                document.getElementById('nextBtn').textContent = '회원가입 완료';
            }
        } else {
            this.submitForm();
        }
    },
    
    // 이전 단계로
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            document.getElementById('nextBtn').textContent = '다음 단계';
        }
    },
    
    // 단계 표시 업데이트
    updateStepDisplay() {
        // 모든 단계 숨기기
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // 현재 단계 표시
        document.getElementById(`step${this.currentStep}Form`).classList.add('active');
        
        // 단계 인디케이터 업데이트
        for (let i = 1; i <= this.totalSteps; i++) {
            const stepNumber = document.getElementById(`step${i}`);
            const stepText = stepNumber.nextElementSibling;
            const divider = document.getElementById(`divider${i}`);
            
            if (i < this.currentStep) {
                stepNumber.classList.remove('active');
                stepNumber.classList.add('completed');
                stepNumber.innerHTML = '✓';
                stepText.classList.remove('active');
                if (divider) divider.classList.add('completed');
            } else if (i === this.currentStep) {
                stepNumber.classList.remove('completed');
                stepNumber.classList.add('active');
                stepNumber.textContent = i;
                stepText.classList.add('active');
            } else {
                stepNumber.classList.remove('active', 'completed');
                stepNumber.textContent = i;
                stepText.classList.remove('active');
            }
        }
        
        // 네비게이션 버튼 업데이트
        document.getElementById('prevBtn').style.display = this.currentStep > 1 ? 'block' : 'none';
    },
    
    // 현재 단계 데이터 저장
    saveCurrentStepData() {
        const currentForm = document.getElementById(`step${this.currentStep}Form`);
        const inputs = currentForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) {
                    if (!this.formData[input.name]) {
                        this.formData[input.name] = [];
                    }
                    if (Array.isArray(this.formData[input.name])) {
                        this.formData[input.name].push(input.value);
                    }
                }
            } else {
                this.formData[input.name] = input.value;
            }
        });
    },
    
    // 현재 단계 검증
    validateCurrentStep() {
        const currentForm = document.getElementById(`step${this.currentStep}Form`);
        const requiredInputs = currentForm.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // 3단계에서는 필수 약관 동의 확인
        if (this.currentStep === 3) {
            const requiredAgreements = document.querySelectorAll('input[name="agreements"][required]');
            let agreementsValid = true;
            
            requiredAgreements.forEach(agreement => {
                if (!agreement.checked) {
                    agreementsValid = false;
                }
            });
            
            if (!agreementsValid) {
                this.showError('필수 약관에 동의해주세요.');
                return false;
            }
        }
        
        return isValid;
    },
    
    // 개별 필드 검증
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // 필수 필드 검증
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = '필수 입력 항목입니다.';
        }
        
        // 이메일 검증
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = '올바른 이메일 형식을 입력해주세요.';
            }
        }
        
        // 비밀번호 검증
        if (fieldName === 'password' && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = '비밀번호는 8자 이상이어야 합니다.';
            } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
                isValid = false;
                errorMessage = '영문과 숫자를 포함해야 합니다.';
            }
        }
        
        // 이름 검증
        if (fieldName === 'name' && value) {
            const nameRegex = /^[가-힣a-zA-Z\s]{2,20}$/;
            if (!nameRegex.test(value)) {
                isValid = false;
                errorMessage = '올바른 이름을 입력해주세요.';
            }
        }
        
        // 생년월일 검증 (40-60세)
        if (fieldName === 'birthdate' && value) {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            
            if (age < 40 || age > 70) {
                isValid = false;
                errorMessage = '40세 이상 70세 이하 분들을 대상으로 합니다.';
            }
        }
        
        // 휴대폰 번호 검증
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^010-?\d{4}-?\d{4}$/;
            if (!phoneRegex.test(value.replace(/-/g, ''))) {
                isValid = false;
                errorMessage = '올바른 휴대폰 번호를 입력해주세요.';
            }
        }
        
        // 에러 표시
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    },
    
    // 비밀번호 일치 검증
    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const confirmField = document.getElementById('passwordConfirm');
        
        if (passwordConfirm && password !== passwordConfirm) {
            this.showFieldError(confirmField, '비밀번호가 일치하지 않습니다.');
            return false;
        } else {
            this.clearFieldError(confirmField);
            return true;
        }
    },
    
    // 필드 에러 표시
    showFieldError(field, message) {
        field.classList.add('error');
        const errorElement = document.getElementById(field.name + 'Error') || 
                           field.parentNode.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    },
    
    // 필드 에러 제거
    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = document.getElementById(field.name + 'Error') || 
                           field.parentNode.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    },
    
    // 일반 에러 메시지 표시
    showError(message) {
        // 간단한 알림으로 표시
        alert(message);
    },
    
    // 프로필 사진 업로드 처리
    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 파일 크기 검증 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('이미지 크기는 5MB 이하여야 합니다.');
            return;
        }
        
        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            this.showError('이미지 파일만 업로드 가능합니다.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
            
            // 업로드 텍스트 숨기기
            document.querySelector('.upload-text').style.display = 'none';
            document.querySelector('.upload-hint').style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        this.formData.profilePhoto = file;
    },
    
    // 전체 동의 토글
    toggleAllAgreements(checked) {
        const agreementCheckboxes = document.querySelectorAll('input[name="agreements"]');
        agreementCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
            this.updateCheckboxStyle(checkbox.parentElement, checked);
        });
    },
    
    // 전체 동의 상태 업데이트
    updateAllAgreementState() {
        const agreementCheckboxes = document.querySelectorAll('input[name="agreements"]');
        const allChecked = Array.from(agreementCheckboxes).every(cb => cb.checked);
        document.getElementById('agreeAll').checked = allChecked;
    },
    
    // 소셜 로그인
    socialLogin(provider) {
        if (provider === 'kakao') {
            this.showError('카카오 로그인은 준비 중입니다. 곧 서비스될 예정입니다!');
        } else if (provider === 'naver') {
            this.showError('네이버 로그인은 준비 중입니다. 곧 서비스될 예정입니다!');
        }
    },
    
    // 폼 제출
    async submitForm() {
        this.saveCurrentStepData();
        
        // 로딩 표시
        const submitBtn = document.getElementById('nextBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '가입 처리 중...';
        
        try {
            // 실제 서버 전송 시뮬레이션
            await this.simulateServerRequest();
            
            // 성공 처리
            this.showSuccessMessage();
            
        } catch (error) {
            this.showError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },
    
    // 서버 요청 시뮬레이션
    simulateServerRequest() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 가입 정보를 로컬 스토리지에 저장 (실제로는 서버에 전송)
                const userData = {
                    ...this.formData,
                    joinDate: new Date().toISOString(),
                    status: 'active'
                };
                
                localStorage.setItem('userProfile', JSON.stringify(userData));
                resolve();
            }, 2000);
        });
    },
    
    // 성공 메시지 표시
    showSuccessMessage() {
        const container = document.querySelector('.signup-container');
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 0;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: var(--primary-color); margin-bottom: 1rem;">회원가입 완료!</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
                    CHARM_INYEON 가족이 되신 것을 환영합니다!<br>
                    이제 가치관 기반 매칭을 통해 특별한 인연을 만나보세요.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button onclick="window.location.href='index.html'" 
                            style="padding: 1rem 2rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        홈으로 돌아가기
                    </button>
                    <button onclick="window.location.href='profile.html'" 
                            style="padding: 1rem 2rem; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        프로필 완성하기
                    </button>
                </div>
            </div>
        `;
    }
};

// 체크박스 토글 함수
function toggleCheckbox(checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    const item = checkbox.closest('.checkbox-item');
    
    checkbox.checked = !checkbox.checked;
    SignupManager.updateCheckboxStyle(item, checkbox.checked);
    
    if (checkbox.name === 'agreements') {
        SignupManager.updateAllAgreementState();
    }
}

// 체크박스 스타일 업데이트
SignupManager.updateCheckboxStyle = function(item, checked) {
    if (checked) {
        item.classList.add('checked');
    } else {
        item.classList.remove('checked');
    }
};

// 프로필 사진 업로드 트리거
function triggerPhotoUpload() {
    document.getElementById('profilePhoto').click();
}

// 소셜 로그인 함수
function socialLogin(provider) {
    SignupManager.socialLogin(provider);
}

// 단계 이동 함수들
function nextStep() {
    SignupManager.nextStep();
}

function prevStep() {
    SignupManager.prevStep();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    SignupManager.init();
});