// 간단한 백엔드 서버 테스트 (MongoDB 없이)
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors());
app.use(express.json());

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CHARM_INYEON API (테스트 모드)',
      version: '1.0.0',
      description: 'AI 기반 가치관 매칭 플랫폼 API - 테스트 서버 (DB 연결 없음)',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Test Development server',
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
  apis: [__filename], // 현재 파일에서 API 문서 추출
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'CHARM_INYEON API 문서 (테스트 모드)'
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: 서버 헬스 체크
 *     description: 서버 상태와 기본 정보를 확인합니다
 *     tags: [서버 상태]
 *     responses:
 *       200:
 *         description: 서버 정상 작동
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: 서버 가동 시간(초)
 *                 environment:
 *                   type: string
 *                   example: development
 *                 message:
 *                   type: string
 */
// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    message: '백엔드 서버가 정상 작동 중입니다 (DB 연결 없음)'
  });
});

// 서버 정보
app.get('/', (req, res) => {
  res.json({
    message: 'CHARM_INYEON API Server (테스트 모드)',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    testMode: true
  });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자 계정을 생성합니다 (테스트 모드)
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: 테스트 사용자
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원가입 성공 (테스트 모드)
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *       400:
 *         description: 입력 데이터 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 */
// 테스트용 인증 API
app.post('/api/auth/register', (req, res) => {
  console.log('회원가입 요청:', req.body);
  
  // 간단한 검증
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: ['이메일, 비밀번호, 이름은 필수입니다']
    });
  }
  
  // 가짜 응답
  res.status(201).json({
    success: true,
    message: '회원가입 성공 (테스트 모드)',
    user: {
      id: `test_${Date.now()}`,
      email: email,
      name: name,
      createdAt: new Date().toISOString()
    },
    token: `test_token_${Date.now()}`
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('로그인 요청:', req.body);
  
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing credentials'
    });
  }
  
  // 가짜 로그인 성공
  res.json({
    success: true,
    message: '로그인 성공 (테스트 모드)',
    user: {
      id: 'test_user_123',
      email: email,
      name: '테스트 사용자'
    },
    token: `login_token_${Date.now()}`
  });
});

// 테스트용 가치관 설문 API
app.get('/api/values/questions', (req, res) => {
  console.log('가치관 설문 질문 요청');
  
  res.json({
    success: true,
    questions: [
      {
        id: 1,
        text: '인생에서 가장 중요하게 생각하는 가치는 무엇인가요?',
        category: 'life_values',
        options: [
          { value: 'family', text: '가족과의 시간' },
          { value: 'growth', text: '성장과 도전' },
          { value: 'stability', text: '안정과 평화' },
          { value: 'freedom', text: '자유와 독립' }
        ]
      },
      {
        id: 2,
        text: '여가 시간을 어떻게 보내는 것을 선호하시나요?',
        category: 'lifestyle',
        options: [
          { value: 'quiet', text: '조용한 곳에서 독서나 명상' },
          { value: 'social', text: '친구들과 함께 활동' },
          { value: 'active', text: '운동이나 야외활동' },
          { value: 'creative', text: '예술이나 창작활동' }
        ]
      }
    ]
  });
});

app.post('/api/values/submit', (req, res) => {
  console.log('가치관 설문 제출:', req.body);
  
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({
      error: 'Invalid answers format'
    });
  }
  
  // 가짜 분석 결과
  res.json({
    success: true,
    message: '설문 제출 성공 (테스트 모드)',
    assessmentId: `assessment_${Date.now()}`,
    completedAt: new Date().toISOString(),
    results: {
      scores: {
        family: 85,
        stability: 78,
        growth: 72,
        social: 65
      },
      personality: '가족 중심적이며 안정을 추구하는 성향'
    }
  });
});

/**
 * @swagger
 * /api/matching/find:
 *   post:
 *     summary: 매칭 검색
 *     description: 사용자 선호도에 따라 매칭 대상을 찾습니다
 *     tags: [매칭]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   ageRange:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [40, 60]
 *                   location:
 *                     type: string
 *                     example: 서울
 *     responses:
 *       200:
 *         description: 매칭 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 algorithm:
 *                   type: string
 *                 processingTime:
 *                   type: number
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       age:
 *                         type: string
 *                       location:
 *                         type: string
 *                       compatibility:
 *                         type: number
 *                       commonInterests:
 *                         type: array
 *                         items:
 *                           type: string
 */
// 테스트용 매칭 API
app.post('/api/matching/find', (req, res) => {
  console.log('매칭 요청:', req.body);
  
  // 가짜 매칭 결과
  res.json({
    success: true,
    message: '매칭 완료 (테스트 모드)',
    algorithm: 'AI 기반 호환성 분석',
    processingTime: 157,
    matches: [
      {
        id: 'match_001',
        name: '김철수',
        age: '54세',
        location: '서울 강남구',
        compatibility: 92,
        commonInterests: ['독서', '영화감상', '산책']
      },
      {
        id: 'match_002', 
        name: '이영희',
        age: '48세',
        location: '서울 서초구',
        compatibility: 88,
        commonInterests: ['요리', '여행', '음악감상']
      }
    ]
  });
});

/**
 * @swagger
 * /api/matching/generate:
 *   post:
 *     summary: 매칭 생성
 *     description: 사용자의 프로필을 기반으로 새로운 매칭을 생성합니다
 *     tags: [매칭]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 매칭 생성 완료
 */
app.post('/api/matching/generate', (req, res) => {
  console.log('매칭 생성 요청');
  
  res.json({
    success: true,
    message: '새로운 매칭이 생성되었습니다 (테스트 모드)',
    data: {
      matchesGenerated: 5,
      processingTime: 234,
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

/**
 * @swagger
 * /api/matching/my-matches:
 *   get:
 *     summary: 내 매칭 결과 조회
 *     description: 현재 사용자의 매칭 결과를 조회합니다
 *     tags: [매칭]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 매칭 상태 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 결과 수
 *     responses:
 *       200:
 *         description: 매칭 결과 목록
 */
app.get('/api/matching/my-matches', (req, res) => {
  console.log('내 매칭 조회:', req.query);
  
  res.json({
    success: true,
    data: {
      matches: [
        {
          id: 'match_001',
          userId: 'user_456',
          name: '김철수',
          age: 54,
          location: '서울 강남구',
          compatibility: 92,
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'match_002',
          userId: 'user_789',
          name: '이영희',
          age: 48,
          location: '서울 서초구',
          compatibility: 88,
          status: 'liked',
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        total: 15,
        totalPages: 1
      }
    }
  });
});

/**
 * @swagger
 * /api/matching/stats:
 *   get:
 *     summary: 매칭 통계
 *     description: 사용자의 매칭 통계 정보를 조회합니다
 *     tags: [매칭]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 매칭 통계 정보
 */
app.get('/api/matching/stats', (req, res) => {
  console.log('매칭 통계 요청');
  
  res.json({
    success: true,
    data: {
      totalMatches: 15,
      pendingMatches: 8,
      likedMatches: 4,
      mutualMatches: 2,
      averageCompatibility: 85.3,
      lastMatchedAt: new Date().toISOString(),
      matchingEnabled: true
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 테스트 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📋 서버 정보: http://localhost:${PORT}/`);
  console.log(`🏥 헬스 체크: http://localhost:${PORT}/health`);
  console.log(`🧪 테스트 페이지에서 API를 테스트해보세요!`);
  console.log('💡 이 서버는 테스트용이며 실제 데이터베이스에 연결되지 않습니다.');
});

module.exports = app;