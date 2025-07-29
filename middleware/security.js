const rateLimit = require('express-rate-limit');
const validator = require('validator');
const xss = require('xss');

// API별 Rate Limiting 설정
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    keyGenerator: req => {
      // IP와 사용자 ID 조합으로 키 생성 (로그인한 경우)
      const ip = req.ip || req.connection.remoteAddress;
      const userId = req.user?._id || 'anonymous';
      return `${ip}:${userId}`;
    },
  });
};

// 일반 API 요청 제한
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15분
  100, // 최대 100 요청
  '너무 많은 요청이 발생했습니다. 15분 후 다시 시도해주세요.'
);

// 인증 관련 요청 제한 (더 엄격)
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15분
  5, // 최대 5 요청 (로그인, 회원가입 등)
  '인증 요청이 너무 많습니다. 15분 후 다시 시도해주세요.'
);

// 이메일 발송 요청 제한
const emailLimiter = createRateLimit(
  60 * 60 * 1000, // 1시간
  3, // 최대 3 요청
  '이메일 발송 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.'
);

// 파일 업로드 요청 제한
const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1시간
  10, // 최대 10 요청
  '파일 업로드 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.'
);

// 메시지 발송 요청 제한
const messageLimiter = createRateLimit(
  60 * 1000, // 1분
  30, // 최대 30 메시지
  '메시지 발송이 너무 빠릅니다. 잠시 후 다시 시도해주세요.'
);

// XSS 방어 미들웨어
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // XSS 공격 방어
        req.body[key] = xss(req.body[key], {
          whiteList: {}, // 모든 HTML 태그 제거
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script'],
        });

        // 추가 정리
        req.body[key] = req.body[key].trim();
      }
    }
  }

  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key], {
          whiteList: {},
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script'],
        });
      }
    }
  }

  next();
};

// 입력값 검증 유틸리티
const validateInput = {
  email: email => {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return validator.isEmail(email) && email.length <= 254;
  },

  password: password => {
    if (!password || typeof password !== 'string') {
      return false;
    }
    return password.length >= 8 && password.length <= 128;
  },

  name: name => {
    if (!name || typeof name !== 'string') {
      return false;
    }
    const trimmed = name.trim();
    return trimmed.length >= 1 && trimmed.length <= 50 && /^[가-힣a-zA-Z\s]+$/.test(trimmed);
  },

  age: age => {
    const validAges = ['40-45', '46-50', '51-55', '56-60', '60+'];
    return validAges.includes(age);
  },

  gender: gender => {
    const validGenders = ['male', 'female', 'other'];
    return !gender || validGenders.includes(gender);
  },

  phone: phone => {
    if (!phone) {
      return true;
    } // 선택사항
    return validator.isMobilePhone(phone, 'ko-KR');
  },

  bio: bio => {
    if (!bio) {
      return true;
    } // 선택사항
    return typeof bio === 'string' && bio.trim().length <= 500;
  },

  verificationCode: code => {
    if (!code || typeof code !== 'string') {
      return false;
    }
    return /^\d{6}$/.test(code);
  },

  objectId: id => {
    if (!id || typeof id !== 'string') {
      return false;
    }
    return validator.isMongoId(id);
  },
};

// 회원가입 입력값 검증
const validateRegistration = (req, res, next) => {
  const { email, password, name, age, gender, phone, bio } = req.body;

  const errors = [];

  if (!validateInput.email(email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  if (!validateInput.password(password)) {
    errors.push('비밀번호는 8-128자 사이여야 합니다.');
  }

  if (!validateInput.name(name)) {
    errors.push('이름은 1-50자의 한글 또는 영문이어야 합니다.');
  }

  if (!validateInput.age(age)) {
    errors.push('유효한 연령대를 선택해주세요.');
  }

  if (!validateInput.gender(gender)) {
    errors.push('유효한 성별을 선택해주세요.');
  }

  if (!validateInput.phone(phone)) {
    errors.push('유효한 전화번호를 입력해주세요.');
  }

  if (!validateInput.bio(bio)) {
    errors.push('자기소개는 500자 이하여야 합니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '입력값 검증 실패',
      details: errors,
    });
  }

  next();
};

// 로그인 입력값 검증
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = [];

  if (!validateInput.email(email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  if (!password || typeof password !== 'string' || password.length < 1) {
    errors.push('비밀번호를 입력해주세요.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '입력값 검증 실패',
      details: errors,
    });
  }

  next();
};

// 이메일 인증 입력값 검증
const validateEmailVerification = (req, res, next) => {
  const { email, verificationCode } = req.body;

  const errors = [];

  if (!validateInput.email(email)) {
    errors.push('유효한 이메일 주소를 입력해주세요.');
  }

  if (!validateInput.verificationCode(verificationCode)) {
    errors.push('인증 코드는 6자리 숫자여야 합니다.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: '입력값 검증 실패',
      details: errors,
    });
  }

  next();
};

// MongoDB ObjectId 검증
const validateObjectId = paramName => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!validateInput.objectId(id)) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 ID 형식입니다.',
      });
    }

    next();
  };
};

// SQL Injection 방어 (NoSQL Injection도 포함)
const preventInjection = (req, res, next) => {
  const checkForInjection = obj => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          return true;
        }
        if (checkForInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkForInjection(req.body) || checkForInjection(req.query)) {
    return res.status(400).json({
      success: false,
      error: '부적절한 요청 형식입니다.',
    });
  }

  next();
};

// CSRF 방어를 위한 토큰 검증 (실제로는 별도 라이브러리 사용 권장)
const validateCSRF = (req, res, next) => {
  // GET 요청은 제외
  if (req.method === 'GET') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body.csrfToken;
  const sessionToken = req.session?.csrfToken;

  // 개발 환경에서는 CSRF 검증 건너뛰기
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF 토큰이 유효하지 않습니다.',
    });
  }

  next();
};

// IP 차단 리스트 (실제로는 Redis나 데이터베이스에 저장)
const blockedIPs = new Set();

const checkBlockedIP = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  if (blockedIPs.has(ip)) {
    return res.status(403).json({
      success: false,
      error: '접근이 차단된 IP입니다.',
    });
  }

  next();
};

// 의심스러운 활동 감지
const detectSuspiciousActivity = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // 의심스러운 User-Agent 패턴
  const suspiciousPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i];

  // 개발 환경에서는 검증 건너뛰기
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  if (userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn(`🚨 Suspicious activity detected from IP ${ip}: ${userAgent}`);

    // 로그 기록하지만 차단하지는 않음 (필요시 차단 가능)
    // return res.status(403).json({
    //   success: false,
    //   error: '의심스러운 활동이 감지되었습니다.'
    // });
  }

  next();
};

module.exports = {
  // Rate Limiters
  generalLimiter,
  authLimiter,
  emailLimiter,
  uploadLimiter,
  messageLimiter,

  // Security Middleware
  sanitizeInput,
  preventInjection,
  validateCSRF,
  checkBlockedIP,
  detectSuspiciousActivity,

  // Validation Middleware
  validateRegistration,
  validateLogin,
  validateEmailVerification,
  validateObjectId,

  // Utilities
  validateInput,

  // Admin functions
  blockIP: ip => blockedIPs.add(ip),
  unblockIP: ip => blockedIPs.delete(ip),
  getBlockedIPs: () => Array.from(blockedIPs),
};
