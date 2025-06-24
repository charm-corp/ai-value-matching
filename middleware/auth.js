const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// 리프레시 토큰 생성
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// 토큰 검증 미들웨어
const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Authorization 헤더에서 토큰 추출
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '접근 권한이 없습니다. 로그인이 필요합니다.'
      });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 정보 조회
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      });
    }
    
    // 계정 활성화 상태 확인
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: '비활성화된 계정입니다.'
      });
    }
    
    // 이메일 인증 상태 확인 (특정 엔드포인트에서만)
    if (req.path !== '/verify-email' && !user.isVerified && process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: '이메일 인증이 필요합니다.',
        needsVerification: true
      });
    }
    
    // 마지막 활동 시간 업데이트
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });
    
    // req.user에 사용자 정보 설정
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '토큰이 만료되었습니다.',
        expired: true
      });
    }
    
    return res.status(500).json({
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.'
    });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 인증, 없어도 통과)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
          // 마지막 활동 시간 업데이트
          user.lastActive = new Date();
          await user.save({ validateBeforeSave: false });
        }
      } catch (error) {
        // 토큰이 유효하지 않아도 계속 진행
        console.log('Optional auth failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

// 관리자 권한 확인
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '관리자 권한이 필요합니다.'
    });
  }
  
  next();
};

// 이메일 인증 확인
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }
  
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: '이메일 인증이 필요합니다.',
      needsVerification: true
    });
  }
  
  next();
};

// 프로필 완성 확인
const requireCompleteProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '인증이 필요합니다.'
    });
  }
  
  if (!req.user.isProfileComplete) {
    return res.status(403).json({
      success: false,
      error: '프로필 작성이 필요합니다.',
      needsProfileCompletion: true
    });
  }
  
  next();
};

// 토큰 갱신
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: '리프레시 토큰이 필요합니다.'
      });
    }
    
    // 리프레시 토큰 검증
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 리프레시 토큰입니다.'
      });
    }
    
    // 사용자 정보 조회
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 사용자입니다.'
      });
    }
    
    // 새로운 토큰들 생성
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    
    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isVerified: user.isVerified,
          isProfileComplete: user.isProfileComplete
        }
      }
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 리프레시 토큰입니다.'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: '토큰 갱신 중 오류가 발생했습니다.'
    });
  }
};

// 비밀번호 확인 미들웨어
const verifyPassword = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호가 필요합니다.'
      });
    }
    
    // 비밀번호가 포함된 사용자 정보 조회
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 비밀번호 확인
    const isValidPassword = await user.comparePassword(currentPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호가 올바르지 않습니다.'
      });
    }
    
    req.userWithPassword = user;
    next();
    
  } catch (error) {
    console.error('Password verification error:', error);
    return res.status(500).json({
      success: false,
      error: '비밀번호 확인 중 오류가 발생했습니다.'
    });
  }
};

// 사용자 소유권 확인 (자신의 리소스만 접근 가능)
const requireOwnership = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceIdParam];
    const currentUserId = req.user._id.toString();
    
    if (resourceUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '접근 권한이 없습니다.'
      });
    }
    
    next();
  };
};

// 매치 참여자 확인
const requireMatchParticipant = async (req, res, next) => {
  try {
    const Match = require('../models/Match');
    const matchId = req.params.matchId || req.params.id;
    
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: '매치를 찾을 수 없습니다.'
      });
    }
    
    const userId = req.user._id.toString();
    const isParticipant = match.user1.toString() === userId || match.user2.toString() === userId;
    
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '이 매치에 대한 접근 권한이 없습니다.'
      });
    }
    
    req.match = match;
    next();
    
  } catch (error) {
    console.error('Match participant verification error:', error);
    return res.status(500).json({
      success: false,
      error: '매치 권한 확인 중 오류가 발생했습니다.'
    });
  }
};

// 대화 참여자 확인
const requireConversationParticipant = async (req, res, next) => {
  try {
    const Conversation = require('../models/Conversation');
    const conversationId = req.params.conversationId || req.params.id;
    
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: '대화를 찾을 수 없습니다.'
      });
    }
    
    const userId = req.user._id.toString();
    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    
    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '이 대화에 대한 접근 권한이 없습니다.'
      });
    }
    
    req.conversation = conversation;
    next();
    
  } catch (error) {
    console.error('Conversation participant verification error:', error);
    return res.status(500).json({
      success: false,
      error: '대화 권한 확인 중 오류가 발생했습니다.'
    });
  }
};

// Rate limiting을 위한 사용자별 제한
const userRateLimit = (maxRequests = 10, windowMinutes = 15) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user._id.toString();
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
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }
    
    userRequests.push(now);
    next();
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  authenticate,
  optionalAuth,
  requireAdmin,
  requireVerified,
  requireCompleteProfile,
  refreshToken,
  verifyPassword,
  requireOwnership,
  requireMatchParticipant,
  requireConversationParticipant,
  userRateLimit
};