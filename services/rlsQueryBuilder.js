const mongoose = require('mongoose');

/**
 * RLS Query Builder
 * MongoDB 쿼리에 자동으로 RLS 필터를 적용하는 서비스
 */

class RLSQueryBuilder {
  constructor(rlsContext) {
    this.context = rlsContext;
    this.model = null;
    this.query = {};
    this.population = [];
    this.sorting = {};
    this.limitation = null;
    this.projection = {};
  }

  // 모델 설정
  setModel(Model) {
    this.model = Model;
    return this;
  }

  // 기본 쿼리 조건 설정
  where(conditions) {
    this.query = { ...this.query, ...conditions };
    return this;
  }

  // populate 설정
  populate(path, select = null) {
    this.population.push({ path, select });
    return this;
  }

  // 정렬 설정
  sort(sortOptions) {
    this.sorting = { ...this.sorting, ...sortOptions };
    return this;
  }

  // 제한 설정
  limit(count) {
    this.limitation = count;
    return this;
  }

  // 필드 선택 설정
  select(fields) {
    this.projection = fields;
    return this;
  }

  // RLS 필터 적용
  applyRLSFilter() {
    if (!this.model) {
      throw new Error('모델이 설정되지 않았습니다.');
    }

    const modelName = this.model.modelName;
    
    // 관리자/시스템은 필터 적용 안함
    if (this.context.isAdmin() || this.context.isSystem()) {
      return this;
    }

    const rlsFilter = this.getRLSFilterForModel(modelName);
    
    // 기존 쿼리와 RLS 필터 병합
    if (rlsFilter) {
      this.query = this.mergeFilters(this.query, rlsFilter);
    }

    return this;
  }

  // 모델별 RLS 필터 생성
  getRLSFilterForModel(modelName) {
    const userId = this.context.userId;

    switch (modelName) {
      case 'User':
        return this.getUserRLSFilter(userId);
      
      case 'Match':
        return {
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        };
      
      case 'Conversation':
        return {
          participants: userId
        };
      
      case 'Message':
        // 메시지는 대화 참여자만 조회 가능하므로 복합 쿼리 필요
        return this.getMessageRLSFilter(userId);
      
      case 'ValuesAssessment':
        return {
          userId: userId
        };
      
      case 'Feedback':
        return {
          $or: [
            { fromUser: userId },
            { toUser: userId }
          ]
        };
      
      default:
        // 기본적으로 userId 필드가 있으면 본인 데이터만 조회
        return { userId: userId };
    }
  }

  // 사용자 RLS 필터 (매칭된 사용자 포함)
  getUserRLSFilter(userId) {
    // 기본적으로는 본인만 조회
    let baseFilter = { _id: userId };

    // 매칭된 사용자도 조회 가능하도록 확장 (별도 메서드로 처리)
    // 이는 실제 쿼리 실행 시 동적으로 계산됨
    return baseFilter;
  }

  // 메시지 RLS 필터 (대화 참여자 확인)
  getMessageRLSFilter(userId) {
    // 서브쿼리를 통해 본인이 참여한 대화의 메시지만 조회
    return {
      conversationId: {
        $in: this.getParticipatingConversationIds(userId)
      }
    };
  }

  // 참여 중인 대화 ID 목록 조회
  async getParticipatingConversationIds(userId) {
    try {
      const Conversation = mongoose.model('Conversation');
      const conversations = await Conversation.find(
        { participants: userId },
        { _id: 1 }
      );
      
      return conversations.map(conv => conv._id);
    } catch (error) {
      console.error('Error getting participating conversations:', error);
      return [];
    }
  }

  // 필터 병합 (복잡한 쿼리 조건 처리)
  mergeFilters(existingFilter, rlsFilter) {
    // 기존 필터가 비어있으면 RLS 필터만 반환
    if (Object.keys(existingFilter).length === 0) {
      return rlsFilter;
    }

    // $and 연산자로 병합
    return {
      $and: [
        existingFilter,
        rlsFilter
      ]
    };
  }

  // 매칭된 사용자 프로필 조회 권한 확인
  async canViewUserProfile(targetUserId) {
    if (!this.context.userId) return false;
    if (this.context.isAdmin()) return true;
    if (this.context.userId === targetUserId) return true;

    // 상호 매치된 사용자인지 확인
    const Match = mongoose.model('Match');
    const mutualMatch = await Match.findOne({
      $or: [
        { user1: this.context.userId, user2: targetUserId },
        { user1: targetUserId, user2: this.context.userId }
      ],
      status: 'mutual_match'
    });

    return !!mutualMatch;
  }

  // 사용자 프로필 조회용 특별 필터
  async getUserProfileFilter() {
    const userId = this.context.userId;
    
    if (this.context.isAdmin()) {
      return {}; // 관리자는 모든 사용자 조회 가능
    }

    // 매칭된 사용자 ID 목록 조회
    const Match = mongoose.model('Match');
    const matches = await Match.find({
      $or: [
        { user1: userId },
        { user2: userId }
      ],
      status: 'mutual_match'
    });

    const matchedUserIds = matches.map(match => {
      return match.user1.toString() === userId ? match.user2 : match.user1;
    });

    // 본인 + 매칭된 사용자들만 조회 가능
    return {
      _id: {
        $in: [userId, ...matchedUserIds]
      }
    };
  }

  // 필드 레벨 보안 적용 (민감한 정보 제외)
  applyFieldLevelSecurity() {
    if (!this.model) return this;

    const modelName = this.model.modelName;
    
    // 관리자는 모든 필드 조회 가능
    if (this.context.isAdmin()) return this;

    switch (modelName) {
      case 'User':
        // 다른 사용자의 경우 민감한 정보 제외
        if (!this.isOwnResource()) {
          this.select('-email -phone -location.coordinates -occupation.income -socialProviders');
        }
        break;
      
      case 'Match':
        // 매치 상세 분석 정보는 양측 모두 수락한 경우만 공개
        if (!this.isMutualMatch()) {
          this.select('-compatibilityBreakdown -matchReason -aiAnalysis');
        }
        break;
      
      case 'Message':
        // 삭제된 메시지는 내용 숨김 (transform에서 처리)
        break;
      
      default:
        break;
    }

    return this;
  }

  // 본인 리소스인지 확인
  isOwnResource() {
    if (this.query._id) {
      return this.query._id.toString() === this.context.userId;
    }
    if (this.query.userId) {
      return this.query.userId.toString() === this.context.userId;
    }
    return false;
  }

  // 상호 매치인지 확인
  isMutualMatch() {
    if (this.query.status) {
      return this.query.status === 'mutual_match';
    }
    return false;
  }

  // 쿼리 실행
  async execute() {
    if (!this.model) {
      throw new Error('모델이 설정되지 않았습니다.');
    }

    // RLS 필터 적용
    this.applyRLSFilter();
    
    // 필드 레벨 보안 적용
    this.applyFieldLevelSecurity();

    // 쿼리 빌드
    let query = this.model.find(this.query);

    // projection 적용
    if (Object.keys(this.projection).length > 0) {
      query = query.select(this.projection);
    }

    // population 적용
    this.population.forEach(pop => {
      query = query.populate(pop.path, pop.select);
    });

    // 정렬 적용
    if (Object.keys(this.sorting).length > 0) {
      query = query.sort(this.sorting);
    }

    // 제한 적용
    if (this.limitation) {
      query = query.limit(this.limitation);
    }

    return await query.exec();
  }

  // 단일 문서 조회
  async findOne() {
    if (!this.model) {
      throw new Error('모델이 설정되지 않았습니다.');
    }

    this.applyRLSFilter();
    this.applyFieldLevelSecurity();

    let query = this.model.findOne(this.query);

    if (Object.keys(this.projection).length > 0) {
      query = query.select(this.projection);
    }

    this.population.forEach(pop => {
      query = query.populate(pop.path, pop.select);
    });

    return await query.exec();
  }

  // 개수 조회
  async count() {
    if (!this.model) {
      throw new Error('모델이 설정되지 않았습니다.');
    }

    this.applyRLSFilter();
    
    return await this.model.countDocuments(this.query);
  }

  // 업데이트 (RLS 검증 포함)
  async updateOne(updateData) {
    if (!this.model) {
      throw new Error('모델이 설정되지 않았습니다.');
    }

    // 업데이트 권한 확인
    const document = await this.findOne();
    if (!document) {
      throw new Error('업데이트할 문서를 찾을 수 없습니다.');
    }

    const hasUpdateAccess = this.context.canAccess(
      this.model.modelName, 
      document, 
      'update'
    );

    if (!hasUpdateAccess) {
      throw new Error('업데이트 권한이 없습니다.');
    }

    return await this.model.updateOne(this.query, updateData);
  }

  // 삭제 (RLS 검증 포함)
  async deleteOne() {
    if (!this.model) {
      throw new Error('모델이 설정되지 않았습니다.');
    }

    const document = await this.findOne();
    if (!document) {
      throw new Error('삭제할 문서를 찾을 수 없습니다.');
    }

    const hasDeleteAccess = this.context.canAccess(
      this.model.modelName, 
      document, 
      'delete'
    );

    if (!hasDeleteAccess) {
      throw new Error('삭제 권한이 없습니다.');
    }

    return await this.model.deleteOne(this.query);
  }
}

// RLS Query Builder 팩토리 함수
const createRLSQuery = (rlsContext) => {
  return new RLSQueryBuilder(rlsContext);
};

// 편의 메서드들
const rlsFind = (Model, rlsContext, conditions = {}) => {
  return createRLSQuery(rlsContext)
    .setModel(Model)
    .where(conditions);
};

const rlsFindOne = (Model, rlsContext, conditions = {}) => {
  return createRLSQuery(rlsContext)
    .setModel(Model)
    .where(conditions)
    .findOne();
};

const rlsCount = (Model, rlsContext, conditions = {}) => {
  return createRLSQuery(rlsContext)
    .setModel(Model)
    .where(conditions)
    .count();
};

module.exports = {
  RLSQueryBuilder,
  createRLSQuery,
  rlsFind,
  rlsFindOne,
  rlsCount,
};