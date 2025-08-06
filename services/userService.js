const BaseService = require('./baseService');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { createRLSQuery } = require('./rlsQueryBuilder');

/**
 * User Service
 * 사용자 관련 비즈니스 로직 및 RLS 보안 처리
 */
class UserService extends BaseService {
  constructor(rlsContext = null) {
    super(User, rlsContext);
  }

  // 사용자 프로필 조회 (매칭된 사용자 포함)
  async getUserProfile(userId, options = {}) {
    try {
      const { includePrivate = false } = options;

      // 본인 프로필 조회인지 확인
      const isOwnProfile = this.rlsContext?.userId === userId;

      // 매칭된 사용자인지 확인
      const canViewProfile = isOwnProfile || 
                            this.rlsContext?.isAdmin() ||
                            await this.canViewUserProfile(userId);

      if (!canViewProfile) {
        throw new Error('프로필 조회 권한이 없습니다.');
      }

      // 조회 필드 설정
      let selectFields = '-password -emailVerificationToken -passwordResetToken';
      
      if (!isOwnProfile && !this.rlsContext?.isAdmin()) {
        // 다른 사용자의 프로필인 경우 민감한 정보 제외
        selectFields += ' -email -phone -socialProviders -occupation.income';
      }

      const user = await this.findById(userId, {
        select: selectFields,
        populate: [
          {
            path: 'stats',
            select: 'profileViews matchesCount conversationsCount'
          }
        ]
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 프로필 완성도 계산
      const profileCompleteness = user.calculateProfileCompleteness();
      
      return {
        ...user.toObject(),
        profileCompleteness,
        isOwnProfile
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  }

  // 매칭 가능한 사용자 목록 조회 (시스템 권한 필요)
  async getMatchableUsers(currentUserId, options = {}) {
    try {
      // 시스템 권한으로 실행 (매칭 알고리즘용)
      return await this.executeAsSystem(async () => {
        const {
          ageRange = { min: 40, max: 70 },
          maxDistance = 50,
          genderPreference = 'both',
          excludeUserIds = [],
          limit = 100
        } = options;

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
          throw new Error('현재 사용자를 찾을 수 없습니다.');
        }

        // 기본 필터 조건
        const baseConditions = {
          _id: { $ne: currentUserId }, // 본인 제외
          isActive: true,
          isVerified: true,
          isProfileComplete: true,
        };

        // 제외할 사용자 ID 추가
        if (excludeUserIds.length > 0) {
          baseConditions._id.$nin = excludeUserIds;
        }

        // 나이 필터
        const ageRangeValues = [];
        if (ageRange.min <= 45) ageRangeValues.push('40-45');
        if (ageRange.min <= 50 && ageRange.max >= 46) ageRangeValues.push('46-50');
        if (ageRange.min <= 55 && ageRange.max >= 51) ageRangeValues.push('51-55');
        if (ageRange.min <= 60 && ageRange.max >= 56) ageRangeValues.push('56-60');
        if (ageRange.max >= 60) ageRangeValues.push('60+');

        if (ageRangeValues.length > 0) {
          baseConditions.age = { $in: ageRangeValues };
        }

        // 성별 필터
        if (genderPreference !== 'both') {
          baseConditions.gender = genderPreference;
        }

        // 지역 필터 (거리 기반)
        if (currentUser.location?.coordinates && maxDistance) {
          baseConditions['location.coordinates'] = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: currentUser.location.coordinates
              },
              $maxDistance: maxDistance * 1000 // km to meters
            }
          };
        }

        const users = await User.find(baseConditions)
          .select('-password -email -phone -socialProviders -occupation.income')
          .limit(limit)
          .lean();

        return users;
      });
    } catch (error) {
      console.error('Error in getMatchableUsers:', error);
      throw error;
    }
  }

  // 사용자 검색 (관리자용)
  async searchUsers(searchTerm, options = {}) {
    try {
      if (!this.rlsContext?.isAdmin()) {
        throw new Error('관리자 권한이 필요합니다.');
      }

      const {
        page = 1,
        limit = 20,
        filters = {}
      } = options;

      const searchFields = ['name', 'email'];
      
      // 추가 필터 적용
      const conditions = {};
      if (filters.isActive !== undefined) {
        conditions.isActive = filters.isActive;
      }
      if (filters.isVerified !== undefined) {
        conditions.isVerified = filters.isVerified;
      }
      if (filters.age) {
        conditions.age = filters.age;
      }

      const results = await this.search(searchTerm, searchFields, {
        page,
        limit,
        additionalConditions: conditions,
        select: '-password',
        populate: ['stats']
      });

      return results;
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  // 프로필 업데이트
  async updateProfile(userId, updateData) {
    try {
      // 본인 프로필만 수정 가능 (관리자 제외)
      if (!this.rlsContext?.isAdmin() && this.rlsContext?.userId !== userId) {
        throw new Error('프로필 수정 권한이 없습니다.');
      }

      // 업데이트 불가능한 필드 제거
      const restrictedFields = [
        '_id', 
        'email', 
        'password', 
        'isVerified', 
        'emailVerificationToken',
        'passwordResetToken',
        'role',
        'stats'
      ];

      restrictedFields.forEach(field => {
        delete updateData[field];
      });

      const updatedUser = await this.updateById(userId, updateData);

      // 프로필 완성도 재계산
      const profileCompleteness = updatedUser.calculateProfileCompleteness();
      
      if (profileCompleteness >= 80 && !updatedUser.isProfileComplete) {
        await this.updateById(userId, { isProfileComplete: true });
      }

      return updatedUser;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  // 비밀번호 변경
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // 본인만 비밀번호 변경 가능
      if (this.rlsContext?.userId !== userId) {
        throw new Error('비밀번호 변경 권한이 없습니다.');
      }

      // 비밀번호가 포함된 사용자 정보 조회
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 현재 비밀번호 확인
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      }

      // 새 비밀번호 검증
      if (newPassword.length < 8) {
        throw new Error('새 비밀번호는 최소 8자 이상이어야 합니다.');
      }

      // 비밀번호 업데이트 (해싱은 모델의 pre-save 훅에서 처리)
      user.password = newPassword;
      user.passwordChangedAt = new Date();
      
      await user.save();

      return { message: '비밀번호가 성공적으로 변경되었습니다.' };
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  }

  // 계정 비활성화 (소프트 삭제)
  async deactivateAccount(userId, reason = '') {
    try {
      // 본인 계정만 비활성화 가능 (관리자 제외)
      if (!this.rlsContext?.isAdmin() && this.rlsContext?.userId !== userId) {
        throw new Error('계정 비활성화 권한이 없습니다.');
      }

      const updatedUser = await this.updateById(userId, {
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason
      });

      // 관련 데이터 정리 (비동기)
      this.cleanupUserData(userId).catch(error => {
        console.error('Error cleaning up user data:', error);
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in deactivateAccount:', error);
      throw error;
    }
  }

  // 계정 재활성화
  async reactivateAccount(userId) {
    try {
      if (!this.rlsContext?.isAdmin()) {
        throw new Error('관리자 권한이 필요합니다.');
      }

      const updatedUser = await this.updateById(userId, {
        isActive: true,
        reactivatedAt: new Date(),
        $unset: { 
          deactivatedAt: 1, 
          deactivationReason: 1 
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in reactivateAccount:', error);
      throw error;
    }
  }

  // 사용자 통계 조회
  async getUserStats(userId) {
    try {
      const user = await this.getUserProfile(userId);
      
      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 매치 통계
      const Match = require('../models/Match');
      const matchStats = await Match.aggregate([
        {
          $match: {
            $or: [{ user1: userId }, { user2: userId }]
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // 대화 통계
      const Conversation = require('../models/Conversation');
      const conversationStats = await Conversation.aggregate([
        {
          $match: {
            participants: userId
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        profile: {
          completeness: user.profileCompleteness,
          isVerified: user.isVerified,
          memberSince: user.createdAt
        },
        matches: matchStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        conversations: conversationStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        lastActive: user.lastActive
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }

  // 프로필 조회 권한 확인
  async canViewUserProfile(targetUserId) {
    try {
      if (!this.rlsContext?.userId) return false;
      if (this.rlsContext.isAdmin()) return true;
      if (this.rlsContext.userId === targetUserId) return true;

      // 상호 매치된 사용자인지 확인
      const Match = require('../models/Match');
      const mutualMatch = await Match.findOne({
        $or: [
          { user1: this.rlsContext.userId, user2: targetUserId },
          { user1: targetUserId, user2: this.rlsContext.userId }
        ],
        status: 'mutual_match'
      });

      return !!mutualMatch;
    } catch (error) {
      console.error('Error in canViewUserProfile:', error);
      return false;
    }
  }

  // 사용자 데이터 정리 (비활성화 시)
  async cleanupUserData(userId) {
    try {
      // 진행 중인 매치 만료 처리
      const Match = require('../models/Match');
      await Match.updateMany(
        {
          $or: [{ user1: userId }, { user2: userId }],
          status: { $in: ['pending', 'user1_liked', 'user2_liked'] }
        },
        {
          status: 'expired',
          endedAt: new Date()
        }
      );

      // 대화 아카이빙
      const Conversation = require('../models/Conversation');
      await Conversation.updateMany(
        {
          participants: userId,
          status: 'active'
        },
        {
          status: 'archived',
          archivedAt: new Date()
        }
      );

      console.log(`User data cleanup completed for user ${userId}`);
    } catch (error) {
      console.error('Error in cleanupUserData:', error);
    }
  }

  // 소프트 삭제 사용 (계정 비활성화)
  shouldUseSoftDelete(document) {
    return true; // 사용자는 항상 소프트 삭제
  }

  // 생성 후처리
  async postprocessCreate(user) {
    try {
      // 환영 이메일 발송 (비동기)
      if (process.env.SEND_WELCOME_EMAIL === 'true') {
        const emailService = require('./emailService');
        emailService.sendWelcomeEmail(user.email, user.name).catch(error => {
          console.error('Failed to send welcome email:', error);
        });
      }

      // 사용자 통계 초기화
      user.stats = {
        profileViews: 0,
        matchesCount: 0,
        conversationsCount: 0,
        successfulMeetings: 0
      };

      await user.save();
    } catch (error) {
      console.error('Error in user postprocessCreate:', error);
    }
  }

  // 업데이트 후처리
  async postprocessUpdate(updatedUser, originalUser) {
    try {
      // 프로필 이미지가 변경된 경우 이전 이미지 정리
      if (originalUser.profileImage && 
          updatedUser.profileImage !== originalUser.profileImage) {
        
        const imageService = require('./imageService');
        imageService.deleteImage(originalUser.profileImage).catch(error => {
          console.error('Failed to delete old profile image:', error);
        });
      }

      // 위치 정보가 변경된 경우 좌표 업데이트
      if (updatedUser.location?.city && 
          (!originalUser.location?.coordinates || 
           updatedUser.location.city !== originalUser.location?.city)) {
        
        const geocodingService = require('./geocodingService');
        geocodingService.updateUserCoordinates(updatedUser._id).catch(error => {
          console.error('Failed to update user coordinates:', error);
        });
      }
    } catch (error) {
      console.error('Error in user postprocessUpdate:', error);
    }
  }
}

module.exports = UserService;