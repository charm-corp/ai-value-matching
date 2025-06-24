#!/bin/bash

# Claude Code 세션 래퍼 - 모든 대화와 명령을 자동 기록

PROJECT_ROOT="/mnt/d/AI Projects/AI_matching platform"
SCRIPT_DIR="$PROJECT_ROOT/dev-history/scripts"
SESSION_NAME="${1:-default}"

echo "=== Claude Code 개발 세션 시작 ==="
echo "세션명: $SESSION_NAME"
echo "시작 시간: $(date)"
echo "프로젝트: $(basename "$PROJECT_ROOT")"
echo ""

# 세션 시작 로깅
node "$SCRIPT_DIR/conversation-logger.js" start-session "$SESSION_NAME"

# 현재 상태 스냅샷
{
    echo "# 세션 시작 시점 상태"
    echo ""
    echo "## Git 상태"
    git status 2>/dev/null || echo "Git 저장소 아님"
    echo ""
    echo "## 최근 커밋"
    git log --oneline -5 2>/dev/null || echo "Git 히스토리 없음"
    echo ""
    echo "## 환경 정보"
    echo "- Claude 버전: $(claude --version 2>/dev/null || echo 'N/A')"
    echo "- Node.js 버전: $(node --version 2>/dev/null || echo 'N/A')"
    echo "- 현재 디렉토리: $(pwd)"
} > "/tmp/claude_session_start_$SESSION_NAME.md"

node "$SCRIPT_DIR/conversation-logger.js" log-conversation "세션_시작_$SESSION_NAME" "$(cat "/tmp/claude_session_start_$SESSION_NAME.md")"

echo "세션 로깅이 활성화되었습니다."
echo "개발을 시작하세요. 모든 활동이 자동으로 기록됩니다."
echo ""
echo "유용한 명령어:"
echo "- dev-log 'message'     : 개발 로그 기록"
echo "- save-conversation     : 현재 대화 저장"
echo "- backup-history        : 전체 히스토리 백업"