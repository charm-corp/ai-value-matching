// Production-ready server for CHARM_INYEON Platform
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const security = require('./middleware/security');
const emailService = require('./services/emailService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO configuration for production
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  upgradeTimeout: 30000,
  pingTimeout: 60000,
  pingInterval: 25000,
});

const PORT = process.env.PORT || 3000;

// Enhanced Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
        scriptSrc: ["'self'"],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        childSrc: ["'none'"],
        frameSrc: ["'none'"],
        workerSrc: ["'none'"],
        manifestSrc: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Security middleware (order matters!)
app.use(security.checkBlockedIP);
app.use(security.detectSuspiciousActivity);

// Compression
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
  })
);

// Body parsing with security
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// Apply sanitization after body parsing
app.use(security.sanitizeInput);
app.use(security.preventInjection);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      skip: (req, res) => res.statusCode < 400, // Only log errors in production
    })
  );
}

// Serve static files with enhanced security
app.use(
  '/uploads',
  express.static('uploads', {
    setHeaders: (res, path) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('X-Frame-Options', 'DENY');
    },
    index: false, // Disable directory listing
    dotfiles: 'deny', // Deny access to dotfiles
  })
);

// Database connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const mongoUri = process.env.MONGODB_ATLAS_URI || process.env.MONGODB_URI;

      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ MongoDB Connected Successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

      // Database event listeners
      mongoose.connection.on('error', err => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      return;
    } catch (error) {
      retries++;
      console.error(
        `❌ Database connection attempt ${retries}/${maxRetries} failed:`,
        error.message
      );

      if (retries >= maxRetries) {
        console.error('💥 Failed to connect to database after maximum retries');
        throw error;
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      console.log(`⏳ Retrying database connection in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Health check endpoint with detailed status
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    services: {
      database: 'unknown',
      email: 'unknown',
      redis: 'unknown',
    },
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };

  // Database health check
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.services.database = 'healthy';
    } else {
      health.services.database = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.database = 'error';
    health.status = 'unhealthy';
  }

  // Email service health check
  try {
    const emailTest = await emailService.testConnection();
    health.services.email = emailTest.success ? 'healthy' : 'degraded';
  } catch (error) {
    health.services.email = 'error';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 206 : 503;

  res.status(statusCode).json({
    success: health.status !== 'unhealthy',
    data: health,
  });
});

// API Routes with middleware
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const valuesRoutes = require('./routes/values');
const matchingRoutes = require('./routes/matching');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');

// Apply general rate limiting to all API routes
app.use('/api', security.generalLimiter);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/values', valuesRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);

// Swagger documentation (only in development)
if (process.env.NODE_ENV === 'development') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerJsdoc = require('swagger-jsdoc');

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CHARM_INYEON API',
        version: '1.0.0',
        description: '4060세대를 위한 가치관 매칭 플랫폼 API',
        contact: {
          name: 'CHARM_INYEON Support',
          email: 'hello@charm-inyeon.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${PORT}/api`,
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

  const swaggerSpecs = swaggerJsdoc(swaggerOptions);
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );

  console.log(`📚 Swagger documentation available at http://localhost:${PORT}/api-docs`);
}

// Initialize Chat Service
const ChatService = require('./services/chatService');
const chatService = new ChatService(io);
app.set('chatService', chatService);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);

  // Rate limit error
  if (err.message && err.message.includes('Too many requests')) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
    });
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: '파일 크기가 너무 큽니다.',
    });
  }

  // MongoDB errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: '입력값 검증 실패',
      details: errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: `${field}이(가) 이미 존재합니다.`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: '유효하지 않은 토큰입니다.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: '토큰이 만료되었습니다.',
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
const gracefulShutdown = signal => {
  console.log(`\n📶 Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    console.log('🔌 HTTP server closed');

    mongoose.connection.close(false, () => {
      console.log('🗄️ MongoDB connection closed');

      io.close(() => {
        console.log('📡 Socket.IO server closed');
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  // Don't exit in production, just log
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Uncaught exception
process.on('uncaughtException', error => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Test email service
    try {
      await emailService.testConnection();
    } catch (emailError) {
      console.warn('⚠️ Email service not available:', emailError.message);
    }

    // Start listening
    server.listen(PORT, () => {
      console.log('\n🚀 CHARM_INYEON Production Server Started');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ Server started at: ${new Date().toISOString()}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);

      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Available endpoints:');
        console.log('   • GET  /health - Health check');
        console.log('   • POST /api/auth/register - User registration');
        console.log('   • POST /api/auth/login - User login');
        console.log('   • POST /api/auth/verify-email - Email verification');
        console.log('   • GET  /api/values/questions - Values questions');
        console.log('   • POST /api/values/assessment - Values submission');
        console.log('   • GET  /api/matching/my-matches - User matches');
        console.log('   • POST /api/profile/upload-image - Profile image upload');
        console.log('   • 📚 /api-docs - API documentation');
      }

      console.log('\n✨ Server ready to accept connections!\n');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
