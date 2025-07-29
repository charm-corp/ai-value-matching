const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const imageService = require('../services/imageService');
const avatarService = require('../services/avatarService');
const { authenticate, requireVerified } = require('../middleware/auth');
const { validateFileUpload } = require('../middleware/validation');

const router = express.Router();

// 임시 파일 업로드 설정 (이미지 서비스에서 처리)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');

    // 임시 디렉토리 생성
    fs.mkdir(tempDir, { recursive: true })
      .then(() => cb(null, tempDir))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'temp-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const validation = imageService.validateFile(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.errors.join(', ')), false);
    }
  },
});

/**
 * @swagger
 * /api/profile/upload-image:
 *   post:
 *     summary: 프로필 이미지 업로드
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: 프로필 이미지 파일
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 *       400:
 *         description: 잘못된 파일
 */
router.post(
  '/upload-image',
  authenticate,
  upload.single('profileImage'),
  validateFileUpload('profileImage'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: '프로필 이미지가 업로드되지 않았습니다.',
        });
      }

      const user = await User.findById(req.user._id);

      // 기존 프로필 이미지 삭제 (있는 경우)
      if (user.profileImages) {
        await imageService.deleteProfileImages(user._id, user.profileImages);
      }

      // 이미지 처리 (여러 크기 생성)
      const fileName = imageService.generateFileName(req.file.originalname, user._id);
      const processResult = await imageService.processProfileImage(
        req.file.path,
        fileName,
        user._id
      );

      if (!processResult.success) {
        throw new Error('이미지 처리에 실패했습니다.');
      }

      // 사용자 프로필에 이미지 정보 저장
      user.profileImages = processResult.images;
      user.profileImage = processResult.images.medium.path; // 기본값은 medium 크기
      user.profileImageMetadata = processResult.metadata;

      await user.save();

      res.json({
        success: true,
        message: '프로필 이미지가 업로드되었습니다.',
        data: {
          profileImage: user.profileImage,
          profileImages: user.profileImages,
          metadata: processResult.metadata,
        },
      });
    } catch (error) {
      console.error('Profile image upload error:', error);

      // 임시 파일 삭제 (오류 발생 시)
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (deleteError) {
          console.error('Failed to delete temp file:', deleteError);
        }
      }

      res.status(500).json({
        success: false,
        error: error.message || '프로필 이미지 업로드 중 오류가 발생했습니다.',
      });
    }
  }
);

/**
 * @swagger
 * /api/profile/complete:
 *   get:
 *     summary: 프로필 완성도 조회
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 완성도 조회 성공
 */
router.get('/complete', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const valuesAssessment = await ValuesAssessment.findOne({
      userId: req.user._id,
      isCompleted: true,
    });

    const profileCompleteness = user.calculateProfileCompleteness();

    // 완성도 체크리스트
    const checklist = {
      basicInfo: {
        completed: !!(user.name && user.age && user.gender),
        items: {
          name: !!user.name,
          age: !!user.age,
          gender: !!user.gender,
        },
      },
      contactInfo: {
        completed: !!(user.email && user.isVerified),
        items: {
          email: !!user.email,
          emailVerified: user.isVerified,
          phone: !!user.phone,
        },
      },
      profileDetails: {
        completed: !!(user.bio && user.profileImage && user.location?.city),
        items: {
          bio: !!user.bio,
          profileImage: !!user.profileImage,
          location: !!user.location?.city,
        },
      },
      valuesAssessment: {
        completed: !!valuesAssessment,
        items: {
          assessmentComplete: !!valuesAssessment,
        },
      },
      preferences: {
        completed: true, // 기본값이 설정되어 있으므로 항상 완성
        items: {
          matchingPreferences: true,
          privacySettings: true,
          notifications: true,
        },
      },
    };

    // 전체 완성도 계산
    const totalSections = Object.keys(checklist).length;
    const completedSections = Object.values(checklist).filter(section => section.completed).length;
    const overallCompleteness = Math.round((completedSections / totalSections) * 100);

    // 다음 단계 추천
    const nextSteps = [];

    if (!checklist.basicInfo.completed) {
      nextSteps.push({
        priority: 'high',
        title: '기본 정보 완성',
        description: '이름, 나이, 성별 정보를 입력해주세요.',
        action: 'complete_basic_info',
      });
    }

    if (!checklist.contactInfo.items.emailVerified) {
      nextSteps.push({
        priority: 'high',
        title: '이메일 인증',
        description: '이메일 인증을 완료해주세요.',
        action: 'verify_email',
      });
    }

    if (!checklist.profileDetails.completed) {
      if (!user.profileImage) {
        nextSteps.push({
          priority: 'medium',
          title: '프로필 사진 업로드',
          description: '프로필 사진을 추가하여 매력을 어필해보세요.',
          action: 'upload_photo',
        });
      }

      if (!user.bio) {
        nextSteps.push({
          priority: 'medium',
          title: '자기소개 작성',
          description: '자신을 소개하는 글을 작성해보세요.',
          action: 'write_bio',
        });
      }

      if (!user.location?.city) {
        nextSteps.push({
          priority: 'low',
          title: '위치 정보 추가',
          description: '거주 지역 정보를 추가해주세요.',
          action: 'add_location',
        });
      }
    }

    if (!checklist.valuesAssessment.completed) {
      nextSteps.push({
        priority: 'high',
        title: '가치관 평가 완료',
        description: '정확한 매칭을 위해 가치관 평가를 완료해주세요.',
        action: 'complete_assessment',
      });
    }

    res.json({
      success: true,
      data: {
        profileCompleteness,
        overallCompleteness,
        checklist,
        nextSteps,
        isProfileComplete: user.isProfileComplete,
        canStartMatching: user.isVerified && valuesAssessment && profileCompleteness >= 70,
      },
    });
  } catch (error) {
    console.error('Get profile completeness error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 완성도 조회 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/visibility:
 *   get:
 *     summary: 프로필 공개 설정 조회
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 공개 설정 조회 성공
 */
router.get('/visibility', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        visibility: user.preferences.privacy,
        currentSettings: {
          showAge: user.preferences.privacy.showAge,
          showLocation: user.preferences.privacy.showLocation,
          allowSearch: user.preferences.privacy.allowSearch,
        },
      },
    });
  } catch (error) {
    console.error('Get profile visibility error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 공개 설정 조회 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/visibility:
 *   put:
 *     summary: 프로필 공개 설정 업데이트
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showAge:
 *                 type: boolean
 *               showLocation:
 *                 type: boolean
 *               allowSearch:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 공개 설정 업데이트 성공
 */
router.put('/visibility', authenticate, async (req, res) => {
  try {
    const { showAge, showLocation, allowSearch } = req.body;

    const user = await User.findById(req.user._id);

    if (showAge !== undefined) {
      user.preferences.privacy.showAge = showAge;
    }

    if (showLocation !== undefined) {
      user.preferences.privacy.showLocation = showLocation;
    }

    if (allowSearch !== undefined) {
      user.preferences.privacy.allowSearch = allowSearch;
    }

    await user.save();

    res.json({
      success: true,
      message: '프로필 공개 설정이 업데이트되었습니다.',
      data: {
        visibility: user.preferences.privacy,
      },
    });
  } catch (error) {
    console.error('Update profile visibility error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 공개 설정 업데이트 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/recommendations:
 *   get:
 *     summary: 프로필 개선 추천사항 조회
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 추천사항 조회 성공
 */
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const valuesAssessment = await ValuesAssessment.findOne({
      userId: req.user._id,
      isCompleted: true,
    });

    const recommendations = [];

    // 프로필 사진 관련 추천
    if (!user.profileImage) {
      recommendations.push({
        type: 'profile_image',
        priority: 'high',
        title: '프로필 사진 추가',
        description: '프로필 사진이 있는 사용자는 매치 확률이 3배 높습니다.',
        actionText: '사진 업로드하기',
        impact: 'high',
      });
    }

    // 자기소개 관련 추천
    if (!user.bio || user.bio.length < 50) {
      recommendations.push({
        type: 'bio',
        priority: 'medium',
        title: '자기소개 보완',
        description: '50자 이상의 자기소개로 더 많은 관심을 받아보세요.',
        actionText: '자기소개 작성하기',
        impact: 'medium',
      });
    }

    // 가치관 평가 관련 추천
    if (!valuesAssessment) {
      recommendations.push({
        type: 'values_assessment',
        priority: 'high',
        title: '가치관 평가 완료',
        description: '가치관 평가를 통해 더 정확한 매칭을 받을 수 있습니다.',
        actionText: '가치관 평가 시작하기',
        impact: 'high',
      });
    }

    // 연락처 정보 관련 추천
    if (!user.phone) {
      recommendations.push({
        type: 'contact_info',
        priority: 'low',
        title: '연락처 정보 추가',
        description: '연락처 정보를 추가하여 프로필을 완성해보세요.',
        actionText: '연락처 추가하기',
        impact: 'low',
      });
    }

    // 위치 정보 관련 추천
    if (!user.location?.city) {
      recommendations.push({
        type: 'location',
        priority: 'medium',
        title: '위치 정보 추가',
        description: '거주 지역 정보로 근처의 매치를 찾아보세요.',
        actionText: '위치 정보 추가하기',
        impact: 'medium',
      });
    }

    // 프로필 활동성 기반 추천
    const daysSinceLastActive = Math.floor((Date.now() - user.lastActive) / (1000 * 60 * 60 * 24));

    if (daysSinceLastActive > 7) {
      recommendations.push({
        type: 'activity',
        priority: 'medium',
        title: '활동성 증대',
        description: '정기적인 활동으로 더 많은 매치 기회를 얻으세요.',
        actionText: '매칭 시작하기',
        impact: 'medium',
      });
    }

    // 매칭 설정 최적화 추천
    if (user.preferences.matching.distance < 20) {
      recommendations.push({
        type: 'matching_settings',
        priority: 'low',
        title: '매칭 범위 확대',
        description: '매칭 거리를 늘려 더 많은 후보를 만나보세요.',
        actionText: '설정 변경하기',
        impact: 'low',
      });
    }

    // 우선순위별 정렬
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    res.json({
      success: true,
      data: {
        recommendations: recommendations.slice(0, 5), // 최대 5개까지
        totalRecommendations: recommendations.length,
        profileScore: user.calculateProfileCompleteness(),
      },
    });
  } catch (error) {
    console.error('Get profile recommendations error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 추천사항 조회 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/delete-image:
 *   delete:
 *     summary: 프로필 이미지 삭제
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 이미지 삭제 성공
 */
router.delete('/delete-image', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.profileImage) {
      return res.status(400).json({
        success: false,
        error: '삭제할 프로필 이미지가 없습니다.',
      });
    }

    // 파일 삭제
    try {
      const imagePath = path.join(__dirname, '..', user.profileImage);
      await fs.unlink(imagePath);
    } catch (error) {
      console.log('프로필 이미지 파일 삭제 실패:', error.message);
    }

    // DB에서 이미지 정보 제거
    user.profileImage = null;
    await user.save();

    res.json({
      success: true,
      message: '프로필 이미지가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 이미지 삭제 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/avatar-options:
 *   get:
 *     summary: 기본 아바타 옵션 조회 (4060세대 맞춤)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 아바타 옵션 조회 성공
 */
router.get('/avatar-options', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // 사용자 맞춤 추천 아바타
    const recommendedAvatar = avatarService.getRecommendedAvatar(user);

    // 성별별 아바타 목록
    const avatarsByGender = avatarService.getAvatarsByGender(user.gender || 'neutral');

    // 모든 아바타 옵션
    const allAvatars = avatarService.getAllAvatars();

    // 현재 이미지 상태
    const imageStatus = avatarService.getUserImageStatus(user);

    res.json({
      success: true,
      message: '아바타 옵션을 조회했습니다.',
      data: {
        currentStatus: imageStatus,
        recommended: recommendedAvatar,
        byGender: avatarsByGender,
        allOptions: allAvatars,
        tips: [
          '프로필 사진이 있으면 매칭 확률이 3배 증가해요!',
          '밝고 자연스러운 표정의 사진이 좋은 인상을 줍니다.',
          '얼굴이 잘 보이는 근거리 사진을 추천해요.',
          '배경이 깔끔한 사진이 더 전문적으로 보입니다.',
        ],
      },
    });
  } catch (error) {
    console.error('Avatar options error:', error);
    res.status(500).json({
      success: false,
      error: '아바타 옵션 조회 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/upload-guide:
 *   get:
 *     summary: 이미지 업로드 가이드 (4060세대 친화적)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 업로드 가이드 조회 성공
 */
router.get('/upload-guide', authenticate, async (req, res) => {
  try {
    const uploadGuide = {
      title: '프로필 사진 업로드 가이드',
      subtitle: '좋은 첫인상을 위한 사진 팁',

      requirements: {
        title: '📋 업로드 조건',
        items: [
          '파일 크기: 최대 5MB',
          '지원 형식: JPEG, PNG, WebP',
          '권장 크기: 800x800 픽셀 이상',
          '파일명: 한글, 영문, 숫자 가능',
        ],
      },

      tips: {
        title: '📸 좋은 사진 촬영 팁',
        good: [
          '✅ 밝은 곳에서 촬영하세요',
          '✅ 얼굴이 선명하게 나오도록 해주세요',
          '✅ 자연스러운 미소를 지어보세요',
          '✅ 깔끔한 배경을 선택하세요',
          '✅ 정면을 바라보는 각도가 좋아요',
        ],
        avoid: [
          '❌ 너무 어둡거나 밝은 곳 피하기',
          '❌ 흐리거나 화질이 낮은 사진',
          '❌ 과도한 필터나 보정',
          '❌ 여러 명이 함께 나온 사진',
          '❌ 얼굴이 가려진 사진',
        ],
      },

      benefits: {
        title: '🎯 프로필 사진의 효과',
        items: ['매칭 확률 3배 증가', '신뢰도 향상', '진정성 있는 첫인상', '더 많은 관심 받기'],
      },

      process: {
        title: '📱 업로드 과정',
        steps: ['1. 사진 선택하기', '2. 미리보기 확인', '3. 업로드 완료', '4. 자동 최적화 처리'],
      },

      safety: {
        title: '🔒 안전한 업로드',
        items: [
          '개인정보가 포함된 배경 제거',
          '위치 정보 노출 주의',
          '타인의 사진 사용 금지',
          '저작권 준수',
        ],
      },
    };

    res.json({
      success: true,
      message: '업로드 가이드를 조회했습니다.',
      data: uploadGuide,
    });
  } catch (error) {
    console.error('Upload guide error:', error);
    res.status(500).json({
      success: false,
      error: '업로드 가이드 조회 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/image-status:
 *   get:
 *     summary: 현재 프로필 이미지 상태 조회
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 이미지 상태 조회 성공
 */
router.get('/image-status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const imageStatus = avatarService.getUserImageStatus(user);

    // 추가 통계 정보
    const stats = {
      profileCompleteness: 0,
      viewsIncrease: imageStatus.hasCustomImage ? '300%' : '0%',
      lastUpdated: user.updatedAt,
      recommendations: [],
    };

    // 프로필 완성도 계산
    let completeness = 0;
    if (user.name) completeness += 20;
    if (user.age) completeness += 20;
    if (user.gender) completeness += 10;
    if (user.profileImage) completeness += 30;
    if (user.bio) completeness += 20;

    stats.profileCompleteness = completeness;

    // 맞춤 추천사항
    if (!imageStatus.hasCustomImage) {
      stats.recommendations.push({
        type: 'upload',
        title: '프로필 사진 업로드',
        description: '프로필 사진을 업로드하면 매칭 확률이 크게 향상됩니다.',
        priority: 'high',
      });
    }

    if (completeness < 80) {
      stats.recommendations.push({
        type: 'complete',
        title: '프로필 완성하기',
        description: '프로필을 더 자세히 작성해보세요.',
        priority: 'medium',
      });
    }

    res.json({
      success: true,
      message: '프로필 이미지 상태를 조회했습니다.',
      data: {
        ...imageStatus,
        statistics: stats,
        nextActions: [
          {
            action: 'upload_photo',
            title: '사진 업로드하기',
            description: '새로운 프로필 사진을 업로드합니다.',
            enabled: true,
          },
          {
            action: 'view_guide',
            title: '촬영 가이드 보기',
            description: '좋은 프로필 사진 촬영 팁을 확인합니다.',
            enabled: true,
          },
          {
            action: 'choose_avatar',
            title: '기본 아바타 선택',
            description: '임시로 기본 아바타를 선택합니다.',
            enabled: !imageStatus.hasCustomImage,
          },
        ],
      },
    });
  } catch (error) {
    console.error('Image status error:', error);
    res.status(500).json({
      success: false,
      error: '이미지 상태 조회 중 오류가 발생했습니다.',
    });
  }
});

/**
 * @swagger
 * /api/profile/set-avatar:
 *   post:
 *     summary: 기본 아바타 설정
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarPath
 *             properties:
 *               avatarPath:
 *                 type: string
 *                 description: 선택한 아바타 경로
 *     responses:
 *       200:
 *         description: 아바타 설정 성공
 */
router.post('/set-avatar', authenticate, async (req, res) => {
  try {
    const { avatarPath } = req.body;

    if (!avatarPath) {
      return res.status(400).json({
        success: false,
        error: '아바타 경로를 선택해주세요.',
      });
    }

    const user = await User.findById(req.user._id);

    // 기본 아바타 정보 설정 (실제 파일 업로드가 아닌 경우)
    user.profileImage = avatarPath; // 단일 경로로 설정
    user.profileImages = {
      thumbnail: { path: avatarPath },
      medium: { path: avatarPath },
      large: { path: avatarPath },
    };

    user.isProfileComplete = true; // 아바타 설정으로 프로필 완성도 향상
    await user.save();

    res.json({
      success: true,
      message: '기본 아바타가 설정되었습니다. 나중에 실제 사진으로 변경하실 수 있어요!',
      data: {
        profileImage: user.profileImage,
        profileImages: user.profileImages,
        suggestion: '실제 프로필 사진을 업로드하면 매칭 확률이 더욱 향상됩니다.',
      },
    });
  } catch (error) {
    console.error('Set avatar error:', error);
    res.status(500).json({
      success: false,
      error: '아바타 설정 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
