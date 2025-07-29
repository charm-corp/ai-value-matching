const { encryptionService } = require('../utils/encryption');
const xss = require('xss');

/**
 * 개인정보 보호 미들웨어
 * GDPR, CCPA, 개인정보보호법 준수를 위한 미들웨어
 */

/**
 * 개인정보 수집 동의 확인 미들웨어
 */
const checkPrivacyConsent = (requiredConsents = ['privacy']) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다',
        });
      }

      // 필수 동의 항목 확인
      const missingConsents = [];

      if (requiredConsents.includes('privacy') && !user.agreePrivacy) {
        missingConsents.push('개인정보처리방침');
      }

      if (requiredConsents.includes('terms') && !user.agreeTerms) {
        missingConsents.push('이용약관');
      }

      if (requiredConsents.includes('marketing') && !user.agreeMarketing) {
        missingConsents.push('마케팅 정보 수신');
      }

      if (missingConsents.length > 0) {
        return res.status(403).json({
          success: false,
          message: '필요한 동의가 완료되지 않았습니다',
          missingConsents,
        });
      }

      next();
    } catch (error) {
      console.error('Privacy consent check error:', error);
      res.status(500).json({
        success: false,
        message: '동의 확인 중 오류가 발생했습니다',
      });
    }
  };
};

/**
 * 민감한 데이터 접근 로깅 미들웨어
 */
const logSensitiveDataAccess = (dataType = 'unknown') => {
  return (req, res, next) => {
    try {
      const accessLog = {
        userId: req.user?.id || 'anonymous',
        dataType,
        action: req.method,
        endpoint: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID,
      };

      // 실제 운영 환경에서는 보안 로그 시스템에 저장
      console.log('SENSITIVE_DATA_ACCESS:', JSON.stringify(accessLog));

      // 응답 후 추가 로깅
      res.on('finish', () => {
        accessLog.statusCode = res.statusCode;
        accessLog.completedAt = new Date().toISOString();
        console.log('SENSITIVE_DATA_ACCESS_COMPLETE:', JSON.stringify(accessLog));
      });

      next();
    } catch (error) {
      console.error('Sensitive data access logging error:', error);
      next(); // 로깅 실패해도 요청은 계속 처리
    }
  };
};

/**
 * 개인정보 마스킹 미들웨어
 */
const maskPersonalData = (fields = []) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      try {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        if (data && typeof data === 'object') {
          data = maskSensitiveFields(data, fields);
        }

        originalSend.call(this, JSON.stringify(data));
      } catch (error) {
        console.error('Data masking error:', error);
        originalSend.call(this, data);
      }
    };

    next();
  };
};

/**
 * 민감한 필드 마스킹 함수
 */
function maskSensitiveFields(obj, fields) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const masked = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (fields.includes(key)) {
        // 필드별 마스킹 적용
        if (key === 'email') {
          masked[key] = encryptionService.maskData(value, 'email');
        } else if (key === 'phone') {
          masked[key] = encryptionService.maskData(value, 'phone');
        } else if (key === 'name') {
          masked[key] = encryptionService.maskData(value, 'name');
        } else if (key.includes('address') || key.includes('location')) {
          masked[key] = encryptionService.maskData(value, 'address');
        } else {
          masked[key] = encryptionService.maskData(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        // 중첩된 객체도 재귀적으로 마스킹
        masked[key] = maskSensitiveFields(value, fields);
      } else {
        masked[key] = value;
      }
    }
  }

  return masked;
}

/**
 * XSS 방지 및 데이터 검증 미들웨어
 */
const sanitizeInput = (req, res, next) => {
  try {
    // 요청 본문 정제
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // 쿼리 파라미터 정제
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // 경로 파라미터 정제
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({
      success: false,
      message: '입력 데이터 검증 실패',
    });
  }
};

/**
 * 객체 재귀적 정제
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? xss(obj) : obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        sanitized[key] = xss(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * 데이터 접근 권한 확인 미들웨어
 */
const checkDataAccess = (dataType = 'general') => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const targetUserId = req.params.userId || req.body.userId;

      // 자신의 데이터에만 접근 가능
      if (targetUserId && user.id !== targetUserId) {
        // 관리자 또는 특별 권한 확인
        if (!user.isAdmin && !hasSpecialPermission(user, dataType)) {
          return res.status(403).json({
            success: false,
            message: '데이터 접근 권한이 없습니다',
          });
        }
      }

      next();
    } catch (error) {
      console.error('Data access check error:', error);
      res.status(500).json({
        success: false,
        message: '접근 권한 확인 중 오류가 발생했습니다',
      });
    }
  };
};

/**
 * 특별 권한 확인 (예: 매칭 서비스용)
 */
function hasSpecialPermission(user, dataType) {
  // 매칭 서비스는 제한된 데이터에 접근 가능
  if (dataType === 'matching' && user.role === 'service') {
    return true;
  }

  // 기타 특별 권한 로직
  return false;
}

/**
 * 데이터 보존 기간 확인 미들웨어
 */
const checkDataRetention = async (req, res, next) => {
  try {
    const user = req.user;

    // 비활성 계정의 데이터 보존 기간 확인 (예: 1년)
    if (!user.isActive) {
      const lastActive = new Date(user.lastActive);
      const retentionPeriod = 365 * 24 * 60 * 60 * 1000; // 1년

      if (Date.now() - lastActive.getTime() > retentionPeriod) {
        return res.status(410).json({
          success: false,
          message: '데이터 보존 기간이 만료되었습니다',
          code: 'DATA_RETENTION_EXPIRED',
        });
      }
    }

    next();
  } catch (error) {
    console.error('Data retention check error:', error);
    next(); // 확인 실패해도 요청은 계속 처리
  }
};

/**
 * GDPR 준수를 위한 데이터 처리 목적 명시 미들웨어
 */
const specifyDataPurpose = (purpose = 'service') => {
  return (req, res, next) => {
    req.dataPurpose = purpose;

    // 응답 헤더에 데이터 처리 목적 명시
    res.setHeader('X-Data-Purpose', purpose);
    res.setHeader('X-Privacy-Policy', '/privacy-policy');

    next();
  };
};

/**
 * 익명화 처리 미들웨어
 */
const anonymizeData = (fields = []) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      try {
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        if (data && typeof data === 'object') {
          data = anonymizeFields(data, fields);
        }

        originalSend.call(this, JSON.stringify(data));
      } catch (error) {
        console.error('Data anonymization error:', error);
        originalSend.call(this, data);
      }
    };

    next();
  };
};

/**
 * 필드 익명화 함수
 */
function anonymizeFields(obj, fields) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const anonymized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (fields.includes(key)) {
        // 필드별 익명화
        if (key === 'email') {
          anonymized[key] = 'user@anonymous.com';
        } else if (key === 'name') {
          anonymized[key] = '익명사용자';
        } else if (key === 'phone') {
          anonymized[key] = '010-****-****';
        } else {
          anonymized[key] = '[익명화됨]';
        }
      } else if (typeof value === 'object' && value !== null) {
        anonymized[key] = anonymizeFields(value, fields);
      } else {
        anonymized[key] = value;
      }
    }
  }

  return anonymized;
}

module.exports = {
  checkPrivacyConsent,
  logSensitiveDataAccess,
  maskPersonalData,
  sanitizeInput,
  checkDataAccess,
  checkDataRetention,
  specifyDataPurpose,
  anonymizeData,
};
