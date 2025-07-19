#!/bin/bash

# CHARM_INYEON 서버 시작 스크립트
# 창우님 베타 테스터용 간편 시작 가이드

echo "🚀 CHARM_INYEON 서버 시작 중..."
echo "📍 프로젝트 디렉토리로 이동"

cd "/mnt/d/AI Projects/AI_matching platform"

echo "🔍 기존 서버 프로세스 정리 중..."
pkill -f "node server.js" 2>/dev/null
pkill -f "node frontend-server.js" 2>/dev/null
sleep 2

echo "💾 백엔드 서버 시작 (port 3000)..."
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!

echo "🎨 프론트엔드 서버 시작 (port 8080)..."
nohup node frontend-server.js > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

echo ""
echo "✅ 서버 시작 완료!"
echo ""
echo "🌐 접속 URL:"
echo "   프론트엔드: http://localhost:8080"
echo "   백엔드 API: http://localhost:3000"
echo "   상태 확인: http://localhost:3000/health"
echo ""
echo "📊 서버 프로세스 ID:"
echo "   백엔드: $BACKEND_PID"
echo "   프론트엔드: $FRONTEND_PID"
echo ""
echo "🛑 서버 종료 시:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "💝 창우님 베타 테스터 가이드:"
echo "   1. 브라우저에서 http://localhost:8080 접속"
echo "   2. 회원가입 페이지에서 체험 시작"
echo "   3. 김세렌/이매력 매칭 결과 확인"
echo ""
echo "🎯 CHARM_INYEON 준비 완료! 베타 테스터들을 초대하세요!"