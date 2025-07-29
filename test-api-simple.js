const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function makeRequest(path) {
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

async function testAPI() {
  console.log('🚀 API 엔드포인트 테스트 시작...\n');
  
  const endpoints = [
    { name: '사용자 목록 조회', path: '/api/users' },
    { name: '매칭 테스트', path: '/api/matching/test' },
    { name: '메인 페이지', path: '/' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 ${endpoint.name} 테스트 중...`);
      
      const result = await makeRequest(endpoint.path);
      
      console.log(`✅ ${endpoint.name}: HTTP ${result.status}`);
      
      if (result.data && !result.raw) {
        if (result.data.success !== undefined) {
          console.log(`   📊 Success: ${result.data.success}`);
          if (result.data.message) {
            console.log(`   💬 Message: ${result.data.message}`);
          }
          if (result.data.data) {
            if (result.data.data.users) {
              console.log(`   👥 Users: ${result.data.data.users.length}명`);
              result.data.data.users.forEach((user, index) => {
                console.log(`      ${index + 1}. ${user.name} (${user.age}, ${user.gender})`);
              });
            }
            if (result.data.data.totalUsers) {
              console.log(`   📈 Total Users: ${result.data.data.totalUsers}`);
            }
            if (result.data.data.results) {
              console.log(`   🔍 Test Results:`);
              if (result.data.data.results.advancedCompatibility) {
                console.log(`      Advanced Score: ${result.data.data.results.advancedCompatibility.totalScore}`);
              }
              if (result.data.data.results.valuesCompatibility) {
                console.log(`      Values Score: ${result.data.data.results.valuesCompatibility}`);
              }
            }
          }
        } else if (result.raw) {
          console.log(`   📄 Response: ${result.data.substring(0, 100)}...`);
        }
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint.name}: 서버에 연결할 수 없습니다 (포트 ${PORT})`);
      } else {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
    
    console.log(''); // 빈 줄
  }
  
  console.log('🎉 API 테스트 완료!');
}

// 스크립트 실행
if (require.main === module) {
  testAPI().catch(error => {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    process.exit(1);
  });
}

module.exports = { testAPI };