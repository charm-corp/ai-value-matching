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
      coreValues: 0.35,      // 핵심 가치관 (35%)
      personalityFit: 0.25,  // 성격 궁합 (25%)
      lifestyleCompat: 0.20, // 생활방식 호환성 (20%)
      communicationSync: 0.12, // 소통 방식 (12%)
      growthPotential: 0.08  // 상호 성장 가능성 (8%)
    };

    // 호환성 유형 정의
    this.compatibilityTypes = {
      // 가치관 기반 매칭
      valueAlignment: {
        name: '가치관 공명',
        description: '인생에서 추구하는 가치와 목표가 잘 맞아',
        weight: 0.4,
        threshold: 75
      },
      
      // 성격 보완형 매칭
      personalityComplement: {
        name: '성격 보완',
        description: '서로 다른 강점으로 균형을 이루며',
        weight: 0.3,
        threshold: 65
      },
      
      // 라이프스타일 조화
      lifestyleHarmony: {
        name: '생활 조화',
        description: '일상의 리듬과 패턴이 자연스럽게 어우러져',
        weight: 0.3,
        threshold: 60
      }
    };

    // 4060세대 특성 반영 요소
    this.ageGroupFactors = {
      stabilityPreference: 1.2,    // 안정성 선호 가중치
      deepConnectionValue: 1.3,   // 깊은 관계 선호
      experienceBasedDecision: 1.1, // 경험 기반 판단
      authenticityImportance: 1.25, // 진정성 중시
      meaningfulConversation: 1.2   // 의미있는 대화 선호
    };
  }

  /**
   * 두 사용자 간 종합 매칭 분석
   */
  async calculateComprehensiveMatch(user1Assessment, user2Assessment) {
    try {
      console.log(`🎯 매칭 분석 시작: ${user1Assessment.userId} ↔ ${user2Assessment.userId}`);

      // 1. 기본 호환성 점수 계산
      const basicCompatibility = this.calculateBasicCompatibility(user1Assessment, user2Assessment);
      
      // 2. 4060세대 특성 반영 조정
      const adjustedCompatibility = this.adjustForAgeGroup(basicCompatibility, user1Assessment, user2Assessment);
      
      // 3. 매칭 이유 상세 분석
      const matchingReasons = this.generateMatchingReasons(user1Assessment, user2Assessment, adjustedCompatibility);
      
      // 4. 잠재적 도전점과 해결책
      const challengesAndSolutions = this.analyzeChallengesAndSolutions(user1Assessment, user2Assessment);
      
      // 5. 만남 가이드 생성
      const meetingGuide = this.generateMeetingGuide(user1Assessment, user2Assessment, adjustedCompatibility);
      
      // 6. 관계 발전 로드맵
      const relationshipRoadmap = this.createRelationshipRoadmap(user1Assessment, user2Assessment);

      const finalScore = Math.round(adjustedCompatibility.overallScore);

      console.log(`✅ 매칭 분석 완료: ${finalScore}점`);

      return {
        overallScore: finalScore,
        compatibility: adjustedCompatibility,
        matchingReasons,
        challengesAndSolutions,
        meetingGuide,
        relationshipRoadmap,
        confidenceLevel: this.calculateMatchConfidence(user1Assessment, user2Assessment),
        timestamp: new Date(),
        version: '3.0'
      };

    } catch (error) {
      console.error('매칭 분석 오류:', error);
      throw new Error(`매칭 분석 실패: ${error.message}`);
    }
  }

  /**
   * 기본 호환성 점수 계산
   */
  calculateBasicCompatibility(assessment1, assessment2) {
    const compatibility = {
      overallScore: 0,
      breakdown: {},
      details: {}
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
      growth: this.getGrowthDetails(assessment1, assessment2)
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
      empathy: { type: 'similarity', weight: 1.3 }
    };

    let totalWeight = 0;

    Object.keys(traitWeights).forEach(trait => {
      if (personality1[trait] !== undefined && personality2[trait] !== undefined) {
        const score1 = personality1[trait];
        const score2 = personality2[trait];
        const config = traitWeights[trait];
        
        let traitCompatibility = 0;
        
        switch(config.type) {
          case 'similarity':
            // 유사성 기반 (차이가 적을수록 좋음)
            traitCompatibility = Math.max(0, 100 - Math.abs(score1 - score2));
            break;
            
          case 'complement':
            // 보완성 기반 (적당한 차이가 좋음)
            const difference = Math.abs(score1 - score2);
            traitCompatibility = difference > 15 && difference < 40 ? 
              100 - Math.abs(difference - 25) * 2 : 
              Math.max(0, 100 - difference);
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
    const valueReasons = this.analyzeValueAlignment(assessment1, assessment2, compatibility.details.coreValues);
    reasons.push(...valueReasons);

    // 2. 성격 궁합 포인트
    const personalityReasons = this.analyzePersonalityFit(assessment1, assessment2, compatibility.details.personality);
    reasons.push(...personalityReasons);

    // 3. 라이프스타일 조화 포인트
    const lifestyleReasons = this.analyzeLifestyleHarmony(assessment1, assessment2, compatibility.details.lifestyle);
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
        rank: index + 1
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
            evidence: `두 분 모두 ${this.getValueCategoryName(category)}을 매우 중시하십니다. (${Math.round(score1)}점, ${Math.round(score2)}점)`
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
      { trait1: 'optimism', trait2: 'realism', description: '낙관성과 현실감각의 균형' }
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
              evidence: `두 분 모두 ${this.getPersonalityTraitName(trait)} 특성이 뛰어나십니다.`
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
      relationshipTips: []
    };

    // 1. 추천 활동 (공통 관심사 기반)
    guide.recommendedActivities = this.generateRecommendedActivities(assessment1, assessment2);

    // 2. 대화 시작점 (가치관 공통점 기반)
    guide.conversationStarters = this.generateConversationStarters(assessment1, assessment2, compatibility);

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
          timeEstimate: activity.timeEstimate
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
        context: `두 분 모두 ${this.getValueCategoryName(match.category)}을 중시하시니까`
      });
    });

    // 2. 인생 경험 기반 (4060세대 특화)
    starters.push({
      type: 'life_experience',
      topic: 'life_lessons',
      question: '지금까지 살아오시면서 가장 소중하게 생각하게 된 가치는 무엇인가요?',
      context: '인생 경험이 풍부하신 만큼 깊이 있는 이야기를 나눌 수 있을 것 같아요'
    });

    // 3. 현재 관심사 기반
    const currentInterests = this.getCurrentLifePhaseInterests(assessment1, assessment2);
    starters.push(...currentInterests);

    // 4. 미래 계획 기반
    starters.push({
      type: 'future_oriented',
      topic: 'future_plans',
      question: '앞으로 어떤 새로운 경험을 해보고 싶으신가요?',
      context: '새로운 시작과 도전에 대한 생각을 나눠보시면 좋을 것 같아요'
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
          suggestion: diff.suggestion
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
        suggestion: communicationDiff.suggestion
      });
    }

    // 라이프스타일 차이
    const lifestyleDiff = this.analyzeLifestyleDifferences(assessment1, assessment2);
    if (lifestyleDiff.hasSignificantDifference) {
      points.push({
        type: 'lifestyle_difference',
        area: 'lifestyle',
        issue: lifestyleDiff.issue,
        suggestion: lifestyleDiff.suggestion
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
        priority: 'high'
      });
    }

    // 2. 소통 개선 팁
    tips.push({
      type: 'communication_improvement',
      title: '더 깊은 소통을 위해',
      tip: this.getCustomCommunicationTip(assessment1, assessment2),
      priority: 'high'
    });

    // 3. 성장 지향 팁
    tips.push({
      type: 'mutual_growth',
      title: '함께 성장하는 관계를 위해',
      tip: this.getMutualGrowthTip(assessment1, assessment2),
      priority: 'medium'
    });

    // 4. 4060세대 특화 팁
    tips.push({
      type: 'age_appropriate',
      title: '성숙한 관계 발전을 위해',
      tip: '서두르지 않고 천천히, 서로의 인생 경험과 지혜를 나누며 깊이 있는 관계를 만들어가세요.',
      priority: 'high'
    });

    return tips;
  }

  // 유틸리티 메서드들...

  /**
   * 가치관 카테고리 중요도 가중치
   */
  getCategoryImportanceWeight(category) {
    const weights = {
      family: 1.3,        // 가족 관계 중시
      security: 1.2,      // 안정성 중시
      health: 1.25,       // 건강 중시
      relationships: 1.3, // 인간관계 중시
      spirituality: 1.1,  // 영성/철학 관심
      career: 1.0,        // 커리어 (상대적으로 낮음)
      adventure: 0.9      // 모험 (상대적으로 낮음)
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
      career: '성취와 발전'
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
      emotionalStability: '감정 조절력'
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
    const interestCompatibility = (commonInterests.length / Math.max(interests1.size, interests2.size, 1)) * 100;
    
    // 활동 수준 비교 (건강 가치관 기반)
    const health1 = assessment1.valueCategories?.health || 50;
    const health2 = assessment2.valueCategories?.health || 50;
    const healthCompatibility = Math.max(0, 100 - Math.abs(health1 - health2));
    
    // 사회적 활동 성향
    const social1 = assessment1.personalityScores?.extroversion || 50;
    const social2 = assessment2.personalityScores?.extroversion || 50;
    const socialCompatibility = Math.max(0, 100 - Math.abs(social1 - social2) * 0.5);
    
    // 가중 평균
    compatibility = (interestCompatibility * 0.4 + healthCompatibility * 0.3 + socialCompatibility * 0.3);
    
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
    
    return (agreeablenessCompat * 0.35 + empathyCompat * 0.35 + relationshipCompat * 0.3);
  }

  /**
   * 성장 가능성 계산
   */
  calculateGrowthPotential(assessment1, assessment2) {
    // 개방성 비교 (적당한 차이가 좋음)
    const openness1 = assessment1.personalityScores?.openness || 50;
    const openness2 = assessment2.personalityScores?.openness || 50;
    const opennessDiff = Math.abs(openness1 - openness2);
    const opennessCompat = opennessDiff > 10 && opennessDiff < 30 ? 85 : Math.max(0, 100 - opennessDiff);
    
    // 성장 가치관
    const growth1 = assessment1.valueCategories?.growth || 50;
    const growth2 = assessment2.valueCategories?.growth || 50;
    const growthAverage = (growth1 + growth2) / 2;
    
    // 학습 지향성 (경험과 지혜 추구)
    const learning1 = assessment1.personalityScores?.conscientiousness || 50;
    const learning2 = assessment2.personalityScores?.conscientiousness || 50;
    const learningCompat = (learning1 + learning2) / 2;
    
    return (opennessCompat * 0.4 + growthAverage * 0.35 + learningCompat * 0.25);
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
      potentialChallenges: []
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
          compatibility: 100 - difference
        });
      } else if (difference > 30) {
        details.potentialChallenges.push({
          category,
          score1,
          score2,
          difference
        });
      } else {
        details.complementaryAreas.push({
          category,
          score1,
          score2,
          balance: (score1 + score2) / 2
        });
      }
    });
    
    return details;
  }

  /**
   * 성격 세부 정보
   */
  getPersonalityDetails(assessment1, assessment2) {
    const traits = ['agreeableness', 'conscientiousness', 'extroversion', 'openness', 'emotionalStability'];
    
    return traits.map(trait => {
      const score1 = assessment1.personalityScores?.[trait] || 50;
      const score2 = assessment2.personalityScores?.[trait] || 50;
      const difference = Math.abs(score1 - score2);
      
      return {
        trait,
        score1,
        score2,
        compatibility: Math.max(0, 100 - difference),
        matchType: difference < 15 ? 'similar' : difference > 25 ? 'complement' : 'balanced'
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
      commonInterests: interests1.filter(i1 => 
        interests2.some(i2 => i2.category === i1.category)
      ),
      uniqueInterests1: interests1.filter(i1 => 
        !interests2.some(i2 => i2.category === i1.category)
      ),
      uniqueInterests2: interests2.filter(i2 => 
        !interests1.some(i1 => i1.category === i2.category)
      ),
      activityLevel: {
        user1: assessment1.valueCategories?.health || 50,
        user2: assessment2.valueCategories?.health || 50
      }
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
        compatibility: Math.max(0, 100 - Math.abs(
          (assessment1.personalityScores?.empathy || 50) - 
          (assessment2.personalityScores?.empathy || 50)
        ))
      },
      agreeablenessMatch: {
        user1: assessment1.personalityScores?.agreeableness || 50,
        user2: assessment2.personalityScores?.agreeableness || 50,
        compatibility: Math.max(0, 100 - Math.abs(
          (assessment1.personalityScores?.agreeableness || 50) - 
          (assessment2.personalityScores?.agreeableness || 50)
        ))
      }
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
        combined: ((assessment1.valueCategories?.growth || 50) + 
                  (assessment2.valueCategories?.growth || 50)) / 2
      },
      openness: {
        user1: assessment1.personalityScores?.openness || 50,
        user2: assessment2.personalityScores?.openness || 50,
        synergy: this.calculateOpennessSynergy(
          assessment1.personalityScores?.openness || 50,
          assessment2.personalityScores?.openness || 50
        )
      }
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
          description: `${this.getValueCategoryName(category)} 영역에서 ${difference}점 차이`
        });
        
        solutions.push({
          challenge: category,
          suggestion: this.getValueDifferenceSolution(category, score1, score2),
          priority: difference > 40 ? 'high' : 'medium'
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
        goals: ['서로의 기본 가치관 확인', '편안한 분위기 조성', '공통 관심사 발견']
      },
      phase2: {
        title: '신뢰 관계 구축',
        duration: '1-2개월',
        activities: this.getPhase2Activities(assessment1, assessment2),
        goals: ['깊은 대화 나누기', '서로의 생활 패턴 이해', '갈등 해결 방식 학습']
      },
      phase3: {
        title: '미래 지향적 관계',
        duration: '3-6개월',
        activities: this.getPhase3Activities(assessment1, assessment2),
        goals: ['장기적 비전 공유', '실질적 계획 수립', '지속 가능한 관계 모델 구축']
      }
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
      '가족이나 친구들과 만남'
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
      '공통 목표나 프로젝트 시작'
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
      career: '일과 삶에 대한 서로의 철학을 이해하고 지지해주세요'
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
        description: `${lifestyleDetails.commonInterests.map(i => i.category).join(', ')} 등 공통된 관심사로 즐거운 시간을 보낼 수 있습니다`,
        importance: 75 + (lifestyleDetails.commonInterests.length * 5)
      });
    }
    
    // 활동 수준 균형
    const activityBalance = Math.abs(lifestyleDetails.activityLevel.user1 - lifestyleDetails.activityLevel.user2);
    if (activityBalance < 20) {
      reasons.push({
        type: 'lifestyle_harmony',
        title: '활동 수준 조화',
        description: '비슷한 활동 수준으로 함께 하는 활동에서 잘 맞을 것 같습니다',
        importance: 80 - activityBalance
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
    const maturity1 = (assessment1.personalityScores?.emotionalStability || 50) + 
                     (assessment1.valueCategories?.family || 50) / 2;
    const maturity2 = (assessment2.personalityScores?.emotionalStability || 50) + 
                     (assessment2.valueCategories?.family || 50) / 2;
    
    if (maturity1 > 70 && maturity2 > 70) {
      synergyReasons.push({
        type: 'special_synergy',
        title: '성숙한 관계 지향',
        description: '두 분 모두 성숙하고 안정된 관계를 추구하여 깊이 있는 만남이 가능합니다',
        importance: 85
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
        description: `${complementaryStrengths.join(', ')} 영역에서 서로를 보완하며 성장할 수 있습니다`,
        importance: 80
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
      
      if (has1 !== has2) { // 한 명만 가진 강점
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
        timeEstimate: '2-3시간'
      },
      cooking: {
        name: '요리 클래스',
        description: '함께 요리를 배우며 즐거운 시간',
        location: '요리 스튜디오',
        timeEstimate: '2-4시간'
      },
      music: {
        name: '콘서트 관람',
        description: '좋아하는 음악 공연 함께 감상',
        location: '콘서트홀',
        timeEstimate: '2-3시간'
      },
      travel: {
        name: '당일치기 여행',
        description: '가까운 곳으로 함께 떠나는 여행',
        location: '근교 관광지',
        timeEstimate: '6-8시간'
      },
      art: {
        name: '미술관 관람',
        description: '예술 작품을 함께 감상하며 대화',
        location: '미술관이나 갤러리',
        timeEstimate: '2-3시간'
      }
    };
    
    return activities[interest];
  }

  /**
   * 가치관 기반 활동 생성
   */
  getValueBasedActivities(assessment1, assessment2) {
    const activities = [];
    
    // 건강 중시 → 건강한 활동
    const avgHealth = (assessment1.valueCategories?.health + assessment2.valueCategories?.health) / 2;
    if (avgHealth > 70) {
      activities.push({
        type: 'value_based',
        value: 'health',
        activity: '함께 운동하기',
        description: '건강을 중시하는 두 분께 적합한 활동',
        location: '공원이나 체육시설',
        timeEstimate: '1-2시간'
      });
    }
    
    // 가족 중시 → 가족적 분위기
    const avgFamily = (assessment1.valueCategories?.family + assessment2.valueCategories?.family) / 2;
    if (avgFamily > 75) {
      activities.push({
        type: 'value_based',
        value: 'family',
        activity: '전통 찻집 방문',
        description: '따뜻하고 가족적인 분위기에서 대화',
        location: '전통 찻집',
        timeEstimate: '2-3시간'
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
        ageRelevance: 'high'
      },
      {
        type: 'age_appropriate',
        activity: '조용한 레스토랑 식사',
        description: '편안한 분위기에서 깊은 대화',
        location: '분위기 좋은 레스토랑',
        timeEstimate: '2-3시간',
        ageRelevance: 'high'
      },
      {
        type: 'age_appropriate',
        activity: '박물관 관람',
        description: '역사와 문화를 함께 탐방',
        location: '박물관',
        timeEstimate: '2-3시간',
        ageRelevance: 'medium'
      },
      {
        type: 'age_appropriate',
        activity: '정원 산책',
        description: '자연 속에서 여유로운 시간',
        location: '식물원이나 공원',
        timeEstimate: '1-2시간',
        ageRelevance: 'high'
      }
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
      spirituality: '마음의 평화를 찾는 나만의 방법이 있나요?'
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
      context: '건강한 노후를 위한 준비에 대해'
    });
    
    interests.push({
      type: 'life_phase',
      topic: 'hobby_development',
      question: '새로 시작해보고 싶은 취미나 활동이 있으신가요?',
      context: '인생의 새로운 즐거움 찾기에 대해'
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
          suggestion: this.getPersonalitySuggestion(trait, score1, score2)
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
      extroversion: score1 > score2 ? 
        '한 분은 사교적이시고 다른 분은 조용한 시간을 선호하실 수 있습니다' :
        '활동량이나 사람 만나는 빈도에서 차이가 있을 수 있습니다',
      openness: '새로운 경험에 대한 태도나 변화 수용도에 차이가 있을 수 있습니다',
      conscientiousness: '계획성이나 규칙성에 대한 접근 방식이 다를 수 있습니다'
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
      conscientiousness: '계획과 즉흥성의 조화로운 균형점을 찾아보세요'
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
        suggestion: '서로의 감정 표현 방식을 이해하고 존중하는 시간을 가져보세요'
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
        suggestion: '서로의 생활 리듬을 존중하며 함께할 수 있는 활동을 찾아보세요'
      };
    }
    
    return { hasSignificantDifference: false };
  }

  /**
   * 맞춤형 소통 팁
   */
  getCustomCommunicationTip(assessment1, assessment2) {
    const empathyAvg = ((assessment1.personalityScores?.empathy || 50) + 
                       (assessment2.personalityScores?.empathy || 50)) / 2;
    
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
   * 가치관 공명 설명 생성
   */
  generateValueAlignmentDescription(category, score1, score2) {
    const categoryName = this.getValueCategoryName(category);
    const avgScore = Math.round((score1 + score2) / 2);
    
    const descriptions = {
      family: `가족과의 유대를 매우 중시하시는 공통점이 있어, 따뜻하고 안정적인 관계를 만들어갈 수 있을 것 같습니다`,
      security: `안정과 평화를 추구하는 가치관이 일치하여, 서로에게 든든한 지지대가 될 수 있습니다`,
      health: `건강한 삶을 중시하는 마음이 통해, 함께 건강한 생활을 만들어갈 수 있습니다`,
      relationships: `좋은 인간관계의 중요성을 공감하시어, 서로를 이해하고 배려하는 관계가 가능합니다`,
      spirituality: `영성과 철학적 사고를 중시하는 점이 비슷하여, 깊이 있는 대화를 나눌 수 있습니다`,
      growth: `지속적인 성장과 발전을 추구하는 마음이 일치하여, 함께 발전해나갈 수 있습니다`
    };
    
    return descriptions[category] || `${categoryName} 영역에서 높은 호환성을 보이며, 서로의 가치관을 이해하고 공감할 수 있습니다`;
  }

  /**
   * 성격 유사성 설명 생성
   */
  generatePersonalitySimilarityDescription(trait, score1, score2) {
    const traitName = this.getPersonalityTraitName(trait);
    const avgScore = Math.round((score1 + score2) / 2);
    
    const descriptions = {
      agreeableness: '두 분 모두 다른 사람을 배려하고 이해하려는 마음이 크시어, 조화로운 관계를 만들어갈 수 있습니다',
      conscientiousness: '책임감 있고 신뢰할 수 있는 성격으로, 서로에게 든든한 파트너가 될 수 있습니다',
      emotionalStability: '감정적으로 안정되어 있어, 어려운 상황에서도 서로를 지지하며 극복할 수 있습니다',
      optimism: '긍정적이고 밝은 성격으로, 함께 있으면 즐겁고 희망적인 시간을 보낼 수 있습니다',
      empathy: '상대방의 마음을 잘 이해하고 공감하는 능력이 뛰어나, 깊은 소통이 가능합니다'
    };
    
    return descriptions[trait] || `${traitName} 특성이 비슷하여 서로를 잘 이해할 수 있습니다`;
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
      supportive_collaborative: { type: 'supportive', description: '따뜻하고 지지적인 마음' }
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
      valueCategories: valueProfile.overallScores 
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
      action: this.getValueBasedAction(topValue.dimension)
    });
    
    // 성장 영역
    const growthAreas = valueProfile.dimensionDetails;
    Object.keys(growthAreas).forEach(dimension => {
      if (growthAreas[dimension].overall < 60) {
        insights.push({
          category: 'growth_opportunity',
          insight: `${this.coreValueDimensions[dimension]?.name} 영역에서 성장 기회가 있습니다`,
          action: this.getDimensionGrowthAction(dimension)
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
      socialContribution: '의미 있는 봉사나 사회 활동을 함께 계획해보세요'
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
      socialContribution: '관심 있는 분야에서 작은 봉사활동부터 시작해보세요'
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
      score: scores[key].overall
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
          priority: maxScore - area.score > 50 ? 'high' : 'medium'
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
      socialContribution: '사회나 공동체에 기여할 수 있는 방법을 찾아보세요'
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
      avoidant: '갈등을 피하는 경향이 있으며 시간을 두고 해결하려 합니다'
    };
    
    return descriptions[style] || '상황에 따라 유연하게 갈등을 해결합니다';
  }

  /**
   * 갈등 해결 팁
   */
  getConflictResolutionTips(style) {
    const tips = {
      direct: ['때로는 감정적 측면도 고려해보세요', '상대방의 입장을 충분히 들어보세요'],
      collaborative: ['때로는 빠른 결정도 필요할 수 있습니다', '완벽한 해결책을 추구하기보다 실용적 접근도 시도해보세요'],
      diplomatic: ['중요한 문제는 명확히 표현하는 것도 필요합니다', '갈등을 피하기보다 건설적으로 다루어보세요'],
      avoidant: ['작은 문제는 일찍 해결하는 것이 좋습니다', '대화를 통한 해결을 시도해보세요']
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
        name: this.coreValueDimensions[dim]?.name || dim
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
          benefits: this.getGrowthBenefits(dim.dimension)
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
      socialContribution: ['의미있는 삶', '사회적 연결감', '긍정적 영향력']
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
      social_preferences: ['extroversion', 'agreeableness', 'relationships']
    };
    
    return categoryMappings[category]?.includes(key) || false;
  }

  // 추가 유틸리티 메서드들...
}

module.exports = new IntelligentMatchingEngine();