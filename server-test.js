// Test server without MongoDB for API integration testing
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  // For testing, we'll use a mock user
  req.user = {
    _id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    age: 45,
    isVerified: true
  };
  next();
};

// Mock API routes for testing
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, age } = req.body;
  
  console.log('Mock register request:', { email, name, age });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  res.json({
    success: true,
    message: '회원가입이 완료되었습니다.',
    data: {
      user: {
        _id: 'mock-user-' + Date.now(),
        email,
        name,
        age,
        isVerified: false,
        createdAt: new Date().toISOString()
      },
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now()
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  console.log('Mock login request:', { email, rememberMe });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  res.json({
    success: true,
    message: '로그인되었습니다.',
    data: {
      user: {
        _id: 'mock-user-12345',
        email,
        name: 'Mock User',
        age: 50,
        isVerified: true,
        profileImage: null,
        bio: '테스트 사용자입니다.',
        createdAt: new Date().toISOString()
      },
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now()
    }
  });
});

app.get('/api/auth/me', mockAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  
  console.log('Mock token refresh request');
  
  res.json({
    success: true,
    data: {
      token: 'mock-jwt-token-refreshed-' + Date.now(),
      refreshToken: 'mock-refresh-token-refreshed-' + Date.now()
    }
  });
});

app.get('/api/values/questions', (req, res) => {
  console.log('Mock values questions request');
  
  const questions = [
    {
      id: 1,
      text: "인생에서 가장 중요하게 생각하는 가치는 무엇인가요?",
      category: "life_values",
      options: [
        { value: "family", text: "가족과의 시간" },
        { value: "growth", text: "성장과 도전" },
        { value: "stability", text: "안정과 평화" },
        { value: "freedom", text: "자유와 독립" }
      ]
    },
    {
      id: 2,
      text: "여가 시간을 어떻게 보내는 것을 선호하시나요?",
      category: "lifestyle",
      options: [
        { value: "quiet", text: "조용한 곳에서 독서나 명상" },
        { value: "social", text: "친구들과 함께 활동" },
        { value: "active", text: "운동이나 야외활동" },
        { value: "creative", text: "예술이나 창작활동" }
      ]
    }
  ];
  
  res.json({
    success: true,
    data: {
      questions,
      totalQuestions: questions.length
    }
  });
});

app.post('/api/values/assessment', mockAuth, async (req, res) => {
  const { answers } = req.body;
  
  console.log('Mock values assessment submission:', Object.keys(answers).length, 'answers');
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  res.json({
    success: true,
    message: '가치관 분석이 완료되었습니다.',
    data: {
      assessment: {
        userId: req.user._id,
        answers,
        personalityScore: {
          extroversion: 4,
          stability: 5,
          growth: 5,
          creativity: 3,
          social: 4
        },
        valuesProfile: {
          family: 5,
          growth: 4,
          stability: 3,
          freedom: 4,
          creativity: 3
        },
        aiAnalysis: {
          primaryPersonality: "성장 지향적",
          secondaryTraits: ["안정 추구", "가족 중심"],
          recommendedMatchTypes: ["동반자형", "성장형"]
        },
        completed: true,
        completedAt: new Date().toISOString()
      }
    }
  });
});

app.get('/api/values/assessment', mockAuth, (req, res) => {
  console.log('Mock get values assessment request');
  
  res.json({
    success: true,
    data: {
      assessment: {
        userId: req.user._id,
        personalityScore: {
          extroversion: 4,
          stability: 5,
          growth: 5,
          creativity: 3,
          social: 4
        },
        completed: true,
        completedAt: new Date().toISOString()
      }
    }
  });
});

app.post('/api/matching/generate', mockAuth, async (req, res) => {
  console.log('Mock generate matches request');
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  res.json({
    success: true,
    message: '새로운 매치가 생성되었습니다.',
    data: {
      generatedMatches: 3,
      totalMatches: 8
    }
  });
});

app.get('/api/matching/my-matches', mockAuth, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  
  console.log('Mock get matches request:', { status, page, limit });
  
  const mockMatches = [
    {
      _id: 'match-1',
      otherUser: {
        _id: 'user-1',
        name: '김영희',
        age: 47,
        bio: '가족과 함께하는 시간을 소중히 여기며, 새로운 문화 체험을 좋아합니다. 진솔한 대화를 나눌 수 있는 분을 만나고 싶어요.',
        profileImage: null
      },
      compatibilityScore: 94,
      commonValues: ['가족', '성장', '안정'],
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'match-2',
      otherUser: {
        _id: 'user-2',
        name: '박준호',
        age: 52,
        bio: '독서와 클래식 음악을 즐기며, 차분하고 지적인 대화를 좋아합니다. 함께 박물관이나 전시회를 관람할 분을 찾고 있어요.',
        profileImage: null
      },
      compatibilityScore: 87,
      commonValues: ['지성', '문화', '평화'],
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'match-3',
      otherUser: {
        _id: 'user-3',
        name: '이정숙',
        age: 49,
        bio: '요리와 여행을 좋아하며, 긍정적인 에너지로 가득한 사람입니다. 함께 새로운 장소를 탐험하고 맛있는 음식을 나눌 분을 기다려요.',
        profileImage: null
      },
      compatibilityScore: 91,
      commonValues: ['모험', '즐거움', '나눔'],
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: {
      matches: mockMatches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockMatches.length,
        pages: 1
      },
      stats: {
        totalMatches: mockMatches.length,
        pendingMatches: mockMatches.length,
        mutualMatches: 0
      }
    }
  });
});

app.post('/api/matching/matches/:matchId/respond', mockAuth, async (req, res) => {
  const { matchId } = req.params;
  const { action, note } = req.body;
  
  console.log('Mock match response:', { matchId, action, note });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const isMutual = Math.random() > 0.7; // 30% chance of mutual match
  
  res.json({
    success: true,
    message: action === 'like' ? '관심을 표현했습니다.' : '매치를 패스했습니다.',
    data: {
      matchId,
      action,
      isMutual,
      status: action === 'like' ? (isMutual ? 'mutual' : 'liked') : 'passed'
    }
  });
});

app.get('/api/matching/mutual-matches', mockAuth, (req, res) => {
  console.log('Mock get mutual matches request');
  
  res.json({
    success: true,
    data: {
      mutualMatches: [
        {
          _id: 'mutual-1',
          otherUser: {
            name: '김미선',
            age: 45,
            bio: '서로 존중하며 함께 성장할 수 있는 관계를 원합니다.'
          },
          compatibilityScore: 96,
          mutualDate: new Date().toISOString()
        }
      ]
    }
  });
});

app.get('/api/matching/stats', mockAuth, (req, res) => {
  console.log('Mock get matching stats request');
  
  res.json({
    success: true,
    data: {
      stats: {
        totalMatches: 8,
        pendingMatches: 5,
        mutualMatches: 1,
        passedMatches: 2,
        averageCompatibility: 89
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Mock server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Mock CHARM_INYEON Backend Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Server started at: ${new Date().toISOString()}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   • POST /api/auth/register - Mock user registration`);
  console.log(`   • POST /api/auth/login - Mock user login`);
  console.log(`   • GET  /api/auth/me - Mock user info`);
  console.log(`   • POST /api/auth/refresh - Mock token refresh`);
  console.log(`   • GET  /api/values/questions - Mock values questions`);
  console.log(`   • POST /api/values/assessment - Mock values submission`);
  console.log(`   • GET  /api/values/assessment - Mock values results`);
  console.log(`   • POST /api/matching/generate - Mock match generation`);
  console.log(`   • GET  /api/matching/my-matches - Mock user matches`);
  console.log(`   • POST /api/matching/matches/:id/respond - Mock match response`);
  console.log(`   • GET  /api/matching/mutual-matches - Mock mutual matches`);
  console.log(`   • GET  /api/matching/stats - Mock matching stats`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;