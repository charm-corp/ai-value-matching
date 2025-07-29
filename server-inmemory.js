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

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
  origin: ['http://localhost:3000', 'http://localhost:8080'],
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
app.use(morgan('dev'));

// Serve static files
app.use('/uploads', express.static('uploads'));

// In-Memory Database connection
const connectInMemoryDB = async () => {
  try {
    console.log('🧠 Starting In-Memory MongoDB...');
    const mongod = await MongoMemoryServer.create({
      instance: {
        port: 27018, // 다른 포트 사용
        dbName: 'charm_inyeon_inmemory',
      },
    });

    const uri = mongod.getUri();
    console.log('📦 In-Memory MongoDB URI:', uri);

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);

    // 테스트 데이터 생성
    await createTestData();

    return mongod;
  } catch (error) {
    console.error('In-Memory database connection error:', error);
    process.exit(1);
  }
};

// 테스트 데이터 생성 함수
async function createTestData() {
  try {
    const User = require('./models/User');
    const ValuesAssessment = require('./models/ValuesAssessment');

    // 테스트 사용자들 생성
    const testUsers = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: '김세렌',
        email: 'serendipity@test.com',
        age: '51-55',
        gender: 'male',
        location: { city: '서울', district: '강남구' },
        bio: '운명적인 만남을 기다리는 사람입니다',
        isActive: true,
        isVerified: true,
        preferences: {
          privacy: { allowSearch: true, showAge: true, showLocation: true },
        },
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: '이매력',
        email: 'charm@test.com',
        age: '46-50',
        gender: 'female',
        location: { city: '서울', district: '서초구' },
        bio: '진정한 인연을 찾고 있습니다',
        isActive: true,
        isVerified: true,
        preferences: {
          privacy: { allowSearch: true, showAge: true, showLocation: true },
        },
      },
    ];

    // 기존 데이터 삭제 후 새로 생성
    await User.deleteMany({});
    await User.insertMany(testUsers);

    // 테스트 가치관 평가 생성
    const testAssessments = [
      {
        userId: testUsers[0]._id,
        answers: {
          q1: 'family',
          q2: 'stability',
          q3: 'logic',
          q4: 'harmony',
          q5: 'growth',
          q6: 'security',
          q7: 'tradition',
          q8: 'cooperation',
          q9: 'balance',
          q10: 'patience',
        },
        valueCategories: {
          family: 85,
          career: 70,
          personal_growth: 75,
          health: 80,
          financial_security: 85,
          social_connection: 70,
          spiritual: 60,
          adventure: 45,
        },
        isCompleted: true,
        completedAt: new Date(),
      },
      {
        userId: testUsers[1]._id,
        answers: {
          q1: 'growth',
          q2: 'connection',
          q3: 'emotion',
          q4: 'creativity',
          q5: 'family',
          q6: 'freedom',
          q7: 'innovation',
          q8: 'independence',
          q9: 'passion',
          q10: 'intuition',
        },
        valueCategories: {
          family: 80,
          career: 65,
          personal_growth: 90,
          health: 75,
          financial_security: 60,
          social_connection: 85,
          spiritual: 70,
          adventure: 55,
        },
        isCompleted: true,
        completedAt: new Date(),
      },
    ];

    await ValuesAssessment.deleteMany({});
    await ValuesAssessment.insertMany(testAssessments);

    console.log('✅ 테스트 데이터 생성 완료');
    console.log('👥 테스트 사용자: 김세렌, 이매력');
  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
  }
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const valuesRoutes = require('./routes/values');
const matchingRoutes = require('./routes/matching');
const advancedMatchingRoutes = require('./routes/advancedMatching');
const privacyRoutes = require('./routes/privacy');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const demoRoutes = require('./routes/demo'); // 🎯 창우님 체험용 라우트

// 🎯 체험용 API - 인증 없이 접근 가능 (창우님 전용) - 우선순위 최상위
app.use('/api', demoRoutes);

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
      title: 'CHARM_INYEON API (In-Memory)',
      version: '1.0.0',
      description: 'AI 기반 가치관 매칭 플랫폼 API - In-Memory Mode',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'In-Memory Development server',
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: 'In-Memory MongoDB Active',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'in-memory-development',
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

// Start server
const startServer = async () => {
  try {
    const mongod = await connectInMemoryDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log('💝 CHARM_INYEON Backend Ready! (In-Memory Mode)');
      console.log(`🧠 In-Memory MongoDB Active`);
      console.log('🎯 테스트용 API 엔드포인트:');
      console.log(`   - 사용자 조회: http://localhost:${PORT}/api/users/test-user-1`);
      console.log(
        `   - 매칭 테스트: http://localhost:${PORT}/api/matching/test-user-1/test-user-2`
      );
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        mongod.stop().then(() => {
          console.log('In-Memory MongoDB stopped');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        mongod.stop().then(() => {
          console.log('In-Memory MongoDB stopped');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
