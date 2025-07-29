const ValuesAssessment = require('../models/ValuesAssessment');

/**
 * 4060세대 특화 가치관 분석 엔진
 *
 * 핵심 기능:
 * 1. 15개 질문 체계적 분석
 * 2. 4060세대 특성 반영
 * 3. 개인별 가치관 프로필 생성
 * 4. 설명 가능한 분석 결과 제공
 */
class ValuesAnalysisEngine {
  constructor() {
    // 4060세대 핵심 가치관 차원 정의
    this.coreValueDimensions = {
      // 인생 경험 기반 가치관
      lifePerspective: {
        name: '인생관',
        description: '삶을 바라보는 관점과 철학',
        weight: 0.25,
        subCategories: {
          wisdom: '지혜와 성숙함',
          authenticity: '진정성과 솔직함',
          gratitude: '감사와 만족',
          purpose: '목적의식과 의미',
        },
      },

      // 관계 중심 가치관
      relationshipValues: {
        name: '관계관',
        description: '인간관계에 대한 가치와 접근법',
        weight: 0.22,
        subCategories: {
          family: '가족 중심성',
          loyalty: '신뢰와 충성',
          communication: '소통과 이해',
          support: '상호 지지',
        },
      },

      // 안정성과 성장의 균형
      stabilityGrowth: {
        name: '안정-성장 균형',
        description: '안정과 새로운 도전 사이의 균형점',
        weight: 0.2,
        subCategories: {
          security: '경제적/정서적 안정',
          adventure: '새로운 경험과 도전',
          comfort: '편안함과 평화',
          growth: '지속적 학습과 발전',
        },
      },

      // 건강과 웰빙
      healthWellness: {
        name: '건강관',
        description: '신체적, 정신적 건강에 대한 가치관',
        weight: 0.18,
        subCategories: {
          physical: '신체 건강 관리',
          mental: '정신적 웰빙',
          balance: '일과 삶의 균형',
          vitality: '활력과 에너지',
        },
      },

      // 사회적 기여와 의미
      socialContribution: {
        name: '사회기여관',
        description: '사회와 공동체에 대한 책임감과 기여 의식',
        weight: 0.15,
        subCategories: {
          legacy: '유산과 전수',
          mentoring: '후배 양성',
          community: '공동체 참여',
          volunteering: '봉사와 나눔',
        },
      },
    };

    // 4060세대 성격 특성 매핑
    this.personalityMappings = {
      // 성숙한 외향성 (젊은 층과 다른 특성)
      matureExtroversion: {
        characteristics: ['깊이 있는 대화 선호', '선택적 사교', '의미 있는 관계 추구'],
        indicators: [
          'social_quality_over_quantity',
          'meaningful_conversations',
          'selective_networking',
        ],
      },

      // 경험 기반 개방성
      experienceBasedOpenness: {
        characteristics: ['새로운 관점 수용', '문화적 탐구', '평생 학습'],
        indicators: ['cultural_interest', 'learning_orientation', 'perspective_flexibility'],
      },

      // 책임감 있는 성실성
      responsibleConscientiousness: {
        characteristics: ['약속 중시', '장기적 계획', '신뢰성'],
        indicators: ['reliability', 'long_term_planning', 'commitment_keeping'],
      },

      // 포용적 친화성
      inclusiveAgreeableness: {
        characteristics: ['이해심', '포용력', '갈등 조정'],
        indicators: ['empathy', 'conflict_resolution', 'inclusive_attitude'],
      },

      // 안정된 정서성
      emotionalStability: {
        characteristics: ['감정 조절', '스트레스 관리', '회복력'],
        indicators: ['emotional_regulation', 'stress_management', 'resilience'],
      },
    };
  }

  /**
   * 사용자 답변을 종합적으로 분석하여 가치관 프로필 생성
   */
  async analyzeUserValues(userId, answers) {
    try {
      console.log(`🎯 가치관 분석 시작 - 사용자: ${userId}`);

      // 1. 기본 점수 계산
      const basicScores = this.calculateBasicScores(answers);

      // 2. 4060세대 특성 반영 조정
      const adjustedScores = this.adjustForAgeGroup(basicScores, answers);

      // 3. 개인별 가치관 프로필 생성
      const valueProfile = this.generateValueProfile(adjustedScores, answers);

      // 4. 설명 가능한 분석 결과 생성
      const analysisResult = this.generateExplanation(valueProfile, answers);

      // 5. 매칭 호환성 요소 추출
      const compatibilityFactors = this.extractCompatibilityFactors(valueProfile);

      console.log(`✅ 가치관 분석 완료 - 사용자: ${userId}`);

      return {
        userId,
        valueProfile,
        analysisResult,
        compatibilityFactors,
        confidence: this.calculateConfidence(answers),
        timestamp: new Date(),
        version: '3.0', // Phase 3 버전
      };
    } catch (error) {
      console.error('가치관 분석 오류:', error);
      throw new Error(`가치관 분석 실패: ${error.message}`);
    }
  }

  /**
   * 기본 가치관 점수 계산
   */
  calculateBasicScores(answers) {
    const scores = {};

    // 각 가치관 차원별 점수 초기화
    Object.keys(this.coreValueDimensions).forEach(dimension => {
      scores[dimension] = {
        overall: 0,
        subCategories: {},
      };

      // 하위 카테고리 초기화
      Object.keys(this.coreValueDimensions[dimension].subCategories).forEach(subCat => {
        scores[dimension].subCategories[subCat] = 0;
      });
    });

    // 답변별 점수 계산
    answers.forEach((answer, questionId) => {
      const weights = answer.weights || {};

      // 각 가중치를 해당 차원에 반영
      Object.keys(weights).forEach(category => {
        const weight = weights[category];

        // 카테고리를 적절한 차원에 매핑
        const mappedDimension = this.mapCategoryToDimension(category);
        if (mappedDimension && scores[mappedDimension]) {
          scores[mappedDimension].overall += weight;

          // 하위 카테고리에도 반영
          const subCategory = this.mapCategoryToSubCategory(category, mappedDimension);
          if (subCategory && scores[mappedDimension].subCategories[subCategory] !== undefined) {
            scores[mappedDimension].subCategories[subCategory] += weight;
          }
        }
      });
    });

    // 점수 정규화 (0-100 스케일)
    this.normalizeScores(scores, answers.size);

    return scores;
  }

  /**
   * 4060세대 특성을 반영한 점수 조정
   */
  adjustForAgeGroup(basicScores, answers) {
    const adjustedScores = JSON.parse(JSON.stringify(basicScores));

    // 연령대별 가중치 조정
    const ageAdjustments = {
      // 관계의 질을 양보다 중시
      relationshipValues: 1.15,

      // 안정성의 중요도 증가
      stabilityGrowth: 1.1,

      // 건강에 대한 관심 증가
      healthWellness: 1.12,

      // 사회적 기여 의식 증가
      socialContribution: 1.2,

      // 인생 경험 기반 지혜 반영
      lifePerspective: 1.18,
    };

    // 조정 적용
    Object.keys(ageAdjustments).forEach(dimension => {
      if (adjustedScores[dimension]) {
        adjustedScores[dimension].overall *= ageAdjustments[dimension];

        // 하위 카테고리도 조정
        Object.keys(adjustedScores[dimension].subCategories).forEach(subCat => {
          adjustedScores[dimension].subCategories[subCat] *= ageAdjustments[dimension];
        });
      }
    });

    // 재정규화
    this.normalizeScores(adjustedScores, answers.size);

    return adjustedScores;
  }

  /**
   * 개인별 가치관 프로필 생성
   */
  generateValueProfile(scores, answers) {
    // 상위 3개 가치관 차원 식별
    const topDimensions = Object.keys(scores)
      .map(dimension => ({
        dimension,
        score: scores[dimension].overall,
        name: this.coreValueDimensions[dimension].name,
        description: this.coreValueDimensions[dimension].description,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // 각 차원별 상위 하위 카테고리 식별
    const dimensionDetails = {};
    Object.keys(scores).forEach(dimension => {
      const subCategories = Object.keys(scores[dimension].subCategories)
        .map(subCat => ({
          category: subCat,
          score: scores[dimension].subCategories[subCat],
          name: this.coreValueDimensions[dimension].subCategories[subCat],
        }))
        .sort((a, b) => b.score - a.score);

      dimensionDetails[dimension] = {
        overall: scores[dimension].overall,
        topSubCategories: subCategories.slice(0, 2),
        allSubCategories: subCategories,
      };
    });

    // 성격 특성 프로필
    const personalityProfile = this.generatePersonalityProfile(answers);

    return {
      primaryValues: topDimensions,
      dimensionDetails,
      personalityProfile,
      overallScores: scores,
      profileSummary: this.generateProfileSummary(topDimensions, personalityProfile),
    };
  }

  /**
   * 성격 특성 프로필 생성
   */
  generatePersonalityProfile(answers) {
    const personality = {
      dominantTraits: [],
      communicationStyle: 'diplomatic', // 기본값
      decisionMaking: 'experienced', // 경험 기반
      socialPreference: 'selective', // 선택적 사교
      conflictResolution: 'collaborative', // 협력적
      stressManagement: 'balanced', // 균형적
    };

    // 답변 기반 성격 특성 분석
    answers.forEach((answer, questionId) => {
      // 질문 ID별 성격 특성 매핑
      switch (parseInt(questionId)) {
        case 3: // 의사결정 방식
          if (answer.value === 'logic') personality.decisionMaking = 'analytical';
          else if (answer.value === 'emotion') personality.decisionMaking = 'intuitive';
          else if (answer.value === 'experience') personality.decisionMaking = 'experienced';
          break;

        case 5: // 갈등 대처
          personality.conflictResolution =
            answer.value === 'direct'
              ? 'direct'
              : answer.value === 'avoid'
                ? 'avoidant'
                : answer.value === 'mediate'
                  ? 'collaborative'
                  : 'diplomatic';
          break;

        case 9: // 사회적 성향 (새로운 사람들과의 만남)
          // 이 부분은 전체 답변을 확인한 후 결정
          break;
      }
    });

    return personality;
  }

  /**
   * 설명 가능한 분석 결과 생성
   */
  generateExplanation(valueProfile, answers) {
    const explanations = {
      coreMessage: this.generateCoreMessage(valueProfile),
      detailedAnalysis: this.generateDetailedAnalysis(valueProfile),
      strengthsAndChallenges: this.generateStrengthsAndChallenges(valueProfile),
      relationshipInsights: this.generateRelationshipInsights(valueProfile),
      personalGrowthAreas: this.generatePersonalGrowthAreas(valueProfile),
    };

    return {
      ...explanations,
      confidenceLevel: this.calculateAnalysisConfidence(valueProfile),
      keyFindings: this.extractKeyFindings(valueProfile),
      actionableInsights: this.generateActionableInsights(valueProfile),
    };
  }

  /**
   * 핵심 메시지 생성
   */
  generateCoreMessage(valueProfile) {
    const primaryValue = valueProfile.primaryValues[0];
    const personalityType = this.determinePersonalityType(valueProfile);

    const messages = {
      lifePerspective: '삶의 깊이와 의미를 추구하는 지혜로운 분입니다.',
      relationshipValues: '진정한 인간관계와 소통을 중시하는 따뜻한 분입니다.',
      stabilityGrowth: '안정과 성장의 균형을 추구하는 신중한 분입니다.',
      healthWellness: '건강하고 균형잡힌 삶을 추구하는 현명한 분입니다.',
      socialContribution: '사회에 기여하고 의미있는 가치를 남기고자 하는 분입니다.',
    };

    return `${messages[primaryValue.dimension]} ${personalityType.description}을 통해 더욱 풍성한 인생을 만들어가고 계십니다.`;
  }

  /**
   * 상세 분석 생성
   */
  generateDetailedAnalysis(valueProfile) {
    const analysis = [];

    valueProfile.primaryValues.forEach((value, index) => {
      const detail = valueProfile.dimensionDetails[value.dimension];
      const rank =
        index === 0 ? '가장 중요하게' : index === 1 ? '두 번째로 중요하게' : '세 번째로 중요하게';

      const topSubCategory = detail.topSubCategories[0];

      analysis.push({
        rank: index + 1,
        dimension: value.name,
        score: Math.round(value.score),
        description: `${rank} 여기시는 ${value.description} 영역에서, 특히 "${topSubCategory.name}"에 높은 가치를 두고 계십니다.`,
        subCategories: detail.topSubCategories.map(sub => ({
          name: sub.name,
          score: Math.round(sub.score),
          strength: sub.score > 70 ? 'high' : sub.score > 50 ? 'medium' : 'low',
        })),
      });
    });

    return analysis;
  }

  /**
   * 강점과 도전 영역 분석
   */
  generateStrengthsAndChallenges(valueProfile) {
    const strengths = [];
    const challenges = [];
    const growthAreas = [];

    // 강점 식별 (점수 70 이상)
    valueProfile.primaryValues.forEach(value => {
      if (value.score >= 70) {
        const dimension = valueProfile.dimensionDetails[value.dimension];
        dimension.topSubCategories.forEach(sub => {
          if (sub.score >= 70) {
            strengths.push({
              area: sub.name,
              description: `${sub.name} 영역에서 뛰어난 가치관을 보여주십니다.`,
              score: Math.round(sub.score),
            });
          }
        });
      }
    });

    // 도전 영역 식별 (점수 40 미만)
    Object.keys(valueProfile.dimensionDetails).forEach(dimension => {
      const detail = valueProfile.dimensionDetails[dimension];
      if (detail.overall < 40) {
        challenges.push({
          area: this.coreValueDimensions[dimension].name,
          description: `${this.coreValueDimensions[dimension].name} 영역에서 더 많은 관심을 기울일 수 있습니다.`,
          score: Math.round(detail.overall),
          suggestion: this.getSuggestionForDimension(dimension),
        });
      }
    });

    // 성장 영역 식별 (균형점 찾기)
    const balanceNeeded = this.identifyBalanceNeeds(valueProfile);
    growthAreas.push(...balanceNeeded);

    return { strengths, challenges, growthAreas };
  }

  /**
   * 관계 인사이트 생성
   */
  generateRelationshipInsights(valueProfile) {
    const insights = [];

    // 의사소통 스타일 분석
    const commStyle = valueProfile.personalityProfile.communicationStyle;
    insights.push({
      type: 'communication',
      title: '소통 스타일',
      description: this.getCommunicationStyleDescription(commStyle),
      tips: this.getCommunicationTips(commStyle),
    });

    // 갈등 해결 방식
    const conflictStyle = valueProfile.personalityProfile.conflictResolution;
    insights.push({
      type: 'conflict',
      title: '갈등 해결',
      description: this.getConflictResolutionDescription(conflictStyle),
      tips: this.getConflictResolutionTips(conflictStyle),
    });

    // 관계에서 중시하는 가치
    const relationshipValue = valueProfile.dimensionDetails.relationshipValues;
    if (relationshipValue) {
      insights.push({
        type: 'values',
        title: '관계에서 중시하는 가치',
        description: `${relationshipValue.topSubCategories[0].name}을 가장 중요하게 생각하시며, 이는 깊이 있는 관계 형성의 기반이 됩니다.`,
        score: Math.round(relationshipValue.overall),
      });
    }

    return insights;
  }

  /**
   * 매칭 호환성 요소 추출
   */
  extractCompatibilityFactors(valueProfile) {
    const factors = [];

    // 1. 핵심 가치관 호환성 (40% 가중치)
    factors.push({
      factor: 'core_values',
      weight: 0.4,
      description: '핵심 가치관 일치도',
      details: valueProfile.primaryValues.map(v => ({
        dimension: v.dimension,
        importance: v.score,
        compatibilityType: 'similarity', // 유사성 기반
      })),
    });

    // 2. 성격 보완성 (25% 가중치)
    factors.push({
      factor: 'personality_complement',
      weight: 0.25,
      description: '성격 특성 보완',
      details: this.getPersonalityComplementFactors(valueProfile.personalityProfile),
    });

    // 3. 라이프스타일 호환성 (20% 가중치)
    factors.push({
      factor: 'lifestyle_compatibility',
      weight: 0.2,
      description: '생활방식 조화',
      details: this.getLifestyleCompatibilityFactors(valueProfile),
    });

    // 4. 의사소통 스타일 (15% 가중치)
    factors.push({
      factor: 'communication_style',
      weight: 0.15,
      description: '소통 방식 조화',
      details: {
        style: valueProfile.personalityProfile.communicationStyle,
        flexibility: this.getCommunicationFlexibility(valueProfile),
        preferredMethods: this.getPreferredCommunicationMethods(valueProfile),
      },
    });

    return factors;
  }

  /**
   * 분석 신뢰도 계산
   */
  calculateConfidence(answers) {
    let confidence = 0;

    // 답변 완성도 (40%)
    const completionRate = answers.size / 15; // 15개 질문 기준
    confidence += completionRate * 40;

    // 답변 일관성 (35%)
    const consistency = this.calculateAnswerConsistency(answers);
    confidence += consistency * 35;

    // 답변 다양성 (25%)
    const diversity = this.calculateAnswerDiversity(answers);
    confidence += diversity * 25;

    return Math.min(Math.round(confidence), 100);
  }

  /**
   * 답변 일관성 계산
   */
  calculateAnswerConsistency(answers) {
    // 관련 질문들 간의 일관성 체크
    const consistencyChecks = [
      // 가족/관계 관련 질문들
      { questions: [1, 4], category: 'family_relationships' },
      // 안정/모험 관련 질문들
      { questions: [1, 6, 7], category: 'stability_adventure' },
      // 사회적 성향 관련 질문들
      { questions: [2, 4, 9], category: 'social_preferences' },
    ];

    let totalConsistency = 0;
    let checkCount = 0;

    consistencyChecks.forEach(check => {
      const relevantAnswers = check.questions
        .map(qId => answers.get(qId.toString()))
        .filter(answer => answer);

      if (relevantAnswers.length >= 2) {
        const consistency = this.calculateCategoryConsistency(relevantAnswers, check.category);
        totalConsistency += consistency;
        checkCount++;
      }
    });

    return checkCount > 0 ? totalConsistency / checkCount : 0.7; // 기본값 70%
  }

  /**
   * 카테고리별 일관성 계산
   */
  calculateCategoryConsistency(answers, category) {
    // 간단한 일관성 로직 - 실제로는 더 정교한 알고리즘 필요
    const weights = answers.map(answer => answer.weights || {});
    const categoryValues = weights.map(w => {
      // 카테고리와 관련된 모든 가중치 값을 합산
      return Object.keys(w)
        .filter(key => this.isCategoryRelated(key, category))
        .reduce((sum, key) => sum + (w[key] || 0), 0);
    });

    if (categoryValues.length < 2) return 0.7;

    // 분산을 기반으로 일관성 계산
    const mean = categoryValues.reduce((sum, val) => sum + val, 0) / categoryValues.length;
    const variance =
      categoryValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / categoryValues.length;

    // 분산이 낮을수록 일관성이 높음 (0-1 스케일로 정규화)
    return Math.max(0, Math.min(1, 1 - variance / 25)); // 25는 임계값
  }

  /**
   * 답변 다양성 계산
   */
  calculateAnswerDiversity(answers) {
    const answerValues = Array.from(answers.values()).map(answer => answer.value);
    const uniqueAnswers = new Set(answerValues);

    // 다양성 점수 = 고유 답변 비율
    return uniqueAnswers.size / answerValues.length;
  }

  // 유틸리티 메서드들...

  /**
   * 카테고리를 주요 차원에 매핑
   */
  mapCategoryToDimension(category) {
    const mappings = {
      // 인생관 관련
      life_values: 'lifePerspective',
      spirituality: 'lifePerspective',
      growth: 'lifePerspective',
      purpose: 'lifePerspective',

      // 관계관 관련
      family: 'relationshipValues',
      relationships: 'relationshipValues',
      agreeableness: 'relationshipValues',
      empathy: 'relationshipValues',

      // 안정-성장 균형
      security: 'stabilityGrowth',
      stability: 'stabilityGrowth',
      adventure: 'stabilityGrowth',
      openness: 'stabilityGrowth',

      // 건강관
      health: 'healthWellness',
      active: 'healthWellness',
      balance: 'healthWellness',

      // 사회기여관
      career: 'socialContribution',
      volunteering: 'socialContribution',
      community: 'socialContribution',
    };

    return mappings[category];
  }

  /**
   * 카테고리를 하위 카테고리에 매핑
   */
  mapCategoryToSubCategory(category, dimension) {
    const mappings = {
      lifePerspective: {
        growth: 'purpose',
        spirituality: 'wisdom',
        life_values: 'authenticity',
      },
      relationshipValues: {
        family: 'family',
        relationships: 'communication',
        agreeableness: 'support',
        empathy: 'support',
      },
      stabilityGrowth: {
        security: 'security',
        stability: 'security',
        adventure: 'adventure',
        growth: 'growth',
      },
      healthWellness: {
        health: 'physical',
        active: 'physical',
        balance: 'balance',
      },
      socialContribution: {
        career: 'legacy',
        volunteering: 'volunteering',
        community: 'community',
      },
    };

    return mappings[dimension]?.[category];
  }

  /**
   * 점수 정규화
   */
  normalizeScores(scores, totalAnswers) {
    const maxPossibleScore = totalAnswers * 5; // 최대 가중치가 5라고 가정

    Object.keys(scores).forEach(dimension => {
      // 전체 점수 정규화
      scores[dimension].overall = Math.min(
        100,
        (scores[dimension].overall / maxPossibleScore) * 100
      );

      // 하위 카테고리 점수 정규화
      Object.keys(scores[dimension].subCategories).forEach(subCat => {
        scores[dimension].subCategories[subCat] = Math.min(
          100,
          (scores[dimension].subCategories[subCat] / maxPossibleScore) * 100
        );
      });
    });
  }

  /**
   * 프로필 요약 생성
   */
  generateProfileSummary(topDimensions, personalityProfile) {
    const primary = topDimensions[0];

    const summaryTemplates = {
      lifePerspective: '지혜롭고 성숙한 인생관을 바탕으로 의미있는 삶을 추구하는',
      relationshipValues: '진정한 관계와 소통을 중시하며 따뜻한 마음을 가진',
      stabilityGrowth: '안정과 도전의 균형을 추구하며 신중하면서도 열린 마음을 가진',
      healthWellness: '건강하고 균형잡힌 삶을 중시하며 자기관리를 잘하는',
      socialContribution: '사회에 기여하고 의미있는 가치를 남기고자 하는',
    };

    const personalityTypes = {
      diplomatic: '배려깊고 조화로운',
      analytical: '논리적이고 신중한',
      supportive: '따뜻하고 지지적인',
      direct: '솔직하고 명확한',
    };

    const baseTemplate = summaryTemplates[primary.dimension] || '균형잡힌 가치관을 가진';
    const personalityType = personalityTypes[personalityProfile.communicationStyle] || '성숙한';

    return `${baseTemplate} ${personalityType} 분입니다.`;
  }

  // 추가 유틸리티 메서드들...

  getCommunicationStyleDescription(style) {
    const descriptions = {
      diplomatic: '상대방을 배려하며 조화를 추구하는 소통을 선호합니다.',
      direct: '솔직하고 명확한 의사표현을 중시합니다.',
      supportive: '상대방을 지지하고 격려하는 소통을 합니다.',
      analytical: '논리적이고 체계적인 대화를 선호합니다.',
    };
    return descriptions[style] || '균형잡힌 소통 스타일을 가지고 있습니다.';
  }

  getCommunicationTips(style) {
    const tips = {
      diplomatic: [
        '상대방의 의견을 충분히 들어보세요',
        '갈등을 피하기보다 건설적으로 해결해보세요',
      ],
      direct: ['때로는 부드러운 표현도 시도해보세요', '상대방의 감정도 고려해주세요'],
      supportive: ['자신의 의견도 당당히 표현하세요', '경계설정의 중요성을 기억하세요'],
      analytical: ['감정적 측면도 고려해보세요', '때로는 직감도 신뢰해보세요'],
    };
    return tips[style] || ['열린 마음으로 소통하세요', '상대방을 이해하려 노력하세요'];
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
      direct_collaborative: { type: 'leadership', description: '리더십 있고 협력적인 성향' },
      experienced_diplomatic: { type: 'wise', description: '지혜롭고 외교적인 접근' },
    };

    const key = `${communication}_${conflict}`;
    return typeDescriptions[key] || { type: 'mature', description: '성숙하고 균형잡힌 접근법' };
  }

  /**
   * 성격 보완 요소들
   */
  getPersonalityComplementFactors(personalityProfile) {
    return [
      {
        trait: 'communication_style',
        style: personalityProfile.communicationStyle,
        flexibility: this.getCommunicationFlexibility(personalityProfile),
        description: '소통 방식의 유연성과 적응력',
      },
      {
        trait: 'decision_making',
        style: personalityProfile.decisionMaking,
        adaptability: this.getDecisionMakingAdaptability(personalityProfile),
        description: '의사결정 과정의 다양성과 보완성',
      },
      {
        trait: 'conflict_resolution',
        style: personalityProfile.conflictResolution,
        effectiveness: this.getConflictResolutionEffectiveness(personalityProfile),
        description: '갈등 해결 능력과 접근 방식',
      },
    ];
  }

  /**
   * 라이프스타일 호환성 요소들
   */
  getLifestyleCompatibilityFactors(valueProfile) {
    const healthValue = valueProfile.dimensionDetails.healthWellness?.overall || 50;
    const socialValue = valueProfile.dimensionDetails.relationshipValues?.overall || 50;

    return {
      activityLevel: this.categorizeActivityLevel(healthValue),
      socialPreference: this.categorizeSocialPreference(socialValue),
      routineFlexibility: this.calculateRoutineFlexibility(valueProfile),
      leisureStyle: this.identifyLeisureStyle(valueProfile),
    };
  }

  /**
   * 활동 수준 분류
   */
  categorizeActivityLevel(healthValue) {
    if (healthValue > 80) return 'high';
    if (healthValue > 60) return 'moderate';
    if (healthValue > 40) return 'light';
    return 'low';
  }

  /**
   * 사회적 선호도 분류
   */
  categorizeSocialPreference(socialValue) {
    if (socialValue > 80) return 'highly_social';
    if (socialValue > 60) return 'moderately_social';
    if (socialValue > 40) return 'selectively_social';
    return 'private';
  }

  /**
   * 루틴 유연성 계산
   */
  calculateRoutineFlexibility(valueProfile) {
    const stabilityScore = valueProfile.dimensionDetails.stabilityGrowth?.overall || 50;
    const growthScore = valueProfile.dimensionDetails.stabilityGrowth?.subCategories?.growth || 50;

    // 안정성과 성장 욕구의 균형을 기반으로 유연성 계산
    const flexibilityScore = growthScore * 0.7 + (100 - stabilityScore) * 0.3;

    if (flexibilityScore > 70) return 'highly_flexible';
    if (flexibilityScore > 50) return 'moderately_flexible';
    return 'routine_oriented';
  }

  /**
   * 여가 스타일 식별
   */
  identifyLeisureStyle(valueProfile) {
    const creativity = valueProfile.dimensionDetails.lifePerspective?.subCategories?.wisdom || 50;
    const social = valueProfile.dimensionDetails.relationshipValues?.overall || 50;

    if (creativity > 70 && social > 70) return 'creative_social';
    if (creativity > 70) return 'creative_individual';
    if (social > 70) return 'social_oriented';
    return 'relaxed_personal';
  }

  /**
   * 소통 유연성 평가
   */
  getCommunicationFlexibility(personalityProfile) {
    const style = personalityProfile.communicationStyle;
    const flexibility = {
      diplomatic: 85, // 매우 유연
      supportive: 80, // 높은 유연성
      analytical: 60, // 중간 유연성
      direct: 50, // 낮은 유연성 (명확성 선호)
    };

    return flexibility[style] || 70;
  }

  /**
   * 의사결정 적응성 평가
   */
  getDecisionMakingAdaptability(personalityProfile) {
    const style = personalityProfile.decisionMaking;
    const adaptability = {
      experienced: 90, // 경험 기반으로 매우 적응적
      intuitive: 75, // 직관적으로 유연함
      analytical: 60, // 분석적이지만 적응 가능
      impulsive: 40, // 충동적 (4060세대에서는 드물음)
    };

    return adaptability[style] || 70;
  }

  /**
   * 갈등 해결 효과성 평가
   */
  getConflictResolutionEffectiveness(personalityProfile) {
    const style = personalityProfile.conflictResolution;
    const effectiveness = {
      collaborative: 90, // 가장 효과적
      diplomatic: 85, // 매우 효과적
      direct: 70, // 효과적이지만 상황 의존적
      avoidant: 50, // 제한적 효과성
    };

    return effectiveness[style] || 70;
  }

  /**
   * 선호하는 소통 방법들
   */
  getPreferredCommunicationMethods(valueProfile) {
    const style = valueProfile.personalityProfile.communicationStyle;
    const ageFactors = ['face_to_face', 'phone_call', 'thoughtful_message'];

    const methodsByStyle = {
      diplomatic: ['face_to_face', 'thoughtful_message', 'group_discussion'],
      supportive: ['face_to_face', 'phone_call', 'encouraging_message'],
      analytical: ['email', 'structured_discussion', 'document_sharing'],
      direct: ['phone_call', 'face_to_face', 'clear_message'],
    };

    return methodsByStyle[style] || ageFactors;
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
   * 카테고리 일관성 계산 (간단한 버전)
   */
  calculateCategoryConsistency(answers, category) {
    // 답변 가중치들의 일관성을 체크
    const weights = answers.map(answer => answer.weights || {});

    // 관련 카테고리의 가중치들만 추출
    const relevantWeights = weights.map(w => {
      const categoryKeys = Object.keys(w).filter(key => this.isCategoryRelated(key, category));
      return categoryKeys.reduce((sum, key) => sum + (w[key] || 0), 0);
    });

    if (relevantWeights.length < 2) return 0.7; // 기본값

    // 분산 기반 일관성 계산
    const mean = relevantWeights.reduce((sum, val) => sum + val, 0) / relevantWeights.length;
    const variance =
      relevantWeights.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      relevantWeights.length;

    // 분산이 낮을수록 일관성이 높음
    return Math.max(0, Math.min(1, 1 - variance / 25));
  }

  /**
   * 카테고리 관련성 확인
   */
  isCategoryRelated(key, category) {
    const categoryMappings = {
      family_relationships: ['family', 'relationships', 'agreeableness', 'empathy'],
      stability_adventure: ['security', 'stability', 'adventure', 'openness', 'growth'],
      social_preferences: ['extroversion', 'agreeableness', 'relationships', 'social'],
    };

    return categoryMappings[category]?.includes(key) || false;
  }

  /**
   * 핵심 메시지 생성
   */
  generateCoreMessage(valueProfile) {
    const primaryValue = valueProfile.primaryValues[0];
    const personalityType = this.determinePersonalityType(valueProfile);

    const messages = {
      lifePerspective: '삶의 깊이와 의미를 추구하는 지혜로운 분입니다.',
      relationshipValues: '진정한 인간관계와 소통을 중시하는 따뜻한 분입니다.',
      stabilityGrowth: '안정과 성장의 균형을 추구하는 신중한 분입니다.',
      healthWellness: '건강하고 균형잡힌 삶을 추구하는 현명한 분입니다.',
      socialContribution: '사회에 기여하고 의미있는 가치를 남기고자 하는 분입니다.',
    };

    const baseMessage = messages[primaryValue.dimension] || '균형잡힌 가치관을 가진 분입니다.';
    return `${baseMessage} ${personalityType.description}을 통해 더욱 풍성한 인생을 만들어가고 계십니다.`;
  }

  /**
   * 상세 분석 생성
   */
  generateDetailedAnalysis(valueProfile) {
    const analysis = [];

    valueProfile.primaryValues.forEach((value, index) => {
      const detail = valueProfile.dimensionDetails[value.dimension];
      const rank =
        index === 0 ? '가장 중요하게' : index === 1 ? '두 번째로 중요하게' : '세 번째로 중요하게';

      const topSubCategory = detail.topSubCategories[0];

      analysis.push({
        rank: index + 1,
        dimension: value.name,
        score: Math.round(value.score),
        description: `${rank} 여기시는 ${value.description} 영역에서, 특히 "${topSubCategory.name}"에 높은 가치를 두고 계십니다.`,
        subCategories: detail.topSubCategories.map(sub => ({
          name: sub.name,
          score: Math.round(sub.score),
          strength: sub.score > 70 ? 'high' : sub.score > 50 ? 'medium' : 'low',
        })),
      });
    });

    return analysis;
  }

  /**
   * 관계 인사이트 생성
   */
  generateRelationshipInsights(valueProfile) {
    const insights = [];

    // 의사소통 스타일 분석
    const commStyle = valueProfile.personalityProfile.communicationStyle;
    insights.push({
      type: 'communication',
      title: '소통 스타일',
      description: this.getCommunicationStyleDescription(commStyle),
      tips: this.getCommunicationTips(commStyle),
    });

    // 갈등 해결 방식
    const conflictStyle = valueProfile.personalityProfile.conflictResolution;
    insights.push({
      type: 'conflict',
      title: '갈등 해결',
      description: this.getConflictResolutionDescription(conflictStyle),
      tips: this.getConflictResolutionTips(conflictStyle),
    });

    // 관계에서 중시하는 가치
    const relationshipValue = valueProfile.dimensionDetails.relationshipValues;
    if (relationshipValue) {
      insights.push({
        type: 'values',
        title: '관계에서 중시하는 가치',
        description: `${relationshipValue.topSubCategories[0].name}을 가장 중요하게 생각하시며, 이는 깊이 있는 관계 형성의 기반이 됩니다.`,
        score: Math.round(relationshipValue.overall),
      });
    }

    return insights;
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
          suggestion: `${this.coreValueDimensions[area.dimension]?.name || area.dimension} 영역에 더 관심을 기울여 균형을 맞춰보세요`,
          priority: maxScore - area.score > 50 ? 'high' : 'medium',
        });
      });
    }

    return balanceAreas;
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
   * 핵심 발견사항 추출
   */
  extractKeyFindings(valueProfile) {
    const findings = [];

    // 가장 강한 가치관
    const topValue = valueProfile.primaryValues[0];
    findings.push(`가장 중시하는 가치: ${topValue.name} (${Math.round(topValue.score)}점)`);

    // 성격적 강점 (간단한 버전)
    const personality = valueProfile.personalityProfile;
    findings.push(`소통 스타일: ${personality.communicationStyle}`);
    findings.push(`갈등 해결: ${personality.conflictResolution}`);

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
    const allDimensions = Object.keys(valueProfile.dimensionDetails);
    allDimensions.forEach(dimension => {
      const detail = valueProfile.dimensionDetails[dimension];
      if (detail.overall < 60) {
        insights.push({
          category: 'growth_opportunity',
          insight: `${this.coreValueDimensions[dimension]?.name} 영역에서 성장 기회가 있습니다`,
          action: this.getSuggestionForDimension(dimension),
        });
      }
    });

    return insights.slice(0, 3);
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

  // 기타 필요한 메서드들 계속 구현
}

module.exports = new ValuesAnalysisEngine();
