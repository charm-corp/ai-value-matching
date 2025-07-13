/**
 * 세렌디피티 기반 고급 매칭 알고리즘
 * 
 * 특징:
 * - 4060세대 특화 매칭 로직
 * - 우연적 요소와 과학적 분석의 조화
 * - 인생 경험과 가치관 중심 매칭
 * - 세렌디피티 요소 강화
 */

const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const Match = require('../models/Match');

class SerendipityMatchingEngine {
  constructor() {
    this.algorithmVersion = '2.0-serendipity';
    this.baseCompatibilityThreshold = 65;
    this.serendipityBoostFactor = 0.15; // 15% 세렌디피티 가중치
  }

  /**
   * 메인 매칭 함수 - 세렌디피티 기반
   * @param {string} userId - 매칭을 요청하는 사용자 ID
   * @param {Object} preferences - 사용자 선호도
   * @returns {Array} 매칭 결과 배열
   */
  async findSerendipityMatches(userId, preferences = {}) {
    try {
      const user = await User.findById(userId).populate('valuesAssessment');
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다');
      }

      // 1단계: 기본 필터링 (나이, 지역, 선호도)
      const candidates = await this.getBasicCandidates(user, preferences);
      
      // 2단계: 가치관 호환성 분석
      const compatibilityScores = await this.calculateCompatibilityScores(user, candidates);
      
      // 3단계: 세렌디피티 요소 적용
      const serendipityEnhanced = await this.applySerendipityFactors(user, compatibilityScores);
      
      // 4단계: 4060세대 특화 가중치
      const seniorOptimized = await this.applySeniorOptimization(user, serendipityEnhanced);
      
      // 5단계: 최종 정렬 및 선별
      const finalMatches = await this.finalizeMatches(user, seniorOptimized);
      
      return finalMatches;
    } catch (error) {
      console.error('세렌디피티 매칭 오류:', error);
      throw error;
    }
  }

  /**
   * 기본 후보자 필터링
   */
  async getBasicCandidates(user, preferences) {
    const query = {
      _id: { $ne: user._id }, // 자기 자신 제외
      isActive: true,
      isVerified: true,
      isProfileComplete: true
    };

    // 나이 필터
    if (preferences.ageRange) {
      const ageValues = this.getAgeValuesFromRange(preferences.ageRange);
      query.age = { $in: ageValues };
    } else {
      // 기본 4060세대 범위
      query.age = { $in: ['40-45', '46-50', '51-55', '56-60', '60+'] };
    }

    // 성별 선호도
    if (preferences.genderPreference && preferences.genderPreference !== 'both') {
      query.gender = preferences.genderPreference;
    }

    // 지역 필터 (반경 기반)
    if (user.location?.coordinates && preferences.maxDistance) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: preferences.maxDistance * 1000 // km를 m로 변환
        }
      };
    }

    // 결혼 상태 선호도
    if (preferences.maritalStatusPreference?.length) {
      query.maritalStatus = { $in: preferences.maritalStatusPreference };
    }

    // 자녀 선호도
    if (preferences.childrenPreference !== 'no_preference') {
      switch (preferences.childrenPreference) {
        case 'has_children':
          query.hasChildren = true;
          break;
        case 'no_children':
          query.hasChildren = false;
          break;
        case 'grown_children':
          query.$and = [
            { hasChildren: true },
            { 'childrenInfo.ages': { $in: ['teen', 'adult'] } }
          ];
          break;
      }
    }

    // 이미 매칭된 사용자들 제외
    const existingMatches = await Match.find({
      $or: [
        { user1: user._id },
        { user2: user._id }
      ]
    }).select('user1 user2');

    const excludeIds = existingMatches.map(match => 
      match.user1.toString() === user._id.toString() ? match.user2 : match.user1
    );

    if (excludeIds.length > 0) {
      query._id = { $ne: user._id, $nin: excludeIds };
    }

    return await User.find(query).limit(50); // 최대 50명으로 제한
  }

  /**
   * 호환성 점수 계산
   */
  async calculateCompatibilityScores(user, candidates) {
    const userAssessment = await ValuesAssessment.findOne({ userId: user._id });
    const results = [];

    for (const candidate of candidates) {
      const candidateAssessment = await ValuesAssessment.findOne({ userId: candidate._id });
      
      if (!candidateAssessment) {
        continue; // 가치관 테스트 미완료 사용자 제외
      }

      const compatibility = await this.calculateDetailedCompatibility(
        user, 
        candidate, 
        userAssessment, 
        candidateAssessment
      );

      results.push({
        candidate,
        candidateAssessment,
        compatibility
      });
    }

    return results;
  }

  /**
   * 상세 호환성 분석
   */
  async calculateDetailedCompatibility(user, candidate, userAssessment, candidateAssessment) {
    const compatibility = {
      overall: 0,
      breakdown: {}
    };

    // 1. 가치관 일치도 (35% 가중치)
    compatibility.breakdown.valuesAlignment = this.calculateValuesAlignment(
      userAssessment.results,
      candidateAssessment.results
    );

    // 2. 성격 호환성 (25% 가중치)
    compatibility.breakdown.personalityCompatibility = this.calculatePersonalityCompatibility(
      user,
      candidate
    );

    // 3. 라이프스타일 매칭 (20% 가중치)
    compatibility.breakdown.lifestyleMatch = this.calculateLifestyleMatch(
      user,
      candidate
    );

    // 4. 인생 경험 유사도 (4060세대 특화, 15% 가중치)
    compatibility.breakdown.lifeExperienceMatch = this.calculateLifeExperienceMatch(
      user,
      candidate
    );

    // 5. 소통 스타일 (5% 가중치)
    compatibility.breakdown.communicationStyle = this.calculateCommunicationCompatibility(
      user,
      candidate
    );

    // 전체 점수 계산
    compatibility.overall = (
      compatibility.breakdown.valuesAlignment * 0.35 +
      compatibility.breakdown.personalityCompatibility * 0.25 +
      compatibility.breakdown.lifestyleMatch * 0.20 +
      compatibility.breakdown.lifeExperienceMatch * 0.15 +
      compatibility.breakdown.communicationStyle * 0.05
    );

    return compatibility;
  }

  /**
   * 가치관 일치도 계산
   */
  calculateValuesAlignment(userResults, candidateResults) {
    const userValues = userResults.scores || {};
    const candidateValues = candidateResults.scores || {};
    
    const valueKeys = ['family', 'career', 'adventure', 'stability', 'creativity', 'social'];
    let totalDifference = 0;
    let validComparisons = 0;

    valueKeys.forEach(key => {
      if (userValues[key] !== undefined && candidateValues[key] !== undefined) {
        totalDifference += Math.abs(userValues[key] - candidateValues[key]);
        validComparisons++;
      }
    });

    if (validComparisons === 0) return 50; // 기본값

    const averageDifference = totalDifference / validComparisons;
    return Math.max(0, 100 - (averageDifference * 2)); // 0-100 범위로 변환
  }

  /**
   * 성격 호환성 계산 (상호 보완적 요소 고려)
   */
  calculatePersonalityCompatibility(user, candidate) {
    let score = 50; // 기본값

    // 사회성 레벨 호환성 (너무 극단적인 차이는 감점)
    if (user.lifestyle?.socialLevel && candidate.lifestyle?.socialLevel) {
      const socialLevels = { 'introvert': 1, 'ambivert': 2, 'extrovert': 3 };
      const userLevel = socialLevels[user.lifestyle.socialLevel];
      const candidateLevel = socialLevels[candidate.lifestyle.socialLevel];
      const difference = Math.abs(userLevel - candidateLevel);
      
      if (difference === 0) score += 15; // 동일한 성향
      else if (difference === 1) score += 20; // 상호 보완적
      else score -= 10; // 너무 다름
    }

    // 활동성 레벨 매칭
    if (user.lifestyle?.fitnessLevel && candidate.lifestyle?.fitnessLevel) {
      const fitnessLevels = { 'low': 1, 'moderate': 2, 'active': 3, 'very_active': 4 };
      const userFitness = fitnessLevels[user.lifestyle.fitnessLevel];
      const candidateFitness = fitnessLevels[candidate.lifestyle.fitnessLevel];
      const difference = Math.abs(userFitness - candidateFitness);
      
      if (difference <= 1) score += 15;
      else if (difference === 2) score += 5;
      else score -= 5;
    }

    // 여행 성향 호환성
    if (user.lifestyle?.travelFrequency && candidate.lifestyle?.travelFrequency) {
      const travelLevels = { 'rarely': 1, 'occasionally': 2, 'frequently': 3, 'very_frequently': 4 };
      const userTravel = travelLevels[user.lifestyle.travelFrequency];
      const candidateTravel = travelLevels[candidate.lifestyle.travelFrequency];
      const difference = Math.abs(userTravel - candidateTravel);
      
      if (difference <= 1) score += 10;
      else if (difference === 2) score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 라이프스타일 매칭
   */
  calculateLifestyleMatch(user, candidate) {
    let score = 50;

    // 거주 형태 호환성
    if (user.lifestyle?.livingArrangement && candidate.lifestyle?.livingArrangement) {
      const compatible = this.checkLivingArrangementCompatibility(
        user.lifestyle.livingArrangement,
        candidate.lifestyle.livingArrangement
      );
      score += compatible ? 15 : -10;
    }

    // 주택 소유 형태
    if (user.lifestyle?.homeOwnership && candidate.lifestyle?.homeOwnership) {
      if (user.lifestyle.homeOwnership === candidate.lifestyle.homeOwnership) {
        score += 10;
      }
    }

    // 자녀 상황 호환성 (4060세대 중요 요소)
    if (user.hasChildren !== undefined && candidate.hasChildren !== undefined) {
      if (user.hasChildren === candidate.hasChildren) {
        score += 20; // 자녀 유무 동일 시 높은 점수
      } else {
        // 한 명은 자녀 있고 한 명은 없는 경우
        score += 5; // 약간의 점수 (경험 공유 가능)
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 인생 경험 유사도 (4060세대 특화)
   */
  calculateLifeExperienceMatch(user, candidate) {
    let score = 50;

    // 결혼 경험 유사도
    if (user.maritalStatus && candidate.maritalStatus) {
      const experienceGroups = {
        'never_married': ['single'],
        'previously_married': ['divorced', 'widowed', 'separated']
      };
      
      const userGroup = this.getExperienceGroup(user.maritalStatus, experienceGroups);
      const candidateGroup = this.getExperienceGroup(candidate.maritalStatus, experienceGroups);
      
      if (userGroup === candidateGroup) {
        score += 25; // 유사한 결혼 경험
      }
    }

    // 직업 경험 레벨
    if (user.occupation?.position && candidate.occupation?.position) {
      const positionLevels = {
        'entry': 1, 'mid': 2, 'senior': 3, 'executive': 4, 'owner': 5, 'retired': 3
      };
      
      const userLevel = positionLevels[user.occupation.position];
      const candidateLevel = positionLevels[candidate.occupation.position];
      
      if (userLevel && candidateLevel) {
        const difference = Math.abs(userLevel - candidateLevel);
        if (difference <= 1) score += 15;
        else if (difference === 2) score += 5;
      }
    }

    // 나이대 경험 유사도
    const userAge = this.getAgeGroup(user.age);
    const candidateAge = this.getAgeGroup(candidate.age);
    const ageDifference = Math.abs(userAge - candidateAge);
    
    if (ageDifference === 0) score += 10;
    else if (ageDifference === 1) score += 15; // 약간의 나이 차이는 오히려 좋음
    else score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 소통 스타일 호환성
   */
  calculateCommunicationCompatibility(user, candidate) {
    let score = 70; // 기본 높은 점수 (4060세대는 성숙한 소통 가능)

    // 기술 활용 능력 유사도
    if (user.ageGroupContext?.technicalComfort && candidate.ageGroupContext?.technicalComfort) {
      const techLevels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const userTech = techLevels[user.ageGroupContext.technicalComfort];
      const candidateTech = techLevels[candidate.ageGroupContext.technicalComfort];
      
      if (userTech && candidateTech) {
        const difference = Math.abs(userTech - candidateTech);
        if (difference === 0) score += 20;
        else if (difference === 1) score += 10;
      }
    }

    // 선호 연락 방법 호환성
    if (user.ageGroupContext?.preferredContactMethod && candidate.ageGroupContext?.preferredContactMethod) {
      if (user.ageGroupContext.preferredContactMethod === candidate.ageGroupContext.preferredContactMethod) {
        score += 10;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 세렌디피티 요소 적용
   */
  async applySerendipityFactors(user, compatibilityResults) {
    return compatibilityResults.map(result => {
      let serendipityBoost = 0;

      // 1. 예상 밖의 호환성 발견 (가치관은 다르지만 성격이 잘 맞는 경우)
      if (result.compatibility.breakdown.valuesAlignment < 70 && 
          result.compatibility.breakdown.personalityCompatibility > 80) {
        serendipityBoost += 10;
        result.serendipityFactors = result.serendipityFactors || [];
        result.serendipityFactors.push({
          type: 'unexpected_harmony',
          description: '가치관은 다르지만 성격적으로 완벽한 조화',
          boost: 10
        });
      }

      // 2. 상반된 배경의 매력 (다른 업계, 다른 지역 출신)
      if (user.occupation?.industry !== result.candidate.occupation?.industry) {
        serendipityBoost += 5;
        result.serendipityFactors = result.serendipityFactors || [];
        result.serendipityFactors.push({
          type: 'diverse_background',
          description: '서로 다른 업계 경험으로 풍부한 대화 가능',
          boost: 5
        });
      }

      // 3. 드문 공통점 발견
      serendipityBoost += this.findRareCommonalities(user, result.candidate);

      // 4. 시간적 세렌디피티 (특별한 날짜, 의미있는 시점)
      serendipityBoost += this.calculateTemporalSerendipity();

      // 5. 지리적 세렌디피티 (우연히 가까운 거리)
      if (user.location?.coordinates && result.candidate.location?.coordinates) {
        const distance = this.calculateDistance(
          user.location.coordinates,
          result.candidate.location.coordinates
        );
        if (distance < 5) { // 5km 이내
          serendipityBoost += 8;
          result.serendipityFactors = result.serendipityFactors || [];
          result.serendipityFactors.push({
            type: 'geographic_proximity',
            description: '운명처럼 가까운 거리에서 만난 인연',
            boost: 8
          });
        }
      }

      // 세렌디피티 적용
      result.compatibility.overall += serendipityBoost * this.serendipityBoostFactor;
      result.compatibility.serendipityScore = serendipityBoost;
      
      return result;
    });
  }

  /**
   * 드문 공통점 발견
   */
  findRareCommonalities(user, candidate) {
    let boost = 0;

    // 같은 대학교 출신 (만약 정보가 있다면)
    // 같은 취미 (세부적인 취미들)
    // 같은 가치관 조합 (드문 조합일수록 높은 점수)
    
    // 예시: 같은 직업 레벨의 은퇴자들
    if (user.occupation?.workSchedule === 'retired' && 
        candidate.occupation?.workSchedule === 'retired') {
      boost += 7;
    }

    // 같은 자녀 수
    if (user.childrenInfo?.number && candidate.childrenInfo?.number && 
        user.childrenInfo.number === candidate.childrenInfo.number &&
        user.childrenInfo.number > 0) {
      boost += 5;
    }

    return boost;
  }

  /**
   * 시간적 세렌디피티
   */
  calculateTemporalSerendipity() {
    const now = new Date();
    let boost = 0;

    // 특별한 날들에 약간의 세렌디피티 부스트
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 봄(3-5월), 가을(9-11월) 시즌 부스트
    if ((month >= 3 && month <= 5) || (month >= 9 && month <= 11)) {
      boost += 2;
    }

    // 금요일 저녁이나 주말에 약간 더 높은 세렌디피티
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      boost += 1;
    }

    return boost;
  }

  /**
   * 4060세대 특화 최적화
   */
  async applySeniorOptimization(user, compatibilityResults) {
    return compatibilityResults.map(result => {
      // 1. 안정성 가중치 증가
      if (result.compatibility.breakdown.lifestyleMatch > 70) {
        result.compatibility.overall += 5;
      }

      // 2. 인생 경험 가중치 증가
      if (result.compatibility.breakdown.lifeExperienceMatch > 75) {
        result.compatibility.overall += 7;
      }

      // 3. 너무 완벽한 매치보다는 약간의 차이가 있는 매치 선호
      if (result.compatibility.overall > 95) {
        result.compatibility.overall -= 3; // 완벽함의 역설
      }

      // 4. 최근 활성도 고려
      const daysSinceActive = this.getDaysSinceLastActive(result.candidate.lastActive);
      if (daysSinceActive > 30) {
        result.compatibility.overall -= 10; // 비활성 사용자 감점
      } else if (daysSinceActive < 7) {
        result.compatibility.overall += 5; // 활성 사용자 가점
      }

      return result;
    });
  }

  /**
   * 최종 매치 완성
   */
  async finalizeMatches(user, optimizedResults) {
    // 임계값 이상만 필터링
    const qualifiedMatches = optimizedResults.filter(
      result => result.compatibility.overall >= this.baseCompatibilityThreshold
    );

    // 점수 순으로 정렬
    qualifiedMatches.sort((a, b) => b.compatibility.overall - a.compatibility.overall);

    // 상위 10개까지만 반환
    const topMatches = qualifiedMatches.slice(0, 10);

    // 매치 이유 생성
    return topMatches.map(result => {
      const matchReasons = this.generateMatchReasons(result);
      
      return {
        candidate: result.candidate,
        compatibilityScore: Math.round(result.compatibility.overall),
        compatibilityBreakdown: result.compatibility.breakdown,
        serendipityFactors: result.serendipityFactors || [],
        matchReasons: matchReasons,
        algorithmVersion: this.algorithmVersion,
        confidenceLevel: this.calculateConfidenceLevel(result.compatibility.overall)
      };
    });
  }

  /**
   * 매치 이유 생성
   */
  generateMatchReasons(result) {
    const reasons = [];
    const breakdown = result.compatibility.breakdown;

    if (breakdown.valuesAlignment > 80) {
      reasons.push({
        factor: 'shared_values',
        strength: breakdown.valuesAlignment,
        description: '인생 가치관이 매우 유사하여 깊은 공감대를 형성할 수 있습니다'
      });
    }

    if (breakdown.personalityCompatibility > 85) {
      reasons.push({
        factor: 'personality_complement',
        strength: breakdown.personalityCompatibility,
        description: '성격적으로 서로를 완벽하게 보완할 수 있는 관계입니다'
      });
    }

    if (breakdown.lifeExperienceMatch > 75) {
      reasons.push({
        factor: 'life_experience_similarity',
        strength: breakdown.lifeExperienceMatch,
        description: '비슷한 인생 경험을 통해 서로를 깊이 이해할 수 있습니다'
      });
    }

    if (result.serendipityFactors?.length > 0) {
      reasons.push({
        factor: 'serendipity_magic',
        strength: result.compatibility.serendipityScore,
        description: '예상치 못한 특별한 인연의 징조가 발견되었습니다'
      });
    }

    return reasons;
  }

  // 유틸리티 메서드들
  getAgeValuesFromRange(range) {
    // 나이 범위를 실제 나이 값들로 변환
    const ageMap = {
      '40-45': ['40-45'],
      '46-50': ['46-50'],
      '51-55': ['51-55'],
      '56-60': ['56-60'],
      '60+': ['60+']
    };
    return range.flatMap(r => ageMap[r] || []);
  }

  checkLivingArrangementCompatibility(arr1, arr2) {
    const compatible = {
      'alone': ['alone', 'with_partner'],
      'with_children': ['with_children', 'with_partner'],
      'with_partner': ['alone', 'with_children', 'with_partner']
    };
    return compatible[arr1]?.includes(arr2) || false;
  }

  getExperienceGroup(status, groups) {
    for (const [group, statuses] of Object.entries(groups)) {
      if (statuses.includes(status)) return group;
    }
    return 'other';
  }

  getAgeGroup(ageRange) {
    const ageMap = { '40-45': 1, '46-50': 2, '51-55': 3, '56-60': 4, '60+': 5 };
    return ageMap[ageRange] || 3;
  }

  calculateDistance(coords1, coords2) {
    // 간단한 거리 계산 (실제로는 더 정확한 계산 필요)
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;
    const R = 6371; // 지구 반지름 (km)
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getDaysSinceLastActive(lastActive) {
    const now = new Date();
    const diffTime = now - new Date(lastActive);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateConfidenceLevel(score) {
    if (score >= 90) return 95;
    if (score >= 80) return 85;
    if (score >= 70) return 75;
    return 65;
  }
}

module.exports = new SerendipityMatchingEngine();