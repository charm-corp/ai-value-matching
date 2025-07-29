// CHARM_INYEON 서버 - MongoDB Atlas 클라우드 연결
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
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);
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

// Serve static files
app.use(
  '/uploads',
  express.static('uploads', {
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    },
  })
);

// Database connection with MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('🚀 MongoDB Atlas 클라우드 연결 시작 중...');

    // MongoDB Atlas 연결 문자열 가져오기
    const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        'MongoDB Atlas URI가 환경 변수에 설정되지 않았습니다. MONGODB_ATLAS_URI 또는 MONGODB_URI를 확인해주세요.'
      );
    }

    console.log(`📦 MongoDB Atlas 연결 중...`);

    // Mongoose 연결 (Atlas 최적화 옵션 포함)
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5초 타임아웃
      socketTimeoutMS: 45000, // 45초 소켓 타임아웃
      maxPoolSize: 10, // 최대 연결 풀 크기
      bufferMaxEntries: 0, // 버퍼링 비활성화
      connectTimeoutMS: 10000, // 10초 연결 타임아웃
    });

    console.log(`🎯 MongoDB Atlas 연결 성공!`);
    console.log(`🌐 호스트: ${conn.connection.host}`);
    console.log(`💾 데이터베이스명: ${conn.connection.name}`);
    console.log(`✨ 영구 저장 클라우드 데이터베이스 활성화!`);

    // 연결 이벤트 리스너
    mongoose.connection.on('error', err => {
      console.error('MongoDB Atlas 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB Atlas 연결이 끊어졌습니다');
      console.log('🔄 자동 재연결 시도 중...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🎉 MongoDB Atlas 재연결 성공!');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Atlas 연결 실패:', error);

    // 연결 실패 시 상세 정보 제공
    if (error.message.includes('authentication')) {
      console.error('🔐 인증 실패: 사용자명과 비밀번호를 확인해주세요');
    } else if (error.message.includes('network')) {
      console.error('🌐 네트워크 오류: 인터넷 연결을 확인해주세요');
    } else if (error.message.includes('timeout')) {
      console.error('⏱️ 연결 타임아웃: MongoDB Atlas 클러스터 상태를 확인해주세요');
    }

    process.exit(1);
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

// API routes
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
      title: 'CHARM_INYEON API (MongoDB Atlas)',
      version: '1.0.0',
      description: 'AI 기반 가치관 매칭 플랫폼 API - MongoDB Atlas 클라우드 사용',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server with MongoDB Atlas Cloud',
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
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CHARM_INYEON API 문서 (MongoDB Atlas)',
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: 'MongoDB Atlas (Cloud)',
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      permanent: true, // 영구 저장 표시
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CHARM_INYEON API Server (MongoDB Atlas Cloud)',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    database: 'MongoDB Atlas Cloud - 영구 저장 활성화',
    features: [
      '✅ 영구 데이터 저장',
      '✅ 클라우드 데이터베이스',
      '✅ 자동 백업',
      '✅ 글로벌 액세스',
      '✅ 고가용성',
    ],
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: errors,
    });
  }

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

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate value',
      message: `${field} already exists`,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Initialize Chat Service with Socket.IO
const ChatService = require('./services/chatService');
const chatService = new ChatService(io);
app.set('chatService', chatService);

// Start server
const startServer = async () => {
  try {
    console.log('🚀 CHARM_INYEON 서버 시작 중...');

    // 데이터베이스 연결
    await connectDB();

    // 서버 시작
    server.listen(PORT, () => {
      console.log(`🎉 서버가 포트 ${PORT}에서 실행 중입니다!`);
      console.log(`📚 API 문서: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 헬스 체크: http://localhost:${PORT}/health`);
      console.log('💝 CHARM_INYEON 백엔드 준비 완료!');
      console.log(`🌟 환경: ${process.env.NODE_ENV || 'development'}`);
      console.log('☁️ MongoDB Atlas 클라우드로 영구 저장 활성화!');
      console.log('🔄 서버 재시작 후에도 데이터가 유지됩니다!');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 서버 종료 중...');

  server.close(async () => {
    console.log('🔌 HTTP 서버 종료됨');

    try {
      await mongoose.connection.close();
      console.log('📦 MongoDB Atlas 연결 종료됨');
      console.log('☁️ 클라우드 데이터는 안전하게 보관됩니다!');
    } catch (error) {
      console.error('종료 중 오류:', error);
    }

    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 예상치 못한 오류 처리
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

startServer();

module.exports = { app, io };
