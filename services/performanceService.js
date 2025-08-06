const { getCacheService } = require('./cacheService');

/**
 * Performance Optimization Service
 * 성능 최적화 및 모니터링 전용 서비스
 */

class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.slowQueries = [];
    this.activeConnections = 0;
    this.requestQueue = [];
    
    // 성능 임계값 설정
    this.thresholds = {
      slowQuery: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000'), // 1초
      memoryUsage: parseInt(process.env.MEMORY_THRESHOLD || '500'), // 500MB
      cpuUsage: parseInt(process.env.CPU_THRESHOLD || '80'), // 80%
      responseTime: parseInt(process.env.RESPONSE_TIME_THRESHOLD || '2000') // 2초
    };

    // 성능 모니터링 시작
    this.startMonitoring();
  }

  // 성능 모니터링 시작
  startMonitoring() {
    // 메모리 사용량 모니터링 (30초마다)
    setInterval(() => {
      this.monitorMemoryUsage();
    }, 30000);

    // 느린 쿼리 정리 (5분마다)
    setInterval(() => {
      this.cleanupSlowQueries();
    }, 300000);

    // 메트릭 정리 (1시간마다)
    setInterval(() => {
      this.cleanupMetrics();
    }, 3600000);
  }

  // 메모리 사용량 모니터링
  monitorMemoryUsage() {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);

    if (usedMB > this.thresholds.memoryUsage) {
      console.warn(`⚠️ High memory usage: ${usedMB}MB`);
      
      // 가비지 컬렉션 강제 실행 (주의: 프로덕션에서는 신중하게 사용)
      if (global.gc && process.env.NODE_ENV !== 'production') {
        global.gc();
        console.log('🗑️ Garbage collection triggered');
      }
    }

    // 메트릭 저장
    this.recordMetric('memory_usage', usedMB, Date.now());
  }

  // 쿼리 성능 추적
  trackQuery(queryType, query, executionTime, resultCount = 0) {
    const metric = {
      queryType,
      query: this.sanitizeQuery(query),
      executionTime,
      resultCount,
      timestamp: Date.now()
    };

    // 느린 쿼리 기록
    if (executionTime > this.thresholds.slowQuery) {
      this.slowQueries.push(metric);
      console.warn(`🐌 Slow query detected: ${queryType} (${executionTime}ms)`);
    }

    // 메트릭 기록
    this.recordMetric(`query_${queryType}`, executionTime, Date.now());
  }

  // API 응답 시간 추적
  trackApiResponse(endpoint, method, statusCode, responseTime, userId = null) {
    const metric = {
      endpoint,
      method,
      statusCode,
      responseTime,
      userId,
      timestamp: Date.now()
    };

    // 느린 응답 기록
    if (responseTime > this.thresholds.responseTime) {
      console.warn(`🐌 Slow API response: ${method} ${endpoint} (${responseTime}ms)`);
    }

    // 메트릭 기록
    this.recordMetric(`api_${endpoint}_${method}`, responseTime, Date.now());
    
    // 상태 코드별 카운팅
    this.incrementCounter(`status_${statusCode}`);
  }

  // 사용자별 성능 추적
  trackUserPerformance(userId, operation, duration) {
    const key = `user_${userId}_${operation}`;
    this.recordMetric(key, duration, Date.now());

    // 사용자별 평균 응답 시간 계산
    const userMetrics = this.getMetricsForKey(key);
    if (userMetrics.length >= 10) { // 최소 10개 샘플
      const avgTime = userMetrics.reduce((sum, m) => sum + m.value, 0) / userMetrics.length;
      
      if (avgTime > this.thresholds.responseTime * 1.5) {
        console.warn(`⚠️ User ${userId} experiencing slow performance: ${avgTime.toFixed(2)}ms average`);
      }
    }
  }

  // 데이터베이스 연결 풀 모니터링
  trackDbConnection(action) {
    switch (action) {
      case 'connect':
        this.activeConnections++;
        break;
      case 'disconnect':
        this.activeConnections--;
        break;
    }

    this.recordMetric('db_connections', this.activeConnections, Date.now());

    // 연결 수가 많은 경우 경고
    const maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || '10');
    if (this.activeConnections > maxConnections * 0.8) {
      console.warn(`⚠️ High DB connection usage: ${this.activeConnections}/${maxConnections}`);
    }
  }

  // 캐시 성능 추적
  trackCachePerformance(operation, hit, responseTime) {
    const hitMiss = hit ? 'hit' : 'miss';
    this.recordMetric(`cache_${operation}_${hitMiss}`, responseTime, Date.now());
    this.incrementCounter(`cache_${hitMiss}`);
  }

  // 메트릭 기록
  recordMetric(key, value, timestamp) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metricArray = this.metrics.get(key);
    metricArray.push({ value, timestamp });

    // 최근 1000개 항목만 유지
    if (metricArray.length > 1000) {
      metricArray.shift();
    }
  }

  // 카운터 증가
  incrementCounter(key) {
    const current = this.getLatestMetric(key) || 0;
    this.recordMetric(key, current + 1, Date.now());
  }

  // 특정 키의 메트릭 조회
  getMetricsForKey(key) {
    return this.metrics.get(key) || [];
  }

  // 최신 메트릭 값 조회
  getLatestMetric(key) {
    const metrics = this.getMetricsForKey(key);
    return metrics.length > 0 ? metrics[metrics.length - 1].value : null;
  }

  // 평균 계산
  getAverageMetric(key, timeRangeMs = 3600000) { // 기본 1시간
    const now = Date.now();
    const metrics = this.getMetricsForKey(key)
      .filter(m => now - m.timestamp <= timeRangeMs);

    if (metrics.length === 0) return null;

    const sum = metrics.reduce((total, m) => total + m.value, 0);
    return sum / metrics.length;
  }

  // 성능 보고서 생성
  generatePerformanceReport() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const report = {
      timestamp: new Date(now).toISOString(),
      summary: {
        activeConnections: this.activeConnections,
        totalMetrics: this.metrics.size,
        slowQueriesCount: this.slowQueries.length
      },
      memory: {
        current: this.getLatestMetric('memory_usage'),
        average: this.getAverageMetric('memory_usage'),
        peak: this.getPeakMetric('memory_usage')
      },
      database: {
        connections: this.getLatestMetric('db_connections'),
        slowQueries: this.getRecentSlowQueries(10)
      },
      cache: {
        hitRate: this.calculateCacheHitRate(),
        stats: getCacheService().getStats()
      },
      api: {
        totalRequests: this.getTotalRequests(),
        averageResponseTime: this.getAverageApiResponseTime(),
        errorRate: this.getErrorRate()
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  // 최대값 계산
  getPeakMetric(key, timeRangeMs = 3600000) {
    const now = Date.now();
    const metrics = this.getMetricsForKey(key)
      .filter(m => now - m.timestamp <= timeRangeMs);

    if (metrics.length === 0) return null;

    return Math.max(...metrics.map(m => m.value));
  }

  // 캐시 히트율 계산
  calculateCacheHitRate() {
    const hits = this.getLatestMetric('cache_hit') || 0;
    const misses = this.getLatestMetric('cache_miss') || 0;
    const total = hits + misses;

    return total > 0 ? ((hits / total) * 100).toFixed(2) : 0;
  }

  // 총 요청 수 계산
  getTotalRequests() {
    let total = 0;
    for (const [key, metrics] of this.metrics) {
      if (key.startsWith('status_')) {
        total += this.getLatestMetric(key) || 0;
      }
    }
    return total;
  }

  // 평균 API 응답 시간 계산
  getAverageApiResponseTime() {
    const apiMetrics = [];
    for (const [key, metrics] of this.metrics) {
      if (key.startsWith('api_')) {
        apiMetrics.push(...metrics);
      }
    }

    if (apiMetrics.length === 0) return 0;

    const sum = apiMetrics.reduce((total, m) => total + m.value, 0);
    return (sum / apiMetrics.length).toFixed(2);
  }

  // 에러율 계산
  getErrorRate() {
    const total = this.getTotalRequests();
    const errors = (this.getLatestMetric('status_500') || 0) +
                  (this.getLatestMetric('status_400') || 0) +
                  (this.getLatestMetric('status_401') || 0) +
                  (this.getLatestMetric('status_403') || 0) +
                  (this.getLatestMetric('status_404') || 0);

    return total > 0 ? ((errors / total) * 100).toFixed(2) : 0;
  }

  // 최근 느린 쿼리 조회
  getRecentSlowQueries(limit = 10) {
    return this.slowQueries
      .slice(-limit)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  // 성능 개선 권장사항 생성
  generateRecommendations() {
    const recommendations = [];

    // 메모리 사용량 체크
    const avgMemory = this.getAverageMetric('memory_usage');
    if (avgMemory && avgMemory > this.thresholds.memoryUsage * 0.8) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: '메모리 사용량이 높습니다. 캐시 정책을 검토하거나 메모리 누수를 확인하세요.',
        value: `${avgMemory}MB`
      });
    }

    // 캐시 히트율 체크
    const hitRate = parseFloat(this.calculateCacheHitRate());
    if (hitRate < 70) {
      recommendations.push({
        type: 'cache',
        priority: 'medium',
        message: '캐시 히트율이 낮습니다. 캐시 키 전략이나 TTL을 재검토하세요.',
        value: `${hitRate}%`
      });
    }

    // 느린 쿼리 체크
    if (this.slowQueries.length > 10) {
      recommendations.push({
        type: 'database',
        priority: 'high',
        message: '느린 쿼리가 많이 발생하고 있습니다. 인덱스 최적화를 검토하세요.',
        value: `${this.slowQueries.length} slow queries`
      });
    }

    // API 응답 시간 체크
    const avgResponseTime = parseFloat(this.getAverageApiResponseTime());
    if (avgResponseTime > this.thresholds.responseTime) {
      recommendations.push({
        type: 'api',
        priority: 'medium',
        message: 'API 응답 시간이 느립니다. 캐싱이나 쿼리 최적화를 고려하세요.',
        value: `${avgResponseTime}ms`
      });
    }

    // 에러율 체크
    const errorRate = parseFloat(this.getErrorRate());
    if (errorRate > 5) {
      recommendations.push({
        type: 'error',
        priority: 'high',
        message: '에러율이 높습니다. 로그를 확인하고 에러 처리를 개선하세요.',
        value: `${errorRate}%`
      });
    }

    return recommendations;
  }

  // 쿼리 정제 (민감한 정보 제거)
  sanitizeQuery(query) {
    if (typeof query === 'string') {
      // 비밀번호, 토큰 등 민감한 정보 마스킹
      return query
        .replace(/password['\s]*[:=]['\s]*['"]\w+['"]*/gi, 'password: [REDACTED]')
        .replace(/token['\s]*[:=]['\s]*['"]\w+['"]*/gi, 'token: [REDACTED]')
        .replace(/secret['\s]*[:=]['\s]*['"]\w+['"]*/gi, 'secret: [REDACTED]');
    }
    
    if (typeof query === 'object') {
      const sanitized = { ...query };
      const sensitiveFields = ['password', 'token', 'secret', 'key'];
      
      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      return JSON.stringify(sanitized);
    }
    
    return String(query);
  }

  // 느린 쿼리 정리 (오래된 것들 제거)
  cleanupSlowQueries() {
    const oneDayAgo = Date.now() - 86400000; // 24시간
    this.slowQueries = this.slowQueries.filter(q => q.timestamp > oneDayAgo);
  }

  // 메트릭 정리 (오래된 것들 제거)
  cleanupMetrics() {
    const oneWeekAgo = Date.now() - 604800000; // 1주일
    
    for (const [key, metrics] of this.metrics) {
      const filteredMetrics = metrics.filter(m => m.timestamp > oneWeekAgo);
      
      if (filteredMetrics.length === 0) {
        this.metrics.delete(key);
      } else {
        this.metrics.set(key, filteredMetrics);
      }
    }
  }

  // 성능 알림 설정
  setupAlerts() {
    // 실시간 메모리 사용량 체크
    setInterval(() => {
      const memoryUsage = this.getLatestMetric('memory_usage');
      if (memoryUsage && memoryUsage > this.thresholds.memoryUsage) {
        this.sendAlert('memory', `High memory usage: ${memoryUsage}MB`);
      }
    }, 60000); // 1분마다

    // DB 연결 수 체크
    setInterval(() => {
      const maxConnections = parseInt(process.env.DB_MAX_CONNECTIONS || '10');
      if (this.activeConnections > maxConnections * 0.9) {
        this.sendAlert('database', `High DB connection usage: ${this.activeConnections}/${maxConnections}`);
      }
    }, 30000); // 30초마다
  }

  // 알림 발송
  sendAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: new Date().toISOString(),
      severity: 'warning'
    };

    console.warn(`🚨 Performance Alert [${type}]: ${message}`);

    // 외부 알림 시스템 연동 (Slack, 이메일 등)
    if (process.env.ALERT_WEBHOOK_URL) {
      // 웹훅 전송 로직
      this.sendWebhookAlert(alert).catch(error => {
        console.error('Failed to send webhook alert:', error);
      });
    }
  }

  // 웹훅 알림 전송
  async sendWebhookAlert(alert) {
    try {
      const fetch = require('node-fetch');
      
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `Performance Alert: ${alert.message}`,
          timestamp: alert.timestamp,
          type: alert.type
        })
      });
    } catch (error) {
      console.error('Webhook alert failed:', error);
    }
  }

  // 성능 대시보드 데이터 반환
  getDashboardData() {
    return {
      realtime: {
        memoryUsage: this.getLatestMetric('memory_usage'),
        activeConnections: this.activeConnections,
        cacheHitRate: this.calculateCacheHitRate(),
        totalRequests: this.getTotalRequests()
      },
      trends: {
        memoryTrend: this.getMetricsForKey('memory_usage').slice(-60), // 최근 60개
        responseTrend: this.getAverageApiResponseTime(),
        errorTrend: this.getErrorRate()
      },
      alerts: this.generateRecommendations(),
      slowQueries: this.getRecentSlowQueries(5)
    };
  }
}

// 싱글톤 인스턴스
let performanceServiceInstance = null;

const getPerformanceService = () => {
  if (!performanceServiceInstance) {
    performanceServiceInstance = new PerformanceService();
  }
  return performanceServiceInstance;
};

// Express 미들웨어로 사용할 수 있는 성능 추적기
const createPerformanceMiddleware = () => {
  const perfService = getPerformanceService();
  
  return (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      const userId = req.rlsContext?.userId;
      
      // API 성능 추적
      perfService.trackApiResponse(
        req.route?.path || req.path,
        req.method,
        res.statusCode,
        responseTime,
        userId
      );

      // 사용자별 성능 추적
      if (userId) {
        perfService.trackUserPerformance(userId, req.method, responseTime);
      }

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  PerformanceService,
  getPerformanceService,
  createPerformanceMiddleware
};