const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const security = require('./middleware/security');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
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

// Serve static files with security headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

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
          dbName: 'charm_inyeon'
        }
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
      console.log('👤 김세렌 (' + serenUser._id + ')');
      console.log('👤 이매력 (' + maeryukUser._id + ')');
      
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
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const valuesRoutes = require('./routes/values');
const matchingRoutes = require('./routes/matching');
const advancedMatchingRoutes = require('./routes/advancedMatching');
const privacyRoutes = require('./routes/privacy');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const demoRoutes = require('./routes/demo');

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
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CHARM_INYEON API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
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
      details: errors
    });
  }

  // JWT errors
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

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate value',
      message: `${field} already exists`
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize Chat Service with Socket.IO
const ChatService = require('./services/chatService');
const chatService = new ChatService(io);

// Make chat service available globally
app.set('chatService', chatService);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log('💝 CHARM_INYEON Backend Ready!');
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

startServer();

module.exports = { app, io };