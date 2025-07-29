const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 API 엔드포인트 테스트 시작...\n');
  
  const tests = [
    {
      name: '사용자 목록 조회',
      url: `${BASE_URL}/api/users`,
      method: 'GET'
    },
    {
      name: '매칭 테스트',
      url: `${BASE_URL}/api/matching/test`,
      method: 'GET' 
    },
    {
      name: '메인 페이지',
      url: `${BASE_URL}/`,
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 ${test.name} 테스트 중...`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 5000,
        validateStatus: () => true // 모든 상태 코드 허용
      });
      
      console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
      
      if (response.data) {
        if (typeof response.data === 'object' && response.data.success !== undefined) {
          console.log(`   📊 Success: ${response.data.success}`);
          if (response.data.message) {
            console.log(`   💬 Message: ${response.data.message}`);
          }
          if (response.data.data) {
            if (response.data.data.users) {
              console.log(`   👥 Users: ${response.data.data.users.length}명`);
            }
            if (response.data.data.totalUsers) {
              console.log(`   📈 Total Users: ${response.data.data.totalUsers}`);
            }
          }
        } else {
          console.log(`   📄 Response type: ${typeof response.data}`);
        }
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: 서버에 연결할 수 없습니다 (포트 3000)`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`❌ ${test.name}: 호스트를 찾을 수 없습니다`);
      } else if (error.response) {
        console.log(`❌ ${test.name}: ${error.response.status} ${error.response.statusText}`);
      } else {
        console.log(`❌ ${test.name}: ${error.message}`);
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