const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Match:
 *       type: object
 *       required:
 *         - user1
 *         - user2
 *         - compatibilityScore
 *       properties:
 *         _id:
 *           type: string
 *         user1:
 *           type: string
 *           description: 첫 번째 사용자 ID
 *         user2:
 *           type: string
 *           description: 두 번째 사용자 ID
 *         compatibilityScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: 호환성 점수
 *         status:
 *           type: string
 *           enum: ['pending', 'accepted', 'rejected', 'expired']
 *           description: 매치 상태
 *         matchedAt:
 *           type: string
 *           format: date-time
 *         respondedAt:
 *           type: string
 *           format: date-time
 *         expiresAt:
 *           type: string
 *           format: date-time
 */

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '첫 번째 사용자는 필수입니다']
  },
  
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '두 번째 사용자는 필수입니다']
  },
  
  // 호환성 점수 및 분석
  compatibilityScore: {
    type: Number,
    required: [true, '호환성 점수는 필수입니다'],
    min: 0,
    max: 100
  },
  
  compatibilityBreakdown: {
    valuesAlignment: {
      type: Number,
      min: 0,
      max: 100,
      description: '가치관 일치도'
    },
    personalityCompatibility: {
      type: Number,
      min: 0,
      max: 100,
      description: '성격 호환성'
    },
    lifestyleMatch: {
      type: Number,
      min: 0,
      max: 100,
      description: '라이프스타일 일치도'
    },
    interestOverlap: {
      type: Number,
      min: 0,
      max: 100,
      description: '관심사 중복도'
    },
    communicationStyle: {
      type: Number,
      min: 0,
      max: 100,
      description: '소통 스타일 호환성'
    }
  },
  
  // 매치 상태
  status: {
    type: String,
    enum: {
      values: ['pending', 'user1_liked', 'user2_liked', 'mutual_match', 'user1_passed', 'user2_passed', 'expired'],
      message: '유효한 매치 상태를 선택해주세요'
    },
    default: 'pending'
  },
  
  // 개별 사용자 반응
  user1Response: {
    action: {
      type: String,
      enum: ['none', 'like', 'pass', 'super_like'],
      default: 'none'
    },
    respondedAt: Date,
    note: String
  },
  
  user2Response: {
    action: {
      type: String,
      enum: ['none', 'like', 'pass', 'super_like'],
      default: 'none'
    },
    respondedAt: Date,
    note: String
  },
  
  // 타이밍
  matchedAt: {
    type: Date,
    default: Date.now
  },
  
  mutualMatchAt: {
    type: Date
  },
  
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후 만료
    }
  },
  
  // 매치 메타데이터
  matchReason: {
    primaryFactors: [{
      factor: {
        type: String,
        enum: [
          'shared_values', 'personality_complement', 'lifestyle_match',
          'common_interests', 'geographic_proximity', 'age_compatibility',
          'communication_style', 'life_goals_alignment'
        ]
      },
      strength: {
        type: Number,
        min: 0,
        max: 100
      },
      description: String
    }],
    
    algorithmVersion: {
      type: String,
      default: '1.0'
    },
    
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100,
      description: 'AI의 매치 확신도'
    }
  },
  
  // 상호작용 기록
  interactions: [{
    type: {
      type: String,
      enum: ['view', 'like', 'pass', 'message', 'profile_visit', 'photo_view']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // 대화 관련
  conversationStarted: {
    type: Boolean,
    default: false
  },
  
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  
  firstMessageAt: Date,
  
  lastInteractionAt: {
    type: Date,
    default: Date.now
  },
  
  // 성공 지표
  meetingArranged: {
    type: Boolean,
    default: false
  },
  
  meetingArrangedAt: Date,
  
  relationship: {
    status: {
      type: String,
      enum: ['none', 'dating', 'exclusive', 'ended'],
      default: 'none'
    },
    startedAt: Date,
    endedAt: Date
  },
  
  // 피드백
  feedback: {
    user1Feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      wouldRecommend: Boolean,
      submittedAt: Date
    },
    user2Feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      wouldRecommend: Boolean,
      submittedAt: Date
    }
  },
  
  // 분석 데이터
  analytics: {
    profileViewsAfterMatch: {
      type: Number,
      default: 0
    },
    messagesExchanged: {
      type: Number,
      default: 0
    },
    responseTime: {
      user1AvgMinutes: Number,
      user2AvgMinutes: Number
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      description: '매치 품질 점수'
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 복합 인덱스
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });
matchSchema.index({ user1: 1, status: 1 });
matchSchema.index({ user2: 1, status: 1 });
matchSchema.index({ status: 1, expiresAt: 1 });
matchSchema.index({ compatibilityScore: -1 });
matchSchema.index({ matchedAt: -1 });
matchSchema.index({ mutualMatchAt: -1 });

// 가상 필드
matchSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

matchSchema.virtual('isMutualMatch').get(function() {
  return this.status === 'mutual_match';
});

matchSchema.virtual('daysSinceMatch').get(function() {
  const diffTime = Date.now() - this.matchedAt.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

matchSchema.virtual('compatibilityLevel').get(function() {
  if (this.compatibilityScore >= 90) {return 'excellent';}
  if (this.compatibilityScore >= 80) {return 'very_good';}
  if (this.compatibilityScore >= 70) {return 'good';}
  if (this.compatibilityScore >= 60) {return 'fair';}
  return 'low';
});

// 미들웨어
matchSchema.pre('save', function(next) {
  // 사용자가 자기 자신과 매치되지 않도록 확인
  if (this.user1.toString() === this.user2.toString()) {
    return next(new Error('사용자는 자기 자신과 매치될 수 없습니다'));
  }
  
  // 상태 업데이트 로직
  if (this.user1Response.action === 'like' && this.user2Response.action === 'like') {
    this.status = 'mutual_match';
    if (!this.mutualMatchAt) {
      this.mutualMatchAt = new Date();
    }
  } else if (this.user1Response.action === 'pass' || this.user2Response.action === 'pass') {
    this.status = this.user1Response.action === 'pass' ? 'user1_passed' : 'user2_passed';
  } else if (this.user1Response.action === 'like') {
    this.status = 'user1_liked';
  } else if (this.user2Response.action === 'like') {
    this.status = 'user2_liked';
  }
  
  // 만료 체크
  if (this.expiresAt < new Date() && this.status === 'pending') {
    this.status = 'expired';
  }
  
  // 마지막 상호작용 시간 업데이트
  this.lastInteractionAt = new Date();
  
  next();
});

// 메서드: 사용자의 응답 설정
matchSchema.methods.setUserResponse = function(userId, action, note = '') {
  const userIdStr = userId.toString();
  
  if (this.user1.toString() === userIdStr) {
    this.user1Response.action = action;
    this.user1Response.respondedAt = new Date();
    this.user1Response.note = note;
  } else if (this.user2.toString() === userIdStr) {
    this.user2Response.action = action;
    this.user2Response.respondedAt = new Date();
    this.user2Response.note = note;
  } else {
    throw new Error('사용자가 이 매치에 포함되지 않습니다');
  }
  
  // 상호작용 기록 추가
  this.interactions.push({
    type: action,
    userId: userId,
    timestamp: new Date()
  });
  
  return this.save();
};

// 메서드: 상대방 정보 가져오기
matchSchema.methods.getOtherUser = function(userId) {
  const userIdStr = userId.toString();
  
  if (this.user1.toString() === userIdStr) {
    return this.user2;
  } else if (this.user2.toString() === userIdStr) {
    return this.user1;
  } else {
    return null;
  }
};

// 메서드: 사용자의 응답 상태 확인
matchSchema.methods.getUserResponseStatus = function(userId) {
  const userIdStr = userId.toString();
  
  if (this.user1.toString() === userIdStr) {
    return this.user1Response;
  } else if (this.user2.toString() === userIdStr) {
    return this.user2Response;
  } else {
    return null;
  }
};

// 메서드: 매치 품질 점수 계산
matchSchema.methods.calculateQualityScore = function() {
  let score = this.compatibilityScore * 0.6; // 호환성이 60% 비중
  
  // 상호작용 품질 (20% 비중)
  const interactionScore = Math.min(this.analytics.messagesExchanged * 2, 100);
  score += interactionScore * 0.2;
  
  // 응답 시간 (10% 비중)
  const avgResponseTime = (
    (this.analytics.responseTime?.user1AvgMinutes || 1440) +
    (this.analytics.responseTime?.user2AvgMinutes || 1440)
  ) / 2;
  const responseScore = Math.max(0, 100 - (avgResponseTime / 60)); // 1시간 기준
  score += responseScore * 0.1;
  
  // 관계 진전도 (10% 비중)
  let progressScore = 0;
  if (this.conversationStarted) {progressScore += 25;}
  if (this.meetingArranged) {progressScore += 50;}
  if (this.relationship.status !== 'none') {progressScore += 25;}
  
  score += progressScore * 0.1;
  
  this.analytics.qualityScore = Math.round(score);
  return this.analytics.qualityScore;
};

// 정적 메서드: 사용자의 매치 찾기
matchSchema.statics.findUserMatches = function(userId, status = null) {
  const query = {
    $or: [
      { user1: userId },
      { user2: userId }
    ]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('user1', '-password')
    .populate('user2', '-password')
    .sort({ matchedAt: -1 });
};

// 정적 메서드: 상호 매치 찾기
matchSchema.statics.findMutualMatches = function(userId) {
  return this.findUserMatches(userId, 'mutual_match');
};

// 정적 메서드: 만료된 매치 정리
matchSchema.statics.cleanExpiredMatches = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: 'pending'
    },
    {
      $set: { status: 'expired' }
    }
  );
};

// 정적 메서드: 매치 통계
matchSchema.statics.getMatchingStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgCompatibilityScore: { $avg: '$compatibilityScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('Match', matchSchema);