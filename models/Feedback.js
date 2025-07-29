const mongoose = require('mongoose');

/**
 * 사용자 피드백 모델 - 4060세대 특화 피드백 시스템
 *
 * 기능:
 * - 매칭 성공/실패 피드백
 * - 서비스 개선 제안
 * - 사용자 경험 평가
 * - 만남 후 리뷰
 * - 기술적 문제 신고
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - rating
 *       properties:
 *         _id:
 *           type: string
 *           description: 피드백 고유 ID
 *         userId:
 *           type: string
 *           description: 피드백 작성 사용자 ID
 *         type:
 *           type: string
 *           enum: ['matching', 'service', 'meeting', 'technical', 'suggestion']
 *           description: 피드백 유형
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: 만족도 평점 (1-5)
 *         title:
 *           type: string
 *           description: 피드백 제목
 *         content:
 *           type: string
 *           description: 피드백 내용
 *         category:
 *           type: string
 *           description: 피드백 세부 카테고리
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const feedbackSchema = new mongoose.Schema(
  {
    // 기본 정보
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '사용자 ID는 필수입니다'],
      index: true,
    },

    // 피드백 유형
    type: {
      type: String,
      required: [true, '피드백 유형은 필수입니다'],
      enum: {
        values: ['matching', 'service', 'meeting', 'technical', 'suggestion'],
        message: '유효한 피드백 유형을 선택해주세요',
      },
      index: true,
    },

    // 만족도 평점 (1-5)
    rating: {
      type: Number,
      required: [true, '평점은 필수입니다'],
      min: [1, '평점은 1 이상이어야 합니다'],
      max: [5, '평점은 5 이하여야 합니다'],
    },

    // 피드백 제목
    title: {
      type: String,
      required: [true, '제목은 필수입니다'],
      trim: true,
      maxlength: [100, '제목은 100자 이하여야 합니다'],
    },

    // 피드백 내용
    content: {
      type: String,
      required: [true, '내용은 필수입니다'],
      trim: true,
      maxlength: [2000, '내용은 2000자 이하여야 합니다'],
    },

    // 세부 카테고리
    category: {
      type: String,
      trim: true,
      index: true,
    },

    // 피드백 유형별 상세 정보
    details: {
      // 매칭 관련 피드백
      matching: {
        matchId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Match',
        },
        matchedUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        matchQuality: {
          type: Number,
          min: 1,
          max: 5,
        },
        compatibilityAccuracy: {
          type: Number,
          min: 1,
          max: 5,
        },
        communicationQuality: {
          type: Number,
          min: 1,
          max: 5,
        },
        wouldRecommend: {
          type: Boolean,
        },
        improvements: [
          {
            area: {
              type: String,
              enum: ['algorithm', 'profile_info', 'communication', 'filtering', 'presentation'],
            },
            suggestion: String,
          },
        ],
      },

      // 서비스 관련 피드백
      service: {
        serviceAspect: {
          type: String,
          enum: [
            'ui_ux',
            'performance',
            'features',
            'customer_support',
            'pricing',
            'accessibility',
          ],
        },
        difficulty: {
          type: String,
          enum: ['very_easy', 'easy', 'moderate', 'difficult', 'very_difficult'],
        },
        usageFrequency: {
          type: String,
          enum: ['daily', 'weekly', 'monthly', 'rarely'],
        },
        deviceType: {
          type: String,
          enum: ['mobile', 'tablet', 'desktop'],
        },
        browserType: {
          type: String,
        },
      },

      // 만남 후 리뷰
      meeting: {
        meetingDate: {
          type: Date,
        },
        meetingLocation: {
          type: String,
          trim: true,
        },
        meetingDuration: {
          type: Number, // 분 단위
        },
        overallExperience: {
          type: Number,
          min: 1,
          max: 5,
        },
        personalSafety: {
          type: Number,
          min: 1,
          max: 5,
        },
        matchAccuracy: {
          type: Number,
          min: 1,
          max: 5,
        },
        futureInterest: {
          type: String,
          enum: ['definitely', 'maybe', 'probably_not', 'definitely_not'],
        },
        reportSafetyIssue: {
          type: Boolean,
          default: false,
        },
        safetyDetails: {
          type: String,
          maxlength: [1000, '안전 관련 세부사항은 1000자 이하여야 합니다'],
        },
      },

      // 기술적 문제
      technical: {
        issueType: {
          type: String,
          enum: [
            'loading',
            'crash',
            'login',
            'payment',
            'notification',
            'image_upload',
            'messaging',
            'other',
          ],
        },
        deviceInfo: {
          os: String,
          browser: String,
          version: String,
        },
        errorMessage: {
          type: String,
          maxlength: [500, '오류 메시지는 500자 이하여야 합니다'],
        },
        reproduced: {
          type: Boolean,
        },
        frequency: {
          type: String,
          enum: ['once', 'rarely', 'sometimes', 'often', 'always'],
        },
      },

      // 개선 제안
      suggestion: {
        suggestionType: {
          type: String,
          enum: ['new_feature', 'improvement', 'integration', 'content', 'design'],
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
        },
        targetAudience: {
          type: String,
          enum: ['all_users', 'seniors', 'new_users', 'premium_users'],
        },
        implementationDifficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard', 'very_hard'],
        },
        businessValue: {
          type: String,
          enum: ['low', 'medium', 'high', 'very_high'],
        },
      },
    },

    // 4060세대 특화 정보
    ageGroupContext: {
      technicalComfort: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate',
      },
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'app_notification', 'sms'],
      },
      assistanceNeeded: {
        type: Boolean,
        default: false,
      },
      assistanceType: {
        type: String,
        enum: ['phone_support', 'video_tutorial', 'written_guide', 'in_person'],
      },
    },

    // 피드백 상태 관리
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      index: true,
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },

    // 관리자 응답
    adminResponse: {
      respondedBy: {
        type: String,
        trim: true,
      },
      responseMessage: {
        type: String,
        trim: true,
        maxlength: [1000, '응답 메시지는 1000자 이하여야 합니다'],
      },
      respondedAt: {
        type: Date,
      },
      resolutionAction: {
        type: String,
        enum: ['fixed', 'feature_added', 'explanation_provided', 'escalated', 'no_action_needed'],
      },
    },

    // 후속 조치
    followUp: {
      required: {
        type: Boolean,
        default: false,
      },
      scheduledDate: {
        type: Date,
      },
      completedAt: {
        type: Date,
      },
      notes: {
        type: String,
        maxlength: [500, '후속 조치 노트는 500자 이하여야 합니다'],
      },
    },

    // 익명 여부
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // 공개 여부 (다른 사용자들이 볼 수 있는지)
    isPublic: {
      type: Boolean,
      default: false,
    },

    // 도움됨 투표
    helpfulVotes: {
      type: Number,
      default: 0,
    },

    // 투표한 사용자들
    votedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // 첨부 파일
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 자동 태그
    autoTags: [
      {
        type: String,
        trim: true,
      },
    ],

    // 감정 분석 결과
    sentimentAnalysis: {
      score: {
        type: Number,
        min: -1,
        max: 1,
      },
      magnitude: {
        type: Number,
        min: 0,
        max: 1,
      },
      emotion: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
    },

    // 관련 피드백
    relatedFeedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
      },
    ],

    // 스팸 체크
    isSpam: {
      type: Boolean,
      default: false,
    },

    spamScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 인덱스 설정
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ rating: 1, createdAt: -1 });
feedbackSchema.index({ priority: 1, status: 1 });
feedbackSchema.index({ 'details.matching.matchId': 1 });
feedbackSchema.index({ isPublic: 1, helpfulVotes: -1 });
feedbackSchema.index({ createdAt: -1 });

// 가상 필드
feedbackSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

feedbackSchema.virtual('match', {
  ref: 'Match',
  localField: 'details.matching.matchId',
  foreignField: '_id',
  justOne: true,
});

// 정적 메서드: 평균 평점 계산
feedbackSchema.statics.getAverageRating = function (type = null) {
  const match = type ? { type } : {};

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalCount: { $sum: 1 },
      },
    },
  ]);
};

// 정적 메서드: 타입별 통계
feedbackSchema.statics.getTypeStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        latestFeedback: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// 정적 메서드: 우선순위 높은 피드백
feedbackSchema.statics.getHighPriorityFeedback = function () {
  return this.find({
    priority: { $in: ['high', 'urgent'] },
    status: { $in: ['pending', 'reviewing'] },
  })
    .populate('userId', 'name email age')
    .sort({ priority: -1, createdAt: -1 });
};

// 정적 메서드: 4060세대 맞춤 피드백 분석
feedbackSchema.statics.getSeniorAnalytics = function () {
  return this.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    {
      $match: {
        'userInfo.age': { $in: ['40-45', '46-50', '51-55', '56-60', '60+'] },
      },
    },
    {
      $group: {
        _id: {
          type: '$type',
          ageGroup: '$userInfo.age',
        },
        count: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        commonIssues: { $push: '$category' },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// 인스턴스 메서드: 자동 태그 생성
feedbackSchema.methods.generateAutoTags = function () {
  const tags = [];

  // 평점 기반 태그
  if (this.rating <= 2) tags.push('낮은만족도');
  else if (this.rating >= 4) tags.push('높은만족도');

  // 유형 기반 태그
  const typeTagMap = {
    matching: '매칭',
    service: '서비스',
    meeting: '만남',
    technical: '기술',
    suggestion: '제안',
  };
  tags.push(typeTagMap[this.type]);

  // 내용 기반 키워드 추출 (간단한 버전)
  const keywords = ['어려움', '불편', '좋음', '개선', '버그', '속도', '사용성'];
  keywords.forEach(keyword => {
    if (this.content.includes(keyword)) {
      tags.push(keyword);
    }
  });

  this.autoTags = [...new Set(tags)]; // 중복 제거
  return this.autoTags;
};

// 인스턴스 메서드: 우선순위 자동 설정
feedbackSchema.methods.calculatePriority = function () {
  let priority = 'low';

  // 낮은 평점 = 높은 우선순위
  if (this.rating <= 2) priority = 'high';
  else if (this.rating === 3) priority = 'medium';

  // 기술적 문제 = 높은 우선순위
  if (this.type === 'technical') priority = 'high';

  // 안전 문제 = 긴급
  if (this.details?.meeting?.reportSafetyIssue) priority = 'urgent';

  // 키워드 기반 우선순위 조정
  const urgentKeywords = ['버그', '오류', '작동안함', '접속불가', '결제문제'];
  if (urgentKeywords.some(keyword => this.content.includes(keyword))) {
    priority = 'urgent';
  }

  this.priority = priority;
  return priority;
};

module.exports = mongoose.model('Feedback', feedbackSchema);
