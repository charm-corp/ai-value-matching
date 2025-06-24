#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConversationLogger {
    constructor() {
        this.baseDir = path.join(__dirname, '..');
        this.conversationsDir = path.join(this.baseDir, 'conversations');
        this.dailyLogsDir = path.join(this.baseDir, 'daily-logs');
        this.codeChangesDir = path.join(this.baseDir, 'code-changes');
        
        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.conversationsDir, this.dailyLogsDir, this.codeChangesDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    getCurrentTimestamp() {
        return new Date().toISOString();
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    logConversation(title, content, metadata = {}) {
        const timestamp = this.getCurrentTimestamp();
        const filename = `${timestamp.replace(/[:.]/g, '-')}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
        const filepath = path.join(this.conversationsDir, filename);

        const logEntry = {
            timestamp,
            title,
            metadata: {
                ...metadata,
                claudeVersion: this.getClaudeVersion(),
                projectPath: process.cwd(),
                gitCommit: this.getGitCommit()
            },
            content
        };

        const markdownContent = `# ${title}

**타임스탬프**: ${timestamp}
**Claude 버전**: ${logEntry.metadata.claudeVersion}
**프로젝트 경로**: ${logEntry.metadata.projectPath}
**Git 커밋**: ${logEntry.metadata.gitCommit}

## 대화 내용

${content}

## 메타데이터
\`\`\`json
${JSON.stringify(logEntry.metadata, null, 2)}
\`\`\`
`;

        fs.writeFileSync(filepath, markdownContent);
        console.log(`대화 기록 저장됨: ${filepath}`);
        
        this.updateDailyLog(title, filepath);
        return filepath;
    }

    logCodeChange(description, files = [], command = '') {
        const timestamp = this.getCurrentTimestamp();
        const filename = `${timestamp.replace(/[:.]/g, '-')}_code_change.json`;
        const filepath = path.join(this.codeChangesDir, filename);

        try {
            const gitDiff = execSync('git diff HEAD~1 HEAD', { encoding: 'utf8' }).toString();
            const gitLog = execSync('git log -1 --pretty=format:"%h - %s (%an, %ar)"', { encoding: 'utf8' }).toString();
            
            const changeLog = {
                timestamp,
                description,
                command,
                files,
                gitDiff,
                gitLog,
                workingDirectory: process.cwd()
            };

            fs.writeFileSync(filepath, JSON.stringify(changeLog, null, 2));
            console.log(`코드 변경 기록 저장됨: ${filepath}`);
            
            this.updateDailyLog(`Code Change: ${description}`, filepath);
            return filepath;
        } catch (error) {
            console.log('Git 정보를 가져올 수 없음:', error.message);
            
            const changeLog = {
                timestamp,
                description,
                command,
                files,
                workingDirectory: process.cwd(),
                note: 'Git 정보 없음'
            };

            fs.writeFileSync(filepath, JSON.stringify(changeLog, null, 2));
            return filepath;
        }
    }

    updateDailyLog(activity, filepath) {
        const dateString = this.getDateString();
        const dailyLogPath = path.join(this.dailyLogsDir, `${dateString}.md`);
        
        const timestamp = new Date().toLocaleTimeString('ko-KR');
        const logEntry = `- **${timestamp}**: ${activity} → [파일](${path.relative(this.dailyLogsDir, filepath)})\n`;
        
        if (fs.existsSync(dailyLogPath)) {
            fs.appendFileSync(dailyLogPath, logEntry);
        } else {
            const header = `# 개발 로그 - ${dateString}\n\n`;
            fs.writeFileSync(dailyLogPath, header + logEntry);
        }
    }

    getClaudeVersion() {
        try {
            return execSync('claude --version', { encoding: 'utf8' }).toString().trim();
        } catch (error) {
            return 'Unknown';
        }
    }

    getGitCommit() {
        try {
            return execSync('git rev-parse HEAD', { encoding: 'utf8' }).toString().trim();
        } catch (error) {
            return 'No Git repository';
        }
    }

    startSession(sessionName) {
        const timestamp = this.getCurrentTimestamp();
        const sessionPath = path.join(this.conversationsDir, `session_${sessionName}_${timestamp.replace(/[:.]/g, '-')}.md`);
        
        const sessionHeader = `# 개발 세션: ${sessionName}

**시작 시간**: ${timestamp}
**프로젝트**: ${path.basename(process.cwd())}

## 세션 로그

`;
        
        fs.writeFileSync(sessionPath, sessionHeader);
        console.log(`개발 세션 시작: ${sessionPath}`);
        
        // 환경 변수에 현재 세션 파일 경로 저장
        process.env.CLAUDE_SESSION_FILE = sessionPath;
        return sessionPath;
    }

    appendToSession(content) {
        const sessionFile = process.env.CLAUDE_SESSION_FILE;
        if (sessionFile && fs.existsSync(sessionFile)) {
            const timestamp = new Date().toLocaleTimeString('ko-KR');
            fs.appendFileSync(sessionFile, `\n### ${timestamp}\n${content}\n`);
        }
    }
}

// CLI 인터페이스
if (require.main === module) {
    const logger = new ConversationLogger();
    const command = process.argv[2];
    
    switch (command) {
        case 'start-session':
            const sessionName = process.argv[3] || 'default';
            logger.startSession(sessionName);
            break;
            
        case 'log-conversation':
            const title = process.argv[3] || 'Untitled Conversation';
            const content = process.argv[4] || '';
            logger.logConversation(title, content);
            break;
            
        case 'log-code-change':
            const description = process.argv[3] || 'Code change';
            const files = process.argv.slice(4);
            logger.logCodeChange(description, files);
            break;
            
        default:
            console.log(`
사용법:
  node conversation-logger.js start-session [세션명]
  node conversation-logger.js log-conversation [제목] [내용]
  node conversation-logger.js log-code-change [설명] [파일1] [파일2]...
            `);
    }
}

module.exports = ConversationLogger;