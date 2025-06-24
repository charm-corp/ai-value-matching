const CryptoJS = require('crypto-js');
const forge = require('node-forge');
const crypto = require('crypto');

/**
 * 데이터 암호화 유틸리티
 * AI 매칭 플랫폼의 민감한 개인정보 보호를 위한 암호화 시스템
 */

class EncryptionService {
  constructor() {
    // 환경 변수에서 암호화 키 가져오기
    this.masterKey = process.env.ENCRYPTION_MASTER_KEY || this.generateSecureKey();
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16;  // 128 bits
    this.tagLength = 16; // 128 bits
    
    // 필드별 암호화 키 (다층 암호화 보안)
    this.fieldKeys = {
      personalInfo: process.env.PERSONAL_INFO_KEY || this.generateSecureKey(),
      sensitive: process.env.SENSITIVE_DATA_KEY || this.generateSecureKey(),
      assessment: process.env.ASSESSMENT_DATA_KEY || this.generateSecureKey()
    };
  }

  /**
   * 안전한 랜덤 키 생성
   */
  generateSecureKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * AES-256-GCM으로 데이터 암호화
   */
  encrypt(data, keyType = 'personalInfo') {
    try {
      if (!data) return null;
      
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      const key = Buffer.from(this.fieldKeys[keyType] || this.masterKey, 'hex').slice(0, 32);
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      cipher.setAAD(Buffer.from('charm-inyeon-auth'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // IV + AuthTag + 암호화된 데이터를 결합
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('데이터 암호화 실패');
    }
  }

  /**
   * AES-256-GCM으로 데이터 복호화
   */
  decrypt(encryptedData, keyType = 'personalInfo') {
    try {
      if (!encryptedData) return null;
      
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('잘못된 암호화 데이터 형식');
      }
      
      const [ivHex, authTagHex, encrypted] = parts;
      const key = Buffer.from(this.fieldKeys[keyType] || this.masterKey, 'hex').slice(0, 32);
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(Buffer.from('charm-inyeon-auth'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('데이터 복호화 실패');
    }
  }

  /**
   * 개인식별정보(PII) 암호화
   */
  encryptPII(data) {
    return this.encrypt(data, 'personalInfo');
  }

  /**
   * 개인식별정보(PII) 복호화
   */
  decryptPII(encryptedData) {
    return this.decrypt(encryptedData, 'personalInfo');
  }

  /**
   * 민감한 데이터 암호화 (전화번호, 주소 등)
   */
  encryptSensitive(data) {
    return this.encrypt(data, 'sensitive');
  }

  /**
   * 민감한 데이터 복호화
   */
  decryptSensitive(encryptedData) {
    return this.decrypt(encryptedData, 'sensitive');
  }

  /**
   * 가치관 평가 데이터 암호화
   */
  encryptAssessment(data) {
    return this.encrypt(data, 'assessment');
  }

  /**
   * 가치관 평가 데이터 복호화
   */
  decryptAssessment(encryptedData) {
    return this.decrypt(encryptedData, 'assessment');
  }

  /**
   * 데이터 해싱 (검색 가능한 암호화)
   */
  hashForSearch(data) {
    if (!data) return null;
    
    const normalizedData = data.toLowerCase().trim();
    return crypto.createHash('sha256')
      .update(normalizedData + process.env.SEARCH_SALT || 'charm-inyeon-search-salt')
      .digest('hex');
  }

  /**
   * RSA 키 쌍 생성 (클라이언트-서버 통신용)
   */
  generateRSAKeyPair() {
    const keyPair = forge.pki.rsa.generateKeyPair(2048);
    
    return {
      publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
      privateKey: forge.pki.privateKeyToPem(keyPair.privateKey)
    };
  }

  /**
   * RSA 공개키 암호화
   */
  encryptWithPublicKey(data, publicKeyPem) {
    try {
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const encrypted = publicKey.encrypt(data, 'RSA-OAEP');
      return forge.util.encode64(encrypted);
    } catch (error) {
      console.error('RSA encryption error:', error);
      throw new Error('RSA 암호화 실패');
    }
  }

  /**
   * RSA 개인키 복호화
   */
  decryptWithPrivateKey(encryptedData, privateKeyPem) {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const encrypted = forge.util.decode64(encryptedData);
      return privateKey.decrypt(encrypted, 'RSA-OAEP');
    } catch (error) {
      console.error('RSA decryption error:', error);
      throw new Error('RSA 복호화 실패');
    }
  }

  /**
   * 데이터 마스킹 (부분 표시용)
   */
  maskData(data, type = 'default') {
    if (!data) return '';
    
    switch (type) {
      case 'email':
        const [username, domain] = data.split('@');
        return username.substring(0, 2) + '*'.repeat(username.length - 2) + '@' + domain;
        
      case 'phone':
        return data.substring(0, 3) + '-****-' + data.substring(data.length - 4);
        
      case 'name':
        return data.charAt(0) + '*'.repeat(data.length - 1);
        
      case 'address':
        const parts = data.split(' ');
        return parts[0] + ' ' + '*'.repeat(10) + ' ' + (parts[parts.length - 1] || '');
        
      default:
        return '*'.repeat(Math.min(data.length, 8));
    }
  }

  /**
   * 토큰 기반 일회성 암호화 (임시 데이터용)
   */
  encryptWithToken(data, token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const key = tokenHash.substring(0, 32);
    
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  /**
   * 토큰 기반 복호화
   */
  decryptWithToken(encryptedData, token) {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const key = tokenHash.substring(0, 32);
      
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Token decryption error:', error);
      throw new Error('토큰 복호화 실패');
    }
  }

  /**
   * 암호화 강도 검증
   */
  validateEncryption() {
    const testData = 'test-encryption-strength-validation';
    
    try {
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted);
      
      return {
        isValid: decrypted === testData,
        algorithm: this.algorithm,
        keyLength: this.keyLength,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// 싱글톤 인스턴스
const encryptionService = new EncryptionService();

module.exports = {
  EncryptionService,
  encryptionService
};