const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { generateToken, generateRefreshToken, authenticate, refreshToken, verifyPassword } = require('../middleware/auth');
const { 
  validateUserRegistration, 
  validateLogin, 
  validatePasswordChange,
  validateEmailVerification,
  validatePasswordResetRequest,
  validatePasswordReset
} = require('../middleware/validation');
const security = require('../middleware/security');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - age
 *               - agreeTerms
 *               - agreePrivacy
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *               age:
 *                 type: string
 *                 enum: ['40-45', '46-50', '51-55', '56-60', '60+']
 *               gender:
 *                 type: string
 *                 enum: ['male', 'female', 'other']
 *               phone:
 *                 type: string
 *               agreeTerms:
 *                 type: boolean
 *               agreePrivacy:
 *                 type: boolean
 *               agreeMarketing:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 *       409:
 *         description: 이미 존재하는 이메일
 */
router.post('/register', security.authLimiter, security.validateRegistration, async (req, res) => {
  try {
    const { email, password, name, age, gender, phone, agreeTerms, agreePrivacy, agreeMarketing } = req.body;
    
    // 이메일 중복 체크
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: '이미 등록된 이메일입니다.'
      });
    }
    
    // 새 사용자 생성
    const userData = {
      email: email.toLowerCase(),
      password,
      name,
      age,
      agreeTerms: agreeTerms === 'true' || agreeTerms === true,
      agreePrivacy: agreePrivacy === 'true' || agreePrivacy === true
    };
    
    if (gender) userData.gender = gender;
    if (phone) userData.phone = phone;
    if (agreeMarketing !== undefined) {
      userData.agreeMarketing = agreeMarketing === 'true' || agreeMarketing === true;
    }
    
    const user = new User(userData);
    
    // 이메일 인증 토큰 및 코드 생성
    const verificationToken = user.createEmailVerificationToken();
    const verificationCode = emailService.generateVerificationCode();
    
    // 인증 정보 저장
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
    
    await user.save();
    
    // 이메일 인증 메일 발송
    try {
      await emailService.sendVerificationEmail(
        user.email, 
        user.name, 
        verificationCode, 
        verificationToken
      );
      console.log(`📧 Verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Email send failed:', emailError.message);
      // 이메일 발송 실패해도 회원가입은 진행 (인증은 나중에 가능)
    }
    
    // 토큰 생성 (이메일 인증 전에도 로그인 가능하지만 기능 제한)
    const token = generateToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);
    
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.',
      data: {
        token,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          age: user.age,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete
        }
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // MongoDB 중복 키 에러 처리
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: '이미 등록된 이메일입니다.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: '회원가입 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       400:
 *         description: 잘못된 자격 증명
 *       401:
 *         description: 인증 실패
 */
router.post('/login', security.authLimiter, security.validateLogin, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // 사용자 조회 (비밀번호 포함)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 계정 활성화 상태 확인
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: '비활성화된 계정입니다. 고객센터에 문의해주세요.'
      });
    }
    
    // 토큰 생성
    const token = generateToken(user._id);
    const refreshTokenValue = generateRefreshToken(user._id);
    
    // 마지막 로그인 시간 업데이트
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });
    
    // 비밀번호 제거 후 응답
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: '로그인되었습니다.',
      data: {
        token,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          age: user.age,
          gender: user.gender,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete,
          lastActive: user.lastActive
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 토큰 갱신
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 토큰 갱신 성공
 *       401:
 *         description: 유효하지 않은 리프레시 토큰
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // 클라이언트에서 토큰을 삭제하도록 안내
    // 실제로는 토큰 블랙리스트를 구현할 수 있음
    
    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: '로그아웃 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 사용자 정보 조회
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *       401:
 *         description: 인증 필요
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
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
          createdAt: user.createdAt
        }
      }
    });
    
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: 이메일 인증
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 이메일 인증 토큰
 *     responses:
 *       200:
 *         description: 이메일 인증 성공
 *       400:
 *         description: 유효하지 않은 토큰
 */
router.get('/verify-email/:token', validateEmailVerification, async (req, res) => {
  try {
    const { token } = req.params;
    
    // 토큰 해싱
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // 토큰으로 사용자 찾기
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않거나 만료된 인증 토큰입니다.'
      });
    }
    
    // 이메일 인증 완료
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save({ validateBeforeSave: false });
    
    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다.'
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: '이메일 인증 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: 이메일 인증 재발송
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 인증 메일 재발송 성공
 *       400:
 *         description: 이미 인증된 계정
 */
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: '이미 인증된 계정입니다.'
      });
    }
    
    // 새로운 인증 토큰 생성
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    // TODO: 인증 메일 재발송
    // await sendVerificationEmail(user.email, verificationToken);
    
    res.json({
      success: true,
      message: '인증 메일이 재발송되었습니다.'
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: '인증 메일 재발송 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: 비밀번호 재설정 요청
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 메일 발송
 *       404:
 *         description: 존재하지 않는 이메일
 */
router.post('/forgot-password', validatePasswordResetRequest, async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '등록되지 않은 이메일입니다.'
      });
    }
    
    // 비밀번호 재설정 토큰 생성
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // TODO: 비밀번호 재설정 메일 발송
    // await sendPasswordResetEmail(user.email, resetToken);
    
    res.json({
      success: true,
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
      // 개발 환경에서만 토큰 반환
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 재설정 요청 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 비밀번호 재설정
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 성공
 *       400:
 *         description: 유효하지 않은 토큰
 */
router.post('/reset-password', validatePasswordReset, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // 토큰 해싱
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // 토큰으로 사용자 찾기
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않거나 만료된 재설정 토큰입니다.'
      });
    }
    
    // 새 비밀번호 설정
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 재설정 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: 비밀번호 변경
 *     tags: [Auth]
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
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 현재 비밀번호 불일치
 */
router.put('/change-password', authenticate, validatePasswordChange, verifyPassword, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    // 새 비밀번호 설정
    req.userWithPassword.password = newPassword;
    await req.userWithPassword.save();
    
    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/deactivate:
 *   put:
 *     summary: 계정 비활성화
 *     tags: [Auth]
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
 *         description: 계정 비활성화 성공
 */
router.put('/deactivate', authenticate, verifyPassword, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const user = await User.findById(req.user._id);
    user.isActive = false;
    
    // 비활성화 이유 저장 (필요시)
    if (reason) {
      user.deactivationReason = reason;
      user.deactivatedAt = new Date();
    }
    
    await user.save({ validateBeforeSave: false });
    
    res.json({
      success: true,
      message: '계정이 비활성화되었습니다.'
    });
    
  } catch (error) {
    console.error('Account deactivation error:', error);
    res.status(500).json({
      success: false,
      error: '계정 비활성화 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: 이메일 인증 완료
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               verificationCode:
 *                 type: string
 *               verificationToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 이메일 인증 성공
 *       400:
 *         description: 잘못된 인증 정보
 */
router.post('/verify-email', security.emailLimiter, security.validateEmailVerification, async (req, res) => {
  try {
    const { email, verificationCode, verificationToken } = req.body;
    
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      emailVerificationCode: verificationCode,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: '인증 코드가 유효하지 않거나 만료되었습니다.'
      });
    }
    
    // 토큰도 확인 (선택사항)
    if (verificationToken && user.emailVerificationToken !== verificationToken) {
      return res.status(400).json({
        success: false,
        error: '인증 토큰이 일치하지 않습니다.'
      });
    }
    
    // 이메일 인증 완료
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationCode = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();
    
    // 환영 이메일 발송 (비동기로)
    emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('Welcome email failed:', err.message);
    });
    
    res.json({
      success: true,
      message: '이메일 인증이 완료되었습니다! 🎉',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          emailVerifiedAt: user.emailVerifiedAt
        }
      }
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: '이메일 인증 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: 인증 이메일 재발송
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: 인증 이메일 재발송 성공
 *       400:
 *         description: 잘못된 요청
 */
router.post('/resend-verification', security.emailLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: '이메일을 입력해주세요.'
      });
    }
    
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isVerified: false 
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: '해당 이메일로 등록된 미인증 계정이 없습니다.'
      });
    }
    
    // 새로운 인증 코드 생성
    const verificationToken = user.createEmailVerificationToken();
    const verificationCode = emailService.generateVerificationCode();
    
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    await user.save();
    
    // 인증 이메일 재발송
    try {
      await emailService.sendVerificationEmail(
        user.email, 
        user.name, 
        verificationCode, 
        verificationToken
      );
      
      res.json({
        success: true,
        message: '인증 이메일이 재발송되었습니다.'
      });
      
    } catch (emailError) {
      console.error('Resend verification email failed:', emailError.message);
      res.status(500).json({
        success: false,
        error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: '인증 이메일 재발송 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: 비밀번호 찾기 요청
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 이메일 발송 성공
 */
router.post('/forgot-password', validatePasswordResetRequest, async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // 보안상 실제로 계정이 없어도 성공 메시지 반환
      return res.json({
        success: true,
        message: '비밀번호 재설정 이메일이 발송되었습니다.'
      });
    }
    
    // 비밀번호 재설정 토큰 및 코드 생성
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetCode = emailService.generateVerificationCode();
    
    user.passwordResetToken = resetToken;
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15분 후 만료
    
    await user.save();
    
    // 비밀번호 재설정 이메일 발송
    try {
      await emailService.sendPasswordResetEmail(
        user.email, 
        user.name, 
        resetCode, 
        resetToken
      );
      
      res.json({
        success: true,
        message: '비밀번호 재설정 이메일이 발송되었습니다.'
      });
      
    } catch (emailError) {
      console.error('Password reset email failed:', emailError.message);
      res.status(500).json({
        success: false,
        error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 재설정 요청 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 비밀번호 재설정
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               resetCode:
 *                 type: string
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 성공
 */
router.post('/reset-password', validatePasswordReset, async (req, res) => {
  try {
    const { email, resetCode, resetToken, newPassword } = req.body;
    
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetCode: resetCode,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        error: '재설정 코드가 유효하지 않거나 만료되었습니다.'
      });
    }
    
    // 토큰도 확인 (선택사항)
    if (resetToken && user.passwordResetToken !== resetToken) {
      return res.status(400).json({
        success: false,
        error: '재설정 토큰이 일치하지 않습니다.'
      });
    }
    
    // 새 비밀번호 설정
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 재설정 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;