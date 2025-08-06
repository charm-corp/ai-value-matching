const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const security = require('./middleware/security');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Microsoft Edge 브라우저 완전 최적화 - content.js:79 오류 완전 해결
if (process.env.NODE_ENV === 'development') {
  console.log('🛡️  개발 환경: Microsoft Edge 완전 최적화 (CSP/보안 헤더 모두 비활성화)');

  // helmet 자체를 아예 사용하지 않음 (Edge 확장과 충돌 방지)
  app.use((req, res, next) => {
    // 모든 보안 관련 헤더 완전 제거 - Edge 확장 프로그램과 충돌 방지
    const headersToRemove = [
      'Content-Security-Policy',
      'Content-Security-Policy-Report-Only',
      'X-Content-Security-Policy',
      'X-WebKit-CSP',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Embedder-Policy',
      'Cross-Origin-Opener-Policy',
      'Cross-Origin-Resource-Policy',
    ];

    headersToRemove.forEach(header => {
      res.removeHeader(header);
    });

    // Edge 브라우저 전용 최적화 헤더 설정
    res.set({
      'X-Powered-By': 'CHARM_INYEON/1.0',
      'X-CSP-Status': 'completely-disabled-for-edge',
      'X-Edge-Compatible': 'IE=edge,chrome=1',
      'X-UA-Compatible': 'IE=edge',
      'X-Content-Type-Options': 'nosniff', // 필수 보안만 유지
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    });
    next();
  });
} else {
  // 프로덕션 환경: 최소한의 helmet 적용
  console.log('🛡️  프로덕션 환경: 최소 보안 헤더 적용');
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          connectSrc: ["'self'", 'wss:', 'ws:', 'https:', 'http:'],
          fontSrc: ["'self'", 'data:', 'https:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", 'blob:', 'data:'],
          frameSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );
}
app.use(compression());
app.use(limiter);

// Microsoft Edge 브라우저 캐시 + 확장 프로그램 충돌 완전 방지
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    // Edge 브라우저 완전 최적화: 캐시 + 확장 충돌 방지
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store',
      'Last-Modified': new Date().toUTCString(),
      ETag: `"${Date.now()}"`, // 매번 다른 ETag로 강제 갱신

      // Edge 확장 프로그램 호환성 헤더
      'X-CSP-Disabled': 'true',
      'X-Edge-Extension-Safe': 'true',
      'X-Content-Security-Policy': undefined, // 명시적 undefined
      'Content-Security-Policy': undefined, // 명시적 undefined

      // Edge WebView2 엔진 최적화
      'X-Edge-Compatible': 'development-mode',
      'X-Frame-Options': 'ALLOWALL', // Edge 내부 iframe 허용
      'X-Permitted-Cross-Domain-Policies': 'all',
    });

    // Edge 확장과 충돌하는 헤더들 강제 삭제
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
  }
  next();
});

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
  optionsSuccessStatus: 200,
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

// Serve static files with security headers
app.use(
  '/uploads',
  express.static('uploads', {
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    },
  })
);

// Microsoft Edge 브라우저 호환성을 위한 content.js 정적 파일 서빙
app.use(
  '/content.js',
  express.static('content.js', {
    setHeaders: res => {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('X-Edge-Compatible', 'content-script-provided');
    },
  })
);

// 기본 정적 파일 서빙 (CSS, JS 등)
app.use(
  express.static('.', {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// Database connection with In-Memory fallback
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

const connectDB = async () => {
  try {
    let mongoUri;

    // Atlas 연결 우선 시도
    if (process.env.MONGODB_ATLAS_URI && process.env.NODE_ENV === 'production') {
      console.log('🌍 MongoDB Atlas 연결 시도...');
      mongoUri = process.env.MONGODB_ATLAS_URI;
    } else if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost')) {
      console.log('💻 로컬 MongoDB 연결 시도...');
      mongoUri = process.env.MONGODB_URI;
    } else {
      console.log('🧠 In-Memory MongoDB 시작...');
      mongoServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'charm_inyeon',
        },
      });
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB 연결 성공: ${conn.connection.host}`);
    console.log(`📊 데이터베이스: ${conn.connection.name}`);

    // 초기 데이터 생성
    await initializeTestData();
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);

    // Atlas 실패 시 In-Memory로 폴백
    if (!mongoServer) {
      console.log('🔄 In-Memory MongoDB로 폴백...');
      try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log('✅ In-Memory MongoDB 연결 성공');
        await initializeTestData();
      } catch (fallbackError) {
        console.error('❌ In-Memory MongoDB 연결도 실패:', fallbackError);
        process.exit(1);
      }
    }
  }
};

// 모델 import
const User = require('./models/User');
const ValuesAssessment = require('./models/ValuesAssessment');
const Match = require('./models/Match');
const bcrypt = require('bcryptjs');

// 초기 데이터 생성 함수
const initializeTestData = async () => {
  try {
    const userCount = await User.countDocuments();

    console.log(`📊 현재 사용자 수: ${userCount}`);

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
          district: '강남구',
        },
        interests: ['문화생활', '독서', '여행', '음악감상'],
        profileImage: 'male-classic.svg',
        isActive: true,
        hasProfileImage: true,
        profileCompleteness: 85,
        createdAt: new Date(),
        updatedAt: new Date(),
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
          district: '서초구',
        },
        interests: ['요리', '영화감상', '산책', '카페투어'],
        profileImage: 'female-friendly.svg',
        isActive: true,
        hasProfileImage: true,
        profileCompleteness: 92,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await serenUser.save();
      await maeryukUser.save();

      console.log('✅ 테스트 사용자 생성 완료');
      console.log('👤 김세렌 (' + serenUser._id + ')');
      console.log('👤 이매력 (' + maeryukUser._id + ')');

      // 가치관 평가 데이터
      const serenAssessmentData = new Map();
      serenAssessmentData.set('q1', {
        questionId: 1,
        value: '5',
        text: '매우 동의',
        category: 'values',
      });
      serenAssessmentData.set('q2', {
        questionId: 2,
        value: '4',
        text: '동의',
        category: 'values',
      });
      serenAssessmentData.set('q3', {
        questionId: 3,
        value: '5',
        text: '매우 동의',
        category: 'personality',
      });
      serenAssessmentData.set('q4', {
        questionId: 4,
        value: '3',
        text: '보통',
        category: 'personality',
      });
      serenAssessmentData.set('q5', {
        questionId: 5,
        value: '4',
        text: '동의',
        category: 'lifestyle',
      });

      const serenAssessment = new ValuesAssessment({
        userId: serenUser._id,
        answers: serenAssessmentData,
        analysis: {
          personalityType: 'HARMONIOUS_SAGE',
          confidenceLevel: 0.88,
          summary: '조화로운 지혜로운 성격으로 안정적인 관계를 선호합니다.',
        },
        isCompleted: true,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const maeryukAssessmentData = new Map();
      maeryukAssessmentData.set('q1', {
        questionId: 1,
        value: '4',
        text: '동의',
        category: 'values',
      });
      maeryukAssessmentData.set('q2', {
        questionId: 2,
        value: '5',
        text: '매우 동의',
        category: 'values',
      });
      maeryukAssessmentData.set('q3', {
        questionId: 3,
        value: '4',
        text: '동의',
        category: 'personality',
      });
      maeryukAssessmentData.set('q4', {
        questionId: 4,
        value: '5',
        text: '매우 동의',
        category: 'personality',
      });
      maeryukAssessmentData.set('q5', {
        questionId: 5,
        value: '3',
        text: '보통',
        category: 'lifestyle',
      });

      const maeryukAssessment = new ValuesAssessment({
        userId: maeryukUser._id,
        answers: maeryukAssessmentData,
        analysis: {
          personalityType: 'WARM_COMPANION',
          confidenceLevel: 0.92,
          summary: '따뜻한 동반자형으로 깊은 감정적 유대를 중요시합니다.',
        },
        isCompleted: true,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await serenAssessment.save();
      await maeryukAssessment.save();

      console.log('✅ 가치관 평가 데이터 생성 완료');

      // 매칭 데이터
      const testMatch = new Match({
        user1: serenUser._id,
        user2: maeryukUser._id,
        compatibilityScore: 75,
        compatibilityBreakdown: {
          valuesAlignment: 82,
          personalityCompatibility: 77,
          lifestyleMatch: 74,
          interestsAlignment: 68,
          locationCompatibility: 90,
          ageCompatibility: 85,
          communicationStyle: 80,
        },
        status: 'pending',
        matchAlgorithm: 'advanced_ai_v2',
        confidence: 88,
        aiInsights: {
          strengths: ['가치관 일치도 높음', '감정적 안정성 우수', '생활 패턴 조화'],
          challenges: ['취미 영역 다양화 필요'],
          recommendation: '편안한 카페에서 2-3시간 대화를 추천합니다.',
          compatibilityFactors: [
            { factor: '가치관 일치', score: 82, importance: 'high' },
            { factor: '성격 호환성', score: 77, importance: 'high' },
            { factor: '생활 패턴', score: 74, importance: 'medium' },
          ],
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후 만료
      });

      await testMatch.save();

      console.log('✅ 매칭 데이터 생성 완료');
      console.log('💝 김세렌 ↔ 이매력 매칭 (75점)');
    }
  } catch (error) {
    console.error('❌ 초기 데이터 생성 실패:', error.message);
  }
};

// === RLS + Backend System Integration ===\nconst { integrateRLSSystem, createCompatibilityMiddleware } = require('./middleware/rlsIntegration');\n\n// 호환성 미들웨어 추가 (기존 인증과 RLS가 공존)\napp.use(createCompatibilityMiddleware());\n\n// RLS 시스템 점진적 초기화 (비동기 처리)\nsetImmediate(async () => {\n  try {\n    const success = await integrateRLSSystem(app);\n    if (success) {\n      console.log('✅ RLS + Backend System successfully integrated');\n    } else {\n      console.warn('⚠️ RLS system integration had issues, but server continues');\n    }\n  } catch (error) {\n    console.error('❌ RLS system integration failed, but server continues:', error.message);\n  }\n});\n\n// Import routes\nconst authRoutes = require('./routes/auth');\nconst userRoutes = require('./routes/users');\nconst valuesRoutes = require('./routes/values');\nconst matchingRoutes = require('./routes/matching');\nconst advancedMatchingRoutes = require('./routes/advancedMatching');\nconst privacyRoutes = require('./routes/privacy');\nconst chatRoutes = require('./routes/chat');\nconst profileRoutes = require('./routes/profile');\nconst demoRoutes = require('./routes/demo');

// API routes
// 창우님 체험용 Demo 라우트 (인증 불필요) - 다른 라우트보다 먼저 등록
app.use('/api', demoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/values', valuesRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/advanced-matching', advancedMatchingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/privacy', privacyRoutes);

// Swagger documentation
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CHARM_INYEON API',
      version: '1.0.0',
      description: 'AI 기반 가치관 매칭 플랫폼 API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint with accurate uptime tracking
let serverStartTime = Date.now();

app.get('/health', (req, res) => {
  const actualUptime = (Date.now() - serverStartTime) / 1000; // seconds
  const uptimeHours = (actualUptime / 3600).toFixed(5);

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeHours} hours`,
    uptimeSeconds: actualUptime,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Serve static files (프론트엔드)
app.use(
  express.static(__dirname, {
    index: 'index.html',
  })
);

// API 라우트가 아닌 경우 index.html 서빙 (SPA 지원)
app.get('*', (req, res, next) => {
  // API 경로가 아닌 경우만 index.html 서빙
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/health') ||
    req.path.startsWith('/uploads')
  ) {
    next(); // API 라우트는 다음 미들웨어로 전달
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate value',
      message: `${field} already exists`,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize Chat Service with Socket.IO
const ChatService = require('./services/chatService');
const chatService = new ChatService(io);

// Make chat service available globally
app.set('chatService', chatService);

// Start server with improved error handling
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log('💝 CHARM_INYEON Backend Ready!');
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', error => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ 포트 ${PORT}이(가) 이미 사용 중입니다.`);
        console.log('🔄 다른 포트로 재시도 중...');

        // Try alternative ports
        const altPorts = [3001, 3002, 8000, 8080];
        for (const altPort of altPorts) {
          try {
            server.listen(altPort, () => {
              console.log(`✅ 서버가 포트 ${altPort}에서 시작되었습니다.`);
              console.log(`📚 API Documentation: http://localhost:${altPort}/api-docs`);
            });
            break;
          } catch (altError) {
            console.log(`포트 ${altPort} 시도 실패, 다음 포트 시도 중...`);
          }
        }
      } else {
        console.error('❌ 서버 오류:', error);
      }
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    if (error.code === 'EADDRINUSE') {
      console.log('💡 해결방법: 다른 터미널에서 실행 중인 서버를 종료하거나');
      console.log('   다음 명령어로 프로세스를 종료하세요: pkill -f "node.*server"');
    }
    setTimeout(() => process.exit(1), 2000);
  }
};

// Enhanced graceful shutdown
const gracefulShutdown = signal => {
  console.log(`\n📴 ${signal} received. Shutting down gracefully...`);

  // Set a timeout to force exit if graceful shutdown takes too long
  const forceExitTimer = setTimeout(() => {
    console.error('❌ 강제 종료: graceful shutdown이 너무 오래 걸립니다');
    process.exit(1);
  }, 30000); // 30초 타임아웃

  server.close(err => {
    if (err) {
      console.error('❌ 서버 종료 중 오류:', err);
      process.exit(1);
    }

    console.log('✅ HTTP Server closed');

    // Close MongoDB connection
    mongoose.connection.close(false, err => {
      if (err) {
        console.error('❌ MongoDB 연결 종료 중 오류:', err);
        process.exit(1);
      }

      console.log('✅ MongoDB connection closed');

      // Close in-memory MongoDB if it exists
      if (mongoServer) {
        mongoServer
          .stop()
          .then(() => {
            console.log('✅ In-Memory MongoDB stopped');
            clearTimeout(forceExitTimer);
            console.log('🎉 Graceful shutdown completed');
            process.exit(0);
          })
          .catch(err => {
            console.error('❌ In-Memory MongoDB 종료 오류:', err);
            clearTimeout(forceExitTimer);
            process.exit(1);
          });
      } else {
        clearTimeout(forceExitTimer);
        console.log('🎉 Graceful shutdown completed');
        process.exit(0);
      }
    });
  });
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

startServer();

module.exports = { app, io };
