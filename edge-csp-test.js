const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function checkCSPHeaders(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          headers: res.headers,
          data: data.substring(0, 500) // 처음 500자만
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEdgeCSP() {
  console.log('🌐 Microsoft Edge CSP 정책 테스트 시작...\n');
  
  const testPaths = [
    { name: '메인 페이지', path: '/' },
    { name: '사용자 API', path: '/api/users' },
    { name: '매칭 테스트 API', path: '/api/matching/test' }
  ];

  for (const test of testPaths) {
    try {
      console.log(`🔍 ${test.name} CSP 헤더 확인 중...`);
      
      const result = await checkCSPHeaders(test.path);
      
      console.log(`✅ ${test.name}: HTTP ${result.status}`);
      
      // CSP 관련 헤더 확인
      const cspHeaders = [
        'content-security-policy',
        'content-security-policy-report-only',
        'x-content-security-policy',
        'x-webkit-csp'
      ];
      
      let cspFound = false;
      cspHeaders.forEach(header => {
        if (result.headers[header]) {
          console.log(`   ⚠️  CSP 헤더 발견: ${header}`);
          console.log(`      ${result.headers[header]}`);
          cspFound = true;
        }
      });
      
      if (!cspFound) {
        console.log(`   ✅ CSP 헤더 없음 (완전 비활성화 성공)`);
      }
      
      // Edge 호환성 헤더 확인
      if (result.headers['x-csp-disabled']) {
        console.log(`   🛡️  CSP 비활성화 상태: ${result.headers['x-csp-disabled']}`);
      }
      
      if (result.headers['x-edge-compatible']) {
        console.log(`   🌐 Edge 호환 모드: ${result.headers['x-edge-compatible']}`);
      }
      
      // 캐시 제어 헤더 확인
      if (result.headers['cache-control']) {
        console.log(`   🔄 캐시 제어: ${result.headers['cache-control']}`);
      }
      
      console.log('');
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: 서버에 연결할 수 없습니다\n`);
      } else {
        console.log(`❌ ${test.name}: ${error.message}\n`);
      }
    }
  }

  console.log('🎯 Edge 브라우저 테스트 가이드:');
  console.log('1. Microsoft Edge에서 http://localhost:3000 접속');
  console.log('2. F12 개발자 도구 열기');
  console.log('3. Console 탭에서 CSP 오류 확인');
  console.log('4. 페이지 새로고침 여러 번 후 오류 없는지 확인');
  console.log('5. 빨간 오류 메시지가 없다면 성공! ✅');
  
  console.log('\n💡 예상 결과:');
  console.log('✅ content.js:79 오류 사라짐');
  console.log('✅ chrome-extension CSP 오류 사라짐');
  console.log('✅ script-src 관련 오류 사라짐');
  console.log('✅ 깔끔한 콘솔 환경');
}

// 스크립트 실행
if (require.main === module) {
  testEdgeCSP().catch(error => {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    process.exit(1);
  });
}

module.exports = { testEdgeCSP };