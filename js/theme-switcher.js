/**
 * 스마트 테마 전환 시스템
 * 일반용 ↔ 중장년층용 UI 테마 전환
 * 사용자 선택 저장 및 URL 파라미터 지원
 */

class ThemeSwitcher {
  constructor() {
    this.currentTheme = window.currentTheme || 'default';
    this.themeToggle = document.getElementById('themeToggle');
    this.themeText = this.themeToggle?.querySelector('.theme-text');
    this.themeIcon = this.themeToggle?.querySelector('.theme-icon');

    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.updateUI();
    this.bindEvents();
    this.handleURLParams();

    // 키보드 지원
    this.setupKeyboardSupport();

    // 디버그용 로그 (개발 환경에서만 활성화)
    if (typeof console !== 'undefined' && console.log) {
      console.log('🎨 테마 시스템 초기화 완료: ' + this.currentTheme);
    }
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    if (this.themeToggle) {
      this.themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // 테마 변경 시 커스텀 이벤트 발생
    window.addEventListener('themeChanged', event => {
      this.onThemeChanged(event.detail);
    });
  }

  /**
   * 키보드 지원 설정
   */
  setupKeyboardSupport() {
    document.addEventListener('keydown', event => {
      // Ctrl + T: 테마 전환
      if (event.ctrlKey && event.key === 't') {
        event.preventDefault();
        this.toggleTheme();
      }

      // Alt + T: 테마 전환 (접근성)
      if (event.altKey && event.key === 't') {
        event.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * URL 파라미터 처리
   */
  handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlTheme = urlParams.get('theme');

    if (urlTheme && urlTheme !== this.currentTheme) {
      this.setTheme(urlTheme, false); // URL 업데이트 없이 테마 설정
    }
  }

  /**
   * 테마 전환
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'default' ? 'senior' : 'default';
    this.setTheme(newTheme);

    // 접근성: 음성 피드백
    this.announceThemeChange(newTheme);
  }

  /**
   * 테마 설정
   * @param {string} theme - 설정할 테마 ('default' | 'senior')
   * @param {boolean} updateURL - URL 업데이트 여부
   */
  setTheme(theme, updateURL = true) {
    const validThemes = ['default', 'senior'];
    if (!validThemes.includes(theme)) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('⚠️ 유효하지 않은 테마: ' + theme);
      }
      return;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    // DOM 클래스 업데이트
    this.updateDOMClasses();

    // UI 업데이트
    this.updateUI();

    // 저장소에 저장
    this.saveTheme();

    // URL 업데이트
    if (updateURL) {
      this.updateURL();
    }

    // 커스텀 이벤트 발생
    this.dispatchThemeChangeEvent(previousTheme, theme);

    // 애니메이션 효과
    this.addTransitionEffect();

    // 디버그용 로그
    if (typeof console !== 'undefined' && console.log) {
      console.log('🎨 테마 변경: ' + previousTheme + ' → ' + theme);
    }
  }

  /**
   * DOM 클래스 업데이트
   */
  updateDOMClasses() {
    const body = document.body;
    const html = document.documentElement;

    // 기존 테마 클래스 제거
    html.classList.remove('theme-default', 'theme-senior');
    body.classList.remove('theme-default', 'theme-senior');

    // 새 테마 클래스 추가
    if (this.currentTheme === 'senior') {
      html.classList.add('theme-senior');
      body.classList.add('theme-senior');
    } else {
      html.classList.add('theme-default');
      body.classList.add('theme-default');
    }
  }

  /**
   * UI 업데이트
   */
  updateUI() {
    if (!this.themeToggle) return;

    const isSeñor = this.currentTheme === 'senior';

    // 버튼 텍스트 업데이트
    if (this.themeText) {
      this.themeText.textContent = isSeñor ? '중장년층용' : '일반용';
    }

    // 아이콘 업데이트
    if (this.themeIcon) {
      this.themeIcon.textContent = isSeñor ? '👴' : '💼';
    }

    // aria-label 업데이트
    const label = isSeñor ? '일반용으로 전환' : '중장년층용으로 전환';
    this.themeToggle.setAttribute('aria-label', label);
    this.themeToggle.setAttribute('title', label);

    // 활성 상태 표시
    this.themeToggle.setAttribute('data-theme', this.currentTheme);
  }

  /**
   * 테마 저장
   */
  saveTheme() {
    try {
      localStorage.setItem('charm-theme', this.currentTheme);
      localStorage.setItem('charm-theme-timestamp', Date.now().toString());
    } catch (error) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('⚠️ 테마 저장 실패:', error);
      }
    }
  }

  /**
   * URL 업데이트
   */
  updateURL() {
    const url = new URL(window.location);

    if (this.currentTheme === 'senior') {
      url.searchParams.set('theme', 'senior');
    } else {
      url.searchParams.delete('theme');
    }

    // 페이지 새로고침 없이 URL 업데이트
    window.history.replaceState({}, '', url);
  }

  /**
   * 테마 변경 이벤트 발생
   */
  dispatchThemeChangeEvent(previousTheme, newTheme) {
    const event = new CustomEvent('themeChanged', {
      detail: {
        previousTheme,
        newTheme,
        timestamp: Date.now(),
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * 전환 애니메이션 효과
   */
  addTransitionEffect() {
    const body = document.body;

    // 페이드 효과
    body.style.transition = 'all 0.3s ease';
    body.style.opacity = '0.95';

    setTimeout(() => {
      body.style.opacity = '';
      body.style.transition = '';
    }, 300);

    // 버튼 애니메이션
    if (this.themeToggle) {
      this.themeToggle.style.transform = 'scale(1.1)';
      setTimeout(() => {
        this.themeToggle.style.transform = '';
      }, 200);
    }
  }

  /**
   * 음성 피드백 (접근성)
   */
  announceThemeChange(newTheme) {
    if ('speechSynthesis' in window) {
      const text =
        newTheme === 'senior'
          ? '중장년층 친화적 테마로 전환되었습니다.'
          : '일반 테마로 전환되었습니다.';

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.volume = 0.7;
      utterance.rate = 0.9;

      // 중장년층 테마이고 음성 안내가 켜져 있을 때만 재생
      const voiceToggle = document.getElementById('voiceToggle');
      const voiceEnabled = voiceToggle?.getAttribute('aria-pressed') === 'true';

      if (newTheme === 'senior' || voiceEnabled) {
        speechSynthesis.speak(utterance);
      }
    }
  }

  /**
   * 테마 변경 이벤트 핸들러
   */
  onThemeChanged(detail) {
    // 디버그용 로그
    if (typeof console !== 'undefined' && console.log) {
      console.log('🎨 테마 변경 이벤트:', detail);
    }

    // Google Analytics 등 분석 도구에 이벤트 전송
    if (typeof gtag !== 'undefined') {
      gtag('event', 'theme_change', {
        previous_theme: detail.previousTheme,
        new_theme: detail.newTheme,
      });
    }

    // 추가 커스텀 로직 실행 가능
    this.handleThemeSpecificFeatures(detail.newTheme);
  }

  /**
   * 테마별 특화 기능 처리
   */
  handleThemeSpecificFeatures(theme) {
    if (theme === 'senior') {
      // 중장년층 테마 활성화 시
      this.enableSeniorFeatures();
    } else {
      // 일반 테마 활성화 시
      this.enableDefaultFeatures();
    }
  }

  /**
   * 중장년층 특화 기능 활성화
   */
  enableSeniorFeatures() {
    // 폰트 크기 자동 조정
    const fontSizeBtn = document.querySelector('.font-size-btn[data-size="normal"]');
    if (fontSizeBtn) {
      fontSizeBtn.click();
    }

    // 애니메이션 감소
    document.documentElement.style.setProperty('--transition-normal', '0.2s ease');

    // 터치 영역 확대
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(btn => {
      if (btn.style.minHeight && parseInt(btn.style.minHeight) < 56) {
        btn.style.minHeight = '56px';
      }
    });
  }

  /**
   * 일반 테마 기능 활성화
   */
  enableDefaultFeatures() {
    // 애니메이션 복원
    document.documentElement.style.setProperty('--transition-normal', '0.3s ease');

    // 기본 터치 영역 복원
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(btn => {
      btn.style.minHeight = '';
    });
  }

  /**
   * 테마 리셋
   */
  resetTheme() {
    localStorage.removeItem('charm-theme');
    localStorage.removeItem('charm-theme-timestamp');
    this.setTheme('default');
  }

  /**
   * 현재 테마 반환
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * 테마 가능 여부 확인
   */
  isThemeAvailable(theme) {
    return ['default', 'senior'].includes(theme);
  }

  /**
   * 디버그 정보 출력
   */
  getDebugInfo() {
    return {
      currentTheme: this.currentTheme,
      savedTheme: localStorage.getItem('charm-theme'),
      timestamp: localStorage.getItem('charm-theme-timestamp'),
      urlTheme: new URLSearchParams(window.location.search).get('theme'),
      supportsSpeech: 'speechSynthesis' in window,
      supportsLocalStorage: 'localStorage' in window,
    };
  }
}

// 전역 인스턴스 생성
window.themeSwitcher = null;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function () {
  window.themeSwitcher = new ThemeSwitcher();

  // 전역 함수 등록 (디버깅용)
  window.switchTheme = function (theme) {
    if (window.themeSwitcher && window.themeSwitcher.isThemeAvailable(theme)) {
      window.themeSwitcher.setTheme(theme);
    } else {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('⚠️ 유효하지 않은 테마 또는 테마 시스템 미초기화: ' + theme);
      }
    }
  };

  window.getThemeDebugInfo = function () {
    return window.themeSwitcher ? window.themeSwitcher.getDebugInfo() : null;
  };
});

// 모듈 내보내기 (ES6 모듈 환경에서 사용 시)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeSwitcher;
}
