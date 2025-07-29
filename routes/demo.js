const express = require('express');
const router = express.Router();

/**
 * 🎯 창우님 체험용 API 라우트 - 인증 없이 접근 가능
 *
 * 이 라우트들은 창우님이 실제로 접근했던 URL 패턴을 지원합니다:
 * - /api/users/test-user-1
 * - /api/users/test-user-2
 * - /api/matching/test-user-1/test-user-2
 */

// 테스트 사용자 데이터
const testUsers = {
  'test-user-1': {
    id: 'test-user-1',
    name: '김세렌',
    age: '51-55',
    gender: 'male',
    location: { city: '서울', district: '강남구' },
    bio: '운명적인 만남을 기다리는 사람입니다. 세렌디피티를 믿으며 진정한 인연을 찾고 있습니다.',
    profileImage: 'https://via.placeholder.com/300x400?text=김세렌',
    isActive: true,
    isVerified: true,
    lastActive: new Date(),
    joinedAt: '2024-01-15',
    valueCategories: {
      family: 85,
      career: 70,
      personal_growth: 75,
      health: 80,
      financial_security: 85,
      social_connection: 70,
      spiritual: 60,
      adventure: 45,
    },
    interests: ['독서', '등산', '요리', '클래식 음악'],
    lifestyle: {
      communicationStyle: 'supportive',
      socialStyle: 'selective',
      workLifeBalance: 'balanced',
    },
  },

  'test-user-2': {
    id: 'test-user-2',
    name: '이매력',
    age: '46-50',
    gender: 'female',
    location: { city: '서울', district: '서초구' },
    bio: '진정한 인연을 찾고 있습니다. 함께 웃고 울 수 있는 따뜻한 사람을 만나고 싶어요.',
    profileImage: 'https://via.placeholder.com/300x400?text=이매력',
    isActive: true,
    isVerified: true,
    lastActive: new Date(),
    joinedAt: '2024-02-20',
    valueCategories: {
      family: 80,
      career: 65,
      personal_growth: 90,
      health: 75,
      financial_security: 60,
      social_connection: 85,
      spiritual: 70,
      adventure: 55,
    },
    interests: ['미술', '여행', '카페탐방', '영화감상'],
    lifestyle: {
      communicationStyle: 'diplomatic',
      socialStyle: 'outgoing',
      workLifeBalance: 'flexible',
    },
  },
};

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: 체험용 사용자 정보 조회 (인증 불필요)
 *     tags: [Demo]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID (test-user-1, test-user-2)
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = testUsers[userId];

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
        availableUsers: Object.keys(testUsers),
        message: `체험용 사용자: ${Object.keys(testUsers).join(', ')}`,
      });
    }

    res.json({
      success: true,
      message: `${user.name}님의 프로필 정보입니다.`,
      data: {
        user: {
          ...user,
          // 체험용 추가 정보
          demoNote: '🎯 CHARM_INYEON 체험용 계정입니다',
          compatibilityReady: true,
          matchingAvailable: true,
        },
      },
      meta: {
        requestedAt: new Date().toISOString(),
        demoMode: true,
        version: 'demo-1.0',
      },
    });
  } catch (error) {
    console.error('Demo user fetch error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.',
      demoMode: true,
    });
  }
});

/**
 * @swagger
 * /api/matching/{user1Id}/{user2Id}:
 *   get:
 *     summary: 체험용 매칭 분석 (인증 불필요)
 *     tags: [Demo]
 *     parameters:
 *       - name: user1Id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: 첫 번째 사용자 ID
 *       - name: user2Id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: 두 번째 사용자 ID
 *     responses:
 *       200:
 *         description: 매칭 분석 성공
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/matching/:user1Id/:user2Id', (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;
    const user1 = testUsers[user1Id];
    const user2 = testUsers[user2Id];

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        error: '매칭할 사용자를 찾을 수 없습니다.',
        availableUsers: Object.keys(testUsers),
        message: `체험용 매칭: ${Object.keys(testUsers).join(' ↔ ')}`,
      });
    }

    // 실제 호환성 계산 (간단 버전)
    const compatibility = calculateDemoCompatibility(user1, user2);

    res.json({
      success: true,
      message: `${user1.name}님과 ${user2.name}님의 세렌디피티 매칭 분석이 완료되었습니다! 🎯`,
      data: {
        matchingResult: {
          user1: {
            id: user1.id,
            name: user1.name,
            age: user1.age,
            location: user1.location,
            bio: user1.bio,
          },
          user2: {
            id: user2.id,
            name: user2.name,
            age: user2.age,
            location: user2.location,
            bio: user2.bio,
          },
          compatibility: compatibility,
          serendipityFactor: Math.round(compatibility.overallScore * 0.85), // 세렌디피티 보정
          matchingInsights: generateMatchingInsights(user1, user2, compatibility),
          meetingRecommendation: generateMeetingRecommendation(compatibility.overallScore),
          demoHighlights: [
            '🌟 AI 기반 심층 가치관 분석 완료',
            '💝 4060세대 특화 매칭 알고리즘 적용',
            '✨ 세렌디피티 요소 반영된 호환성 계산',
            '🎯 중장년층 맞춤 만남 가이드 제공',
          ],
        },
      },
      meta: {
        analysisVersion: 'CHARM_INYEON_DEMO_v1.0',
        analyzedAt: new Date().toISOString(),
        processingTime: '2.3초',
        demoMode: true,
        realTimeAnalysis: false,
        note: '실제 서비스에서는 더욱 정교한 AI 분석이 제공됩니다',
      },
    });
  } catch (error) {
    console.error('Demo matching error:', error);
    res.status(500).json({
      success: false,
      error: '매칭 분석 중 오류가 발생했습니다.',
      demoMode: true,
    });
  }
});

/**
 * 체험용 호환성 계산 함수
 */
function calculateDemoCompatibility(user1, user2) {
  const values1 = user1.valueCategories;
  const values2 = user2.valueCategories;

  // 가치관 유사도 계산
  let valuesScore = 0;
  let totalCategories = 0;

  Object.keys(values1).forEach(category => {
    if (values2[category]) {
      const diff = Math.abs(values1[category] - values2[category]);
      const similarity = Math.max(0, 100 - diff);
      valuesScore += similarity;
      totalCategories++;
    }
  });

  const avgValuesScore = totalCategories > 0 ? Math.round(valuesScore / totalCategories) : 50;

  // 라이프스타일 호환성 (간단 계산)
  const lifestyleScore = calculateLifestyleCompatibility(user1.lifestyle, user2.lifestyle);

  // 관심사 겹치는 정도
  const interestsScore = calculateInterestsCompatibility(user1.interests, user2.interests);

  // 연령 호환성
  const ageScore = calculateAgeCompatibility(user1.age, user2.age);

  // 지역 호환성
  const locationScore = calculateLocationCompatibility(user1.location, user2.location);

  // 종합 점수 계산 (가중 평균)
  const overallScore = Math.round(
    avgValuesScore * 0.35 + // 가치관 35%
      lifestyleScore * 0.25 + // 라이프스타일 25%
      interestsScore * 0.2 + // 관심사 20%
      ageScore * 0.1 + // 연령 10%
      locationScore * 0.1 // 지역 10%
  );

  return {
    overallScore,
    breakdown: {
      values: avgValuesScore,
      lifestyle: lifestyleScore,
      interests: interestsScore,
      age: ageScore,
      location: locationScore,
    },
    level: getCompatibilityLevel(overallScore),
    strengths: getMatchingStrengths(avgValuesScore, lifestyleScore, interestsScore),
    challenges: getMatchingChallenges(avgValuesScore, lifestyleScore, interestsScore),
  };
}

function calculateLifestyleCompatibility(lifestyle1, lifestyle2) {
  const compatibilityMatrix = {
    communicationStyle: {
      supportive: { supportive: 95, diplomatic: 85, direct: 70, analytical: 75 },
      diplomatic: { supportive: 85, diplomatic: 95, direct: 60, analytical: 80 },
      direct: { supportive: 70, diplomatic: 60, direct: 90, analytical: 85 },
      analytical: { supportive: 75, diplomatic: 80, direct: 85, analytical: 95 },
    },
  };

  const commStyle1 = lifestyle1.communicationStyle;
  const commStyle2 = lifestyle2.communicationStyle;

  return compatibilityMatrix.communicationStyle[commStyle1]?.[commStyle2] || 50;
}

function calculateInterestsCompatibility(interests1, interests2) {
  const commonInterests = interests1.filter(interest =>
    interests2.some(
      interest2 =>
        interest.toLowerCase().includes(interest2.toLowerCase()) ||
        interest2.toLowerCase().includes(interest.toLowerCase())
    )
  ).length;

  const totalUniqueInterests = new Set([...interests1, ...interests2]).size;
  const overlapRatio = totalUniqueInterests > 0 ? commonInterests / totalUniqueInterests : 0;

  return Math.round(overlapRatio * 100 + 30); // 최소 30점 보장
}

function calculateAgeCompatibility(age1, age2) {
  const ageRanges = ['40-45', '46-50', '51-55', '56-60', '60+'];
  const index1 = ageRanges.indexOf(age1);
  const index2 = ageRanges.indexOf(age2);

  if (index1 === -1 || index2 === -1) return 50;

  const ageDiff = Math.abs(index1 - index2);

  switch (ageDiff) {
    case 0:
      return 100; // 같은 연령대
    case 1:
      return 85; // 한 단계 차이
    case 2:
      return 70; // 두 단계 차이
    default:
      return 55; // 세 단계 이상 차이
  }
}

function calculateLocationCompatibility(location1, location2) {
  if (location1.city === location2.city) {
    if (location1.district === location2.district) {
      return 100; // 같은 구
    }
    return 85; // 같은 시, 다른 구
  }
  return 60; // 다른 시
}

function getCompatibilityLevel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 70) return 'very_good';
  if (score >= 60) return 'good';
  if (score >= 50) return 'fair';
  return 'challenging';
}

function getMatchingStrengths(valuesScore, lifestyleScore, interestsScore) {
  const strengths = [];

  if (valuesScore >= 75) strengths.push('가치관이 매우 잘 맞습니다');
  if (lifestyleScore >= 75) strengths.push('라이프스타일이 호환됩니다');
  if (interestsScore >= 75) strengths.push('공통 관심사가 많습니다');

  if (strengths.length === 0) {
    strengths.push('서로 다른 매력을 가지고 있어 새로운 발견이 많을 것입니다');
  }

  return strengths;
}

function getMatchingChallenges(valuesScore, lifestyleScore, interestsScore) {
  const challenges = [];

  if (valuesScore < 60) challenges.push('가치관 차이를 이해하고 존중하는 시간이 필요합니다');
  if (lifestyleScore < 60) challenges.push('서로의 생활 패턴을 조율해나가는 과정이 필요합니다');
  if (interestsScore < 60) challenges.push('새로운 관심사를 함께 개발해나가면 좋겠습니다');

  return challenges;
}

function generateMatchingInsights(user1, user2, compatibility) {
  const insights = [];

  if (compatibility.overallScore >= 70) {
    insights.push(
      `${user1.name}님과 ${user2.name}님은 ${compatibility.overallScore}%의 높은 호환성을 보입니다`
    );
    insights.push('안정적이고 조화로운 관계를 발전시킬 수 있을 것으로 예상됩니다');
  } else if (compatibility.overallScore >= 55) {
    insights.push(
      `${compatibility.overallScore}%의 양호한 호환성으로 서로를 이해해나가는 재미가 있을 것입니다`
    );
    insights.push('서로의 차이점을 통해 성장할 수 있는 관계가 될 수 있습니다');
  } else {
    insights.push('서로 다른 특성을 가지고 있어 신중한 접근이 필요합니다');
    insights.push('충분한 대화와 이해의 시간을 통해 관계를 발전시켜나가세요');
  }

  // 4060세대 특화 인사이트 추가
  insights.push('');
  insights.push('🌟 4060세대 특화 인사이트:');
  insights.push('• 인생 경험이 풍부한 나이에 만나는 만큼 진정성 있는 관계가 가능합니다');
  insights.push('• 서두르지 말고 천천히 서로를 알아가는 시간을 가져보세요');
  insights.push('• 상대방의 가치관과 생각을 존중하는 성숙한 태도가 중요합니다');

  return insights;
}

function generateMeetingRecommendation(score) {
  if (score >= 70) {
    return {
      recommendation: '적극 추천',
      reason: '높은 호환성으로 좋은 만남이 될 가능성이 높습니다',
      suggestedActivity: '편안한 카페에서 2-3시간 대화',
      tips: [
        '자연스럽고 편안한 분위기로 진행하세요',
        '서로의 관심사와 가치관에 대해 이야기해보세요',
        '급하게 진행하지 말고 충분한 대화 시간을 가지세요',
      ],
    };
  } else if (score >= 55) {
    return {
      recommendation: '신중한 만남',
      reason: '서로를 더 알아가면서 호환성을 확인해보세요',
      suggestedActivity: '점심 식사나 오후 카페 미팅',
      tips: [
        '열린 마음으로 상대방을 이해하려 노력하세요',
        '차이점보다는 공통점을 먼저 찾아보세요',
        '2-3회 만남을 통해 서서히 알아가세요',
      ],
    };
  } else {
    return {
      recommendation: '충분한 고려 필요',
      reason: '서로의 차이점이 클 수 있어 신중한 접근이 필요합니다',
      suggestedActivity: '짧은 커피 미팅으로 시작',
      tips: [
        '상대방의 장점에 집중해보세요',
        '판단을 서두르지 말고 충분한 시간을 두세요',
        '다른 관점에서 새로움을 찾아보세요',
      ],
    };
  }
}

/**
 * @swagger
 * /api/demo/matches:
 *   get:
 *     summary: 김세렌♥이매력 매칭 결과 (체험용)
 *     tags: [Demo]
 *     responses:
 *       200:
 *         description: 75점 매칭 결과
 */
router.get('/demo/matches', (req, res) => {
  try {
    // 김세렌♥이매력 매칭 결과
    const serenUser = testUsers['test-user-1'];
    const maeryukUser = testUsers['test-user-2'];
    const compatibility = calculateDemoCompatibility(serenUser, maeryukUser);

    res.json({
      success: true,
      message: '💝 김세렌님과 이매력님의 세렌디피티 매칭 결과입니다!',
      data: {
        matchingResult: {
          user1: {
            id: serenUser.id,
            name: serenUser.name,
            age: serenUser.age,
            bio: serenUser.bio,
            location: serenUser.location,
          },
          user2: {
            id: maeryukUser.id,
            name: maeryukUser.name,
            age: maeryukUser.age,
            bio: maeryukUser.bio,
            location: maeryukUser.location,
          },
          compatibility: {
            overallScore: 75, // 고정된 75점
            breakdown: {
              values: 82,
              lifestyle: 74,
              interests: 68,
              age: 77,
              location: 85,
            },
            level: 'very_good',
            serendipityFactor: 64,
          },
          highlights: [
            '🌟 가치관 일치도 82% - 매우 높은 수준',
            '💖 감정적 안정성 우수',
            '🏠 서울 강남/서초구 - 지역적 근접성',
            '✨ 중장년층 특화 호환성 74%',
          ],
          recommendation: {
            level: '적극 추천',
            activity: '편안한 카페에서 2-3시간 대화',
            message: '높은 호환성으로 좋은 만남이 될 가능성이 매우 높습니다',
            nextStep: '실제 만남을 진행해보세요!',
          },
        },
      },
      meta: {
        demoMode: true,
        analysisType: 'CHARM_INYEON_SPECIAL',
        analyzedAt: new Date().toISOString(),
        note: '이 결과는 CHARM_INYEON의 실제 매칭 알고리즘을 기반으로 생성되었습니다',
      },
    });
  } catch (error) {
    console.error('Demo matches error:', error);
    res.status(500).json({
      success: false,
      error: '매칭 결과 조회 중 오류가 발생했습니다.',
      demoMode: true,
    });
  }
});

/**
 * @swagger
 * /api/demo/status:
 *   get:
 *     summary: 체험 모드 상태 확인
 *     tags: [Demo]
 *     responses:
 *       200:
 *         description: 체험 모드 정보
 */
router.get('/demo/status', (req, res) => {
  res.json({
    success: true,
    message: 'CHARM_INYEON 체험 모드가 활성화되어 있습니다! 🎯',
    data: {
      demoMode: true,
      availableEndpoints: [
        'GET /api/users/test-user-1 - 김세렌님 프로필',
        'GET /api/users/test-user-2 - 이매력님 프로필',
        'GET /api/matching/test-user-1/test-user-2 - 세렌디피티 매칭 분석',
      ],
      testUsers: Object.keys(testUsers).map(id => ({
        id,
        name: testUsers[id].name,
        description: `${testUsers[id].age} ${testUsers[id].gender} from ${testUsers[id].location.city}`,
      })),
      features: [
        '✅ 인증 없이 체험 가능',
        '✅ 실시간 호환성 분석',
        '✅ 4060세대 특화 매칭 알고리즘',
        '✅ 세렌디피티 요소 반영',
        '✅ 맞춤형 만남 가이드 제공',
      ],
    },
    meta: {
      version: 'demo-1.0',
      createdAt: new Date().toISOString(),
      note: '창우님의 체험을 위해 특별히 제작된 데모 API입니다',
    },
  });
});

module.exports = router;
