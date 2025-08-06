const { authenticateWithRLS } = require('./enhancedAuth');
const { getCacheService } = require('../services/cacheService');
const { getPerformanceService, createPerformanceMiddleware } = require('../services/performanceService');
const { getHealthCheckService, createHealthCheckRoutes } = require('../monitoring/healthCheck');
const { getIndexingService } = require('../services/indexingService');

/**
 * RLS Integration Middleware
 * 기존 시스템과 새로운 RLS 시스템의 호환성을 보장하는 통합 레이어
 */

class RLSIntegrationManager {
  constructor() {
    this.isInitialized = false;
    this.services = new Map();
  }

  // RLS 시스템 점진적 초기화
  async initializeRLSSystem(app) {
    if (this.isInitialized) {
      console.log('⚠️ RLS system already initialized');
      return true;
    }

    try {
      console.log('🚀 Initializing RLS + Backend System...');

      // 1. 서비스 인스턴스 초기화
      await this.initializeServices();

      // 2. 데이터베이스 최적화 (인덱스 생성) - 실제 연결시만
      if (app) {
        await this.optimizeDatabase();
        this.setupHealthCheckRoutes(app);
        this.setupPerformanceMonitoring(app);
        this.setupOptionalRLSMiddleware(app);
      }

      this.isInitialized = true;
      console.log('✅ RLS + Backend System initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize RLS system:', error.message);
      return false;
    }
  }

  // 서비스 인스턴스 초기화
  async initializeServices() {
    try {
      const cacheService = getCacheService();
      const performanceService = getPerformanceService();
      const healthService = getHealthCheckService();
      const indexingService = getIndexingService();

      this.services.set('cache', cacheService);
      this.services.set('performance', performanceService);
      this.services.set('health', healthService);
      this.services.set('indexing', indexingService);

      console.log('🔧 Core services initialized');
    } catch (error) {
      console.error('❌ Service initialization error:', error.message);
      throw error;
    }
  }

  // 데이터베이스 최적화
  async optimizeDatabase() {
    try {
      const indexingService = this.services.get('indexing');
      if (indexingService) {
        console.log('📊 Optimizing database indexes...');
        
        const success = await indexingService.createOptimizedIndexes();
        if (success) {
          console.log('✅ Database optimization completed');
        } else {
          console.warn('⚠️ Some indexes may already exist');
        }
      }
    } catch (error) {
      console.error('❌ Database optimization failed:', error.message);
    }
  }

  // 헬스체크 라우트 설정
  setupHealthCheckRoutes(app) {
    try {
      createHealthCheckRoutes(app);
      console.log('🏥 Health check routes configured');

      const healthService = this.services.get('health');
      if (healthService) {
        healthService.startHealthMonitoring();
      }
    } catch (error) {
      console.error('❌ Health check setup failed:', error.message);
    }
  }

  // 성능 모니터링 설정
  setupPerformanceMonitoring(app) {
    try {
      const perfMiddleware = createPerformanceMiddleware();
      app.use('/api', perfMiddleware);
      console.log('📈 Performance monitoring enabled');
    } catch (error) {
      console.error('❌ Performance monitoring setup failed:', error.message);
    }
  }

  // 선택적 RLS 미들웨어 설정
  setupOptionalRLSMiddleware(app) {
    try {
      if (process.env.FEATURE_ENHANCED_AUTH === 'true') {
        app.use('/api/admin', authenticateWithRLS);
        app.use('/api/matches', authenticateWithRLS);
        app.use('/api/conversations', authenticateWithRLS);
        console.log('🔐 Enhanced RLS authentication enabled for selected routes');
      } else {
        console.log('ℹ️ Enhanced RLS authentication disabled (can be enabled with FEATURE_ENHANCED_AUTH=true)');
      }
    } catch (error) {
      console.error('❌ RLS middleware setup failed:', error.message);
    }
  }

  // RLS 시스템 상태 확인
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      services: {
        cache: this.services.has('cache'),
        performance: this.services.has('performance'), 
        health: this.services.has('health'),
        indexing: this.services.has('indexing')
      },
      timestamp: new Date().toISOString()
    };
  }
}

// 싱글톤 인스턴스
let rlsIntegrationManager = null;

const getRLSIntegrationManager = () => {
  if (!rlsIntegrationManager) {
    rlsIntegrationManager = new RLSIntegrationManager();
  }
  return rlsIntegrationManager;
};

// Express 앱에 RLS 시스템을 점진적으로 통합하는 헬퍼 함수
const integrateRLSSystem = async (app) => {
  const manager = getRLSIntegrationManager();
  return await manager.initializeRLSSystem(app);
};

// 호환성 체크 미들웨어
const createCompatibilityMiddleware = () => {
  return (req, res, next) => {
    // 기존 req.user와 새로운 req.rlsContext가 공존할 수 있도록
    if (req.user && !req.rlsContext) {
      // 기존 사용자 객체에서 RLS 컨텍스트 생성 (하위 호환성)
      req.rlsContext = {
        userId: req.user._id || req.user.id,
        role: req.user.role || 'user',
        permissions: req.user.permissions || [],
        isAdmin: () => req.user.role === 'admin',
        isSystem: () => req.user.role === 'system'
      };
    }
    next();
  };
};

module.exports = {
  RLSIntegrationManager,
  getRLSIntegrationManager,
  integrateRLSSystem,
  createCompatibilityMiddleware
};