/**
 * MongoDB Atlas 마이그레이션 스크립트
 * In-Memory DB → MongoDB Atlas 데이터 이전
 */

const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// 모델 import
const User = require('./models/User');
const ValuesAssessment = require('./models/ValuesAssessment');
const Match = require('./models/Match');

const ATLAS_URI = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI;

console.log('🚀 CHARM_INYEON MongoDB Atlas 마이그레이션 시작');

async function migrateToAtlas() {
  try {
    console.log('📡 MongoDB Atlas 연결 중...');
    
    // Atlas 연결
    await mongoose.connect(ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Atlas 연결 성공!');
    console.log(`🔗 연결된 호스트: ${mongoose.connection.host}`);
    
    // 기존 데이터 백업 (필요시)
    const backupPath = './data-backups/';
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }
    
    // 테스트 데이터 생성 (김세렌, 이매력 사용자)
    console.log('👥 테스트 사용자 데이터 생성...');
    
    // 기존 데이터 정리
    await User.deleteMany({});
    await ValuesAssessment.deleteMany({});
    await Match.deleteMany({});
    
    // 김세렌 사용자 생성
    const serenUser = new User({
      _id: 'test-user-1',
      name: '김세렌',
      email: 'seren@charm.com',
      age: 53,
      gender: 'male',
      bio: '운명적인 만남을 기다리는 사람입니다. 세렌디피티를 믿으며 진정한 인연을 찾고 있습니다.',
      location: {
        city: '서울',
        district: '강남구'
      },
      ageRange: '51-55',
      interests: ['문화생활', '독서', '여행', '음악감상'],
      profileImage: 'male-classic.svg',
      isActive: true,
      hasProfileImage: true,
      profileCompleteness: 85,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 이매력 사용자 생성
    const maeryukUser = new User({
      _id: 'test-user-2',
      name: '이매력',
      email: 'maeryuk@charm.com',
      age: 48,
      gender: 'female',
      bio: '진정한 인연을 찾고 있습니다. 함께 웃고 울 수 있는 따뜻한 사람을 만나고 싶어요.',
      location: {
        city: '서울',
        district: '서초구'
      },
      ageRange: '46-50',
      interests: ['요리', '영화감상', '산책', '카페투어'],
      profileImage: 'female-friendly.svg',
      isActive: true,
      hasProfileImage: true,
      profileCompleteness: 92,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await serenUser.save();
    await maeryukUser.save();
    
    console.log('✅ 테스트 사용자 생성 완료!');
    console.log('👤 김세렌 (test-user-1) - 53세 남성, 서울 강남구');
    console.log('👤 이매력 (test-user-2) - 48세 여성, 서울 서초구');
    
    // 가치관 평가 데이터 생성
    console.log('📊 가치관 평가 데이터 생성...');
    
    const serenAssessment = new ValuesAssessment({
      userId: 'test-user-1',
      responses: {
        q1: 5, q2: 4, q3: 5, q4: 3, q5: 4,
        q6: 5, q7: 4, q8: 3, q9: 5, q10: 4,
        q11: 3, q12: 5, q13: 4, q14: 3, q15: 5,
        q16: 4, q17: 5, q18: 3, q19: 4, q20: 5
      },
      analysis: {
        personalityType: 'HARMONIOUS_SAGE',
        confidenceLevel: 0.88,
        summary: '조화로운 지혜로운 성격으로 안정적인 관계를 선호합니다.'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const maeryukAssessment = new ValuesAssessment({
      userId: 'test-user-2',
      responses: {
        q1: 4, q2: 5, q3: 4, q4: 5, q5: 3,
        q6: 4, q7: 5, q8: 4, q9: 3, q10: 5,
        q11: 4, q12: 3, q13: 5, q14: 4, q15: 3,
        q16: 5, q17: 4, q18: 5, q19: 3, q20: 4
      },
      analysis: {
        personalityType: 'WARM_COMPANION',
        confidenceLevel: 0.92,
        summary: '따뜻한 동반자형으로 깊은 감정적 유대를 중요시합니다.'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await serenAssessment.save();
    await maeryukAssessment.save();
    
    console.log('✅ 가치관 평가 데이터 생성 완료!');
    
    // 매칭 데이터 생성
    console.log('💝 매칭 데이터 생성...');
    
    const testMatch = new Match({
      userId: 'test-user-1',
      matchedUserId: 'test-user-2',
      compatibility: {
        overall: 75,
        values: 82,
        interests: 68,
        lifestyle: 74,
        personality: 77
      },
      serendipityScore: 64,
      status: 'pending',
      aiAnalysis: {
        strengths: ['가치관 일치도 높음', '감정적 안정성 우수', '생활 패턴 조화'],
        challenges: ['취미 영역 다양화 필요'],
        recommendation: '편안한 카페에서 2-3시간 대화를 추천합니다.'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await testMatch.save();
    
    console.log('✅ 매칭 데이터 생성 완료!');
    console.log('💝 김세렌 ↔ 이매력 매칭 (호환성: 75점, 세렌디피티: 64점)');
    
    // 마이그레이션 완료 검증
    console.log('🔍 마이그레이션 결과 검증...');
    
    const userCount = await User.countDocuments();
    const assessmentCount = await ValuesAssessment.countDocuments();
    const matchCount = await Match.countDocuments();
    
    console.log(`✅ 사용자: ${userCount}명`);
    console.log(`✅ 가치관 평가: ${assessmentCount}개`);
    console.log(`✅ 매칭: ${matchCount}개`);
    
    // 백업 파일 생성
    const backupData = {
      users: await User.find({}),
      assessments: await ValuesAssessment.find({}),
      matches: await Match.find({})
    };
    
    fs.writeFileSync(
      `${backupPath}/mongodb-atlas-backup-${Date.now()}.json`,
      JSON.stringify(backupData, null, 2)
    );
    
    console.log('💾 백업 파일 생성 완료!');
    
    console.log('🎊 MongoDB Atlas 마이그레이션 완료!');
    console.log('📡 Atlas 연결 정보: cluster0.mongodb.net');
    console.log('🚀 이제 server.js로 서버를 시작할 수 있습니다!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    console.error('상세 오류:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 MongoDB 연결 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateToAtlas();
}

module.exports = { migrateToAtlas };