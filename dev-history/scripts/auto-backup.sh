#!/bin/bash

# 자동 백업 스크립트
# 개발 히스토리, 코드, 대화 내용을 정기적으로 백업

PROJECT_ROOT="/mnt/d/AI Projects/AI_matching platform"
BACKUP_DIR="$PROJECT_ROOT/dev-history/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="dev_backup_$DATE"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

echo "=== 개발 히스토리 자동 백업 시작 ==="
echo "백업 시간: $(date)"
echo "백업 경로: $BACKUP_DIR/$BACKUP_NAME"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# 1. 개발 히스토리 백업
echo "1. 개발 히스토리 백업 중..."
cp -r "$PROJECT_ROOT/dev-history/conversations" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null
cp -r "$PROJECT_ROOT/dev-history/daily-logs" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null
cp -r "$PROJECT_ROOT/dev-history/code-changes" "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null

# 2. 프로젝트 소스코드 백업 (node_modules 제외)
echo "2. 소스코드 백업 중..."
rsync -av --exclude='node_modules' --exclude='uploads' --exclude='.git' \
    "$PROJECT_ROOT/" "$BACKUP_DIR/$BACKUP_NAME/source/" 

# 3. Git 히스토리 백업
echo "3. Git 히스토리 백업 중..."
cd "$PROJECT_ROOT"
if [ -d ".git" ]; then
    git log --oneline --all > "$BACKUP_DIR/$BACKUP_NAME/git_history.txt"
    git status > "$BACKUP_DIR/$BACKUP_NAME/git_status.txt"
fi

# 4. 환경 정보 백업
echo "4. 환경 정보 백업 중..."
{
    echo "=== 백업 정보 ==="
    echo "백업 날짜: $(date)"
    echo "Claude 버전: $(claude --version 2>/dev/null || echo 'N/A')"
    echo "Node.js 버전: $(node --version 2>/dev/null || echo 'N/A')"
    echo "NPM 버전: $(npm --version 2>/dev/null || echo 'N/A')"
    echo "프로젝트 경로: $PROJECT_ROOT"
    echo ""
    echo "=== 설치된 패키지 ==="
    cat "$PROJECT_ROOT/package.json" 2>/dev/null || echo "package.json not found"
} > "$BACKUP_DIR/$BACKUP_NAME/backup_info.txt"

# 5. 압축 백업 생성
echo "5. 백업 압축 중..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME/"
rm -rf "$BACKUP_NAME"

# 6. 오래된 백업 정리 (30일 이상)
echo "6. 오래된 백업 정리 중..."
find "$BACKUP_DIR" -name "dev_backup_*.tar.gz" -mtime +30 -delete

echo "=== 백업 완료 ==="
echo "백업 파일: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "백업 크기: $(du -sh "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)"
echo ""

# 백업 로그 업데이트
echo "$(date): 백업 완료 - $BACKUP_NAME.tar.gz" >> "$BACKUP_DIR/backup_log.txt"