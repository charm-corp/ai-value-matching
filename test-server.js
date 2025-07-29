const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 - 모든 오리진 허용 (테스트용)
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트들
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: 'mongodb',
      status: 'simulated', // 테스트용 시뮬레이션
    },
    timestamp: new Date().toISOString(),
  });
});

// Phase 3 매칭 엔진 시뮬레이션 API
app.post('/api/matching/intelligent-compatibility', (req, res) => {
  // 시뮬레이션된 매칭 결과
  const simulatedResult = {
    success: true,
    message: 'Phase 3 지능형 호환성 분석이 완료되었습니다.',
    data: {
      overallScore: 104,
      compatibility: {
        breakdown: {
          coreValues: 88,
          personalityFit: 92,
          lifestyleCompat: 85,
          communicationSync: 90,
          growthPotential: 87,
        },
      },
      matchingReasons: [
        {
          title: '가족과의 유대',
          description:
            '가족과의 유대를 매우 중시하시는 공통점이 있어, 따뜻하고 안정적인 관계를 만들어갈 수 있을 것 같습니다',
          importance: 95,
        },
        {
          title: '건강한 삶',
          description: '건강한 삶을 중시하는 마음이 통해, 함께 건강한 생활을 만들어갈 수 있습니다',
          importance: 92,
        },
        {
          title: '친화성과 배려심',
          description:
            '두 분 모두 다른 사람을 배려하고 이해하려는 마음이 크시어, 조화로운 관계를 만들어갈 수 있습니다',
          importance: 89,
        },
        {
          title: '안정과 평화',
          description:
            '안정과 평화를 추구하는 가치관이 일치하여, 서로에게 든든한 지지대가 될 수 있습니다',
          importance: 86,
        },
        {
          title: '소통 스타일',
          description:
            '서로 다른 의견을 존중하며 건설적인 대화를 나눌 수 있는 소통 능력을 가지고 계십니다',
          importance: 83,
        },
      ],
      meetingGuide: {
        conversationStarters: [
          '최근에 가장 기억에 남는 여행지가 어디인가요?',
          '가족과 함께하는 시간 중 가장 소중한 순간은 언제인가요?',
          '건강 관리를 위해 평소에 어떤 활동을 즐기시나요?',
        ],
        recommendedActivities: [
          '조용한 카페에서 차 마시며 대화하기',
          '공원에서 산책하며 자연스럽게 이야기 나누기',
          '문화센터나 박물관 함께 관람하기',
        ],
      },
      relationshipRoadmap: {
        shortTerm: '서로의 일상과 관심사 공유하며 편안한 관계 형성',
        midTerm: '공통 관심사를 기반으로 한 활동 참여 및 깊은 대화',
        longTerm: '서로의 가치관을 존중하며 안정적인 동반자 관계 구축',
      },
      challengesAndSolutions: {
        challenges: ['초기 대화 주제 찾기의 어려움', '서로 다른 생활 패턴 조율'],
        solutions: [
          '공통 관심사부터 천천히 시작하기',
          '서로의 시간을 존중하며 점진적으로 만남 빈도 조정',
        ],
      },
      confidenceLevel: 94,
      analyzedAt: new Date(),
      version: '3.0',
    },
  };

  // 시뮬레이션 지연 시간 (실제 분석 시간 모방)
  setTimeout(() => {
    res.json(simulatedResult);
  }, 1500);
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    availableEndpoints: ['GET /health', 'POST /api/matching/intelligent-compatibility'],
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 CHARM_INYEON 테스트 서버 실행 중: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(
    `🎯 Phase 3 매칭 API: http://localhost:${PORT}/api/matching/intelligent-compatibility`
  );
  console.log(`💻 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 시작 시간: ${new Date().toLocaleString()}`);
});
