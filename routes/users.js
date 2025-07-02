const express = require('express');
const User = require('../models/User');
const { authenticate, requireVerified, requireOwnership } = require('../middleware/auth');
const { validateProfileUpdate, validateUserSettings, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: 현재 사용자 프로필 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    const profileCompleteness = user.calculateProfileCompleteness();
    
    res.json({
      success: true,
      data: {
        profile: {
          id: user._id,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          phone: user.phone,
          location: user.location,
          profileImage: user.profileImage,
          bio: user.bio,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete,
          lastActive: user.lastActive,
          preferences: user.preferences,
          stats: user.stats,
          profileCompleteness,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: 프로필 업데이트
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   city:
 *                     type: string
 *                   district:
 *                     type: string
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       200:
 *         description: 프로필 업데이트 성공
 */
router.put('/profile', authenticate, validateProfileUpdate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    const { name, bio, phone, location } = req.body;
    
    if (name) {user.name = name;}
    if (bio !== undefined) {user.bio = bio;}
    if (phone !== undefined) {user.phone = phone;}
    if (location) {
      user.location = { ...user.location, ...location };
    }
    
    // 프로필 완성도 재계산
    const completeness = user.calculateProfileCompleteness();
    user.isProfileComplete = completeness >= 80;
    
    await user.save();
    
    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다.',
      data: {
        profile: {
          id: user._id,
          name: user.name,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          isProfileComplete: user.isProfileComplete,
          profileCompleteness: completeness,
          updatedAt: user.updatedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: '프로필 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/settings:
 *   get:
 *     summary: 사용자 설정 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 설정 조회 성공
 */
router.get('/settings', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        settings: user.preferences
      }
    });
    
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: '설정 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/settings:
 *   put:
 *     summary: 사용자 설정 업데이트
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *               privacy:
 *                 type: object
 *               matching:
 *                 type: object
 *     responses:
 *       200:
 *         description: 설정 업데이트 성공
 */
router.put('/settings', authenticate, validateUserSettings, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const { notifications, privacy, matching } = req.body;
    
    if (notifications) {
      user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    }
    
    if (privacy) {
      user.preferences.privacy = { ...user.preferences.privacy, ...privacy };
    }
    
    if (matching) {
      // 나이 범위 검증
      if (matching.ageRange) {
        const { min, max } = matching.ageRange;
        if (min && max && min > max) {
          return res.status(400).json({
            success: false,
            error: '최소 나이는 최대 나이보다 작아야 합니다.'
          });
        }
      }
      
      user.preferences.matching = { ...user.preferences.matching, ...matching };
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: '설정이 업데이트되었습니다.',
      data: {
        settings: user.preferences
      }
    });
    
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: '설정 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 특정 사용자 프로필 조회 (공개 정보만)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 사용자 프로필 조회 성공
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/:id', authenticate, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 본인이 아닌 경우 공개 정보만 반환
    const isOwnProfile = user._id.toString() === req.user._id.toString();
    
    const publicProfile = {
      id: user._id,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      isOnline: user.isOnline
    };
    
    // 프라이버시 설정에 따라 정보 공개
    if (user.preferences.privacy.showAge) {
      publicProfile.age = user.age;
    }
    
    if (user.preferences.privacy.showLocation && user.location) {
      publicProfile.location = {
        city: user.location.city,
        district: user.location.district
      };
    }
    
    // 본인인 경우 모든 정보 반환
    if (isOwnProfile) {
      publicProfile.email = user.email;
      publicProfile.phone = user.phone;
      publicProfile.preferences = user.preferences;
      publicProfile.stats = user.stats;
      publicProfile.lastActive = user.lastActive;
    }
    
    // 프로필 조회수 증가 (본인이 아닌 경우)
    if (!isOwnProfile) {
      user.stats.profileViews += 1;
      await user.save({ validateBeforeSave: false });
    }
    
    res.json({
      success: true,
      data: {
        profile: publicProfile
      }
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 프로필 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: 사용자 검색
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: ageRange
 *         schema:
 *           type: string
 *         description: "연령대 (예: 40-45)"
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *         description: "성별"
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: 도시
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
 *         description: 검색 결과
 */
router.get('/search', authenticate, requireVerified, validatePagination, async (req, res) => {
  try {
    const { q, ageRange, gender, city, page = 1, limit = 20 } = req.query;
    
    // 검색 쿼리 구성
    const searchQuery = {
      isActive: true,
      isVerified: true,
      _id: { $ne: req.user._id }, // 본인 제외
      'preferences.privacy.allowSearch': true // 검색 허용한 사용자만
    };
    
    // 검색어가 있는 경우 이름이나 소개에서 검색
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }
    
    // 필터 적용
    if (ageRange) {
      searchQuery.age = ageRange;
    }
    
    if (gender) {
      searchQuery.gender = gender;
    }
    
    if (city) {
      searchQuery['location.city'] = { $regex: city, $options: 'i' };
    }
    
    // 페이지네이션 설정
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 검색 실행
    const [users, total] = await Promise.all([
      User.find(searchQuery)
        .select('name age gender location profileImage bio lastActive')
        .sort({ lastActive: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(searchQuery)
    ]);
    
    // 결과에서 프라이버시 설정 적용
    const filteredUsers = users.map(user => {
      const publicInfo = {
        id: user._id,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        isOnline: user.isOnline
      };
      
      if (user.preferences?.privacy?.showAge !== false) {
        publicInfo.age = user.age;
      }
      
      if (user.preferences?.privacy?.showLocation !== false && user.location) {
        publicInfo.location = {
          city: user.location.city,
          district: user.location.district
        };
      }
      
      return publicInfo;
    });
    
    res.json({
      success: true,
      data: {
        users: filteredUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 검색 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/nearby:
 *   get:
 *     summary: 근처 사용자 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: 위도
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: 경도
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: 반경 (km)
 *     responses:
 *       200:
 *         description: 근처 사용자 목록
 */
router.get('/nearby', authenticate, requireVerified, async (req, res) => {
  try {
    const { lat, lng, radius = 30 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: '위치 정보(위도, 경도)가 필요합니다.'
      });
    }
    
    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const maxDistance = parseInt(radius) * 1000; // km를 m로 변환
    
    const nearbyUsers = await User.findNearbyUsers(coordinates, maxDistance);
    
    // 본인 제외 및 프라이버시 필터링
    const filteredUsers = nearbyUsers
      .filter(user => 
        user._id.toString() !== req.user._id.toString() &&
        user.preferences?.privacy?.allowSearch !== false
      )
      .map(user => ({
        id: user._id,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        age: user.preferences?.privacy?.showAge !== false ? user.age : undefined,
        location: user.preferences?.privacy?.showLocation !== false ? {
          city: user.location?.city,
          district: user.location?.district
        } : undefined,
        isOnline: user.isOnline
      }));
    
    res.json({
      success: true,
      data: {
        users: filteredUsers,
        total: filteredUsers.length,
        radius: parseInt(radius)
      }
    });
    
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      success: false,
      error: '근처 사용자 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: 사용자 통계 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 통계
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        stats: user.stats,
        profileCompleteness: user.calculateProfileCompleteness(),
        memberSince: user.createdAt,
        lastActive: user.lastActive
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: '통계 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: 계정 삭제
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: 계정 삭제 성공
 */
router.delete('/delete', authenticate, async (req, res) => {
  try {
    const { currentPassword, reason } = req.body;
    
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: '비밀번호 확인이 필요합니다.'
      });
    }
    
    // 비밀번호 확인
    const user = await User.findById(req.user._id).select('+password');
    const isValidPassword = await user.comparePassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: '비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 소프트 삭제 (실제로는 비활성화)
    user.isActive = false;
    user.deletedAt = new Date();
    user.deletionReason = reason || 'User requested deletion';
    
    await user.save({ validateBeforeSave: false });
    
    // TODO: 관련 데이터 정리 (매치, 대화 등)
    
    res.json({
      success: true,
      message: '계정이 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: '계정 삭제 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;