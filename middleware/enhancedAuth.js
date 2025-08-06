const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { RLSContext, setRLSContext, setSystemRLSContext } = require('./rls');

/**
 * Enhanced Authentication Middleware with RLS Integration
 * JWT 인증과 RLS를 완전히 통합한 고급 인증 미들웨어
 */

// 다중 토큰 타입 지원
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  SYSTEM: 'system',
  ADMIN: 'admin'
};

// 토큰 권한 레벨
const PERMISSION_LEVELS = {
  ANONYMOUS: 0,
  USER: 1,
  VERIFIED_USER: 2,
  PREMIUM_USER: 3,
  MODERATOR: 4,
  ADMIN: 5,
  SYSTEM: 10
};

/**
 * 강화된 JWT 토큰 생성 함수
 */
const generateEnhancedToken = (userId, tokenType = TOKEN_TYPES.ACCESS, additionalClaims = {}) => {
  const payload = {
    userId,
    type: tokenType,
    iat: Math.floor(Date.now() / 1000),
    ...additionalClaims
  };

  let secret, expiresIn;

  switch (tokenType) {
    case TOKEN_TYPES.ACCESS:
      secret = process.env.JWT_SECRET;
      expiresIn = process.env.JWT_EXPIRES_IN || '1h';
      break;
    case TOKEN_TYPES.REFRESH:
      secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      break;
    case TOKEN_TYPES.SYSTEM:
      secret = process.env.JWT_SYSTEM_SECRET || process.env.JWT_SECRET;
      expiresIn = '1h';
      payload.permissions = ['system_access'];
      break;
    case TOKEN_TYPES.ADMIN:
      secret = process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET;
      expiresIn = '8h';
      payload.permissions = ['admin_access'];
      break;
    default:
      secret = process.env.JWT_SECRET;
      expiresIn = '1h';
  }

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * 토큰 검증 및 사용자 정보 추출
 */
const verifyEnhancedToken = async (token, expectedType = null) => {
  try {
    // 토큰 타입 자동 감지
    let decoded;
    let tokenType;
    
    // 여러 시크릿으로 순차 검증
    const secretsToTry = [
      { secret: process.env.JWT_SECRET, type: TOKEN_TYPES.ACCESS },
      { secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, type: TOKEN_TYPES.REFRESH },
      { secret: process.env.JWT_SYSTEM_SECRET || process.env.JWT_SECRET, type: TOKEN_TYPES.SYSTEM },
      { secret: process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET, type: TOKEN_TYPES.ADMIN }
    ];

    for (const { secret, type } of secretsToTry) {
      try {
        decoded = jwt.verify(token, secret);
        tokenType = decoded.type || type;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!decoded) {
      throw new Error('Invalid token');
    }

    // 예상 토큰 타입 검증
    if (expectedType && tokenType !== expectedType) {
      throw new Error(`Expected ${expectedType} token, got ${tokenType}`);
    }

    // 토큰 만료 추가 검증
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return { decoded, tokenType };
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * 사용자 권한 레벨 계산
 */
const calculatePermissionLevel = (user) => {
  if (!user) return PERMISSION_LEVELS.ANONYMOUS;
  
  if (user.role === 'system') return PERMISSION_LEVELS.SYSTEM;
  if (user.role === 'admin') return PERMISSION_LEVELS.ADMIN;
  if (user.role === 'moderator') return PERMISSION_LEVELS.MODERATOR;
  if (user.isPremium) return PERMISSION_LEVELS.PREMIUM_USER;
  if (user.isVerified) return PERMISSION_LEVELS.VERIFIED_USER;
  
  return PERMISSION_LEVELS.USER;
};

/**
 * RLS 컨텍스트 생성
 */
const createRLSContextFromUser = (user, tokenType = TOKEN_TYPES.ACCESS, additionalPermissions = []) => {
  if (!user) {
    return new RLSContext(null, 'anonymous', []);
  }

  const role = tokenType === TOKEN_TYPES.SYSTEM ? 'system' : 
               tokenType === TOKEN_TYPES.ADMIN ? 'admin' : 
               user.role || 'user';

  const permissions = [
    ...additionalPermissions,
    ...(user.permissions || [])
  ];

  // 토큰 타입별 추가 권한
  if (tokenType === TOKEN_TYPES.SYSTEM) {
    permissions.push('system_access', 'bypass_rls', 'matching_algorithm');
  } else if (tokenType === TOKEN_TYPES.ADMIN) {
    permissions.push('admin_access', 'user_management', 'content_moderation');
  }

  const context = new RLSContext(user._id.toString(), role, permissions);
  
  // 권한 레벨 추가
  context.permissionLevel = calculatePermissionLevel(user);
  context.tokenType = tokenType;
  context.user = user;

  return context;
};

/**
 * 메인 인증 미들웨어 (RLS 통합)
 */
const authenticateWithRLS = async (req, res, next) => {
  try {
    let token;
    let authMethod = 'none';

    // 1. Authorization 헤더에서 토큰 추출
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
        authMethod = 'header';
      }
    }

    // 2. 쿠키에서 토큰 추출 (fallback)
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      authMethod = 'cookie';
    }

    // 3. 토큰이 없는 경우 익명 사용자로 처리
    if (!token) {
      req.rlsContext = new RLSContext(null, 'anonymous', []);
      req.user = null;
      req.authMethod = 'none';
      return next();
    }

    // 4. 토큰 검증
    const { decoded, tokenType } = await verifyEnhancedToken(token);

    // 5. 시스템 토큰 특별 처리
    if (tokenType === TOKEN_TYPES.SYSTEM) {
      req.rlsContext = new RLSContext('system', 'system', ['all']);
      req.user = { _id: 'system', role: 'system' };
      req.authMethod = 'system';
      req.tokenType = tokenType;
      return next();
    }

    // 6. 사용자 정보 조회
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 7. 계정 상태 확인
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: '비활성화된 계정입니다.',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // 8. 토큰 재발급 필요 여부 확인 (만료 30분 전)
    const shouldRefresh = decoded.exp && 
                         (decoded.exp - Math.floor(Date.now() / 1000)) < 1800;

    // 9. RLS 컨텍스트 생성
    req.rlsContext = createRLSContextFromUser(user, tokenType, decoded.permissions || []);
    req.user = user;
    req.authMethod = authMethod;
    req.tokenType = tokenType;
    req.shouldRefresh = shouldRefresh;

    // 10. 사용자 활동 시간 업데이트 (비동기)
    user.lastActive = new Date();
    user.save({ validateBeforeSave: false }).catch(error => {
      console.error('Failed to update lastActive:', error);
    });

    // 11. 보안 헤더 설정
    res.set('X-RLS-Context', 'enabled');
    res.set('X-Auth-Method', authMethod);

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // 토큰 관련 오류 상세 처리
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        error: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED',
        shouldRefresh: true
      });
    }

    if (error.message.includes('invalid') || error.message.includes('malformed')) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(500).json({
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * 필수 인증 미들웨어
 */
const requireAuth = (req, res, next) => {
  if (!req.user || !req.rlsContext?.userId) {
    return res.status(401).json({
      success: false,
      error: '로그인이 필요합니다.',
      code: 'LOGIN_REQUIRED'
    });
  }
  next();
};

/**
 * 권한 레벨 확인 미들웨어
 */
const requirePermissionLevel = (minLevel) => {
  return (req, res, next) => {
    const userLevel = req.rlsContext?.permissionLevel || PERMISSION_LEVELS.ANONYMOUS;
    
    if (userLevel < minLevel) {
      return res.status(403).json({
        success: false,
        error: '권한이 부족합니다.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: minLevel,
        current: userLevel
      });
    }
    
    next();
  };
};

/**
 * 특정 권한 확인 미들웨어
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.rlsContext?.permissions?.includes(permission) && 
        !req.rlsContext?.permissions?.includes('all')) {
      return res.status(403).json({
        success: false,
        error: `${permission} 권한이 필요합니다.`,
        code: 'MISSING_PERMISSION',
        required: permission
      });
    }
    
    next();
  };
};

/**
 * 이메일 인증 확인 미들웨어
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user?.isVerified && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: '이메일 인증이 필요합니다.',
      code: 'EMAIL_VERIFICATION_REQUIRED',
      needsVerification: true
    });
  }
  next();
};

/**
 * 프로필 완성 확인 미들웨어
 */
const requireCompleteProfile = (req, res, next) => {
  if (!req.user?.isProfileComplete) {
    return res.status(403).json({
      success: false,
      error: '프로필 작성이 필요합니다.',
      code: 'PROFILE_COMPLETION_REQUIRED',
      needsProfileCompletion: true
    });
  }
  next();
};

/**
 * 시스템 권한 미들웨어 (매칭 알고리즘용)
 */
const requireSystemAuth = (req, res, next) => {
  const systemToken = req.headers['x-system-token'] || 
                     req.headers.authorization?.replace('Bearer ', '');

  if (!systemToken) {
    return res.status(401).json({
      success: false,
      error: '시스템 토큰이 필요합니다.',
      code: 'SYSTEM_TOKEN_REQUIRED'
    });
  }

  try {
    const { decoded, tokenType } = verifyEnhancedToken(systemToken, TOKEN_TYPES.SYSTEM);
    
    if (tokenType !== TOKEN_TYPES.SYSTEM) {
      throw new Error('Invalid system token');
    }

    req.rlsContext = new RLSContext('system', 'system', ['all']);
    req.user = { _id: 'system', role: 'system' };
    req.authMethod = 'system';
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '유효하지 않은 시스템 토큰입니다.',
      code: 'INVALID_SYSTEM_TOKEN'
    });
  }
};

/**
 * 토큰 갱신 미들웨어
 */
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: '리프레시 토큰이 필요합니다.',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    const { decoded } = await verifyEnhancedToken(refreshToken, TOKEN_TYPES.REFRESH);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 사용자입니다.',
        code: 'INVALID_USER'
      });
    }

    // 새 토큰 생성
    const newAccessToken = generateEnhancedToken(user._id, TOKEN_TYPES.ACCESS);
    const newRefreshToken = generateEnhancedToken(user._id, TOKEN_TYPES.REFRESH);

    // RLS 컨텍스트 설정
    req.rlsContext = createRLSContextFromUser(user);
    req.user = user;

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete,
          permissionLevel: calculatePermissionLevel(user)
        }
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);

    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return res.status(401).json({
        success: false,
        error: '리프레시 토큰이 만료되었거나 유효하지 않습니다.',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      error: '토큰 갱신 중 오류가 발생했습니다.',
      code: 'REFRESH_ERROR'
    });
  }
};

/**
 * Rate Limiting (사용자별)
 */
const createUserRateLimit = (maxRequests = 10, windowMinutes = 15) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.rlsContext?.userId || req.ip;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    // 윈도우 시간 밖의 요청 제거
    while (userRequests.length > 0 && userRequests[0] < now - windowMs) {
      userRequests.shift();
    }

    // 관리자/시스템은 제한 없음
    if (req.rlsContext?.isAdmin() || req.rlsContext?.isSystem()) {
      return next();
    }

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }

    userRequests.push(now);
    next();
  };
};

/**
 * 보안 로깅 미들웨어
 */
const securityLogger = (req, res, next) => {
  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // 보안 관련 로그 기록
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      userId: req.rlsContext?.userId || 'anonymous',
      role: req.rlsContext?.role || 'anonymous',
      authMethod: req.authMethod || 'none',
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    };

    // 실패한 인증 시도는 특별히 기록
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('Security Alert:', logData);
    }

    // 성공적인 요청도 디버그 레벨로 기록
    if (process.env.SECURITY_LOGGING === 'true') {
      console.log('Security Log:', logData);
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  // 토큰 관련
  TOKEN_TYPES,
  PERMISSION_LEVELS,
  generateEnhancedToken,
  verifyEnhancedToken,
  
  // 주요 미들웨어
  authenticateWithRLS,
  requireAuth,
  requirePermissionLevel,
  requirePermission,
  requireVerifiedEmail,
  requireCompleteProfile,
  requireSystemAuth,
  
  // 토큰 관리
  refreshTokenMiddleware,
  
  // 유틸리티
  createRLSContextFromUser,
  calculatePermissionLevel,
  createUserRateLimit,
  securityLogger
};