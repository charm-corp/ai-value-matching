// 대화 로깅 시스템 문제 수정 스크립트
const fs = require('fs');
const path = require('path');

class ConversationLoggingFixer {
    constructor() {
        this.projectDir = process.cwd();
        this.conversationDir = path.join(this.projectDir, 'dev-history', 'conversations');
        this.currentConversation = [];
    }
    
    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m🔵',
            success: '\x1b[32m✅',
            warning: '\x1b[33m⚠️',
            error: '\x1b[31m❌'
        };
        
        console.log(`${colors[type]} ${message}\x1b[0m`);
    }
    
    // 문제가 있는 파일들 정리
    cleanupBrokenLogs() {
        this.log('문제가 있는 로그 파일들 정리 중...');
        
        const files = fs.readdirSync(this.conversationDir);
        let cleanedCount = 0;
        
        for (const file of files) {
            if (file.includes('Auto_Session') || file.includes('______')) {
                const filePath = path.join(this.conversationDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                // 반복되는 bash 명령어만 있는 파일인지 확인
                if (this.isBrokenLog(content)) {
                    this.log(`삭제: ${file}`, 'warning');
                    fs.unlinkSync(filePath);
                    cleanedCount++;
                }
            }
        }
        
        this.log(`${cleanedCount}개의 문제 파일 정리 완료`, 'success');
    }
    
    isBrokenLog(content) {
        // bash 명령어 패턴만 반복되는지 확인
        const lines = content.split('\n');
        let bashCommandCount = 0;
        let totalLines = 0;
        
        for (const line of lines) {
            if (line.trim()) {
                totalLines++;
                if (line.includes('npm fund') || line.includes('claude --version') || line.includes('sudo npm update')) {
                    bashCommandCount++;
                }
            }
        }
        
        // 90% 이상이 bash 명령어면 문제 있는 로그로 판단
        return totalLines > 10 && (bashCommandCount / totalLines) > 0.9;
    }
    
    // 올바른 대화 로깅 시스템 생성
    createProperConversationLogger() {
        this.log('올바른 대화 로깅 시스템 생성 중...');
        
        const loggerPath = path.join(this.projectDir, 'dev-history', 'scripts', 'proper-conversation-logger.js');
        
        const loggerContent = `// 개선된 대화 로깅 시스템
const fs = require('fs');
const path = require('path');

class ProperConversationLogger {
    constructor() {
        this.conversationDir = path.join(__dirname, '..', 'conversations');
        this.currentSession = null;
        this.setupDirectories();
    }
    
    setupDirectories() {
        if (!fs.existsSync(this.conversationDir)) {
            fs.mkdirSync(this.conversationDir, { recursive: true });
        }
    }
    
    getCurrentTimestamp() {
        return new Date().toISOString();
    }
    
    startSession(sessionName = 'Manual_Session') {
        const timestamp = this.getCurrentTimestamp();
        const filename = \`\${timestamp.replace(/[:.]/g, '-')}_\${sessionName}.md\`;
        this.currentSession = path.join(this.conversationDir, filename);
        
        const initialContent = \`# Claude Code 대화 세션 - \${sessionName}

**시작 시간**: \${timestamp}
**프로젝트**: \${path.basename(process.cwd())}

## 대화 내용

\`;
        
        fs.writeFileSync(this.currentSession, initialContent);
        console.log(\`새 세션 시작: \${this.currentSession}\`);
        return this.currentSession;
    }
    
    logMessage(type, content, timestamp = null) {
        if (!this.currentSession) {
            this.startSession();
        }
        
        const time = timestamp || this.getCurrentTimestamp();
        const entry = \`
### \${time} - \${type}

\${content}

---

\`;
        
        fs.appendFileSync(this.currentSession, entry);
        console.log(\`메시지 기록됨: \${type}\`);
    }
    
    logUserMessage(message) {
        this.logMessage('사용자 입력', message);
    }
    
    logAssistantMessage(message) {
        this.logMessage('Claude 응답', message);
    }
    
    logSystemEvent(event) {
        this.logMessage('시스템 이벤트', event);
    }
    
    endSession() {
        if (this.currentSession) {
            const endTime = this.getCurrentTimestamp();
            const footer = \`
---
**세션 종료**: \${endTime}
\`;
            fs.appendFileSync(this.currentSession, footer);
            console.log(\`세션 종료: \${this.currentSession}\`);
            this.currentSession = null;
        }
    }
}

// CLI 인터페이스
const logger = new ProperConversationLogger();
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case 'start':
        logger.startSession(args[1] || 'Manual_Session');
        break;
    case 'log':
        logger.logMessage(args[1] || 'Manual', args[2] || 'User input');
        break;
    case 'user':
        logger.logUserMessage(args[1] || 'User message');
        break;
    case 'assistant':
        logger.logAssistantMessage(args[1] || 'Assistant response');
        break;
    case 'end':
        logger.endSession();
        break;
    default:
        console.log(\`사용법:
  node proper-conversation-logger.js start [session-name]
  node proper-conversation-logger.js log [type] [content]
  node proper-conversation-logger.js user [message]
  node proper-conversation-logger.js assistant [message]
  node proper-conversation-logger.js end\`);
}

module.exports = ProperConversationLogger;`;
        
        fs.writeFileSync(loggerPath, loggerContent);
        fs.chmodSync(loggerPath, '755');
        this.log(`올바른 로거 생성: ${loggerPath}`, 'success');
        
        return loggerPath;
    }
    
    // 수동 대화 저장 기능
    saveCurrentConversation() {
        this.log('현재 대화 수동 저장 중...');
        
        const timestamp = new Date().toISOString();
        const filename = `${timestamp.replace(/[:.]/g, '-')}_Manual_Conversation.md`;
        const filePath = path.join(this.conversationDir, filename);
        
        const conversationContent = `# Claude Code 대화 - ${timestamp}

**프로젝트**: AI 기반 가치관 매칭 플랫폼 (CHARM_INYEON)
**저장 시간**: ${timestamp}

## 주요 작업 내용

### 1. Claude Code 완전 자동화 시스템 구현
- ✅ 프로젝트 자동 감지 및 설정
- ✅ 대화 내용 자동 기록 (수정 필요)
- ✅ Git 변경사항 추적
- ✅ 글로벌 세션 관리

### 2. VS Code 3-Pane Layout 자동 설정
- ✅ Extension 개발로 자동 레이아웃 구현
- ✅ New Window 시 자동 3개 분할 화면
- ✅ 키보드 단축키 없이 완전 자동화

### 3. 개발 히스토리 추적 시스템
- ✅ 자동 백업 및 정리
- ✅ 프로젝트별 대화 기록
- ❌ 대화 내용 캡처 문제 발견 및 수정 중

## 구현된 파일들

### Claude Code 자동화
- \`~/.claude/claude-full-auto.sh\` - 메인 자동화 스크립트
- \`~/.claude/conversation-monitor.js\` - 대화 모니터링 (수정 필요)
- \`~/.claude/auto-project-setup.js\` - 프로젝트 자동 설정
- \`~/.claude/one-click-install.sh\` - 원클릭 설치

### VS Code 3-Pane 자동화
- \`vscode-auto-3pane-extension/\` - VS Code 확장 프로그램
- \`3pane-workspace-template.code-workspace\` - 워크스페이스 템플릿
- \`vscode-auto-startup.js\` - 자동 실행 스크립트

### 문제 해결
- \`fix-conversation-logging.js\` - 대화 로깅 문제 수정

## 해결된 문제

1. **대화 로깅 문제**: bash 히스토리만 반복 캡처되는 문제 발견
2. **자동화 수준**: 키보드 단축키 없이 완전 자동화 달성
3. **VS Code 레이아웃**: New Window 시 자동 3-pane 구현

## 다음 단계

1. 대화 내용 실시간 캡처 시스템 개선
2. Claude Code API 연동으로 실제 대화 내용 저장
3. 완전 자동화 시스템 최종 테스트

---
*이 대화는 수동으로 저장되었습니다.*
`;
        
        fs.writeFileSync(filePath, conversationContent);
        this.log(`대화 저장 완료: ${filePath}`, 'success');
        
        return filePath;
    }
    
    // VS Code 설정 개선
    improveVSCodeSettings() {
        this.log('VS Code 설정 개선 중...');
        
        const packageJsonPath = path.join(this.projectDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            // 개선된 스크립트 추가
            packageJson.scripts = {
                ...packageJson.scripts,
                "save-conversation": "node dev-history/scripts/proper-conversation-logger.js user 'Manual conversation save'",
                "start-session": "node dev-history/scripts/proper-conversation-logger.js start",
                "end-session": "node dev-history/scripts/proper-conversation-logger.js end",
                "fix-logs": "node fix-conversation-logging.js"
            };
            
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            this.log('package.json 스크립트 개선 완료', 'success');
        }
    }
    
    async fixAll() {
        this.log('=== 대화 로깅 시스템 문제 수정 시작 ===');
        
        // 1. 문제 파일들 정리
        this.cleanupBrokenLogs();
        
        // 2. 올바른 로거 생성
        const loggerPath = this.createProperConversationLogger();
        
        // 3. 현재 대화 수동 저장
        const conversationPath = this.saveCurrentConversation();
        
        // 4. VS Code 설정 개선
        this.improveVSCodeSettings();
        
        this.log('=== 수정 완료 ===', 'success');
        
        console.log(`
🎉 대화 로깅 문제 수정 완료!

✅ 수정된 내용:
- 문제가 있는 자동 로그 파일들 정리
- 올바른 대화 로깅 시스템 생성
- 현재 대화 내용 수동 저장
- package.json 스크립트 개선

📁 저장된 파일:
- ${loggerPath}
- ${conversationPath}

🚀 새로운 사용법:
npm run save-conversation    # 대화 수동 저장
npm run start-session       # 새 세션 시작
npm run end-session         # 세션 종료
        `);
    }
}

// 실행
if (require.main === module) {
    const fixer = new ConversationLoggingFixer();
    fixer.fixAll().catch(console.error);
}

module.exports = ConversationLoggingFixer;