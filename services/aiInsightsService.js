/**
 * AI Insights Service
 * 매칭 플랫폼 전용 AI 분석 및 인사이트 생성 서비스
 */

class AIInsightsService {
  constructor() {
    this.personalityCompatibilityMatrix = this.initializeCompatibilityMatrix();
    this.conversationAnalysisCache = new Map();
    this.matchingInsightsCache = new Map();
  }

  // 성격 호환성 매트릭스 초기화
  initializeCompatibilityMatrix() {
    return {
      'HARMONIOUS_SAGE': {
        'WARM_COMPANION': {
          compatibility: 85,
          strengths: ['공감 능력이 뛰어남', '안정적인 관계 추구', '깊은 대화 선호'],
          challenges: ['때로는 너무 신중할 수 있음', '변화에 대한 적응 필요'],
          tips: ['차분한 환경에서 깊은 대화를 나누세요', '서로의 가치관을 존중하며 소통하세요']
        },
        'ADVENTUROUS_SPIRIT': {
          compatibility: 70,
          strengths: ['서로 다른 관점 제공', '균형잡힌 관계', '새로운 경험 공유'],
          challenges: ['활동 선호도 차이', '결정 과정에서 의견 충돌 가능'],
          tips: ['중간 지점을 찾아 활동을 계획하세요', '서로의 특성을 보완재로 활용하세요']
        },
        'PRACTICAL_REALIST': {
          compatibility: 75,
          strengths: ['현실적 계획 수립', '안정적 관계', '신뢰성 높음'],
          challenges: ['감정 표현 방식 차이', '로맨틱함 vs 실용성'],
          tips: ['감정과 현실의 균형을 맞추세요', '구체적인 계획을 함께 세워보세요']
        },
        'HARMONIOUS_SAGE': {
          compatibility: 80,
          strengths: ['깊은 이해', '조화로운 관계', '평화로운 소통'],
          challenges: ['때로는 너무 비슷할 수 있음', '결정력 부족 가능'],
          tips: ['서로 다른 영역에서 주도권을 나누어 가지세요', '새로운 경험을 함께 시도해보세요']
        }
      },
      'WARM_COMPANION': {
        'HARMONIOUS_SAGE': {
          compatibility: 85,
          strengths: ['따뜻한 소통', '깊은 유대감', '서로에 대한 배려'],
          challenges: ['감정 의존도 높을 수 있음', '독립성 유지 필요'],
          tips: ['개인 시간도 존중하며 관계를 발전시키세요', '공통 관심사를 찾아 함께 즐기세요']
        },
        'WARM_COMPANION': {
          compatibility: 90,
          strengths: ['완벽한 감정 공감', '따뜻한 관계', '서로에 대한 깊은 이해'],
          challenges: ['때로는 객관성 부족', '감정적 의존 위험'],
          tips: ['건전한 경계선을 유지하세요', '각자의 개인적 성장도 추구하세요']
        },
        'ADVENTUROUS_SPIRIT': {
          compatibility: 75,
          strengths: ['활기찬 관계', '새로운 경험 공유', '서로 다른 에너지'],
          challenges: ['활동 선호도 차이', '페이스 조절 필요'],
          tips: ['서로의 에너지 레벨을 이해하고 존중하세요', '다양한 활동을 번갈아 시도해보세요']
        },
        'PRACTICAL_REALIST': {
          compatibility: 70,
          strengths: ['감정과 현실의 균형', '상호 보완적', '안정된 관계'],
          challenges: ['표현 방식 차이', '우선순위 다를 수 있음'],
          tips: ['감정 표현과 실용적 계획을 조화시키세요', '서로의 장점을 인정하고 활용하세요']
        }
      },
      'ADVENTUROUS_SPIRIT': {
        'HARMONIOUS_SAGE': {
          compatibility: 70,
          strengths: ['균형잡힌 관계', '서로 다른 관점', '성장 기회'],
          challenges: ['활동 선호도 차이', '에너지 레벨 차이'],
          tips: ['서로의 속도에 맞춰주세요', '새로운 것과 익숙한 것을 적절히 섞어보세요']
        },
        'WARM_COMPANION': {
          compatibility: 75,
          strengths: ['활동적이면서 따뜻한 관계', '새로운 경험과 깊은 유대'],
          challenges: ['관심사 차이 가능', '에너지 소비 패턴 다름'],
          tips: ['함께 할 수 있는 새로운 활동을 찾아보세요', '서로의 사회적 니즈를 이해하세요']
        },
        'ADVENTUROUS_SPIRIT': {
          compatibility: 80,
          strengths: ['역동적인 관계', '모험 공유', '높은 활동성'],
          challenges: ['과도한 활동으로 인한 피로', '안정성 부족 가능'],
          tips: ['휴식과 활동의 균형을 맞추세요', '안정적인 기반도 함께 구축하세요']
        },
        'PRACTICAL_REALIST': {
          compatibility: 85,
          strengths: ['계획적 모험', '현실적 접근', '상호 보완'],
          challenges: ['즉흥성 vs 계획성', '위험 감수 정도 차이'],
          tips: ['계획된 모험을 즐겨보세요', '서로의 접근 방식을 존중하세요']
        }
      },
      'PRACTICAL_REALIST': {
        'HARMONIOUS_SAGE': {
          compatibility: 75,
          strengths: ['안정적 관계', '현실적 계획', '장기적 비전'],
          challenges: ['로맨틱함 vs 실용성', '감정 표현 방식'],
          tips: ['실용적인 로맨스를 개발하세요', '구체적인 미래 계획을 함께 세우세요']
        },
        'WARM_COMPANION': {
          compatibility: 70,
          strengths: ['감정과 현실의 조화', '안정된 관계', '신뢰성'],
          challenges: ['표현 방식 차이', '우선순위 조정 필요'],
          tips: ['감정적 니즈와 현실적 계획을 함께 고려하세요', '정기적인 대화 시간을 가지세요']
        },
        'ADVENTUROUS_SPIRIT': {
          compatibility: 85,
          strengths: ['계획적 모험', '균형잡힌 생활', '상호 보완'],
          challenges: ['계획성 vs 즉흥성', '리스크 관리 관점 차이'],
          tips: ['계획 안에서의 즉흥성을 허용하세요', '서로의 강점을 활용한 역할 분담을 하세요']
        },
        'PRACTICAL_REALIST': {
          compatibility: 80,
          strengths: ['매우 안정적', '현실적 접근', '효율적 계획'],
          challenges: ['때로는 너무 비슷할 수 있음', '창의성 부족 위험'],
          tips: ['새로운 경험을 의식적으로 추가하세요', '서로 다른 관심 분야를 개발하세요']
        }
      }
    };
  }

  // 매치 AI 인사이트 생성
  async generateMatchInsights(match, user1, user2, user1Assessment, user2Assessment) {
    try {
      const cacheKey = `match_${match._id}`;
      
      // 캐시 확인
      if (this.matchingInsightsCache.has(cacheKey)) {
        const cached = this.matchingInsightsCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 3600000) { // 1시간 캐시
          return cached.insights;
        }
      }

      const insights = {
        compatibilityAnalysis: await this.analyzeCompatibility(user1, user2, user1Assessment, user2Assessment),
        conversationStarters: this.generateConversationStarters(user1, user2),
        relationshipAdvice: this.generateRelationshipAdvice(user1, user2, user1Assessment, user2Assessment),
        potentialChallenges: this.identifyPotentialChallenges(user1, user2),
        strengthAreas: this.identifyStrengthAreas(user1, user2),
        dateIdeas: await this.generateDateIdeas(user1, user2),
        communicationTips: this.generateCommunicationTips(user1Assessment, user2Assessment),
        longTermCompatibility: this.assessLongTermCompatibility(user1, user2, user1Assessment, user2Assessment)
      };

      // 캐시 저장
      this.matchingInsightsCache.set(cacheKey, {
        insights,
        timestamp: Date.now()
      });

      return insights;
    } catch (error) {
      console.error('Error generating match insights:', error);
      return this.getDefaultInsights();
    }
  }

  // 호환성 분석
  async analyzeCompatibility(user1, user2, assessment1, assessment2) {
    const personalityType1 = assessment1?.analysis?.personalityType;
    const personalityType2 = assessment2?.analysis?.personalityType;

    if (!personalityType1 || !personalityType2) {
      return {
        score: 70,
        summary: '가치관 평가를 통한 상세 분석이 필요합니다.',
        details: []
      };
    }

    const compatibility = this.personalityCompatibilityMatrix[personalityType1]?.[personalityType2];
    
    if (!compatibility) {
      return {
        score: 65,
        summary: '두 분의 성격 유형은 흥미로운 조합입니다.',
        details: ['서로에 대해 더 알아가는 시간이 필요합니다.']
      };
    }

    return {
      score: compatibility.compatibility,
      summary: this.generateCompatibilitySummary(compatibility.compatibility),
      strengths: compatibility.strengths,
      challenges: compatibility.challenges,
      tips: compatibility.tips
    };
  }

  // 호환성 요약 생성
  generateCompatibilitySummary(score) {
    if (score >= 85) {
      return '매우 높은 호환성을 보입니다. 자연스럽고 조화로운 관계를 기대할 수 있습니다.';
    } else if (score >= 75) {
      return '좋은 호환성을 보입니다. 서로를 이해하고 존중하는 관계가 될 것 같습니다.';
    } else if (score >= 65) {
      return '적절한 호환성을 보입니다. 서로의 차이점을 이해하면 좋은 관계로 발전할 수 있습니다.';
    } else {
      return '서로 다른 특성을 가지고 있습니다. 시간을 들여 서로를 이해해 나가시기 바랍니다.';
    }
  }

  // 대화 시작 주제 생성
  generateConversationStarters(user1, user2) {
    const starters = [];

    // 공통 관심사 기반
    const commonInterests = user1.interests?.filter(interest => 
      user2.interests?.includes(interest)
    ) || [];

    if (commonInterests.length > 0) {
      starters.push({
        category: '공통 관심사',
        topic: `${commonInterests[0]}에 대한 관심이 공통점이네요!`,
        question: `${commonInterests[0]} 중에서 최근에 가장 인상깊었던 경험이 있으시다면 무엇인가요?`
      });
    }

    // 연령대 기반
    const ageGroup = this.getAgeGroup(user1.age, user2.age);
    starters.push({
      category: '추억과 경험',
      topic: `${ageGroup}대의 특별한 추억`,
      question: `우리 연령대만의 특별한 추억이나 경험이 있다면 무엇일까요?`
    });

    // 라이프스타일 기반
    if (user1.lifestyle?.socialLevel && user2.lifestyle?.socialLevel) {
      const socialTopic = this.getSocialLevelTopic(user1.lifestyle.socialLevel, user2.lifestyle.socialLevel);
      starters.push({
        category: '라이프스타일',
        topic: socialTopic.topic,
        question: socialTopic.question
      });
    }

    // 직업 기반 (있는 경우)
    if (user1.occupation?.industry && user2.occupation?.industry) {
      starters.push({
        category: '직업과 경험',
        topic: '직업을 통한 경험',
        question: '일을 하시면서 가장 보람찼던 순간은 언제였나요?'
      });
    }

    // 기본 질문들
    starters.push(
      {
        category: '가치관',
        topic: '인생에서 중요한 것',
        question: '인생에서 가장 소중하게 생각하는 가치가 무엇인가요?'
      },
      {
        category: '취미와 관심',
        topic: '여가 시간 활용',
        question: '여유로운 주말을 어떻게 보내시는 편인가요?'
      },
      {
        category: '미래와 계획',
        topic: '향후 계획',
        question: '앞으로 도전해보고 싶은 것이 있다면 무엇인가요?'
      }
    );

    return starters.slice(0, 5); // 상위 5개만 반환
  }

  // 연령대 분석
  getAgeGroup(age1, age2) {
    const ageMap = {
      '40-45': 40,
      '46-50': 45,
      '51-55': 50,
      '56-60': 55,
      '60+': 60
    };

    const avgAge = (ageMap[age1] + ageMap[age2]) / 2;
    
    if (avgAge <= 45) return '40';
    if (avgAge <= 50) return '40후반';
    if (avgAge <= 55) return '50';
    if (avgAge <= 60) return '50후반';
    return '60';
  }

  // 사교성 레벨 기반 주제 생성
  getSocialLevelTopic(level1, level2) {
    if (level1 === 'extrovert' || level2 === 'extrovert') {
      return {
        topic: '사람들과의 만남',
        question: '새로운 사람들을 만날 때 어떤 기분이 드시나요?'
      };
    } else if (level1 === 'introvert' && level2 === 'introvert') {
      return {
        topic: '조용한 시간의 소중함',
        question: '혼자만의 시간을 어떻게 의미있게 보내시나요?'
      };
    } else {
      return {
        topic: '사람과의 관계',
        question: '가까운 사람들과 시간을 보낼 때 어떤 순간이 가장 좋으신가요?'
      };
    }
  }

  // 관계 조언 생성
  generateRelationshipAdvice(user1, user2, assessment1, assessment2) {
    const advice = [];

    // 성격 유형 기반 조언
    const personalityType1 = assessment1?.analysis?.personalityType;
    const personalityType2 = assessment2?.analysis?.personalityType;

    if (personalityType1 && personalityType2) {
      const compatibility = this.personalityCompatibilityMatrix[personalityType1]?.[personalityType2];
      if (compatibility?.tips) {
        advice.push(...compatibility.tips.map(tip => ({
          category: '성격 호환성',
          advice: tip,
          importance: 'high'
        })));
      }
    }

    // 나이 차이 기반 조언
    const ageDiff = this.calculateAgeDifference(user1.age, user2.age);
    if (ageDiff > 5) {
      advice.push({
        category: '연령대',
        advice: '서로 다른 세대의 경험을 공유하며 배워가세요. 나이 차이는 더 풍부한 관점을 제공할 수 있습니다.',
        importance: 'medium'
      });
    } else if (ageDiff < 3) {
      advice.push({
        category: '연령대',
        advice: '비슷한 연령대로서 공통된 경험과 추억을 많이 공유할 수 있을 것입니다.',
        importance: 'medium'
      });
    }

    // 라이프스타일 기반 조언
    if (user1.lifestyle && user2.lifestyle) {
      if (user1.lifestyle.socialLevel !== user2.lifestyle.socialLevel) {
        advice.push({
          category: '라이프스타일',
          advice: '서로 다른 사교성 레벨을 이해하고 존중하세요. 때로는 활동적으로, 때로는 조용히 시간을 보내는 것이 좋습니다.',
          importance: 'medium'
        });
      }

      if (user1.lifestyle.fitnessLevel && user2.lifestyle.fitnessLevel) {
        const fitnessAdvice = this.getFitnessCompatibilityAdvice(
          user1.lifestyle.fitnessLevel, 
          user2.lifestyle.fitnessLevel
        );
        if (fitnessAdvice) {
          advice.push({
            category: '건강과 활동',
            advice: fitnessAdvice,
            importance: 'low'
          });
        }
      }
    }

    // 기본 관계 조언
    advice.push(
      {
        category: '소통',
        advice: '서로의 의견을 존중하고 열린 마음으로 대화하세요. 좋은 관계는 솔직하고 따뜻한 소통에서 시작됩니다.',
        importance: 'high'
      },
      {
        category: '시간 투자',
        advice: '서로에게 집중할 수 있는 질 좋은 시간을 정기적으로 가져보세요. 깊은 관계는 충분한 시간과 관심에서 만들어집니다.',
        importance: 'high'
      }
    );

    return advice;
  }

  // 나이 차이 계산
  calculateAgeDifference(age1, age2) {
    const ageMap = {
      '40-45': 42.5,
      '46-50': 48,
      '51-55': 53,
      '56-60': 58,
      '60+': 65
    };

    return Math.abs(ageMap[age1] - ageMap[age2]);
  }

  // 피트니스 호환성 조언
  getFitnessCompatibilityAdvice(level1, level2) {
    const levels = ['low', 'moderate', 'active', 'very_active'];
    const diff = Math.abs(levels.indexOf(level1) - levels.indexOf(level2));

    if (diff === 0) {
      return '비슷한 활동 레벨을 가지고 계시네요. 함께 즐길 수 있는 운동이나 활동을 찾아보세요.';
    } else if (diff === 1) {
      return '활동 레벨이 적절히 다릅니다. 서로의 페이스에 맞춰 다양한 활동을 시도해보세요.';
    } else if (diff >= 2) {
      return '활동 레벨에 차이가 있습니다. 서로의 체력과 선호도를 존중하며 중간 지점을 찾아보세요.';
    }

    return null;
  }

  // 잠재적 도전과제 식별
  identifyPotentialChallenges(user1, user2) {
    const challenges = [];

    // 자녀 관련 고려사항
    if (user1.hasChildren !== user2.hasChildren) {
      challenges.push({
        area: '가족 구성',
        challenge: '자녀 유무의 차이',
        suggestion: '서로의 가족 상황을 이해하고 존중하는 것이 중요합니다. 충분한 대화를 통해 서로의 입장을 이해해보세요.',
        severity: 'medium'
      });
    }

    // 결혼 상태 고려사항
    if (user1.maritalStatus && user2.maritalStatus && user1.maritalStatus !== user2.maritalStatus) {
      challenges.push({
        area: '과거 경험',
        challenge: '결혼 경험의 차이',
        suggestion: '서로 다른 과거 경험을 통해 배운 점들을 나누어 보세요. 각자의 경험이 관계에 도움이 될 수 있습니다.',
        severity: 'low'
      });
    }

    // 거주 지역 고려사항
    if (user1.location?.city && user2.location?.city && user1.location.city !== user2.location.city) {
      challenges.push({
        area: '지리적 거리',
        challenge: '다른 도시 거주',
        suggestion: '거리를 극복할 수 있는 만남의 방법을 함께 계획해보세요. 정기적인 만남 일정을 정하는 것이 도움됩니다.',
        severity: 'medium'
      });
    }

    // 직업 관련 고려사항
    if (user1.occupation?.workSchedule && user2.occupation?.workSchedule) {
      if (user1.occupation.workSchedule !== user2.occupation.workSchedule) {
        challenges.push({
          area: '시간 관리',
          challenge: '다른 근무 형태',
          suggestion: '서로의 일정을 존중하며 만날 수 있는 시간대를 찾아보세요. 계획적인 만남이 더욱 의미있을 수 있습니다.',
          severity: 'low'
        });
      }
    }

    return challenges;
  }

  // 강점 영역 식별
  identifyStrengthAreas(user1, user2) {
    const strengths = [];

    // 공통 관심사
    const commonInterests = user1.interests?.filter(interest => 
      user2.interests?.includes(interest)
    ) || [];

    if (commonInterests.length > 0) {
      strengths.push({
        area: '공통 관심사',
        description: `${commonInterests.join(', ')} 등의 공통 관심사를 가지고 계십니다.`,
        potential: '함께 즐길 수 있는 활동이 많아 관계 발전에 도움이 될 것입니다.'
      });
    }

    // 비슷한 연령대
    const ageDiff = this.calculateAgeDifference(user1.age, user2.age);
    if (ageDiff <= 5) {
      strengths.push({
        area: '연령대 호환성',
        description: '비슷한 연령대로 인생 경험과 가치관을 공유할 수 있습니다.',
        potential: '세대적 공감대를 바탕으로 깊은 이해와 소통이 가능합니다.'
      });
    }

    // 같은 지역
    if (user1.location?.city === user2.location?.city) {
      strengths.push({
        area: '지리적 근접성',
        description: '같은 지역에 거주하여 만나기 편리합니다.',
        potential: '정기적인 만남과 다양한 데이트 활동이 용이합니다.'
      });
    }

    // 라이프스타일 호환성
    if (user1.lifestyle?.socialLevel === user2.lifestyle?.socialLevel) {
      strengths.push({
        area: '사교성 호환',
        description: '비슷한 사교성 레벨을 가지고 계십니다.',
        potential: '편안한 분위기에서 자연스러운 관계 발전이 가능합니다.'
      });
    }

    return strengths;
  }

  // 데이트 아이디어 생성
  async generateDateIdeas(user1, user2) {
    const ideas = [];

    // 공통 관심사 기반
    const commonInterests = user1.interests?.filter(interest => 
      user2.interests?.includes(interest)
    ) || [];

    for (const interest of commonInterests) {
      const dateIdea = this.getDateIdeaForInterest(interest);
      if (dateIdea) {
        ideas.push(dateIdea);
      }
    }

    // 연령대 적합한 데이트
    const ageAppropriateIdeas = this.getAgeAppropriateIdeas(user1.age, user2.age);
    ideas.push(...ageAppropriateIdeas);

    // 시즌별 데이트 아이디어
    const seasonalIdeas = this.getSeasonalDateIdeas();
    ideas.push(...seasonalIdeas);

    // 중복 제거 및 최대 8개 반환
    const uniqueIdeas = ideas.filter((item, index, arr) => 
      arr.findIndex(i => i.title === item.title) === index
    );

    return uniqueIdeas.slice(0, 8);
  }

  // 관심사별 데이트 아이디어
  getDateIdeaForInterest(interest) {
    const interestIdeas = {
      '영화감상': {
        title: '영화관 데이트',
        description: '좋아하는 장르의 영화를 함께 보고 감상을 나누어보세요.',
        location: '영화관',
        duration: '2-3시간',
        cost: '보통'
      },
      '독서': {
        title: '서점 & 카페 데이트',
        description: '서점에서 책을 둘러보고 카페에서 독서 이야기를 나누어보세요.',
        location: '대형 서점 + 카페',
        duration: '2-3시간',
        cost: '저렴'
      },
      '요리': {
        title: '쿠킹 클래스 참여',
        description: '함께 요리를 배우며 협력하는 즐거움을 느껴보세요.',
        location: '쿠킹 스튜디오',
        duration: '3-4시간',
        cost: '비싸다'
      },
      '여행': {
        title: '당일치기 여행',
        description: '가까운 관광지로 당일치기 여행을 떠나보세요.',
        location: '근교 관광지',
        duration: '하루 종일',
        cost: '보통'
      },
      '산책': {
        title: '공원 산책',
        description: '아름다운 공원에서 여유로운 산책을 즐겨보세요.',
        location: '공원',
        duration: '1-2시간',
        cost: '무료'
      },
      '음악감상': {
        title: '콘서트 관람',
        description: '좋아하는 장르의 공연을 함께 감상해보세요.',
        location: '공연장',
        duration: '2-3시간',
        cost: '비싸다'
      },
      '문화생활': {
        title: '박물관 & 미술관',
        description: '문화 시설을 방문하여 예술 작품을 감상해보세요.',
        location: '박물관/미술관',
        duration: '2-3시간',
        cost: '저렴'
      },
      '카페투어': {
        title: '테마 카페 투어',
        description: '특별한 테마의 카페들을 돌아다니며 대화를 나누어보세요.',
        location: '다양한 카페',
        duration: '3-4시간',
        cost: '보통'
      }
    };

    return interestIdeas[interest];
  }

  // 연령대 적합한 데이트 아이디어
  getAgeAppropriateIdeas(age1, age2) {
    return [
      {
        title: '전통 찻집에서 차 마시기',
        description: '조용하고 편안한 분위기에서 깊은 대화를 나누어보세요.',
        location: '전통 찻집',
        duration: '2시간',
        cost: '보통'
      },
      {
        title: '한강 공원 산책',
        description: '한강의 아름다운 풍경을 보며 여유로운 시간을 보내보세요.',
        location: '한강 공원',
        duration: '2-3시간',
        cost: '무료'
      },
      {
        title: '클래식 공연 관람',
        description: '품격 있는 클래식 공연을 함께 감상해보세요.',
        location: '콘서트홀',
        duration: '2시간',
        cost: '보통'
      },
      {
        title: '맛집 탐방',
        description: '유명한 맛집에서 맛있는 식사를 하며 대화를 나누어보세요.',
        location: '맛집',
        duration: '2시간',
        cost: '보통'
      }
    ];
  }

  // 계절별 데이트 아이디어
  getSeasonalDateIdeas() {
    const month = new Date().getMonth() + 1;
    
    if (month >= 3 && month <= 5) { // 봄
      return [
        {
          title: '벚꽃 구경',
          description: '아름다운 벚꽃을 보며 봄의 정취를 만끽해보세요.',
          location: '벚꽃 명소',
          duration: '2-3시간',
          cost: '무료'
        }
      ];
    } else if (month >= 6 && month <= 8) { // 여름
      return [
        {
          title: '시원한 카페에서 빙수',
          description: '더운 여름, 시원한 실내에서 달콤한 빙수를 함께 드세요.',
          location: '빙수 전문점',
          duration: '1-2시간',
          cost: '저렴'
        }
      ];
    } else if (month >= 9 && month <= 11) { // 가을
      return [
        {
          title: '단풍 구경',
          description: '아름다운 단풍을 보며 가을의 정취를 느껴보세요.',
          location: '단풍 명소',
          duration: '3-4시간',
          cost: '저렴'
        }
      ];
    } else { // 겨울
      return [
        {
          title: '따뜻한 실내 카페',
          description: '추운 겨울, 따뜻한 실내에서 차나 커피를 마시며 대화하세요.',
          location: '실내 카페',
          duration: '2시간',
          cost: '저렴'
        }
      ];
    }
  }

  // 소통 팁 생성
  generateCommunicationTips(assessment1, assessment2) {
    const tips = [];

    // 성격 유형 기반 소통 팁
    const type1 = assessment1?.analysis?.personalityType;
    const type2 = assessment2?.analysis?.personalityType;

    if (type1 && type2) {
      const compatibility = this.personalityCompatibilityMatrix[type1]?.[type2];
      if (compatibility?.tips) {
        tips.push(...compatibility.tips.map(tip => ({
          category: '성격 기반 소통',
          tip,
          priority: 'high'
        })));
      }
    }

    // 기본 소통 팁
    tips.push(
      {
        category: '적극적 경청',
        tip: '상대방의 말을 끝까지 들어주세요. 중간에 끊지 말고 충분히 표현할 수 있도록 해주세요.',
        priority: 'high'
      },
      {
        category: '감정 표현',
        tip: '자신의 감정을 솔직하게 표현하되, 상대방을 비난하지 않는 방식으로 이야기하세요.',
        priority: 'high'
      },
      {
        category: '공감하기',
        tip: '상대방의 입장에서 생각해보고 공감을 표현해주세요. "그런 기분이 드셨을 것 같아요"와 같은 표현을 사용해보세요.',
        priority: 'medium'
      },
      {
        category: '질문하기',
        tip: '상대방에게 관심을 보이는 질문을 해보세요. "어떻게 생각하세요?" "더 자세히 들어볼 수 있을까요?" 등',
        priority: 'medium'
      },
      {
        category: '긍정적 표현',
        tip: '긍정적인 면을 먼저 언급하고, 개선이 필요한 부분은 부드럽게 제안해보세요.',
        priority: 'low'
      }
    );

    return tips;
  }

  // 장기적 호환성 평가
  assessLongTermCompatibility(user1, user2, assessment1, assessment2) {
    const factors = [];

    // 가치관 호환성
    if (assessment1?.analysis && assessment2?.analysis) {
      const confidenceAvg = (assessment1.analysis.confidenceLevel + assessment2.analysis.confidenceLevel) / 2;
      factors.push({
        factor: '가치관 일치도',
        score: Math.round(confidenceAvg),
        weight: 0.3,
        description: '핵심 가치관의 일치 정도'
      });
    }

    // 라이프스타일 호환성
    let lifestyleScore = 70;
    if (user1.lifestyle && user2.lifestyle) {
      lifestyleScore = this.calculateLifestyleCompatibility(user1.lifestyle, user2.lifestyle);
    }
    factors.push({
      factor: '라이프스타일',
      score: lifestyleScore,
      weight: 0.2,
      description: '일상생활과 활동 패턴의 조화'
    });

    // 의사소통 잠재력
    factors.push({
      factor: '의사소통 잠재력',
      score: 75,
      weight: 0.25,
      description: '서로 이해하고 소통할 수 있는 능력'
    });

    // 가족 상황 호환성
    const familyScore = this.calculateFamilyCompatibility(user1, user2);
    factors.push({
      factor: '가족 상황',
      score: familyScore,
      weight: 0.15,
      description: '가족 구성과 관련된 상황의 조화'
    });

    // 지리적 적합성
    const locationScore = this.calculateLocationCompatibility(user1, user2);
    factors.push({
      factor: '지리적 조건',
      score: locationScore,
      weight: 0.1,
      description: '만남과 관계 유지의 지리적 편의성'
    });

    // 가중 평균 계산
    const totalScore = factors.reduce((sum, factor) => 
      sum + (factor.score * factor.weight), 0
    );

    return {
      overallScore: Math.round(totalScore),
      factors,
      outlook: this.generateLongTermOutlook(Math.round(totalScore)),
      recommendations: this.generateLongTermRecommendations(factors)
    };
  }

  // 라이프스타일 호환성 계산
  calculateLifestyleCompatibility(lifestyle1, lifestyle2) {
    let score = 70;
    let comparisons = 0;

    // 사교성 레벨 비교
    if (lifestyle1.socialLevel && lifestyle2.socialLevel) {
      const socialLevels = ['introvert', 'ambivert', 'extrovert'];
      const diff = Math.abs(
        socialLevels.indexOf(lifestyle1.socialLevel) - 
        socialLevels.indexOf(lifestyle2.socialLevel)
      );
      score += (2 - diff) * 10;
      comparisons++;
    }

    // 활동 레벨 비교
    if (lifestyle1.fitnessLevel && lifestyle2.fitnessLevel) {
      const fitnessLevels = ['low', 'moderate', 'active', 'very_active'];
      const diff = Math.abs(
        fitnessLevels.indexOf(lifestyle1.fitnessLevel) - 
        fitnessLevels.indexOf(lifestyle2.fitnessLevel)
      );
      score += (3 - diff) * 7;
      comparisons++;
    }

    return comparisons > 0 ? Math.min(score, 100) : 70;
  }

  // 가족 상황 호환성 계산
  calculateFamilyCompatibility(user1, user2) {
    let score = 80;

    // 자녀 유무
    if (user1.hasChildren === user2.hasChildren) {
      score += 10;
    } else {
      score -= 10;
    }

    // 결혼 상태
    if (user1.maritalStatus && user2.maritalStatus) {
      if (user1.maritalStatus === user2.maritalStatus) {
        score += 5;
      }
    }

    return Math.max(Math.min(score, 100), 50);
  }

  // 지리적 호환성 계산
  calculateLocationCompatibility(user1, user2) {
    if (!user1.location?.city || !user2.location?.city) {
      return 70;
    }

    if (user1.location.city === user2.location.city) {
      if (user1.location.district === user2.location.district) {
        return 100;
      }
      return 90;
    }

    return 60;
  }

  // 장기적 전망 생성
  generateLongTermOutlook(score) {
    if (score >= 85) {
      return {
        level: 'excellent',
        description: '매우 긍정적인 장기적 전망을 보입니다. 서로 잘 어울리며 안정적이고 행복한 관계로 발전할 가능성이 높습니다.',
        timeframe: '3-6개월 내에 안정적인 관계로 발전 가능'
      };
    } else if (score >= 75) {
      return {
        level: 'good',
        description: '좋은 장기적 전망을 보입니다. 서로 노력한다면 의미 있는 관계로 발전할 수 있을 것입니다.',
        timeframe: '6-12개월 내에 깊은 관계로 발전 가능'
      };
    } else if (score >= 65) {
      return {
        level: 'moderate',
        description: '적절한 장기적 가능성을 보입니다. 서로를 이해하고 조율해 나간다면 좋은 관계를 만들 수 있습니다.',
        timeframe: '1년 이상의 시간을 두고 관계 발전 필요'
      };
    } else {
      return {
        level: 'challenging',
        description: '도전적인 면이 있지만 불가능하지는 않습니다. 서로의 차이를 인정하고 많은 대화와 이해가 필요합니다.',
        timeframe: '충분한 시간과 노력이 필요'
      };
    }
  }

  // 장기적 권장사항 생성
  generateLongTermRecommendations(factors) {
    const recommendations = [];

    // 점수가 낮은 요소들에 대한 권장사항
    const weakFactors = factors.filter(f => f.score < 70);

    for (const factor of weakFactors) {
      switch (factor.factor) {
        case '가치관 일치도':
          recommendations.push({
            area: '가치관',
            recommendation: '서로의 핵심 가치관에 대해 더 깊이 대화해보세요. 차이점을 이해하고 공통점을 찾아나가는 것이 중요합니다.',
            priority: 'high'
          });
          break;
        case '라이프스타일':
          recommendations.push({
            area: '라이프스타일',
            recommendation: '서로의 생활 패턴을 존중하면서도 함께할 수 있는 활동을 찾아보세요. 타협점을 찾는 것이 중요합니다.',
            priority: 'medium'
          });
          break;
        case '가족 상황':
          recommendations.push({
            area: '가족',
            recommendation: '가족과 관련된 상황들에 대해 솔직하게 이야기하고 서로의 입장을 이해해보세요.',
            priority: 'high'
          });
          break;
        case '지리적 조건':
          recommendations.push({
            area: '거리',
            recommendation: '거리를 극복할 수 있는 만남의 방법을 계획하고, 정기적인 소통을 유지하세요.',
            priority: 'medium'
          });
          break;
      }
    }

    // 기본 권장사항
    recommendations.push({
      area: '관계 발전',
      recommendation: '서두르지 말고 충분한 시간을 들여 서로를 알아가세요. 좋은 관계는 시간과 함께 자연스럽게 발전합니다.',
      priority: 'medium'
    });

    return recommendations;
  }

  // 기본 인사이트 (에러 시 반환)
  getDefaultInsights() {
    return {
      compatibilityAnalysis: {
        score: 70,
        summary: '두 분의 매칭 분석을 위해 더 많은 정보가 필요합니다.',
        details: ['가치관 평가를 완료하시면 더 정확한 분석이 가능합니다.']
      },
      conversationStarters: [
        {
          category: '기본 질문',
          topic: '취미와 관심사',
          question: '평소 어떤 일을 하실 때 가장 즐거우신가요?'
        }
      ],
      relationshipAdvice: [
        {
          category: '소통',
          advice: '서로에 대해 충분히 알아가는 시간을 가지세요.',
          importance: 'high'
        }
      ],
      potentialChallenges: [],
      strengthAreas: [],
      dateIdeas: [
        {
          title: '카페에서 대화',
          description: '편안한 카페에서 서로에 대해 알아가는 시간을 가져보세요.',
          location: '카페',
          duration: '1-2시간',
          cost: '저렴'
        }
      ],
      communicationTips: [
        {
          category: '기본 소통',
          tip: '상대방의 말을 주의 깊게 들어주세요.',
          priority: 'high'
        }
      ],
      longTermCompatibility: {
        overallScore: 70,
        outlook: {
          level: 'moderate',
          description: '더 많은 상호작용을 통해 호환성을 파악할 수 있습니다.',
          timeframe: '시간을 두고 천천히 알아가세요'
        }
      }
    };
  }

  // 캐시 정리
  clearCache() {
    this.conversationAnalysisCache.clear();
    this.matchingInsightsCache.clear();
  }

  // 캐시 통계
  getCacheStats() {
    return {
      conversationCacheSize: this.conversationAnalysisCache.size,
      matchingCacheSize: this.matchingInsightsCache.size
    };
  }
}

// 싱글톤 인스턴스
let aiInsightsServiceInstance = null;

const getAIInsightsService = () => {
  if (!aiInsightsServiceInstance) {
    aiInsightsServiceInstance = new AIInsightsService();
  }
  return aiInsightsServiceInstance;
};

module.exports = {
  AIInsightsService,
  getAIInsightsService
};