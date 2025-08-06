const ValuesAssessment = require('../models/ValuesAssessment');
const valuesAnalysisEngine = require('./valuesAnalysisEngine');

/**
 * 지능형 매칭 엔진
 *
 * 핵심 기능:
 * 1. 설명 가능한 매칭 점수 계산
 * 2. 궁합 이유 상세 분석
 * 3. 중장년층 맞춤 매칭 로직
 * 4. 만남 가이드 제공
 */
class IntelligentMatchingEngine {
  constructor() {
    // 4060세대 매칭 가중치 체계
    this.matchingWeights = {
      coreValues: 0.35, // 핵심 가치관 (35%)
      personalityFit: 0.25, // 성격 궁합 (25%)
      lifestyleCompat: 0.2, // 생활방식 호환성 (20%)
      communicationSync: 0.12, // 소통 방식 (12%)
      growthPotential: 0.08, // 상호 성장 가능성 (8%)
    };

    // 호환성 유형 정의
    this.compatibilityTypes = {
      // 가치관 기반 매칭
      valueAlignment: {
        name: '가치관 공명',
        description: '인생에서 추구하는 가치와 목표가 잘 맞아',
        weight: 0.4,
        threshold: 75,
      },

      // 성격 보완형 매칭
      personalityComplement: {
        name: '성격 보완',
        description: '서로 다른 강점으로 균형을 이루며',
        weight: 0.3,
        threshold: 65,
      },

      // 라이프스타일 조화
      lifestyleHarmony: {
        name: '생활 조화',
        description: '일상의 리듬과 패턴이 자연스럽게 어우러져',
        weight: 0.3,
        threshold: 60,
      },
    };

    // 4060세대 특성 반영 요소
    this.ageGroupFactors = {
      stabilityPreference: 1.2, // 안정성 선호 가중치
      deepConnectionValue: 1.3, // 깊은 관계 선호
      experienceBasedDecision: 1.1, // 경험 기반 판단
      authenticityImportance: 1.25, // 진정성 중시
      meaningfulConversation: 1.2, // 의미있는 대화 선호
    };
  }

  /**
   * 두 사용자 간 종합 매칭 분석
   */
  async calculateComprehensiveMatch(user1Assessment, user2Assessment) {
    const startTime = Date.now();

    try {
      console.log(`🎯 매칭 분석 시작: ${user1Assessment.userId} ↔ ${user2Assessment.userId}`);

      // 입력 데이터 검증
      const validationResult = this.validateAssessmentData(user1Assessment, user2Assessment);
      if (!validationResult.isValid) {
        throw new Error(`데이터 검증 실패: ${validationResult.errors.join(', ')}`);
      }

      // 1. 기본 호환성 점수 계산 (안전 래퍼)
      const basicCompatibility = await this.safeCalculateBasicCompatibility(
        user1Assessment,
        user2Assessment
      );

      // 2. 4060세대 특성 반영 조정 (안전 래퍼)
      const adjustedCompatibility = await this.safeAdjustForAgeGroup(
        basicCompatibility,
        user1Assessment,
        user2Assessment
      );

      // 3. 매칭 이유 상세 분석 (안전 래퍼)
      const matchingReasons = await this.safeGenerateMatchingReasons(
        user1Assessment,
        user2Assessment,
        adjustedCompatibility
      );

      // 4. 잠재적 도전점과 해결책 (안전 래퍼)
      const challengesAndSolutions = await this.safeAnalyzeChallengesAndSolutions(
        user1Assessment,
        user2Assessment
      );

      // 5. 만남 가이드 생성 (안전 래퍼)
      const meetingGuide = await this.safeGenerateMeetingGuide(
        user1Assessment,
        user2Assessment,
        adjustedCompatibility
      );

      // 6. 관계 발전 로드맵 (안전 래퍼)
      const relationshipRoadmap = await this.safeCreateRelationshipRoadmap(
        user1Assessment,
        user2Assessment
      );

      // 최종 점수 검증
      const finalScore = this.validateAndAdjustScore(adjustedCompatibility.overallScore);
      const processingTime = Date.now() - startTime;

      console.log(`✅ 매칭 분석 완료: ${finalScore}점 (처리시간: ${processingTime}ms)`);

      return {
        overallScore: finalScore,
        compatibility: adjustedCompatibility,
        matchingReasons: matchingReasons || [],
        challengesAndSolutions: challengesAndSolutions || { challenges: [], solutions: [] },
        meetingGuide: meetingGuide || this.getDefaultMeetingGuide(),
        relationshipRoadmap: relationshipRoadmap || this.getDefaultRoadmap(),
        confidenceLevel: this.calculateMatchConfidence(user1Assessment, user2Assessment),
        processingTime,
        timestamp: new Date(),
        version: '3.0',
        fallbacksUsed: this.getActiveFallbacks(),

        // ========== 결과 설명 보강 ==========
        scoreInterpretation: this.generateScoreInterpretation(finalScore),
        detailedBreakdown: this.generateDetailedBreakdown(adjustedCompatibility),
        relationshipPotential: this.assessRelationshipPotential(finalScore, adjustedCompatibility),
        improvementSuggestions: this.generateImprovementSuggestions(
          finalScore,
          challengesAndSolutions
        ),
        compatibilityInsights: this.generateCompatibilityInsights(
          user1Assessment,
          user2Assessment,
          adjustedCompatibility
        ),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('매칭 분석 오류:', error);

      // 상세 에러 로깅
      this.logDetailedError(error, {
        user1: user1Assessment?.userId,
        user2: user2Assessment?.userId,
        processingTime,
        errorType: this.categorizeError(error),
      });

      // 사용자 친화적 에러 메시지와 함께 fallback 결과 제공
      return this.generateFallbackResult(user1Assessment, user2Assessment, error);
    }
  }

  /**
   * 기본 호환성 점수 계산
   */
  calculateBasicCompatibility(assessment1, assessment2) {
    const compatibility = {
      overallScore: 0,
      breakdown: {},
      details: {},
    };

    // 1. 핵심 가치관 호환성
    const coreValuesScore = this.calculateCoreValuesCompatibility(assessment1, assessment2);
    compatibility.breakdown.coreValues = coreValuesScore;
    compatibility.overallScore += coreValuesScore * this.matchingWeights.coreValues;

    // 2. 성격 궁합
    const personalityScore = this.calculatePersonalityCompatibility(assessment1, assessment2);
    compatibility.breakdown.personalityFit = personalityScore;
    compatibility.overallScore += personalityScore * this.matchingWeights.personalityFit;

    // 3. 라이프스타일 호환성
    const lifestyleScore = this.calculateLifestyleCompatibility(assessment1, assessment2);
    compatibility.breakdown.lifestyleCompat = lifestyleScore;
    compatibility.overallScore += lifestyleScore * this.matchingWeights.lifestyleCompat;

    // 4. 소통 방식 동조화
    const communicationScore = this.calculateCommunicationCompatibility(assessment1, assessment2);
    compatibility.breakdown.communicationSync = communicationScore;
    compatibility.overallScore += communicationScore * this.matchingWeights.communicationSync;

    // 5. 상호 성장 가능성
    const growthScore = this.calculateGrowthPotential(assessment1, assessment2);
    compatibility.breakdown.growthPotential = growthScore;
    compatibility.overallScore += growthScore * this.matchingWeights.growthPotential;

    // 세부 점수 저장
    compatibility.details = {
      coreValues: this.getCoreValuesDetails(assessment1, assessment2),
      personality: this.getPersonalityDetails(assessment1, assessment2),
      lifestyle: this.getLifestyleDetails(assessment1, assessment2),
      communication: this.getCommunicationDetails(assessment1, assessment2),
      growth: this.getGrowthDetails(assessment1, assessment2),
    };

    return compatibility;
  }

  /**
   * 핵심 가치관 호환성 계산
   */
  calculateCoreValuesCompatibility(assessment1, assessment2) {
    const values1 = assessment1.valueCategories;
    const values2 = assessment2.valueCategories;

    let totalCompatibility = 0;
    let categoryCount = 0;

    // 각 가치관 카테고리별 호환성 계산
    Object.keys(values1).forEach(category => {
      if (values2[category] !== undefined) {
        const score1 = values1[category];
        const score2 = values2[category];

        // 유사성 기반 호환성 (차이가 클수록 낮은 점수)
        const difference = Math.abs(score1 - score2);
        const similarity = Math.max(0, 100 - difference);

        // 4060세대 특성: 일부 가치관은 더 중요
        const categoryWeight = this.getCategoryImportanceWeight(category);

        totalCompatibility += similarity * categoryWeight;
        categoryCount += categoryWeight;
      }
    });

    return categoryCount > 0 ? totalCompatibility / categoryCount : 50;
  }

  /**
   * 성격 궁합 계산 (보완형 + 유사형 혼합)
   */
  calculatePersonalityCompatibility(assessment1, assessment2) {
    const personality1 = assessment1.personalityScores;
    const personality2 = assessment2.personalityScores;

    let compatibility = 0;
    const traitWeights = {
      // 유사성이 좋은 특성들
      agreeableness: { type: 'similarity', weight: 1.3 },
      conscientiousness: { type: 'similarity', weight: 1.2 },
      emotionalStability: { type: 'similarity', weight: 1.1 },

      // 보완성이 좋은 특성들
      extroversion: { type: 'complement', weight: 1.0 },
      openness: { type: 'balanced', weight: 1.1 },

      // 4060세대 추가 특성
      optimism: { type: 'similarity', weight: 1.2 },
      empathy: { type: 'similarity', weight: 1.3 },
    };

    let totalWeight = 0;

    Object.keys(traitWeights).forEach(trait => {
      if (personality1[trait] !== undefined && personality2[trait] !== undefined) {
        const score1 = personality1[trait];
        const score2 = personality2[trait];
        const config = traitWeights[trait];

        let traitCompatibility = 0;

        switch (config.type) {
          case 'similarity':
            // 유사성 기반 (차이가 적을수록 좋음)
            traitCompatibility = Math.max(0, 100 - Math.abs(score1 - score2));
            break;

          case 'complement':
            // 보완성 기반 (적당한 차이가 좋음)
            const difference = Math.abs(score1 - score2);
            traitCompatibility =
              difference > 15 && difference < 40
                ? 100 - Math.abs(difference - 25) * 2
                : Math.max(0, 100 - difference);
            break;

          case 'balanced':
            // 균형 기반 (둘 다 중간값 근처가 좋음)
            const average = (score1 + score2) / 2;
            const balanceScore = Math.max(0, 100 - Math.abs(average - 50));
            const similarityScore = Math.max(0, 100 - Math.abs(score1 - score2));
            traitCompatibility = (balanceScore + similarityScore) / 2;
            break;
        }

        compatibility += traitCompatibility * config.weight;
        totalWeight += config.weight;
      }
    });

    return totalWeight > 0 ? compatibility / totalWeight : 50;
  }

  /**
   * 매칭 이유 상세 분석
   */
  generateMatchingReasons(assessment1, assessment2, compatibility) {
    const reasons = [];

    // 1. 가치관 공명 포인트
    const valueReasons = this.analyzeValueAlignment(
      assessment1,
      assessment2,
      compatibility.details.coreValues
    );
    reasons.push(...valueReasons);

    // 2. 성격 궁합 포인트
    const personalityReasons = this.analyzePersonalityFit(
      assessment1,
      assessment2,
      compatibility.details.personality
    );
    reasons.push(...personalityReasons);

    // 3. 라이프스타일 조화 포인트
    const lifestyleReasons = this.analyzeLifestyleHarmony(
      assessment1,
      assessment2,
      compatibility.details.lifestyle
    );
    reasons.push(...lifestyleReasons);

    // 4. 특별한 시너지 포인트
    const synergyReasons = this.identifySpecialSynergy(assessment1, assessment2);
    reasons.push(...synergyReasons);

    // 중요도 순으로 정렬 및 상위 5개 선택
    return reasons
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .map((reason, index) => ({
        ...reason,
        rank: index + 1,
      }));
  }

  /**
   * 가치관 공명 분석
   */
  analyzeValueAlignment(assessment1, assessment2, valueDetails) {
    const reasons = [];
    const values1 = assessment1.valueCategories;
    const values2 = assessment2.valueCategories;

    // 높은 호환성을 보이는 가치관 영역 찾기
    Object.keys(values1).forEach(category => {
      const score1 = values1[category];
      const score2 = values2[category];

      if (score1 > 70 && score2 > 70) {
        // 둘 다 높은 값을 가지는 영역
        const similarity = 100 - Math.abs(score1 - score2);

        if (similarity > 80) {
          reasons.push({
            type: 'value_alignment',
            category: category,
            title: this.getValueCategoryName(category),
            description: this.generateValueAlignmentDescription(category, score1, score2),
            importance: similarity,
            evidence: `두 분 모두 ${this.getValueCategoryName(
              category
            )}을 매우 중시하십니다. (${Math.round(score1)}점, ${Math.round(score2)}점)`,
          });
        }
      }
    });

    return reasons;
  }

  /**
   * 성격 궁합 분석
   */
  analyzePersonalityFit(assessment1, assessment2, personalityDetails) {
    const reasons = [];
    const personality1 = assessment1.personalityScores;
    const personality2 = assessment2.personalityScores;

    // 상호 보완적인 성격 특성 찾기
    const complementaryPairs = [
      { trait1: 'extroversion', trait2: 'introversion', description: '외향성과 내향성의 균형' },
      { trait1: 'openness', trait2: 'conscientiousness', description: '개방성과 신중함의 조화' },
      { trait1: 'optimism', trait2: 'realism', description: '낙관성과 현실감각의 균형' },
    ];

    // 높은 유사성을 보이는 긍정적 특성들
    const positiveTraits = ['agreeableness', 'empathy', 'emotionalStability', 'optimism'];

    positiveTraits.forEach(trait => {
      if (personality1[trait] && personality2[trait]) {
        const score1 = personality1[trait];
        const score2 = personality2[trait];

        if (score1 > 65 && score2 > 65) {
          const similarity = 100 - Math.abs(score1 - score2);

          if (similarity > 75) {
            reasons.push({
              type: 'personality_similarity',
              trait: trait,
              title: this.getPersonalityTraitName(trait),
              description: this.generatePersonalitySimilarityDescription(trait, score1, score2),
              importance: similarity * 0.9, // 성격 유사성은 약간 낮은 가중치
              evidence: `두 분 모두 ${this.getPersonalityTraitName(trait)} 특성이 뛰어나십니다.`,
            });
          }
        }
      }
    });

    return reasons;
  }

  /**
   * 만남 가이드 생성
   */
  generateMeetingGuide(assessment1, assessment2, compatibility) {
    const guide = {
      recommendedActivities: [],
      conversationStarters: [],
      attentionPoints: [],
      relationshipTips: [],
    };

    // 1. 추천 활동 (공통 관심사 기반)
    guide.recommendedActivities = this.generateRecommendedActivities(assessment1, assessment2);

    // 2. 대화 시작점 (가치관 공통점 기반)
    guide.conversationStarters = this.generateConversationStarters(
      assessment1,
      assessment2,
      compatibility
    );

    // 3. 주의사항 (잠재적 갈등 포인트)
    guide.attentionPoints = this.generateAttentionPoints(assessment1, assessment2);

    // 4. 관계 발전 팁
    guide.relationshipTips = this.generateRelationshipTips(assessment1, assessment2, compatibility);

    return guide;
  }

  /**
   * 추천 활동 생성
   */
  generateRecommendedActivities(assessment1, assessment2) {
    const activities = [];
    const interests1 = new Set(assessment1.interests?.map(i => i.category) || []);
    const interests2 = new Set(assessment2.interests?.map(i => i.category) || []);

    // 공통 관심사 기반 활동
    const commonInterests = [...interests1].filter(interest => interests2.has(interest));

    commonInterests.forEach(interest => {
      const activity = this.getActivityForInterest(interest);
      if (activity) {
        activities.push({
          type: 'common_interest',
          interest: interest,
          activity: activity.name,
          description: activity.description,
          location: activity.location,
          timeEstimate: activity.timeEstimate,
        });
      }
    });

    // 가치관 기반 활동 추가
    const valueBasedActivities = this.getValueBasedActivities(assessment1, assessment2);
    activities.push(...valueBasedActivities);

    // 4060세대 특화 활동 추가
    const ageAppropriateActivities = this.getAgeAppropriateActivities();
    activities.push(...ageAppropriateActivities.slice(0, 2)); // 상위 2개만

    return activities.slice(0, 6); // 최대 6개 활동
  }

  /**
   * 대화 시작점 생성
   */
  generateConversationStarters(assessment1, assessment2, compatibility) {
    const starters = [];

    // 1. 가치관 공통점 기반
    compatibility.details.coreValues.strongMatches?.forEach(match => {
      starters.push({
        type: 'value_based',
        topic: match.category,
        question: this.getValueBasedQuestion(match.category),
        context: `두 분 모두 ${this.getValueCategoryName(match.category)}을 중시하시니까`,
      });
    });

    // 2. 인생 경험 기반 (4060세대 특화)
    starters.push({
      type: 'life_experience',
      topic: 'life_lessons',
      question: '지금까지 살아오시면서 가장 소중하게 생각하게 된 가치는 무엇인가요?',
      context: '인생 경험이 풍부하신 만큼 깊이 있는 이야기를 나눌 수 있을 것 같아요',
    });

    // 3. 현재 관심사 기반
    const currentInterests = this.getCurrentLifePhaseInterests(assessment1, assessment2);
    starters.push(...currentInterests);

    // 4. 미래 계획 기반
    starters.push({
      type: 'future_oriented',
      topic: 'future_plans',
      question: '앞으로 어떤 새로운 경험을 해보고 싶으신가요?',
      context: '새로운 시작과 도전에 대한 생각을 나눠보시면 좋을 것 같아요',
    });

    return starters.slice(0, 8); // 최대 8개 대화 주제
  }

  /**
   * 주의사항 생성
   */
  generateAttentionPoints(assessment1, assessment2) {
    const points = [];

    // 성격적 차이점에서 오는 주의사항
    const personalityDifferences = this.identifyPersonalityDifferences(assessment1, assessment2);
    personalityDifferences.forEach(diff => {
      if (diff.potentialIssue) {
        points.push({
          type: 'personality_difference',
          area: diff.trait,
          issue: diff.potentialIssue,
          suggestion: diff.suggestion,
        });
      }
    });

    // 소통 스타일 차이
    const communicationDiff = this.analyzeCommunicationDifferences(assessment1, assessment2);
    if (communicationDiff.hasSignificantDifference) {
      points.push({
        type: 'communication_style',
        area: 'communication',
        issue: communicationDiff.issue,
        suggestion: communicationDiff.suggestion,
      });
    }

    // 라이프스타일 차이
    const lifestyleDiff = this.analyzeLifestyleDifferences(assessment1, assessment2);
    if (lifestyleDiff.hasSignificantDifference) {
      points.push({
        type: 'lifestyle_difference',
        area: 'lifestyle',
        issue: lifestyleDiff.issue,
        suggestion: lifestyleDiff.suggestion,
      });
    }

    return points;
  }

  /**
   * 관계 발전 팁 생성
   */
  generateRelationshipTips(assessment1, assessment2, compatibility) {
    const tips = [];

    // 1. 호환성 강화 팁
    if (compatibility.overallScore > 75) {
      tips.push({
        type: 'compatibility_enhancement',
        title: '뛰어난 궁합을 더욱 발전시키려면',
        tip: '이미 좋은 호환성을 보이고 계시니, 서로의 차이점도 존중하며 새로운 면을 발견해 나가세요.',
        priority: 'high',
      });
    }

    // 2. 소통 개선 팁
    tips.push({
      type: 'communication_improvement',
      title: '더 깊은 소통을 위해',
      tip: this.getCustomCommunicationTip(assessment1, assessment2),
      priority: 'high',
    });

    // 3. 성장 지향 팁
    tips.push({
      type: 'mutual_growth',
      title: '함께 성장하는 관계를 위해',
      tip: this.getMutualGrowthTip(assessment1, assessment2),
      priority: 'medium',
    });

    // 4. 4060세대 특화 팁
    tips.push({
      type: 'age_appropriate',
      title: '성숙한 관계 발전을 위해',
      tip: '서두르지 않고 천천히, 서로의 인생 경험과 지혜를 나누며 깊이 있는 관계를 만들어가세요.',
      priority: 'high',
    });

    return tips;
  }

  // 유틸리티 메서드들...

  /**
   * 가치관 카테고리 중요도 가중치
   */
  getCategoryImportanceWeight(category) {
    const weights = {
      family: 1.3, // 가족 관계 중시
      security: 1.2, // 안정성 중시
      health: 1.25, // 건강 중시
      relationships: 1.3, // 인간관계 중시
      spirituality: 1.1, // 영성/철학 관심
      career: 1.0, // 커리어 (상대적으로 낮음)
      adventure: 0.9, // 모험 (상대적으로 낮음)
    };

    return weights[category] || 1.0;
  }

  /**
   * 가치관 카테고리명 한국어 변환
   */
  getValueCategoryName(category) {
    const names = {
      family: '가족과의 유대',
      security: '안정과 평화',
      health: '건강한 삶',
      relationships: '인간관계',
      spirituality: '영성과 철학',
      growth: '성장과 발전',
      creativity: '창의성과 예술',
      adventure: '새로운 경험',
      freedom: '자유와 독립',
      career: '성취와 발전',
    };

    return names[category] || category;
  }

  /**
   * 성격 특성명 한국어 변환
   */
  getPersonalityTraitName(trait) {
    const names = {
      agreeableness: '친화성과 배려심',
      conscientiousness: '성실함과 책임감',
      extroversion: '사교성과 활발함',
      openness: '개방성과 호기심',
      neuroticism: '정서적 안정성',
      optimism: '낙관성과 긍정성',
      empathy: '공감능력과 이해심',
      emotionalStability: '감정 조절력',
    };

    return names[trait] || trait;
  }

  /**
   * 매칭 신뢰도 계산
   */
  calculateMatchConfidence(assessment1, assessment2) {
    let confidence = 0;

    // 두 평가의 완성도
    const completion1 = assessment1.answeredQuestions / assessment1.totalQuestions;
    const completion2 = assessment2.answeredQuestions / assessment2.totalQuestions;
    const avgCompletion = (completion1 + completion2) / 2;
    confidence += avgCompletion * 40;

    // 평가의 신뢰도
    const reliability1 = assessment1.reliabilityScore || 70;
    const reliability2 = assessment2.reliabilityScore || 70;
    const avgReliability = (reliability1 + reliability2) / 2;
    confidence += (avgReliability / 100) * 35;

    // 데이터 일관성
    confidence += 25; // 기본 일관성 점수

    return Math.min(Math.round(confidence), 100);
  }

  /**
   * 라이프스타일 호환성 계산
   */
  calculateLifestyleCompatibility(assessment1, assessment2) {
    // 기본 라이프스타일 호환성 점수
    let compatibility = 70; // 기본값

    // 관심사 기반 호환성
    const interests1 = new Set(assessment1.interests?.map(i => i.category) || []);
    const interests2 = new Set(assessment2.interests?.map(i => i.category) || []);
    const commonInterests = [...interests1].filter(i => interests2.has(i));
    const interestCompatibility =
      (commonInterests.length / Math.max(interests1.size, interests2.size, 1)) * 100;

    // 활동 수준 비교 (건강 가치관 기반)
    const health1 = assessment1.valueCategories?.health || 50;
    const health2 = assessment2.valueCategories?.health || 50;
    const healthCompatibility = Math.max(0, 100 - Math.abs(health1 - health2));

    // 사회적 활동 성향
    const social1 = assessment1.personalityScores?.extroversion || 50;
    const social2 = assessment2.personalityScores?.extroversion || 50;
    const socialCompatibility = Math.max(0, 100 - Math.abs(social1 - social2) * 0.5);

    // 가중 평균
    compatibility =
      interestCompatibility * 0.4 + healthCompatibility * 0.3 + socialCompatibility * 0.3;

    return Math.max(0, Math.min(100, compatibility));
  }

  /**
   * 소통 호환성 계산
   */
  calculateCommunicationCompatibility(assessment1, assessment2) {
    // 친화성 비교
    const agreeableness1 = assessment1.personalityScores?.agreeableness || 50;
    const agreeableness2 = assessment2.personalityScores?.agreeableness || 50;
    const agreeablenessCompat = Math.max(0, 100 - Math.abs(agreeableness1 - agreeableness2));

    // 공감능력 비교
    const empathy1 = assessment1.personalityScores?.empathy || 50;
    const empathy2 = assessment2.personalityScores?.empathy || 50;
    const empathyCompat = Math.max(0, 100 - Math.abs(empathy1 - empathy2));

    // 의사소통 관련 가치관
    const relationships1 = assessment1.valueCategories?.relationships || 50;
    const relationships2 = assessment2.valueCategories?.relationships || 50;
    const relationshipCompat = Math.max(0, 100 - Math.abs(relationships1 - relationships2));

    return agreeablenessCompat * 0.35 + empathyCompat * 0.35 + relationshipCompat * 0.3;
  }

  /**
   * 성장 가능성 계산
   */
  calculateGrowthPotential(assessment1, assessment2) {
    // 개방성 비교 (적당한 차이가 좋음)
    const openness1 = assessment1.personalityScores?.openness || 50;
    const openness2 = assessment2.personalityScores?.openness || 50;
    const opennessDiff = Math.abs(openness1 - openness2);
    const opennessCompat =
      opennessDiff > 10 && opennessDiff < 30 ? 85 : Math.max(0, 100 - opennessDiff);

    // 성장 가치관
    const growth1 = assessment1.valueCategories?.growth || 50;
    const growth2 = assessment2.valueCategories?.growth || 50;
    const growthAverage = (growth1 + growth2) / 2;

    // 학습 지향성 (경험과 지혜 추구)
    const learning1 = assessment1.personalityScores?.conscientiousness || 50;
    const learning2 = assessment2.personalityScores?.conscientiousness || 50;
    const learningCompat = (learning1 + learning2) / 2;

    return opennessCompat * 0.4 + growthAverage * 0.35 + learningCompat * 0.25;
  }

  /**
   * 4060세대 특성 반영 조정
   */
  adjustForAgeGroup(basicCompatibility, user1Assessment, user2Assessment) {
    const adjusted = { ...basicCompatibility };

    // 안정성 중시 보너스
    const stability1 = user1Assessment.valueCategories?.security || 50;
    const stability2 = user2Assessment.valueCategories?.security || 50;
    if (stability1 > 70 && stability2 > 70) {
      adjusted.overallScore *= 1.05; // 5% 보너스
    }

    // 가족 가치관 중시 보너스
    const family1 = user1Assessment.valueCategories?.family || 50;
    const family2 = user2Assessment.valueCategories?.family || 50;
    if (family1 > 75 && family2 > 75) {
      adjusted.overallScore *= 1.08; // 8% 보너스
    }

    // 성숙한 정서적 안정성 보너스
    const emotional1 = user1Assessment.personalityScores?.emotionalStability || 50;
    const emotional2 = user2Assessment.personalityScores?.emotionalStability || 50;
    if (emotional1 > 70 && emotional2 > 70) {
      adjusted.overallScore *= 1.03; // 3% 보너스
    }

    return adjusted;
  }

  /**
   * 핵심 가치관 세부 정보
   */
  getCoreValuesDetails(assessment1, assessment2) {
    const details = {
      strongMatches: [],
      complementaryAreas: [],
      potentialChallenges: [],
    };

    Object.keys(assessment1.valueCategories).forEach(category => {
      const score1 = assessment1.valueCategories[category];
      const score2 = assessment2.valueCategories[category];
      const difference = Math.abs(score1 - score2);

      if (score1 > 70 && score2 > 70 && difference < 15) {
        details.strongMatches.push({
          category,
          score1,
          score2,
          compatibility: 100 - difference,
        });
      } else if (difference > 30) {
        details.potentialChallenges.push({
          category,
          score1,
          score2,
          difference,
        });
      } else {
        details.complementaryAreas.push({
          category,
          score1,
          score2,
          balance: (score1 + score2) / 2,
        });
      }
    });

    return details;
  }

  /**
   * 성격 세부 정보
   */
  getPersonalityDetails(assessment1, assessment2) {
    const traits = [
      'agreeableness',
      'conscientiousness',
      'extroversion',
      'openness',
      'emotionalStability',
    ];

    return traits.map(trait => {
      const score1 = assessment1.personalityScores?.[trait] || 50;
      const score2 = assessment2.personalityScores?.[trait] || 50;
      const difference = Math.abs(score1 - score2);

      return {
        trait,
        score1,
        score2,
        compatibility: Math.max(0, 100 - difference),
        matchType: difference < 15 ? 'similar' : difference > 25 ? 'complement' : 'balanced',
      };
    });
  }

  /**
   * 라이프스타일 세부 정보
   */
  getLifestyleDetails(assessment1, assessment2) {
    const interests1 = assessment1.interests || [];
    const interests2 = assessment2.interests || [];

    return {
      commonInterests: interests1.filter(i1 => interests2.some(i2 => i2.category === i1.category)),
      uniqueInterests1: interests1.filter(
        i1 => !interests2.some(i2 => i2.category === i1.category)
      ),
      uniqueInterests2: interests2.filter(
        i2 => !interests1.some(i1 => i1.category === i2.category)
      ),
      activityLevel: {
        user1: assessment1.valueCategories?.health || 50,
        user2: assessment2.valueCategories?.health || 50,
      },
    };
  }

  /**
   * 소통 세부 정보
   */
  getCommunicationDetails(assessment1, assessment2) {
    return {
      empathyMatch: {
        user1: assessment1.personalityScores?.empathy || 50,
        user2: assessment2.personalityScores?.empathy || 50,
        compatibility: Math.max(
          0,
          100 -
            Math.abs(
              (assessment1.personalityScores?.empathy || 50) -
                (assessment2.personalityScores?.empathy || 50)
            )
        ),
      },
      agreeablenessMatch: {
        user1: assessment1.personalityScores?.agreeableness || 50,
        user2: assessment2.personalityScores?.agreeableness || 50,
        compatibility: Math.max(
          0,
          100 -
            Math.abs(
              (assessment1.personalityScores?.agreeableness || 50) -
                (assessment2.personalityScores?.agreeableness || 50)
            )
        ),
      },
    };
  }

  /**
   * 성장 세부 정보
   */
  getGrowthDetails(assessment1, assessment2) {
    return {
      learningOrientation: {
        user1: assessment1.valueCategories?.growth || 50,
        user2: assessment2.valueCategories?.growth || 50,
        combined:
          ((assessment1.valueCategories?.growth || 50) +
            (assessment2.valueCategories?.growth || 50)) /
          2,
      },
      openness: {
        user1: assessment1.personalityScores?.openness || 50,
        user2: assessment2.personalityScores?.openness || 50,
        synergy: this.calculateOpennessSynergy(
          assessment1.personalityScores?.openness || 50,
          assessment2.personalityScores?.openness || 50
        ),
      },
    };
  }

  /**
   * 개방성 시너지 계산
   */
  calculateOpennessSynergy(openness1, openness2) {
    const difference = Math.abs(openness1 - openness2);
    if (difference > 15 && difference < 35) {
      return 85; // 적당한 차이가 시너지 생성
    } else if (difference < 15) {
      return 75; // 유사성 기반 안정성
    } else {
      return 60; // 큰 차이는 도전적
    }
  }

  /**
   * 도전점과 해결책 분석
   */
  analyzeChallengesAndSolutions(assessment1, assessment2) {
    const challenges = [];
    const solutions = [];

    // 가치관 차이점 분석
    Object.keys(assessment1.valueCategories).forEach(category => {
      const score1 = assessment1.valueCategories[category];
      const score2 = assessment2.valueCategories[category];
      const difference = Math.abs(score1 - score2);

      if (difference > 25) {
        challenges.push({
          area: category,
          type: 'value_difference',
          severity: difference > 40 ? 'high' : 'medium',
          description: `${this.getValueCategoryName(category)} 영역에서 ${difference}점 차이`,
        });

        solutions.push({
          challenge: category,
          suggestion: this.getValueDifferenceSolution(category, score1, score2),
          priority: difference > 40 ? 'high' : 'medium',
        });
      }
    });

    return { challenges, solutions };
  }

  /**
   * 관계 발전 로드맵 생성
   */
  createRelationshipRoadmap(assessment1, assessment2) {
    const compatibility = this.calculateBasicCompatibility(assessment1, assessment2);

    return {
      phase1: {
        title: '첫 만남과 인상',
        duration: '1-2주',
        activities: this.getPhase1Activities(assessment1, assessment2),
        goals: ['서로의 기본 가치관 확인', '편안한 분위기 조성', '공통 관심사 발견'],
      },
      phase2: {
        title: '신뢰 관계 구축',
        duration: '1-2개월',
        activities: this.getPhase2Activities(assessment1, assessment2),
        goals: ['깊은 대화 나누기', '서로의 생활 패턴 이해', '갈등 해결 방식 학습'],
      },
      phase3: {
        title: '미래 지향적 관계',
        duration: '3-6개월',
        activities: this.getPhase3Activities(assessment1, assessment2),
        goals: ['장기적 비전 공유', '실질적 계획 수립', '지속 가능한 관계 모델 구축'],
      },
    };
  }

  /**
   * 1단계 활동 생성
   */
  getPhase1Activities(assessment1, assessment2) {
    const activities = ['편안한 카페에서 대화', '가벼운 산책'];

    // 공통 관심사 기반 활동 추가
    const commonInterests = this.findCommonInterests(assessment1, assessment2);
    if (commonInterests.includes('reading')) activities.push('도서관이나 서점 방문');
    if (commonInterests.includes('cooking')) activities.push('요리 클래스 참여');
    if (commonInterests.includes('music')) activities.push('음악회나 연주회 관람');

    return activities.slice(0, 4);
  }

  /**
   * 2단계 활동 생성
   */
  getPhase2Activities(assessment1, assessment2) {
    return [
      '정기적인 식사 모임',
      '취미 활동 함께 하기',
      '서로의 일상 공간 방문',
      '가족이나 친구들과 만남',
    ];
  }

  /**
   * 3단계 활동 생성
   */
  getPhase3Activities(assessment1, assessment2) {
    return [
      '1박 2일 여행',
      '미래 계획 진지하게 논의',
      '서로의 가족과 시간 보내기',
      '공통 목표나 프로젝트 시작',
    ];
  }

  /**
   * 공통 관심사 찾기
   */
  findCommonInterests(assessment1, assessment2) {
    const interests1 = new Set(assessment1.interests?.map(i => i.category) || []);
    const interests2 = new Set(assessment2.interests?.map(i => i.category) || []);
    return [...interests1].filter(i => interests2.has(i));
  }

  /**
   * 가치관 차이 해결책 제안
   */
  getValueDifferenceSolution(category, score1, score2) {
    const solutions = {
      family: '가족에 대한 서로의 가치관과 경험을 솔직하게 나누어보세요',
      security: '안정성에 대한 서로의 기준과 우선순위를 이해하려 노력하세요',
      adventure: '새로운 경험에 대한 선호도 차이를 존중하며 절충점을 찾아보세요',
      career: '일과 삶에 대한 서로의 철학을 이해하고 지지해주세요',
    };

    return solutions[category] || '서로의 다른 관점을 이해하고 존중하는 대화를 나누어보세요';
  }

  /**
   * 라이프스타일 조화 분석
   */
  analyzeLifestyleHarmony(assessment1, assessment2, lifestyleDetails) {
    const reasons = [];

    // 공통 관심사
    if (lifestyleDetails.commonInterests.length > 0) {
      reasons.push({
        type: 'lifestyle_harmony',
        title: '공통 관심사',
        description: `${lifestyleDetails.commonInterests
          .map(i => i.category)
          .join(', ')} 등 공통된 관심사로 즐거운 시간을 보낼 수 있습니다`,
        importance: 75 + lifestyleDetails.commonInterests.length * 5,
      });
    }

    // 활동 수준 균형
    const activityBalance = Math.abs(
      lifestyleDetails.activityLevel.user1 - lifestyleDetails.activityLevel.user2
    );
    if (activityBalance < 20) {
      reasons.push({
        type: 'lifestyle_harmony',
        title: '활동 수준 조화',
        description: '비슷한 활동 수준으로 함께 하는 활동에서 잘 맞을 것 같습니다',
        importance: 80 - activityBalance,
      });
    }

    return reasons;
  }

  /**
   * 특별한 시너지 포인트 식별
   */
  identifySpecialSynergy(assessment1, assessment2) {
    const synergyReasons = [];

    // 성숙한 관계 시너지 (4060세대 특화)
    const maturity1 =
      (assessment1.personalityScores?.emotionalStability || 50) +
      (assessment1.valueCategories?.family || 50) / 2;
    const maturity2 =
      (assessment2.personalityScores?.emotionalStability || 50) +
      (assessment2.valueCategories?.family || 50) / 2;

    if (maturity1 > 70 && maturity2 > 70) {
      synergyReasons.push({
        type: 'special_synergy',
        title: '성숙한 관계 지향',
        description: '두 분 모두 성숙하고 안정된 관계를 추구하여 깊이 있는 만남이 가능합니다',
        importance: 85,
      });
    }

    // 상호 보완적 강점
    const strengths1 = this.identifyPersonalStrengths(assessment1);
    const strengths2 = this.identifyPersonalStrengths(assessment2);
    const complementaryStrengths = this.findComplementaryStrengths(strengths1, strengths2);

    if (complementaryStrengths.length > 0) {
      synergyReasons.push({
        type: 'special_synergy',
        title: '상호 보완적 강점',
        description: `${complementaryStrengths.join(
          ', '
        )} 영역에서 서로를 보완하며 성장할 수 있습니다`,
        importance: 80,
      });
    }

    return synergyReasons;
  }

  /**
   * 개인 강점 식별
   */
  identifyPersonalStrengths(assessment) {
    const strengths = [];

    if (assessment.personalityScores?.empathy > 75) strengths.push('공감능력');
    if (assessment.personalityScores?.conscientiousness > 75) strengths.push('책임감');
    if (assessment.personalityScores?.agreeableness > 75) strengths.push('친화성');
    if (assessment.valueCategories?.family > 80) strengths.push('가족 중시');
    if (assessment.valueCategories?.health > 80) strengths.push('건강 관리');

    return strengths;
  }

  /**
   * 상호 보완적 강점 찾기
   */
  findComplementaryStrengths(strengths1, strengths2) {
    const complementary = [];
    const allStrengths = [...new Set([...strengths1, ...strengths2])];

    // 각자 다른 강점을 가진 경우
    allStrengths.forEach(strength => {
      const has1 = strengths1.includes(strength);
      const has2 = strengths2.includes(strength);

      if (has1 !== has2) {
        // 한 명만 가진 강점
        complementary.push(strength);
      }
    });

    return complementary.slice(0, 3); // 상위 3개
  }

  /**
   * 관심사별 활동 매핑
   */
  getActivityForInterest(interest) {
    const activities = {
      reading: {
        name: '독서 토론',
        description: '함께 책을 읽고 생각을 나누는 시간',
        location: '도서관이나 카페',
        timeEstimate: '2-3시간',
      },
      cooking: {
        name: '요리 클래스',
        description: '함께 요리를 배우며 즐거운 시간',
        location: '요리 스튜디오',
        timeEstimate: '2-4시간',
      },
      music: {
        name: '콘서트 관람',
        description: '좋아하는 음악 공연 함께 감상',
        location: '콘서트홀',
        timeEstimate: '2-3시간',
      },
      travel: {
        name: '당일치기 여행',
        description: '가까운 곳으로 함께 떠나는 여행',
        location: '근교 관광지',
        timeEstimate: '6-8시간',
      },
      art: {
        name: '미술관 관람',
        description: '예술 작품을 함께 감상하며 대화',
        location: '미술관이나 갤러리',
        timeEstimate: '2-3시간',
      },
    };

    return activities[interest];
  }

  /**
   * 가치관 기반 활동 생성
   */
  getValueBasedActivities(assessment1, assessment2) {
    const activities = [];

    // 건강 중시 → 건강한 활동
    const avgHealth =
      (assessment1.valueCategories?.health + assessment2.valueCategories?.health) / 2;
    if (avgHealth > 70) {
      activities.push({
        type: 'value_based',
        value: 'health',
        activity: '함께 운동하기',
        description: '건강을 중시하는 두 분께 적합한 활동',
        location: '공원이나 체육시설',
        timeEstimate: '1-2시간',
      });
    }

    // 가족 중시 → 가족적 분위기
    const avgFamily =
      (assessment1.valueCategories?.family + assessment2.valueCategories?.family) / 2;
    if (avgFamily > 75) {
      activities.push({
        type: 'value_based',
        value: 'family',
        activity: '전통 찻집 방문',
        description: '따뜻하고 가족적인 분위기에서 대화',
        location: '전통 찻집',
        timeEstimate: '2-3시간',
      });
    }

    return activities;
  }

  /**
   * 4060세대 특화 활동
   */
  getAgeAppropriateActivities() {
    return [
      {
        type: 'age_appropriate',
        activity: '문화센터 강좌',
        description: '함께 새로운 것을 배우는 시간',
        location: '문화센터',
        timeEstimate: '2시간',
        ageRelevance: 'high',
      },
      {
        type: 'age_appropriate',
        activity: '조용한 레스토랑 식사',
        description: '편안한 분위기에서 깊은 대화',
        location: '분위기 좋은 레스토랑',
        timeEstimate: '2-3시간',
        ageRelevance: 'high',
      },
      {
        type: 'age_appropriate',
        activity: '박물관 관람',
        description: '역사와 문화를 함께 탐방',
        location: '박물관',
        timeEstimate: '2-3시간',
        ageRelevance: 'medium',
      },
      {
        type: 'age_appropriate',
        activity: '정원 산책',
        description: '자연 속에서 여유로운 시간',
        location: '식물원이나 공원',
        timeEstimate: '1-2시간',
        ageRelevance: 'high',
      },
    ];
  }

  /**
   * 가치관 기반 질문 생성
   */
  getValueBasedQuestion(category) {
    const questions = {
      family: '가족과의 시간을 어떻게 보내시는 걸 좋아하시나요?',
      security: '인생에서 안정감을 느끼는 순간은 언제인가요?',
      health: '건강 관리를 위해 어떤 노력을 하고 계신가요?',
      relationships: '좋은 인간관계란 어떤 것이라고 생각하시나요?',
      growth: '최근에 새롭게 배우거나 도전해보신 것이 있나요?',
      spirituality: '마음의 평화를 찾는 나만의 방법이 있나요?',
    };

    return questions[category] || '이 분야에 대해 어떻게 생각하시나요?';
  }

  /**
   * 현재 생활 단계 관심사
   */
  getCurrentLifePhaseInterests(assessment1, assessment2) {
    const interests = [];

    // 4060세대 공통 관심사
    interests.push({
      type: 'life_phase',
      topic: 'health_management',
      question: '건강 관리에 대한 관심이나 노하우가 있으신가요?',
      context: '건강한 노후를 위한 준비에 대해',
    });

    interests.push({
      type: 'life_phase',
      topic: 'hobby_development',
      question: '새로 시작해보고 싶은 취미나 활동이 있으신가요?',
      context: '인생의 새로운 즐거움 찾기에 대해',
    });

    return interests;
  }

  /**
   * 성격 차이점 식별
   */
  identifyPersonalityDifferences(assessment1, assessment2) {
    const differences = [];
    const traits = ['extroversion', 'openness', 'conscientiousness'];

    traits.forEach(trait => {
      const score1 = assessment1.personalityScores?.[trait] || 50;
      const score2 = assessment2.personalityScores?.[trait] || 50;
      const difference = Math.abs(score1 - score2);

      if (difference > 25) {
        differences.push({
          trait,
          difference,
          potentialIssue: this.getPersonalityIssue(trait, score1, score2),
          suggestion: this.getPersonalitySuggestion(trait, score1, score2),
        });
      }
    });

    return differences;
  }

  /**
   * 성격 차이로 인한 잠재적 이슈
   */
  getPersonalityIssue(trait, score1, score2) {
    const issues = {
      extroversion:
        score1 > score2
          ? '한 분은 사교적이시고 다른 분은 조용한 시간을 선호하실 수 있습니다'
          : '활동량이나 사람 만나는 빈도에서 차이가 있을 수 있습니다',
      openness: '새로운 경험에 대한 태도나 변화 수용도에 차이가 있을 수 있습니다',
      conscientiousness: '계획성이나 규칙성에 대한 접근 방식이 다를 수 있습니다',
    };

    return issues[trait] || '접근 방식에서 차이가 있을 수 있습니다';
  }

  /**
   * 성격 차이 해결 제안
   */
  getPersonalitySuggestion(trait, score1, score2) {
    const suggestions = {
      extroversion: '활동 계획을 세울 때 서로의 에너지 수준을 고려하여 균형을 맞춰보세요',
      openness: '새로운 시도를 할 때는 천천히 단계적으로 접근해보세요',
      conscientiousness: '계획과 즉흥성의 조화로운 균형점을 찾아보세요',
    };

    return suggestions[trait] || '서로의 차이를 이해하고 절충점을 찾아보세요';
  }

  /**
   * 소통 차이 분석
   */
  analyzeCommunicationDifferences(assessment1, assessment2) {
    const empathy1 = assessment1.personalityScores?.empathy || 50;
    const empathy2 = assessment2.personalityScores?.empathy || 50;
    const empathyDiff = Math.abs(empathy1 - empathy2);

    if (empathyDiff > 20) {
      return {
        hasSignificantDifference: true,
        issue: '감정 표현이나 공감 방식에서 차이가 있을 수 있습니다',
        suggestion: '서로의 감정 표현 방식을 이해하고 존중하는 시간을 가져보세요',
      };
    }

    return { hasSignificantDifference: false };
  }

  /**
   * 라이프스타일 차이 분석
   */
  analyzeLifestyleDifferences(assessment1, assessment2) {
    const health1 = assessment1.valueCategories?.health || 50;
    const health2 = assessment2.valueCategories?.health || 50;
    const healthDiff = Math.abs(health1 - health2);

    if (healthDiff > 25) {
      return {
        hasSignificantDifference: true,
        issue: '활동량이나 생활 패턴에서 차이가 있을 수 있습니다',
        suggestion: '서로의 생활 리듬을 존중하며 함께할 수 있는 활동을 찾아보세요',
      };
    }

    return { hasSignificantDifference: false };
  }

  /**
   * 맞춤형 소통 팁
   */
  getCustomCommunicationTip(assessment1, assessment2) {
    const empathyAvg =
      ((assessment1.personalityScores?.empathy || 50) +
        (assessment2.personalityScores?.empathy || 50)) /
      2;

    if (empathyAvg > 80) {
      return '두 분 모두 공감 능력이 뛰어나시니, 서로의 감정을 깊이 이해하며 소통하세요';
    } else if (empathyAvg > 60) {
      return '상대방의 입장에서 생각해보는 시간을 가지며 대화해보세요';
    } else {
      return '명확하고 솔직한 의사 표현을 통해 오해를 줄여나가세요';
    }
  }

  /**
   * 상호 성장 팁
   */
  getMutualGrowthTip(assessment1, assessment2) {
    const growth1 = assessment1.valueCategories?.growth || 50;
    const growth2 = assessment2.valueCategories?.growth || 50;
    const growthAvg = (growth1 + growth2) / 2;

    if (growthAvg > 75) {
      return '두 분 모두 성장을 중시하시니, 함께 새로운 도전과 학습 기회를 만들어가세요';
    } else {
      return '서로의 경험과 지혜를 나누며 점진적으로 발전해나가세요';
    }
  }

  /**
   * 가치관 공명 설명 생성 (강화된 버전)
   */
  generateValueAlignmentDescription(category, score1, score2) {
    const categoryName = this.getValueCategoryName(category);
    const avgScore = Math.round((score1 + score2) / 2);
    const similarity = 100 - Math.abs(score1 - score2);

    // 점수 수준별 강도 표현
    const intensityLevels = {
      high: avgScore >= 80,
      medium: avgScore >= 60,
      low: avgScore < 60,
    };

    // 유사도별 표현
    const similarityLevel = similarity >= 90 ? 'perfect' : similarity >= 80 ? 'high' : 'good';

    const descriptions = {
      family: {
        perfect: `가족과의 유대를 거의 동일한 수준으로 매우 중시하시어, 가족 중심적인 따뜻한 관계를 자연스럽게 만들어갈 수 있습니다`,
        high: `가족과의 유대를 매우 중시하시는 공통점이 있어, 따뜻하고 안정적인 관계를 만들어갈 수 있을 것 같습니다`,
        good: `가족의 소중함을 함께 인식하고 계셔서, 가정적인 가치를 공유하며 관계를 발전시킬 수 있습니다`,
      },
      security: {
        perfect: `안정과 평화에 대한 갈망이 거의 일치하여, 서로에게 완벽한 안식처가 될 수 있는 관계입니다`,
        high: `안정과 평화를 추구하는 가치관이 일치하여, 서로에게 든든한 지지대가 될 수 있습니다`,
        good: `삶의 안정성을 중시하는 마음이 통해, 예측 가능하고 편안한 관계를 만들어갈 수 있습니다`,
      },
      health: {
        perfect: `건강한 삶에 대한 철학이 거의 동일하여, 함께 웰빙 라이프스타일을 완벽하게 구현할 수 있습니다`,
        high: `건강한 삶을 중시하는 마음이 통해, 함께 건강한 생활을 만들어갈 수 있습니다`,
        good: `건강의 중요성을 공감하시어, 서로의 웰빙을 챙기며 성장할 수 있는 관계입니다`,
      },
      relationships: {
        perfect: `인간관계에 대한 철학과 접근 방식이 거의 완벽하게 일치하여, 조화로운 사회적 관계를 함께 만들어갈 수 있습니다`,
        high: `좋은 인간관계의 중요성을 공감하시어, 서로를 이해하고 배려하는 관계가 가능합니다`,
        good: `인간관계의 가치를 소중히 여기시어, 서로의 사회적 관계에서도 조화를 이룰 수 있습니다`,
      },
      spirituality: {
        perfect: `영성과 철학적 깊이가 매우 유사하여, 삶의 의미에 대해 깊고 통찰력 있는 대화를 나눌 수 있습니다`,
        high: `영성과 철학적 사고를 중시하는 점이 비슷하여, 깊이 있는 대화를 나눌 수 있습니다`,
        good: `내면의 성장과 의미 추구에 관심이 있으시어, 서로의 정신적 발전을 도울 수 있습니다`,
      },
      growth: {
        perfect: `지속적인 성장과 발전에 대한 열망이 거의 일치하여, 함께 끊임없이 발전하는 관계를 만들어갈 수 있습니다`,
        high: `지속적인 성장과 발전을 추구하는 마음이 일치하여, 함께 발전해나갈 수 있습니다`,
        good: `개인적 성장에 관심이 있으시어, 서로의 발전을 격려하고 지지하는 관계가 가능합니다`,
      },
    };

    const categoryDescriptions = descriptions[category];
    if (categoryDescriptions) {
      const description = categoryDescriptions[similarityLevel] || categoryDescriptions.good;

      // 점수 정보 추가
      const scoreInfo = intensityLevels.high
        ? ` (두 분 모두 이 영역에서 매우 높은 점수를 보이십니다: ${score1}점, ${score2}점)`
        : intensityLevels.medium
        ? ` (두 분 모두 이 영역을 중요하게 생각하십니다: ${score1}점, ${score2}점)`
        : ` (이 영역에서 공통된 관심을 보이십니다: ${score1}점, ${score2}점)`;

      return description + scoreInfo;
    }

    return `${categoryName} 영역에서 높은 호환성(${similarity.toFixed(
      0
    )}%)을 보이며, 서로의 가치관을 이해하고 공감할 수 있습니다`;
  }

  /**
   * 성격 유사성 설명 생성 (강화된 버전)
   */
  generatePersonalitySimilarityDescription(trait, score1, score2) {
    const traitName = this.getPersonalityTraitName(trait);
    const avgScore = Math.round((score1 + score2) / 2);
    const similarity = 100 - Math.abs(score1 - score2);

    // 점수 수준별 분류
    const scoreLevel = avgScore >= 80 ? 'high' : avgScore >= 65 ? 'medium' : 'low';
    const similarityLevel = similarity >= 95 ? 'perfect' : similarity >= 85 ? 'high' : 'good';

    const descriptions = {
      agreeableness: {
        perfect: {
          high: `두 분 모두 매우 높은 수준의 친화성과 배려심을 가지고 계시며, 거의 동일한 성향으로 자연스럽게 조화로운 관계를 만들어갈 수 있습니다`,
          medium: `친화적이고 배려심이 깊으신 두 분이 매우 유사한 성향을 보이시어, 갈등 없는 편안한 관계가 가능합니다`,
          low: `온화하고 이해심이 있으신 공통점으로, 서로를 존중하며 점진적으로 발전하는 관계를 만들 수 있습니다`,
        },
        high: {
          high: `두 분 모두 다른 사람을 배려하고 이해하려는 마음이 크시어, 조화로운 관계를 만들어갈 수 있습니다`,
          medium: `친화적인 성향이 비슷하시어, 서로에게 편안함을 주는 관계가 될 것 같습니다`,
          low: `배려하는 마음이 있으시어, 서로를 이해하며 성장하는 관계가 가능합니다`,
        },
        good: {
          high: `친화성이 높으신 두 분이 좋은 궁합을 보이시어, 따뜻한 관계를 발전시킬 수 있습니다`,
          medium: `서로를 배려하는 마음이 통하여, 안정적인 관계를 만들어갈 수 있습니다`,
          low: `상대를 이해하려는 노력이 비슷하시어, 점차 깊어지는 관계가 가능합니다`,
        },
      },
      conscientiousness: {
        perfect: {
          high: `두 분 모두 극도로 높은 책임감과 성실함을 보이시며, 거의 동일한 수준의 신뢰성으로 완벽한 파트너십을 만들 수 있습니다`,
          medium: `성실하고 책임감 있는 성향이 매우 유사하여, 서로에게 완전히 의지할 수 있는 관계입니다`,
          low: `기본적인 책임감을 공유하시어, 믿을 수 있는 관계의 기초를 만들 수 있습니다`,
        },
        high: {
          high: `책임감 있고 신뢰할 수 있는 성격으로, 서로에게 든든한 파트너가 될 수 있습니다`,
          medium: `성실한 성향이 비슷하시어, 안정적이고 예측 가능한 관계가 가능합니다`,
          low: `책임감을 중시하는 마음이 통하여, 신뢰를 쌓아가는 관계가 될 수 있습니다`,
        },
        good: {
          high: `높은 성실성을 가지신 두 분이 좋은 궁합을 보이시어, 믿음직한 관계를 만들 수 있습니다`,
          medium: `성실함에 대한 가치관이 비슷하시어, 서로를 신뢰하는 관계가 가능합니다`,
          low: `기본적인 책임감을 공유하시어, 차근차근 신뢰를 쌓아갈 수 있습니다`,
        },
      },
      emotionalStability: {
        perfect: {
          high: `두 분 모두 뛰어난 정서적 안정성을 가지고 계시며, 거의 동일한 감정 조절 능력으로 매우 안정적인 관계를 만들 수 있습니다`,
          medium: `정서적으로 안정된 성향이 매우 유사하여, 평온하고 조화로운 관계가 가능합니다`,
          low: `기본적인 정서적 안정성을 공유하시어, 차분한 관계를 발전시킬 수 있습니다`,
        },
        high: {
          high: `감정적으로 안정되어 있어, 어려운 상황에서도 서로를 지지하며 극복할 수 있습니다`,
          medium: `정서적 안정성이 비슷하시어, 갈등 상황에서도 냉정함을 유지할 수 있습니다`,
          low: `감정 조절을 중시하는 성향이 통하여, 안정적인 관계를 만들 수 있습니다`,
        },
        good: {
          high: `높은 정서적 안정성을 가지신 두 분이 좋은 균형을 이루어, 평화로운 관계가 가능합니다`,
          medium: `감정적 안정성이 유사하시어, 서로에게 안정감을 주는 관계가 될 수 있습니다`,
          low: `정서적 균형을 추구하는 마음이 비슷하시어, 평온한 관계를 만들어갈 수 있습니다`,
        },
      },
      optimism: {
        perfect: {
          high: `두 분 모두 매우 밝고 긍정적인 성향이 거의 동일하여, 함께 있으면 끊임없이 즐겁고 희망적인 에너지를 만들어낼 수 있습니다`,
          medium: `긍정적인 마인드가 매우 유사하시어, 서로에게 활력을 주는 밝은 관계가 가능합니다`,
          low: `기본적으로 긍정적인 성향을 공유하시어, 서로를 격려하는 관계를 만들 수 있습니다`,
        },
        high: {
          high: `긍정적이고 밝은 성격으로, 함께 있으면 즐겁고 희망적인 시간을 보낼 수 있습니다`,
          medium: `낙관적인 성향이 비슷하시어, 어려운 상황도 함께 극복해 나갈 수 있습니다`,
          low: `긍정적인 마음가짐이 통하여, 서로를 응원하는 관계가 될 수 있습니다`,
        },
        good: {
          high: `높은 낙관성을 가지신 두 분이 좋은 시너지를 만들어, 밝은 관계를 발전시킬 수 있습니다`,
          medium: `긍정적인 성향이 유사하시어, 서로에게 희망을 주는 관계가 가능합니다`,
          low: `낙관적인 면이 비슷하시어, 함께 성장하는 긍정적 관계를 만들 수 있습니다`,
        },
      },
      empathy: {
        perfect: {
          high: `두 분 모두 뛰어난 공감 능력을 가지고 계시며, 거의 동일한 수준의 이해력으로 매우 깊고 의미있는 소통이 가능합니다`,
          medium: `공감 능력이 매우 유사하시어, 서로의 마음을 완전히 이해하는 관계가 가능합니다`,
          low: `기본적인 공감 능력을 공유하시어, 서로를 이해하려는 노력이 통하는 관계입니다`,
        },
        high: {
          high: `상대방의 마음을 잘 이해하고 공감하는 능력이 뛰어나, 깊은 소통이 가능합니다`,
          medium: `공감하는 능력이 비슷하시어, 서로의 감정을 잘 이해할 수 있는 관계입니다`,
          low: `상대방을 이해하려는 마음이 있으시어, 점차 깊어지는 소통이 가능합니다`,
        },
        good: {
          high: `높은 공감 능력을 가지신 두 분이 좋은 조화를 이루어, 깊이 있는 관계를 만들 수 있습니다`,
          medium: `공감적 성향이 유사하시어, 서로의 마음을 헤아리는 관계가 가능합니다`,
          low: `상대방을 이해하는 능력이 비슷하시어, 서로를 배려하는 관계를 발전시킬 수 있습니다`,
        },
      },
    };

    const traitDescriptions = descriptions[trait];
    if (
      traitDescriptions &&
      traitDescriptions[similarityLevel] &&
      traitDescriptions[similarityLevel][scoreLevel]
    ) {
      const description = traitDescriptions[similarityLevel][scoreLevel];
      const detailInfo = ` (${traitName}: 나-${score1}점, 상대방-${score2}점, 유사도 ${similarity.toFixed(
        0
      )}%)`;
      return description + detailInfo;
    }

    // fallback
    return `${traitName} 특성이 비슷하여(유사도 ${similarity.toFixed(
      0
    )}%) 서로를 잘 이해할 수 있습니다`;
  }

  /**
   * 성격 유형 결정
   */
  determinePersonalityType(valueProfile) {
    const communication = valueProfile.personalityProfile.communicationStyle;
    const conflict = valueProfile.personalityProfile.conflictResolution;

    const typeDescriptions = {
      diplomatic_collaborative: { type: 'diplomatic', description: '배려 깊고 협력적인 성향' },
      diplomatic_direct: { type: 'balanced', description: '균형잡힌 소통 방식' },
      analytical_experienced: { type: 'analytical', description: '신중하고 경험 기반의 판단' },
      supportive_collaborative: { type: 'supportive', description: '따뜻하고 지지적인 마음' },
    };

    const key = `${communication}_${conflict}`;
    return typeDescriptions[key] || { type: 'mature', description: '성숙하고 균형잡힌 접근법' };
  }

  /**
   * 핵심 발견사항 추출
   */
  extractKeyFindings(valueProfile) {
    const findings = [];

    // 가장 강한 가치관
    const topValue = valueProfile.primaryValues[0];
    findings.push(`가장 중시하는 가치: ${topValue.name} (${Math.round(topValue.score)}점)`);

    // 성격적 강점
    const strengths = this.identifyPersonalStrengths({
      personalityScores: valueProfile.personalityProfile,
      valueCategories: valueProfile.overallScores,
    });
    if (strengths.length > 0) {
      findings.push(`주요 강점: ${strengths.slice(0, 2).join(', ')}`);
    }

    // 소통 스타일
    findings.push(`소통 스타일: ${valueProfile.personalityProfile.communicationStyle}`);

    return findings.slice(0, 5);
  }

  /**
   * 실행 가능한 인사이트 생성
   */
  generateActionableInsights(valueProfile) {
    const insights = [];

    // 관계에서 활용할 수 있는 강점
    const topValue = valueProfile.primaryValues[0];
    insights.push({
      category: 'relationship_strength',
      insight: `${topValue.name}을 중시하는 특성을 관계에서 활용하세요`,
      action: this.getValueBasedAction(topValue.dimension),
    });

    // 성장 영역
    const growthAreas = valueProfile.dimensionDetails;
    Object.keys(growthAreas).forEach(dimension => {
      if (growthAreas[dimension].overall < 60) {
        insights.push({
          category: 'growth_opportunity',
          insight: `${this.coreValueDimensions[dimension]?.name} 영역에서 성장 기회가 있습니다`,
          action: this.getDimensionGrowthAction(dimension),
        });
      }
    });

    return insights.slice(0, 3);
  }

  /**
   * 분석 신뢰도 계산
   */
  calculateAnalysisConfidence(valueProfile) {
    let confidence = 70; // 기본 신뢰도

    // 답변 완성도 기반 조정
    const completion = valueProfile.primaryValues.length / 3; // 상위 3개 기준
    confidence += completion * 15;

    // 일관성 기반 조정
    const topScores = valueProfile.primaryValues.map(v => v.score);
    const scoreVariation = Math.max(...topScores) - Math.min(...topScores);
    if (scoreVariation < 20) confidence += 10; // 일관된 점수

    // 극값 확인 (너무 극단적이지 않은지)
    const hasExtreme = topScores.some(score => score > 95 || score < 10);
    if (!hasExtreme) confidence += 5;

    return Math.min(Math.round(confidence), 100);
  }

  /**
   * 가치관 기반 행동 제안
   */
  getValueBasedAction(dimension) {
    const actions = {
      lifePerspective: '삶의 철학과 지혜를 나누는 깊은 대화 시간을 가져보세요',
      relationshipValues: '서로의 관계 경험과 소중한 사람들에 대해 이야기해보세요',
      stabilityGrowth: '안정적인 환경에서 새로운 경험을 함께 시도해보세요',
      healthWellness: '건강한 활동과 웰빙을 함께 추구해보세요',
      socialContribution: '의미 있는 봉사나 사회 활동을 함께 계획해보세요',
    };

    return actions[dimension] || '이 가치를 중심으로 함께할 수 있는 활동을 찾아보세요';
  }

  /**
   * 차원별 성장 행동 제안
   */
  getDimensionGrowthAction(dimension) {
    const actions = {
      lifePerspective: '명상이나 철학 서적을 통해 내면을 탐구해보세요',
      relationshipValues: '새로운 사람들과의 만남을 통해 관계 기술을 발전시켜보세요',
      stabilityGrowth: '작은 도전부터 시작해 점진적으로 comfort zone을 확장해보세요',
      healthWellness: '규칙적인 운동이나 건강한 식습관을 만들어보세요',
      socialContribution: '관심 있는 분야에서 작은 봉사활동부터 시작해보세요',
    };

    return actions[dimension] || '이 영역에서 작은 변화부터 시작해보세요';
  }

  /**
   * 균형 필요 영역 식별
   */
  identifyBalanceNeeds(valueProfile) {
    const balanceAreas = [];
    const scores = valueProfile.overallScores;

    // 점수 차이가 큰 영역들 찾기
    const scoreValues = Object.keys(scores).map(key => ({
      dimension: key,
      score: scores[key].overall,
    }));

    const maxScore = Math.max(...scoreValues.map(s => s.score));
    const minScore = Math.min(...scoreValues.map(s => s.score));

    if (maxScore - minScore > 40) {
      const lowScoringAreas = scoreValues.filter(s => s.score < maxScore - 30);

      lowScoringAreas.forEach(area => {
        balanceAreas.push({
          area: this.coreValueDimensions[area.dimension]?.name || area.dimension,
          currentScore: Math.round(area.score),
          suggestion: `${
            this.coreValueDimensions[area.dimension]?.name || area.dimension
          } 영역에 더 관심을 기울여 균형을 맞춰보세요`,
          priority: maxScore - area.score > 50 ? 'high' : 'medium',
        });
      });
    }

    return balanceAreas;
  }

  /**
   * 차원별 제안 생성
   */
  getSuggestionForDimension(dimension) {
    const suggestions = {
      lifePerspective: '인생의 의미와 목적에 대해 더 깊이 생각해보는 시간을 가져보세요',
      relationshipValues: '소중한 사람들과의 관계에 더 많은 시간과 노력을 투자해보세요',
      stabilityGrowth: '안정성과 새로운 도전 사이의 균형점을 찾아보세요',
      healthWellness: '신체적, 정신적 건강에 더 많은 관심을 기울여보세요',
      socialContribution: '사회나 공동체에 기여할 수 있는 방법을 찾아보세요',
    };

    return suggestions[dimension] || '이 영역에서 개선할 수 있는 부분을 찾아보세요';
  }

  /**
   * 갈등 해결 방식 설명
   */
  getConflictResolutionDescription(style) {
    const descriptions = {
      direct: '문제를 직접적으로 다루며 명확한 해결책을 추구합니다',
      collaborative: '상호 협력을 통해 서로 만족할 수 있는 해결책을 찾습니다',
      diplomatic: '조화를 중시하며 부드러운 방식으로 갈등을 해결합니다',
      avoidant: '갈등을 피하는 경향이 있으며 시간을 두고 해결하려 합니다',
    };

    return descriptions[style] || '상황에 따라 유연하게 갈등을 해결합니다';
  }

  /**
   * 갈등 해결 팁
   */
  getConflictResolutionTips(style) {
    const tips = {
      direct: ['때로는 감정적 측면도 고려해보세요', '상대방의 입장을 충분히 들어보세요'],
      collaborative: [
        '때로는 빠른 결정도 필요할 수 있습니다',
        '완벽한 해결책을 추구하기보다 실용적 접근도 시도해보세요',
      ],
      diplomatic: [
        '중요한 문제는 명확히 표현하는 것도 필요합니다',
        '갈등을 피하기보다 건설적으로 다루어보세요',
      ],
      avoidant: ['작은 문제는 일찍 해결하는 것이 좋습니다', '대화를 통한 해결을 시도해보세요'],
    };

    return tips[style] || ['열린 마음으로 소통하세요', '서로의 관점을 이해하려 노력하세요'];
  }

  /**
   * 개인 성장 영역 생성
   */
  generatePersonalGrowthAreas(valueProfile) {
    const growthAreas = [];

    // 상대적으로 낮은 점수의 가치관 영역
    const allDimensions = Object.keys(valueProfile.overallScores);
    const sortedDimensions = allDimensions
      .map(dim => ({
        dimension: dim,
        score: valueProfile.overallScores[dim].overall,
        name: this.coreValueDimensions[dim]?.name || dim,
      }))
      .sort((a, b) => a.score - b.score);

    // 하위 2개 영역을 성장 기회로 제안
    sortedDimensions.slice(0, 2).forEach(dim => {
      if (dim.score < 70) {
        growthAreas.push({
          area: dim.name,
          currentLevel: Math.round(dim.score),
          growthPotential: 'high',
          suggestion: this.getSuggestionForDimension(dim.dimension),
          benefits: this.getGrowthBenefits(dim.dimension),
        });
      }
    });

    return growthAreas;
  }

  /**
   * 성장 시 얻을 수 있는 이익
   */
  getGrowthBenefits(dimension) {
    const benefits = {
      lifePerspective: ['더 깊은 삶의 만족감', '지혜로운 결정 능력', '내면의 평화'],
      relationshipValues: ['더 따뜻한 인간관계', '신뢰받는 관계', '사회적 지지망 확대'],
      stabilityGrowth: ['균형잡힌 삶', '변화 적응력', '새로운 기회 발견'],
      healthWellness: ['활력 넘치는 일상', '스트레스 관리 능력', '장기적 건강'],
      socialContribution: ['의미있는 삶', '사회적 연결감', '긍정적 영향력'],
    };

    return benefits[dimension] || ['개인적 성장', '삶의 질 향상', '새로운 가능성'];
  }

  /**
   * 카테고리 관련성 확인
   */
  isCategoryRelated(key, category) {
    const categoryMappings = {
      family_relationships: ['family', 'relationships', 'agreeableness'],
      stability_adventure: ['security', 'stability', 'adventure', 'openness'],
      social_preferences: ['extroversion', 'agreeableness', 'relationships'],
    };

    return categoryMappings[category]?.includes(key) || false;
  }

  // ========== 에러 처리 강화 메서드들 ==========

  /**
   * 입력 데이터 검증
   */
  validateAssessmentData(assessment1, assessment2) {
    const errors = [];

    // 필수 필드 검증
    if (!assessment1 || !assessment2) {
      errors.push('매칭 분석에 필요한 데이터가 누락되었습니다');
      return { isValid: false, errors };
    }

    if (!assessment1.userId || !assessment2.userId) {
      errors.push('사용자 ID가 누락되었습니다');
    }

    if (!assessment1.valueCategories || !assessment2.valueCategories) {
      errors.push('가치관 데이터가 누락되었습니다');
    }

    if (!assessment1.personalityScores || !assessment2.personalityScores) {
      errors.push('성격 점수 데이터가 누락되었습니다');
    }

    // 데이터 품질 검증
    if (assessment1.valueCategories && Object.keys(assessment1.valueCategories).length < 3) {
      errors.push('가치관 데이터가 불완전합니다');
    }

    if (assessment2.valueCategories && Object.keys(assessment2.valueCategories).length < 3) {
      errors.push('상대방의 가치관 데이터가 불완전합니다');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 안전한 기본 호환성 계산
   */
  async safeCalculateBasicCompatibility(assessment1, assessment2) {
    try {
      return this.calculateBasicCompatibility(assessment1, assessment2);
    } catch (error) {
      console.warn('기본 호환성 계산 실패, fallback 사용:', error.message);
      return this.getFallbackCompatibility(assessment1, assessment2);
    }
  }

  /**
   * 안전한 연령대 조정
   */
  async safeAdjustForAgeGroup(compatibility, assessment1, assessment2) {
    try {
      return this.adjustForAgeGroup(compatibility, assessment1, assessment2);
    } catch (error) {
      console.warn('연령대 조정 실패, 기본값 사용:', error.message);
      return compatibility; // 조정 없이 기본 호환성 반환
    }
  }

  /**
   * 안전한 매칭 이유 생성
   */
  async safeGenerateMatchingReasons(assessment1, assessment2, compatibility) {
    try {
      return this.generateMatchingReasons(assessment1, assessment2, compatibility);
    } catch (error) {
      console.warn('매칭 이유 생성 실패, 기본 이유 사용:', error.message);
      return this.getDefaultMatchingReasons(compatibility.overallScore);
    }
  }

  /**
   * 안전한 도전점 분석
   */
  async safeAnalyzeChallengesAndSolutions(assessment1, assessment2) {
    try {
      return this.analyzeChallengesAndSolutions(assessment1, assessment2);
    } catch (error) {
      console.warn('도전점 분석 실패, 기본값 사용:', error.message);
      return { challenges: [], solutions: [] };
    }
  }

  /**
   * 안전한 만남 가이드 생성
   */
  async safeGenerateMeetingGuide(assessment1, assessment2, compatibility) {
    try {
      return this.generateMeetingGuide(assessment1, assessment2, compatibility);
    } catch (error) {
      console.warn('만남 가이드 생성 실패, 기본 가이드 사용:', error.message);
      return this.getDefaultMeetingGuide();
    }
  }

  /**
   * 안전한 관계 로드맵 생성
   */
  async safeCreateRelationshipRoadmap(assessment1, assessment2) {
    try {
      return this.createRelationshipRoadmap(assessment1, assessment2);
    } catch (error) {
      console.warn('관계 로드맵 생성 실패, 기본 로드맵 사용:', error.message);
      return this.getDefaultRoadmap();
    }
  }

  /**
   * 점수 검증 및 조정
   */
  validateAndAdjustScore(score) {
    if (typeof score !== 'number' || isNaN(score)) {
      console.warn('유효하지 않은 점수, 기본값 사용:', score);
      return 65; // 중간값 기본 점수
    }

    // 점수를 0-100 범위로 제한
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 에러 분류
   */
  categorizeError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('데이터') || message.includes('누락')) {
      return 'DATA_ERROR';
    } else if (message.includes('계산') || message.includes('분석')) {
      return 'CALCULATION_ERROR';
    } else if (message.includes('timeout') || message.includes('시간')) {
      return 'TIMEOUT_ERROR';
    } else {
      return 'UNKNOWN_ERROR';
    }
  }

  /**
   * 상세 에러 로깅
   */
  logDetailedError(error, context) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        type: context.errorType,
      },
      context: {
        user1: context.user1,
        user2: context.user2,
        processingTime: context.processingTime,
        sessionId: Math.random().toString(36).substring(7),
      },
      severity: this.determineErrorSeverity(error),
    };

    console.error('🚨 매칭 엔진 에러:', JSON.stringify(errorLog, null, 2));
  }

  /**
   * 에러 심각도 결정
   */
  determineErrorSeverity(error) {
    const message = error.message.toLowerCase();

    if (message.includes('검증') || message.includes('데이터')) {
      return 'HIGH'; // 데이터 문제는 심각
    } else if (message.includes('계산')) {
      return 'MEDIUM'; // 계산 오류는 중간
    } else {
      return 'LOW'; // 기타는 낮음
    }
  }

  /**
   * Fallback 결과 생성
   */
  generateFallbackResult(assessment1, assessment2, originalError) {
    console.log('🔄 Fallback 매칭 결과 생성 중...');

    const errorType = this.categorizeError(originalError);
    const fallbackScore = this.calculateSimpleFallbackScore(assessment1, assessment2);

    return {
      overallScore: fallbackScore,
      compatibility: this.getFallbackCompatibility(assessment1, assessment2),
      matchingReasons: this.getDefaultMatchingReasons(fallbackScore),
      challengesAndSolutions: { challenges: [], solutions: [] },
      meetingGuide: this.getDefaultMeetingGuide(),
      relationshipRoadmap: this.getDefaultRoadmap(),
      confidenceLevel: 40, // Fallback의 경우 낮은 신뢰도
      timestamp: new Date(),
      version: '3.0-fallback',
      fallbacksUsed: ['COMPREHENSIVE_ANALYSIS'],
      errorInfo: {
        type: errorType,
        fallbackReason: '매칭 분석 중 오류가 발생하여 기본 분석을 제공합니다',
        userMessage: this.getUserFriendlyErrorMessage(errorType),
      },
    };
  }

  /**
   * 간단한 fallback 점수 계산
   */
  calculateSimpleFallbackScore(assessment1, assessment2) {
    try {
      if (!assessment1?.valueCategories || !assessment2?.valueCategories) {
        return 65; // 기본 중간 점수
      }

      // 간단한 가치관 유사도만 계산
      const values1 = assessment1.valueCategories;
      const values2 = assessment2.valueCategories;

      let totalDiff = 0;
      let count = 0;

      Object.keys(values1).forEach(key => {
        if (values2[key] !== undefined) {
          totalDiff += Math.abs(values1[key] - values2[key]);
          count++;
        }
      });

      const avgDifference = count > 0 ? totalDiff / count : 35;
      return Math.max(30, Math.min(85, 100 - avgDifference));
    } catch (error) {
      console.warn('Fallback 점수 계산도 실패, 기본값 사용');
      return 65;
    }
  }

  /**
   * Fallback 호환성 데이터
   */
  getFallbackCompatibility(assessment1, assessment2) {
    return {
      overallScore: this.calculateSimpleFallbackScore(assessment1, assessment2),
      breakdown: {
        coreValues: 60,
        personalityFit: 60,
        lifestyleCompat: 60,
        communicationSync: 60,
        growthPotential: 60,
      },
      details: {
        fallbackMode: true,
        limitedAnalysis: true,
      },
    };
  }

  /**
   * 기본 매칭 이유
   */
  getDefaultMatchingReasons(score) {
    if (score >= 70) {
      return [
        {
          type: 'general_compatibility',
          title: '전반적인 궁합',
          description: '두 분의 전반적인 가치관과 성향이 잘 어울립니다',
          importance: 75,
          rank: 1,
        },
      ];
    } else {
      return [
        {
          type: 'potential_growth',
          title: '성장 가능성',
          description: '서로 다른 점들을 통해 새로운 배움의 기회가 있습니다',
          importance: 60,
          rank: 1,
        },
      ];
    }
  }

  /**
   * 기본 만남 가이드
   */
  getDefaultMeetingGuide() {
    return {
      recommendedActivities: [
        {
          type: 'safe_default',
          activity: '편안한 카페에서 대화',
          description: '조용하고 편안한 분위기에서 서로를 알아가는 시간',
          location: '카페',
          timeEstimate: '1-2시간',
        },
      ],
      conversationStarters: [
        {
          type: 'general',
          topic: 'life_experiences',
          question: '최근에 어떤 일로 시간을 보내고 계신가요?',
          context: '일상적인 대화로 시작',
        },
      ],
      attentionPoints: [],
      relationshipTips: [
        {
          type: 'general',
          title: '편안한 분위기 만들기',
          tip: '서두르지 않고 자연스럽게 대화를 나누어보세요',
          priority: 'high',
        },
      ],
    };
  }

  /**
   * 기본 관계 로드맵
   */
  getDefaultRoadmap() {
    return {
      phase1: {
        title: '첫 만남과 인상',
        duration: '1-2주',
        activities: ['편안한 카페에서 대화', '가벼운 산책'],
        goals: ['서로의 기본적인 모습 파악', '편안한 분위기 조성'],
      },
      phase2: {
        title: '신뢰 관계 구축',
        duration: '1-2개월',
        activities: ['정기적인 만남', '공통 관심사 탐색'],
        goals: ['서로에 대한 이해 증진', '신뢰 관계 형성'],
      },
      phase3: {
        title: '깊은 관계 발전',
        duration: '3-6개월',
        activities: ['의미있는 활동 공유', '미래 계획 논의'],
        goals: ['장기적 관점에서의 관계 발전'],
      },
    };
  }

  /**
   * 활성화된 fallback 목록
   */
  getActiveFallbacks() {
    return this.activeFallbacks || [];
  }

  /**
   * 사용자 친화적 에러 메시지
   */
  getUserFriendlyErrorMessage(errorType) {
    const messages = {
      DATA_ERROR:
        '일시적으로 데이터 처리에 문제가 있어 기본 분석을 제공합니다. 잠시 후 다시 시도해주세요.',
      CALCULATION_ERROR: '복합적인 분석에 일시적 문제가 있어 간소화된 결과를 제공합니다.',
      TIMEOUT_ERROR: '분석 시간이 초과되어 빠른 결과를 제공합니다.',
      UNKNOWN_ERROR: '예상치 못한 문제가 발생하여 기본 분석을 제공합니다.',
    };

    return messages[errorType] || messages['UNKNOWN_ERROR'];
  }

  // ========== 결과 설명 보강 메서드들 ==========

  /**
   * 점수별 해석 생성
   */
  generateScoreInterpretation(score) {
    if (score >= 90) {
      return {
        level: 'exceptional',
        title: '환상적인 궁합',
        description:
          '매우 드문 최상의 호환성을 보입니다. 두 분은 가치관, 성격, 생활방식에서 탁월한 조화를 이루며, 깊고 의미있는 관계로 발전할 가능성이 매우 높습니다.',
        percentage: '상위 5%',
        recommendation:
          '이런 기회는 흔하지 않습니다. 적극적으로 관계를 발전시켜 보시기를 강력히 추천합니다.',
      };
    } else if (score >= 80) {
      return {
        level: 'excellent',
        title: '뛰어난 궁합',
        description:
          '매우 높은 호환성을 보이며, 4060세대에게 이상적인 매칭입니다. 서로의 가치관과 성격이 잘 맞아 안정적이고 행복한 관계를 만들어갈 수 있습니다.',
        percentage: '상위 15%',
        recommendation:
          '훌륭한 매칭입니다. 첫 만남에서 편안함을 느끼실 가능성이 높으니 자신감을 가지고 만나보세요.',
      };
    } else if (score >= 70) {
      return {
        level: 'very_good',
        title: '매우 좋은 궁합',
        description:
          '좋은 호환성을 보이는 매칭입니다. 몇 가지 차이점이 있을 수 있지만, 이는 오히려 서로를 보완하며 성장할 수 있는 기회가 될 것입니다.',
        percentage: '상위 30%',
        recommendation:
          '긍정적인 결과를 기대해도 좋습니다. 열린 마음으로 서로를 알아가며 관계를 발전시켜 보세요.',
      };
    } else if (score >= 60) {
      return {
        level: 'good',
        title: '좋은 궁합',
        description:
          '기본적인 호환성을 바탕으로 좋은 관계를 만들어갈 수 있습니다. 서로 다른 점들이 있지만, 이해와 소통을 통해 조화를 이룰 수 있습니다.',
        percentage: '상위 50%',
        recommendation:
          '시간을 두고 서로를 알아가며 관계를 천천히 발전시켜 보세요. 인내심을 가지면 좋은 결과를 얻을 수 있습니다.',
      };
    } else {
      return {
        level: 'challenging',
        title: '도전적인 관계',
        description:
          '상당한 차이점들이 있어 관계 발전에 노력이 필요합니다. 하지만 서로 다른 점들을 인정하고 존중한다면, 새로운 관점을 배우며 성장할 수 있는 기회가 될 수 있습니다.',
        percentage: '하위 50%',
        recommendation:
          '신중하게 접근하시되, 열린 마음으로 상대방의 다른 점들을 이해하려 노력해보세요. 시간이 걸리더라도 의미있는 관계로 발전할 수 있습니다.',
      };
    }
  }

  /**
   * 상세 점수 분석
   */
  generateDetailedBreakdown(compatibility) {
    const breakdown = compatibility.breakdown;
    const analysis = [];

    Object.keys(breakdown).forEach(category => {
      const score = breakdown[category];
      const categoryAnalysis = this.analyzeCategoryScore(category, score);
      analysis.push(categoryAnalysis);
    });

    // 가장 강한 영역과 약한 영역 식별
    const sortedCategories = analysis.sort((a, b) => b.score - a.score);
    const strongest = sortedCategories[0];
    const weakest = sortedCategories[sortedCategories.length - 1];

    return {
      categoryAnalysis: analysis,
      strongest: {
        category: strongest.category,
        score: strongest.score,
        insight: `두 분의 가장 강한 호환 영역은 ${strongest.displayName}입니다. 이 부분에서 자연스러운 조화를 이루실 것입니다.`,
      },
      weakest: {
        category: weakest.category,
        score: weakest.score,
        insight:
          weakest.score < 60
            ? `${weakest.displayName} 영역에서 차이가 있지만, 이는 서로를 보완할 수 있는 기회가 될 수 있습니다.`
            : `전체적으로 균형잡힌 호환성을 보이고 있습니다.`,
      },
      overallBalance: this.assessOverallBalance(analysis),
    };
  }

  /**
   * 관계 발전 가능성 평가
   */
  assessRelationshipPotential(score, compatibility) {
    const potential = {
      shortTerm: this.assessShortTermPotential(score, compatibility),
      longTerm: this.assessLongTermPotential(score, compatibility),
      successFactors: this.identifySuccessFactors(compatibility),
      growthAreas: this.identifyGrowthAreas(compatibility),
    };

    return potential;
  }

  /**
   * 개선 제안 생성
   */
  generateImprovementSuggestions(score, challengesAndSolutions) {
    const suggestions = [];

    // 점수별 일반적인 제안
    if (score >= 80) {
      suggestions.push({
        type: 'maintenance',
        title: '높은 호환성 유지하기',
        suggestion:
          '이미 훌륭한 호환성을 보이고 계시니, 이를 유지하며 더욱 깊이 있는 관계로 발전시켜 나가세요.',
        priority: 'medium',
      });
    } else if (score >= 60) {
      suggestions.push({
        type: 'enhancement',
        title: '호환성 향상 방법',
        suggestion:
          '공통점을 더 깊이 탐구하고, 차이점에 대해서는 열린 마음으로 이해하려 노력해보세요.',
        priority: 'high',
      });
    } else {
      suggestions.push({
        type: 'foundation',
        title: '관계 기초 다지기',
        suggestion:
          '서두르지 마시고 서로를 이해하는 데 충분한 시간을 투자하세요. 작은 공통점부터 찾아나가세요.',
        priority: 'high',
      });
    }

    // 도전점 기반 제안
    if (challengesAndSolutions.solutions && challengesAndSolutions.solutions.length > 0) {
      challengesAndSolutions.solutions.forEach(solution => {
        suggestions.push({
          type: 'challenge_specific',
          title: `${solution.challenge} 영역 개선`,
          suggestion: solution.suggestion,
          priority: solution.priority || 'medium',
        });
      });
    }

    return suggestions.slice(0, 4); // 최대 4개 제안
  }

  /**
   * 호환성 인사이트 생성
   */
  generateCompatibilityInsights(user1Assessment, user2Assessment, compatibility) {
    const insights = [];

    // 4060세대 특화 인사이트
    insights.push({
      type: 'age_group_specific',
      title: '4060세대 매칭 특성',
      insight: this.generate4060Insight(
        user1Assessment,
        user2Assessment,
        compatibility.overallScore
      ),
    });

    // 가치관 기반 인사이트
    const valueInsight = this.generateValueBasedInsight(user1Assessment, user2Assessment);
    if (valueInsight) insights.push(valueInsight);

    // 성격 기반 인사이트
    const personalityInsight = this.generatePersonalityBasedInsight(
      user1Assessment,
      user2Assessment
    );
    if (personalityInsight) insights.push(personalityInsight);

    // 성장 잠재력 인사이트
    const growthInsight = this.generateGrowthPotentialInsight(user1Assessment, user2Assessment);
    if (growthInsight) insights.push(growthInsight);

    return insights;
  }

  /**
   * 카테고리별 점수 분석
   */
  analyzeCategoryScore(category, score) {
    const categoryNames = {
      coreValues: '핵심 가치관',
      personalityFit: '성격 궁합',
      lifestyleCompat: '라이프스타일',
      communicationSync: '소통 방식',
      growthPotential: '성장 가능성',
    };

    const analysis = {
      category,
      displayName: categoryNames[category] || category,
      score: Math.round(score),
      level:
        score >= 80 ? 'excellent' : score >= 65 ? 'good' : score >= 50 ? 'fair' : 'challenging',
      interpretation: this.getCategoryInterpretation(category, score),
    };

    return analysis;
  }

  /**
   * 카테고리별 해석
   */
  getCategoryInterpretation(category, score) {
    const interpretations = {
      coreValues: {
        excellent: '인생에서 추구하는 가치와 목표가 매우 잘 맞습니다',
        good: '기본적인 가치관에서 좋은 호환성을 보입니다',
        fair: '일부 가치관에서 차이가 있지만 이해할 수 있는 수준입니다',
        challenging: '가치관에서 상당한 차이가 있어 서로 이해하는 노력이 필요합니다',
      },
      personalityFit: {
        excellent: '성격적으로 매우 잘 어울리며 자연스러운 조화를 이룹니다',
        good: '성격적으로 좋은 궁합을 보이며 편안한 관계가 가능합니다',
        fair: '성격적 차이가 있지만 서로 보완할 수 있습니다',
        challenging: '성격적 차이가 커서 서로 이해하는 시간이 필요합니다',
      },
      lifestyleCompat: {
        excellent: '생활 패턴과 방식이 매우 잘 맞아 조화로운 일상이 가능합니다',
        good: '생활 방식에서 좋은 호환성을 보입니다',
        fair: '생활 패턴에서 일부 차이가 있지만 조율 가능합니다',
        challenging: '생활 방식에서 상당한 차이가 있어 조율이 필요합니다',
      },
      communicationSync: {
        excellent: '소통 방식이 매우 잘 맞아 깊이 있는 대화가 가능합니다',
        good: '소통에서 좋은 호환성을 보이며 이해가 잘 됩니다',
        fair: '소통 방식에서 약간의 차이가 있지만 조화 가능합니다',
        challenging: '소통 방식에서 차이가 있어 서로 이해하는 노력이 필요합니다',
      },
      growthPotential: {
        excellent: '함께 성장하고 발전할 수 있는 뛰어난 잠재력을 가지고 있습니다',
        good: '서로의 성장을 도울 수 있는 좋은 가능성이 있습니다',
        fair: '점진적으로 함께 발전해 나갈 수 있습니다',
        challenging: '성장 방향에서 차이가 있지만 새로운 관점을 배울 수 있습니다',
      },
    };

    const level =
      score >= 80 ? 'excellent' : score >= 65 ? 'good' : score >= 50 ? 'fair' : 'challenging';
    return interpretations[category]?.[level] || '이 영역에서의 호환성을 평가 중입니다';
  }

  // 추가 유틸리티 메서드들...
}

module.exports = new IntelligentMatchingEngine();
