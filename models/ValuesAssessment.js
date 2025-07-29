const mongoose = require('mongoose');
const { encryptionService } = require('../utils/encryption');

/**
 * @swagger
 * components:
 *   schemas:
 *     ValuesAssessment:
 *       type: object
 *       required:
 *         - userId
 *         - answers
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: 사용자 ID 참조
 *         answers:
 *           type: object
 *           description: 설문 답변들
 *         personalityScores:
 *           type: object
 *           description: 성격 점수들
 *         valueCategories:
 *           type: object
 *           description: 가치관 카테고리별 점수
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           description: 관심사 목록
 *         lifestyle:
 *           type: object
 *           description: 라이프스타일 정보
 *         isCompleted:
 *           type: boolean
 *           description: 설문 완료 여부
 *         completedAt:
 *           type: string
 *           format: date-time
 *         version:
 *           type: string
 *           description: 설문 버전
 */

const valuesAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '사용자 ID는 필수입니다'],
      unique: true,
    },

    // 원시 답변 데이터 (암호화됨)
    answers: {
      type: Map,
      of: {
        questionId: Number,
        value: String,
        text: String,
        category: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
      required: [true, '답변은 필수입니다'],
      get: function (value) {
        if (!value) {
          return value;
        }
        
        // 이미 복호화된 객체인 경우 그대로 반환
        if (typeof value === 'object' && value.constructor === Object) {
          return value;
        }
        
        // 문자열이 아닌 경우 (암호화되지 않은 데이터) 그대로 반환
        if (typeof value !== 'string') {
          return value;
        }
        
        // 암호화된 형식인지 확인 (iv:authTag:encrypted)
        if (typeof value === 'string' && value.includes(':') && value.split(':').length === 3) {
          try {
            const decrypted = encryptionService.decryptAssessment(value);
            return JSON.parse(decrypted);
          } catch (error) {
            console.warn('Assessment data decryption failed, returning raw value:', error.message);
            // 복호화 실패 시 원본 반환 (개발 환경에서는 허용)
            return value;
          }
        }
        
        // 일반 JSON 문자열인 경우
        try {
          return JSON.parse(value);
        } catch (error) {
          console.warn('JSON parsing failed, returning raw value:', error.message);
          return value;
        }
      },
      set: function (value) {
        if (!value) {
          return value;
        }
        
        // 이미 암호화된 문자열인 경우 그대로 저장
        if (typeof value === 'string' && value.includes(':') && value.split(':').length === 3) {
          return value;
        }
        
        try {
          const jsonString = JSON.stringify(value);
          return encryptionService.encryptAssessment(jsonString);
        } catch (error) {
          console.error('Assessment data encryption error:', error.message);
          // 암호화 실패 시 JSON 문자열로라도 저장
          try {
            return JSON.stringify(value);
          } catch (jsonError) {
            console.error('JSON stringify also failed:', jsonError.message);
            return value;
          }
        }
      },
    },

    // 성격 점수 (Big 5 + 추가 특성)
    personalityScores: {
      // Big Five
      openness: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      conscientiousness: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      extroversion: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      agreeableness: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      neuroticism: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },

      // 추가 특성
      optimism: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      emotionalStability: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      adventurousness: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      intellectualCuriosity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      empathy: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
    },

    // 가치관 카테고리별 점수
    valueCategories: {
      family: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '가족 중시도',
      },
      career: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '경력/성취 중시도',
      },
      freedom: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '자유/독립 중시도',
      },
      security: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '안정/보안 중시도',
      },
      growth: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '성장/학습 중시도',
      },
      relationships: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '인간관계 중시도',
      },
      health: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '건강 중시도',
      },
      creativity: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '창의성/예술 중시도',
      },
      spirituality: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '영성/종교 중시도',
      },
      adventure: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
        description: '모험/새로운 경험 중시도',
      },
    },

    // 관심사와 취미
    interests: [
      {
        category: {
          type: String,
          enum: [
            'sports',
            'arts',
            'music',
            'reading',
            'cooking',
            'travel',
            'nature',
            'technology',
            'education',
            'volunteering',
            'crafts',
            'games',
            'dancing',
            'photography',
            'gardening',
            'fitness',
            'movies',
            'theater',
            'meditation',
            'socializing',
          ],
        },
        intensity: {
          type: Number,
          min: 1,
          max: 5,
          default: 3,
        },
      },
    ],

    // 라이프스타일 정보
    lifestyle: {
      socialLevel: {
        type: String,
        enum: ['introvert', 'ambivert', 'extrovert'],
        default: 'ambivert',
      },
      activityLevel: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate',
      },
      planningStyle: {
        type: String,
        enum: ['spontaneous', 'flexible', 'organized', 'rigid'],
        default: 'flexible',
      },
      communicationStyle: {
        type: String,
        enum: ['direct', 'diplomatic', 'supportive', 'analytical'],
        default: 'diplomatic',
      },
      conflictResolution: {
        type: String,
        enum: ['avoidant', 'accommodating', 'competitive', 'collaborative'],
        default: 'collaborative',
      },
      decisionMaking: {
        type: String,
        enum: ['logical', 'emotional', 'intuitive', 'collaborative'],
        default: 'logical',
      },
      stressManagement: {
        type: String,
        enum: ['exercise', 'social', 'solitude', 'creative', 'meditation'],
        default: 'exercise',
      },
    },

    // 완료 상태
    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },

    // 설문 메타데이터
    version: {
      type: String,
      default: '1.0',
      description: '설문 버전',
    },

    totalQuestions: {
      type: Number,
      default: 20,
    },

    answeredQuestions: {
      type: Number,
      default: 0,
    },

    // 신뢰도 점수
    reliabilityScore: {
      type: Number,
      min: 0,
      max: 100,
      description: '답변 일관성 점수',
    },

    // 처리 상태
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'error'],
      default: 'pending',
    },

    processingError: {
      type: String,
    },

    // AI 분석 결과
    aiAnalysis: {
      primaryPersonalityType: {
        type: String,
        description: '주요 성격 유형',
      },
      topValues: [
        {
          value: String,
          score: Number,
        },
      ],
      compatibilityFactors: [
        {
          factor: String,
          weight: Number,
          description: String,
        },
      ],
      recommendedMatchTypes: [
        {
          type: String,
          compatibility: Number,
          description: String,
        },
      ],
      strengthsAndChallenges: {
        strengths: [String],
        challenges: [String],
        growthAreas: [String],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 인덱스
// valuesAssessmentSchema.index({ userId: 1 }); // 제거됨 - userId에 unique:true로 인덱스 자동 생성
valuesAssessmentSchema.index({ isCompleted: 1 });
valuesAssessmentSchema.index({ completedAt: -1 });
valuesAssessmentSchema.index({ version: 1 });

// 가상 필드
valuesAssessmentSchema.virtual('completionPercentage').get(function () {
  if (this.totalQuestions === 0) {
    return 0;
  }
  return Math.round((this.answeredQuestions / this.totalQuestions) * 100);
});

valuesAssessmentSchema.virtual('dominantPersonalityTraits').get(function () {
  const scores = this.personalityScores;
  const traits = Object.keys(scores);

  return traits
    .map(trait => ({ trait, score: scores[trait] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
});

valuesAssessmentSchema.virtual('topValueCategories').get(function () {
  const values = this.valueCategories;
  const categories = Object.keys(values);

  return categories
    .map(category => ({ category, score: values[category] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
});

// 미들웨어
valuesAssessmentSchema.pre('save', function (next) {
  // 답변 수 업데이트
  if (this.answers) {
    this.answeredQuestions = this.answers.size;
  }

  // 완료 상태 체크
  if (this.answeredQuestions >= this.totalQuestions && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    this.processingStatus = 'processing';
  }

  next();
});

// 메서드: 특정 카테고리 점수 계산
valuesAssessmentSchema.methods.calculateCategoryScore = function (category) {
  const categoryAnswers = [];

  this.answers.forEach(answer => {
    if (answer.category === category) {
      categoryAnswers.push(answer);
    }
  });

  if (categoryAnswers.length === 0) {
    return 50;
  } // 기본값

  // 카테고리별 점수 계산 로직
  let totalScore = 0;
  categoryAnswers.forEach(answer => {
    // 답변에 따른 점수 매핑 (실제로는 더 복잡한 로직)
    const scoreMap = {
      strongly_agree: 100,
      agree: 75,
      neutral: 50,
      disagree: 25,
      strongly_disagree: 0,
    };

    totalScore += scoreMap[answer.value] || 50;
  });

  return Math.round(totalScore / categoryAnswers.length);
};

// 메서드: 성격 유형 결정
valuesAssessmentSchema.methods.determinePrimaryPersonalityType = function () {
  const scores = this.personalityScores;

  // 간단한 성격 유형 분류 로직
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
};

// 메서드: 호환성 점수 계산
valuesAssessmentSchema.methods.calculateCompatibilityWith = function (otherAssessment) {
  if (!otherAssessment || !otherAssessment.isCompleted) {
    return 0;
  }

  let totalScore = 0;
  let weights = 0;

  // 가치관 호환성 (40% 가중치)
  const valueWeight = 0.4;
  let valueCompatibility = 0;

  Object.keys(this.valueCategories).forEach(category => {
    const diff = Math.abs(
      this.valueCategories[category] - otherAssessment.valueCategories[category]
    );
    const similarity = 100 - diff;
    valueCompatibility += similarity;
  });

  valueCompatibility = valueCompatibility / Object.keys(this.valueCategories).length;
  totalScore += valueCompatibility * valueWeight;
  weights += valueWeight;

  // 성격 호환성 (35% 가중치)
  const personalityWeight = 0.35;
  let personalityCompatibility = 0;

  Object.keys(this.personalityScores).forEach(trait => {
    const diff = Math.abs(this.personalityScores[trait] - otherAssessment.personalityScores[trait]);
    const similarity = 100 - diff;
    personalityCompatibility += similarity;
  });

  personalityCompatibility = personalityCompatibility / Object.keys(this.personalityScores).length;
  totalScore += personalityCompatibility * personalityWeight;
  weights += personalityWeight;

  // 라이프스타일 호환성 (25% 가중치)
  const lifestyleWeight = 0.25;
  let lifestyleCompatibility = 0;
  let lifestyleMatches = 0;
  let lifestyleTotal = 0;

  Object.keys(this.lifestyle).forEach(aspect => {
    if (this.lifestyle[aspect] === otherAssessment.lifestyle[aspect]) {
      lifestyleMatches++;
    }
    lifestyleTotal++;
  });

  lifestyleCompatibility = (lifestyleMatches / lifestyleTotal) * 100;
  totalScore += lifestyleCompatibility * lifestyleWeight;
  weights += lifestyleWeight;

  return Math.round(totalScore / weights);
};

// 정적 메서드: 완료된 평가 찾기
valuesAssessmentSchema.statics.findCompletedAssessments = function () {
  return this.find({ isCompleted: true }).populate('userId');
};

// 정적 메서드: 사용자별 최신 평가 찾기
valuesAssessmentSchema.statics.findLatestByUser = function (userId) {
  return this.findOne({ userId }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('ValuesAssessment', valuesAssessmentSchema);
