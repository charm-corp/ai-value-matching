const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../server');
const User = require('../../models/User');
const Match = require('../../models/Match');
const { generateEnhancedToken, TOKEN_TYPES } = require('../../middleware/enhancedAuth');
const bcrypt = require('bcryptjs');

/**
 * RLS Integration Tests
 * 어플리케이션 레벨 RLS 정책 통합 테스트
 */

describe('RLS Integration Tests', () => {
  let mongoServer;
  let testUsers = {};
  let testTokens = {};

  beforeAll(async () => {
    // 테스트용 MongoDB 메모리 서버 시작
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    
    // 테스트 사용자 생성
    await createTestUsers();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // 각 테스트 전에 매치 데이터 정리
    await Match.deleteMany({});
  });

  // 테스트 사용자 생성
  async function createTestUsers() {
    const hashedPassword = await bcrypt.hash('testpass123', 10);

    // 일반 사용자 1
    const user1 = await User.create({
      name: '김테스트',
      email: 'test1@example.com',
      password: hashedPassword,
      age: '46-50',
      gender: 'male',
      isActive: true,
      isVerified: true,
      isProfileComplete: true,
      location: { city: '서울', district: '강남구' },
      interests: ['영화감상', '독서']
    });

    // 일반 사용자 2  
    const user2 = await User.create({
      name: '이테스트',
      email: 'test2@example.com',
      password: hashedPassword,
      age: '46-50',
      gender: 'female',
      isActive: true,
      isVerified: true,
      isProfileComplete: true,
      location: { city: '서울', district: '서초구' },
      interests: ['요리', '영화감상']
    });

    // 일반 사용자 3 (매치되지 않은 사용자)
    const user3 = await User.create({
      name: '박테스트',
      email: 'test3@example.com',
      password: hashedPassword,
      age: '51-55',
      gender: 'male',
      isActive: true,
      isVerified: true,
      isProfileComplete: true,
      location: { city: '부산', district: '해운대구' },
      interests: ['등산', '여행']
    });

    // 관리자 사용자
    const admin = await User.create({
      name: '관리자',
      email: 'admin@example.com',
      password: hashedPassword,
      age: '40-45',
      gender: 'male',
      role: 'admin',
      isActive: true,
      isVerified: true,
      isProfileComplete: true
    });

    testUsers = { user1, user2, user3, admin };

    // 토큰 생성
    testTokens = {
      user1: generateEnhancedToken(user1._id, TOKEN_TYPES.ACCESS),
      user2: generateEnhancedToken(user2._id, TOKEN_TYPES.ACCESS),
      user3: generateEnhancedToken(user3._id, TOKEN_TYPES.ACCESS),
      admin: generateEnhancedToken(admin._id, TOKEN_TYPES.ADMIN),
      system: generateEnhancedToken('system', TOKEN_TYPES.SYSTEM)
    };
  }

  describe('User Profile Access Control', () => {
    test('사용자는 본인 프로필만 조회 가능', async () => {
      // 본인 프로필 조회 성공
      const ownProfileResponse = await request(app)
        .get(`/api/users/${testUsers.user1._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(200);

      expect(ownProfileResponse.body.success).toBe(true);
      expect(ownProfileResponse.body.data.email).toBe('test1@example.com');

      // 다른 사용자 프로필 조회 실패
      await request(app)
        .get(`/api/users/${testUsers.user2._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(403);
    });

    test('관리자는 모든 사용자 프로필 조회 가능', async () => {
      const profileResponse = await request(app)
        .get(`/api/users/${testUsers.user1._id}`)
        .set('Authorization', `Bearer ${testTokens.admin}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.email).toBe('test1@example.com');
    });

    test('매치된 사용자 프로필 조회 가능', async () => {
      // 먼저 매치 생성
      await Match.create({
        user1: testUsers.user1._id,
        user2: testUsers.user2._id,
        compatibilityScore: 80,
        status: 'mutual_match'
      });

      // 매치된 사용자 프로필 조회 성공
      const profileResponse = await request(app)
        .get(`/api/users/${testUsers.user2._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      // 매치된 사용자의 경우 일부 민감한 정보는 제외
      expect(profileResponse.body.data.email).toBeUndefined();
    });
  });

  describe('Match Access Control', () => {
    let testMatch;

    beforeEach(async () => {
      testMatch = await Match.create({
        user1: testUsers.user1._id,
        user2: testUsers.user2._id,
        compatibilityScore: 75,
        status: 'pending'
      });
    });

    test('매치 참여자만 매치 정보 조회 가능', async () => {
      // user1이 자신의 매치 조회 성공
      const matchResponse = await request(app)
        .get(`/api/matches/${testMatch._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(200);

      expect(matchResponse.body.success).toBe(true);
      expect(matchResponse.body.data._id).toBe(testMatch._id.toString());

      // user2도 같은 매치 조회 성공
      await request(app)
        .get(`/api/matches/${testMatch._id}`)
        .set('Authorization', `Bearer ${testTokens.user2}`)
        .expect(200);

      // 관련 없는 user3은 조회 실패
      await request(app)
        .get(`/api/matches/${testMatch._id}`)
        .set('Authorization', `Bearer ${testTokens.user3}`)
        .expect(403);
    });

    test('사용자별 매치 목록 조회 RLS 적용', async () => {
      // 추가 매치 생성 (user1과 user3 간)
      await Match.create({
        user1: testUsers.user1._id,
        user2: testUsers.user3._id,
        compatibilityScore: 65,
        status: 'pending'
      });

      // user1의 매치 목록 조회
      const user1MatchesResponse = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(200);

      expect(user1MatchesResponse.body.data).toHaveLength(2);

      // user2의 매치 목록 조회
      const user2MatchesResponse = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${testTokens.user2}`)
        .expect(200);

      expect(user2MatchesResponse.body.data).toHaveLength(1);
    });

    test('매치 응답 권한 확인', async () => {
      // user1이 자신의 매치에 응답 성공
      await request(app)
        .put(`/api/matches/${testMatch._id}/respond`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .send({ action: 'like' })
        .expect(200);

      // user3이 관련 없는 매치에 응답 시도 실패
      await request(app)
        .put(`/api/matches/${testMatch._id}/respond`)
        .set('Authorization', `Bearer ${testTokens.user3}`)
        .send({ action: 'like' })
        .expect(403);
    });
  });

  describe('System vs User Permissions', () => {
    test('시스템 토큰으로 매치 생성 가능', async () => {
      const matchData = {
        user1: testUsers.user1._id,
        user2: testUsers.user3._id,
        compatibilityScore: 70,
        compatibilityBreakdown: {
          valuesAlignment: 75,
          personalityCompatibility: 70,
          lifestyleMatch: 65
        }
      };

      // 시스템 토큰으로 매치 생성 성공
      const createResponse = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${testTokens.system}`)
        .send(matchData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.compatibilityScore).toBe(70);
    });

    test('일반 사용자는 매치 생성 불가', async () => {
      const matchData = {
        user1: testUsers.user1._id,
        user2: testUsers.user3._id,
        compatibilityScore: 70
      };

      // 일반 사용자 토큰으로 매치 생성 실패
      await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .send(matchData)
        .expect(403);
    });

    test('관리자는 모든 데이터 접근 가능', async () => {
      // 매치 생성
      const testMatch = await Match.create({
        user1: testUsers.user1._id,
        user2: testUsers.user2._id,
        compatibilityScore: 80,
        status: 'pending'
      });

      // 관리자가 모든 매치 조회 가능
      const allMatchesResponse = await request(app)
        .get('/api/admin/matches')
        .set('Authorization', `Bearer ${testTokens.admin}`)
        .expect(200);

      expect(allMatchesResponse.body.data.length).toBeGreaterThan(0);

      // 관리자가 특정 매치 수정 가능
      await request(app)
        .put(`/api/admin/matches/${testMatch._id}`)
        .set('Authorization', `Bearer ${testTokens.admin}`)
        .send({ status: 'expired' })
        .expect(200);
    });
  });

  describe('Data Isolation', () => {
    test('사용자 간 데이터 완전 격리', async () => {
      // 각 사용자의 매치 생성
      const match1 = await Match.create({
        user1: testUsers.user1._id,
        user2: testUsers.user2._id,
        compatibilityScore: 80,
        status: 'pending'
      });

      const match2 = await Match.create({
        user1: testUsers.user2._id,
        user2: testUsers.user3._id,  
        compatibilityScore: 70,
        status: 'pending'
      });

      // user1은 자신과 관련된 매치만 조회
      const user1Response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(200);

      expect(user1Response.body.data).toHaveLength(1);
      expect(user1Response.body.data[0]._id).toBe(match1._id.toString());

      // user3은 자신과 관련된 매치만 조회
      const user3Response = await request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${testTokens.user3}`)
        .expect(200);

      expect(user3Response.body.data).toHaveLength(1);
      expect(user3Response.body.data[0]._id).toBe(match2._id.toString());
    });

    test('잘못된 사용자 ID로 접근 시도 차단', async () => {
      // 존재하지 않는 사용자 ID로 접근
      await request(app)
        .get(`/api/users/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(404);

      // 다른 사용자의 매치에 잘못된 ID로 접근
      const testMatch = await Match.create({
        user1: testUsers.user2._id,
        user2: testUsers.user3._id,
        compatibilityScore: 75,
        status: 'pending'
      });

      await request(app)
        .get(`/api/matches/${testMatch._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(403);
    });
  });

  describe('Token Validation', () => {
    test('유효하지 않은 토큰 차단', async () => {
      await request(app)
        .get(`/api/users/${testUsers.user1._id}`)
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    test('만료된 토큰 차단', async () => {
      // 만료된 토큰 생성 (테스트용)
      const expiredToken = generateEnhancedToken(testUsers.user1._id, TOKEN_TYPES.ACCESS, {
        exp: Math.floor(Date.now() / 1000) - 3600 // 1시간 전 만료
      });

      await request(app)
        .get(`/api/users/${testUsers.user1._id}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    test('잘못된 토큰 타입 차단', async () => {
      // 리프레시 토큰으로 API 접근 시도
      const refreshToken = generateEnhancedToken(testUsers.user1._id, TOKEN_TYPES.REFRESH);

      await request(app)
        .get(`/api/users/${testUsers.user1._id}`)
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);
    });
  });

  describe('Edge Cases', () => {
    test('비활성화된 사용자 접근 차단', async () => {
      // 사용자 비활성화
      await User.findByIdAndUpdate(testUsers.user1._id, { isActive: false });

      await request(app)
        .get(`/api/users/${testUsers.user1._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(403);

      // 사용자 다시 활성화
      await User.findByIdAndUpdate(testUsers.user1._id, { isActive: true });
    });

    test('삭제된 매치 접근 차단', async () => {
      const testMatch = await Match.create({
        user1: testUsers.user1._id,
        user2: testUsers.user2._id,
        compatibilityScore: 75,
        status: 'pending'
      });

      // 매치 삭제
      await Match.findByIdAndDelete(testMatch._id);

      // 삭제된 매치 접근 시도
      await request(app)
        .get(`/api/matches/${testMatch._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(404);
    });

    test('대량 요청 시 RLS 성능 확인', async () => {
      // 대량 매치 생성
      const matches = [];
      for (let i = 0; i < 50; i++) {
        matches.push({
          user1: testUsers.user1._id,
          user2: testUsers.user2._id,
          compatibilityScore: 60 + i,
          status: 'pending'
        });
      }
      await Match.insertMany(matches);

      const startTime = Date.now();
      
      // 대량 데이터 조회
      const response = await request(app)
        .get('/api/matches?limit=50')
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .expect(200);

      const duration = Date.now() - startTime;

      expect(response.body.data).toHaveLength(50);
      expect(duration).toBeLessThan(1000); // 1초 이내 응답
    });
  });

  describe('Audit Logging', () => {
    test('민감한 작업 감사 로그 기록', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // 프로필 업데이트 (민감한 작업)
      await request(app)
        .put(`/api/users/${testUsers.user1._id}`)
        .set('Authorization', `Bearer ${testTokens.user1}`)
        .send({ name: '수정된이름' })
        .expect(200);

      // 감사 로그 확인
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Audit Log:')
      );

      consoleSpy.mockRestore();
    });
  });
});

/**
 * RLS Performance Tests
 * RLS 성능 테스트
 */
describe('RLS Performance Tests', () => {
  let mongoServer;
  let testUsers = [];
  let testMatches = [];

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // 대량 테스트 데이터 생성
    await createLargeTestDataset();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  async function createLargeTestDataset() {
    const hashedPassword = await bcrypt.hash('testpass', 10);

    // 1000명의 테스트 사용자 생성
    const usersData = [];
    for (let i = 0; i < 1000; i++) {
      usersData.push({
        name: `테스트사용자${i}`,
        email: `test${i}@example.com`,
        password: hashedPassword,
        age: ['40-45', '46-50', '51-55', '56-60'][i % 4],
        gender: i % 2 === 0 ? 'male' : 'female',
        isActive: true,
        isVerified: true,
        isProfileComplete: true,
        location: { 
          city: ['서울', '부산', '대구', '인천'][i % 4],
          district: `구${i % 10}`
        }
      });
    }

    testUsers = await User.insertMany(usersData);

    // 10000개의 매치 생성
    const matchesData = [];
    for (let i = 0; i < 10000; i++) {
      const user1 = testUsers[Math.floor(Math.random() * testUsers.length)];
      let user2 = testUsers[Math.floor(Math.random() * testUsers.length)];
      
      // 같은 사용자끼리 매치되지 않도록
      while (user2._id.equals(user1._id)) {
        user2 = testUsers[Math.floor(Math.random() * testUsers.length)];
      }

      matchesData.push({
        user1: user1._id,
        user2: user2._id,
        compatibilityScore: 50 + Math.floor(Math.random() * 50),
        status: ['pending', 'mutual_match', 'expired'][Math.floor(Math.random() * 3)]
      });
    }

    testMatches = await Match.insertMany(matchesData);
  }

  test('대량 데이터에서 사용자별 매치 조회 성능', async () => {
    const testUser = testUsers[0];
    const token = generateEnhancedToken(testUser._id, TOKEN_TYPES.ACCESS);

    const startTime = Date.now();

    const response = await request(app)
      .get('/api/matches?limit=100')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(2000); // 2초 이내
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // 모든 매치가 해당 사용자와 관련되어 있는지 확인
    response.body.data.forEach(match => {
      expect(
        match.user1._id === testUser._id.toString() || 
        match.user2._id === testUser._id.toString()
      ).toBe(true);
    });
  });

  test('복잡한 조건의 매치 검색 성능', async () => {
    const testUser = testUsers[0];
    const token = generateEnhancedToken(testUser._id, TOKEN_TYPES.ACCESS);

    const startTime = Date.now();

    const response = await request(app)
      .get('/api/matches?status=mutual_match&sort=-compatibilityScore&limit=50')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(3000); // 3초 이내
    
    // 결과가 올바르게 필터링되고 정렬되었는지 확인
    let previousScore = 100;
    response.body.data.forEach(match => {
      expect(match.status).toBe('mutual_match');
      expect(match.compatibilityScore).toBeLessThanOrEqual(previousScore);
      previousScore = match.compatibilityScore;
    });
  });

  test('동시 접속 사용자 시뮬레이션', async () => {
    const concurrentRequests = 50;
    const promises = [];

    for (let i = 0; i < concurrentRequests; i++) {
      const testUser = testUsers[i % 100]; // 처음 100명 사용자 중에서 선택
      const token = generateEnhancedToken(testUser._id, TOKEN_TYPES.ACCESS);

      const promise = request(app)
        .get('/api/matches?limit=20')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      promises.push(promise);
    }

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(10000); // 10초 이내
    expect(responses).toHaveLength(concurrentRequests);

    // 각 응답이 올바른 RLS 필터링을 거쳤는지 확인
    responses.forEach((response, index) => {
      const testUser = testUsers[index % 100];
      response.body.data.forEach(match => {
        expect(
          match.user1._id === testUser._id.toString() || 
          match.user2._id === testUser._id.toString()
        ).toBe(true);
      });
    });
  });
});