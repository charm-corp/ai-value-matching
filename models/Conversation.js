const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       required:
 *         - participants
 *         - matchId
 *       properties:
 *         _id:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: 참여자 사용자 ID 배열
 *         matchId:
 *           type: string
 *           description: 매치 ID 참조
 *         lastMessage:
 *           type: object
 *           description: 마지막 메시지
 *         isActive:
 *           type: boolean
 *           description: 대화 활성 상태
 *         startedAt:
 *           type: string
 *           format: date-time
 *         lastActivityAt:
 *           type: string
 *           format: date-time
 */

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: [true, '매치 ID는 필수입니다']
  },
  
  // 대화 메타데이터
  type: {
    type: String,
    enum: ['match', 'group', 'support'],
    default: 'match'
  },
  
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked', 'ended'],
    default: 'active'
  },
  
  // 마지막 메시지 정보 (빠른 조회를 위함)
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date,
    type: {
      type: String,
      enum: ['text', 'image', 'emoji', 'system'],
      default: 'text'
    }
  },
  
  // 읽음 상태 추적
  readStatus: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  }],
  
  // 타이핑 상태
  typingUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 대화 설정
  settings: {
    notifications: {
      type: Boolean,
      default: true
    },
    messageRetention: {
      type: Number,
      default: 90, // 일
      description: '메시지 보관 기간 (일)'
    },
    autoArchive: {
      type: Boolean,
      default: true
    },
    autoArchiveAfterDays: {
      type: Number,
      default: 30
    }
  },
  
  // 대화 통계
  stats: {
    totalMessages: {
      type: Number,
      default: 0
    },
    messagesByUser: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      count: {
        type: Number,
        default: 0
      }
    }],
    averageResponseTime: {
      type: Number, // 분 단위
      default: 0
    },
    longestGap: {
      type: Number, // 시간 단위
      default: 0
    }
  },
  
  // 중요한 시점들
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  
  archivedAt: Date,
  
  endedAt: Date,
  
  // AI 분석
  aiAnalysis: {
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
      description: '전체 대화의 감정 점수'
    },
    
    engagementLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      description: '참여도 수준'
    },
    
    communicationStyle: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      style: {
        type: String,
        enum: ['formal', 'casual', 'friendly', 'romantic', 'humorous']
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1
      }
    }],
    
    topics: [{
      topic: String,
      frequency: Number,
      sentiment: Number
    }],
    
    compatibilityIndicators: {
      responsePattern: Number, // 응답 패턴 유사성
      topicAlignment: Number,   // 주제 일치도
      emotionalSync: Number     // 감정적 동조
    },
    
    lastAnalyzedAt: Date
  },
  
  // 모더레이션
  moderation: {
    flaggedMessages: [{
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      },
      reason: String,
      flaggedAt: Date,
      reviewed: {
        type: Boolean,
        default: false
      }
    }],
    
    warningsIssued: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      issuedAt: Date
    }],
    
    isMonitored: {
      type: Boolean,
      default: false
    }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 인덱스
conversationSchema.index({ participants: 1 });
conversationSchema.index({ matchId: 1 });
conversationSchema.index({ lastActivityAt: -1 });
conversationSchema.index({ status: 1, lastActivityAt: -1 });
conversationSchema.index({ 'participants': 1, 'lastActivityAt': -1 });

// 가상 필드
conversationSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

conversationSchema.virtual('daysSinceStart').get(function() {
  const diffTime = Date.now() - this.startedAt.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

conversationSchema.virtual('hoursSinceLastActivity').get(function() {
  const diffTime = Date.now() - this.lastActivityAt.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60));
});

// 미들웨어
conversationSchema.pre('save', function(next) {
  // 참여자가 2명인지 확인 (1:1 대화의 경우)
  if (this.type === 'match' && this.participants.length !== 2) {
    return next(new Error('매치 대화는 정확히 2명의 참여자가 필요합니다'));
  }
  
  // 읽음 상태 초기화 (새 대화의 경우)
  if (this.isNew) {
    this.participants.forEach(participantId => {
      this.readStatus.push({
        userId: participantId,
        lastReadAt: new Date(),
        unreadCount: 0
      });
      
      this.stats.messagesByUser.push({
        userId: participantId,
        count: 0
      });
    });
  }
  
  // 자동 아카이빙 체크
  if (this.settings.autoArchive && this.status === 'active') {
    const daysSinceLastActivity = this.hoursSinceLastActivity / 24;
    if (daysSinceLastActivity > this.settings.autoArchiveAfterDays) {
      this.status = 'archived';
      this.archivedAt = new Date();
    }
  }
  
  next();
});

// 메서드: 사용자의 읽지 않은 메시지 수 가져오기
conversationSchema.methods.getUnreadCount = function(userId) {
  const readStatus = this.readStatus.find(rs => 
    rs.userId.toString() === userId.toString()
  );
  return readStatus ? readStatus.unreadCount : 0;
};

// 메서드: 메시지 읽음 처리
conversationSchema.methods.markAsRead = function(userId, timestamp = new Date()) {
  const readStatus = this.readStatus.find(rs => 
    rs.userId.toString() === userId.toString()
  );
  
  if (readStatus) {
    readStatus.lastReadAt = timestamp;
    readStatus.unreadCount = 0;
  }
  
  return this.save();
};

// 메서드: 읽지 않은 메시지 수 증가
conversationSchema.methods.incrementUnreadCount = function(userId) {
  // 메시지를 보낸 사용자가 아닌 다른 참여자들의 읽지 않은 수 증가
  this.participants.forEach(participantId => {
    if (participantId.toString() !== userId.toString()) {
      const readStatus = this.readStatus.find(rs => 
        rs.userId.toString() === participantId.toString()
      );
      
      if (readStatus) {
        readStatus.unreadCount += 1;
      }
    }
  });
  
  return this.save();
};

// 메서드: 타이핑 상태 업데이트
conversationSchema.methods.updateTypingStatus = function(userId, isTyping) {
  if (isTyping) {
    // 기존 타이핑 상태 제거 후 새로 추가
    this.typingUsers = this.typingUsers.filter(tu => 
      tu.userId.toString() !== userId.toString()
    );
    
    this.typingUsers.push({
      userId: userId,
      startedAt: new Date()
    });
  } else {
    // 타이핑 상태 제거
    this.typingUsers = this.typingUsers.filter(tu => 
      tu.userId.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

// 메서드: 마지막 메시지 업데이트
conversationSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = {
    content: message.content,
    sender: message.sender,
    timestamp: message.timestamp || new Date(),
    type: message.type || 'text'
  };
  
  this.lastActivityAt = new Date();
  this.stats.totalMessages += 1;
  
  // 발신자의 메시지 수 증가
  const userStats = this.stats.messagesByUser.find(mbu => 
    mbu.userId.toString() === message.sender.toString()
  );
  
  if (userStats) {
    userStats.count += 1;
  }
  
  return this.save();
};

// 메서드: 상대방 정보 가져오기
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => 
    p.toString() !== userId.toString()
  );
};

// 메서드: 평균 응답 시간 계산
conversationSchema.methods.calculateAverageResponseTime = async function() {
  const Message = mongoose.model('Message');
  
  const messages = await Message.find({ conversationId: this._id })
    .sort({ timestamp: 1 })
    .limit(50); // 최근 50개 메시지만 분석
  
  let totalResponseTime = 0;
  let responseCount = 0;
  
  for (let i = 1; i < messages.length; i++) {
    const currentMsg = messages[i];
    const previousMsg = messages[i - 1];
    
    // 다른 사용자가 보낸 메시지에 대한 응답인 경우
    if (currentMsg.sender.toString() !== previousMsg.sender.toString()) {
      const responseTime = currentMsg.timestamp - previousMsg.timestamp;
      totalResponseTime += responseTime;
      responseCount++;
    }
  }
  
  if (responseCount > 0) {
    this.stats.averageResponseTime = Math.round(totalResponseTime / responseCount / (1000 * 60)); // 분 단위
    await this.save();
  }
  
  return this.stats.averageResponseTime;
};

// 정적 메서드: 사용자의 대화 찾기
conversationSchema.statics.findUserConversations = function(userId, status = 'active') {
  return this.find({
    participants: userId,
    status: status
  })
  .populate('participants', 'name profileImage lastActive')
  .populate('matchId')
  .sort({ lastActivityAt: -1 });
};

// 정적 메서드: 매치 대화 찾기
conversationSchema.statics.findByMatch = function(matchId) {
  return this.findOne({ matchId: matchId })
    .populate('participants', 'name profileImage lastActive');
};

// 정적 메서드: 오래된 대화 아카이빙
conversationSchema.statics.archiveOldConversations = function(daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.updateMany(
    {
      lastActivityAt: { $lt: cutoffDate },
      status: 'active',
      'settings.autoArchive': true
    },
    {
      $set: { 
        status: 'archived',
        archivedAt: new Date()
      }
    }
  );
};

module.exports = mongoose.model('Conversation', conversationSchema);