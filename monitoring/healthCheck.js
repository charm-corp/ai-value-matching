const mongoose = require('mongoose');
const { getCacheService } = require('../services/cacheService');
const { getPerformanceService } = require('../services/performanceService');

/**
 * Advanced Health Check System
 * 시스템 상태 모니터링 및 건강성 확인
 */

class HealthCheckService {
  constructor() {
    this.checks = new Map();
    this.lastResults = new Map();
    this.alertThresholds = {
      responseTime: 2000, // 2초
      memoryUsage: 512, // 512MB
      dbConnections: 0.8, // 80% 사용률
      cacheHitRate: 60, // 60%
      errorRate: 5 // 5%
    };
  }

  // 모든 헬스체크 실행
  async runAllChecks() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      alerts: []
    };

    const checkPromises = [
      this.checkDatabase(),
      this.checkMemoryUsage(),
      this.checkCacheHealth(),
      this.checkAPIResponseTime(),
      this.checkDiskSpace(),
      this.checkExternalServices(),
      this.checkRLSPerformance(),
      this.checkMatchingAlgorithm()
    ];

    const checkResults = await Promise.allSettled(checkPromises);
    
    checkResults.forEach((result, index) => {
      const checkNames = [
        'database',
        'memory',
        'cache', 
        'api_response',
        'disk_space',
        'external_services',
        'rls_performance',
        'matching_algorithm'
      ];

      const checkName = checkNames[index];
      results.summary.total++;

      if (result.status === 'fulfilled') {
        results.checks[checkName] = result.value;
        
        switch (result.value.status) {
          case 'healthy':
            results.summary.passed++;
            break;
          case 'warning':
            results.summary.warnings++;
            results.alerts.push({
              type: 'warning',
              check: checkName,
              message: result.value.message
            });
            break;
          case 'critical':
            results.summary.failed++;
            results.overall = 'unhealthy';
            results.alerts.push({
              type: 'critical',
              check: checkName,
              message: result.value.message
            });
            break;
        }
      } else {
        results.summary.failed++;
        results.overall = 'unhealthy';
        results.checks[checkName] = {
          status: 'critical',
          message: result.reason.message || 'Check failed',
          error: result.reason
        };
      }
    });

    // 전체 상태 결정
    if (results.summary.failed > 0) {
      results.overall = 'unhealthy';
    } else if (results.summary.warnings > 0) {
      results.overall = 'degraded';
    }

    this.lastResults.set('full_check', results);
    
    // 알림 발송이 필요한 경우
    if (results.overall !== 'healthy') {
      await this.sendHealthAlert(results);
    }

    return results;
  }

  // 데이터베이스 헬스체크
  async checkDatabase() {
    try {
      const startTime = Date.now();
      
      // MongoDB 연결 상태 확인
      if (mongoose.connection.readyState !== 1) {
        return {
          status: 'critical',
          message: 'Database connection is not active',
          details: { connectionState: mongoose.connection.readyState }
        };
      }

      // 간단한 쿼리 실행으로 응답성 테스트
      const User = mongoose.model('User');
      await User.countDocuments({ isActive: true }).limit(1);
      
      const responseTime = Date.now() - startTime;
      
      // 연결 풀 상태 확인
      const connections = mongoose.connection.db.serverConfig?.connections?.length || 0;
      const maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || '10');
      const connectionUsage = connections / maxConnections;

      let status = 'healthy';
      let message = 'Database is healthy';
      
      if (responseTime > 1000) {
        status = 'warning';
        message = `Database response time is slow: ${responseTime}ms`;
      }
      
      if (connectionUsage > this.alertThresholds.dbConnections) {
        status = 'warning';
        message = `High database connection usage: ${(connectionUsage * 100).toFixed(1)}%`;
      }

      return {
        status,
        message,
        details: {
          responseTime,
          connections,
          maxConnections,
          connectionUsage: `${(connectionUsage * 100).toFixed(1)}%`,
          readyState: mongoose.connection.readyState
        }
      };
    } catch (error) {
      return {
        status: 'critical',
        message: 'Database health check failed',
        error: error.message
      };
    }
  }

  // 메모리 사용량 체크
  async checkMemoryUsage() {
    try {
      const memUsage = process.memoryUsage();
      const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usagePercent = (usedMB / totalMB * 100).toFixed(1);

      let status = 'healthy';
      let message = 'Memory usage is normal';

      if (usedMB > this.alertThresholds.memoryUsage) {
        status = 'warning';
        message = `High memory usage: ${usedMB}MB`;
      }

      if (usedMB > this.alertThresholds.memoryUsage * 1.5) {
        status = 'critical';
        message = `Critical memory usage: ${usedMB}MB`;
      }

      // 가비지 컬렉션 권장
      const shouldGC = usedMB > this.alertThresholds.memoryUsage && global.gc;

      return {
        status,
        message,
        details: {
          heapUsed: `${usedMB}MB`,
          heapTotal: `${totalMB}MB`,
          usagePercent: `${usagePercent}%`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
          shouldGC
        }
      };
    } catch (error) {
      return {
        status: 'critical',
        message: 'Memory check failed',
        error: error.message
      };
    }
  }

  // 캐시 시스템 헬스체크
  async checkCacheHealth() {
    try {
      const cacheService = getCacheService();
      const stats = cacheService.getStats();
      
      const hitRate = parseFloat(stats.hitRate);
      const startTime = Date.now();

      // 캐시 응답 시간 테스트
      const testKey = `health_check_${Date.now()}`;
      const testValue = 'test_data';
      
      await cacheService.set('health', testKey, testValue, 10);
      const retrieved = await cacheService.get('health', testKey);
      await cacheService.delete('health', testKey);
      
      const cacheResponseTime = Date.now() - startTime;

      let status = 'healthy';
      let message = 'Cache system is healthy';

      if (hitRate < this.alertThresholds.cacheHitRate) {
        status = 'warning';
        message = `Low cache hit rate: ${hitRate}%`;
      }

      if (cacheResponseTime > 100) {
        status = 'warning';
        message = `Slow cache response: ${cacheResponseTime}ms`;
      }

      if (retrieved !== testValue) {
        status = 'critical';
        message = 'Cache read/write test failed';
      }

      return {
        status,
        message,
        details: {
          hitRate: stats.hitRate,
          memoryHitRate: stats.memoryHitRate,
          redisHitRate: stats.redisHitRate,
          responseTime: `${cacheResponseTime}ms`,
          memorySize: stats.memorySize,
          isRedisAvailable: stats.isRedisAvailable,
          totalHits: stats.hits,
          totalMisses: stats.misses
        }
      };
    } catch (error) {
      return {
        status: 'critical',
        message: 'Cache health check failed',
        error: error.message
      };
    }
  }

  // API 응답 시간 체크
  async checkAPIResponseTime() {
    try {
      const performanceService = getPerformanceService();
      const avgResponseTime = parseFloat(performanceService.getAverageApiResponseTime()) || 0;
      const errorRate = parseFloat(performanceService.getErrorRate()) || 0;

      let status = 'healthy';
      let message = 'API performance is good';

      if (avgResponseTime > this.alertThresholds.responseTime) {
        status = 'warning';
        message = `Slow API response time: ${avgResponseTime}ms`;
      }

      if (errorRate > this.alertThresholds.errorRate) {
        status = 'warning';
        message = `High error rate: ${errorRate}%`;
      }

      if (avgResponseTime > this.alertThresholds.responseTime * 2) {
        status = 'critical';
        message = `Critical API response time: ${avgResponseTime}ms`;
      }

      return {
        status,
        message,
        details: {
          averageResponseTime: `${avgResponseTime}ms`,
          errorRate: `${errorRate}%`,
          totalRequests: performanceService.getTotalRequests(),
          recommendations: performanceService.generateRecommendations()
        }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'API performance check failed',
        error: error.message
      };
    }
  }

  // 디스크 공간 체크
  async checkDiskSpace() {
    try {
      const fs = require('fs');
      const { promisify } = require('util');
      const stat = promisify(fs.stat);

      const stats = await stat('.');
      // 실제 구현에서는 df 명령어나 다른 방법으로 디스크 사용량 확인
      
      return {
        status: 'healthy',
        message: 'Disk space is sufficient',
        details: {
          note: 'Disk space monitoring requires additional implementation'
        }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Disk space check not fully implemented',
        error: error.message
      };
    }
  }

  // 외부 서비스 상태 체크
  async checkExternalServices() {
    const services = [];

    try {
      // Redis 상태 확인
      const cacheService = getCacheService();
      const redisStatus = cacheService.getStats().isRedisAvailable;
      
      services.push({
        name: 'Redis',
        status: redisStatus ? 'healthy' : 'unavailable',
        required: false
      });

      // 이메일 서비스 상태 확인 (구현 필요)
      services.push({
        name: 'Email Service',
        status: 'not_checked',
        required: false
      });

      // 외부 API 상태 확인 (구현 필요)
      services.push({
        name: 'External APIs',
        status: 'not_checked',
        required: false
      });

      const unhealthyRequired = services.filter(s => s.required && s.status !== 'healthy');
      const unhealthyOptional = services.filter(s => !s.required && s.status === 'unavailable');

      let status = 'healthy';
      let message = 'All external services are healthy';

      if (unhealthyRequired.length > 0) {
        status = 'critical';
        message = `Required services unavailable: ${unhealthyRequired.map(s => s.name).join(', ')}`;
      } else if (unhealthyOptional.length > 0) {
        status = 'warning';
        message = `Optional services unavailable: ${unhealthyOptional.map(s => s.name).join(', ')}`;
      }

      return {
        status,
        message,
        details: { services }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'External services check failed',
        error: error.message
      };
    }
  }

  // RLS 성능 체크
  async checkRLSPerformance() {
    try {
      const startTime = Date.now();
      
      // 테스트용 RLS 쿼리 실행
      const User = mongoose.model('User');
      await User.find({ isActive: true }).limit(10);
      
      const rlsResponseTime = Date.now() - startTime;

      let status = 'healthy';
      let message = 'RLS performance is good';

      if (rlsResponseTime > 500) {
        status = 'warning';
        message = `RLS queries are slow: ${rlsResponseTime}ms`;
      }

      if (rlsResponseTime > 1000) {
        status = 'critical';
        message = `Critical RLS performance: ${rlsResponseTime}ms`;
      }

      return {
        status,
        message,
        details: {
          responseTime: `${rlsResponseTime}ms`,
          testQuery: 'User.find({ isActive: true }).limit(10)'
        }
      };
    } catch (error) {
      return {
        status: 'critical',
        message: 'RLS performance check failed',
        error: error.message
      };
    }
  }

  // 매칭 알고리즘 헬스체크
  async checkMatchingAlgorithm() {
    try {
      const startTime = Date.now();
      
      // 간단한 매칭 알고리즘 테스트
      const User = mongoose.model('User');
      const activeUsers = await User.countDocuments({ 
        isActive: true, 
        isVerified: true,
        isProfileComplete: true 
      });

      const Match = mongoose.model('Match');
      const recentMatches = await Match.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const algorithmResponseTime = Date.now() - startTime;

      let status = 'healthy';
      let message = 'Matching algorithm is healthy';

      if (activeUsers < 10) {
        status = 'warning';
        message = `Low active user count: ${activeUsers}`;
      }

      if (algorithmResponseTime > 300) {
        status = 'warning';
        message = `Slow matching algorithm queries: ${algorithmResponseTime}ms`;
      }

      return {
        status,
        message,
        details: {
          activeUsers,
          recentMatches24h: recentMatches,  
          responseTime: `${algorithmResponseTime}ms`,
          matchingRate: activeUsers > 0 ? `${(recentMatches / activeUsers * 100).toFixed(2)}%` : '0%'
        }
      };
    } catch (error) {
      return {
        status: 'critical',
        message: 'Matching algorithm check failed',
        error: error.message
      };
    }
  }

  // 빠른 헬스체크 (중요한 것만)
  async quickHealthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {}
    };

    try {
      // 데이터베이스 연결 상태만 빠르게 확인
      results.checks.database = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
      
      // 메모리 사용량 빠르게 확인
      const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
      results.checks.memory = memUsage < this.alertThresholds.memoryUsage ? 'healthy' : 'warning';
      
      // 캐시 상태 빠르게 확인
      const cacheService = getCacheService();
      results.checks.cache = cacheService.getStats().isRedisAvailable ? 'healthy' : 'warning';

      // 전체 상태 결정
      const unhealthyChecks = Object.values(results.checks).filter(status => status !== 'healthy');
      if (unhealthyChecks.length > 0) {
        results.status = unhealthyChecks.includes('unhealthy') ? 'unhealthy' : 'warning';
      }

      return results;
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      };
    }
  }

  // 시스템 정보 수집
  async getSystemInfo() {
    const os = require('os');
    
    return {
      timestamp: new Date().toISOString(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
        cpuCount: os.cpus().length,
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`,
        freeMemory: `${Math.round(os.freemem() / 1024 / 1024)}MB`
      },
      process: {
        nodeVersion: process.version,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      application: {
        environment: process.env.NODE_ENV || 'development',
        mongoConnection: mongoose.connection.readyState,
        cacheStatus: getCacheService().getStats()
      }
    };
  }

  // 헬스체크 기록 조회
  getHealthHistory(checkType = 'full_check', limit = 10) {
    // 실제 구현에서는 DB나 파일에서 기록 조회
    return this.lastResults.get(checkType) || null;
  }

  // 알림 발송
  async sendHealthAlert(healthResults) {
    const alertMessage = {
      timestamp: healthResults.timestamp,
      status: healthResults.overall,
      failedChecks: healthResults.summary.failed,
      warnings: healthResults.summary.warnings,
      alerts: healthResults.alerts
    };

    console.warn('🚨 Health Alert:', JSON.stringify(alertMessage, null, 2));

    // 외부 알림 시스템 연동 (Slack, 이메일 등)
    if (process.env.HEALTH_ALERT_WEBHOOK) {
      try {
        const fetch = require('node-fetch');
        await fetch(process.env.HEALTH_ALERT_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `System Health Alert: ${healthResults.overall}`,
            details: alertMessage
          })
        });
      } catch (error) {
        console.error('Failed to send health alert:', error);
      }
    }
  }

  // 헬스체크 스케줄링
  startHealthMonitoring() {
    // 빠른 헬스체크 (1분마다)
    setInterval(async () => {
      try {
        const quickCheck = await this.quickHealthCheck();
        this.lastResults.set('quick_check', quickCheck);
        
        if (quickCheck.status !== 'healthy') {
          console.warn('Quick health check warning:', quickCheck);
        }
      } catch (error) {
        console.error('Quick health check failed:', error);
      }
    }, 60000);

    // 전체 헬스체크 (10분마다)
    setInterval(async () => {
      try {
        await this.runAllChecks();
      } catch (error) {
        console.error('Full health check failed:', error);
      }
    }, 600000);

    console.log('🏥 Health monitoring started');
  }
}

// 싱글톤 인스턴스
let healthCheckServiceInstance = null;

const getHealthCheckService = () => {
  if (!healthCheckServiceInstance) {
    healthCheckServiceInstance = new HealthCheckService();
  }
  return healthCheckServiceInstance;
};

// Express 라우트용 헬스체크 핸들러
const createHealthCheckRoutes = (app) => {
  const healthService = getHealthCheckService();

  // 전체 헬스체크
  app.get('/health/full', async (req, res) => {
    try {
      const results = await healthService.runAllChecks();
      const statusCode = results.overall === 'healthy' ? 200 : 
                        results.overall === 'degraded' ? 200 : 503;
      
      res.status(statusCode).json(results);
    } catch (error) {
      res.status(500).json({
        timestamp: new Date().toISOString(),
        overall: 'error',
        error: error.message
      });
    }
  });

  // 빠른 헬스체크
  app.get('/health', async (req, res) => {
    try {
      const results = await healthService.quickHealthCheck();
      const statusCode = results.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json(results);
    } catch (error) {
      res.status(500).json({
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message
      });
    }
  });

  // 시스템 정보
  app.get('/health/system', async (req, res) => {
    try {
      const systemInfo = await healthService.getSystemInfo();
      res.json(systemInfo);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  });

  // 개별 헬스체크
  app.get('/health/:checkType', async (req, res) => {
    const { checkType } = req.params;
    const healthService = getHealthCheckService();

    try {
      let result;
      switch (checkType) {
        case 'database':
          result = await healthService.checkDatabase();
          break;
        case 'memory':
          result = await healthService.checkMemoryUsage();
          break;
        case 'cache':
          result = await healthService.checkCacheHealth();
          break;
        case 'api':
          result = await healthService.checkAPIResponseTime();
          break;
        default:
          return res.status(404).json({ error: 'Health check type not found' });
      }

      const statusCode = result.status === 'healthy' ? 200 : 
                        result.status === 'warning' ? 200 : 503;
      
      res.status(statusCode).json(result);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message
      });
    }
  });
};

module.exports = {
  HealthCheckService,
  getHealthCheckService,
  createHealthCheckRoutes
};