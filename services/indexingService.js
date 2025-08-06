const mongoose = require('mongoose');

/**
 * Database Indexing Optimization Service
 * MongoDB 인덱스 최적화 및 쿼리 성능 향상
 */

class IndexingService {
  constructor() {
    this.indexStats = new Map();
    this.queryPatterns = new Map();
  }

  // 매칭 플랫폼 최적화 인덱스 생성
  async createOptimizedIndexes() {
    console.log('🔧 Creating optimized indexes for matching platform...');

    try {
      await Promise.all([
        this.createUserIndexes(),
        this.createMatchIndexes(),
        this.createConversationIndexes(),
        this.createMessageIndexes(),
        this.createValuesAssessmentIndexes()
      ]);

      console.log('✅ All optimized indexes created successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      return false;
    }
  }

  // 사용자 모델 인덱스 최적화
  async createUserIndexes() {
    const User = mongoose.model('User');
    const collection = User.collection;

    // 복합 인덱스들
    const indexes = [
      // 1. 매칭 최적화 인덱스 (가장 중요)
      {
        keys: { isActive: 1, isVerified: 1, age: 1, gender: 1, 'location.city': 1 },
        options: { 
          name: 'matching_optimization_idx',
          background: true,
          partialFilterExpression: { isActive: true, isVerified: true }
        }
      },

      // 2. 지리적 검색 인덱스
      {
        keys: { 'location.coordinates': '2dsphere' },
        options: { 
          name: 'location_geo_idx',
          background: true,
          partialFilterExpression: { 
            'location.coordinates': { $exists: true },
            isActive: true 
          }
        }
      },

      // 3. 로그인 최적화 인덱스
      {
        keys: { email: 1, isActive: 1 },
        options: { 
          name: 'login_optimization_idx',
          background: true,
          unique: false // email 필드는 이미 unique
        }
      },

      // 4. 활성 사용자 정렬 인덱스
      {
        keys: { isActive: 1, lastActive: -1 },
        options: { 
          name: 'active_users_sort_idx',
          background: true,
          partialFilterExpression: { isActive: true }
        }
      },

      // 5. 프로필 완성도 필터링
      {
        keys: { isProfileComplete: 1, isVerified: 1, createdAt: -1 },
        options: { 
          name: 'profile_complete_idx',
          background: true,
          partialFilterExpression: { isProfileComplete: true }
        }
      },

      // 6. 결혼 상태 및 연령 필터링
      {
        keys: { maritalStatus: 1, age: 1, hasChildren: 1 },
        options: { 
          name: 'demographic_filter_idx',
          background: true,
          sparse: true
        }
      },

      // 7. 직업 기반 검색
      {
        keys: { 'occupation.industry': 1, 'occupation.position': 1, age: 1 },
        options: { 
          name: 'occupation_search_idx',
          background: true,
          sparse: true
        }
      },

      // 8. 라이프스타일 매칭
      {
        keys: { 
          'lifestyle.socialLevel': 1, 
          'lifestyle.fitnessLevel': 1, 
          age: 1 
        },
        options: { 
          name: 'lifestyle_matching_idx',
          background: true,
          sparse: true
        }
      },

      // 9. 관심사 검색 (배열 인덱스)
      {
        keys: { interests: 1, age: 1, gender: 1 },
        options: { 
          name: 'interests_search_idx',
          background: true,
          sparse: true
        }
      },

      // 10. 온라인 상태 추적
      {
        keys: { isOnline: 1, lastActive: -1 },
        options: { 
          name: 'online_status_idx',
          background: true,
          partialFilterExpression: { isActive: true }
        }
      }
    ];

    // 인덱스 생성
    for (const index of indexes) {
      try {
        await collection.createIndex(index.keys, index.options);
        console.log(`✅ User index created: ${index.options.name}`);
      } catch (error) {
        if (error.code === 85) { // IndexOptionsConflict
          console.log(`⚠️ User index already exists: ${index.options.name}`);
        } else {
          console.error(`❌ Failed to create user index ${index.options.name}:`, error.message);
        }
      }
    }
  }

  // 매치 모델 인덱스 최적화
  async createMatchIndexes() {
    const Match = mongoose.model('Match');
    const collection = Match.collection;

    const indexes = [
      // 1. 사용자별 매치 조회 최적화 (가장 중요)
      {
        keys: { user1: 1, status: 1, matchedAt: -1 },
        options: { 
          name: 'user1_matches_idx',
          background: true
        }
      },
      {
        keys: { user2: 1, status: 1, matchedAt: -1 },
        options: { 
          name: 'user2_matches_idx',
          background: true
        }
      },

      // 2. 상호 매치 빠른 조회
      {
        keys: { user1: 1, user2: 1 },
        options: { 
          name: 'mutual_match_lookup_idx',
          background: true,
          unique: true
        }
      },

      // 3. 매치 상태별 정렬
      {
        keys: { status: 1, compatibilityScore: -1, matchedAt: -1 },
        options: { 
          name: 'match_status_ranking_idx',
          background: true
        }
      },

      // 4. 만료 매치 정리용
      {
        keys: { status: 1, expiresAt: 1 },
        options: { 
          name: 'match_expiry_cleanup_idx',
          background: true,
          partialFilterExpression: { 
            status: { $in: ['pending', 'user1_liked', 'user2_liked'] }
          }
        }
      },

      // 5. 호환성 점수 순 정렬
      {
        keys: { compatibilityScore: -1, matchedAt: -1 },
        options: { 
          name: 'compatibility_ranking_idx',
          background: true
        }
      },

      // 6. 상호 매치 시간순 정렬
      {
        keys: { status: 1, mutualMatchAt: -1 },
        options: { 
          name: 'mutual_match_timeline_idx',
          background: true,
          partialFilterExpression: { status: 'mutual_match' }
        }
      },

      // 7. 대화 시작된 매치 추적
      {
        keys: { conversationStarted: 1, firstMessageAt: -1 },
        options: { 
          name: 'conversation_started_idx',
          background: true,
          partialFilterExpression: { conversationStarted: true }
        }
      },

      // 8. 매칭 알고리즘 버전별 분석
      {
        keys: { 'matchReason.algorithmVersion': 1, compatibilityScore: -1 },
        options: { 
          name: 'algorithm_analysis_idx',
          background: true,
          sparse: true
        }
      }
    ];

    for (const index of indexes) {
      try {
        await collection.createIndex(index.keys, index.options);
        console.log(`✅ Match index created: ${index.options.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠️ Match index already exists: ${index.options.name}`);
        } else {
          console.error(`❌ Failed to create match index ${index.options.name}:`, error.message);
        }
      }
    }
  }

  // 대화 모델 인덱스 최적화
  async createConversationIndexes() {
    const Conversation = mongoose.model('Conversation');
    const collection = Conversation.collection;

    const indexes = [
      // 1. 사용자별 대화 목록 (가장 중요)
      {
        keys: { participants: 1, lastActivityAt: -1 },
        options: { 
          name: 'user_conversations_idx',
          background: true
        }
      },

      // 2. 매치별 대화 조회
      {
        keys: { matchId: 1 },
        options: { 
          name: 'match_conversation_lookup_idx',
          background: true,
          unique: true
        }
      },

      // 3. 활성 대화 필터링
      {
        keys: { status: 1, lastActivityAt: -1 },
        options: { 
          name: 'active_conversations_idx',
          background: true
        }
      },

      // 4. 사용자별 읽지 않은 메시지 추적
      {
        keys: { 
          participants: 1, 
          'readStatus.userId': 1, 
          'readStatus.unreadCount': -1 
        },
        options: { 
          name: 'unread_messages_idx',
          background: true,
          sparse: true
        }
      },

      // 5. 자동 아카이빙 대상 조회
      {
        keys: { 
          status: 1, 
          lastActivityAt: 1, 
          'settings.autoArchive': 1 
        },
        options: { 
          name: 'auto_archive_candidates_idx',
          background: true,
          partialFilterExpression: { 
            status: 'active',
            'settings.autoArchive': true
          }
        }
      }
    ];

    for (const index of indexes) {
      try {
        await collection.createIndex(index.keys, index.options);
        console.log(`✅ Conversation index created: ${index.options.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠️ Conversation index already exists: ${index.options.name}`);
        } else {
          console.error(`❌ Failed to create conversation index ${index.options.name}:`, error.message);
        }
      }
    }
  }

  // 메시지 모델 인덱스 최적화
  async createMessageIndexes() {
    const Message = mongoose.model('Message');
    const collection = Message.collection;

    const indexes = [
      // 1. 대화별 메시지 조회 (가장 중요)
      {
        keys: { conversationId: 1, timestamp: -1 },
        options: { 
          name: 'conversation_messages_idx',
          background: true
        }
      },

      // 2. 발신자별 메시지 조회
      {
        keys: { sender: 1, timestamp: -1 },
        options: { 
          name: 'sender_messages_idx',
          background: true
        }
      },

      // 3. 읽지 않은 메시지 조회
      {
        keys: { 
          conversationId: 1, 
          'readBy.userId': 1, 
          timestamp: -1 
        },
        options: { 
          name: 'unread_messages_lookup_idx',
          background: true,
          sparse: true
        }
      },

      // 4. 삭제되지 않은 메시지 필터링
      {
        keys: { conversationId: 1, isDeleted: 1, timestamp: -1 },
        options: { 
          name: 'active_messages_idx',
          background: true,
          partialFilterExpression: { isDeleted: { $ne: true } }
        }
      },

      // 5. 신고된 메시지 조회
      {
        keys: { 
          'moderation.flagged': 1, 
          'moderation.reviewed': 1, 
          'moderation.flaggedAt': -1 
        },
        options: { 
          name: 'flagged_messages_idx',
          background: true,
          partialFilterExpression: { 'moderation.flagged': true }
        }
      },

      // 6. 메시지 타입별 조회
      {
        keys: { type: 1, timestamp: -1 },
        options: { 
          name: 'message_type_idx',
          background: true
        }
      },

      // 7. AI 생성 메시지 추적
      {
        keys: { aiGenerated: 1, 'aiSuggestion.type': 1, timestamp: -1 },
        options: { 
          name: 'ai_messages_idx',
          background: true,
          partialFilterExpression: { aiGenerated: true }
        }
      },

      // 8. 감정 분석 조회
      {
        keys: { 'sentiment.score': -1, timestamp: -1 },
        options: { 
          name: 'sentiment_analysis_idx',
          background: true,
          sparse: true
        }
      }
    ];

    for (const index of indexes) {
      try {
        await collection.createIndex(index.keys, index.options);
        console.log(`✅ Message index created: ${index.options.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠️ Message index already exists: ${index.options.name}`);
        } else {
          console.error(`❌ Failed to create message index ${index.options.name}:`, error.message);
        }
      }
    }
  }

  // 가치관 평가 모델 인덱스 최적화
  async createValuesAssessmentIndexes() {
    const ValuesAssessment = mongoose.model('ValuesAssessment');
    const collection = ValuesAssessment.collection;

    const indexes = [
      // 1. 사용자별 평가 조회
      {
        keys: { userId: 1, isCompleted: 1, completedAt: -1 },
        options: { 
          name: 'user_assessments_idx',
          background: true
        }
      },

      // 2. 완료된 평가만 조회
      {
        keys: { isCompleted: 1, completedAt: -1 },
        options: { 
          name: 'completed_assessments_idx',
          background: true,
          partialFilterExpression: { isCompleted: true }
        }
      },

      // 3. 성격 유형별 조회
      {
        keys: { 'analysis.personalityType': 1, 'analysis.confidenceLevel': -1 },
        options: { 
          name: 'personality_type_idx',
          background: true,
          sparse: true
        }
      },

      // 4. 매칭 알고리즘용 조회
      {
        keys: { 
          userId: 1, 
          isCompleted: 1, 
          'analysis.personalityType': 1 
        },
        options: { 
          name: 'matching_algorithm_idx',
          background: true,
          partialFilterExpression: { isCompleted: true }
        }
      }
    ];

    for (const index of indexes) {
      try {
        await collection.createIndex(index.keys, index.options);
        console.log(`✅ ValuesAssessment index created: ${index.options.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`⚠️ ValuesAssessment index already exists: ${index.options.name}`);
        } else {
          console.error(`❌ Failed to create ValuesAssessment index ${index.options.name}:`, error.message);
        }
      }
    }
  }

  // 인덱스 사용량 분석
  async analyzeIndexUsage() {
    console.log('📊 Analyzing index usage...');
    
    const models = [
      { name: 'User', model: mongoose.model('User') },
      { name: 'Match', model: mongoose.model('Match') },
      { name: 'Conversation', model: mongoose.model('Conversation') },
      { name: 'Message', model: mongoose.model('Message') },
      { name: 'ValuesAssessment', model: mongoose.model('ValuesAssessment') }
    ];

    const analysis = {};

    for (const { name, model } of models) {
      try {
        const stats = await model.collection.stats();
        const indexes = await model.collection.listIndexes().toArray();
        
        analysis[name] = {
          documentCount: stats.count,
          averageDocumentSize: stats.avgObjSize,
          totalIndexSize: stats.totalIndexSize,
          indexes: indexes.map(idx => ({
            name: idx.name,
            keys: idx.key,
            size: idx.storageSize || 'N/A',
            unique: idx.unique || false,
            sparse: idx.sparse || false,
            partialFilterExpression: idx.partialFilterExpression || null
          }))
        };

        console.log(`📈 ${name}: ${stats.count} documents, ${indexes.length} indexes`);
      } catch (error) {
        console.error(`❌ Failed to analyze ${name}:`, error.message);
      }
    }

    return analysis;
  }

  // 쿼리 성능 분석
  async analyzeQueryPerformance(model, pipeline, sampleSize = 1000) {
    try {
      const startTime = Date.now();
      
      // 쿼리 실행 계획 분석
      const explain = await model.collection.aggregate([
        ...pipeline,
        { $limit: sampleSize }
      ]).explain('executionStats');

      const executionTime = Date.now() - startTime;
      
      const stats = explain.stages ? explain.stages[0]?.$cursor?.executionStats : explain.executionStats;
      
      return {
        executionTime,
        documentsExamined: stats?.totalDocsExamined || 0,
        documentsReturned: stats?.totalDocsReturned || 0,
        indexesUsed: stats?.executionStages ? this.extractIndexesUsed(stats.executionStages) : [],
        efficiency: stats?.totalDocsExamined > 0 ? 
                   (stats.totalDocsReturned / stats.totalDocsExamined * 100).toFixed(2) : 100,
        recommendation: this.generateQueryRecommendation(stats)
      };
    } catch (error) {
      console.error('Query performance analysis failed:', error);
      return null;
    }
  }

  // 실행 계획에서 사용된 인덱스 추출
  extractIndexesUsed(executionStages) {
    const indexes = [];
    
    const findIndexes = (stage) => {
      if (stage.indexName) {
        indexes.push(stage.indexName);
      }
      if (stage.inputStage) {
        findIndexes(stage.inputStage);
      }
    };
    
    findIndexes(executionStages);
    return indexes;
  }

  // 쿼리 개선 권장사항 생성
  generateQueryRecommendation(stats) {
    if (!stats) return 'No statistics available';
    
    const examined = stats.totalDocsExamined || 0;
    const returned = stats.totalDocsReturned || 0;
    const efficiency = examined > 0 ? (returned / examined * 100) : 100;
    
    if (efficiency < 10) {
      return 'Low efficiency query - consider adding appropriate indexes';
    } else if (efficiency < 50) {
      return 'Moderate efficiency - check if indexes are being used effectively';
    } else if (examined > 10000) {
      return 'Large document scan - consider query optimization or data partitioning';
    } else {
      return 'Query performance is acceptable';
    }
  }

  // 매칭 플랫폼 전용 쿼리 최적화 추천
  async getMatchingOptimizationRecommendations() {
    const recommendations = [];

    try {
      // 1. 사용자 검색 쿼리 성능 확인
      const User = mongoose.model('User');
      const userSearchPerf = await this.analyzeQueryPerformance(User, [
        {
          $match: {
            isActive: true,
            isVerified: true,
            age: { $in: ['46-50', '51-55'] },
            gender: 'female'
          }
        },
        { $sort: { lastActive: -1 } }
      ]);

      if (userSearchPerf && parseFloat(userSearchPerf.efficiency) < 50) {
        recommendations.push({
          type: 'user_search',
          priority: 'high',
          message: 'User search queries are inefficient. Consider optimizing the matching_optimization_idx.',
          details: userSearchPerf
        });
      }

      // 2. 매치 조회 쿼리 성능 확인
      const Match = mongoose.model('Match');
      const matchQueryPerf = await this.analyzeQueryPerformance(Match, [
        {
          $match: {
            $or: [
              { user1: mongoose.Types.ObjectId() },
              { user2: mongoose.Types.ObjectId() }
            ],
            status: { $ne: 'expired' }
          }
        },
        { $sort: { matchedAt: -1 } }
      ]);

      if (matchQueryPerf && parseFloat(matchQueryPerf.efficiency) < 50) {
        recommendations.push({
          type: 'match_query',
          priority: 'high',
          message: 'Match queries are inefficient. Check user1/user2 indexes.',
          details: matchQueryPerf
        });
      }

      // 3. 대화 조회 쿼리 성능 확인
      const Conversation = mongoose.model('Conversation');
      const conversationPerf = await this.analyzeQueryPerformance(Conversation, [
        {
          $match: {
            participants: mongoose.Types.ObjectId(),
            status: 'active'
          }
        },
        { $sort: { lastActivityAt: -1 } }
      ]);

      if (conversationPerf && parseFloat(conversationPerf.efficiency) < 50) {
        recommendations.push({
          type: 'conversation_query',
          priority: 'medium',
          message: 'Conversation queries could be optimized.',
          details: conversationPerf
        });
      }

    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
    }

    return recommendations;
  }

  // 인덱스 정리 (사용하지 않는 인덱스 제거)
  async cleanupUnusedIndexes() {
    console.log('🧹 Cleaning up unused indexes...');
    
    // 이 기능은 신중하게 사용해야 함
    // 실제 프로덕션에서는 충분한 모니터링 후 실행
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️ Index cleanup is disabled in non-production environment');
      return;
    }

    // 실제 구현에서는 인덱스 사용 통계를 분석하여
    // 사용하지 않는 인덱스를 식별하고 제거하는 로직 구현
  }

  // 전체 인덱스 상태 보고서
  async generateIndexReport() {
    console.log('📋 Generating comprehensive index report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {},
      analysis: await this.analyzeIndexUsage(),
      recommendations: await this.getMatchingOptimizationRecommendations(),
      performanceMetrics: {
        // 성능 메트릭 추가
      }
    };

    // 전체 통계 계산
    let totalDocuments = 0;
    let totalIndexes = 0;
    let totalIndexSize = 0;

    for (const [modelName, data] of Object.entries(report.analysis)) {
      totalDocuments += data.documentCount;
      totalIndexes += data.indexes.length;
      totalIndexSize += data.totalIndexSize || 0;
    }

    report.summary = {
      totalModels: Object.keys(report.analysis).length,
      totalDocuments,
      totalIndexes,
      totalIndexSize: `${(totalIndexSize / 1024 / 1024).toFixed(2)} MB`,
      recommendationsCount: report.recommendations.length
    };

    return report;
  }
}

// 싱글톤 인스턴스
let indexingServiceInstance = null;

const getIndexingService = () => {
  if (!indexingServiceInstance) {
    indexingServiceInstance = new IndexingService();
  }
  return indexingServiceInstance;
};

module.exports = {
  IndexingService,
  getIndexingService
};