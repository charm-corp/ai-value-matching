# 개발 히스토리 추적 시스템

## 개요
이 시스템은 모든 개발 활동, 코드 변경사항, Claude Code와의 대화 내용을 자동으로 기록하고 보관합니다.

## 구조
```
dev-history/
├── conversations/     # Claude Code 대화 기록
├── code-changes/      # 코드 변경 히스토리
├── daily-logs/        # 일별 개발 로그
├── backups/          # 정기 백업 파일
└── scripts/          # 자동화 스크립트
```

## 사용법
1. `npm run dev-log` - 개발 세션 시작
2. `npm run save-conversation` - 대화 내용 저장
3. `npm run backup-history` - 히스토리 백업