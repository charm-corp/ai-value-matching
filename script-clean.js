// CHARM_INYEON - 깨끗하고 단순한 JavaScript
// 기본 기능만 작동하도록 최소화

console.log('🚀 CHARM_INYEON JavaScript 로드됨');

// ===== 기본 유틸리티 함수들 =====

// 모달 표시 함수
function showSimpleModal(title, message) {
  // 기존 모달 제거
  const existingModal = document.querySelector('.simple-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 새 모달 생성
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'simple-modal-overlay';
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
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  `;
  
  modalContent.innerHTML = `
    <h3 style="margin: 0 0 15px 0; color: #2563eb;">${title}</h3>
    <p style="margin: 0 0 20px 0; color: #64748b;">${message}</p>
    <button onclick="this.closest('.simple-modal-overlay').remove()" style="
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      cursor: pointer;
    ">확인</button>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // 클릭해서 닫기
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

// HTML 모달 열기
function openHtmlModal(modalId) {
  console.log('모달 열기:', modalId);
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    console.log('모달 열림:', modalId);
  } else {
    console.error('모달을 찾을 수 없음:', modalId);
    showSimpleModal('오류', '모달을 찾을 수 없습니다.');
  }
}

// HTML 모달 닫기
function closeHtmlModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
  }
}

// ===== 회원가입 모달 생성 함수 =====
function createSignupModal() {
  console.log('회원가입 모달 생성');
  
  // 기존 모달 제거
  const existingModal = document.querySelector('.signup-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 새 모달 생성
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'signup-modal-overlay';
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
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 0;
    border-radius: 12px;
    max-width: 450px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  `;
  
  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0; color: #333;">회원가입</h2>
      <span onclick="this.closest('.signup-modal-overlay').remove()" style="cursor: pointer; font-size: 24px; color: #999;">&times;</span>
    </div>
    
    <form style="padding: 30px;">
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">이름</label>
        <input type="text" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        " placeholder="실명을 입력해주세요" />
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">이메일</label>
        <input type="email" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        " placeholder="example@email.com" />
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">비밀번호</label>
        <input type="password" required style="
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        " placeholder="8자 이상 입력해주세요" />
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">연령대</label>
        <select required style="
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
      
      <div style="margin-bottom: 20px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" required style="margin-right: 8px;" />
          <span>이용약관 및 개인정보처리방침에 동의합니다</span>
        </label>
      </div>
      
      <button type="submit" style="
        width: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        padding: 15px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
      ">회원가입</button>
    </form>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // 폼 제출 처리
  const form = modalContent.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    modalOverlay.remove();
    showSimpleModal('가입 완료', '회원가입이 완료되었습니다!');
  });
  
  // 클릭해서 닫기
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

// ===== DOM 로드 후 이벤트 리스너 설정 =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM 로드 완료 - 이벤트 리스너 설정');
  
  // 1. 로그인 버튼
  const loginBtn = document.querySelector('.login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      console.log('로그인 버튼 클릭됨');
      openHtmlModal('loginModal');
    });
    console.log('✅ 로그인 버튼 이벤트 등록됨');
  }
  
  // 2. 회원가입 버튼
  const signupBtn = document.querySelector('.signup-btn');
  if (signupBtn) {
    signupBtn.addEventListener('click', function() {
      console.log('회원가입 버튼 클릭됨');
      openHtmlModal('signupModal');
    });
    console.log('✅ 회원가입 버튼 이벤트 등록됨');
  }
  
  // 3. 무료로 시작하기 버튼 (onclick 속성 대신 이벤트 리스너로)
  const startBtn = document.getElementById('signup-btn');
  if (startBtn) {
    // onclick 속성 제거
    startBtn.removeAttribute('onclick');
    startBtn.addEventListener('click', function() {
      console.log('무료로 시작하기 버튼 클릭됨');
      createSignupModal();
    });
    console.log('✅ 무료로 시작하기 버튼 이벤트 등록됨');
  }
  
  // 4. 무료로 가입하기 버튼
  const signupBtn2 = document.getElementById('signup-btn-2');
  if (signupBtn2) {
    // onclick 속성 제거
    signupBtn2.removeAttribute('onclick');
    signupBtn2.addEventListener('click', function() {
      console.log('무료로 가입하기 버튼 클릭됨');
      createSignupModal();
    });
    console.log('✅ 무료로 가입하기 버튼 이벤트 등록됨');
  }
  
  // 5. 소개 영상 보기 버튼 (일단 간단한 메시지만)
  const videoBtn = document.querySelector('.secondary-button');
  if (videoBtn) {
    videoBtn.addEventListener('click', function() {
      console.log('소개 영상 보기 버튼 클릭됨');
      showSimpleModal('준비중', '소개 영상 기능은 곧 추가될 예정입니다.');
    });
    console.log('✅ 소개 영상 보기 버튼 이벤트 등록됨');
  }
  
  // 6. 모달 닫기 버튼들
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      if (modalId) {
        closeHtmlModal(modalId);
      }
    });
  });
  
  // 7. 모달 바깥 클릭해서 닫기
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
        document.body.classList.remove('modal-open');
      }
    });
  });
  
  console.log('🎉 모든 이벤트 리스너 등록 완료!');
});

// ===== 스무스 스크롤링 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// ===== 헤더 스크롤 효과 =====
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }
  }
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
  
  // 인증 상태 확인 후 처리 (현재는 항상 게스트로 처리)
  showGuestWidgetModal(widgetType);
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

// 게스트 사용자용 모달 표시
function showGuestWidgetModal(widgetType) {
  const modalContent = getGuestModalContent(widgetType);
  showAdvancedModal(modalContent.title, modalContent.content, modalContent.actions);
}

// 게스트용 모달 콘텐츠 생성
function getGuestModalContent(widgetType) {
  const contents = {
    'values': {
      title: '🎯 가치관 분석 미리보기',
      content: `
        <div style="text-align: left;">
          <h4 style="color: #1e293b; margin-bottom: 16px;">가치관 분석 예시</h4>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">📊</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">상세한 가치관 프로필</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">AI가 분석한 당신만의 가치관 지표와 성향</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">💡</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">호환성 분석</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">다른 회원들과의 가치관 호환성 점수</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">🎨</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">개인화된 추천</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">가치관 기반 맞춤형 매칭 추천</p>
              </div>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              로그인 후 본인만의 가치관 분석을 받아보세요!
            </p>
          </div>
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
        <div style="text-align: left;">
          <h4 style="color: #1e293b; margin-bottom: 16px;">AI 매칭 서비스</h4>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">🤖</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">AI 기반 매칭</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">고도화된 알고리즘으로 최적의 상대 찾기</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">⚡</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">실시간 매칭</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">24시간 자동으로 새로운 매칭 기회 발굴</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">🎯</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">정확한 매칭</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">가치관, 취향, 라이프스타일 종합 분석</p>
              </div>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              지금 가입하고 AI 매칭 서비스를 경험해보세요!
            </p>
          </div>
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
        <div style="text-align: left;">
          <h4 style="color: #1e293b; margin-bottom: 16px;">연결 관리 서비스</h4>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">👥</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">새로운 만남</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">매일 새로운 매칭 기회와 연결 알림</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">💌</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">안전한 소통</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">검증된 회원들과의 안전한 메시지 교환</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">🏆</div>
              <div>
                <h5 style="margin: 0 0 4px 0; color: #374151;">성공 사례</h5>
                <p style="margin: 0; font-size: 14px; color: #64748b;">실제 커플 성사률 78%의 검증된 플랫폼</p>
              </div>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="margin: 0; font-size: 14px; color: #475569;">
              지금 시작하고 새로운 인연을 만나보세요!
            </p>
          </div>
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
  const existingModal = document.querySelector('.advanced-modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }
  
  // 모달 오버레이 생성
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'advanced-modal-overlay';
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
  modalContent.style.cssText = `
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    font-size: 16px;
    line-height: 1.6;
  `;
  
  // 액션 버튼 생성
  const actionButtons = actions.map(action => 
    `<button onclick="handleModalAction('${action.action}')"
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
             ">
      ${action.text}
    </button>`
  ).join('');
  
  modalContent.innerHTML = `
    <div style="padding: 24px 24px 16px; border-bottom: 1px solid #e2e8f0;">
      <h3 style="margin: 0; font-size: 1.5em; color: #1e293b; display: flex; align-items: center; justify-content: space-between;">
        ${title}
        <button onclick="this.closest('.advanced-modal-overlay').remove()" style="
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
        ">×</button>
      </h3>
    </div>
    <div style="padding: 24px;">
      ${content}
    </div>
    <div style="padding: 16px 24px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      ${actionButtons}
    </div>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  // 모달 닫기 기능
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
  
  // 키보드 지원 (ESC 키로 닫기)
  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      modalOverlay.remove();
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
      // 기존 모달 닫기
      document.querySelector('.advanced-modal-overlay')?.remove();
      // 회원가입 모달 열기
      createSignupModal();
      break;
    case 'login':
      // 기존 모달 닫기
      document.querySelector('.advanced-modal-overlay')?.remove();
      // 로그인 알림
      showSimpleModal('로그인', '로그인 기능을 구현 중입니다. 잠시만 기다려주세요.');
      break;
    case 'learnMore':
      document.querySelector('.advanced-modal-overlay')?.remove();
      showSimpleModal('서비스 소개', 'CHARM_INYEON의 더 자세한 서비스를 소개합니다.');
      break;
    case 'viewSuccess':
      document.querySelector('.advanced-modal-overlay')?.remove();
      showSimpleModal('성공 사례', '실제 커플들의 성공 스토리를 확인하세요.');
      break;
    default:
      document.querySelector('.advanced-modal-overlay')?.remove();
      showSimpleModal('준비 중', '해당 기능을 준비 중입니다.');
  }
}

console.log('✨ CHARM_INYEON 초기화 완료');
console.log('🎯 위젯 클릭 기능 활성화됨!');