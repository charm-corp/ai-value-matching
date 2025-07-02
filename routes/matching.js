const express = require('express');
const Match = require('../models/Match');
const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const advancedMatchingService = require('../services/advancedMatchingService');
const { authenticate, requireVerified, requireMatchParticipant } = require('../middleware/auth');
const { validateMatchResponse, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/matching/generate:
 *   post:
 *     summary: 새로운 매치 생성 (고도화된 AI 매칭 알고리즘 실행)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 매칭 완료
 *       404:
 *         description: 가치관 평가 필요
 */
router.post('/generate', authenticate, requireVerified, async (req, res) => {
  try {
    // 사용자의 가치관 평가 확인
    const myAssessment = await ValuesAssessment.findOne({ 
      userId: req.user._id, 
      isCompleted: true 
    });
    
    if (!myAssessment) {
      return res.status(404).json({
        success: false,
        error: '가치관 평가를 먼저 완료해주세요.',
        needsAssessment: true
      });
    }
    
    // 고도화된 매칭 서비스 사용
    const potentialMatches = await advancedMatchingService.findPotentialMatches(req.user._id, 10);
    
    if (potentialMatches.length === 0) {
      return res.json({
        success: true,
        message: '현재 매칭 가능한 사용자가 없습니다.',
        data: {
          matches: [],
          total: 0
        }
      });
    }
    
    // 매치 생성
    const newMatches = await advancedMatchingService.createMatches(req.user._id, potentialMatches);
    
    // 생성된 매치들을 사용자 정보와 함께 반환
    const populatedMatches = await Match.find({
      _id: { $in: newMatches.map(m => m._id) }
    })
      .populate('user1', 'name age profileImage location bio maritalStatus hasChildren occupation lifestyle')
      .populate('user2', 'name age profileImage location bio maritalStatus hasChildren occupation lifestyle');
    
    res.json({
      success: true,
      message: `${newMatches.length}개의 새로운 매치가 생성되었습니다.`,
      data: {
        matches: populatedMatches.map(match => formatMatchForResponse(match, req.user._id)),
        total: newMatches.length
      }
    });
    
  } catch (error) {
    console.error('Generate matches error:', error);
    res.status(500).json({
      success: false,
      error: '매칭 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/matching/my-matches:
 *   get:
 *     summary: 내 매치 목록 조회
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, user1_liked, user2_liked, mutual_match, user1_passed, user2_passed, expired]
 *         description: 매치 상태 필터
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지당 결과 수
 *     responses:
 *       200:
 *         description: 매치 목록 조회 성공
 */
router.get('/my-matches', authenticate, requireVerified, validatePagination, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // 쿼리 구성
    const query = {
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 매치 조회
    const [matches, total] = await Promise.all([
      Match.find(query)
        .populate('user1', 'name age profileImage location bio lastActive')
        .populate('user2', 'name age profileImage location bio lastActive')
        .sort({ matchedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Match.countDocuments(query)
    ]);
    
    // 응답 형식으로 변환
    const formattedMatches = matches.map(match => formatMatchForResponse(match, req.user._id));
    
    res.json({
      success: true,
      data: {
        matches: formattedMatches,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Get my matches error:', error);
    res.status(500).json({
      success: false,
      error: '매치 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/matching/matches/{id}:
 *   get:
 *     summary: 특정 매치 상세 조회
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 매치 ID
 *     responses:
 *       200:
 *         description: 매치 상세 조회 성공
 *       404:
 *         description: 매치를 찾을 수 없음
 *       403:
 *         description: 접근 권한 없음
 */
router.get('/matches/:id', authenticate, validateObjectId('id'), requireMatchParticipant, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('user1', 'name age profileImage location bio lastActive preferences')
      .populate('user2', 'name age profileImage location bio lastActive preferences');
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: '매치를 찾을 수 없습니다.'
      });
    }
    
    // 상세 매치 정보 반환
    const detailedMatch = {
      ...formatMatchForResponse(match, req.user._id),
      compatibilityBreakdown: match.compatibilityBreakdown,
      matchReason: match.matchReason,
      interactions: match.interactions,
      analytics: match.analytics
    };
    
    res.json({
      success: true,
      data: {
        match: detailedMatch
      }
    });
    
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({
      success: false,
      error: '매치 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/matching/matches/{id}/respond:
 *   post:
 *     summary: 매치에 응답 (좋아요/패스)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 매치 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [like, pass, super_like]
 *               note:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: 응답 처리 성공
 *       400:
 *         description: 이미 응답한 매치
 */
router.post('/matches/:id/respond', authenticate, validateObjectId('id'), validateMatchResponse, requireMatchParticipant, async (req, res) => {
  try {
    const { action, note } = req.body;
    const match = req.match; // requireMatchParticipant에서 설정됨
    
    // 이미 응답했는지 확인
    const userResponse = match.getUserResponseStatus(req.user._id);
    if (userResponse && userResponse.action !== 'none') {
      return res.status(400).json({
        success: false,
        error: '이미 이 매치에 응답하셨습니다.'
      });
    }
    
    // 만료된 매치인지 확인
    if (match.isExpired) {
      return res.status(400).json({
        success: false,
        error: '만료된 매치입니다.'
      });
    }
    
    // 응답 설정
    await match.setUserResponse(req.user._id, action, note);
    
    // 상대방 정보
    const otherUser = match.getOtherUser(req.user._id);
    
    // 결과 메시지 생성
    let message = '';
    let isMutualMatch = false;
    
    if (match.status === 'mutual_match') {
      message = '축하합니다! 상호 매칭이 완료되었습니다.';
      isMutualMatch = true;
      
      // TODO: 매칭 성공 알림 발송
      // await sendMatchNotification(otherUser._id, req.user, 'mutual_match');
      
    } else if (action === 'like') {
      message = '좋아요를 보냈습니다. 상대방의 응답을 기다려주세요.';
      
      // TODO: 좋아요 알림 발송
      // await sendMatchNotification(otherUser._id, req.user, 'like');
      
    } else if (action === 'super_like') {
      message = '슈퍼 좋아요를 보냈습니다!';
      
      // TODO: 슈퍼 좋아요 알림 발송
      // await sendMatchNotification(otherUser._id, req.user, 'super_like');
      
    } else {
      message = '패스하였습니다.';
    }
    
    res.json({
      success: true,
      message,
      data: {
        match: formatMatchForResponse(match, req.user._id),
        isMutualMatch,
        canStartConversation: isMutualMatch
      }
    });
    
  } catch (error) {
    console.error('Respond to match error:', error);
    res.status(500).json({
      success: false,
      error: '매치 응답 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/matching/mutual-matches:
 *   get:
 *     summary: 상호 매칭된 사용자 목록 조회
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 상호 매치 목록 조회 성공
 */
router.get('/mutual-matches', authenticate, requireVerified, async (req, res) => {
  try {
    const mutualMatches = await Match.findMutualMatches(req.user._id);
    
    const formattedMatches = mutualMatches.map(match => formatMatchForResponse(match, req.user._id));
    
    res.json({
      success: true,
      data: {
        matches: formattedMatches,
        total: mutualMatches.length
      }
    });
    
  } catch (error) {
    console.error('Get mutual matches error:', error);
    res.status(500).json({
      success: false,
      error: '상호 매치 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/matching/stats:
 *   get:
 *     summary: 매칭 통계 조회
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 매칭 통계 조회 성공
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 매칭 통계 조회
    const [
      totalMatches,
      pendingMatches,
      mutualMatches,
      myLikes,
      receivedLikes
    ] = await Promise.all([
      Match.countDocuments({
        $or: [{ user1: userId }, { user2: userId }]
      }),
      Match.countDocuments({
        $or: [{ user1: userId }, { user2: userId }],
        status: 'pending'
      }),
      Match.countDocuments({
        $or: [{ user1: userId }, { user2: userId }],
        status: 'mutual_match'
      }),
      Match.countDocuments({
        user1: userId,
        'user1Response.action': 'like'
      }),
      Match.countDocuments({
        user2: userId,
        'user1Response.action': 'like'
      })
    ]);
    
    // 평균 호환성 점수 계산
    const matchesWithScores = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    }).select('compatibilityScore');
    
    const avgCompatibility = matchesWithScores.length > 0
      ? Math.round(matchesWithScores.reduce((sum, match) => sum + match.compatibilityScore, 0) / matchesWithScores.length)
      : 0;
    
    res.json({
      success: true,
      data: {
        stats: {
          totalMatches,
          pendingMatches,
          mutualMatches,
          myLikes,
          receivedLikes,
          avgCompatibility,
          successRate: totalMatches > 0 ? Math.round((mutualMatches / totalMatches) * 100) : 0
        }
      }
    });
    
  } catch (error) {
    console.error('Get matching stats error:', error);
    res.status(500).json({
      success: false,
      error: '매칭 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

// 헬퍼 함수들

async function findMatchingCandidates(userId, currentUser) {
  try {
    const preferences = currentUser.preferences.matching;
    
    // 기본 쿼리
    const query = {
      _id: { $ne: userId },
      isActive: true,
      isVerified: true,
      'preferences.privacy.allowSearch': { $ne: false }
    };
    
    // 성별 선호도 적용
    if (preferences.genderPreference && preferences.genderPreference !== 'both') {
      query.gender = preferences.genderPreference;
    }
    
    // 연령대 필터링
    if (preferences.ageRange) {
      const ageRanges = ['40-45', '46-50', '51-55', '56-60', '60+'];
      const minIndex = ageRanges.findIndex(range => {
        const [min] = range.split('-').map(Number);
        return min >= preferences.ageRange.min;
      });
      const maxIndex = ageRanges.findIndex(range => {
        const [, max] = range.split('-').map(Number);
        return max <= preferences.ageRange.max;
      });
      
      if (minIndex !== -1 && maxIndex !== -1) {
        query.age = { $in: ageRanges.slice(minIndex, maxIndex + 1) };
      }
    }
    
    let candidates = await User.find(query)
      .select('name age gender location preferences')
      .limit(50); // 최대 50명의 후보
    
    // 거리 필터링 (위치 정보가 있는 경우)
    if (currentUser.location?.coordinates && preferences.distance) {
      candidates = await User.findNearbyUsers(
        currentUser.location.coordinates,
        preferences.distance * 1000 // km to meters
      );
      
      // 다른 필터도 적용
      candidates = candidates.filter(candidate => 
        candidate._id.toString() !== userId.toString() &&
        candidate.isActive &&
        candidate.isVerified &&
        candidate.preferences?.privacy?.allowSearch !== false
      );
    }
    
    return candidates;
    
  } catch (error) {
    console.error('Error finding matching candidates:', error);
    return [];
  }
}

function calculateCompatibilityBreakdown(assessment1, assessment2) {
  return {
    valuesAlignment: calculateValuesSimilarity(assessment1.valueCategories, assessment2.valueCategories),
    personalityCompatibility: calculatePersonalitySimilarity(assessment1.personalityScores, assessment2.personalityScores),
    lifestyleMatch: calculateLifestyleSimilarity(assessment1.lifestyle, assessment2.lifestyle),
    interestOverlap: calculateInterestsSimilarity(assessment1.interests, assessment2.interests),
    communicationStyle: calculateCommunicationCompatibility(assessment1.lifestyle, assessment2.lifestyle)
  };
}

function calculateValuesSimilarity(values1, values2) {
  let totalDiff = 0;
  let count = 0;
  
  Object.keys(values1).forEach(key => {
    if (values2[key] !== undefined) {
      totalDiff += Math.abs(values1[key] - values2[key]);
      count++;
    }
  });
  
  return count > 0 ? Math.round(100 - (totalDiff / count)) : 50;
}

function calculatePersonalitySimilarity(personality1, personality2) {
  let totalDiff = 0;
  let count = 0;
  
  Object.keys(personality1).forEach(key => {
    if (personality2[key] !== undefined) {
      totalDiff += Math.abs(personality1[key] - personality2[key]);
      count++;
    }
  });
  
  return count > 0 ? Math.round(100 - (totalDiff / count)) : 50;
}

function calculateLifestyleSimilarity(lifestyle1, lifestyle2) {
  let matches = 0;
  let total = 0;
  
  Object.keys(lifestyle1).forEach(key => {
    if (lifestyle2[key] !== undefined) {
      if (lifestyle1[key] === lifestyle2[key]) {
        matches++;
      }
      total++;
    }
  });
  
  return total > 0 ? Math.round((matches / total) * 100) : 50;
}

function calculateInterestsSimilarity(interests1, interests2) {
  const categories1 = new Set(interests1.map(i => i.category));
  const categories2 = new Set(interests2.map(i => i.category));
  
  const intersection = new Set([...categories1].filter(x => categories2.has(x)));
  const union = new Set([...categories1, ...categories2]);
  
  return union.size > 0 ? Math.round((intersection.size / union.size) * 100) : 0;
}

function calculateCommunicationCompatibility(lifestyle1, lifestyle2) {
  // 소통 스타일 호환성 계산
  const style1 = lifestyle1.communicationStyle;
  const style2 = lifestyle2.communicationStyle;
  
  const compatibilityMatrix = {
    direct: { direct: 90, diplomatic: 70, supportive: 60, analytical: 80 },
    diplomatic: { direct: 70, diplomatic: 95, supportive: 85, analytical: 75 },
    supportive: { direct: 60, diplomatic: 85, supportive: 90, analytical: 70 },
    analytical: { direct: 80, diplomatic: 75, supportive: 70, analytical: 95 }
  };
  
  return compatibilityMatrix[style1]?.[style2] || 50;
}

function generateMatchReason(assessment1, assessment2, compatibilityScore) {
  const factors = [];
  
  // 주요 호환 요소 분석
  const breakdown = calculateCompatibilityBreakdown(assessment1, assessment2);
  
  if (breakdown.valuesAlignment > 80) {
    factors.push({
      factor: 'shared_values',
      strength: breakdown.valuesAlignment,
      description: '매우 유사한 가치관을 가지고 있습니다'
    });
  }
  
  if (breakdown.lifestyleMatch > 75) {
    factors.push({
      factor: 'lifestyle_match',
      strength: breakdown.lifestyleMatch,
      description: '라이프스타일이 잘 맞습니다'
    });
  }
  
  if (breakdown.interestOverlap > 70) {
    factors.push({
      factor: 'common_interests',
      strength: breakdown.interestOverlap,
      description: '공통 관심사가 많습니다'
    });
  }
  
  return {
    primaryFactors: factors,
    algorithmVersion: '1.0',
    confidenceLevel: Math.min(95, compatibilityScore + 10)
  };
}

function formatMatchForResponse(match, currentUserId) {
  const isUser1 = match.user1._id.toString() === currentUserId.toString();
  const otherUser = isUser1 ? match.user2 : match.user1;
  const myResponse = isUser1 ? match.user1Response : match.user2Response;
  const theirResponse = isUser1 ? match.user2Response : match.user1Response;
  
  return {
    id: match._id,
    compatibilityScore: match.compatibilityScore,
    status: match.status,
    matchedAt: match.matchedAt,
    mutualMatchAt: match.mutualMatchAt,
    expiresAt: match.expiresAt,
    isExpired: match.isExpired,
    isMutualMatch: match.isMutualMatch,
    daysSinceMatch: match.daysSinceMatch,
    compatibilityLevel: match.compatibilityLevel,
    user: {
      id: otherUser._id,
      name: otherUser.name,
      age: otherUser.preferences?.privacy?.showAge !== false ? otherUser.age : undefined,
      profileImage: otherUser.profileImage,
      bio: otherUser.bio,
      location: otherUser.preferences?.privacy?.showLocation !== false ? {
        city: otherUser.location?.city,
        district: otherUser.location?.district
      } : undefined,
      isOnline: otherUser.isOnline,
      lastActive: otherUser.lastActive
    },
    myResponse: {
      action: myResponse.action,
      respondedAt: myResponse.respondedAt
    },
    theirResponse: {
      action: theirResponse.action,
      respondedAt: theirResponse.respondedAt
    },
    conversationStarted: match.conversationStarted,
    conversationId: match.conversationId
  };
}

module.exports = router;