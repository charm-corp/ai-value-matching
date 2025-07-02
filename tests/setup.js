const mongoose = require('mongoose');

// 테스트 전역 설정
beforeAll(async () => {
  // 테스트용 환경 변수 설정
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-jwt';
  process.env.ENCRYPTION_MASTER_KEY = 'test-master-key-for-encryption-32bytes';
  process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/charm_inyeon_test';
});

// 각 테스트 후 정리
afterEach(async () => {
  // 메모리 정리
  if (global.gc) {
    global.gc();
  }
});

// 모든 테스트 완료 후 정리
afterAll(async () => {
  try {
    // 모든 MongoDB 연결 정리
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // 추가적인 정리 작업
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Test cleanup error:', error);
  }
});

// 테스트 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Jest 타임아웃 증가
jest.setTimeout(30000);