/**
 * CHARM_INYEON Test Requirements Collection
 * 테스트 요구사항 수집 도구
 */

class TestRequirementsCollection {
  constructor() {
    this.requirements = [];
    this.currentRequirementId = 1;
    this.isVoiceEnabled = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAccessibilityFeatures();
    this.updateStepNumbers();
  }

  setupEventListeners() {
    // 폼 제출
    const form = document.getElementById('requirementsForm');
    if (form) {
      form.addEventListener('submit', e => this.handleFormSubmit(e));
    }

    // 내보내기 버튼
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportRequirements());
    }

    // 초기화 버튼
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAll());
    }

    // 단계 추가 버튼
    const addStepBtn = document.getElementById('addStep');
    if (addStepBtn) {
      addStepBtn.addEventListener('click', () => this.addTestStep());
    }

    // 단계 삭제 버튼들 (이벤트 위임)
    const testSteps = document.getElementById('testSteps');
    if (testSteps) {
      testSteps.addEventListener('click', e => {
        if (e.target.classList.contains('btn-remove')) {
          this.removeTestStep(e.target.closest('.step-item'));
        }
      });
    }

    // 실시간 유효성 검사
    const requiredFields = document.querySelectorAll('.form-input[required]');
    requiredFields.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearFieldError(field));
    });
  }

  setupAccessibilityFeatures() {
    // 음성 안내 토글
    const voiceToggle = document.getElementById('voiceToggle');
    if (voiceToggle) {
      voiceToggle.addEventListener('click', () => this.toggleVoice());
    }

    // 글씨 크기 조절
    const fontSizeBtns = document.querySelectorAll('.font-size-btn');
    fontSizeBtns.forEach(btn => {
      btn.addEventListener('click', e => this.changeFontSize(e.target.dataset.size));
    });

    // 키보드 네비게이션 개선
    this.setupKeyboardNavigation();
  }

  setupKeyboardNavigation() {
    // Enter 키로 단계 추가
    const stepInputs = document.querySelectorAll('.step-input');
    stepInputs.forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.addTestStep();
        }
      });
    });
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    const voiceToggle = document.getElementById('voiceToggle');
    const voiceStatus = document.getElementById('voiceStatus');

    if (voiceToggle && voiceStatus) {
      voiceToggle.setAttribute('aria-pressed', this.isVoiceEnabled.toString());
      voiceStatus.textContent = this.isVoiceEnabled ? '켜짐' : '꺼짐';

      if (this.isVoiceEnabled) {
        this.speak('음성 안내가 켜졌습니다');
      }
    }
  }

  speak(text) {
    if (this.isVoiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  changeFontSize(size) {
    const fontSizeBtns = document.querySelectorAll('.font-size-btn');
    fontSizeBtns.forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.querySelector(`[data-size="${size}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // 폰트 크기 적용
    const root = document.documentElement;
    switch (size) {
      case 'small':
        root.style.fontSize = '16px';
        break;
      case 'normal':
        root.style.fontSize = '18px';
        break;
      case 'large':
        root.style.fontSize = '20px';
        break;
    }

    this.speak(
      `글씨 크기를 ${
        size === 'small' ? '작게' : size === 'large' ? '크게' : '보통으로'
      } 변경했습니다`
    );
  }

  addTestStep() {
    const testSteps = document.getElementById('testSteps');
    if (!testSteps) return;

    const stepCount = testSteps.children.length + 1;
    const stepItem = document.createElement('li');
    stepItem.className = 'step-item';
    stepItem.innerHTML = `
            <span class="step-number">${stepCount}</span>
            <input type="text" class="step-input" placeholder="${stepCount}번째 단계를 입력하세요" required>
            <button type="button" class="btn-remove" aria-label="단계 삭제">×</button>
        `;

    testSteps.appendChild(stepItem);

    // 새로 추가된 입력 필드에 포커스
    const newInput = stepItem.querySelector('.step-input');
    if (newInput) {
      newInput.focus();

      // 키보드 이벤트 리스너 추가
      newInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.addTestStep();
        }
      });
    }

    this.speak('새 단계가 추가되었습니다');
  }

  removeTestStep(stepItem) {
    const testSteps = document.getElementById('testSteps');
    if (!testSteps || testSteps.children.length <= 1) {
      this.speak('최소 한 개의 단계는 유지되어야 합니다');
      return;
    }

    stepItem.remove();
    this.updateStepNumbers();
    this.speak('단계가 삭제되었습니다');
  }

  updateStepNumbers() {
    const testSteps = document.getElementById('testSteps');
    if (!testSteps) return;

    const stepItems = testSteps.querySelectorAll('.step-item');
    stepItems.forEach((item, index) => {
      const stepNumber = item.querySelector('.step-number');
      const stepInput = item.querySelector('.step-input');

      if (stepNumber) {
        stepNumber.textContent = index + 1;
      }

      if (stepInput) {
        stepInput.placeholder = `${index + 1}번째 단계를 입력하세요`;
      }
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    const errorElement = document.getElementById(`${fieldId}Error`);

    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
      errorMessage = '이 필드는 필수 입력 항목입니다.';
    } else if (fieldId === 'testTitle' && value.length < 3) {
      errorMessage = '제목은 최소 3자 이상 입력해주세요.';
    } else if (fieldId === 'testDescription' && value.length < 10) {
      errorMessage = '설명은 최소 10자 이상 입력해주세요.';
    } else if (fieldId === 'testPreconditions' && value.length < 5) {
      errorMessage = '사전 조건은 최소 5자 이상 입력해주세요.';
    } else if (fieldId === 'testExpectedResults' && value.length < 5) {
      errorMessage = '예상 결과는 최소 5자 이상 입력해주세요.';
    }

    if (errorMessage) {
      this.showFieldError(field, errorMessage);
      return false;
    } else {
      this.clearFieldError(field);
      return true;
    }
  }

  showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }

    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
  }

  clearFieldError(field) {
    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }

    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
  }

  validateForm() {
    const form = document.getElementById('requirementsForm');
    if (!form) return false;

    let isValid = true;

    // 필수 필드 검증
    const requiredFields = form.querySelectorAll('.form-input[required]');
    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // 테스트 단계 검증
    const stepInputs = form.querySelectorAll('.step-input');
    const hasEmptyStep = Array.from(stepInputs).some(input => !input.value.trim());

    if (hasEmptyStep) {
      const stepsError = document.getElementById('testStepsError');
      if (stepsError) {
        stepsError.textContent = '모든 테스트 단계를 입력해주세요.';
        stepsError.classList.add('show');
      }
      isValid = false;
    } else {
      const stepsError = document.getElementById('testStepsError');
      if (stepsError) {
        stepsError.textContent = '';
        stepsError.classList.remove('show');
      }
    }

    return isValid;
  }

  collectFormData() {
    const form = document.getElementById('requirementsForm');
    if (!form) return null;

    // 테스트 단계 수집
    const stepInputs = form.querySelectorAll('.step-input');
    const steps = Array.from(stepInputs)
      .map(input => input.value.trim())
      .filter(step => step);

    const requirement = {
      id: `req-${String(this.currentRequirementId).padStart(3, '0')}`,
      title: document.getElementById('testTitle')?.value.trim() || '',
      description: document.getElementById('testDescription')?.value.trim() || '',
      priority: document.getElementById('testPriority')?.value || '',
      category: document.getElementById('testCategory')?.value || '',
      preconditions: document.getElementById('testPreconditions')?.value.trim() || '',
      steps: steps,
      expectedResults: document.getElementById('testExpectedResults')?.value.trim() || '',
      environment: document.getElementById('testEnvironment')?.value.trim() || '',
      notes: document.getElementById('testNotes')?.value.trim() || '',
    };

    return requirement;
  }

  handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.speak('입력 내용에 오류가 있습니다. 확인해주세요.');
      return;
    }

    const requirement = this.collectFormData();
    if (!requirement) return;

    this.requirements.push(requirement);
    this.currentRequirementId++;

    // 성공 메시지 표시
    this.showSuccessMessage();

    // 폼 초기화
    this.resetForm();

    // 수집된 요구사항 목록 업데이트
    this.updateRequirementsList();

    // 내보내기 버튼 활성화
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.disabled = false;
    }

    this.speak('요구사항이 성공적으로 추가되었습니다');
  }

  showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
      successMessage.classList.add('show');

      // 3초 후 메시지 숨기기
      setTimeout(() => {
        successMessage.classList.remove('show');
      }, 3000);
    }
  }

  resetForm() {
    const form = document.getElementById('requirementsForm');
    if (!form) return;

    // 기본 필드 초기화
    form.reset();

    // 에러 메시지 초기화
    const errorElements = form.querySelectorAll('.form-error');
    errorElements.forEach(error => {
      error.textContent = '';
      error.classList.remove('show');
    });

    // 필드 에러 스타일 초기화
    const inputElements = form.querySelectorAll('.form-input');
    inputElements.forEach(input => {
      input.classList.remove('error');
      input.setAttribute('aria-invalid', 'false');
    });

    // 테스트 단계를 1개로 초기화
    const testSteps = document.getElementById('testSteps');
    if (testSteps) {
      testSteps.innerHTML = `
                <li class="step-item">
                    <span class="step-number">1</span>
                    <input type="text" class="step-input" placeholder="첫 번째 단계를 입력하세요" required>
                    <button type="button" class="btn-remove" aria-label="단계 삭제">×</button>
                </li>
            `;
    }

    // 첫 번째 필드에 포커스
    const firstInput = form.querySelector('.form-input');
    if (firstInput) {
      firstInput.focus();
    }
  }

  updateRequirementsList() {
    const requirementsList = document.getElementById('requirementsList');
    const requirementsItems = document.getElementById('requirementsItems');

    if (!requirementsList || !requirementsItems) return;

    if (this.requirements.length === 0) {
      requirementsList.style.display = 'none';
      return;
    }

    requirementsList.style.display = 'block';

    requirementsItems.innerHTML = this.requirements
      .map(req => {
        const priorityText =
          {
            high: '높음',
            medium: '보통',
            low: '낮음',
          }[req.priority] || req.priority;

        const categoryText =
          {
            functional: '기능 테스트',
            security: '보안 테스트',
            performance: '성능 테스트',
            ui: '사용자 인터페이스 테스트',
            integration: '통합 테스트',
          }[req.category] || req.category;

        return `
                <div class="requirement-item">
                    <div class="requirement-title">${req.title}</div>
                    <div class="requirement-meta">
                        <span>우선순위: ${priorityText}</span>
                        <span>분류: ${categoryText}</span>
                        <span>단계: ${req.steps.length}개</span>
                    </div>
                    <div class="requirement-description">${req.description}</div>
                </div>
            `;
      })
      .join('');
  }

  exportRequirements() {
    if (this.requirements.length === 0) {
      this.speak('내보낼 요구사항이 없습니다');
      return;
    }

    const exportData = {
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0',
        tool: 'CHARM_INYEON Test Requirements Collection',
        totalRequirements: this.requirements.length,
      },
      requirements: this.requirements,
    };

    // JSON 파일 생성 및 다운로드
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 타임스탬프 기반 파일명 생성
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-requirements-${timestamp}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URL 정리
    URL.revokeObjectURL(url);

    this.speak(`${this.requirements.length}개의 요구사항이 JSON 파일로 내보내졌습니다`);
  }

  clearAll() {
    if (this.requirements.length === 0) {
      this.speak('초기화할 내용이 없습니다');
      return;
    }

    const confirmation = confirm(
      '모든 수집된 요구사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    );

    if (confirmation) {
      this.requirements = [];
      this.currentRequirementId = 1;

      this.resetForm();
      this.updateRequirementsList();

      const exportBtn = document.getElementById('exportBtn');
      if (exportBtn) {
        exportBtn.disabled = true;
      }

      const successMessage = document.getElementById('successMessage');
      if (successMessage) {
        successMessage.classList.remove('show');
      }

      this.speak('모든 요구사항이 초기화되었습니다');
    }
  }
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
  new TestRequirementsCollection();
});
