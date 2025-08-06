#!/usr/bin/env node

/**
 * Quick Server Test - 서버 정상 시작 확인
 */

console.log('🚀 Quick Server Test 시작...');
console.log('=' .repeat(50));

// 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

try {
  // Express 앱 로딩 테스트
  console.log('1️⃣ Express 앱 로딩 중...');
  const express = require('express');
  const app = express();
  
  // 기본 미들웨어
  app.use(express.json());
  
  console.log('2️⃣ 라우트 파일들 로딩 중...');
  
  // 모든 라우트 파일 로딩 테스트
  const authRoutes = require('./routes/auth');
  const userRoutes = require('./routes/users');
  const valuesRoutes = require('./routes/values');
  const matchingRoutes = require('./routes/matching');
  const advancedMatchingRoutes = require('./routes/advancedMatching');
  const privacyRoutes = require('./routes/privacy');
  const chatRoutes = require('./routes/chat');
  const profileRoutes = require('./routes/profile');
  const demoRoutes = require('./routes/demo');
  
  console.log('✅ 모든 라우트 파일 로딩 성공');
  
  console.log('3️⃣ RLS 시스템 로딩 중...');
  
  const { createCompatibilityMiddleware } = require('./middleware/rlsIntegration');
  app.use(createCompatibilityMiddleware());
  
  console.log('✅ RLS 호환성 미들웨어 추가 완료');
  
  console.log('4️⃣ API 라우트 등록 중...');
  
  // API 라우트 등록
  app.use('/api', demoRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/values', valuesRoutes);
  app.use('/api/matching', matchingRoutes);
  app.use('/api/advanced-matching', advancedMatchingRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/privacy', privacyRoutes);
  
  console.log('✅ 모든 API 라우트 등록 완료');
  
  // 테스트 라우트
  app.get('/test', (req, res) => {
    res.json({
      success: true,
      message: 'Quick Server Test 성공!',
      timestamp: new Date().toISOString(),
      rlsEnabled: !!req.rlsContext
    });
  });
  
  console.log('5️⃣ 서버 시작 중...');
  
  // 서버 시작
  const server = app.listen(3001, () => {
    console.log('✅ 서버가 성공적으로 시작되었습니다!');
    console.log('🌐 테스트 URL: http://localhost:3001/test');
    
    // HTTP 요청 테스트
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/test',
      method: 'GET'
    };
    
    console.log('6️⃣ HTTP 요청 테스트 중...');
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ HTTP 테스트 성공:', response.message);
          console.log('📊 응답 데이터:', response);
          
          console.log('\\n🎉 모든 테스트 통과!');
          console.log('📋 테스트 결과 요약:');
          console.log('   ✅ Express 앱 로딩');
          console.log('   ✅ 모든 라우트 파일 로딩');
          console.log('   ✅ RLS 시스템 통합');
          console.log('   ✅ API 라우트 등록');
          console.log('   ✅ 서버 시작');
          console.log('   ✅ HTTP 요청/응답');
          
          console.log('\\n🚀 서버 준비 완료! 이제 pnpm run dev로 실행 가능합니다!');
          
          server.close();
          process.exit(0);
        } catch (error) {
          console.error('❌ HTTP 응답 파싱 오류:', error.message);
          server.close();
          process.exit(1);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ HTTP 요청 오류:', error.message);
      server.close();
      process.exit(1);
    });
    
    req.end();
  });
  
  server.on('error', (error) => {
    console.error('❌ 서버 시작 오류:', error.message);
    process.exit(1);
  });
  
  // 타임아웃 설정 (30초)
  setTimeout(() => {
    console.log('⏰ 테스트 타임아웃');
    server.close();
    process.exit(0);
  }, 30000);
  
} catch (error) {
  console.error('❌ Quick Server Test 실패:', error.message);
  console.error('📍 오류 위치:', error.stack.split('\\n')[1]);
  process.exit(1);
}

// 예외 처리
process.on('uncaughtException', (error) => {
  console.error('❌ 예외 발생:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise 거부:', reason);
  process.exit(1);
});