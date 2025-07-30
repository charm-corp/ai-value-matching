// Vercel 서버리스 함수용 CHARM_INYEON API
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS 설정 - 모든 오리진 허용 (개발용)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, '..')));

// 테스트 사용자 데이터 (In-Memory, 배포 테스트용)
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
    createdAt: '2025-07-29T04:02:21.410Z'
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
    createdAt: '2025-07-29T04:02:27.234Z'
  }
];

// API 라우트들
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: {
      users: testUsers,
      totalCount: testUsers.length,
      currentCount: testUsers.length
    },
    message: '총 2명의 사용자를 조회했습니다.'
  });
});

app.get('/api/matching/test', (req, res) => {
  const user1 = testUsers[0]; // 김세렌
  const user2 = testUsers[1]; // 이매력
  
  const compatibility = {
    totalScore: 70,
    breakdown: {
      valuesAlignment: 100,      // 가치관 일치도 100%
      lifestyleMatch: 50,        // 라이프스타일 50%
      maritalStatusCompatibility: 50,
      childrenCompatibility: 50,
      occupationCompatibility: 50,
      ageCompatibility: 90,      // 연령 호환성 90%
      locationCompatibility: 30   // 지역 호환성 30%
    }
  };

  res.json({
    success: true,
    data: {
      testInfo: {
        timestamp: new Date().toISOString(),
        testUsers: {
          user1: { name: user1.name, age: user1.age },
          user2: { name: user2.name, age: user2.age }
        }
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
            matchReason: '가치관 일치도가 높고 생활 패턴이 조화롭습니다.'
          }
        ],
        database: {
          totalUsers: testUsers.length,
          totalAssessments: testUsers.length,
          users: testUsers.map(u => ({ 
            name: u.name, 
            age: u.age, 
            hasAssessment: u.hasAssessment 
          }))
        }
      }
    },
    message: '매칭 시스템 테스트가 완료되었습니다.'
  });
});

// 지능형 호환성 분석 (하트 나침반용)
app.get('/api/matching/intelligent-compatibility/:targetUserId', (req, res) => {
  const { targetUserId } = req.params;
  const targetUser = testUsers.find(u => u.id === targetUserId);
  
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      error: '사용자를 찾을 수 없습니다.',
      code: 'USER_NOT_FOUND'
    });
  }

  const compatibility = {
    totalScore: 75,
    breakdown: {
      valuesAlignment: 85,
      lifestyleMatch: 70,
      personalityMatch: 80,
      interestsMatch: 65,
      locationCompatibility: 40
    },
    recommendation: '매우 높은 호환성을 보입니다. 진정한 인연이 될 가능성이 높아요!',
    matchStrength: 'high'
  };

  res.json({
    success: true,
    data: {
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        age: targetUser.age
      },
      compatibility,
      analysisTimestamp: new Date().toISOString()
    },
    message: '호환성 분석이 완료되었습니다.'
  });
});

// 사용자 프로필 조회
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = testUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: '사용자를 찾을 수 없습니다.',
      code: 'USER_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    data: user,
    message: '사용자 정보를 성공적으로 조회했습니다.'
  });
});

// 매칭 결과 생성
app.post('/api/matching/generate', (req, res) => {
  const matches = testUsers.map(user => ({
    userId: user.id,
    name: user.name,
    age: user.age,
    gender: user.gender,
    location: user.location,
    bio: user.bio,
    compatibilityScore: Math.floor(Math.random() * 30) + 70, // 70-100 랜덤
    matchReason: '가치관과 생활 패턴이 잘 맞습니다.',
    serendipityScore: Math.floor(Math.random() * 40) + 60 // 60-100 랜덤
  }));

  res.json({
    success: true,
    data: {
      matches,
      totalMatches: matches.length,
      generatedAt: new Date().toISOString()
    },
    message: `${matches.length}개의 매칭 결과를 생성했습니다.`
  });
});

// 가치관 평가 결과 조회
app.get('/api/values/assessment/:userId', (req, res) => {
  const { userId } = req.params;
  const user = testUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: '사용자를 찾을 수 없습니다.',
      code: 'USER_NOT_FOUND'
    });
  }

  const assessment = {
    userId: user.id,
    completedAt: '2025-07-29T04:02:21.410Z',
    results: {
      familyValues: 85,
      careerOrientation: 70,
      socialConnection: 90,
      personalGrowth: 80,
      lifestyle: 75
    },
    personality: {
      openness: 75,
      conscientiousness: 85,
      extraversion: 60,
      agreeableness: 90,
      neuroticism: 30
    },
    preferences: {
      communicationStyle: 'direct_caring',
      conflictResolution: 'collaborative',
      leisureActivities: user.interests
    }
  };

  res.json({
    success: true,
    data: assessment,
    message: '가치관 평가 결과를 조회했습니다.'
  });
});

// 매칭 시스템 Health check
app.get('/api/matching/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    matchingEngine: 'active',
    database: 'in-memory',
    totalUsers: testUsers.length,
    availableEndpoints: [
      '/api/matching/intelligent-compatibility/:userId',
      '/api/matching/generate',
      '/api/matching/test',
      '/api/users/:userId',
      '/api/values/assessment/:userId'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0-serverless',
    environment: 'production',
    database: 'in-memory',
    users: testUsers.length
  });
});

// Ping 엔드포인트
app.get('/ping', (req, res) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    server: 'CHARM_INYEON Serverless'
  });
});

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 정적 파일 라우트들
app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'script.js'));
});

app.get('/api-client.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'api-client.js'));
});

app.get('/signup.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'signup.js'));
});

app.get('/values-assessment.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '..', 'values-assessment.js'));
});

// HTML 파일들
app.get('/signup.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '..', 'signup.html'));
});

app.get('/values-assessment.html', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '..', 'values-assessment.html'));
});

// CSS 파일들
app.get('/styles.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '..', 'styles.css'));
});

app.get('/styles/:file', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '..', 'styles', req.params.file));
});

app.get('/styles/base/:file', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '..', 'styles', 'base', req.params.file));
});

app.get('/styles/components/:file', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, '..', 'styles', 'components', req.params.file));
});

// 모든 나머지 요청 처리
app.get('*', (req, res) => {
  // API 요청이 아닌 경우 index.html 반환
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else {
    res.status(404).json({
      error: 'API endpoint not found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      availableEndpoints: [
        'GET /api/users',
        'GET /api/matching/test',
        'GET /api/health',
        'GET /ping'
      ]
    });
  }
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;