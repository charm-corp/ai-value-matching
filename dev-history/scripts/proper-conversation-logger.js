// 개선된 대화 로깅 시스템
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
        const filename = `${timestamp.replace(/[:.]/g, '-')}_${sessionName}.md`;
        this.currentSession = path.join(this.conversationDir, filename);
        
        const initialContent = `# Claude Code 대화 세션 - ${sessionName}

**시작 시간**: ${timestamp}
**프로젝트**: ${path.basename(process.cwd())}

## 대화 내용

`;
        
        fs.writeFileSync(this.currentSession, initialContent);
        console.log(`새 세션 시작: ${this.currentSession}`);
        return this.currentSession;
    }
    
    logMessage(type, content, timestamp = null) {
        if (!this.currentSession) {
            this.startSession();
        }
        
        const time = timestamp || this.getCurrentTimestamp();
        const entry = `
### ${time} - ${type}

${content}

---

`;
        
        fs.appendFileSync(this.currentSession, entry);
        console.log(`메시지 기록됨: ${type}`);
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
            const footer = `
---
**세션 종료**: ${endTime}
`;
            fs.appendFileSync(this.currentSession, footer);
            console.log(`세션 종료: ${this.currentSession}`);
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
        console.log(`사용법:
  node proper-conversation-logger.js start [session-name]
  node proper-conversation-logger.js log [type] [content]
  node proper-conversation-logger.js user [message]
  node proper-conversation-logger.js assistant [message]
  node proper-conversation-logger.js end`);
}

module.exports = ProperConversationLogger;