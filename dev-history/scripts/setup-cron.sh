#!/bin/bash

# 정기 백업을 위한 cron 작업 설정

PROJECT_ROOT="/mnt/d/AI Projects/AI_matching platform"
BACKUP_SCRIPT="$PROJECT_ROOT/dev-history/scripts/auto-backup.sh"

echo "=== 자동 백업 Cron 작업 설정 ==="

# 현재 crontab 백업
crontab -l > /tmp/current_crontab 2>/dev/null || touch /tmp/current_crontab

# 이미 설정된 백업 작업이 있는지 확인
if grep -q "dev-history.*auto-backup" /tmp/current_crontab; then
    echo "이미 백업 작업이 설정되어 있습니다."
    echo "현재 설정:"
    grep "dev-history.*auto-backup" /tmp/current_crontab
else
    echo "새로운 백업 작업을 추가합니다..."
    
    # 새 cron 작업 추가 (매일 자정에 백업)
    echo "# AI 매칭 플랫폼 개발 히스토리 자동 백업" >> /tmp/current_crontab
    echo "0 0 * * * $BACKUP_SCRIPT" >> /tmp/current_crontab
    
    # crontab 적용
    crontab /tmp/current_crontab
    
    echo "백업 작업이 추가되었습니다:"
    echo "- 매일 자정 (00:00)에 자동 백업 실행"
    echo "- 백업 파일: $PROJECT_ROOT/dev-history/backups/"
fi

# 임시 파일 정리
rm -f /tmp/current_crontab

echo ""
echo "현재 설정된 모든 cron 작업:"
crontab -l