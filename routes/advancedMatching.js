const express = require('express');
const advancedMatchingService = require('../services/advancedMatchingService');
const User = require('../models/User');
const Match = require('../models/Match');
const { authenticate, requireVerified } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/advanced-matching/compatibility/{userId}:
 *   get:
 *     summary: 특정 사용자와의 호환성 점수 계산
 *     tags: [Advanced Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: 호환성을 확인할 사용자 ID
 *     responses:
 *       200:
 *         description: 호환성 점수 계산 성공
 */
router.get('/compatibility/:userId', authenticate, requireVerified, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: '자신과의 호환성은 계산할 수 없습니다.',
      });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      });
    }

    const compatibility = await advancedMatchingService.calculateCompatibilityScore(
      req.user,
      targetUser
    );

    res.json({
      success: true,
      data: {
        compatibility,
        targetUser: {
          id: targetUser._id,
          name: targetUser.name,
          age: targetUser.age,
          profileImage: targetUser.profileImage,
        },
      },
    });
  } catch (error) {
    console.error('Calculate compatibility error:', error);
    res.status(500).json({
      success: false,
      error: '호환성 계산 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/advanced-matching/potential-matches:
 *   get:
 *     summary: 잠재적 매치 사용자 목록 조회 (중장년층 특화)
 *     tags: [Advanced Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 결과 수 제한
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: integer
 *           default: 60
 *         description: 최소 호환성 점수
 *     responses:
 *       200:
 *         description: 잠재적 매치 목록 조회 성공
 */
router.get('/potential-matches', authenticate, requireVerified, async (req, res) => {
  try {
    const { limit = 10, minScore = 60 } = req.query;

    const potentialMatches = await advancedMatchingService.findPotentialMatches(
      req.user._id,
      parseInt(limit)
    );

    const filteredMatches = potentialMatches.filter(
      match => match.compatibilityScore >= parseInt(minScore)
    );

    res.json({
      success: true,
      data: {
        matches: filteredMatches.map(match => ({
          user: {
            id: match.user._id,
            name: match.user.name,
            age: match.user.age,
            profileImage: match.user.profileImage,
            bio: match.user.bio,
            maritalStatus: match.user.maritalStatus,
            hasChildren: match.user.hasChildren,
            occupation: match.user.occupation,
            lifestyle: match.user.lifestyle,
            location: match.user.location,
          },
          compatibilityScore: match.compatibilityScore,
          compatibilityBreakdown: match.compatibilityBreakdown,
        })),
        total: filteredMatches.length,
        filters: {
          minScore: parseInt(minScore),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get potential matches error:', error);
    res.status(500).json({
      success: false,
      error: '잠재적 매치 조회 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/advanced-matching/match-analysis:
 *   get:
 *     summary: 매칭 분석 리포트 (중장년층 특화 분석)
 *     tags: [Advanced Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 매칭 분석 리포트 조회 성공
 */
router.get('/match-analysis', authenticate, requireVerified, async (req, res) => {
  try {
    const userId = req.user._id;

    // 사용자의 모든 매치 조회
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate('user1 user2', 'age maritalStatus hasChildren occupation lifestyle location');

    if (matches.length === 0) {
      return res.json({
        success: true,
        data: {
          analysis: {
            totalMatches: 0,
            message: '매치 데이터가 없습니다. 매칭을 시작해보세요!',
          },
        },
      });
    }

    // 매칭 패턴 분석
    const analysis = {
      totalMatches: matches.length,
      averageCompatibility: Math.round(
        matches.reduce((sum, match) => sum + match.compatibilityScore, 0) / matches.length
      ),

      // 연령대별 매칭 분포
      ageDistribution: analyzeAgeDistribution(matches, userId),

      // 결혼 상태별 매칭 분포
      maritalStatusDistribution: analyzeMaritalStatusDistribution(matches, userId),

      // 자녀 유무별 매칭 분포
      childrenDistribution: analyzeChildrenDistribution(matches, userId),

      // 직업별 매칭 분포
      occupationDistribution: analyzeOccupationDistribution(matches, userId),

      // 지역별 매칭 분포
      locationDistribution: analyzeLocationDistribution(matches, userId),

      // 호환성 요소별 평균 점수
      compatibilityBreakdown: analyzeCompatibilityBreakdown(matches),

      // 매칭 성공률
      successRate: Math.round(
        (matches.filter(m => m.status === 'mutual_match').length / matches.length) * 100
      ),

      // 추천사항
      recommendations: generateRecommendations(matches, req.user),
    };

    res.json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (error) {
    console.error('Match analysis error:', error);
    res.status(500).json({
      success: false,
      error: '매칭 분석 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/advanced-matching/preferences-optimization:
 *   post:
 *     summary: 매칭 선호도 최적화 제안
 *     tags: [Advanced Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 선호도 최적화 제안 성공
 */
router.post('/preferences-optimization', authenticate, requireVerified, async (req, res) => {
  try {
    const userId = req.user._id;

    // 사용자의 매칭 히스토리 분석
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate('user1 user2', 'age maritalStatus hasChildren occupation lifestyle location');

    // 성공적인 매치들 분석
    const successfulMatches = matches.filter(m => m.status === 'mutual_match');

    let optimizationSuggestions = [];

    if (successfulMatches.length > 0) {
      // 성공한 매치들의 패턴 분석
      const patterns = analyzeSuccessPatterns(successfulMatches, userId);

      // 현재 선호도와 비교하여 최적화 제안
      const currentPrefs = req.user.preferences?.matching || {};

      // 연령대 최적화
      if (patterns.optimalAgeRange) {
        const currentAgeRange = currentPrefs.ageRange || { min: 40, max: 70 };
        if (
          patterns.optimalAgeRange.min !== currentAgeRange.min ||
          patterns.optimalAgeRange.max !== currentAgeRange.max
        ) {
          optimizationSuggestions.push({
            type: 'age_range',
            current: currentAgeRange,
            suggested: patterns.optimalAgeRange,
            reason: '성공적인 매치들의 연령대 패턴을 기반으로 한 제안입니다.',
          });
        }
      }

      // 거리 최적화
      if (patterns.optimalDistance) {
        const currentDistance = currentPrefs.distance || 30;
        if (Math.abs(patterns.optimalDistance - currentDistance) > 5) {
          optimizationSuggestions.push({
            type: 'distance',
            current: currentDistance,
            suggested: patterns.optimalDistance,
            reason: '성공적인 매치들의 거리 패턴을 기반으로 한 제안입니다.',
          });
        }
      }

      // 결혼 상태 선호도 최적화
      if (patterns.optimalMaritalStatus && patterns.optimalMaritalStatus.length > 0) {
        const currentMaritalPref = currentPrefs.maritalStatusPreference || [];
        if (!arraysEqual(currentMaritalPref, patterns.optimalMaritalStatus)) {
          optimizationSuggestions.push({
            type: 'marital_status',
            current: currentMaritalPref,
            suggested: patterns.optimalMaritalStatus,
            reason: '성공적인 매치들의 결혼 상태 패턴을 기반으로 한 제안입니다.',
          });
        }
      }
    } else {
      // 성공적인 매치가 없는 경우 일반적인 제안
      optimizationSuggestions = generateGeneralOptimizationSuggestions(req.user);
    }

    res.json({
      success: true,
      data: {
        currentPreferences: req.user.preferences?.matching || {},
        optimizationSuggestions,
        analysisBase: {
          totalMatches: matches.length,
          successfulMatches: successfulMatches.length,
          analysisType: successfulMatches.length > 0 ? 'pattern_based' : 'general',
        },
      },
    });
  } catch (error) {
    console.error('Preferences optimization error:', error);
    res.status(500).json({
      success: false,
      error: '선호도 최적화 중 오류가 발생했습니다.',
    });
  }
});

// 헬퍼 함수들
function analyzeAgeDistribution(matches, userId) {
  const ageGroups = {};
  matches.forEach(match => {
    const otherUser = match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
    const age = otherUser.age;
    ageGroups[age] = (ageGroups[age] || 0) + 1;
  });
  return ageGroups;
}

function analyzeMaritalStatusDistribution(matches, userId) {
  const statusGroups = {};
  matches.forEach(match => {
    const otherUser = match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
    const status = otherUser.maritalStatus || 'unknown';
    statusGroups[status] = (statusGroups[status] || 0) + 1;
  });
  return statusGroups;
}

function analyzeChildrenDistribution(matches, userId) {
  const childrenGroups = { hasChildren: 0, noChildren: 0 };
  matches.forEach(match => {
    const otherUser = match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
    if (otherUser.hasChildren) {
      childrenGroups.hasChildren++;
    } else {
      childrenGroups.noChildren++;
    }
  });
  return childrenGroups;
}

function analyzeOccupationDistribution(matches, userId) {
  const occupationGroups = {};
  matches.forEach(match => {
    const otherUser = match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
    const industry = otherUser.occupation?.industry || 'unknown';
    occupationGroups[industry] = (occupationGroups[industry] || 0) + 1;
  });
  return occupationGroups;
}

function analyzeLocationDistribution(matches, userId) {
  const locationGroups = {};
  matches.forEach(match => {
    const otherUser = match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
    const city = otherUser.location?.city || 'unknown';
    locationGroups[city] = (locationGroups[city] || 0) + 1;
  });
  return locationGroups;
}

function analyzeCompatibilityBreakdown(matches) {
  if (matches.length === 0) {
    return {};
  }

  const breakdown = {
    valuesAlignment: 0,
    lifestyleMatch: 0,
    maritalStatusCompatibility: 0,
    childrenCompatibility: 0,
    locationCompatibility: 0,
    occupationCompatibility: 0,
    ageCompatibility: 0,
  };

  let count = 0;
  matches.forEach(match => {
    if (match.compatibilityBreakdown) {
      Object.keys(breakdown).forEach(key => {
        if (match.compatibilityBreakdown[key] !== undefined) {
          breakdown[key] += match.compatibilityBreakdown[key];
          count++;
        }
      });
    }
  });

  Object.keys(breakdown).forEach(key => {
    breakdown[key] = count > 0 ? Math.round(breakdown[key] / matches.length) : 0;
  });

  return breakdown;
}

function generateRecommendations(matches, user) {
  const recommendations = [];

  // 프로필 완성도 확인
  if (!user.maritalStatus) {
    recommendations.push({
      type: 'profile_completion',
      priority: 'high',
      message: '결혼 상태 정보를 추가하면 더 정확한 매칭이 가능합니다.',
    });
  }

  if (!user.occupation?.industry) {
    recommendations.push({
      type: 'profile_completion',
      priority: 'medium',
      message: '직업 정보를 추가하면 더 정확한 매칭이 가능합니다.',
    });
  }

  // 매칭 활동 분석
  const recentMatches = matches.filter(m => {
    const daysSince = (Date.now() - new Date(m.matchedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30;
  });

  if (recentMatches.length === 0) {
    recommendations.push({
      type: 'activity',
      priority: 'medium',
      message: '최근 매칭 활동이 없습니다. 새로운 매치를 생성해보세요.',
    });
  }

  // 응답률 분석
  const respondedMatches = matches.filter(m => {
    const isUser1 = m.user1._id.toString() === user._id.toString();
    const myResponse = isUser1 ? m.user1Response : m.user2Response;
    return myResponse && myResponse.action !== 'none';
  });

  if (respondedMatches.length < matches.length * 0.5) {
    recommendations.push({
      type: 'engagement',
      priority: 'high',
      message: '매치에 더 적극적으로 응답해보세요. 더 많은 기회를 얻을 수 있습니다.',
    });
  }

  return recommendations;
}

function analyzeSuccessPatterns(successfulMatches, userId) {
  const patterns = {};

  if (successfulMatches.length === 0) {
    return patterns;
  }

  // 연령대 패턴 분석
  const ages = successfulMatches.map(match => {
    const otherUser = match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
    return otherUser.ageNumeric || 50;
  });

  if (ages.length > 0) {
    patterns.optimalAgeRange = {
      min: Math.min(...ages) - 2,
      max: Math.max(...ages) + 2,
    };
  }

  // 거리 패턴 분석 (가정)
  patterns.optimalDistance = 25;

  // 결혼 상태 패턴 분석
  const maritalStatuses = successfulMatches
    .map(match => {
      const otherUser =
        match.user1._id.toString() === userId.toString() ? match.user2 : match.user1;
      return otherUser.maritalStatus;
    })
    .filter(status => status);

  if (maritalStatuses.length > 0) {
    const statusCounts = maritalStatuses.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    patterns.optimalMaritalStatus = Object.keys(statusCounts)
      .sort((a, b) => statusCounts[b] - statusCounts[a])
      .slice(0, 2);
  }

  return patterns;
}

function generateGeneralOptimizationSuggestions(user) {
  const suggestions = [];

  const currentPrefs = user.preferences?.matching || {};

  // 연령대가 너무 제한적인 경우
  if (currentPrefs.ageRange) {
    const range = currentPrefs.ageRange.max - currentPrefs.ageRange.min;
    if (range < 10) {
      suggestions.push({
        type: 'age_range',
        current: currentPrefs.ageRange,
        suggested: {
          min: Math.max(40, currentPrefs.ageRange.min - 5),
          max: Math.min(80, currentPrefs.ageRange.max + 5),
        },
        reason: '연령대 범위를 넓히면 더 많은 매칭 기회를 얻을 수 있습니다.',
      });
    }
  }

  // 거리가 너무 제한적인 경우
  if (currentPrefs.distance && currentPrefs.distance < 20) {
    suggestions.push({
      type: 'distance',
      current: currentPrefs.distance,
      suggested: 30,
      reason: '거리 범위를 넓히면 더 많은 매칭 기회를 얻을 수 있습니다.',
    });
  }

  return suggestions;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((val, index) => val === b[index]);
}

module.exports = router;
