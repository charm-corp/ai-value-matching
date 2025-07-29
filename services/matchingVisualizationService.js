/**
 * 매칭 결과 시각화 서비스
 *
 * 핵심 기능:
 * 1. 호환성 점수 시각화
 * 2. 공통점/보완점 차트 생성
 * 3. 중장년층 친화적 UI 데이터 제공
 * 4. 상세 분석 리포트 생성
 */
class MatchingVisualizationService {
  constructor() {
    // 시각화 테마 설정 (4060세대 친화적)
    this.visualTheme = {
      colors: {
        primary: '#667eea', // 차분한 보라
        secondary: '#764ba2', // 고급스러운 퍼플
        success: '#10b981', // 따뜻한 초록
        warning: '#f59e0b', // 부드러운 주황
        danger: '#ef4444', // 차분한 빨강
        neutral: '#6b7280', // 중성 회색
        background: '#f8fafc', // 밝은 배경
        text: {
          primary: '#1f2937', // 진한 텍스트
          secondary: '#6b7280', // 보조 텍스트
          light: '#9ca3af', // 연한 텍스트
        },
      },
      sizes: {
        fontSize: {
          large: '18px', // 큰 텍스트 (가독성)
          medium: '16px', // 기본 텍스트
          small: '14px', // 작은 텍스트
          tiny: '12px', // 보조 정보
        },
        spacing: {
          large: '24px',
          medium: '16px',
          small: '12px',
          tiny: '8px',
        },
      },
    };

    // 호환성 레벨 정의
    this.compatibilityLevels = {
      excellent: { min: 85, label: '최상의 궁합', color: '#10b981', icon: '💖' },
      veryGood: { min: 75, label: '매우 좋은 궁합', color: '#22c55e', icon: '💚' },
      good: { min: 65, label: '좋은 궁합', color: '#84cc16', icon: '💛' },
      moderate: { min: 55, label: '괜찮은 궁합', color: '#f59e0b', icon: '🧡' },
      challenging: { min: 0, label: '도전적인 관계', color: '#ef4444', icon: '💙' },
    };
  }

  /**
   * 종합 매칭 시각화 데이터 생성
   */
  generateComprehensiveVisualization(matchingResult) {
    try {
      console.log('🎨 매칭 시각화 데이터 생성 시작');

      const visualization = {
        // 1. 전체 호환성 요약
        overallCompatibility: this.createOverallCompatibilityViz(matchingResult),

        // 2. 세부 영역별 분석
        detailedBreakdown: this.createDetailedBreakdownViz(matchingResult),

        // 3. 가치관 비교 차트
        valuesComparison: this.createValuesComparisonViz(matchingResult),

        // 4. 성격 궁합 분석
        personalityMatch: this.createPersonalityMatchViz(matchingResult),

        // 5. 매칭 이유 시각화
        matchingReasons: this.createMatchingReasonsViz(matchingResult),

        // 6. 관계 발전 로드맵
        relationshipRoadmap: this.createRelationshipRoadmapViz(matchingResult),

        // 7. 대화 가이드 시각화
        conversationGuide: this.createConversationGuideViz(matchingResult),

        // 8. 주의사항 및 팁
        attentionPoints: this.createAttentionPointsViz(matchingResult),
      };

      console.log('✅ 매칭 시각화 데이터 생성 완료');
      return visualization;
    } catch (error) {
      console.error('매칭 시각화 생성 오류:', error);
      throw new Error(`시각화 생성 실패: ${error.message}`);
    }
  }

  /**
   * 전체 호환성 요약 시각화
   */
  createOverallCompatibilityViz(matchingResult) {
    const score = matchingResult.overallScore;
    const level = this.getCompatibilityLevel(score);

    return {
      type: 'overall_compatibility',
      score: score,
      level: level,
      display: {
        // 원형 진행률 표시기
        circularProgress: {
          percentage: score,
          strokeColor: level.color,
          strokeWidth: 8,
          size: 120,
          animation: {
            duration: 2000,
            easing: 'ease-out',
          },
        },

        // 점수 텍스트
        scoreText: {
          value: score,
          suffix: '점',
          fontSize: this.visualTheme.sizes.fontSize.large,
          fontWeight: 'bold',
          color: level.color,
        },

        // 레벨 라벨
        levelLabel: {
          text: level.label,
          icon: level.icon,
          fontSize: this.visualTheme.sizes.fontSize.medium,
          color: this.visualTheme.colors.text.primary,
        },

        // 설명 텍스트
        description: {
          text: this.generateOverallDescription(score, level),
          fontSize: this.visualTheme.sizes.fontSize.small,
          color: this.visualTheme.colors.text.secondary,
          textAlign: 'center',
          maxWidth: '300px',
        },
      },
    };
  }

  /**
   * 세부 영역별 분석 시각화
   */
  createDetailedBreakdownViz(matchingResult) {
    const breakdown = matchingResult.compatibility.breakdown;

    const categories = [
      { key: 'coreValues', name: '핵심 가치관', icon: '💎', weight: 0.35 },
      { key: 'personalityFit', name: '성격 궁합', icon: '🤝', weight: 0.25 },
      { key: 'lifestyleCompat', name: '생활 방식', icon: '🏡', weight: 0.2 },
      { key: 'communicationSync', name: '소통 스타일', icon: '💬', weight: 0.12 },
      { key: 'growthPotential', name: '성장 가능성', icon: '🌱', weight: 0.08 },
    ];

    const visualData = categories.map(category => {
      const score = Math.round(breakdown[category.key] || 0);
      const color = this.getScoreColor(score);

      return {
        category: category.key,
        name: category.name,
        icon: category.icon,
        score: score,
        weight: category.weight,
        weightedScore: Math.round(score * category.weight),
        display: {
          // 수평 바 차트
          horizontalBar: {
            percentage: score,
            height: 20,
            backgroundColor: this.visualTheme.colors.background,
            fillColor: color,
            borderRadius: 10,
            animation: {
              duration: 1500,
              delay: categories.indexOf(category) * 200,
            },
          },

          // 점수 라벨
          scoreLabel: {
            text: `${score}점`,
            position: 'right',
            fontSize: this.visualTheme.sizes.fontSize.small,
            fontWeight: 'bold',
            color: color,
          },

          // 중요도 표시
          importanceIndicator: {
            text: `중요도 ${Math.round(category.weight * 100)}%`,
            fontSize: this.visualTheme.sizes.fontSize.tiny,
            color: this.visualTheme.colors.text.light,
          },
        },
      };
    });

    return {
      type: 'detailed_breakdown',
      categories: visualData,
      layout: 'vertical_bars',
      title: '영역별 호환성 분석',
      subtitle: '각 영역에서의 궁합도를 확인해보세요',
    };
  }

  /**
   * 가치관 비교 차트 시각화
   */
  createValuesComparisonViz(matchingResult) {
    // 가치관 데이터 추출 (실제 데이터가 있다고 가정)
    const valuesData = this.extractValuesData(matchingResult);

    const radarChartData = {
      type: 'radar_chart',
      title: '가치관 비교 분석',
      subtitle: '두 분의 가치관을 비교해보세요',

      data: {
        labels: valuesData.categories.map(cat => cat.name),
        datasets: [
          {
            label: '회원님',
            data: valuesData.categories.map(cat => cat.user1Score),
            borderColor: this.visualTheme.colors.primary,
            backgroundColor: `${this.visualTheme.colors.primary}20`,
            pointBackgroundColor: this.visualTheme.colors.primary,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: '상대방',
            data: valuesData.categories.map(cat => cat.user2Score),
            borderColor: this.visualTheme.colors.secondary,
            backgroundColor: `${this.visualTheme.colors.secondary}20`,
            pointBackgroundColor: this.visualTheme.colors.secondary,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      },

      options: {
        scales: {
          r: {
            min: 0,
            max: 100,
            beginAtZero: true,
            angleLines: {
              color: this.visualTheme.colors.neutral + '30',
            },
            grid: {
              color: this.visualTheme.colors.neutral + '20',
            },
            pointLabels: {
              font: {
                size: parseInt(this.visualTheme.sizes.fontSize.small),
              },
              color: this.visualTheme.colors.text.primary,
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: parseInt(this.visualTheme.sizes.fontSize.medium),
              },
            },
          },
        },
      },

      // 상세 분석
      analysis: valuesData.analysis,
    };

    return radarChartData;
  }

  /**
   * 성격 궁합 분석 시각화
   */
  createPersonalityMatchViz(matchingResult) {
    const personalityData = this.extractPersonalityData(matchingResult);

    return {
      type: 'personality_match',
      title: '성격 궁합 분석',
      subtitle: '성격적 특성의 조화를 확인해보세요',

      // 성격 특성별 비교
      traits: personalityData.traits.map(trait => ({
        name: trait.name,
        user1Score: trait.user1Score,
        user2Score: trait.user2Score,
        compatibility: trait.compatibility,
        type: trait.matchType, // 'similar', 'complement', 'balanced'
        description: trait.description,

        display: {
          // 나비형 차트 (양쪽으로 뻗는 바)
          butterflyChart: {
            leftValue: trait.user1Score,
            rightValue: trait.user2Score,
            leftColor: this.visualTheme.colors.primary,
            rightColor: this.visualTheme.colors.secondary,
            centerColor: this.getCompatibilityColor(trait.compatibility),
            height: 24,
          },
        },
      })),

      // 전체 성격 궁합 요약
      summary: {
        overallScore: personalityData.overallScore,
        dominantType: personalityData.dominantMatchType,
        description: personalityData.summaryDescription,
      },
    };
  }

  /**
   * 매칭 이유 시각화
   */
  createMatchingReasonsViz(matchingResult) {
    const reasons = matchingResult.matchingReasons || [];

    return {
      type: 'matching_reasons',
      title: '왜 잘 맞을까요?',
      subtitle: '두 분의 궁합 포인트를 확인해보세요',

      reasons: reasons.map((reason, index) => ({
        rank: reason.rank || index + 1,
        title: reason.title,
        description: reason.description,
        importance: reason.importance,
        evidence: reason.evidence,
        type: reason.type,

        display: {
          // 중요도 표시기
          importanceBar: {
            percentage: reason.importance,
            color: this.getImportanceColor(reason.importance),
            height: 6,
            borderRadius: 3,
          },

          // 타입별 아이콘
          typeIcon: this.getReasonTypeIcon(reason.type),

          // 순위 배지
          rankBadge: {
            number: reason.rank,
            backgroundColor: this.getRankColor(reason.rank),
            textColor: '#fff',
            size: 'small',
          },
        },
      })),

      layout: 'card_list',
      animation: {
        stagger: 300,
        duration: 800,
      },
    };
  }

  /**
   * 관계 발전 로드맵 시각화
   */
  createRelationshipRoadmapViz(matchingResult) {
    const roadmap = matchingResult.relationshipRoadmap || this.generateDefaultRoadmap();

    return {
      type: 'relationship_roadmap',
      title: '관계 발전 로드맵',
      subtitle: '단계별 관계 발전 가이드',

      phases: [
        {
          phase: 1,
          title: '첫 만남',
          duration: '1-2주',
          description: '서로를 알아가는 시간',
          activities: roadmap.phase1 || ['카페에서 대화', '공통 관심사 탐색'],
          color: this.visualTheme.colors.primary,
          icon: '🤝',
        },
        {
          phase: 2,
          title: '친밀감 형성',
          duration: '1-2개월',
          description: '신뢰 관계 구축',
          activities: roadmap.phase2 || ['정기적인 만남', '깊은 대화 나누기'],
          color: this.visualTheme.colors.secondary,
          icon: '💗',
        },
        {
          phase: 3,
          title: '관계 심화',
          duration: '3-6개월',
          description: '진정한 동반자 관계',
          activities: roadmap.phase3 || ['함께 여행', '미래 계획 논의'],
          color: this.visualTheme.colors.success,
          icon: '💖',
        },
      ],

      // 타임라인 시각화
      timeline: {
        orientation: 'horizontal',
        showProgress: true,
        currentPhase: 1,
        connectionLine: {
          color: this.visualTheme.colors.neutral,
          style: 'dashed',
        },
      },
    };
  }

  /**
   * 대화 가이드 시각화
   */
  createConversationGuideViz(matchingResult) {
    const guide = matchingResult.meetingGuide?.conversationStarters || [];

    return {
      type: 'conversation_guide',
      title: '대화 가이드',
      subtitle: '자연스러운 대화를 위한 주제들',

      topics: guide.map((starter, index) => ({
        category: starter.type,
        topic: starter.topic,
        question: starter.question,
        context: starter.context,

        display: {
          categoryIcon: this.getTopicIcon(starter.type),
          categoryColor: this.getTopicColor(starter.type),
          priority: this.getTopicPriority(starter.type),
        },
      })),

      // 카테고리별 그룹화
      groupedByCategory: true,

      // 사용 팁
      usageTips: [
        '자연스럽게 대화 주제로 활용해보세요',
        '상대방의 반응을 보며 깊이를 조절하세요',
        '무리하지 말고 편안한 분위기를 만들어가세요',
      ],
    };
  }

  /**
   * 주의사항 및 팁 시각화
   */
  createAttentionPointsViz(matchingResult) {
    const points = matchingResult.challengesAndSolutions?.challenges || [];
    const tips = matchingResult.meetingGuide?.relationshipTips || [];

    return {
      type: 'attention_points',
      title: '관계 발전을 위한 가이드',

      sections: [
        {
          type: 'attention_points',
          title: '주의할 점',
          icon: '⚠️',
          color: this.visualTheme.colors.warning,
          items: points.map(point => ({
            area: point.area,
            issue: point.issue,
            suggestion: point.suggestion,
            severity: this.assessSeverity(point.issue),
          })),
        },
        {
          type: 'relationship_tips',
          title: '관계 발전 팁',
          icon: '💡',
          color: this.visualTheme.colors.success,
          items: tips.map(tip => ({
            title: tip.title,
            tip: tip.tip,
            priority: tip.priority,
            category: tip.type,
          })),
        },
      ],

      layout: 'accordion',
      defaultExpanded: 'relationship_tips',
    };
  }

  // 유틸리티 메서드들...

  /**
   * 호환성 레벨 결정
   */
  getCompatibilityLevel(score) {
    for (const [level, config] of Object.entries(this.compatibilityLevels)) {
      if (score >= config.min) {
        return { ...config, level };
      }
    }
    return this.compatibilityLevels.challenging;
  }

  /**
   * 점수에 따른 색상 결정
   */
  getScoreColor(score) {
    if (score >= 80) return this.visualTheme.colors.success;
    if (score >= 65) return '#84cc16';
    if (score >= 50) return this.visualTheme.colors.warning;
    return this.visualTheme.colors.danger;
  }

  /**
   * 호환성에 따른 색상 결정
   */
  getCompatibilityColor(compatibility) {
    return this.getScoreColor(compatibility);
  }

  /**
   * 중요도에 따른 색상 결정
   */
  getImportanceColor(importance) {
    if (importance >= 90) return this.visualTheme.colors.success;
    if (importance >= 80) return '#22c55e';
    if (importance >= 70) return '#84cc16';
    if (importance >= 60) return this.visualTheme.colors.warning;
    return this.visualTheme.colors.neutral;
  }

  /**
   * 순위에 따른 색상 결정
   */
  getRankColor(rank) {
    const colors = [
      '#ffd700', // 1위 - 금색
      '#c0c0c0', // 2위 - 은색
      '#cd7f32', // 3위 - 동색
      this.visualTheme.colors.primary,
      this.visualTheme.colors.secondary,
    ];
    return colors[rank - 1] || this.visualTheme.colors.neutral;
  }

  /**
   * 이유 타입별 아이콘 결정
   */
  getReasonTypeIcon(type) {
    const icons = {
      value_alignment: '💎',
      personality_similarity: '🤝',
      personality_complement: '⚖️',
      lifestyle_harmony: '🏡',
      communication_sync: '💬',
      growth_potential: '🌱',
      special_synergy: '✨',
    };
    return icons[type] || '💫';
  }

  /**
   * 주제별 아이콘 결정
   */
  getTopicIcon(type) {
    const icons = {
      value_based: '💎',
      life_experience: '📚',
      current_interests: '🎨',
      future_oriented: '🚀',
      family_related: '👨‍👩‍👧‍👦',
      hobby_based: '🎯',
    };
    return icons[type] || '💬';
  }

  /**
   * 주제별 색상 결정
   */
  getTopicColor(type) {
    const colors = {
      value_based: this.visualTheme.colors.primary,
      life_experience: this.visualTheme.colors.secondary,
      current_interests: this.visualTheme.colors.success,
      future_oriented: this.visualTheme.colors.warning,
      family_related: '#ec4899',
      hobby_based: '#8b5cf6',
    };
    return colors[type] || this.visualTheme.colors.neutral;
  }

  /**
   * 전체 설명 생성
   */
  generateOverallDescription(score, level) {
    if (score >= 85) {
      return '매우 높은 호환성을 보이며, 서로에게 이상적인 파트너가 될 가능성이 큽니다.';
    } else if (score >= 75) {
      return '좋은 호환성을 보이며, 서로를 이해하고 배려할 수 있는 관계가 될 것 같습니다.';
    } else if (score >= 65) {
      return '괜찮은 호환성을 보이며, 노력한다면 좋은 관계를 만들어갈 수 있을 것 같습니다.';
    } else if (score >= 55) {
      return '적당한 호환성을 보이며, 서로의 차이를 이해하며 발전시켜 나가면 좋을 것 같습니다.';
    } else {
      return '다소 다른 성향을 보이지만, 서로의 다름을 존중한다면 새로운 배움의 기회가 될 수 있습니다.';
    }
  }

  /**
   * 기본 로드맵 생성
   */
  generateDefaultRoadmap() {
    return {
      phase1: ['편안한 카페에서 만남', '기본적인 관심사 대화', '서로의 일상 이야기'],
      phase2: ['정기적인 식사 모임', '공통 취미 활동', '가족과 친구 이야기'],
      phase3: ['짧은 여행이나 나들이', '미래에 대한 생각 공유', '진지한 관계 논의'],
    };
  }

  /**
   * 가치관 데이터 추출 (모의 데이터)
   */
  extractValuesData(matchingResult) {
    // 실제 구현에서는 matchingResult에서 데이터 추출
    return {
      categories: [
        { name: '가족관', user1Score: 85, user2Score: 78 },
        { name: '안정성', user1Score: 72, user2Score: 81 },
        { name: '성장', user1Score: 68, user2Score: 73 },
        { name: '관계', user1Score: 79, user2Score: 85 },
        { name: '건강', user1Score: 81, user2Score: 76 },
        { name: '영성', user1Score: 65, user2Score: 69 },
      ],
      analysis: {
        strongMatches: ['가족관', '관계'],
        complementaryAreas: ['안정성', '성장'],
        developmentAreas: ['영성'],
      },
    };
  }

  /**
   * 성격 데이터 추출 (모의 데이터)
   */
  extractPersonalityData(matchingResult) {
    return {
      traits: [
        {
          name: '친화성',
          user1Score: 78,
          user2Score: 82,
          compatibility: 88,
          matchType: 'similar',
          description: '둘 다 따뜻하고 배려심이 많습니다',
        },
        {
          name: '성실성',
          user1Score: 85,
          user2Score: 79,
          compatibility: 92,
          matchType: 'similar',
          description: '책임감 있고 신뢰할 수 있습니다',
        },
        {
          name: '외향성',
          user1Score: 65,
          user2Score: 72,
          compatibility: 85,
          matchType: 'balanced',
          description: '적당한 사교성으로 균형이 좋습니다',
        },
        {
          name: '개방성',
          user1Score: 71,
          user2Score: 68,
          compatibility: 89,
          matchType: 'similar',
          description: '새로운 경험에 열린 마음을 가졌습니다',
        },
      ],
      overallScore: 88,
      dominantMatchType: 'similar',
      summaryDescription: '성격적으로 매우 잘 맞는 조합입니다',
    };
  }

  /**
   * 심각도 평가
   */
  assessSeverity(issue) {
    // 키워드 기반 심각도 판단
    const highSeverityKeywords = ['갈등', '충돌', '문제', '어려움'];
    const mediumSeverityKeywords = ['차이', '다름', '조정'];

    const issueText = issue.toLowerCase();

    if (highSeverityKeywords.some(keyword => issueText.includes(keyword))) {
      return 'high';
    } else if (mediumSeverityKeywords.some(keyword => issueText.includes(keyword))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 주제 우선순위 결정
   */
  getTopicPriority(type) {
    const priorities = {
      value_based: 'high',
      life_experience: 'high',
      current_interests: 'medium',
      future_oriented: 'medium',
      family_related: 'low',
      hobby_based: 'low',
    };
    return priorities[type] || 'medium';
  }
}

module.exports = new MatchingVisualizationService();
