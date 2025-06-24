const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - conversationId
 *         - sender
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *         conversationId:
 *           type: string
 *           description: 대화 ID 참조
 *         sender:
 *           type: string
 *           description: 발신자 사용자 ID
 *         content:
 *           type: string
 *           description: 메시지 내용
 *         type:
 *           type: string
 *           enum: ['text', 'image', 'emoji', 'system', 'ai_suggestion']
 *           description: 메시지 타입
 *         timestamp:
 *           type: string
 *           format: date-time
 *         isEdited:
 *           type: boolean
 *         isDeleted:
 *           type: boolean
 */

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, '대화 ID는 필수입니다']
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '발신자는 필수입니다']
  },
  
  content: {
    type: String,
    required: [true, '메시지 내용은 필수입니다'],
    maxlength: [2000, '메시지는 2000자를 초과할 수 없습니다'],
    trim: true
  },
  
  type: {
    type: String,
    enum: {
      values: ['text', 'image', 'emoji', 'system', 'ai_suggestion', 'sticker', 'voice'],
      message: '유효한 메시지 타입을 선택해주세요'
    },
    default: 'text'
  },
  
  // 미디어 첨부 (이미지, 음성 등)
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'voice', 'file']
    },
    url: String,
    filename: String,
    size: Number, // bytes
    mimeType: String,
    thumbnail: String // 이미지의 경우 썸네일
  }],
  
  // 메시지 상태
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: Date,
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: Date,
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // 읽음 상태
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 반응 (이모지 등)
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      validate: {
        validator: function(v) {
          // 이모지 유니코드 패턴 검증
          return /^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u.test(v);
        },
        message: '유효한 이모지를 입력해주세요'
      }
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 답장 (스레드)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  // AI 관련
  aiGenerated: {
    type: Boolean,
    default: false
  },
  
  aiSuggestion: {
    type: {
      type: String,
      enum: ['conversation_starter', 'response_suggestion', 'topic_suggestion', 'icebreaker']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    used: {
      type: Boolean,
      default: false
    }
  },
  
  // 감정 분석
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1,
      description: '감정 점수 (-1: 매우 부정, 1: 매우 긍정)'
    },
    magnitude: {
      type: Number,
      min: 0,
      max: 1,
      description: '감정 강도'
    },
    emotions: [{
      emotion: {
        type: String,
        enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'excitement', 'anxiety']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    }]
  },
  
  // 언어 감지
  language: {
    type: String,
    default: 'ko'
  },
  
  // 모더레이션
  moderation: {
    flagged: {
      type: Boolean,
      default: false
    },
    flagReason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'explicit', 'other']
    },
    flaggedAt: Date,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approved: Boolean
  },
  
  // 메타데이터
  metadata: {
    platform: {
      type: String,
      enum: ['web', 'ios', 'android'],
      default: 'web'
    },
    version: String,
    ipAddress: String,
    userAgent: String
  }
  
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // 삭제된 메시지의 경우 내용 숨기기
      if (ret.isDeleted) {
        ret.content = '삭제된 메시지입니다';
        ret.attachments = [];
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// 인덱스
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ sender: 1, timestamp: -1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ conversationId: 1, isDeleted: 1, timestamp: -1 });
messageSchema.index({ 'moderation.flagged': 1, 'moderation.reviewed': 1 });

// 가상 필드
messageSchema.virtual('isRecent').get(function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return this.timestamp > fiveMinutesAgo;
});

messageSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

messageSchema.virtual('reactionCount').get(function() {
  return this.reactions.length;
});

messageSchema.virtual('hasAttachments').get(function() {
  return this.attachments && this.attachments.length > 0;
});

// 미들웨어
messageSchema.pre('save', function(next) {
  // 메시지 수정 시 편집 시간 기록
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  // 시스템 메시지의 경우 sender 검증 제외
  if (this.type === 'system' || this.type === 'ai_suggestion') {
    // 시스템 메시지는 특별 처리
  }
  
  next();
});

messageSchema.post('save', async function(doc) {
  try {
    // 대화의 마지막 메시지 업데이트
    const Conversation = mongoose.model('Conversation');
    const conversation = await Conversation.findById(doc.conversationId);
    
    if (conversation) {
      await conversation.updateLastMessage(doc);
      
      // 발신자가 아닌 다른 참여자들의 읽지 않은 메시지 수 증가
      if (doc.type !== 'system') {
        await conversation.incrementUnreadCount(doc.sender);
      }
    }
  } catch (error) {
    console.error('Error updating conversation after message save:', error);
  }
});

// 메서드: 메시지를 읽음으로 표시
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => 
    r.userId.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      userId: userId,
      readAt: new Date()
    });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// 메서드: 반응 추가/제거
messageSchema.methods.toggleReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(r => 
    r.userId.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (existingReaction) {
    // 기존 반응 제거
    this.reactions = this.reactions.filter(r => 
      !(r.userId.toString() === userId.toString() && r.emoji === emoji)
    );
  } else {
    // 새로운 반응 추가
    this.reactions.push({
      userId: userId,
      emoji: emoji,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// 메서드: 소프트 삭제
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  
  return this.save();
};

// 메서드: 메시지 편집
messageSchema.methods.editContent = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  
  return this.save();
};

// 메서드: 신고하기
messageSchema.methods.flag = function(reason, flaggedBy) {
  this.moderation.flagged = true;
  this.moderation.flagReason = reason;
  this.moderation.flaggedAt = new Date();
  this.moderation.flaggedBy = flaggedBy;
  
  return this.save();
};

// 메서드: 사용자가 읽었는지 확인
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => 
    r.userId.toString() === userId.toString()
  );
};

// 메서드: 감정 분석 결과 설정
messageSchema.methods.setSentimentAnalysis = function(sentimentData) {
  this.sentiment = {
    score: sentimentData.score,
    magnitude: sentimentData.magnitude,
    emotions: sentimentData.emotions || []
  };
  
  return this.save();
};

// 정적 메서드: 대화의 메시지 조회
messageSchema.statics.findByConversation = function(conversationId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    includeDeleted = false
  } = options;
  
  const query = { conversationId };
  
  if (!includeDeleted) {
    query.isDeleted = { $ne: true };
  }
  
  return this.find(query)
    .populate('sender', 'name profileImage')
    .populate('replyTo')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

// 정적 메서드: 읽지 않은 메시지 조회
messageSchema.statics.findUnreadForUser = function(userId, conversationId = null) {
  const query = {
    'readBy.userId': { $ne: userId },
    isDeleted: { $ne: true },
    sender: { $ne: userId }
  };
  
  if (conversationId) {
    query.conversationId = conversationId;
  }
  
  return this.find(query)
    .populate('sender', 'name profileImage')
    .populate('conversationId', 'participants')
    .sort({ timestamp: -1 });
};

// 정적 메서드: 신고된 메시지 조회
messageSchema.statics.findFlaggedMessages = function() {
  return this.find({
    'moderation.flagged': true,
    'moderation.reviewed': false
  })
  .populate('sender', 'name email')
  .populate('moderation.flaggedBy', 'name email')
  .sort({ 'moderation.flaggedAt': -1 });
};

// 정적 메서드: 메시지 통계
messageSchema.statics.getMessageStats = function(timeframe = 'day') {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        isDeleted: { $ne: true }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgSentimentScore: { $avg: '$sentiment.score' }
      }
    }
  ]);
};

module.exports = mongoose.model('Message', messageSchema);