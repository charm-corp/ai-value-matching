// Microsoft Edge 브라우저 호환성을 위한 빈 content.js 파일
// 이 파일은 Edge 브라우저의 내부 스크립트 참조 오류를 방지합니다

console.log('✅ CHARM_INYEON - Edge 브라우저 호환성 파일 로드됨');

// 빈 객체를 export하여 스크립트 로딩 오류 방지
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}
