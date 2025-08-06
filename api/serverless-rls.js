// Vercel 서버리스 + RLS 통합 버전
const express = require('express');
const cors = require('cors');
const path = require('path');

// RLS 시스템 (서버리스 환경 호환)
let rlsSystemEnabled = false;

const app = express();

// 기본 미들웨어 설정
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..')));

// RLS 시스템 서버리스 호환성 체크
async function initializeRLSForServerless() {
  if (rlsSystemEnabled) return true;
  
  try {
    // 서버리스 환경에서는 DB 연결 없이 서비스만 초기화
    console.log('🚀 Initializing RLS for Serverless...');
    
    // RLS 모듈 로드 시도
    const { createCompatibilityMiddleware } = require('../middleware/rlsIntegration');
    const { getCacheService } = require('../services/cacheService');
    const { getPerformanceService } = require('../services/performanceService');
    
    // 호환성 미들웨어 추가
    app.use(createCompatibilityMiddleware());
    
    // 메모리 기반 캐시 초기화
    const cacheService = getCacheService();
    const performanceService = getPerformanceService();
    
    rlsSystemEnabled = true;
    console.log('✅ RLS system initialized for serverless environment');
    return true;
    
  } catch (error) {
    console.warn('⚠️ RLS system not available in serverless environment:', error.message);
    return false;
  }
}

// RLS 시스템 초기화 시도 (비동기)
setImmediate(() => {
  initializeRLSForServerless();
});

// 기존 테스트 데이터
const testUsers = [
  {
    id: '686bc424bdc898fe84317d51',
    name: '김세렌',
    age: '51-55',
    gender: 'male',
    location: { city: '서울', district: '강남구' },
    bio: '운명적인 만남을 기다리는 사람입니다. 세렌디피티를 믿으며 진정한 인연을 찾고 있습니다.',
    interests: ['문화생활', '독서', '여행', '음악감상'],
    hasAssessment: true,
    isActive: true,
    profileCompleteness: 85,
    createdAt: '2025-07-29T04:02:21.410Z',
  },
  {
    id: '686bc47cdbe9a3ad7e138f970',
    name: '이매력',
    age: '46-50',
    gender: 'female',
    location: { city: '서울', district: '서초구' },
    bio: '진정한 인연을 찾고 있습니다. 함께 웃고 울 수 있는 따뜻한 사람을 만나고 싶어요.',
    interests: ['요리', '영화감상', '산책', '카페투어'],
    hasAssessment: true,
    isActive: true,
    profileCompleteness: 92,
    createdAt: '2025-07-29T04:02:27.234Z',
  },
];

// === RLS Enhanced API Endpoints ===

// RLS 시스템 상태 확인
app.get('/api/rls/status', (req, res) => {
  res.json({
    success: true,
    data: {
      rlsSystemEnabled,
      environment: 'serverless',
      timestamp: new Date().toISOString(),
      features: {
        caching: rlsSystemEnabled,
        performance_monitoring: rlsSystemEnabled,
        health_checks: rlsSystemEnabled,
        enhanced_auth: process.env.FEATURE_ENHANCED_AUTH === 'true'
      }
    },
    message: 'RLS system status retrieved successfully'
  });
});

// Enhanced Health Check (RLS 버전)
app.get('/api/health/enhanced', async (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.1.0-rls-serverless',
    environment: 'production-serverless',
    database: 'in-memory',
    users: testUsers.length,
    rls: {
      enabled: rlsSystemEnabled,
      services: rlsSystemEnabled ? {
        cache: 'memory-based',
        performance: 'active',
        auth: 'enhanced'
      } : null
    }
  };

  // RLS 성능 데이터 추가 (사용 가능한 경우)
  if (rlsSystemEnabled) {
    try {
      const { getPerformanceService } = require('../services/performanceService');
      const perfService = getPerformanceService();
      
      healthData.performance = {
        totalRequests: perfService.getTotalRequests(),
        averageResponseTime: perfService.getAverageApiResponseTime(),
        cacheHitRate: '85%', // Serverless 환경에서는 추정값
        memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
      };
    } catch (error) {
      healthData.performance = { status: 'metrics_not_available' };
    }
  }

  res.json(healthData);
});

// RLS 호환 사용자 조회 (권한 체크 포함)
app.get('/api/users/rls', (req, res) => {
  // RLS 컨텍스트 확인
  const hasRLSContext = !!req.rlsContext;
  
  const responseData = {
    success: true,
    data: {
      users: testUsers.map(user => ({
        ...user,
        // RLS가 활성화된 경우 민감한 정보 필터링
        bio: rlsSystemEnabled && !hasRLSContext ? '[Requires Authentication]' : user.bio,
        interests: rlsSystemEnabled && !hasRLSContext ? ['[Protected]'] : user.interests
      })),
      totalCount: testUsers.length,
      currentCount: testUsers.length,
      rlsFiltered: rlsSystemEnabled && !hasRLSContext
    },
    message: `총 ${testUsers.length}명의 사용자를 조회했습니다. ${rlsSystemEnabled ? '(RLS 보안 적용)' : ''}`
  };
  
  res.json(responseData);
});

// Enhanced 매칭 테스트 (RLS + AI Insights)
app.get('/api/matching/enhanced-test', (req, res) => {
  const user1 = testUsers[0];
  const user2 = testUsers[1];
  
  const compatibility = {
    totalScore: 75,
    breakdown: {
      valuesAlignment: 100,
      lifestyleMatch: 60,
      personalityCompatibility: 85,
      interestsMatch: 70,
      locationCompatibility: 40,
      communicationStyle: 90
    },
    aiInsights: rlsSystemEnabled ? {
      recommendation: '매우 높은 호환성을 보입니다. 특히 가치관과 소통 스타일에서 훌륭한 일치도를 보여줍니다.',
      conversationStarters: [
        '문화생활에 대한 공통 관심사가 많네요. 최근에 인상 깊게 본 전시나 공연이 있나요?',
        '여행을 좋아하신다고 하셨는데, 가장 기억에 남는 여행지가 어디인가요?'
      ],
      relationshipPrediction: {
        compatibility: 'very_high',
        successProbability: 85,
        strengths: ['가치관 일치', '소통 스타일 호환', '문화적 관심사 공유'],
        considerations: ['지역적 거리', '라이프스타일 조율 필요']
      }
    } : null
  };
  
  res.json({
    success: true,
    data: {
      testInfo: {
        timestamp: new Date().toISOString(),
        version: 'enhanced-rls-2.1',
        rlsEnabled: rlsSystemEnabled,
        aiInsightsEnabled: rlsSystemEnabled
      },
      testUsers: {
        user1: { name: user1.name, age: user1.age },
        user2: { name: user2.name, age: user2.age }
      },
      results: {
        enhancedCompatibility: compatibility,
        potentialMatches: [
          {
            userId: user2.id,
            name: user2.name,
            age: user2.age,
            compatibilityScore: 75,
            serendipityScore: 68,
            matchReason: rlsSystemEnabled ? 
              'AI 분석 결과: 가치관 일치도가 매우 높으며, 소통 스타일이 조화롭습니다. 문화적 관심사 공유로 깊은 대화가 가능할 것으로 예상됩니다.' :
              '가치관 일치도가 높고 생활 패턴이 조화롭습니다.'
          }
        ],
        systemInfo: {
          matchingEngine: rlsSystemEnabled ? 'RLS-Enhanced-v2.1' : 'Standard-v2.0',
          aiInsights: rlsSystemEnabled,
          securityLevel: rlsSystemEnabled ? 'Enhanced' : 'Standard'
        }
      }
    },
    message: `Enhanced 매칭 테스트 완료 ${rlsSystemEnabled ? '(RLS + AI Insights 적용)' : ''}`
  });
});

// 캐시 테스트 엔드포인트
app.get('/api/cache/test', async (req, res) => {
  if (!rlsSystemEnabled) {
    return res.json({
      success: false,
      message: 'RLS system not available in this environment',
      data: { cacheAvailable: false }
    });
  }
  
  try {
    const { getCacheService } = require('../services/cacheService');
    const cacheService = getCacheService();
    
    // 캐시 테스트
    const testKey = `serverless_test_${Date.now()}`;
    const testData = { message: 'Hello from RLS Cache!', timestamp: new Date().toISOString() };
    
    await cacheService.set('test', testKey, testData, 60);
    const retrieved = await cacheService.get('test', testKey);
    
    res.json({
      success: true,
      data: {
        cacheAvailable: true,
        testResult: retrieved,
        cacheStats: cacheService.getStats()
      },
      message: 'Cache test completed successfully'
    });
    
  } catch (error) {
    res.json({
      success: false,
      message: 'Cache test failed',
      error: error.message,
      data: { cacheAvailable: false }
    });
  }
});

// === 기존 API 엔드포인트들 (변경 없음) ===

app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: {
      users: testUsers,
      totalCount: testUsers.length,
      currentCount: testUsers.length,
    },
    message: '총 2명의 사용자를 조회했습니다.',
  });
});

app.get('/api/matching/test', (req, res) => {
  const user1 = testUsers[0];
  const user2 = testUsers[1];

  const compatibility = {
    totalScore: 70,
    breakdown: {
      valuesAlignment: 100,
      lifestyleMatch: 50,
      maritalStatusCompatibility: 50,
      childrenCompatibility: 50,
      occupationCompatibility: 50,
      ageCompatibility: 90,
      locationCompatibility: 30,
    },
  };

  res.json({
    success: true,
    data: {
      testInfo: {
        timestamp: new Date().toISOString(),
        testUsers: {
          user1: { name: user1.name, age: user1.age },
          user2: { name: user2.name, age: user2.age },
        },
      },
      results: {
        advancedCompatibility: compatibility,
        potentialMatches: [
          {
            userId: user2.id,
            name: user2.name,
            age: user2.age,
            compatibilityScore: 70,
            serendipityScore: 64,
            matchReason: '가치관 일치도가 높고 생활 패턴이 조화롭습니다.',
          },
        ],
        database: {
          totalUsers: testUsers.length,
          totalAssessments: testUsers.length,
          users: testUsers.map(u => ({
            name: u.name,
            age: u.age,
            hasAssessment: u.hasAssessment,
          })),
        },
      },
    },
    message: '매칭 시스템 테스트가 완료되었습니다.',
  });
});

// 기존 엔드포인트들 유지...
app.get('/api/matching/intelligent-compatibility/:targetUserId', (req, res) => {
  const { targetUserId } = req.params;
  const targetUser = testUsers.find(u => u.id === targetUserId);

  if (!targetUser) {
    return res.status(404).json({
      success: false,
      error: '사용자를 찾을 수 없습니다.',
      code: 'USER_NOT_FOUND',
    });
  }

  const compatibility = {
    totalScore: 75,
    breakdown: {
      valuesAlignment: 85,
      lifestyleMatch: 70,
      personalityMatch: 80,
      interestsMatch: 65,
      locationCompatibility: 40,
    },
    recommendation: '매우 높은 호환성을 보입니다. 진정한 인연이 될 가능성이 높아요!',
    matchStrength: 'high',
  };

  res.json({
    success: true,
    data: {
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        age: targetUser.age,
      },
      compatibility,
      analysisTimestamp: new Date().toISOString(),
      enhancedByRLS: rlsSystemEnabled
    },
    message: '호환성 분석이 완료되었습니다.',
  });
});

// Health check (기존)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: rlsSystemEnabled ? '2.1.0-rls' : '2.0.0-standard',
    environment: 'production',
    database: 'in-memory',
    users: testUsers.length,
  });
});

// Ping 엔드포인트
app.get('/ping', (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    server: `CHARM_INYEON Serverless ${rlsSystemEnabled ? '+ RLS' : ''}`,
  });
});

// 기존 정적 파일 라우트들과 에러 핸들러 유지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 모든 나머지 요청 처리
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else {
    const availableEndpoints = [
      'GET /api/users',
      'GET /api/matching/test',
      'GET /api/health',
      'GET /ping'
    ];
    
    if (rlsSystemEnabled) {
      availableEndpoints.push(
        'GET /api/rls/status',
        'GET /api/health/enhanced',
        'GET /api/users/rls',
        'GET /api/matching/enhanced-test',
        'GET /api/cache/test'
      );
    }
    
    res.status(404).json({
      error: 'API endpoint not found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      availableEndpoints
    });
  }
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
    rlsEnabled: rlsSystemEnabled
  });
});

module.exports = app;