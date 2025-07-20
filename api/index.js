const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const security = require('../middleware/security');
require('dotenv').config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"]
    }
  }
}));
app.use(compression());
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Security middleware
app.use(security.checkBlockedIP);
app.use(security.detectSuspiciousActivity);
app.use(security.sanitizeInput);
app.use(security.preventInjection);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Serve CSS files
app.use('/styles', express.static(path.join(__dirname, '../styles'), {
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// Serve JavaScript files
app.use('/js', express.static(path.join(__dirname, '../js'), {
  setHeaders: (res, path) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// Serve root-level JS files (script.js, api-client.js)
app.get('/script.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../script.js'));
});

app.get('/api-client.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../api-client.js'));
});

// Database connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    let mongoUri;
    
    if (process.env.MONGODB_ATLAS_URI) {
      console.log('🌍 MongoDB Atlas 연결 시도...');
      mongoUri = process.env.MONGODB_ATLAS_URI;
    } else {
      throw new Error('MONGODB_ATLAS_URI 환경변수가 필요합니다.');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`✅ MongoDB 연결 성공: ${conn.connection.host}`);
    
    // 초기 데이터 생성
    await initializeTestData();
    
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    throw error;
  }
};

// 모델 import
const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const Match = require('../models/Match');
const bcrypt = require('bcryptjs');

// 초기 데이터 생성 함수
const initializeTestData = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('👥 테스트 데이터 생성 중...');
      
      // 김세렌 사용자
      const serenUser = new User({
        name: '김세렌',
        email: 'seren@charm.com',
        password: await bcrypt.hash('temp123!', 10),
        age: '51-55',
        gender: 'male',
        bio: '운명적인 만남을 기다리는 사람입니다. 세렌디피티를 믿으며 진정한 인연을 찾고 있습니다.',
        location: {
          city: '서울',
          district: '강남구'
        },
        interests: ['문화생활', '독서', '여행', '음악감상'],
        profileImage: 'male-classic.svg',
        isActive: true,
        hasProfileImage: true,
        profileCompleteness: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // 이매력 사용자
      const maeryukUser = new User({
        name: '이매력',
        email: 'maeryuk@charm.com',
        password: await bcrypt.hash('temp123!', 10),
        age: '46-50',
        gender: 'female',
        bio: '진정한 인연을 찾고 있습니다. 함께 웃고 울 수 있는 따뜻한 사람을 만나고 싶어요.',
        location: {
          city: '서울',
          district: '서초구'
        },
        interests: ['요리', '영화감상', '산책', '카페투어'],
        profileImage: 'female-friendly.svg',
        isActive: true,
        hasProfileImage: true,
        profileCompleteness: 92,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await serenUser.save();
      await maeryukUser.save();
      
      console.log('✅ 테스트 사용자 생성 완료');
      
      // 가치관 평가 데이터
      const serenAssessmentData = new Map();
      serenAssessmentData.set('q1', { questionId: 1, value: '5', text: '매우 동의', category: 'values' });
      serenAssessmentData.set('q2', { questionId: 2, value: '4', text: '동의', category: 'values' });
      serenAssessmentData.set('q3', { questionId: 3, value: '5', text: '매우 동의', category: 'personality' });
      serenAssessmentData.set('q4', { questionId: 4, value: '3', text: '보통', category: 'personality' });
      serenAssessmentData.set('q5', { questionId: 5, value: '4', text: '동의', category: 'lifestyle' });
      
      const serenAssessment = new ValuesAssessment({
        userId: serenUser._id,
        answers: serenAssessmentData,
        analysis: {
          personalityType: 'HARMONIOUS_SAGE',
          confidenceLevel: 0.88,
          summary: '조화로운 지혜로운 성격으로 안정적인 관계를 선호합니다.'
        },
        isCompleted: true,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const maeryukAssessmentData = new Map();
      maeryukAssessmentData.set('q1', { questionId: 1, value: '4', text: '동의', category: 'values' });
      maeryukAssessmentData.set('q2', { questionId: 2, value: '5', text: '매우 동의', category: 'values' });
      maeryukAssessmentData.set('q3', { questionId: 3, value: '4', text: '동의', category: 'personality' });
      maeryukAssessmentData.set('q4', { questionId: 4, value: '5', text: '매우 동의', category: 'personality' });
      maeryukAssessmentData.set('q5', { questionId: 5, value: '3', text: '보통', category: 'lifestyle' });
      
      const maeryukAssessment = new ValuesAssessment({
        userId: maeryukUser._id,
        answers: maeryukAssessmentData,
        analysis: {
          personalityType: 'WARM_COMPANION',
          confidenceLevel: 0.92,
          summary: '따뜻한 동반자형으로 깊은 감정적 유대를 중요시합니다.'
        },
        isCompleted: true,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await serenAssessment.save();
      await maeryukAssessment.save();
      
      console.log('✅ 가치관 평가 데이터 생성 완료');
      
      // 매칭 데이터
      const testMatch = new Match({
        userId: serenUser._id,
        matchedUserId: maeryukUser._id,
        compatibility: {
          overall: 75,
          values: 82,
          interests: 68,
          lifestyle: 74,
          personality: 77
        },
        serendipityScore: 64,
        status: 'pending',
        aiAnalysis: {
          strengths: ['가치관 일치도 높음', '감정적 안정성 우수', '생활 패턴 조화'],
          challenges: ['취미 영역 다양화 필요'],
          recommendation: '편안한 카페에서 2-3시간 대화를 추천합니다.'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await testMatch.save();
      
      console.log('✅ 매칭 데이터 생성 완료');
      console.log('💝 김세렌 ↔ 이매력 매칭 (75점)');
    }
  } catch (error) {
    console.error('❌ 초기 데이터 생성 실패:', error.message);
  }
};

// Import routes
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const valuesRoutes = require('../routes/values');
const matchingRoutes = require('../routes/matching');
const advancedMatchingRoutes = require('../routes/advancedMatching');
const privacyRoutes = require('../routes/privacy');
const chatRoutes = require('../routes/chat');
const profileRoutes = require('../routes/profile');
const demoRoutes = require('../routes/demo');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api', demoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/values', valuesRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/advanced-matching', advancedMatchingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/privacy', privacyRoutes);

// Serve static files (프론트엔드)
app.use(express.static(path.join(__dirname, '..'), {
  index: 'index.html'
}));

// API 라우트가 아닌 경우 index.html 서빙 (SPA 지원)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/uploads')) {
    next();
  } else {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate value',
      message: `${field} already exists`
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Serverless function handler
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};