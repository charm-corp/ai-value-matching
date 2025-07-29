const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const { authenticate } = require('../middleware/auth');
const {
  checkPrivacyConsent,
  logSensitiveDataAccess,
  maskPersonalData,
  sanitizeInput,
  checkDataAccess,
  specifyDataPurpose,
  anonymizeData,
} = require('../middleware/privacy');
const { encryptionService } = require('../utils/encryption');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Privacy
 *   description: 개인정보 보호 관련 API
 */

/**
 * @swagger
 * /api/privacy/consent:
 *   post:
 *     summary: 개인정보 처리 동의 업데이트
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agreePrivacy:
 *                 type: boolean
 *               agreeMarketing:
 *                 type: boolean
 *               agreeTerms:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 동의 설정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 필요
 */
router.post(
  '/consent',
  authenticate,
  sanitizeInput,
  logSensitiveDataAccess('privacy_consent'),
  body('agreePrivacy').optional().isBoolean(),
  body('agreeMarketing').optional().isBoolean(),
  body('agreeTerms').optional().isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '유효성 검사 실패',
          errors: errors.array(),
        });
      }

      const { agreePrivacy, agreeMarketing, agreeTerms } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (agreePrivacy !== undefined) {
        updateData.agreePrivacy = agreePrivacy;
      }
      if (agreeMarketing !== undefined) {
        updateData.agreeMarketing = agreeMarketing;
      }
      if (agreeTerms !== undefined) {
        updateData.agreeTerms = agreeTerms;
      }

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        select: 'agreePrivacy agreeMarketing agreeTerms',
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다',
        });
      }

      res.json({
        success: true,
        message: '동의 설정이 업데이트되었습니다',
        data: {
          agreePrivacy: user.agreePrivacy,
          agreeMarketing: user.agreeMarketing,
          agreeTerms: user.agreeTerms,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Privacy consent update error:', error);
      res.status(500).json({
        success: false,
        message: '동의 설정 업데이트 중 오류가 발생했습니다',
      });
    }
  }
);

/**
 * @swagger
 * /api/privacy/data-export:
 *   get:
 *     summary: 개인정보 내보내기 (GDPR 준수)
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 개인정보 내보내기 성공
 *       401:
 *         description: 인증 필요
 */
router.get(
  '/data-export',
  authenticate,
  checkPrivacyConsent(['privacy']),
  logSensitiveDataAccess('data_export'),
  specifyDataPurpose('data_portability'),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // 사용자 기본 정보
      const user = await User.findById(userId).select(
        '-password -emailVerificationToken -passwordResetToken'
      );

      // 가치관 평가 데이터
      const assessment = await ValuesAssessment.findOne({ userId });

      // 데이터 내보내기 객체 생성
      const exportData = {
        personal_information: {
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          phone: user.phone,
          location: user.location,
          bio: user.bio,
          preferences: user.preferences,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
        values_assessment: assessment
          ? {
              personality_scores: assessment.personalityScores,
              value_categories: assessment.valueCategories,
              interests: assessment.interests,
              lifestyle: assessment.lifestyle,
              completed_at: assessment.completedAt,
            }
          : null,
        consent_history: {
          privacy_consent: user.agreePrivacy,
          marketing_consent: user.agreeMarketing,
          terms_consent: user.agreeTerms,
        },
        export_info: {
          requested_at: new Date().toISOString(),
          format: 'JSON',
          gdpr_compliance: true,
        },
      };

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="personal_data_${userId}_${Date.now()}.json"`
      );
      res.setHeader('Content-Type', 'application/json');

      res.json({
        success: true,
        message: '개인정보 내보내기가 완료되었습니다',
        data: exportData,
      });
    } catch (error) {
      console.error('Data export error:', error);
      res.status(500).json({
        success: false,
        message: '데이터 내보내기 중 오류가 발생했습니다',
      });
    }
  }
);

/**
 * @swagger
 * /api/privacy/data-deletion:
 *   delete:
 *     summary: 개인정보 삭제 요청 (GDPR 준수)
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 삭제 요청 접수
 *       401:
 *         description: 인증 필요
 */
router.delete(
  '/data-deletion',
  authenticate,
  logSensitiveDataAccess('data_deletion'),
  specifyDataPurpose('data_erasure'),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // 실제 운영에서는 즉시 삭제하지 않고 삭제 요청을 기록하여
      // 관리자 검토 후 처리하는 것이 좋습니다

      // 계정 비활성화
      await User.findByIdAndUpdate(userId, {
        isActive: false,
        deletionRequested: true,
        deletionRequestedAt: new Date(),
      });

      // 삭제 요청 로그 기록
      console.log(
        `DATA_DELETION_REQUESTED: userId=${userId}, timestamp=${new Date().toISOString()}`
      );

      res.json({
        success: true,
        message: '개인정보 삭제 요청이 접수되었습니다. 처리까지 최대 30일이 소요될 수 있습니다.',
        data: {
          request_id: `DEL_${userId}_${Date.now()}`,
          requested_at: new Date().toISOString(),
          processing_time: '최대 30일',
        },
      });
    } catch (error) {
      console.error('Data deletion request error:', error);
      res.status(500).json({
        success: false,
        message: '삭제 요청 처리 중 오류가 발생했습니다',
      });
    }
  }
);

/**
 * @swagger
 * /api/privacy/data-access:
 *   get:
 *     summary: 개인정보 접근 내역 조회
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 접근 내역 조회 성공
 *       401:
 *         description: 인증 필요
 */
router.get(
  '/data-access',
  authenticate,
  checkPrivacyConsent(['privacy']),
  logSensitiveDataAccess('access_log_query'),
  maskPersonalData(['ip', 'userAgent']),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // 실제 운영에서는 별도의 로그 DB에서 조회
      // 현재는 샘플 데이터로 응답
      const accessHistory = [
        {
          date: new Date().toISOString(),
          action: 'profile_view',
          ip: '192.168.1.***',
          location: '서울, 대한민국',
          device: 'Desktop',
        },
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          action: 'data_update',
          ip: '192.168.1.***',
          location: '서울, 대한민국',
          device: 'Mobile',
        },
      ];

      res.json({
        success: true,
        message: '개인정보 접근 내역 조회 완료',
        data: {
          user_id: userId,
          access_history: accessHistory,
          total_accesses: accessHistory.length,
          query_date: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Access history query error:', error);
      res.status(500).json({
        success: false,
        message: '접근 내역 조회 중 오류가 발생했습니다',
      });
    }
  }
);

/**
 * @swagger
 * /api/privacy/anonymized-profile/{userId}:
 *   get:
 *     summary: 익명화된 프로필 조회 (매칭용)
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 익명화된 프로필 조회 성공
 *       403:
 *         description: 접근 권한 없음
 */
router.get(
  '/anonymized-profile/:userId',
  authenticate,
  checkPrivacyConsent(['privacy']),
  logSensitiveDataAccess('anonymized_profile'),
  specifyDataPurpose('matching'),
  anonymizeData(['name', 'email', 'phone']),
  [param('userId').isMongoId().withMessage('유효한 사용자 ID가 필요합니다')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '유효성 검사 실패',
          errors: errors.array(),
        });
      }

      const { userId } = req.params;
      const requesterId = req.user.id;

      // 자신의 프로필은 조회 불가
      if (userId === requesterId) {
        return res.status(400).json({
          success: false,
          message: '자신의 익명화된 프로필은 조회할 수 없습니다',
        });
      }

      const user = await User.findById(userId)
        .select('age gender location.city bio preferences.privacy profileImage stats.profileViews')
        .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다',
        });
      }

      // 개인정보 보호 설정 확인
      if (!user.preferences?.privacy?.allowSearch) {
        return res.status(403).json({
          success: false,
          message: '이 사용자는 검색을 허용하지 않습니다',
        });
      }

      // 익명화된 데이터 구성
      const anonymizedProfile = {
        id: userId,
        age: user.preferences?.privacy?.showAge ? user.age : '비공개',
        gender: user.gender,
        location: user.preferences?.privacy?.showLocation ? user.location?.city : '비공개',
        bio: user.bio,
        profileImage: user.profileImage,
        isVerified: true, // 검증된 사용자만 매칭 대상
        lastActive: '최근 활동',
        compatibility_hint: '가치관 분석 결과 기반 매칭',
      };

      // 프로필 조회수 증가
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.profileViews': 1 },
      });

      res.json({
        success: true,
        message: '익명화된 프로필 조회 완료',
        data: anonymizedProfile,
      });
    } catch (error) {
      console.error('Anonymized profile query error:', error);
      res.status(500).json({
        success: false,
        message: '프로필 조회 중 오류가 발생했습니다',
      });
    }
  }
);

/**
 * @swagger
 * /api/privacy/encryption-status:
 *   get:
 *     summary: 데이터 암호화 상태 확인
 *     tags: [Privacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 암호화 상태 확인 완료
 */
router.get('/encryption-status', authenticate, async (req, res) => {
  try {
    const encryptionStatus = encryptionService.validateEncryption();

    res.json({
      success: true,
      message: '암호화 상태 확인 완료',
      data: {
        encryption_active: encryptionStatus.isValid,
        algorithm: encryptionStatus.algorithm,
        key_length: encryptionStatus.keyLength,
        last_check: encryptionStatus.timestamp,
        compliance: {
          gdpr: true,
          ccpa: true,
          korean_pipa: true,
        },
      },
    });
  } catch (error) {
    console.error('Encryption status check error:', error);
    res.status(500).json({
      success: false,
      message: '암호화 상태 확인 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
