// CHARM_INYEON 서버 - In-Memory MongoDB 포함
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

// In-Memory MongoDB 서버 인스턴스
let mongoServer;

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

// CORS configuration - 개발 환경에서는 모든 origin 허용
const corsOptions = {
  origin: true, // 모든 origin 허용 (개발 환경용)
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

// Database connection with In-Memory MongoDB
const connectDB = async () => {
  try {
    console.log('🚀 In-Memory MongoDB 서버 시작 중...');

    // In-Memory MongoDB 서버 시작
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'charm_inyeon',
        port: 27017, // 고정 포트 사용
      },
    });

    const mongoUri = mongoServer.getUri();
    console.log(`📦 In-Memory MongoDB URI: ${mongoUri}`);

    // Mongoose 연결
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🎯 MongoDB 연결 성공: ${conn.connection.host}`);
    console.log(`💾 데이터베이스명: ${conn.connection.name}`);

    // 연결 이벤트 리스너
    mongoose.connection.on('error', err => {
      console.error('MongoDB 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 연결이 끊어졌습니다');
    });

    return conn;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
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
      title: 'CHARM_INYEON API (In-Memory DB)',
      version: '1.0.0',
      description: 'AI 기반 가치관 매칭 플랫폼 API - In-Memory MongoDB 사용',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server with In-Memory MongoDB',
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
    customSiteTitle: 'CHARM_INYEON API 문서 (In-Memory DB)',
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
      type: 'In-Memory MongoDB',
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CHARM_INYEON API Server (In-Memory MongoDB)',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    database: 'In-Memory MongoDB Active',
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
      console.log('💾 In-Memory MongoDB로 실제 데이터베이스 기능 제공!');
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
      console.log('📦 MongoDB 연결 종료됨');

      if (mongoServer) {
        await mongoServer.stop();
        console.log('🗄️ In-Memory MongoDB 서버 종료됨');
      }
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

module.exports = { app, io, mongoServer };
