const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Match = require('../models/Match');
const ValuesAssessment = require('../models/ValuesAssessment');
const advancedMatchingService = require('../services/advancedMatchingService');
const { generateTestToken } = require('./helpers/auth');

describe('Advanced Matching System', () => {
  let testUsers = [];
  let authTokens = [];

  beforeAll(async () => {
    // 테스트용 사용자 데이터 생성
    const testUserData = [
      {
        email: 'user1@test.com',
        password: 'password123',
        name: '김철수',
        age: '46-50',
        gender: 'male',
        maritalStatus: 'divorced',
        hasChildren: true,
        childrenInfo: {
          number: 2,
          ages: ['teen', 'adult'],
          custody: 'shared',
          livingWith: false
        },
        occupation: {
          industry: 'finance',
          position: 'senior',
          workSchedule: 'full_time',
          income: '70_100'
        },
        lifestyle: {
          livingArrangement: 'alone',
          homeOwnership: 'own',
          fitnessLevel: 'active',
          socialLevel: 'ambivert',
          travelFrequency: 'occasionally'
        },
        location: {
          city: '서울시',
          district: '강남구',
          coordinates: [127.047, 37.517]
        },
        preferences: {
          matching: {
            ageRange: { min: 40, max: 55 },
            distance: 30,
            genderPreference: 'female',
            maritalStatusPreference: ['divorced', 'widowed'],
            childrenPreference: 'has_children',
            occupationImportance: 3,
            lifestyleImportance: 4
          }
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'user2@test.com',
        password: 'password123',
        name: '이영희',
        age: '51-55',
        gender: 'female',
        maritalStatus: 'divorced',
        hasChildren: true,
        childrenInfo: {
          number: 1,
          ages: ['adult'],
          custody: 'full',
          livingWith: false
        },
        occupation: {
          industry: 'education',
          position: 'senior',
          workSchedule: 'full_time',
          income: '50_70'
        },
        lifestyle: {
          livingArrangement: 'alone',
          homeOwnership: 'own',
          fitnessLevel: 'moderate',
          socialLevel: 'ambivert',
          travelFrequency: 'frequently'
        },
        location: {
          city: '서울시',
          district: '서초구',
          coordinates: [127.032, 37.485]
        },
        preferences: {
          matching: {
            ageRange: { min: 45, max: 60 },
            distance: 25,
            genderPreference: 'male',
            maritalStatusPreference: ['divorced', 'single'],
            childrenPreference: 'no_preference',
            occupationImportance: 4,
            lifestyleImportance: 3
          }
        },
        isVerified: true,
        isActive: true
      },
      {
        email: 'user3@test.com',
        password: 'password123',
        name: '박민수',
        age: '56-60',
        gender: 'male',
        maritalStatus: 'widowed',
        hasChildren: false,
        occupation: {
          industry: 'retired',
          position: 'retired',
          workSchedule: 'retired'
        },
        lifestyle: {
          livingArrangement: 'alone',
          homeOwnership: 'own',
          fitnessLevel: 'moderate',
          socialLevel: 'introvert',
          travelFrequency: 'rarely'
        },
        location: {
          city: '서울시',
          district: '마포구',
          coordinates: [126.905, 37.556]
        },
        preferences: {
          matching: {
            ageRange: { min: 50, max: 65 },
            distance: 40,
            genderPreference: 'female',
            maritalStatusPreference: ['widowed', 'divorced'],
            childrenPreference: 'no_children',
            occupationImportance: 2,
            lifestyleImportance: 5
          }
        },
        isVerified: true,
        isActive: true
      }
    ];

    // 사용자 생성
    for (const userData of testUserData) {
      const user = new User(userData);
      await user.save();
      testUsers.push(user);
      authTokens.push(generateTestToken(user._id));
    }

    // 가치관 평가 데이터 생성
    const assessmentData = [
      {
        userId: testUsers[0]._id,
        values: {
          family: 8,
          career: 7,
          freedom: 6,
          security: 9,
          growth: 7,
          relationships: 8,
          health: 8,
          creativity: 5,
          spirituality: 4,
          adventure: 6
        },
        personalityScores: {
          openness: 6,
          conscientiousness: 8,
          extroversion: 7,
          agreeableness: 8,
          neuroticism: 4,
          optimism: 7,
          emotionalStability: 8,
          adventurousness: 5,
          intellectualCuriosity: 7,
          empathy: 8
        },
        lifestyle: {
          socialLevel: 'ambivert',
          activityLevel: 'active',
          planningStyle: 'structured',
          communicationStyle: 'direct',
          conflictResolution: 'collaborative',
          decisionMaking: 'analytical',
          stressManagement: 'exercise'
        },
        isCompleted: true
      },
      {
        userId: testUsers[1]._id,
        values: {
          family: 9,
          career: 6,
          freedom: 7,
          security: 8,
          growth: 8,
          relationships: 9,
          health: 7,
          creativity: 7,
          spirituality: 6,
          adventure: 7
        },
        personalityScores: {
          openness: 7,
          conscientiousness: 8,
          extroversion: 6,
          agreeableness: 9,
          neuroticism: 3,
          optimism: 8,
          emotionalStability: 8,
          adventurousness: 7,
          intellectualCuriosity: 8,
          empathy: 9
        },
        lifestyle: {
          socialLevel: 'ambivert',
          activityLevel: 'moderate',
          planningStyle: 'flexible',
          communicationStyle: 'supportive',
          conflictResolution: 'collaborative',
          decisionMaking: 'intuitive',
          stressManagement: 'meditation'
        },
        isCompleted: true
      },
      {
        userId: testUsers[2]._id,
        values: {
          family: 6,
          career: 3,
          freedom: 8,
          security: 9,
          growth: 5,
          relationships: 7,
          health: 9,
          creativity: 4,
          spirituality: 8,
          adventure: 4
        },
        personalityScores: {
          openness: 5,
          conscientiousness: 9,
          extroversion: 4,
          agreeableness: 7,
          neuroticism: 6,
          optimism: 6,
          emotionalStability: 7,
          adventurousness: 3,
          intellectualCuriosity: 6,
          empathy: 7
        },
        lifestyle: {
          socialLevel: 'introvert',
          activityLevel: 'moderate',
          planningStyle: 'structured',
          communicationStyle: 'analytical',
          conflictResolution: 'avoidant',
          decisionMaking: 'analytical',
          stressManagement: 'reading'
        },
        isCompleted: true
      }
    ];

    for (const data of assessmentData) {
      const assessment = new ValuesAssessment(data);
      await assessment.save();
    }
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    await ValuesAssessment.deleteMany({ userId: { $in: testUsers.map(u => u._id) } });
    await Match.deleteMany({
      $or: [
        { user1: { $in: testUsers.map(u => u._id) } },
        { user2: { $in: testUsers.map(u => u._id) } }
      ]
    });
  });

  describe('고도화된 호환성 점수 계산', () => {
    test('중장년층 특화 호환성 점수가 올바르게 계산되어야 함', async () => {
      const user1 = testUsers[0]; // 46-50, 이혼, 자녀 있음, 금융업
      const user2 = testUsers[1]; // 51-55, 이혼, 자녀 있음, 교육업

      const compatibility = await advancedMatchingService.calculateCompatibilityScore(user1, user2);

      expect(compatibility.totalScore).toBeGreaterThan(60);
      expect(compatibility.breakdown).toHaveProperty('valuesAlignment');
      expect(compatibility.breakdown).toHaveProperty('maritalStatusCompatibility');
      expect(compatibility.breakdown).toHaveProperty('childrenCompatibility');
      expect(compatibility.breakdown).toHaveProperty('occupationCompatibility');
      expect(compatibility.breakdown).toHaveProperty('locationCompatibility');
      expect(compatibility.breakdown).toHaveProperty('ageCompatibility');
    });

    test('결혼 상태 호환성이 올바르게 계산되어야 함', async () => {
      const user1 = testUsers[0]; // divorced
      const user2 = testUsers[1]; // divorced
      const user3 = testUsers[2]; // widowed

      const compatibility1_2 = await advancedMatchingService.calculateCompatibilityScore(user1, user2);
      const compatibility1_3 = await advancedMatchingService.calculateCompatibilityScore(user1, user3);

      // 같은 결혼 상태끼리 더 높은 점수
      expect(compatibility1_2.breakdown.maritalStatusCompatibility)
        .toBeGreaterThan(compatibility1_3.breakdown.maritalStatusCompatibility);
    });

    test('자녀 유무 호환성이 올바르게 계산되어야 함', async () => {
      const user1 = testUsers[0]; // 자녀 있음
      const user2 = testUsers[1]; // 자녀 있음
      const user3 = testUsers[2]; // 자녀 없음

      const compatibility1_2 = await advancedMatchingService.calculateCompatibilityScore(user1, user2);
      const compatibility1_3 = await advancedMatchingService.calculateCompatibilityScore(user1, user3);

      // 자녀 유무가 같을 때 더 높은 점수
      expect(compatibility1_2.breakdown.childrenCompatibility)
        .toBeGreaterThan(compatibility1_3.breakdown.childrenCompatibility);
    });

    test('지역 접근성이 올바르게 계산되어야 함', async () => {
      const user1 = testUsers[0]; // 강남구
      const user2 = testUsers[1]; // 서초구 (근거리)
      const user3 = testUsers[2]; // 마포구 (원거리)

      const compatibility1_2 = await advancedMatchingService.calculateCompatibilityScore(user1, user2);
      const compatibility1_3 = await advancedMatchingService.calculateCompatibilityScore(user1, user3);

      // 더 가까운 거리일 때 더 높은 점수
      expect(compatibility1_2.breakdown.locationCompatibility)
        .toBeGreaterThan(compatibility1_3.breakdown.locationCompatibility);
    });
  });

  describe('잠재적 매치 찾기', () => {
    test('사용자 선호도에 맞는 후보들을 찾아야 함', async () => {
      const user1 = testUsers[0];
      const potentialMatches = await advancedMatchingService.findPotentialMatches(user1._id, 10);

      expect(Array.isArray(potentialMatches)).toBe(true);
      
      potentialMatches.forEach(match => {
        expect(match).toHaveProperty('user');
        expect(match).toHaveProperty('compatibilityScore');
        expect(match).toHaveProperty('compatibilityBreakdown');
        expect(match.compatibilityScore).toBeGreaterThanOrEqual(60);
      });
    });

    test('필터링 조건이 올바르게 적용되어야 함', async () => {
      const user1 = testUsers[0]; // 선호: female, divorced/widowed, 40-55세
      const potentialMatches = await advancedMatchingService.findPotentialMatches(user1._id, 10);

      potentialMatches.forEach(match => {
        const candidate = match.user;
        
        // 성별 필터링 확인
        if (user1.preferences.matching.genderPreference !== 'both') {
          expect(candidate.gender).toBe(user1.preferences.matching.genderPreference);
        }
        
        // 자신은 제외되어야 함
        expect(candidate._id.toString()).not.toBe(user1._id.toString());
      });
    });
  });

  describe('API 엔드포인트 테스트', () => {
    test('POST /api/matching/generate - 고도화된 매칭 생성', async () => {
      const response = await request(app)
        .post('/api/matching/generate')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('matches');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.matches)).toBe(true);
    });

    test('GET /api/advanced-matching/potential-matches', async () => {
      const response = await request(app)
        .get('/api/advanced-matching/potential-matches?limit=5&minScore=70')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('matches');
      expect(response.body.data.filters.minScore).toBe(70);
      expect(response.body.data.filters.limit).toBe(5);
    });

    test('GET /api/advanced-matching/compatibility/:userId', async () => {
      const user1 = testUsers[0];
      const user2 = testUsers[1];

      const response = await request(app)
        .get(`/api/advanced-matching/compatibility/${user2._id}`)
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('compatibility');
      expect(response.body.data.compatibility).toHaveProperty('totalScore');
      expect(response.body.data.compatibility).toHaveProperty('breakdown');
    });

    test('GET /api/advanced-matching/match-analysis', async () => {
      // 먼저 매치 생성
      await request(app)
        .post('/api/matching/generate')
        .set('Authorization', `Bearer ${authTokens[0]}`);

      const response = await request(app)
        .get('/api/advanced-matching/match-analysis')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('analysis');
      expect(response.body.data.analysis).toHaveProperty('totalMatches');
      expect(response.body.data.analysis).toHaveProperty('ageDistribution');
      expect(response.body.data.analysis).toHaveProperty('maritalStatusDistribution');
    });

    test('POST /api/advanced-matching/preferences-optimization', async () => {
      const response = await request(app)
        .post('/api/advanced-matching/preferences-optimization')
        .set('Authorization', `Bearer ${authTokens[0]}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentPreferences');
      expect(response.body.data).toHaveProperty('optimizationSuggestions');
      expect(Array.isArray(response.body.data.optimizationSuggestions)).toBe(true);
    });
  });

  describe('매칭 알고리즘 성능 테스트', () => {
    test('대량의 사용자에 대한 매칭 성능', async () => {
      const startTime = Date.now();
      
      const potentialMatches = await advancedMatchingService.findPotentialMatches(
        testUsers[0]._id, 
        20
      );
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 2초 이내에 완료되어야 함
      expect(executionTime).toBeLessThan(2000);
      expect(Array.isArray(potentialMatches)).toBe(true);
    });

    test('호환성 점수 계산 성능', async () => {
      const user1 = testUsers[0];
      const user2 = testUsers[1];
      
      const startTime = Date.now();
      
      await advancedMatchingService.calculateCompatibilityScore(user1, user2);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 500ms 이내에 완료되어야 함
      expect(executionTime).toBeLessThan(500);
    });
  });

  describe('엣지 케이스 테스트', () => {
    test('가치관 평가가 없는 사용자 처리', async () => {
      // 가치관 평가가 없는 새 사용자 생성
      const newUser = new User({
        email: 'noassessment@test.com',
        password: 'password123',
        name: '평가없음',
        age: '46-50',
        gender: 'male',
        isVerified: true,
        isActive: true
      });
      await newUser.save();

      const potentialMatches = await advancedMatchingService.findPotentialMatches(newUser._id, 5);
      
      // 가치관 평가가 없어도 기본적인 매칭은 가능해야 함
      expect(Array.isArray(potentialMatches)).toBe(true);
      
      await User.findByIdAndDelete(newUser._id);
    });

    test('위치 정보가 없는 사용자 처리', async () => {
      const userWithoutLocation = new User({
        email: 'nolocation@test.com',
        password: 'password123',
        name: '위치없음',
        age: '46-50',
        gender: 'female',
        isVerified: true,
        isActive: true
      });
      await userWithoutLocation.save();

      const user1 = testUsers[0];
      const compatibility = await advancedMatchingService.calculateCompatibilityScore(
        user1, 
        userWithoutLocation
      );

      // 위치 정보가 없어도 호환성 계산이 가능해야 함
      expect(compatibility.totalScore).toBeGreaterThan(0);
      expect(compatibility.breakdown.locationCompatibility).toBeDefined();
      
      await User.findByIdAndDelete(userWithoutLocation._id);
    });
  });
});