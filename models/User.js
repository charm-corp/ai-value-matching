const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { encryptionService } = require('../utils/encryption');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *         - age
 *       properties:
 *         _id:
 *           type: string
 *           description: 사용자 고유 ID
 *         email:
 *           type: string
 *           format: email
 *           description: 이메일 주소
 *         password:
 *           type: string
 *           format: password
 *           description: 비밀번호 (암호화됨)
 *         name:
 *           type: string
 *           description: 사용자 이름
 *         age:
 *           type: string
 *           enum: ['40-45', '46-50', '51-55', '56-60', '60+']
 *           description: 연령대
 *         gender:
 *           type: string
 *           enum: ['male', 'female', 'other']
 *           description: 성별
 *         location:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             district:
 *               type: string
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *         profileImage:
 *           type: string
 *           description: 프로필 이미지 URL
 *         isVerified:
 *           type: boolean
 *           description: 이메일 인증 여부
 *         isActive:
 *           type: boolean
 *           description: 계정 활성화 여부
 *         lastActive:
 *           type: string
 *           format: date-time
 *           description: 마지막 활동 시간
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일은 필수입니다'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일 주소를 입력해주세요']
  },
  
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다'],
    minlength: [8, '비밀번호는 최소 8자 이상이어야 합니다'],
    select: false // 기본적으로 password 필드는 조회시 제외
  },
  
  name: {
    type: String,
    required: [true, '이름은 필수입니다'],
    trim: true,
    maxlength: [50, '이름은 50자 이하여야 합니다']
  },
  
  age: {
    type: String,
    required: [true, '연령대는 필수입니다'],
    enum: {
      values: ['40-45', '46-50', '51-55', '56-60', '60+'],
      message: '유효한 연령대를 선택해주세요'
    }
  },
  
  gender: {
    type: String,
    enum: {
      values: ['male', 'female', 'other'],
      message: '유효한 성별을 선택해주세요'
    }
  },
  
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9-+().\s]+$/, '유효한 전화번호를 입력해주세요'],
    get: function(value) {
      return value ? encryptionService.decryptSensitive(value) : value;
    },
    set: function(value) {
      return value ? encryptionService.encryptSensitive(value) : value;
    }
  },
  
  location: {
    city: {
      type: String,
      trim: true,
      get: function(value) {
        return value ? encryptionService.decryptSensitive(value) : value;
      },
      set: function(value) {
        return value ? encryptionService.encryptSensitive(value) : value;
      }
    },
    district: {
      type: String,
      trim: true,
      get: function(value) {
        return value ? encryptionService.decryptSensitive(value) : value;
      },
      set: function(value) {
        return value ? encryptionService.encryptSensitive(value) : value;
      }
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  profileImage: {
    type: String,
    default: null
  },
  
  profileImages: {
    thumbnail: {
      path: String,
      filename: String,
      size: {
        width: Number,
        height: Number
      }
    },
    medium: {
      path: String,
      filename: String,
      size: {
        width: Number,
        height: Number
      }
    },
    large: {
      path: String,
      filename: String,
      size: {
        width: Number,
        height: Number
      }
    }
  },
  
  profileImageMetadata: {
    originalWidth: Number,
    originalHeight: Number,
    originalFormat: String,
    processedAt: Date
  },
  
  bio: {
    type: String,
    maxlength: [500, '자기소개는 500자 이하여야 합니다'],
    trim: true
  },
  
  // 중장년층 특화 정보
  maritalStatus: {
    type: String,
    enum: {
      values: ['single', 'divorced', 'widowed', 'separated'],
      message: '유효한 결혼 상태를 선택해주세요'
    }
  },
  
  hasChildren: {
    type: Boolean,
    default: false
  },
  
  childrenInfo: {
    number: {
      type: Number,
      min: 0,
      max: 10
    },
    ages: [{
      type: String,
      enum: ['infant', 'toddler', 'child', 'teen', 'adult']
    }],
    custody: {
      type: String,
      enum: ['full', 'partial', 'none', 'shared']
    },
    livingWith: {
      type: Boolean,
      default: false
    }
  },
  
  occupation: {
    industry: {
      type: String,
      enum: [
        'finance', 'healthcare', 'education', 'technology', 'government',
        'manufacturing', 'retail', 'real_estate', 'consulting', 'legal',
        'arts', 'nonprofit', 'hospitality', 'transportation', 'agriculture',
        'construction', 'media', 'sports', 'retired', 'self_employed', 'other'
      ]
    },
    position: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive', 'owner', 'consultant', 'retired']
    },
    companySize: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'multinational']
    },
    workSchedule: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'freelance', 'retired', 'unemployed']
    },
    income: {
      type: String,
      validate: {
        validator: function(value) {
          // 암호화된 값이면 복호화해서 검증
          try {
            const decrypted = value ? encryptionService.decryptSensitive(value) : value;
            const validValues = ['under_30', '30_50', '50_70', '70_100', '100_150', '150_plus'];
            return !decrypted || validValues.includes(decrypted);
          } catch (error) {
            // 복호화 실패하면 원본 값으로 검증
            const validValues = ['under_30', '30_50', '50_70', '70_100', '100_150', '150_plus'];
            return !value || validValues.includes(value);
          }
        },
        message: '유효한 소득 범위를 선택해주세요'
      },
      get: function(value) {
        return value ? encryptionService.decryptSensitive(value) : value;
      },
      set: function(value) {
        return value ? encryptionService.encryptSensitive(value) : value;
      }
    }
  },
  
  lifestyle: {
    livingArrangement: {
      type: String,
      enum: ['alone', 'with_children', 'with_parents', 'with_roommates', 'with_partner']
    },
    homeOwnership: {
      type: String,
      enum: ['own', 'rent', 'family_home', 'other']
    },
    fitnessLevel: {
      type: String,
      enum: ['low', 'moderate', 'active', 'very_active']
    },
    socialLevel: {
      type: String,
      enum: ['introvert', 'ambivert', 'extrovert']
    },
    travelFrequency: {
      type: String,
      enum: ['rarely', 'occasionally', 'frequently', 'very_frequently']
    }
  },
  
  // 인증 관련
  isVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  emailVerificationCode: {
    type: String,
    select: false
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetCode: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  passwordChangedAt: {
    type: Date,
    default: null
  },
  
  // 계정 상태
  isActive: {
    type: Boolean,
    default: true
  },
  
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  isOnline: {
    type: Boolean,
    default: false
  },
  
  // 개인정보 동의
  agreeTerms: {
    type: Boolean,
    required: [true, '이용약관 동의는 필수입니다'],
    default: false
  },
  
  agreePrivacy: {
    type: Boolean,
    required: [true, '개인정보처리방침 동의는 필수입니다'],
    default: false
  },
  
  agreeMarketing: {
    type: Boolean,
    default: false
  },
  
  // 소셜 로그인
  socialProviders: [{
    provider: {
      type: String,
      enum: ['google', 'kakao', 'facebook']
    },
    providerId: String,
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // 사용자 설정
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      newMatches: {
        type: Boolean,
        default: true
      },
      messages: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showAge: {
        type: Boolean,
        default: true
      },
      showLocation: {
        type: Boolean,
        default: true
      },
      allowSearch: {
        type: Boolean,
        default: true
      }
    },
    matching: {
      ageRange: {
        min: {
          type: Number,
          min: 40,
          max: 80,
          default: 40
        },
        max: {
          type: Number,
          min: 40,
          max: 80,
          default: 70
        }
      },
      distance: {
        type: Number,
        min: 1,
        max: 100,
        default: 30 // km
      },
      genderPreference: {
        type: String,
        enum: ['male', 'female', 'both'],
        default: 'both'
      },
      maritalStatusPreference: [{
        type: String,
        enum: ['single', 'divorced', 'widowed', 'separated']
      }],
      childrenPreference: {
        type: String,
        enum: ['no_preference', 'has_children', 'no_children', 'grown_children'],
        default: 'no_preference'
      },
      occupationImportance: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      lifestyleImportance: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      }
    }
  },
  
  // 통계
  stats: {
    profileViews: {
      type: Number,
      default: 0
    },
    matchesCount: {
      type: Number,
      default: 0
    },
    conversationsCount: {
      type: Number,
      default: 0
    },
    successfulMeetings: {
      type: Number,
      default: 0
    }
  }
  
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// 인덱스 설정 (중복 제거됨 - email은 unique:true로, coordinates는 index:'2dsphere'로 자동 생성)
userSchema.index({ isActive: 1, isVerified: 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ age: 1, gender: 1 });

// 가상 필드
userSchema.virtual('ageNumeric').get(function() {
  if (!this.age) {return null;}
  
  const ageMap = {
    '40-45': 42.5,
    '46-50': 48,
    '51-55': 53,
    '56-60': 58,
    '60+': 65
  };
  
  return ageMap[this.age] || null;
});

// isOnline is now a real field in the schema, no need for virtual

// 미들웨어: 비밀번호 암호화
userSchema.pre('save', async function(next) {
  // 비밀번호가 수정되지 않았으면 건너뛰기
  if (!this.isModified('password')) {return next();}
  
  try {
    // 비밀번호 해싱
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// 미들웨어: lastActive 업데이트
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified()) {
    this.lastActive = new Date();
  }
  next();
});

// 메서드: 비밀번호 검증
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 메서드: 이메일 인증 토큰 생성
userSchema.methods.createEmailVerificationToken = function() {
  const crypto = require('crypto');
  
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24시간
  
  return verificationToken;
};

// 메서드: 비밀번호 리셋 토큰 생성
userSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10분
  
  return resetToken;
};

// 메서드: 프로필 완성도 계산
userSchema.methods.calculateProfileCompleteness = function() {
  const requiredFields = ['name', 'age', 'gender', 'bio', 'location.city'];
  const optionalFields = ['phone', 'profileImage', 'location.district'];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  requiredFields.forEach(field => {
    if (this.get(field)) {
      completedRequired++;
    }
  });
  
  optionalFields.forEach(field => {
    if (this.get(field)) {
      completedOptional++;
    }
  });
  
  const requiredScore = (completedRequired / requiredFields.length) * 80;
  const optionalScore = (completedOptional / optionalFields.length) * 20;
  
  return Math.round(requiredScore + optionalScore);
};

// 메서드: 나이 범위 내 체크
userSchema.methods.isInAgeRange = function(targetUser) {
  const myAge = this.ageNumeric;
  const targetAge = targetUser.ageNumeric;
  
  if (!myAge || !targetAge) {return false;}
  
  const { min, max } = this.preferences.matching.ageRange;
  return targetAge >= min && targetAge <= max;
};

// 정적 메서드: 활성 사용자 찾기
userSchema.statics.findActiveUsers = function() {
  return this.find({
    isActive: true,
    isVerified: true
  });
};

// 정적 메서드: 근처 사용자 찾기
userSchema.statics.findNearbyUsers = function(coordinates, maxDistance = 30000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance // meters
      }
    },
    isActive: true,
    isVerified: true
  });
};

module.exports = mongoose.model('User', userSchema);