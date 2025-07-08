const express = require('express');
const Match = require('../models/Match');
const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const advancedMatchingService = require('../services/advancedMatchingService');
const valuesAnalysisEngine = require('../services/valuesAnalysisEngine');
const intelligentMatchingEngine = require('../services/intelligentMatchingEngine');
const matchingVisualizationService = require('../services/matchingVisualizationService');
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

// ============ Phase 3: 고도화된 매칭 시스템 ============

/**
 * @swagger
 * /api/matching/analyze-values:
 *   post:
 *     summary: 사용자 가치관 심층 분석 (Phase 3)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 가치관 분석 성공
 *       400:
 *         description: 설문 미완료 또는 데이터 오류
 */
router.post('/analyze-values', authenticate, requireVerified, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log(`🎯 Phase 3 가치관 분석 요청 - 사용자: ${userId}`);
    
    // 1. 사용자의 완료된 설문 조회
    const assessment = await ValuesAssessment.findOne({ 
      userId, 
      isCompleted: true 
    }).sort({ completedAt: -1 });
    
    if (!assessment) {
      return res.status(400).json({
        success: false,
        error: '완료된 가치관 설문이 없습니다.',
        code: 'ASSESSMENT_NOT_FOUND'
      });
    }
    
    // 2. Phase 3 고도화된 가치관 분석 실행
    const analysisResult = await valuesAnalysisEngine.analyzeUserValues(
      userId, 
      assessment.answers
    );
    
    // 3. 분석 결과를 설문에 저장 (Phase 3 버전)
    assessment.aiAnalysis = {
      ...assessment.aiAnalysis,
      phase3Analysis: {
        primaryPersonalityType: analysisResult.valueProfile.profileSummary,
        topValues: analysisResult.valueProfile.primaryValues.map(v => ({
          value: v.name,
          score: Math.round(v.score)
        })),
        compatibilityFactors: analysisResult.compatibilityFactors,
        strengthsAndChallenges: analysisResult.analysisResult.strengthsAndChallenges,
        relationshipInsights: analysisResult.analysisResult.relationshipInsights,
        analyzedAt: new Date(),
        version: '3.0'
      }
    };
    
    await assessment.save();
    
    console.log(`✅ Phase 3 가치관 분석 완료 - 사용자: ${userId}`);
    
    res.json({
      success: true,
      message: '심층 가치관 분석이 완료되었습니다.',
      data: {
        analysisId: assessment._id,
        valueProfile: analysisResult.valueProfile,
        analysisResult: analysisResult.analysisResult,
        confidence: analysisResult.confidence,
        coreMessage: analysisResult.analysisResult.coreMessage,
        analyzedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Phase 3 가치관 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: '가치관 분석 중 오류가 발생했습니다.',
      code: 'ANALYSIS_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/matching/intelligent-compatibility/{targetUserId}:
 *   get:
 *     summary: 지능형 호환성 분석 (Phase 3)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 지능형 호환성 분석 성공
 *       404:
 *         description: 사용자 또는 설문 없음
 */
router.get('/intelligent-compatibility/:targetUserId', 
  authenticate, 
  requireVerified, 
  validateObjectId('targetUserId'),
  async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const targetUserId = req.params.targetUserId;
      
      console.log(`🎯 Phase 3 지능형 호환성 분석: ${currentUserId} ↔ ${targetUserId}`);
      
      // 1. 두 사용자의 설문 데이터 조회
      const [currentAssessment, targetAssessment] = await Promise.all([
        ValuesAssessment.findOne({ 
          userId: currentUserId, 
          isCompleted: true 
        }).sort({ completedAt: -1 }),
        ValuesAssessment.findOne({ 
          userId: targetUserId, 
          isCompleted: true 
        }).sort({ completedAt: -1 })
      ]);
      
      if (!currentAssessment) {
        return res.status(400).json({
          success: false,
          error: '회원님의 가치관 설문이 완료되지 않았습니다.',
          code: 'CURRENT_USER_ASSESSMENT_MISSING'
        });
      }
      
      if (!targetAssessment) {
        return res.status(404).json({
          success: false,
          error: '상대방의 가치관 설문이 완료되지 않았습니다.',
          code: 'TARGET_USER_ASSESSMENT_MISSING'
        });
      }
      
      // 2. Phase 3 지능형 매칭 분석 실행
      const matchingResult = await intelligentMatchingEngine.calculateComprehensiveMatch(
        currentAssessment,
        targetAssessment
      );
      
      // 3. 중장년층 특화 시각화 데이터 생성
      const visualizationData = matchingVisualizationService.generateComprehensiveVisualization(
        matchingResult
      );
      
      console.log(`✅ Phase 3 지능형 호환성 분석 완료: ${matchingResult.overallScore}점`);
      
      res.json({
        success: true,
        message: '지능형 호환성 분석이 완료되었습니다.',
        data: {
          overallScore: matchingResult.overallScore,
          compatibility: matchingResult.compatibility,
          matchingReasons: matchingResult.matchingReasons,
          meetingGuide: matchingResult.meetingGuide,
          relationshipRoadmap: matchingResult.relationshipRoadmap,
          challengesAndSolutions: matchingResult.challengesAndSolutions,
          visualization: visualizationData,
          confidenceLevel: matchingResult.confidenceLevel,
          analyzedAt: matchingResult.timestamp,
          version: '3.0'
        }
      });
      
    } catch (error) {
      console.error('Phase 3 지능형 호환성 분석 오류:', error);
      
      // 에러 유형에 따른 사용자 친화적 메시지
      let userMessage = '지능형 호환성 분석 중 오류가 발생했습니다.';
      let statusCode = 500;
      
      if (error.message.includes('데이터 검증')) {
        userMessage = '분석에 필요한 데이터가 부족합니다. 가치관 설문을 다시 확인해주세요.';
        statusCode = 400;
      } else if (error.message.includes('timeout') || error.message.includes('시간')) {
        userMessage = '분석이 예상보다 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 503;
      }
      
      res.status(statusCode).json({
        success: false,
        error: userMessage,
        code: 'INTELLIGENT_COMPATIBILITY_ERROR',
        details: {
          canRetry: statusCode !== 400,
          suggestedAction: statusCode === 400 ? 
            '가치관 설문을 다시 완료해주세요' : 
            '잠시 후 다시 시도해주세요',
          supportMessage: '문제가 지속되면 고객지원팀에 문의해주세요'
        }
      });
    }
  }
);

/**
 * @swagger
 * /api/matching/conversation-guide/{targetUserId}:
 *   get:
 *     summary: 4060세대 맞춤 대화 가이드 (Phase 3)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: targetUserId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 대화 가이드 생성 성공
 */
router.get('/conversation-guide/:targetUserId',
  authenticate,
  requireVerified,
  validateObjectId('targetUserId'),
  async (req, res) => {
    try {
      const currentUserId = req.user._id;
      const targetUserId = req.params.targetUserId;
      
      console.log(`🎯 Phase 3 대화 가이드 요청: ${currentUserId} → ${targetUserId}`);
      
      // 1. 두 사용자의 설문 데이터 조회
      const [currentAssessment, targetAssessment] = await Promise.all([
        ValuesAssessment.findOne({ 
          userId: currentUserId, 
          isCompleted: true 
        }).sort({ completedAt: -1 }),
        ValuesAssessment.findOne({ 
          userId: targetUserId, 
          isCompleted: true 
        }).sort({ completedAt: -1 })
      ]);
      
      if (!currentAssessment || !targetAssessment) {
        return res.status(400).json({
          success: false,
          error: '완료된 가치관 설문이 필요합니다.',
          code: 'ASSESSMENT_REQUIRED'
        });
      }
      
      // 2. 매칭 분석 (대화 가이드 생성을 위해)
      const matchingResult = await intelligentMatchingEngine.calculateComprehensiveMatch(
        currentAssessment,
        targetAssessment
      );
      
      // 3. 4060세대 특화 대화 가이드 생성
      const enhancedGuide = {
        ...matchingResult.meetingGuide,
        
        // 4060세대 특화 대화 팁
        ageSpecificTips: [
          '서두르지 않고 천천히 대화를 나누세요',
          '인생 경험과 지혜를 나누는 시간을 가져보세요', 
          '진정성 있는 관심과 경청의 자세를 보여주세요',
          '가벼운 주제부터 시작해서 점차 깊어지게 하세요'
        ],
        
        // 상황별 대화 가이드
        situationalGuides: {
          firstMeeting: {
            atmosphere: '편안하고 조용한 카페나 레스토랑',
            duration: '1-2시간',
            topics: matchingResult.meetingGuide.conversationStarters?.slice(0, 5) || [],
            avoidTopics: ['개인적인 과거 관계', '재정 상황', '건강 문제']
          },
          
          followUpMeeting: {
            atmosphere: '좀 더 개인적인 공간이나 활동적인 장소',
            duration: '2-3시간',
            topics: ['공통 관심사 깊이 탐구', '가족과 친구들 이야기', '미래 계획'],
            activities: matchingResult.meetingGuide.recommendedActivities?.slice(0, 3) || []
          }
        },
        
        // 호환성 기반 맞춤 조언
        compatibilityBasedAdvice: generateCompatibilityBasedAdvice(matchingResult.overallScore),
        
        // 주의사항과 대처법
        precautions: matchingResult.challengesAndSolutions?.challenges || []
      };
      
      console.log(`✅ Phase 3 대화 가이드 생성 완료`);
      
      res.json({
        success: true,
        message: '4060세대 맞춤 대화 가이드가 생성되었습니다.',
        data: {
          guide: enhancedGuide,
          compatibilityScore: matchingResult.overallScore,
          confidence: matchingResult.confidenceLevel,
          generatedAt: new Date(),
          version: '3.0'
        }
      });
      
    } catch (error) {
      console.error('Phase 3 대화 가이드 생성 오류:', error);
      res.status(500).json({
        success: false,
        error: '대화 가이드 생성 중 오류가 발생했습니다.',
        code: 'CONVERSATION_GUIDE_ERROR'
      });
    }
  }
);

/**
 * @swagger
 * /api/matching/smart-recommendations:
 *   get:
 *     summary: AI 기반 스마트 추천 (Phase 3)
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 추천 사용자 수
 *       - name: minScore
 *         in: query
 *         schema:
 *           type: integer
 *           default: 60
 *         description: 최소 호환성 점수
 *     responses:
 *       200:
 *         description: 스마트 추천 목록 조회 성공
 */
router.get('/smart-recommendations', authenticate, requireVerified, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    const minScore = parseInt(req.query.minScore) || 60;
    
    console.log(`🎯 Phase 3 스마트 추천 요청 - 사용자: ${currentUserId}, 제한: ${limit}개`);
    
    // 1. 현재 사용자의 설문 조회
    const currentAssessment = await ValuesAssessment.findOne({ 
      userId: currentUserId, 
      isCompleted: true 
    }).sort({ completedAt: -1 });
    
    if (!currentAssessment) {
      return res.status(400).json({
        success: false,
        error: '가치관 설문을 먼저 완료해주세요.',
        code: 'ASSESSMENT_REQUIRED'
      });
    }
    
    // 2. 현재 사용자 정보 조회
    const currentUser = await User.findById(currentUserId);
    
    // 3. 이미 매칭된 사용자들 제외
    const existingMatches = await Match.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }]
    }).distinct('user1 user2');
    
    const excludeUserIds = [...new Set([
      ...existingMatches.map(id => id.toString()),
      currentUserId.toString()
    ])];
    
    // 4. 잠재적 매치 후보 조회 (4060세대 필터링 포함)
    const candidates = await User.find({
      _id: { $nin: excludeUserIds },
      isActive: true,
      isVerified: true,
      'preferences.privacy.allowSearch': { $ne: false },
      // 4060세대 연령 필터
      age: { $in: ['40-45', '46-50', '51-55', '56-60', '60+'] }
    }).limit(30); // 성능을 위해 30명으로 제한
    
    // 5. 각 후보와의 지능형 호환성 계산
    const recommendations = [];
    
    for (const candidate of candidates) {
      const candidateAssessment = await ValuesAssessment.findOne({ 
        userId: candidate._id, 
        isCompleted: true 
      }).sort({ completedAt: -1 });
      
      if (!candidateAssessment) continue;
      
      try {
        const matchingResult = await intelligentMatchingEngine.calculateComprehensiveMatch(
          currentAssessment,
          candidateAssessment
        );
        
        if (matchingResult.overallScore >= minScore) {
          recommendations.push({
            userId: candidate._id,
            userInfo: {
              name: candidate.name,
              age: candidate.age,
              gender: candidate.gender,
              profileImage: candidate.profileImage,
              location: candidate.location
            },
            compatibility: {
              overallScore: matchingResult.overallScore,
              topReasons: matchingResult.matchingReasons?.slice(0, 3) || [],
              confidenceLevel: matchingResult.confidenceLevel,
              breakdown: matchingResult.compatibility.breakdown
            },
            preview: {
              summary: generateCompatibilitySummary(matchingResult.overallScore),
              keyStrengths: extractKeyStrengths(matchingResult.matchingReasons),
              meetingTips: matchingResult.meetingGuide?.conversationStarters?.slice(0, 2) || []
            },
            phase3Features: {
              hasDeepAnalysis: true,
              visualizationReady: true,
              conversationGuideAvailable: true
            }
          });
        }
      } catch (matchError) {
        console.warn(`Phase 3 매칭 분석 실패 - 사용자: ${candidate._id}`, matchError.message);
        continue;
      }
    }
    
    // 6. 호환성 점수와 신뢰도를 종합하여 정렬
    const sortedRecommendations = recommendations
      .sort((a, b) => {
        // 점수와 신뢰도를 종합한 최종 점수로 정렬
        const scoreA = a.compatibility.overallScore * (a.compatibility.confidenceLevel / 100);
        const scoreB = b.compatibility.overallScore * (b.compatibility.confidenceLevel / 100);
        return scoreB - scoreA;
      })
      .slice(0, limit);
    
    console.log(`✅ Phase 3 스마트 추천 완료: ${sortedRecommendations.length}명`);
    
    res.json({
      success: true,
      message: `AI 기반 스마트 추천으로 ${sortedRecommendations.length}명을 찾았습니다.`,
      data: {
        recommendations: sortedRecommendations,
        totalAnalyzed: candidates.length,
        qualityFiltered: recommendations.length,
        finalRecommendations: sortedRecommendations.length,
        criteria: {
          minScore,
          limit,
          ageGroup: '4060세대',
          analysisVersion: '3.0'
        },
        generatedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Phase 3 스마트 추천 오류:', error);
    
    // 부분적 결과가 있는 경우 제공
    if (error.partialResults && error.partialResults.length > 0) {
      console.log('부분적 결과 제공 중...');
      res.json({
        success: true,
        message: `일부 분석에 문제가 있어 ${error.partialResults.length}개의 추천을 제공합니다.`,
        data: {
          recommendations: error.partialResults,
          totalAnalyzed: error.partialResults.length,
          qualityFiltered: error.partialResults.length,
          finalRecommendations: error.partialResults.length,
          criteria: {
            minScore: parseInt(req.query.minScore) || 60,
            limit: parseInt(req.query.limit) || 10,
            ageGroup: '4060세대',
            analysisVersion: '3.0-partial'
          },
          generatedAt: new Date(),
          warning: '일부 사용자의 분석이 제한되었습니다'
        }
      });
    } else {
      // 완전한 에러인 경우
      let userMessage = '스마트 추천 생성 중 오류가 발생했습니다.';
      let statusCode = 500;
      
      if (error.message.includes('설문')) {
        userMessage = '가치관 설문을 먼저 완료해주세요.';
        statusCode = 400;
      } else if (error.message.includes('사용자')) {
        userMessage = '현재 추천 가능한 사용자가 없습니다. 나중에 다시 시도해주세요.';
        statusCode = 404;
      }
      
      res.status(statusCode).json({
        success: false,
        error: userMessage,
        code: 'SMART_RECOMMENDATIONS_ERROR',
        details: {
          canRetry: statusCode !== 400,
          suggestedAction: statusCode === 400 ? 
            '가치관 설문을 완료해주세요' : 
            '잠시 후 다시 시도해주세요',
          alternatives: [
            '일반 사용자 목록을 확인해보세요',
            '검색 조건을 조정해보세요'
          ]
        }
      });
    }
  }
});

// Phase 3 유틸리티 함수들

/**
 * 호환성 기반 조언 생성
 */
function generateCompatibilityBasedAdvice(score) {
  if (score >= 80) {
    return [
      '높은 호환성을 보이니 자연스럽게 대화하세요',
      '공통점이 많으니 편안한 분위기를 만들기 쉬울 것입니다',
      '서로의 차이점도 발견하며 새로운 면을 알아가세요'
    ];
  } else if (score >= 65) {
    return [
      '좋은 호환성이니 서로에게 관심을 보이며 대화하세요',
      '공통 관심사를 중심으로 대화를 시작해보세요',
      '차이점은 새로운 배움의 기회로 접근하세요'
    ];
  } else {
    return [
      '서로 다른 점이 많을 수 있으니 열린 마음으로 접근하세요',
      '상대방의 관점을 이해하려고 노력해보세요',
      '서두르지 말고 천천히 서로를 알아가세요'
    ];
  }
}

/**
 * 호환성 요약 생성
 */
function generateCompatibilitySummary(score) {
  if (score >= 85) return '최상의 궁합';
  if (score >= 75) return '매우 좋은 궁합';
  if (score >= 65) return '좋은 궁합';
  if (score >= 55) return '괜찮은 궁합';
  return '도전적인 관계';
}

/**
 * 핵심 강점 추출
 */
function extractKeyStrengths(reasons) {
  return reasons?.slice(0, 2).map(reason => reason.title) || [];
}

module.exports = router;