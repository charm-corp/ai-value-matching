const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const imageService = require('../services/imageService');
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'temp-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const validation = imageService.validateFile(file);
    if (validation.valid) {
      cb(null, true);
    } else {
      cb(new Error(validation.errors.join(', ')), false);
    }
  }
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
router.post('/upload-image', authenticate, upload.single('profileImage'), validateFileUpload('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '프로필 이미지가 업로드되지 않았습니다.'
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
        metadata: processResult.metadata
      }
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
      error: error.message || '프로필 이미지 업로드 중 오류가 발생했습니다.'
    });
  }
});

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
      isCompleted: true 
    });
    
    const profileCompleteness = user.calculateProfileCompleteness();
    
    // 완성도 체크리스트
    const checklist = {
      basicInfo: {
        completed: !!(user.name && user.age && user.gender),
        items: {
          name: !!user.name,
          age: !!user.age,
          gender: !!user.gender
        }
      },
      contactInfo: {
        completed: !!(user.email && user.isVerified),
        items: {
          email: !!user.email,
          emailVerified: user.isVerified,
          phone: !!user.phone
        }
      },
      profileDetails: {
        completed: !!(user.bio && user.profileImage && user.location?.city),
        items: {
          bio: !!user.bio,
          profileImage: !!user.profileImage,
          location: !!(user.location?.city)
        }
      },
      valuesAssessment: {
        completed: !!valuesAssessment,
        items: {
          assessmentComplete: !!valuesAssessment
        }
      },
      preferences: {
        completed: true, // 기본값이 설정되어 있으므로 항상 완성
        items: {
          matchingPreferences: true,
          privacySettings: true,
          notifications: true
        }
      }
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
        action: 'complete_basic_info'
      });
    }
    
    if (!checklist.contactInfo.items.emailVerified) {
      nextSteps.push({
        priority: 'high',
        title: '이메일 인증',
        description: '이메일 인증을 완료해주세요.',
        action: 'verify_email'
      });
    }
    
    if (!checklist.profileDetails.completed) {
      if (!user.profileImage) {
        nextSteps.push({
          priority: 'medium',
          title: '프로필 사진 업로드',
          description: '프로필 사진을 추가하여 매력을 어필해보세요.',
          action: 'upload_photo'
        });
      }
      
      if (!user.bio) {
        nextSteps.push({
          priority: 'medium',
          title: '자기소개 작성',
          description: '자신을 소개하는 글을 작성해보세요.',
          action: 'write_bio'
        });
      }
      
      if (!user.location?.city) {
        nextSteps.push({
          priority: 'low',
          title: '위치 정보 추가',
          description: '거주 지역 정보를 추가해주세요.',
          action: 'add_location'
        });
      }
    }
    
    if (!checklist.valuesAssessment.completed) {
      nextSteps.push({
        priority: 'high',
        title: '가치관 평가 완료',
        description: '정확한 매칭을 위해 가치관 평가를 완료해주세요.',
        action: 'complete_assessment'
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
        canStartMatching: user.isVerified && valuesAssessment && profileCompleteness >= 70
      }
    });
    
  } catch (error) {
    console.error('Get profile completeness error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 완성도 조회 중 오류가 발생했습니다.'
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
          allowSearch: user.preferences.privacy.allowSearch
        }
      }
    });
    
  } catch (error) {
    console.error('Get profile visibility error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 공개 설정 조회 중 오류가 발생했습니다.'
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
        visibility: user.preferences.privacy
      }
    });
    
  } catch (error) {
    console.error('Update profile visibility error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 공개 설정 업데이트 중 오류가 발생했습니다.'
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
      isCompleted: true 
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
        impact: 'high'
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
        impact: 'medium'
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
        impact: 'high'
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
        impact: 'low'
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
        impact: 'medium'
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
        impact: 'medium'
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
        impact: 'low'
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
        profileScore: user.calculateProfileCompleteness()
      }
    });
    
  } catch (error) {
    console.error('Get profile recommendations error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 추천사항 조회 중 오류가 발생했습니다.'
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
        error: '삭제할 프로필 이미지가 없습니다.'
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
      message: '프로필 이미지가 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 이미지 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;