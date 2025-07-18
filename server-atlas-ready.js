/**
 * CHARM_INYEON 서버 - MongoDB Atlas 준비 버전
 * Week 3 베타 테스트용 프로덕션 준비 서버
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const security = require('./middleware/security');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO 설정
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:5500'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// 환경 변수 로깅
console.log('🔧 서버 구성 정보:');
console.log(`📡 환경: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀 포트: ${PORT}`);
console.log(`🌐 허용 도메인: ${process.env.ALLOWED_ORIGINS || 'localhost'}`);

// Rate limiting 설정
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: {
    success: false,
    error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 보안 미들웨어
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));
app.use(compression());
app.use(limiter);

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:5500'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS 차단: ${origin}`);
      callback(new Error('CORS 정책에 의해 차단됨'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 추가 보안 미들웨어
app.use(security.checkBlockedIP);
app.use(security.detectSuspiciousActivity);
app.use(security.sanitizeInput);
app.use(security.preventInjection);

// 바디 파싱 미들웨어
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// 로깅 설정
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 정적 파일 서비스
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// 데이터베이스 연결 함수
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
          dbName: 'charm_inyeon'
        }
      });
      mongoUri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB 연결 성공: ${conn.connection.host}`);
    console.log(`📊 데이터베이스: ${conn.connection.name}`);
    
    // 연결 상태 모니터링
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB 연결 오류:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('📡 MongoDB 연결 끊김');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB 재연결 성공');
    });

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
      } catch (fallbackError) {
        console.error('❌ In-Memory MongoDB 연결도 실패:', fallbackError);
        process.exit(1);
      }
    }
  }
};

// 모델 import 및 초기 데이터 생성
const User = require('./models/User');
const ValuesAssessment = require('./models/ValuesAssessment');
const Match = require('./models/Match');

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
      console.log('👤 김세렌 (test-user-1)');
      console.log('👤 이매력 (test-user-2)');
      
      // 가치관 평가 데이터
      const serenAssessment = new ValuesAssessment({
        userId: serenUser._id,
        responses: {
          q1: 5, q2: 4, q3: 5, q4: 3, q5: 4,
          q6: 5, q7: 4, q8: 3, q9: 5, q10: 4,
          q11: 3, q12: 5, q13: 4, q14: 3, q15: 5,
          q16: 4, q17: 5, q18: 3, q19: 4, q20: 5
        },
        analysis: {
          personalityType: 'HARMONIOUS_SAGE',
          confidenceLevel: 0.88,
          summary: '조화로운 지혜로운 성격으로 안정적인 관계를 선호합니다.'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const maeryukAssessment = new ValuesAssessment({
        userId: maeryukUser._id,
        responses: {
          q1: 4, q2: 5, q3: 4, q4: 5, q5: 3,
          q6: 4, q7: 5, q8: 4, q9: 3, q10: 5,
          q11: 4, q12: 3, q13: 5, q14: 4, q15: 3,
          q16: 5, q17: 4, q18: 5, q19: 3, q20: 4
        },
        analysis: {
          personalityType: 'WARM_COMPANION',
          confidenceLevel: 0.92,
          summary: '따뜻한 동반자형으로 깊은 감정적 유대를 중요시합니다.'
        },
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

// 라우트 import
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const valuesRoutes = require('./routes/values');
const matchingRoutes = require('./routes/matching');
const advancedMatchingRoutes = require('./routes/advancedMatching');
const privacyRoutes = require('./routes/privacy');
const profileRoutes = require('./routes/profile');
const chatRoutes = require('./routes/chat');
const demoRoutes = require('./routes/demo');

// API 라우트 등록
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/values', valuesRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/advanced-matching', advancedMatchingRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/demo', demoRoutes);

// Swagger 문서
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CHARM_INYEON API',
      version: '1.0.0',
      description: 'AI 기반 4060세대 가치관 매칭 플랫폼 API',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://charm-inyeon.com/api' 
          : `http://localhost:${PORT}/api`,
        description: process.env.NODE_ENV === 'production' ? '프로덕션 서버' : '개발 서버',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Socket.IO 채팅 핸들러
io.on('connection', (socket) => {
  console.log('👤 사용자 연결됨:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`🏠 사용자 ${socket.id}가 방 ${roomId}에 입장`);
  });
  
  socket.on('send-message', (data) => {
    socket.to(data.roomId).emit('receive-message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('👋 사용자 연결 해제:', socket.id);
  });
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeHours = (uptime / 3600).toFixed(5);
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeHours} hours`,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    message: 'CHARM_INYEON API Server - Atlas Ready Edition',
    version: '1.0.0',
    status: 'running',
    docs: '/api-docs',
    health: '/health'
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 엔드포인트를 찾을 수 없습니다.',
    path: req.path
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err.stack);
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : '서버 오류'
  });
});

// 서버 시작
const startServer = async () => {
  try {
    await connectDB();
    await initializeTestData();
    
    server.listen(PORT, () => {
      console.log('\n🎊 CHARM_INYEON 서버 시작 완료! 🎊');
      console.log(`🌐 서버 주소: http://localhost:${PORT}`);
      console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
      console.log(`💚 상태 확인: http://localhost:${PORT}/health`);
      console.log(`🎯 체험 모드: http://localhost:${PORT}/api/demo/status`);
      console.log('\n✨ Week 3 베타 테스트 준비 완료! ✨');
      console.log('🚀 창우님의 "정말 대단해~" 감동을 실제 사용자에게 전파할 준비 완료!');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 우아한 종료
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM 신호 받음. 서버 종료 중...');
  server.close(() => {
    console.log('🔒 HTTP 서버 종료됨');
    mongoose.connection.close(false, () => {
      console.log('📡 MongoDB 연결 종료됨');
      if (mongoServer) {
        mongoServer.stop();
      }
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT 신호 받음. 서버 종료 중...');
  server.close(() => {
    console.log('🔒 HTTP 서버 종료됨');
    mongoose.connection.close(false, () => {
      console.log('📡 MongoDB 연결 종료됨');
      if (mongoServer) {
        mongoServer.stop();
      }
      process.exit(0);
    });
  });
});

// 서버 시작
startServer();

module.exports = app;