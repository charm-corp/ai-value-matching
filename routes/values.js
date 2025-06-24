const express = require('express');
const ValuesAssessment = require('../models/ValuesAssessment');
const { authenticate, requireVerified } = require('../middleware/auth');
const { validateValuesAssessment, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// 가치관 설문 질문 데이터
const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    text: "인생에서 가장 중요하게 생각하는 가치는 무엇인가요?",
    category: "life_values",
    options: [
      { value: "family", text: "가족과의 시간", weights: { family: 5, stability: 3, relationships: 4 } },
      { value: "growth", text: "성장과 도전", weights: { growth: 5, adventure: 3, career: 4 } },
      { value: "stability", text: "안정과 평화", weights: { security: 5, stability: 4, health: 3 } },
      { value: "freedom", text: "자유와 독립", weights: { freedom: 5, adventure: 4, creativity: 3 } }
    ]
  },
  {
    id: 2,
    text: "여가 시간을 어떻게 보내는 것을 선호하시나요?",
    category: "lifestyle",
    options: [
      { value: "quiet", text: "조용한 곳에서 독서나 명상", weights: { spirituality: 4, growth: 3, health: 3 } },
      { value: "social", text: "친구들과 함께 활동", weights: { relationships: 5, extroversion: 4, social: 5 } },
      { value: "active", text: "운동이나 야외활동", weights: { health: 5, adventure: 4, active: 5 } },
      { value: "creative", text: "예술이나 창작활동", weights: { creativity: 5, growth: 3, artistic: 4 } }
    ]
  },
  {
    id: 3,
    text: "어려운 결정을 내릴 때 주로 무엇을 고려하시나요?",
    category: "decision_making",
    options: [
      { value: "logic", text: "논리적 분석", weights: { analytical: 5, conscientiousness: 4 } },
      { value: "emotion", text: "감정과 직감", weights: { emotional: 5, empathy: 4, agreeableness: 3 } },
      { value: "others", text: "주변 사람들의 의견", weights: { relationships: 4, agreeableness: 5 } },
      { value: "experience", text: "과거 경험", weights: { conscientiousness: 4, stability: 3 } }
    ]
  },
  {
    id: 4,
    text: "이상적인 주말을 어떻게 보내고 싶으신가요?",
    category: "lifestyle",
    options: [
      { value: "home", text: "집에서 편안하게", weights: { security: 4, stability: 5, introversion: 3 } },
      { value: "adventure", text: "새로운 곳 탐험", weights: { adventure: 5, openness: 4, extroversion: 3 } },
      { value: "friends", text: "친구들과 모임", weights: { relationships: 5, extroversion: 4, agreeableness: 3 } },
      { value: "family", text: "가족과 함께", weights: { family: 5, relationships: 4, stability: 3 } }
    ]
  },
  {
    id: 5,
    text: "갈등 상황에서 어떻게 대처하시나요?",
    category: "communication",
    options: [
      { value: "direct", text: "직접적으로 대화", weights: { extroversion: 4, conscientiousness: 3 } },
      { value: "avoid", text: "시간을 두고 피함", weights: { neuroticism: 3, introversion: 4 } },
      { value: "mediate", text: "중재자를 통해", weights: { agreeableness: 5, relationships: 4 } },
      { value: "compromise", text: "타협점을 찾음", weights: { agreeableness: 4, conscientiousness: 4 } }
    ]
  },
  {
    id: 6,
    text: "미래에 대한 계획을 세울 때 어떤 방식을 선호하시나요?",
    category: "planning",
    options: [
      { value: "detailed", text: "세부적인 계획", weights: { conscientiousness: 5, security: 4 } },
      { value: "flexible", text: "유연한 방향성", weights: { openness: 4, adaptability: 5 } },
      { value: "goals", text: "목표 중심", weights: { career: 5, growth: 4, conscientiousness: 3 } },
      { value: "flow", text: "자연스럽게", weights: { openness: 5, spirituality: 3 } }
    ]
  },
  {
    id: 7,
    text: "돈에 대한 당신의 가치관은?",
    category: "financial",
    options: [
      { value: "security", text: "안정과 저축이 중요", weights: { security: 5, conscientiousness: 4, stability: 4 } },
      { value: "experience", text: "경험에 투자", weights: { adventure: 4, growth: 5, openness: 4 } },
      { value: "sharing", text: "나눔과 기부", weights: { agreeableness: 5, spirituality: 4, relationships: 3 } },
      { value: "growth", text: "투자와 성장", weights: { career: 5, growth: 4, openness: 3 } }
    ]
  },
  {
    id: 8,
    text: "건강관리에 대한 접근 방식은?",
    category: "health",
    options: [
      { value: "active", text: "적극적인 운동", weights: { health: 5, conscientiousness: 4, active: 5 } },
      { value: "balanced", text: "균형잡힌 생활", weights: { health: 4, conscientiousness: 3, stability: 4 } },
      { value: "natural", text: "자연스러운 관리", weights: { health: 3, spirituality: 4, openness: 3 } },
      { value: "medical", text: "의학적 접근", weights: { health: 4, conscientiousness: 5, security: 3 } }
    ]
  },
  {
    id: 9,
    text: "새로운 사람들과 만날 때 어떤 느낌인가요?",
    category: "social",
    options: [
      { value: "excited", text: "설레고 즐겁다", weights: { extroversion: 5, openness: 4, optimism: 5 } },
      { value: "curious", text: "호기심이 생긴다", weights: { openness: 5, intellectualCuriosity: 4, growth: 3 } },
      { value: "cautious", text: "조심스럽다", weights: { neuroticism: 3, conscientiousness: 4, security: 3 } },
      { value: "comfortable", text: "편안하다", weights: { extroversion: 4, agreeableness: 4, emotionalStability: 4 } }
    ]
  },
  {
    id: 10,
    text: "스트레스를 받을 때 주로 어떻게 해소하시나요?",
    category: "stress_management",
    options: [
      { value: "exercise", text: "운동이나 신체활동", weights: { health: 5, active: 5, emotionalStability: 3 } },
      { value: "social", text: "사람들과 대화", weights: { relationships: 5, extroversion: 4, agreeableness: 3 } },
      { value: "alone", text: "혼자만의 시간", weights: { introversion: 4, spirituality: 3, security: 3 } },
      { value: "hobby", text: "취미 활동", weights: { creativity: 4, growth: 3, openness: 3 } }
    ]
  },
  {
    id: 11,
    text: "여행할 때 선호하는 스타일은?",
    category: "travel",
    options: [
      { value: "planned", text: "계획적인 여행", weights: { conscientiousness: 5, security: 3, organization: 4 } },
      { value: "spontaneous", text: "즉흥적인 여행", weights: { openness: 5, adventure: 5, spontaneity: 4 } },
      { value: "comfort", text: "편안한 여행", weights: { security: 4, stability: 4, comfort: 5 } },
      { value: "cultural", text: "문화 체험 중심", weights: { intellectualCuriosity: 5, growth: 4, openness: 4 } }
    ]
  },
  {
    id: 12,
    text: "친구와의 관계에서 가장 중요한 것은?",
    category: "relationships",
    options: [
      { value: "trust", text: "신뢰와 솔직함", weights: { relationships: 5, agreeableness: 4, honesty: 5 } },
      { value: "support", text: "서로 지지해주기", weights: { relationships: 5, agreeableness: 5, empathy: 4 } },
      { value: "fun", text: "즐거운 시간 공유", weights: { relationships: 4, extroversion: 4, optimism: 4 } },
      { value: "understanding", text: "깊은 이해", weights: { relationships: 5, empathy: 5, intellectualCuriosity: 3 } }
    ]
  },
  {
    id: 13,
    text: "일과 삶의 균형에 대한 생각은?",
    category: "work_life",
    options: [
      { value: "balance", text: "완전한 균형이 중요", weights: { health: 4, stability: 4, conscientiousness: 3 } },
      { value: "work_first", text: "일의 성취가 우선", weights: { career: 5, growth: 4, conscientiousness: 4 } },
      { value: "life_first", text: "개인 시간이 더 중요", weights: { freedom: 4, health: 4, relationships: 3 } },
      { value: "flexible", text: "상황에 따라 유연하게", weights: { adaptability: 5, openness: 4, pragmatism: 4 } }
    ]
  },
  {
    id: 14,
    text: "문제 해결 시 어떤 접근을 선호하시나요?",
    category: "problem_solving",
    options: [
      { value: "systematic", text: "체계적 분석", weights: { conscientiousness: 5, analytical: 5, methodical: 4 } },
      { value: "creative", text: "창의적 해결", weights: { creativity: 5, openness: 5, innovation: 4 } },
      { value: "collaborative", text: "협력적 접근", weights: { relationships: 5, agreeableness: 4, teamwork: 5 } },
      { value: "intuitive", text: "직관적 판단", weights: { intuition: 5, openness: 3, confidence: 4 } }
    ]
  },
  {
    id: 15,
    text: "성격적으로 자신을 어떻게 표현하시겠어요?",
    category: "personality",
    options: [
      { value: "outgoing", text: "외향적이고 활발함", weights: { extroversion: 5, optimism: 4, energy: 5 } },
      { value: "thoughtful", text: "사려깊고 신중함", weights: { conscientiousness: 4, intellectualCuriosity: 4, wisdom: 5 } },
      { value: "optimistic", text: "긍정적이고 밝음", weights: { optimism: 5, emotionalStability: 4, resilience: 4 } },
      { value: "calm", text: "차분하고 안정적", weights: { emotionalStability: 5, stability: 4, peaceful: 5 } }
    ]
  },
  {
    id: 16,
    text: "학습이나 성장에 대한 태도는?",
    category: "growth",
    options: [
      { value: "continuous", text: "지속적인 학습", weights: { growth: 5, intellectualCuriosity: 5, openness: 4 } },
      { value: "practical", text: "실용적 지식 위주", weights: { pragmatism: 5, conscientiousness: 3, efficiency: 4 } },
      { value: "deep", text: "깊이 있는 탐구", weights: { intellectualCuriosity: 5, growth: 4, depth: 5 } },
      { value: "experiential", text: "경험을 통한 학습", weights: { adventure: 4, openness: 4, hands_on: 5 } }
    ]
  },
  {
    id: 17,
    text: "소통할 때 중요하게 생각하는 것은?",
    category: "communication",
    options: [
      { value: "clarity", text: "명확한 표현", weights: { conscientiousness: 4, directness: 5, clarity: 5 } },
      { value: "empathy", text: "공감과 이해", weights: { empathy: 5, agreeableness: 5, emotional_intelligence: 4 } },
      { value: "humor", text: "유머와 재미", weights: { extroversion: 4, optimism: 4, humor: 5 } },
      { value: "respect", text: "상호 존중", weights: { agreeableness: 5, respect: 5, dignity: 4 } }
    ]
  },
  {
    id: 18,
    text: "변화에 대한 당신의 태도는?",
    category: "change",
    options: [
      { value: "embrace", text: "적극적으로 수용", weights: { openness: 5, adaptability: 5, adventure: 4 } },
      { value: "cautious", text: "신중하게 접근", weights: { conscientiousness: 4, security: 3, careful: 4 } },
      { value: "gradual", text: "점진적으로 적응", weights: { stability: 4, conscientiousness: 3, methodical: 3 } },
      { value: "resistant", text: "기존 방식 선호", weights: { security: 5, stability: 5, traditional: 4 } }
    ]
  },
  {
    id: 19,
    text: "인생의 의미를 어디서 찾으시나요?",
    category: "meaning",
    options: [
      { value: "relationships", text: "인간관계에서", weights: { relationships: 5, family: 4, agreeableness: 4 } },
      { value: "achievement", text: "성취와 목표 달성", weights: { career: 5, growth: 4, conscientiousness: 4 } },
      { value: "service", text: "타인에 대한 봉사", weights: { spirituality: 5, agreeableness: 5, altruism: 5 } },
      { value: "growth", text: "개인적 성장", weights: { growth: 5, intellectualCuriosity: 4, self_awareness: 5 } }
    ]
  },
  {
    id: 20,
    text: "이상적인 파트너와의 관계는?",
    category: "partnership",
    options: [
      { value: "companion", text: "인생의 동반자", weights: { relationships: 5, family: 4, stability: 4, companionship: 5 } },
      { value: "best_friend", text: "가장 친한 친구", weights: { relationships: 5, agreeableness: 4, friendship: 5, fun: 4 } },
      { value: "soulmate", text: "영혼의 짝", weights: { relationships: 5, spirituality: 4, deep_connection: 5, romantic: 5 } },
      { value: "team", text: "최고의 팀", weights: { relationships: 4, cooperation: 5, shared_goals: 5, partnership: 5 } }
    ]
  }
];

/**
 * @swagger
 * /api/values/questions:
 *   get:
 *     summary: 가치관 평가 질문 목록 조회
 *     tags: [Values Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 질문 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           text:
 *                             type: string
 *                           category:
 *                             type: string
 *                           options:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 value:
 *                                   type: string
 *                                 text:
 *                                   type: string
 *                     totalQuestions:
 *                       type: number
 */
router.get('/questions', authenticate, async (req, res) => {
  try {
    // 질문에서 가중치 정보 제거 (클라이언트에 노출하지 않음)
    const questionsForClient = ASSESSMENT_QUESTIONS.map(q => ({
      id: q.id,
      text: q.text,
      category: q.category,
      options: q.options.map(opt => ({
        value: opt.value,
        text: opt.text
      }))
    }));
    
    res.json({
      success: true,
      data: {
        questions: questionsForClient,
        totalQuestions: ASSESSMENT_QUESTIONS.length
      }
    });
    
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      error: '질문 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/values/assessment:
 *   get:
 *     summary: 현재 사용자의 가치관 평가 조회
 *     tags: [Values Assessment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 평가 조회 성공
 *       404:
 *         description: 평가를 찾을 수 없음
 */
router.get('/assessment', authenticate, async (req, res) => {
  try {
    const assessment = await ValuesAssessment.findOne({ userId: req.user._id });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: '가치관 평가를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        assessment: {
          id: assessment._id,
          userId: assessment.userId,
          isCompleted: assessment.isCompleted,
          completedAt: assessment.completedAt,
          completionPercentage: assessment.completionPercentage,
          personalityScores: assessment.personalityScores,
          valueCategories: assessment.valueCategories,
          interests: assessment.interests,
          lifestyle: assessment.lifestyle,
          aiAnalysis: assessment.aiAnalysis,
          createdAt: assessment.createdAt,
          updatedAt: assessment.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      success: false,
      error: '평가 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/values/assessment:
 *   post:
 *     summary: 가치관 평가 답변 제출
 *     tags: [Values Assessment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: object
 *                 description: 질문 ID를 키로 하는 답변 객체
 *     responses:
 *       200:
 *         description: 답변 제출 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/assessment', authenticate, requireVerified, validateValuesAssessment, async (req, res) => {
  try {
    const { answers } = req.body;
    
    // 기존 평가가 있는지 확인
    let assessment = await ValuesAssessment.findOne({ userId: req.user._id });
    
    if (!assessment) {
      // 새로운 평가 생성
      assessment = new ValuesAssessment({
        userId: req.user._id,
        answers: new Map(),
        totalQuestions: ASSESSMENT_QUESTIONS.length
      });
    }
    
    // 답변 처리 및 가중치 계산
    const updatedAnswers = new Map(assessment.answers);
    const personalityScores = { ...assessment.personalityScores };
    const valueCategories = { ...assessment.valueCategories };
    
    // 각 답변 처리
    Object.entries(answers).forEach(([questionId, answer]) => {
      const questionNum = parseInt(questionId);
      const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionNum);
      
      if (question) {
        const selectedOption = question.options.find(opt => opt.value === answer.value);
        
        if (selectedOption) {
          // 답변 저장
          updatedAnswers.set(questionId, {
            questionId: questionNum,
            value: answer.value,
            text: selectedOption.text,
            category: question.category,
            timestamp: new Date()
          });
          
          // 가중치 적용
          if (selectedOption.weights) {
            Object.entries(selectedOption.weights).forEach(([trait, weight]) => {
              // 성격 점수 업데이트
              if (personalityScores.hasOwnProperty(trait)) {
                personalityScores[trait] = Math.min(100, (personalityScores[trait] || 50) + weight);
              }
              
              // 가치관 카테고리 점수 업데이트
              if (valueCategories.hasOwnProperty(trait)) {
                valueCategories[trait] = Math.min(100, (valueCategories[trait] || 50) + weight);
              }
            });
          }
        }
      }
    });
    
    // 점수 정규화 (0-100 범위로)
    const normalizeScores = (scores) => {
      const normalized = {};
      Object.keys(scores).forEach(key => {
        normalized[key] = Math.max(0, Math.min(100, scores[key]));
      });
      return normalized;
    };
    
    // 업데이트
    assessment.answers = updatedAnswers;
    assessment.personalityScores = normalizeScores(personalityScores);
    assessment.valueCategories = normalizeScores(valueCategories);
    assessment.answeredQuestions = updatedAnswers.size;
    
    // 관심사 추출
    assessment.interests = extractInterests(updatedAnswers);
    
    // 라이프스타일 분석
    assessment.lifestyle = analyzeLifestyle(updatedAnswers);
    
    // 완료 여부 확인
    if (assessment.answeredQuestions >= assessment.totalQuestions) {
      assessment.isCompleted = true;
      assessment.completedAt = new Date();
      assessment.processingStatus = 'completed';
      
      // AI 분석 수행
      assessment.aiAnalysis = await performAIAnalysis(assessment);
    }
    
    await assessment.save();
    
    res.json({
      success: true,
      message: assessment.isCompleted ? '가치관 평가가 완료되었습니다!' : '답변이 저장되었습니다.',
      data: {
        assessment: {
          id: assessment._id,
          isCompleted: assessment.isCompleted,
          completionPercentage: assessment.completionPercentage,
          personalityScores: assessment.personalityScores,
          valueCategories: assessment.valueCategories,
          interests: assessment.interests,
          lifestyle: assessment.lifestyle,
          aiAnalysis: assessment.aiAnalysis
        }
      }
    });
    
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({
      success: false,
      error: '답변 제출 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/values/assessment/{id}:
 *   get:
 *     summary: 특정 가치관 평가 조회
 *     tags: [Values Assessment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 평가 ID
 *     responses:
 *       200:
 *         description: 평가 조회 성공
 *       404:
 *         description: 평가를 찾을 수 없음
 *       403:
 *         description: 접근 권한 없음
 */
router.get('/assessment/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const assessment = await ValuesAssessment.findById(req.params.id).populate('userId', 'name age');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: '평가를 찾을 수 없습니다.'
      });
    }
    
    // 소유자 또는 관리자만 접근 가능
    if (assessment.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '접근 권한이 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        assessment
      }
    });
    
  } catch (error) {
    console.error('Get specific assessment error:', error);
    res.status(500).json({
      success: false,
      error: '평가 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/values/compatibility:
 *   post:
 *     summary: 두 사용자 간 호환성 계산
 *     tags: [Values Assessment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: 비교할 사용자 ID
 *     responses:
 *       200:
 *         description: 호환성 계산 성공
 *       404:
 *         description: 평가를 찾을 수 없음
 */
router.post('/compatibility', authenticate, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: '대상 사용자 ID가 필요합니다.'
      });
    }
    
    // 두 사용자의 평가 조회
    const [myAssessment, targetAssessment] = await Promise.all([
      ValuesAssessment.findOne({ userId: req.user._id }),
      ValuesAssessment.findOne({ userId: targetUserId })
    ]);
    
    if (!myAssessment || !targetAssessment) {
      return res.status(404).json({
        success: false,
        error: '가치관 평가를 찾을 수 없습니다.'
      });
    }
    
    if (!myAssessment.isCompleted || !targetAssessment.isCompleted) {
      return res.status(400).json({
        success: false,
        error: '완료된 평가가 필요합니다.'
      });
    }
    
    // 호환성 계산
    const compatibilityScore = myAssessment.calculateCompatibilityWith(targetAssessment);
    
    // 상세 분석
    const compatibility = {
      overall: compatibilityScore,
      breakdown: {
        values: calculateValuesSimilarity(myAssessment.valueCategories, targetAssessment.valueCategories),
        personality: calculatePersonalitySimilarity(myAssessment.personalityScores, targetAssessment.personalityScores),
        lifestyle: calculateLifestyleSimilarity(myAssessment.lifestyle, targetAssessment.lifestyle),
        interests: calculateInterestsSimilarity(myAssessment.interests, targetAssessment.interests)
      },
      strengths: [],
      challenges: [],
      recommendations: []
    };
    
    // 강점과 도전점 분석
    analyzeCompatibilityDetails(compatibility, myAssessment, targetAssessment);
    
    res.json({
      success: true,
      data: {
        compatibility,
        myProfile: {
          personalityType: myAssessment.aiAnalysis?.primaryPersonalityType,
          topValues: myAssessment.topValueCategories,
          lifestyle: myAssessment.lifestyle
        },
        targetProfile: {
          personalityType: targetAssessment.aiAnalysis?.primaryPersonalityType,
          topValues: targetAssessment.topValueCategories,
          lifestyle: targetAssessment.lifestyle
        }
      }
    });
    
  } catch (error) {
    console.error('Calculate compatibility error:', error);
    res.status(500).json({
      success: false,
      error: '호환성 계산 중 오류가 발생했습니다.'
    });
  }
});

// 헬퍼 함수들

function extractInterests(answers) {
  const interests = [];
  const interestMapping = {
    'active': { category: 'sports', intensity: 4 },
    'creative': { category: 'arts', intensity: 4 },
    'social': { category: 'socializing', intensity: 4 },
    'quiet': { category: 'reading', intensity: 3 },
    'adventure': { category: 'travel', intensity: 5 },
    'cultural': { category: 'education', intensity: 4 }
  };
  
  answers.forEach((answer) => {
    if (interestMapping[answer.value]) {
      interests.push(interestMapping[answer.value]);
    }
  });
  
  return interests;
}

function analyzeLifestyle(answers) {
  const lifestyle = {
    socialLevel: 'ambivert',
    activityLevel: 'moderate',
    planningStyle: 'flexible',
    communicationStyle: 'diplomatic',
    conflictResolution: 'collaborative',
    decisionMaking: 'logical',
    stressManagement: 'exercise'
  };
  
  // 답변을 바탕으로 라이프스타일 분석
  answers.forEach((answer) => {
    switch (answer.value) {
      case 'social':
        lifestyle.socialLevel = 'extrovert';
        break;
      case 'quiet':
      case 'alone':
        lifestyle.socialLevel = 'introvert';
        break;
      case 'active':
        lifestyle.activityLevel = 'high';
        lifestyle.stressManagement = 'exercise';
        break;
      case 'detailed':
        lifestyle.planningStyle = 'organized';
        break;
      case 'spontaneous':
        lifestyle.planningStyle = 'spontaneous';
        break;
      case 'direct':
        lifestyle.communicationStyle = 'direct';
        lifestyle.conflictResolution = 'competitive';
        break;
      case 'mediate':
        lifestyle.conflictResolution = 'collaborative';
        break;
      case 'logic':
        lifestyle.decisionMaking = 'logical';
        break;
      case 'emotion':
        lifestyle.decisionMaking = 'emotional';
        break;
    }
  });
  
  return lifestyle;
}

async function performAIAnalysis(assessment) {
  // 간단한 AI 분석 (실제로는 더 정교한 ML 모델을 사용할 수 있음)
  const analysis = {
    primaryPersonalityType: determinePrimaryPersonalityType(assessment.personalityScores),
    topValues: getTopValues(assessment.valueCategories),
    compatibilityFactors: generateCompatibilityFactors(assessment),
    recommendedMatchTypes: generateRecommendedMatchTypes(assessment),
    strengthsAndChallenges: analyzeStrengthsAndChallenges(assessment)
  };
  
  return analysis;
}

function determinePrimaryPersonalityType(scores) {
  if (scores.extroversion > 70 && scores.openness > 70) {
    return 'Enthusiastic Explorer';
  } else if (scores.conscientiousness > 70 && scores.agreeableness > 70) {
    return 'Reliable Caregiver';
  } else if (scores.openness > 70 && scores.intellectualCuriosity > 70) {
    return 'Creative Thinker';
  } else if (scores.extroversion < 30 && scores.conscientiousness > 70) {
    return 'Thoughtful Planner';
  } else {
    return 'Balanced Individual';
  }
}

function getTopValues(valueCategories) {
  return Object.entries(valueCategories)
    .map(([value, score]) => ({ value, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function generateCompatibilityFactors(assessment) {
  return [
    { factor: 'shared_values', weight: 40, description: '공통 가치관' },
    { factor: 'personality_complement', weight: 30, description: '성격 상호보완' },
    { factor: 'lifestyle_match', weight: 20, description: '라이프스타일 일치' },
    { factor: 'communication_style', weight: 10, description: '소통 방식' }
  ];
}

function generateRecommendedMatchTypes(assessment) {
  const recommendations = [];
  
  if (assessment.personalityScores.extroversion > 70) {
    recommendations.push({
      type: 'social_connector',
      compatibility: 85,
      description: '사교적이고 활발한 파트너'
    });
  }
  
  if (assessment.valueCategories.family > 80) {
    recommendations.push({
      type: 'family_oriented',
      compatibility: 90,
      description: '가족 중심적인 파트너'
    });
  }
  
  return recommendations;
}

function analyzeStrengthsAndChallenges(assessment) {
  const strengths = [];
  const challenges = [];
  const growthAreas = [];
  
  // 강점 분석
  Object.entries(assessment.personalityScores).forEach(([trait, score]) => {
    if (score > 80) {
      strengths.push(trait);
    } else if (score < 30) {
      challenges.push(trait);
      growthAreas.push(trait);
    }
  });
  
  return { strengths, challenges, growthAreas };
}

function calculateValuesSimilarity(values1, values2) {
  let totalDiff = 0;
  let count = 0;
  
  Object.keys(values1).forEach(key => {
    if (values2[key] !== undefined) {
      totalDiff += Math.abs(values1[key] - values2[key]);
      count++;
    }
  });
  
  return count > 0 ? Math.round(100 - (totalDiff / count)) : 50;
}

function calculatePersonalitySimilarity(personality1, personality2) {
  let totalDiff = 0;
  let count = 0;
  
  Object.keys(personality1).forEach(key => {
    if (personality2[key] !== undefined) {
      totalDiff += Math.abs(personality1[key] - personality2[key]);
      count++;
    }
  });
  
  return count > 0 ? Math.round(100 - (totalDiff / count)) : 50;
}

function calculateLifestyleSimilarity(lifestyle1, lifestyle2) {
  let matches = 0;
  let total = 0;
  
  Object.keys(lifestyle1).forEach(key => {
    if (lifestyle2[key] !== undefined) {
      if (lifestyle1[key] === lifestyle2[key]) {
        matches++;
      }
      total++;
    }
  });
  
  return total > 0 ? Math.round((matches / total) * 100) : 50;
}

function calculateInterestsSimilarity(interests1, interests2) {
  const categories1 = new Set(interests1.map(i => i.category));
  const categories2 = new Set(interests2.map(i => i.category));
  
  const intersection = new Set([...categories1].filter(x => categories2.has(x)));
  const union = new Set([...categories1, ...categories2]);
  
  return union.size > 0 ? Math.round((intersection.size / union.size) * 100) : 0;
}

function analyzeCompatibilityDetails(compatibility, assessment1, assessment2) {
  // 강점 분석
  if (compatibility.breakdown.values > 80) {
    compatibility.strengths.push('높은 가치관 일치도');
  }
  
  if (compatibility.breakdown.lifestyle > 70) {
    compatibility.strengths.push('유사한 라이프스타일');
  }
  
  // 도전점 분석
  if (compatibility.breakdown.personality < 60) {
    compatibility.challenges.push('성격적 차이');
    compatibility.recommendations.push('서로의 차이점을 이해하고 존중하기');
  }
  
  if (compatibility.breakdown.interests < 50) {
    compatibility.challenges.push('관심사 차이');
    compatibility.recommendations.push('새로운 공통 취미 찾아보기');
  }
  
  // 추천사항
  compatibility.recommendations.push('정기적인 깊은 대화 나누기');
  compatibility.recommendations.push('서로의 가치관에 대해 더 알아보기');
}

module.exports = router;