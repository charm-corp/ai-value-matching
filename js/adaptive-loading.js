/**
 * 적응형 CSS 로딩 시스템
 * 네트워크 상태, 디바이스 타입에 따른 조건부 CSS 로딩
 * 중장년층 최적화 및 3G 네트워크 지원
 */

class AdaptiveLoader {
    constructor() {
        this.networkInfo = this.getNetworkInfo();
        this.deviceInfo = this.getDeviceInfo();
        this.loadedModules = new Set();
        this.criticalLoaded = false;
        
        this.init();
    }

    /**
     * 네트워크 정보 수집
     */
    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            effectiveType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 0,
            saveData: connection?.saveData || false,
            rtt: connection?.rtt || 0,
            isSlowNetwork: this.isSlowConnection(connection)
        };
    }

    /**
     * 느린 네트워크 감지
     */
    isSlowConnection(connection) {
        if (!connection) return false;
        
        return (
            connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g' ||
            connection.effectiveType === '3g' ||
            connection.saveData === true ||
            connection.downlink < 1.5
        );
    }

    /**
     * 디바이스 정보 수집
     */
    getDeviceInfo() {
        return {
            isMobile: window.innerWidth <= 767,
            isTablet: window.innerWidth >= 768 && window.innerWidth <= 1024,
            isDesktop: window.innerWidth > 1024,
            isTouch: 'ontouchstart' in window,
            screenWidth: window.innerWidth,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    /**
     * 초기화
     */
    init() {
        // Critical CSS가 이미 로드되었는지 확인
        this.criticalLoaded = document.querySelector('style[data-critical]') !== null;
        
        // 네트워크 변화 모니터링
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.networkInfo = this.getNetworkInfo();
                this.adaptToNetworkChange();
            });
        }

        // 리사이즈 이벤트 모니터링
        window.addEventListener('resize', this.debounce(() => {
            this.deviceInfo = this.getDeviceInfo();
            this.adaptToDeviceChange();
        }, 300));

        // 초기 로딩 전략 실행
        this.executeLoadingStrategy();
    }

    /**
     * 로딩 전략 실행
     */
    executeLoadingStrategy() {
        if (this.networkInfo.isSlowNetwork) {
            this.loadSlowNetworkCSS();
        } else {
            this.loadOptimalCSS();
        }
    }

    /**
     * 느린 네트워크용 CSS 로딩
     */
    loadSlowNetworkCSS() {
        console.log('🐌 느린 네트워크 감지: 경량화 CSS 로딩');
        
        // 1순위: 필수 Base CSS만
        this.loadCSS('styles/base/variables.css', 'critical', 1);
        this.loadCSS('styles/base/reset.css', 'critical', 1);
        this.loadCSS('styles/base/typography.css', 'critical', 1);
        
        // 2순위: 네비게이션과 기본 레이아웃
        setTimeout(() => {
            this.loadCSS('styles/components/navigation.css', 'priority', 2);
            this.loadCSS('styles/base/layout.css', 'priority', 2);
        }, 500);

        // 3순위: 중장년층 필수 요소만
        setTimeout(() => {
            if (this.deviceInfo.isMobile) {
                this.loadCSS('styles/components/buttons.css', 'standard', 3);
                this.loadCSS('styles/themes/default.css', 'standard', 3);
            } else {
                this.loadCSS('styles/components/buttons.css', 'standard', 3);
                this.loadCSS('styles/components/forms.css', 'standard', 3);
                this.loadCSS('styles/themes/default.css', 'standard', 3);
            }
        }, 1000);
    }

    /**
     * 최적 네트워크용 CSS 로딩
     */
    loadOptimalCSS() {
        console.log('🚀 최적 네트워크: 전체 CSS 로딩');
        
        // 1순위: Critical CSS
        this.loadCSS('styles/base/variables.css', 'critical', 1);
        this.loadCSS('styles/base/reset.css', 'critical', 1);
        this.loadCSS('styles/base/typography.css', 'critical', 1);
        this.loadCSS('styles/base/layout.css', 'critical', 1);

        // 2순위: 기본 컴포넌트
        setTimeout(() => {
            this.loadCSS('styles/components/navigation.css', 'priority', 2);
            this.loadCSS('styles/components/buttons.css', 'priority', 2);
            this.loadCSS('styles/themes/default.css', 'priority', 2);
        }, 100);

        // 3순위: 디바이스별 조건부 로딩
        setTimeout(() => {
            if (this.deviceInfo.isMobile) {
                // 모바일: 터치 관련, 폼 우선
                this.loadCSS('styles/components/forms.css', 'standard', 3);
                this.loadCSS('styles/pages/landing.css', 'standard', 3);
            } else {
                // 데스크톱: 모달, 카드, 복잡한 레이아웃
                this.loadCSS('styles/components/cards.css', 'standard', 3);
                this.loadCSS('styles/components/forms.css', 'standard', 3);
                this.loadCSS('styles/components/modals.css', 'lazy', 4);
                this.loadCSS('styles/pages/landing.css', 'standard', 3);
            }
        }, 200);
    }

    /**
     * CSS 파일 로딩
     */
    loadCSS(href, priority = 'standard', order = 3) {
        if (this.loadedModules.has(href)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.dataset.priority = priority;
            link.dataset.order = order;
            link.dataset.loadTime = Date.now();

            // 로딩 완료 처리
            link.onload = () => {
                this.loadedModules.add(href);
                console.log(`✅ CSS 로딩 완료: ${href} (${Date.now() - link.dataset.loadTime}ms)`);
                resolve();
            };

            link.onerror = () => {
                console.error(`❌ CSS 로딩 실패: ${href}`);
                reject(new Error(`Failed to load CSS: ${href}`));
            };

            // media 속성 설정 (조건부 로딩)
            if (href.includes('modals') && this.deviceInfo.isMobile) {
                link.media = 'print'; // 모바일에서는 로딩하지 않음
                link.onload = () => link.media = 'all'; // 나중에 활성화
            }

            // DOM에 추가
            document.head.appendChild(link);
        });
    }

    /**
     * 네트워크 변화 대응
     */
    adaptToNetworkChange() {
        console.log('📡 네트워크 상태 변화:', this.networkInfo);
        
        if (this.networkInfo.isSlowNetwork) {
            // 느린 네트워크로 변경 시 불필요한 리소스 제거
            this.unloadNonCriticalCSS();
        } else {
            // 빠른 네트워크로 변경 시 추가 리소스 로딩
            this.loadAdditionalCSS();
        }
    }

    /**
     * 디바이스 변화 대응 (리사이즈)
     */
    adaptToDeviceChange() {
        const newDeviceInfo = this.getDeviceInfo();
        
        // 모바일 ↔ 데스크톱 전환 감지
        if (newDeviceInfo.isMobile !== this.deviceInfo.isMobile) {
            console.log('📱 디바이스 타입 변화:', newDeviceInfo);
            this.deviceInfo = newDeviceInfo;
            this.reloadDeviceSpecificCSS();
        }
    }

    /**
     * 불필요한 CSS 언로드
     */
    unloadNonCriticalCSS() {
        const nonCriticalLinks = document.querySelectorAll('link[data-priority="lazy"]');
        nonCriticalLinks.forEach(link => {
            link.remove();
            this.loadedModules.delete(link.href);
        });
    }

    /**
     * 추가 CSS 로딩
     */
    loadAdditionalCSS() {
        if (!this.deviceInfo.isMobile && !this.loadedModules.has('styles/components/modals.css')) {
            this.loadCSS('styles/components/modals.css', 'standard', 3);
        }
    }

    /**
     * 디바이스별 CSS 재로딩
     */
    reloadDeviceSpecificCSS() {
        // 디바이스 전환 시 필요한 CSS만 로딩
        if (this.deviceInfo.isMobile) {
            this.unloadDesktopOnlyCSS();
        } else {
            this.loadDesktopCSS();
        }
    }

    /**
     * 데스크톱 전용 CSS 언로드
     */
    unloadDesktopOnlyCSS() {
        const desktopOnlySelectors = ['modals', 'complex-animations'];
        desktopOnlySelectors.forEach(selector => {
            const links = document.querySelectorAll(`link[href*="${selector}"]`);
            links.forEach(link => {
                link.remove();
                this.loadedModules.delete(link.href);
            });
        });
    }

    /**
     * 데스크톱 CSS 로딩
     */
    loadDesktopCSS() {
        if (!this.loadedModules.has('styles/components/modals.css')) {
            this.loadCSS('styles/components/modals.css', 'standard', 3);
        }
    }

    /**
     * 디바운스 유틸리티
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 로딩 상태 리포트
     */
    getLoadingReport() {
        return {
            networkInfo: this.networkInfo,
            deviceInfo: this.deviceInfo,
            loadedModules: Array.from(this.loadedModules),
            loadedCount: this.loadedModules.size,
            criticalLoaded: this.criticalLoaded
        };
    }
}

// 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adaptiveLoader = new AdaptiveLoader();
    });
} else {
    window.adaptiveLoader = new AdaptiveLoader();
}

// 전역 함수로 내보내기
window.AdaptiveLoader = AdaptiveLoader;