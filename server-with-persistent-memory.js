// CHARM_INYEON 서버 - 영구 저장 In-Memory MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;
const path = require('path');
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

// 데이터 백업 디렉토리
const BACKUP_DIR = path.join(__dirname, 'data-backups');
const BACKUP_FILE = path.join(BACKUP_DIR, 'mongodb-backup.json');

// In-Memory MongoDB 서버 인스턴스
let mongoServer;

// 데이터 백업 시스템
class DataBackupSystem {
  constructor() {
    this.backupInterval = null;
    this.isBackupEnabled = true;
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(BACKUP_DIR);
    } catch (error) {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      console.log('📁 백업 디렉토리 생성됨:', BACKUP_DIR);
    }
  }

  async backupData() {
    if (!this.isBackupEnabled) return;

    try {
      // 데이터베이스 연결 상태 확인
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ 데이터베이스가 연결되지 않음. 백업 건너뜀.');
        return;
      }

      console.log('💾 데이터 백업 시작...');

      // 모든 컬렉션 데이터 수집
      const collections = await mongoose.connection.db.listCollections().toArray();
      const backupData = {
        timestamp: new Date().toISOString(),
        collections: {},
      };

      for (const collection of collections) {
        const collectionName = collection.name;
        const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        backupData.collections[collectionName] = data;
        console.log(`📋 ${collectionName}: ${data.length}개 문서 백업됨`);
      }

      // 백업 파일 저장
      await fs.writeFile(BACKUP_FILE, JSON.stringify(backupData, null, 2));
      console.log('✅ 데이터 백업 완료!');
    } catch (error) {
      console.error('❌ 백업 중 오류:', error);
    }
  }

  async restoreData() {
    try {
      // 데이터베이스 연결 상태 확인
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ 데이터베이스가 연결되지 않음. 복원 건너뜀.');
        return;
      }

      await fs.access(BACKUP_FILE);
      console.log('🔄 이전 데이터 복원 시작...');

      const backupContent = await fs.readFile(BACKUP_FILE, 'utf-8');
      const backupData = JSON.parse(backupContent);

      let restoredCount = 0;
      for (const [collectionName, documents] of Object.entries(backupData.collections)) {
        if (documents.length > 0) {
          // ObjectId 문자열을 실제 ObjectId로 변환
          const processedDocuments = documents.map(doc => {
            if (doc._id && typeof doc._id === 'string') {
              doc._id = new mongoose.Types.ObjectId(doc._id);
            }
            return doc;
          });

          await mongoose.connection.db.collection(collectionName).insertMany(processedDocuments);
          restoredCount += documents.length;
          console.log(`📋 ${collectionName}: ${documents.length}개 문서 복원됨`);
        }
      }

      console.log(`✅ 총 ${restoredCount}개 문서 복원 완료!`);
      console.log(`📅 백업 일시: ${backupData.timestamp}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📝 백업 파일이 없습니다. 새로운 데이터베이스로 시작합니다.');
      } else {
        console.error('❌ 복원 중 오류:', error);
      }
    }
  }

  startAutoBackup() {
    // 5분마다 자동 백업
    this.backupInterval = setInterval(() => {
      this.backupData();
    }, 5 * 60 * 1000);

    console.log('🔄 자동 백업 시작됨 (5분 간격)');
  }

  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('🛑 자동 백업 중지됨');
    }
  }
}

const backupSystem = new DataBackupSystem();

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

// Database connection with Persistent In-Memory MongoDB
const connectDB = async () => {
  try {
    console.log('🚀 영구 저장 In-Memory MongoDB 서버 시작 중...');

    // 백업 디렉토리 확인
    await backupSystem.ensureBackupDirectory();

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

    // 이전 데이터 복원
    await backupSystem.restoreData();

    // 자동 백업 시작
    backupSystem.startAutoBackup();

    // 연결 이벤트 리스너
    mongoose.connection.on('error', err => {
      console.error('MongoDB 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 연결이 끊어졌습니다');
    });

    console.log('✨ 영구 저장 시스템 활성화됨!');

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

// Manual backup endpoint
app.post('/api/backup', async (req, res) => {
  try {
    await backupSystem.backupData();
    res.json({
      success: true,
      message: '데이터 백업이 완료되었습니다.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '백업 중 오류가 발생했습니다.',
      details: error.message,
    });
  }
});

// Backup status endpoint
app.get('/api/backup/status', async (req, res) => {
  try {
    let backupInfo = null;
    try {
      const backupContent = await fs.readFile(BACKUP_FILE, 'utf-8');
      const backupData = JSON.parse(backupContent);
      backupInfo = {
        timestamp: backupData.timestamp,
        collections: Object.keys(backupData.collections).length,
        totalDocuments: Object.values(backupData.collections).reduce(
          (sum, docs) => sum + docs.length,
          0
        ),
      };
    } catch (error) {
      // 백업 파일이 없는 경우
    }

    res.json({
      success: true,
      backupEnabled: backupSystem.isBackupEnabled,
      lastBackup: backupInfo,
      backupDirectory: BACKUP_DIR,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Swagger documentation
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CHARM_INYEON API (영구 저장 In-Memory DB)',
      version: '1.0.0',
      description: 'AI 기반 가치관 매칭 플랫폼 API - 영구 저장 In-Memory MongoDB 사용',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server with Persistent In-Memory MongoDB',
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
    customSiteTitle: 'CHARM_INYEON API 문서 (영구 저장 DB)',
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
      type: 'Persistent In-Memory MongoDB',
      status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      persistent: true,
      backupEnabled: backupSystem.isBackupEnabled,
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CHARM_INYEON API Server (영구 저장 In-Memory MongoDB)',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    database: '영구 저장 In-Memory MongoDB 활성화',
    features: [
      '✅ 영구 데이터 저장 (자동 백업/복원)',
      '✅ 빠른 메모리 성능',
      '✅ 설치 불필요',
      '✅ 자동 백업 (5분 간격)',
      '✅ 서버 재시작 시 자동 복원',
      '✅ 수동 백업 API',
    ],
    endpoints: {
      backup: 'POST /api/backup',
      backupStatus: 'GET /api/backup/status',
    },
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
      console.log(`💾 백업 상태: http://localhost:${PORT}/api/backup/status`);
      console.log('💝 CHARM_INYEON 백엔드 준비 완료!');
      console.log(`🌟 환경: ${process.env.NODE_ENV || 'development'}`);
      console.log('🔄 영구 저장 In-Memory MongoDB로 최고의 성능과 안정성!');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 서버 종료 중...');

  // 종료 전 최종 백업
  await backupSystem.backupData();
  backupSystem.stopAutoBackup();

  server.close(async () => {
    console.log('🔌 HTTP 서버 종료됨');

    try {
      await mongoose.connection.close();
      console.log('📦 MongoDB 연결 종료됨');

      if (mongoServer) {
        await mongoServer.stop();
        console.log('🗄️ In-Memory MongoDB 서버 종료됨');
      }

      console.log('💾 데이터는 백업 파일에 안전하게 저장되었습니다!');
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

module.exports = { app, io, mongoServer, backupSystem };
