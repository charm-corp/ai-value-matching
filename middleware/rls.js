const mongoose = require('mongoose');

/**
 * RLS (Row Level Security) Middleware for MongoDB
 * 어플리케이션 레벨에서 MongoDB 데이터 접근을 제어하는 보안 미들웨어
 */

class RLSContext {
  constructor(userId, role = 'user', permissions = []) {
    this.userId = userId;
    this.role = role;
    this.permissions = permissions;
    this.timestamp = new Date();
  }

  // 사용자가 특정 리소스에 접근할 수 있는지 확인
  canAccess(resourceType, resourceData, operation = 'read') {
    const policy = RLS_POLICIES[resourceType];
    if (!policy || !policy[operation]) {
      return false;
    }

    return policy[operation](this, resourceData);
  }

  // 관리자 권한 확인
  isAdmin() {
    return this.role === 'admin' || this.role === 'system';
  }

  // 시스템 권한 확인 (매칭 알고리즘 등)
  isSystem() {
    return this.role === 'system';
  }
}

/**
 * 매칭 플랫폼 특화 RLS 정책 정의
 */
const RLS_POLICIES = {
  // 사용자 프로필 정책
  User: {
    read: (context, user) => {
      // 관리자는 모든 사용자 조회 가능
      if (context.isAdmin()) return true;

      // 본인 프로필은 항상 조회 가능
      if (user._id && user._id.toString() === context.userId) return true;

      // 매칭된 사용자의 프로필만 조회 가능 (기본 정보만)
      return context.canViewMatchedUserProfile(user._id);
    },

    update: (context, user) => {
      // 관리자는 모든 사용자 수정 가능
      if (context.isAdmin()) return true;

      // 본인 프로필만 수정 가능
      return user._id && user._id.toString() === context.userId;
    },

    delete: (context, user) => {
      // 관리자만 삭제 가능
      if (context.isAdmin()) return true;

      // 본인 계정 비활성화만 가능 (실제 삭제는 관리자만)
      return user._id && user._id.toString() === context.userId;
    },
  },

  // 매치 정책
  Match: {
    read: (context, match) => {
      // 관리자/시스템은 모든 매치 조회 가능
      if (context.isAdmin() || context.isSystem()) return true;

      // 매치 참여자만 조회 가능
      return (
        match.user1 && match.user1.toString() === context.userId ||
        match.user2 && match.user2.toString() === context.userId
      );
    },

    update: (context, match) => {
      // 관리자/시스템은 모든 매치 수정 가능
      if (context.isAdmin() || context.isSystem()) return true;

      // 매치 참여자는 자신의 응답만 수정 가능
      return (
        match.user1 && match.user1.toString() === context.userId ||
        match.user2 && match.user2.toString() === context.userId
      );
    },

    create: (context, matchData) => {
      // 시스템(매칭 알고리즘)만 새 매치 생성 가능
      return context.isSystem() || context.isAdmin();
    },

    delete: (context, match) => {
      // 관리자만 매치 삭제 가능
      return context.isAdmin();
    },
  },

  // 대화 정책
  Conversation: {
    read: (context, conversation) => {
      // 관리자는 모든 대화 조회 가능
      if (context.isAdmin()) return true;

      // 대화 참여자만 조회 가능
      return conversation.participants && 
             conversation.participants.some(p => p.toString() === context.userId);
    },

    update: (context, conversation) => {
      // 관리자는 모든 대화 수정 가능
      if (context.isAdmin()) return true;

      // 대화 참여자만 설정 수정 가능
      return conversation.participants && 
             conversation.participants.some(p => p.toString() === context.userId);
    },

    create: (context, conversationData) => {
      // 매치된 사용자들만 대화 시작 가능
      if (context.isAdmin()) return true;

      // 본인이 참여자 중 하나여야 함
      return conversationData.participants && 
             conversationData.participants.includes(context.userId);
    },

    delete: (context, conversation) => {
      // 관리자만 대화 삭제 가능 (참여자는 아카이빙만 가능)
      return context.isAdmin();
    },
  },

  // 메시지 정책
  Message: {
    read: (context, message, conversation) => {
      // 관리자는 모든 메시지 조회 가능
      if (context.isAdmin()) return true;

      // 대화 참여자만 메시지 조회 가능
      if (conversation) {
        return conversation.participants && 
               conversation.participants.some(p => p.toString() === context.userId);
      }

      // conversation 정보가 없으면 메시지의 conversationId로 확인 필요
      return true; // 추후 conversation 조회 후 검증
    },

    create: (context, messageData, conversation) => {
      // 관리자/시스템은 모든 메시지 생성 가능
      if (context.isAdmin() || context.isSystem()) return true;

      // 본인만 메시지 발송 가능
      if (messageData.sender !== context.userId) return false;

      // 대화 참여자만 메시지 발송 가능
      if (conversation) {
        return conversation.participants && 
               conversation.participants.some(p => p.toString() === context.userId);
      }

      return true; // 추후 conversation 조회 후 검증
    },

    update: (context, message) => {
      // 관리자는 모든 메시지 수정 가능
      if (context.isAdmin()) return true;

      // 본인이 발송한 메시지만 수정 가능 (30분 이내)
      if (message.sender.toString() !== context.userId) return false;

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      return message.timestamp > thirtyMinutesAgo;
    },

    delete: (context, message) => {
      // 관리자는 모든 메시지 삭제 가능
      if (context.isAdmin()) return true;

      // 본인이 발송한 메시지만 삭제 가능 (24시간 이내)
      if (message.sender.toString() !== context.userId) return false;

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return message.timestamp > twentyFourHoursAgo;
    },
  },

  // 가치관 평가 정책
  ValuesAssessment: {
    read: (context, assessment) => {
      // 관리자/시스템은 모든 평가 조회 가능
      if (context.isAdmin() || context.isSystem()) return true;

      // 본인의 평가만 조회 가능
      return assessment.userId && assessment.userId.toString() === context.userId;
    },

    update: (context, assessment) => {
      // 관리자는 모든 평가 수정 가능
      if (context.isAdmin()) return true;

      // 본인의 평가만 수정 가능 (완료되지 않은 경우만)
      return assessment.userId && assessment.userId.toString() === context.userId && 
             !assessment.isCompleted;
    },

    create: (context, assessmentData) => {
      // 본인의 평가만 생성 가능
      return assessmentData.userId === context.userId || context.isAdmin();
    },

    delete: (context, assessment) => {
      // 관리자만 평가 삭제 가능
      return context.isAdmin();
    },
  },
};

/**
 * RLS 컨텍스트 확장 메서드
 */
RLSContext.prototype.canViewMatchedUserProfile = async function(targetUserId) {
  try {
    const Match = mongoose.model('Match');
    
    // 상호 매치된 사용자인지 확인
    const mutualMatch = await Match.findOne({
      $or: [
        { user1: this.userId, user2: targetUserId },
        { user1: targetUserId, user2: this.userId }
      ],
      status: 'mutual_match'
    });

    return !!mutualMatch;
  } catch (error) {
    console.error('Error checking matched user profile access:', error);
    return false;
  }
};

/**
 * RLS 미들웨어 함수들
 */

// RLS 컨텍스트 설정 미들웨어
const setRLSContext = (req, res, next) => {
  try {
    if (req.user) {
      // 인증된 사용자의 경우 RLS 컨텍스트 생성
      req.rlsContext = new RLSContext(
        req.user._id.toString(),
        req.user.role || 'user',
        req.user.permissions || []
      );
    } else {
      // 인증되지 않은 사용자의 경우 제한적 컨텍스트
      req.rlsContext = new RLSContext(null, 'anonymous', []);
    }

    next();
  } catch (error) {
    console.error('Error setting RLS context:', error);
    res.status(500).json({
      success: false,
      error: 'RLS 컨텍스트 설정 중 오류가 발생했습니다.',
    });
  }
};

// 시스템 권한으로 RLS 컨텍스트 설정 (매칭 알고리즘용)
const setSystemRLSContext = (req, res, next) => {
  req.rlsContext = new RLSContext('system', 'system', ['all']);
  next();
};

// 리소스 접근 권한 확인 미들웨어
const checkResourceAccess = (resourceType, operation = 'read') => {
  return async (req, res, next) => {
    try {
      if (!req.rlsContext) {
        return res.status(401).json({
          success: false,
          error: 'RLS 컨텍스트가 설정되지 않았습니다.',
        });
      }

      // 요청된 리소스 정보 추출
      let resourceData = null;
      
      if (req.params.id) {
        // 특정 리소스 ID가 있는 경우 해당 리소스 조회
        const Model = mongoose.model(resourceType);
        resourceData = await Model.findById(req.params.id);
        
        if (!resourceData) {
          return res.status(404).json({
            success: false,
            error: '리소스를 찾을 수 없습니다.',
          });
        }
      } else if (operation === 'create') {
        // 생성 요청의 경우 요청 데이터 사용
        resourceData = req.body;
      }

      // 접근 권한 확인
      const hasAccess = req.rlsContext.canAccess(resourceType, resourceData, operation);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: '해당 리소스에 대한 접근 권한이 없습니다.',
          code: 'RLS_ACCESS_DENIED',
          details: {
            resourceType,
            operation,
            userId: req.rlsContext.userId,
            role: req.rlsContext.role,
          },
        });
      }

      // 리소스 데이터를 req에 첨부 (중복 조회 방지)
      if (resourceData && req.params.id) {
        req.resourceData = resourceData;
      }

      next();
    } catch (error) {
      console.error('RLS access check error:', error);
      res.status(500).json({
        success: false,
        error: 'RLS 접근 권한 확인 중 오류가 발생했습니다.',
      });
    }
  };
};

// MongoDB 쿼리에 RLS 필터 자동 적용
const applyRLSFilter = (Model, operation = 'find') => {
  return function(filter = {}, options = {}) {
    const req = this.req || {}; // Express 미들웨어에서 설정된 req 객체
    const rlsContext = req.rlsContext;

    if (!rlsContext) {
      throw new Error('RLS 컨텍스트가 설정되지 않았습니다.');
    }

    // 관리자/시스템은 필터 적용 안함
    if (rlsContext.isAdmin() || rlsContext.isSystem()) {
      return Model[operation](filter, options);
    }

    // 모델별 RLS 필터 적용
    const modelName = Model.modelName;
    let rlsFilter = { ...filter };

    switch (modelName) {
      case 'User':
        // 기본적으로는 본인 정보만 조회 가능 (매칭된 사용자는 별도 로직으로 처리)
        if (!filter._id && !filter.email) {
          rlsFilter._id = rlsContext.userId;
        }
        break;

      case 'Match':
        // 본인이 참여한 매치만 조회 가능
        rlsFilter.$or = [
          { user1: rlsContext.userId },
          { user2: rlsContext.userId }
        ];
        break;

      case 'Conversation':
        // 본인이 참여한 대화만 조회 가능
        rlsFilter.participants = rlsContext.userId;
        break;

      case 'Message':
        // 본인이 참여한 대화의 메시지만 조회 가능 (conversation 조회 후 필터링 필요)
        // 이 경우는 별도 로직으로 처리
        break;

      case 'ValuesAssessment':
        // 본인의 평가만 조회 가능
        rlsFilter.userId = rlsContext.userId;
        break;

      default:
        // 기본적으로는 본인과 관련된 데이터만 조회
        if (!rlsContext.isAdmin()) {
          rlsFilter.userId = rlsContext.userId;
        }
        break;
    }

    return Model[operation](rlsFilter, options);
  };
};

// RLS 로깅 미들웨어
const logRLSActivity = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // RLS 활동 로그 기록
    if (req.rlsContext && process.env.RLS_LOGGING === 'true') {
      console.log('RLS Activity:', {
        userId: req.rlsContext.userId,
        role: req.rlsContext.role,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString(),
      });
    }
    
    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  RLSContext,
  RLS_POLICIES,
  setRLSContext,
  setSystemRLSContext,
  checkResourceAccess,
  applyRLSFilter,
  logRLSActivity,
};