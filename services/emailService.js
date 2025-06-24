const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.setupTransporter();
  }

  setupTransporter() {
    try {
      // Gmail configuration (you can switch to other providers)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS // Use App Password for Gmail
        }
      });

      this.isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
      
      if (this.isConfigured) {
        console.log('✅ Email service configured successfully');
      } else {
        console.log('⚠️ Email service not configured - SMTP_USER and SMTP_PASS required');
      }
    } catch (error) {
      console.error('❌ Email service setup failed:', error.message);
      this.isConfigured = false;
    }
  }

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  getVerificationEmailTemplate(userName, verificationCode, verificationLink) {
    return {
      subject: '[CHARM_INYEON] 이메일 인증을 완료해주세요',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
            .email-card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
            .verification-code { 
              background: linear-gradient(135deg, #667eea, #764ba2); 
              color: white; 
              padding: 20px; 
              border-radius: 10px; 
              text-align: center; 
              margin: 30px 0;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 3px;
            }
            .button { 
              display: inline-block; 
              background: #667eea; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 10px; 
              font-weight: 600;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-card">
              <div class="header">
                <div class="logo">CHARM_INYEON</div>
                <h2 style="color: #333; margin: 0;">이메일 인증</h2>
              </div>
              
              <p><strong>${userName}</strong>님, 안녕하세요!</p>
              <p>CHARM_INYEON 회원가입을 환영합니다. 🎉</p>
              <p>계정 활성화를 위해 아래 인증번호를 입력하거나 버튼을 클릭해주세요:</p>
              
              <div class="verification-code">
                ${verificationCode}
              </div>
              
              <div style="text-align: center;">
                <a href="${verificationLink}" class="button">이메일 인증 완료하기</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ 보안 안내</strong><br>
                • 이 인증번호는 10분간 유효합니다<br>
                • 타인과 공유하지 마세요<br>
                • 본인이 요청하지 않았다면 이 이메일을 무시해주세요
              </div>
              
              <p>문의사항이 있으시면 언제든 연락주세요!</p>
              
              <div class="footer">
                <p>CHARM_INYEON - 4060세대를 위한 가치관 매칭 플랫폼</p>
                <p>이메일: hello@charm-inyeon.com | 전화: 1588-0000</p>
                <p style="font-size: 12px; color: #999;">
                  이 이메일은 자동 발송되었습니다. 직접 회신하지 마세요.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getPasswordResetTemplate(userName, resetCode, resetLink) {
    return {
      subject: '[CHARM_INYEON] 비밀번호 재설정 요청',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
            .email-card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
            .reset-code { 
              background: linear-gradient(135deg, #ff6b6b, #ee5a52); 
              color: white; 
              padding: 20px; 
              border-radius: 10px; 
              text-align: center; 
              margin: 30px 0;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 3px;
            }
            .button { 
              display: inline-block; 
              background: #ff6b6b; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 10px; 
              font-weight: 600;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #ffe6e6; border: 1px solid #ff9999; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-card">
              <div class="header">
                <div class="logo">CHARM_INYEON</div>
                <h2 style="color: #333; margin: 0;">비밀번호 재설정</h2>
              </div>
              
              <p><strong>${userName}</strong>님, 안녕하세요!</p>
              <p>비밀번호 재설정 요청을 받았습니다.</p>
              <p>아래 인증번호를 입력하거나 버튼을 클릭하여 새로운 비밀번호를 설정해주세요:</p>
              
              <div class="reset-code">
                ${resetCode}
              </div>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">비밀번호 재설정하기</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ 보안 안내</strong><br>
                • 이 인증번호는 15분간 유효합니다<br>
                • 본인이 요청하지 않았다면 즉시 연락주세요<br>
                • 계정 보안을 위해 강력한 비밀번호를 설정해주세요
              </div>
              
              <p>본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.</p>
              
              <div class="footer">
                <p>CHARM_INYEON - 4060세대를 위한 가치관 매칭 플랫폼</p>
                <p>이메일: hello@charm-inyeon.com | 전화: 1588-0000</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  getWelcomeEmailTemplate(userName) {
    return {
      subject: '[CHARM_INYEON] 가입을 환영합니다! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
            .email-card { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
            .welcome-banner { 
              background: linear-gradient(135deg, #667eea, #764ba2); 
              color: white; 
              padding: 30px; 
              border-radius: 15px; 
              text-align: center; 
              margin: 30px 0;
            }
            .feature-list { background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; }
            .button { 
              display: inline-block; 
              background: #667eea; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 10px; 
              font-weight: 600;
              margin: 20px 0;
            }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-card">
              <div class="header">
                <div class="logo">CHARM_INYEON</div>
                <h2 style="color: #333; margin: 0;">환영합니다!</h2>
              </div>
              
              <div class="welcome-banner">
                <h2 style="margin: 0 0 15px 0;">🎉 가입 완료!</h2>
                <p style="margin: 0; font-size: 18px;"><strong>${userName}</strong>님, CHARM_INYEON 가족이 되신 것을 환영합니다!</p>
              </div>
              
              <p>4060세대를 위한 특별한 가치관 매칭 플랫폼에서 의미 있는 만남을 시작해보세요.</p>
              
              <div class="feature-list">
                <h3 style="color: #667eea; margin-top: 0;">🌟 지금 바로 시작해보세요!</h3>
                <ul style="padding-left: 20px;">
                  <li><strong>가치관 진단</strong> - 20개 질문으로 나만의 가치관 분석</li>
                  <li><strong>AI 매칭</strong> - 95%+ 호환성 상대 추천</li>
                  <li><strong>안전한 소통</strong> - 검증된 회원들과의 진솔한 대화</li>
                  <li><strong>맞춤 가이드</strong> - 자연스러운 만남을 위한 전문가 조언</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="http://localhost:3000" class="button">지금 시작하기</a>
              </div>
              
              <p><strong>💡 첫 매칭을 위한 팁:</strong></p>
              <ol>
                <li>프로필 사진을 업로드해보세요 (매칭 확률 3배 증가!)</li>
                <li>가치관 진단을 정확히 완료해주세요</li>
                <li>자기소개를 진솔하게 작성해보세요</li>
              </ol>
              
              <p>궁금한 점이 있으시면 언제든 문의해주세요. 행복한 만남을 응원합니다! 💕</p>
              
              <div class="footer">
                <p>CHARM_INYEON - 4060세대를 위한 가치관 매칭 플랫폼</p>
                <p>이메일: hello@charm-inyeon.com | 전화: 1588-0000</p>
                <p>📱 카카오톡: @charm_inyeon | 🌐 웹사이트: www.charm-inyeon.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  async sendVerificationEmail(userEmail, userName, verificationCode, verificationToken) {
    if (!this.isConfigured) {
      console.log('📧 Email service not configured - verification code:', verificationCode);
      return { success: true, mock: true, code: verificationCode };
    }

    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&code=${verificationCode}`;
      const emailTemplate = this.getVerificationEmailTemplate(userName, verificationCode, verificationLink);

      const mailOptions = {
        from: `"CHARM_INYEON" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Verification email sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId,
        code: verificationCode 
      };

    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      throw new Error('이메일 발송에 실패했습니다.');
    }
  }

  async sendPasswordResetEmail(userEmail, userName, resetCode, resetToken) {
    if (!this.isConfigured) {
      console.log('📧 Email service not configured - reset code:', resetCode);
      return { success: true, mock: true, code: resetCode };
    }

    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&code=${resetCode}`;
      const emailTemplate = this.getPasswordResetTemplate(userName, resetCode, resetLink);

      const mailOptions = {
        from: `"CHARM_INYEON" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Password reset email sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId,
        code: resetCode 
      };

    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      throw new Error('비밀번호 재설정 이메일 발송에 실패했습니다.');
    }
  }

  async sendWelcomeEmail(userEmail, userName) {
    if (!this.isConfigured) {
      console.log('📧 Email service not configured - welcome email skipped');
      return { success: true, mock: true };
    }

    try {
      const emailTemplate = this.getWelcomeEmailTemplate(userName);

      const mailOptions = {
        from: `"CHARM_INYEON" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Welcome email sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId 
      };

    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      // Don't throw error for welcome email - it's not critical
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection test successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Email service connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();