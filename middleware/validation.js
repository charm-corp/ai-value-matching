const { body, param, query, validationResult } = require('express-validator');

// 검증 결과 처리 미들웨어
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      error: '입력 데이터가 유효하지 않습니다.',
      details: formattedErrors
    });
  }
  
  next();
};

// 사용자 등록 검증
const validateUserRegistration = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요')
    .normalizeEmail()
    .toLowerCase(),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('비밀번호는 최소 8자 이상이어야 합니다')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'),
    
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다')
    .matches(/^[가-힣a-zA-Z\s]+$/)
    .withMessage('이름은 한글, 영문, 공백만 사용 가능합니다'),
    
  body('age')
    .isIn(['40-45', '46-50', '51-55', '56-60', '60+'])
    .withMessage('유효한 연령대를 선택해주세요'),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('유효한 성별을 선택해주세요'),
    
  body('phone')
    .optional()
    .matches(/^[0-9-+().\s]+$/)
    .withMessage('유효한 전화번호를 입력해주세요'),
    
  body('agreeTerms')
    .equals('true')
    .withMessage('이용약관에 동의해야 합니다'),
    
  body('agreePrivacy')
    .equals('true')
    .withMessage('개인정보처리방침에 동의해야 합니다'),
    
  body('agreeMarketing')
    .optional()
    .isBoolean()
    .withMessage('마케팅 동의는 true 또는 false여야 합니다'),
    
  handleValidationErrors
];

// 로그인 검증
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요')
    .normalizeEmail()
    .toLowerCase(),
    
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요'),
    
  handleValidationErrors
];

// 비밀번호 변경 검증
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('현재 비밀번호를 입력해주세요'),
    
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('새 비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('비밀번호 확인이 일치하지 않습니다');
      }
      return true;
    }),
    
  handleValidationErrors
];

// 프로필 업데이트 검증
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다')
    .matches(/^[가-힣a-zA-Z\s]+$/)
    .withMessage('이름은 한글, 영문, 공백만 사용 가능합니다'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('자기소개는 500자 이하여야 합니다'),
    
  body('phone')
    .optional()
    .matches(/^[0-9-+().\s]+$/)
    .withMessage('유효한 전화번호를 입력해주세요'),
    
  body('location.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('도시명은 2-50자 사이여야 합니다'),
    
  body('location.district')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('구/군명은 2-50자 사이여야 합니다'),
    
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('좌표는 [경도, 위도] 배열이어야 합니다'),
    
  body('location.coordinates.*')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('유효한 좌표값을 입력해주세요'),
    
  handleValidationErrors
];

// 가치관 평가 답변 검증
const validateValuesAssessment = [
  body('answers')
    .isObject()
    .withMessage('답변은 객체 형태여야 합니다'),
    
  body('answers.*')
    .isObject()
    .withMessage('각 답변은 객체 형태여야 합니다'),
    
  body('answers.*.questionId')
    .isInt({ min: 1, max: 100 })
    .withMessage('유효한 질문 ID여야 합니다'),
    
  body('answers.*.value')
    .notEmpty()
    .withMessage('답변 값은 필수입니다'),
    
  body('answers.*.category')
    .optional()
    .isString()
    .withMessage('카테고리는 문자열이어야 합니다'),
    
  handleValidationErrors
];

// 매치 응답 검증
const validateMatchResponse = [
  body('action')
    .isIn(['like', 'pass', 'super_like'])
    .withMessage('유효한 액션을 선택해주세요 (like, pass, super_like)'),
    
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('메모는 200자 이하여야 합니다'),
    
  handleValidationErrors
];

// 메시지 전송 검증
const validateMessageSend = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('메시지는 1-2000자 사이여야 합니다'),
    
  body('type')
    .optional()
    .isIn(['text', 'image', 'emoji', 'sticker'])
    .withMessage('유효한 메시지 타입을 선택해주세요'),
    
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('유효한 메시지 ID여야 합니다'),
    
  handleValidationErrors
];

// 이메일 인증 토큰 검증
const validateEmailVerification = [
  param('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('유효한 인증 토큰이 아닙니다')
    .matches(/^[a-fA-F0-9]+$/)
    .withMessage('토큰 형식이 올바르지 않습니다'),
    
  handleValidationErrors
];

// 비밀번호 리셋 요청 검증
const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요')
    .normalizeEmail()
    .toLowerCase(),
    
  handleValidationErrors
];

// 비밀번호 리셋 검증
const validatePasswordReset = [
  body('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('유효한 리셋 토큰이 아닙니다')
    .matches(/^[a-fA-F0-9]+$/)
    .withMessage('토큰 형식이 올바르지 않습니다'),
    
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('새 비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('비밀번호 확인이 일치하지 않습니다');
      }
      return true;
    }),
    
  handleValidationErrors
];

// 연락처 문의 검증
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('이름은 2-50자 사이여야 합니다'),
    
  body('email')
    .isEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요')
    .normalizeEmail(),
    
  body('phone')
    .optional()
    .matches(/^[0-9-+().\s]+$/)
    .withMessage('유효한 전화번호를 입력해주세요'),
    
  body('subject')
    .isIn(['service', 'technical', 'account', 'partnership', 'other'])
    .withMessage('유효한 문의 유형을 선택해주세요'),
    
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('문의 내용은 10-1000자 사이여야 합니다'),
    
  handleValidationErrors
];

// 피드백 검증
const validateFeedback = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('평점은 1-5 사이의 정수여야 합니다'),
    
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('코멘트는 500자 이하여야 합니다'),
    
  body('wouldRecommend')
    .optional()
    .isBoolean()
    .withMessage('추천 여부는 true 또는 false여야 합니다'),
    
  handleValidationErrors
];

// 사용자 설정 검증
const validateUserSettings = [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('이메일 알림 설정은 true 또는 false여야 합니다'),
    
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('푸시 알림 설정은 true 또는 false여야 합니다'),
    
  body('notifications.newMatches')
    .optional()
    .isBoolean()
    .withMessage('새 매치 알림 설정은 true 또는 false여야 합니다'),
    
  body('notifications.messages')
    .optional()
    .isBoolean()
    .withMessage('메시지 알림 설정은 true 또는 false여야 합니다'),
    
  body('privacy.showAge')
    .optional()
    .isBoolean()
    .withMessage('나이 공개 설정은 true 또는 false여야 합니다'),
    
  body('privacy.showLocation')
    .optional()
    .isBoolean()
    .withMessage('위치 공개 설정은 true 또는 false여야 합니다'),
    
  body('privacy.allowSearch')
    .optional()
    .isBoolean()
    .withMessage('검색 허용 설정은 true 또는 false여야 합니다'),
    
  body('matching.ageRange.min')
    .optional()
    .isInt({ min: 40, max: 80 })
    .withMessage('최소 나이는 40-80 사이여야 합니다'),
    
  body('matching.ageRange.max')
    .optional()
    .isInt({ min: 40, max: 80 })
    .withMessage('최대 나이는 40-80 사이여야 합니다'),
    
  body('matching.distance')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('거리는 1-100km 사이여야 합니다'),
    
  body('matching.genderPreference')
    .optional()
    .isIn(['male', 'female', 'both'])
    .withMessage('성별 선호도는 male, female, both 중 하나여야 합니다'),
    
  handleValidationErrors
];

// 페이지네이션 검증
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('페이지는 1 이상의 정수여야 합니다'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('제한은 1-100 사이의 정수여야 합니다'),
    
  query('sort')
    .optional()
    .isString()
    .withMessage('정렬 기준은 문자열이어야 합니다'),
    
  handleValidationErrors
];

// MongoDB ObjectId 검증
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage('유효한 ID가 아닙니다'),
    
  handleValidationErrors
];

// 파일 업로드 검증
const validateFileUpload = (fieldName = 'file') => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
    }
    
    const file = req.file || req.files[fieldName];
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: `${fieldName} 필드에 파일이 없습니다.`
      });
    }
    
    // 파일 크기 검증 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: '파일 크기는 5MB를 초과할 수 없습니다.'
      });
    }
    
    // 이미지 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (fieldName === 'profileImage' && !allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: '지원되지 않는 파일 형식입니다. (jpeg, jpg, png, webp만 허용)'
      });
    }
    
    next();
  };
};

// 커스텀 검증 헬퍼
const customValidation = (validatorFn, errorMessage) => {
  return (req, res, next) => {
    try {
      const isValid = validatorFn(req);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: errorMessage || '유효성 검증 중 오류가 발생했습니다.'
      });
    }
  };
};

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateValuesAssessment,
  validateMatchResponse,
  validateMessageSend,
  validateEmailVerification,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateContact,
  validateFeedback,
  validateUserSettings,
  validatePagination,
  validateObjectId,
  validateFileUpload,
  customValidation
};