const jwt = require('jsonwebtoken');
const { generateToken } = require('../../middleware/auth');

/**
 * 테스트용 JWT 토큰 생성
 */
const generateTestToken = (userId = 'test-user-id') => {
  return generateToken(userId);
};

/**
 * 테스트용 관리자 토큰 생성
 */
const generateAdminToken = (userId = 'test-admin-id') => {
  return jwt.sign(
    { 
      userId, 
      role: 'admin',
      isAdmin: true 
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * 토큰에서 사용자 ID 추출
 */
const extractUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateTestToken,
  generateAdminToken,
  extractUserIdFromToken
};