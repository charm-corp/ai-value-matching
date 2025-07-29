const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function makeRequest(path, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: 'GET',
      timeout: timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: data, raw: true });
        }
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

async function runStabilityTest() {
  console.log('🧪 CHARM_INYEON 서버 안정성 최종 테스트\n');
  
  const tests = [
    {
      name: '메인 페이지 로딩',
      path: '/',
      expectedStatus: 200
    },
    {
      name: '사용자 목록 조회 API',
      path: '/api/users',
      expectedStatus: 200,
      checkData: (data) => data.success && data.data && data.data.users
    },
    {
      name: '매칭 테스트 API', 
      path: '/api/matching/test',
      expectedStatus: 200,
      checkData: (data) => data.success && data.data && data.data.results
    },
    {
      name: 'API 문서 페이지',
      path: '/api-docs',
      expectedStatus: 200
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`🔍 ${test.name} 테스트 중...`);
      
      const result = await makeRequest(test.path);
      
      let testPassed = result.status === test.expectedStatus;
      
      if (testPassed && test.checkData && !result.raw) {
        testPassed = test.checkData(result.data);
      }
      
      if (testPassed) {
        console.log(`✅ ${test.name}: PASS (HTTP ${result.status})`);
        
        if (result.data && !result.raw) {
          if (result.data.data && result.data.data.users) {
            console.log(`   👥 사용자 수: ${result.data.data.users.length}명`);
          }
          if (result.data.data && result.data.data.results) {
            const score = result.data.data.results.advancedCompatibility?.totalScore;
            if (score) {
              console.log(`   💕 매칭 점수: ${score}점`);
            }
          }
          if (result.data.message) {
            console.log(`   💬 "${result.data.message}"`);
          }
        }
        
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAIL (HTTP ${result.status})`);
        if (result.data && typeof result.data === 'object' && result.data.error) {
          console.log(`   🚨 Error: ${result.data.error}`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ ${test.name}: FAIL - ${error.message}\n`);
    }
  }

  // 종합 결과
  console.log('📊 테스트 결과 요약');
  console.log(`성공: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 모든 테스트 통과! 서버가 안정적으로 작동합니다.');
    console.log('✨ CHARM_INYEON 백엔드 시스템이 완벽하게 준비되었습니다!');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests}개 테스트 실패. 추가 디버깅이 필요합니다.`);
  }

  console.log('\n🔗 사용 가능한 엔드포인트:');
  console.log(`   • 메인 페이지: http://localhost:${PORT}/`);
  console.log(`   • 사용자 목록: http://localhost:${PORT}/api/users`);
  console.log(`   • 매칭 테스트: http://localhost:${PORT}/api/matching/test`);
  console.log(`   • API 문서: http://localhost:${PORT}/api-docs`);
}

// 스크립트 실행
if (require.main === module) {
  runStabilityTest().catch(error => {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    process.exit(1);
  });
}

module.exports = { runStabilityTest };