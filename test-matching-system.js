const mongoose = require('mongoose');
const User = require('./models/User');
const ValuesAssessment = require('./models/ValuesAssessment');
const advancedMatchingService = require('./services/advancedMatchingService');

async function testMatchingSystem() {
  try {
    await mongoose.connect(
      'mongodb+srv://charm:charm2024secure@charm-cluster.xifck59.mongodb.net/?retryWrites=true&w=majority&appName=charm-cluster'
    );
    console.log('✅ MongoDB 연결 성공');

    // 테스트 사용자들 가져오기
    const user1 = await User.findOne({ email: 'test1@charm.com' });
    const user2 = await User.findOne({ email: 'test2@charm.com' });
    const user3 = await User.findOne({ email: 'test3@charm.com' });

    if (!user1 || !user2 || !user3) {
      console.log('❌ 테스트 사용자를 찾을 수 없습니다');
      process.exit(1);
    }

    console.log('✅ 테스트 사용자들:', {
      user1: user1.name,
      user2: user2.name,
      user3: user3.name,
    });

    // 가치관 평가 데이터 확인
    const assessment1 = await ValuesAssessment.findOne({ userId: user1._id });
    const assessment2 = await ValuesAssessment.findOne({ userId: user2._id });
    const assessment3 = await ValuesAssessment.findOne({ userId: user3._id });

    console.log('✅ 가치관 평가 데이터 확인:', {
      user1_assessment: !!assessment1,
      user2_assessment: !!assessment2,
      user3_assessment: !!assessment3,
      user1_completed: assessment1?.isCompleted,
      user2_completed: assessment2?.isCompleted,
      user3_completed: assessment3?.isCompleted,
    });

    // 내장 호환성 점수 테스트
    if (assessment1 && assessment2) {
      try {
        const score12 = assessment1.calculateCompatibilityWith(assessment2);
        console.log('✅ 내장 호환성 점수 (김철수 ↔ 이영희):', score12);
      } catch (error) {
        console.error('❌ 내장 호환성 계산 오류:', error.message);
      }
    }

    if (assessment1 && assessment3) {
      try {
        const score13 = assessment1.calculateCompatibilityWith(assessment3);
        console.log('✅ 내장 호환성 점수 (김철수 ↔ 박민수):', score13);
      } catch (error) {
        console.error('❌ 내장 호환성 계산 오류:', error.message);
      }
    }

    // 고급 매칭 서비스 테스트
    try {
      const compatibility12 = await advancedMatchingService.calculateCompatibilityScore(
        user1,
        user2
      );
      console.log('✅ 고급 매칭 호환성 점수 (김철수 ↔ 이영희):', compatibility12);
    } catch (error) {
      console.error('❌ 고급 매칭 점수 계산 오류:', error.message);
    }

    try {
      const compatibility13 = await advancedMatchingService.calculateCompatibilityScore(
        user1,
        user3
      );
      console.log('✅ 고급 매칭 호환성 점수 (김철수 ↔ 박민수):', compatibility13);
    } catch (error) {
      console.error('❌ 고급 매칭 점수 계산 오류:', error.message);
    }

    // 잠재적 매치 찾기 테스트
    try {
      const potentialMatches = await advancedMatchingService.findPotentialMatches(user1._id, 5);
      console.log('✅ 잠재적 매치 결과 (김철수):', {
        count: potentialMatches.length,
        matches: potentialMatches.map(m => ({
          name: m.user.name,
          score: m.compatibilityScore?.totalScore || 'N/A',
        })),
      });
    } catch (error) {
      console.error('❌ 잠재적 매치 찾기 오류:', error.message);
    }

    await mongoose.disconnect();
    console.log('🎉 매칭 시스템 테스트 완료!');
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    process.exit(1);
  }
}

testMatchingSystem();
