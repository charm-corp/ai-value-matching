module.exports = {
  testEnvironment: 'node',

  // 테스트 타임아웃 설정
  testTimeout: 30000,

  // 병렬 테스트 제한 (메모리 사용량 감소)
  maxWorkers: 2,

  // 테스트 후 정리
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // 커버리지 설정
  collectCoverageFrom: [
    'models/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
  ],

  // 테스트 파일 패턴
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.js'],

  // 테스트 전/후 설정
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // 메모리 누수 감지
  detectOpenHandles: true,
  forceExit: true,

  // 더 자세한 에러 정보
  verbose: true,
};
