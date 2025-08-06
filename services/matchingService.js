const BaseService = require('./baseService');
const Match = require('../models/Match');
const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const UserService = require('./userService');

/**
 * Matching Service
 * 매칭 관련 비즈니스 로직 및 AI 매칭 알고리즘
 */
class MatchingService extends BaseService {
  constructor(rlsContext = null) {
    super(Match, rlsContext);
    this.userService = new UserService(rlsContext);
  }

  // 새로운 매치 생성 (시스템 권한 필요)
  async createMatch(user1Id, user2Id, compatibilityData) {
    try {
      // 시스템 권한으로 실행 (매칭 알고리즘은 시스템 권한 필요)
      return await this.executeAsSystem(async () => {
        // 기존 매치가 있는지 확인
        const existingMatch = await Match.findOne({
          $or: [
            { user1: user1Id, user2: user2Id },
            { user1: user2Id, user2: user1Id }
          ]
        });

        if (existingMatch) {
          throw new Error('이미 매치가 존재합니다.');
        }

        // 두 사용자 정보 확인
        const [user1, user2] = await Promise.all([
          User.findById(user1Id),
          User.findById(user2Id)
        ]);

        if (!user1 || !user2) {
          throw new Error('사용자를 찾을 수 없습니다.');
        }

        if (!user1.isActive || !user2.isActive) {
          throw new Error('비활성화된 사용자입니다.');
        }

        // 매치 데이터 생성
        const matchData = {
          user1: user1Id,
          user2: user2Id,
          compatibilityScore: compatibilityData.compatibilityScore,
          compatibilityBreakdown: compatibilityData.compatibilityBreakdown,
          matchReason: compatibilityData.matchReason,
          status: 'pending',
          matchedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
        };

        const match = await this.create(matchData);

        // 사용자 매치 카운트 업데이트
        await Promise.all([
          User.findByIdAndUpdate(user1Id, { $inc: { 'stats.matchesCount': 1 } }),
          User.findByIdAndUpdate(user2Id, { $inc: { 'stats.matchesCount': 1 } })
        ]);

        return match;
      });
    } catch (error) {
      console.error('Error in createMatch:', error);
      throw error;
    }
  }

  // 사용자의 매치 목록 조회
  async getUserMatches(userId, options = {}) {
    try {
      const {
        status = null,
        page = 1,
        limit = 20,
        includeExpired = false
      } = options;

      const conditions = {
        $or: [{ user1: userId }, { user2: userId }]
      };

      if (status) {
        conditions.status = status;
      }

      if (!includeExpired) {
        conditions.status = { $ne: 'expired' };
      }

      const result = await this.paginate(conditions, {
        page,
        limit,
        sort: { matchedAt: -1 },
        populate: [
          {
            path: 'user1',
            select: 'name age profileImage location.city location.district bio'
          },
          {
            path: 'user2', 
            select: 'name age profileImage location.city location.district bio'
          }
        ]
      });

      // 상대방 정보만 반환하도록 처리
      result.data = result.data.map(match => {
        const otherUser = match.user1._id.toString() === userId ? match.user2 : match.user1;
        const isUser1 = match.user1._id.toString() === userId;
        
        return {
          ...match.toObject(),
          otherUser,
          myResponse: isUser1 ? match.user1Response : match.user2Response,
          otherResponse: isUser1 ? match.user2Response : match.user1Response,
          isUser1
        };
      });

      return result;
    } catch (error) {
      console.error('Error in getUserMatches:', error);
      throw error;
    }
  }

  // 매치에 대한 응답 (좋아요/패스)
  async respondToMatch(matchId, userId, action, note = '') {
    try {
      const match = await this.findById(matchId, {
        populate: ['user1', 'user2']
      });

      if (!match) {
        throw new Error('매치를 찾을 수 없습니다.');
      }

      // 매치 참여자인지 확인
      const isParticipant = match.user1._id.toString() === userId || 
                           match.user2._id.toString() === userId;

      if (!isParticipant) {
        throw new Error('이 매치에 대한 권한이 없습니다.');
      }

      // 매치가 만료되었는지 확인
      if (match.expiresAt < new Date()) {
        throw new Error('만료된 매치입니다.');
      }

      // 이미 응답했는지 확인
      const isUser1 = match.user1._id.toString() === userId;
      const currentResponse = isUser1 ? match.user1Response : match.user2Response;

      if (currentResponse.action !== 'none') {
        throw new Error('이미 응답한 매치입니다.');
      }

      // 응답 설정
      await match.setUserResponse(userId, action, note);

      // 상호 좋아요인 경우 대화 시작
      if (match.status === 'mutual_match') {
        await this.startConversation(match);
      }

      return await this.findById(matchId, {
        populate: ['user1', 'user2']
      });
    } catch (error) {
      console.error('Error in respondToMatch:', error);
      throw error;
    }
  }

  // 대화 시작 (상호 매치 시)
  async startConversation(match) {
    try {
      const Conversation = require('../models/Conversation');
      
      // 이미 대화가 시작되었는지 확인
      if (match.conversationStarted) {
        return;
      }

      // 새 대화 생성
      const conversation = new Conversation({
        participants: [match.user1, match.user2],
        matchId: match._id,
        type: 'match',
        status: 'active'
      });

      await conversation.save();

      // 매치에 대화 정보 업데이트
      match.conversationStarted = true;
      match.conversationId = conversation._id;
      match.firstMessageAt = new Date();
      
      await match.save();

      // 사용자 대화 카운트 업데이트
      await Promise.all([
        User.findByIdAndUpdate(match.user1, { $inc: { 'stats.conversationsCount': 1 } }),
        User.findByIdAndUpdate(match.user2, { $inc: { 'stats.conversationsCount': 1 } })
      ]);

      console.log(`Conversation started for match ${match._id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }

  // AI 매칭 알고리즘 실행
  async runMatchingAlgorithm(userId, options = {}) {
    try {
      // 시스템 권한으로 실행
      return await this.executeAsSystem(async () => {
        const {
          maxMatches = 10,
          minCompatibilityScore = 60
        } = options;

        // 현재 사용자 정보 조회
        const currentUser = await User.findById(userId);
        if (!currentUser) {
          throw new Error('사용자를 찾을 수 없습니다.');
        }

        // 가치관 평가 완료 확인
        const assessment = await ValuesAssessment.findOne({ 
          userId: userId, 
          isCompleted: true 
        });

        if (!assessment) {
          throw new Error('가치관 평가를 완료해야 매칭이 가능합니다.');
        }

        // 이미 매치된 사용자 제외
        const existingMatches = await Match.find({
          $or: [{ user1: userId }, { user2: userId }]
        }).select('user1 user2');

        const excludeUserIds = existingMatches.map(match => {
          return match.user1.toString() === userId ? match.user2 : match.user1;
        });

        // 매칭 가능한 사용자 목록 조회
        const candidateUsers = await this.userService.getMatchableUsers(userId, {
          ageRange: currentUser.preferences?.matching?.ageRange || { min: 40, max: 70 },
          maxDistance: currentUser.preferences?.matching?.distance || 50,
          genderPreference: currentUser.preferences?.matching?.genderPreference || 'both',
          excludeUserIds,
          limit: 100
        });

        if (candidateUsers.length === 0) {
          return {
            matches: [],
            message: '현재 매칭 가능한 사용자가 없습니다.'
          };
        }

        // 각 후보자와의 호환성 계산
        const compatibilityResults = await Promise.all(
          candidateUsers.map(candidate => 
            this.calculateCompatibility(currentUser, candidate, assessment)
          )
        );

        // 호환성 점수로 정렬 및 필터링
        const viableMatches = compatibilityResults
          .filter(result => result.compatibilityScore >= minCompatibilityScore)
          .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
          .slice(0, maxMatches);

        // 새 매치 생성
        const createdMatches = [];
        for (const matchData of viableMatches) {
          try {
            const match = await this.createMatch(
              userId, 
              matchData.candidateUser._id, 
              matchData
            );
            createdMatches.push(match);
          } catch (error) {
            console.error('Error creating individual match:', error);
          }
        }

        return {
          matches: createdMatches,
          totalCandidates: candidateUsers.length,
          viableMatches: viableMatches.length,
          createdMatches: createdMatches.length
        };
      });
    } catch (error) {
      console.error('Error in runMatchingAlgorithm:', error);
      throw error;
    }
  }

  // 호환성 계산 알고리즘
  async calculateCompatibility(user1, user2, user1Assessment) {
    try {
      // user2의 가치관 평가 조회
      const user2Assessment = await ValuesAssessment.findOne({
        userId: user2._id,
        isCompleted: true
      });

      if (!user2Assessment) {
        return {
          candidateUser: user2,
          compatibilityScore: 0,
          reason: '가치관 평가 미완료'
        };
      }

      // 각 항목별 호환성 계산
      const valuesAlignment = this.calculateValuesAlignment(
        user1Assessment, 
        user2Assessment
      );

      const personalityCompatibility = this.calculatePersonalityCompatibility(
        user1Assessment, 
        user2Assessment
      );

      const lifestyleMatch = this.calculateLifestyleMatch(user1, user2);

      const interestOverlap = this.calculateInterestOverlap(user1, user2);

      const locationCompatibility = this.calculateLocationCompatibility(user1, user2);

      const ageCompatibility = this.calculateAgeCompatibility(user1, user2);

      const communicationStyle = this.calculateCommunicationStyleCompatibility(
        user1Assessment, 
        user2Assessment
      );

      // 가중 평균으로 최종 점수 계산
      const weights = {
        valuesAlignment: 0.25,
        personalityCompatibility: 0.20,
        lifestyleMatch: 0.15,
        interestOverlap: 0.10,
        locationCompatibility: 0.10,
        ageCompatibility: 0.10,
        communicationStyle: 0.10
      };

      const compatibilityScore = Math.round(
        valuesAlignment * weights.valuesAlignment +
        personalityCompatibility * weights.personalityCompatibility +
        lifestyleMatch * weights.lifestyleMatch +
        interestOverlap * weights.interestOverlap +
        locationCompatibility * weights.locationCompatibility +
        ageCompatibility * weights.ageCompatibility +
        communicationStyle * weights.communicationStyle
      );

      // 매치 이유 분석
      const matchReason = this.generateMatchReason({
        valuesAlignment,
        personalityCompatibility,
        lifestyleMatch,
        interestOverlap,
        locationCompatibility,
        ageCompatibility,
        communicationStyle
      });

      return {
        candidateUser: user2,
        compatibilityScore,
        compatibilityBreakdown: {
          valuesAlignment,
          personalityCompatibility,
          lifestyleMatch,
          interestOverlap: interestOverlap,
          communicationStyle,
          locationCompatibility,
          ageCompatibility
        },
        matchReason,
        algorithmVersion: '2.0',
        confidenceLevel: this.calculateConfidenceLevel(compatibilityScore, user1Assessment, user2Assessment)
      };
    } catch (error) {
      console.error('Error calculating compatibility:', error);
      return {
        candidateUser: user2,
        compatibilityScore: 0,
        reason: '호환성 계산 오류'
      };
    }
  }

  // 가치관 일치도 계산
  calculateValuesAlignment(assessment1, assessment2) {
    try {
      const answers1 = assessment1.answers;
      const answers2 = assessment2.answers;

      let totalAlignment = 0;
      let comparedQuestions = 0;

      // 동일한 질문에 대한 답변 비교
      for (const [questionId, answer1] of answers1) {
        if (answers2.has(questionId)) {
          const answer2 = answers2.get(questionId);
          
          // 카테고리가 'values'인 질문만 비교
          if (answer1.category === 'values' && answer2.category === 'values') {
            const score1 = parseInt(answer1.value);
            const score2 = parseInt(answer2.value);
            
            // 점수 차이를 호환성으로 변환 (차이가 적을수록 높은 점수)
            const difference = Math.abs(score1 - score2);
            const alignment = Math.max(0, 100 - (difference * 25)); // 최대 차이 4점
            
            totalAlignment += alignment;
            comparedQuestions++;
          }
        }
      }

      return comparedQuestions > 0 ? Math.round(totalAlignment / comparedQuestions) : 50;
    } catch (error) {
      console.error('Error calculating values alignment:', error);
      return 50;
    }
  }

  // 성격 호환성 계산
  calculatePersonalityCompatibility(assessment1, assessment2) {
    try {
      // 성격 유형 기반 호환성 매트릭스
      const compatibilityMatrix = {
        'HARMONIOUS_SAGE': {
          'WARM_COMPANION': 85,
          'ADVENTUROUS_SPIRIT': 70,
          'PRACTICAL_REALIST': 75,
          'HARMONIOUS_SAGE': 80
        },
        'WARM_COMPANION': {
          'HARMONIOUS_SAGE': 85,
          'WARM_COMPANION': 90,
          'ADVENTUROUS_SPIRIT': 75,
          'PRACTICAL_REALIST': 70
        },
        'ADVENTUROUS_SPIRIT': {
          'HARMONIOUS_SAGE': 70,
          'WARM_COMPANION': 75,
          'ADVENTUROUS_SPIRIT': 80,
          'PRACTICAL_REALIST': 85
        },
        'PRACTICAL_REALIST': {
          'HARMONIOUS_SAGE': 75,
          'WARM_COMPANION': 70,
          'ADVENTUROUS_SPIRIT': 85,
          'PRACTICAL_REALIST': 80
        }
      };

      const type1 = assessment1.analysis?.personalityType;
      const type2 = assessment2.analysis?.personalityType;

      if (type1 && type2 && compatibilityMatrix[type1]?.[type2]) {
        return compatibilityMatrix[type1][type2];
      }

      return 60; // 기본값
    } catch (error) {
      console.error('Error calculating personality compatibility:', error);
      return 60;
    }
  }

  // 라이프스타일 매치 계산
  calculateLifestyleMatch(user1, user2) {
    try {
      let score = 0;
      let factors = 0;

      // 거주 형태
      if (user1.lifestyle?.livingArrangement && user2.lifestyle?.livingArrangement) {
        if (user1.lifestyle.livingArrangement === user2.lifestyle.livingArrangement) {
          score += 20;
        }
        factors++;
      }

      // 활동 수준
      if (user1.lifestyle?.fitnessLevel && user2.lifestyle?.fitnessLevel) {
        const levels = ['low', 'moderate', 'active', 'very_active'];
        const diff = Math.abs(
          levels.indexOf(user1.lifestyle.fitnessLevel) - 
          levels.indexOf(user2.lifestyle.fitnessLevel)
        );
        score += Math.max(0, 20 - (diff * 7));
        factors++;
      }

      // 사교성
      if (user1.lifestyle?.socialLevel && user2.lifestyle?.socialLevel) {
        const levels = ['introvert', 'ambivert', 'extrovert'];
        const diff = Math.abs(
          levels.indexOf(user1.lifestyle.socialLevel) - 
          levels.indexOf(user2.lifestyle.socialLevel)
        );
        score += Math.max(0, 20 - (diff * 10));
        factors++;
      }

      return factors > 0 ? Math.round(score * (3 / factors)) : 60;
    } catch (error) {
      console.error('Error calculating lifestyle match:', error);
      return 60;
    }
  }

  // 관심사 중복도 계산
  calculateInterestOverlap(user1, user2) {
    try {
      const interests1 = user1.interests || [];
      const interests2 = user2.interests || [];

      if (interests1.length === 0 || interests2.length === 0) {
        return 50;
      }

      const commonInterests = interests1.filter(interest => 
        interests2.includes(interest)
      );

      const overlapRatio = commonInterests.length / Math.max(interests1.length, interests2.length);
      return Math.round(overlapRatio * 100);
    } catch (error) {
      console.error('Error calculating interest overlap:', error);
      return 50;
    }
  }

  // 위치 호환성 계산
  calculateLocationCompatibility(user1, user2) {
    try {
      // 같은 도시인 경우
      if (user1.location?.city && user2.location?.city) {
        if (user1.location.city === user2.location.city) {
          // 같은 구인 경우 높은 점수
          if (user1.location.district === user2.location.district) {
            return 100;
          }
          return 85; // 같은 도시, 다른 구
        }
        return 60; // 다른 도시
      }

      return 70; // 위치 정보 없음
    } catch (error) {
      console.error('Error calculating location compatibility:', error);
      return 70;
    }
  }

  // 나이 호환성 계산
  calculateAgeCompatibility(user1, user2) {
    try {
      const ageMap = {
        '40-45': 42.5,
        '46-50': 48,
        '51-55': 53,
        '56-60': 58,
        '60+': 65
      };

      const age1 = ageMap[user1.age];
      const age2 = ageMap[user2.age];

      if (!age1 || !age2) return 70;

      const ageDiff = Math.abs(age1 - age2);
      
      // 나이 차이가 적을수록 높은 점수
      if (ageDiff <= 3) return 100;
      if (ageDiff <= 5) return 90;
      if (ageDiff <= 8) return 80;
      if (ageDiff <= 12) return 70;
      return 60;
    } catch (error) {
      console.error('Error calculating age compatibility:', error);
      return 70;
    }
  }

  // 소통 스타일 호환성 계산
  calculateCommunicationStyleCompatibility(assessment1, assessment2) {
    // 간단한 구현 - 향후 확장 가능
    return 75;
  }

  // 확신도 계산
  calculateConfidenceLevel(compatibilityScore, assessment1, assessment2) {
    let confidence = compatibilityScore / 100;

    // 평가 완성도 고려
    const completeness1 = assessment1.answers.size / 10; // 총 10개 질문 가정
    const completeness2 = assessment2.answers.size / 10;
    const avgCompleteness = (completeness1 + completeness2) / 2;

    confidence *= avgCompleteness;

    return Math.round(confidence * 100);
  }

  // 매치 이유 생성
  generateMatchReason(compatibilityData) {
    const primaryFactors = [];

    // 높은 점수 항목들을 주요 요인으로 선정
    Object.entries(compatibilityData).forEach(([factor, score]) => {
      if (score >= 80) {
        primaryFactors.push({
          factor: this.getFactorName(factor),
          strength: score,
          description: this.getFactorDescription(factor, score)
        });
      }
    });

    // 점수 순으로 정렬
    primaryFactors.sort((a, b) => b.strength - a.strength);

    return {
      primaryFactors: primaryFactors.slice(0, 3), // 상위 3개만
      algorithmVersion: '2.0',
      confidenceLevel: Math.max(...Object.values(compatibilityData))
    };
  }

  // 요인 이름 매핑
  getFactorName(factor) {
    const nameMap = {
      valuesAlignment: 'shared_values',
      personalityCompatibility: 'personality_complement',
      lifestyleMatch: 'lifestyle_match',
      interestOverlap: 'common_interests',
      locationCompatibility: 'geographic_proximity',
      ageCompatibility: 'age_compatibility',
      communicationStyle: 'communication_style'
    };

    return nameMap[factor] || factor;
  }

  // 요인 설명 생성
  getFactorDescription(factor, score) {
    if (score >= 90) return '매우 높은 일치도';
    if (score >= 80) return '높은 호환성';
    if (score >= 70) return '양호한 매칭';
    return '적정 수준';
  }

  // 만료된 매치 정리
  async cleanupExpiredMatches() {
    try {
      return await this.executeAsSystem(async () => {
        const result = await Match.updateMany(
          {
            expiresAt: { $lt: new Date() },
            status: { $in: ['pending', 'user1_liked', 'user2_liked'] }
          },
          {
            status: 'expired',
            endedAt: new Date()
          }
        );

        console.log(`Cleaned up ${result.modifiedCount} expired matches`);
        return result;
      });
    } catch (error) {
      console.error('Error in cleanupExpiredMatches:', error);
      throw error;
    }
  }

  // 매치 통계 조회
  async getMatchingStats(userId = null) {
    try {
      const baseConditions = userId ? {
        $or: [{ user1: userId }, { user2: userId }]
      } : {};

      const stats = await this.aggregate([
        { $match: baseConditions },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgCompatibilityScore: { $avg: '$compatibilityScore' }
          }
        }
      ]);

      return stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          avgCompatibilityScore: Math.round(stat.avgCompatibilityScore || 0)
        };
        return acc;
      }, {});
    } catch (error) {
      console.error('Error in getMatchingStats:', error);
      throw error;
    }
  }
}

module.exports = MatchingService;