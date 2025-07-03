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

console.log('✨ CHARM_INYEON 초기화 완료');