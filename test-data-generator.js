const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ValuesAssessment = require('./models/ValuesAssessment');
const { encryptionService } = require('./utils/encryption');

/**
 * 테스트 데이터 생성 스크립트
 * 암호화 오류 해결 후 깨끗한 테스트 환경 구축
 */

// MongoDB 연결
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://charm:charm2024secure@charm-cluster.xifck59.mongodb.net/?retryWrites=true&w=majority&appName=charm-cluster');
    console.log('✅ MongoDB 연결 성공');
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
}

// 테스트 사용자 데이터
const testUsers = [
  {
    email: 'test1@charm.com',
    password: 'test123!',
    name: '김철수',
    age: '40-45',
    gender: 'male',
    location: {
      city: '서울특별시',
      district: '강남구',
      coordinates: [127.0276, 37.4979]
    },
    occupation: '회사원',
    bio: '진정한 만남을 찾고 있습니다.',
    maritalStatus: 'divorced',
    hasChildren: false,
    wantsChildren: false,
  },
  {
    email: 'test2@charm.com',
    password: 'test123!',
    name: '이영희',
    age: '40-45',
    gender: 'female',
    location: {
      city: '서울특별시',
      district: '서초구',
      coordinates: [127.0276, 37.4837]
    },
    occupation: '간호사',
    bio: '새로운 시작을 원합니다.',
    maritalStatus: 'single',
    hasChildren: false,
    wantsChildren: true,
  },
  {
    email: 'test3@charm.com',
    password: 'test123!',
    name: '박민수',
    age: '51-55',
    gender: 'male',
    location: {
      city: '경기도',
      district: '성남시',
      coordinates: [127.1378, 37.4449]
    },
    occupation: '교사',
    bio: '책과 음악을 좋아합니다.',
    maritalStatus: 'divorced',
    hasChildren: true,
    wantsChildren: false,
  }
];

// 테스트 가치관 평가 데이터
const generateValuesAssessment = (userId, personalityProfile) => ({
  userId,
  answers: new Map([
    ['1', { questionId: 1, value: 'agree', text: '가족 시간이 매우 중요하다', category: 'family', timestamp: new Date() }],
    ['2', { questionId: 2, value: 'neutral', text: '일보다 개인 시간을 우선한다', category: 'career', timestamp: new Date() }],
    ['3', { questionId: 3, value: 'strongly_agree', text: '안정적인 관계를 선호한다', category: 'security', timestamp: new Date() }],
    ['4', { questionId: 4, value: 'agree', text: '새로운 경험을 즐긴다', category: 'adventure', timestamp: new Date() }],
    ['5', { questionId: 5, value: 'agree', text: '건강한 생활을 중시한다', category: 'health', timestamp: new Date() }]
  ]),
  personalityScores: personalityProfile.personality,
  valueCategories: personalityProfile.values,
  interests: personalityProfile.interests,
  lifestyle: personalityProfile.lifestyle,
  isCompleted: true,
  completedAt: new Date(),
  version: '1.0',
  totalQuestions: 20,
  answeredQuestions: 5,
  reliabilityScore: 85
});

// 다양한 성격 프로필
const personalityProfiles = [
  {
    personality: {
      openness: 75,
      conscientiousness: 80,
      extroversion: 60,
      agreeableness: 85,
      neuroticism: 30,
      optimism: 80,
      emotionalStability: 75,
      adventurousness: 65,
      intellectualCuriosity: 85,
      empathy: 90
    },
    values: {
      family: 90,
      career: 70,
      freedom: 60,
      security: 85,
      growth: 75,
      relationships: 90,
      health: 80,
      creativity: 65,
      spirituality: 50,
      adventure: 60
    },
    interests: [
      { category: 'reading', intensity: 5 },
      { category: 'cooking', intensity: 4 },
      { category: 'nature', intensity: 4 }
    ],
    lifestyle: {
      socialLevel: 'ambivert',
      activityLevel: 'moderate',
      planningStyle: 'organized',
      communicationStyle: 'diplomatic',
      conflictResolution: 'collaborative',
      decisionMaking: 'emotional',
      stressManagement: 'exercise'
    }
  },
  {
    personality: {
      openness: 85,
      conscientiousness: 70,
      extroversion: 80,
      agreeableness: 75,
      neuroticism: 25,
      optimism: 90,
      emotionalStability: 85,
      adventurousness: 85,
      intellectualCuriosity: 80,
      empathy: 85
    },
    values: {
      family: 80,
      career: 85,
      freedom: 80,
      security: 65,
      growth: 90,
      relationships: 85,
      health: 90,
      creativity: 80,
      spirituality: 40,
      adventure: 85
    },
    interests: [
      { category: 'fitness', intensity: 5 },
      { category: 'travel', intensity: 5 },
      { category: 'music', intensity: 4 }
    ],
    lifestyle: {
      socialLevel: 'extrovert',
      activityLevel: 'high',
      planningStyle: 'flexible',
      communicationStyle: 'direct',
      conflictResolution: 'competitive',
      decisionMaking: 'logical',
      stressManagement: 'social'
    }
  },
  {
    personality: {
      openness: 90,
      conscientiousness: 85,
      extroversion: 45,
      agreeableness: 80,
      neuroticism: 35,
      optimism: 75,
      emotionalStability: 80,
      adventurousness: 70,
      intellectualCuriosity: 95,
      empathy: 85
    },
    values: {
      family: 85,
      career: 75,
      freedom: 70,
      security: 80,
      growth: 95,
      relationships: 80,
      health: 75,
      creativity: 90,
      spirituality: 60,
      adventure: 70
    },
    interests: [
      { category: 'reading', intensity: 5 },
      { category: 'arts', intensity: 4 },
      { category: 'education', intensity: 5 }
    ],
    lifestyle: {
      socialLevel: 'introvert',
      activityLevel: 'moderate',
      planningStyle: 'organized',
      communicationStyle: 'analytical',
      conflictResolution: 'accommodating',
      decisionMaking: 'logical',
      stressManagement: 'solitude'
    }
  }
];

// 데이터베이스 초기화
async function clearDatabase() {
  try {
    await User.deleteMany({});
    await ValuesAssessment.deleteMany({});
    console.log('✅ 기존 데이터 정리 완료');
  } catch (error) {
    console.error('❌ 데이터 정리 실패:', error);
  }
}

// 테스트 사용자 생성
async function createTestUsers() {
  const createdUsers = [];
  
  for (let i = 0; i < testUsers.length; i++) {
    const userData = testUsers[i];
    
    try {
      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // 사용자 생성
      const user = new User({
        ...userData,
        password: hashedPassword,
        isVerified: true,
        verificationToken: null,
        lastActive: new Date(),
        profileCompleteness: 85
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      
      console.log(`✅ 사용자 생성: ${userData.name} (${userData.email})`);
      
      // 가치관 평가 생성
      const assessmentData = generateValuesAssessment(savedUser._id, personalityProfiles[i]);
      const assessment = new ValuesAssessment(assessmentData);
      await assessment.save();
      
      console.log(`✅ 가치관 평가 생성: ${userData.name}`);
      
    } catch (error) {
      console.error(`❌ 사용자 생성 실패 (${userData.name}):`, error.message);
    }
  }
  
  return createdUsers;
}

// 암호화 검증
async function validateEncryption() {
  try {
    console.log('\n=== 암호화 시스템 검증 ===');
    
    const result = encryptionService.validateEncryption();
    console.log('암호화 검증 결과:', result);
    
    if (result.isValid) {
      console.log('✅ 암호화 시스템 정상 작동');
    } else {
      console.log('❌ 암호화 시스템 오류:', result.error);
    }
    
    // 실제 데이터로 테스트
    const testData = { test: '한국어 테스트 데이터', number: 123 };
    const encrypted = encryptionService.encryptAssessment(JSON.stringify(testData));
    const decrypted = JSON.parse(encryptionService.decryptAssessment(encrypted));
    
    console.log('테스트 데이터 암호화/복호화:', {
      original: testData,
      decrypted: decrypted,
      success: JSON.stringify(testData) === JSON.stringify(decrypted)
    });
    
  } catch (error) {
    console.error('❌ 암호화 검증 실패:', error);
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 테스트 데이터 생성 시작...\n');
  
  await connectDB();
  await validateEncryption();
  await clearDatabase();
  
  const users = await createTestUsers();
  
  console.log(`\n✅ 테스트 데이터 생성 완료!`);
  console.log(`- 생성된 사용자 수: ${users.length}`);
  console.log(`- 생성된 가치관 평가 수: ${users.length}`);
  
  // 생성된 데이터 검증
  const userCount = await User.countDocuments();
  const assessmentCount = await ValuesAssessment.countDocuments();
  
  console.log(`\n📊 데이터베이스 상태:`);
  console.log(`- User 컬렉션: ${userCount}개 문서`);
  console.log(`- ValuesAssessment 컬렉션: ${assessmentCount}개 문서`);
  
  // 첫 번째 사용자의 가치관 평가 데이터 확인
  if (users.length > 0) {
    const firstAssessment = await ValuesAssessment.findOne({ userId: users[0]._id });
    console.log(`\n🔍 첫 번째 사용자 가치관 평가 확인:`);
    console.log(`- 완료 여부: ${firstAssessment.isCompleted}`);
    console.log(`- 답변 수: ${firstAssessment.answeredQuestions}`);
    console.log(`- 가치관 카테고리 수: ${Object.keys(firstAssessment.valueCategories).length}`);
    console.log(`- 성격점수 수: ${Object.keys(firstAssessment.personalityScores).length}`);
  }
  
  await mongoose.disconnect();
  console.log('\n🎉 테스트 데이터 생성 프로세스 완료!');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 실행 중 오류 발생:', error);
    process.exit(1);
  });
}

module.exports = { main, createTestUsers, validateEncryption };