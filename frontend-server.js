const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// 정적 파일 서빙 (CSS, JS, 이미지 등)
app.use(express.static(__dirname));

// 모든 요청을 index.html로 리다이렉트 (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🎨 프론트엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
  console.log(`📱 창우님 체험용 접속: http://localhost:${PORT}/index.html`);
});

module.exports = app;
