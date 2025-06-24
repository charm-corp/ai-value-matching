const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ImageService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
    this.profilesDir = path.join(this.uploadsDir, 'profiles');
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.profileSizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 }
    };
  }

  // 디렉토리 생성 확인
  async ensureDirectoriesExist() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }

    try {
      await fs.access(this.profilesDir);
    } catch {
      await fs.mkdir(this.profilesDir, { recursive: true });
    }
  }

  // 파일 유효성 검사
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('파일이 업로드되지 않았습니다.');
      return { valid: false, errors };
    }

    // 파일 크기 검사
    if (file.size > this.maxFileSize) {
      errors.push(`파일 크기는 ${this.maxFileSize / (1024 * 1024)}MB 이하여야 합니다.`);
    }

    // 파일 타입 검사
    if (!this.allowedTypes.includes(file.mimetype)) {
      errors.push('지원되지 않는 파일 형식입니다. (JPEG, PNG, WebP만 지원)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 고유한 파일명 생성
  generateFileName(originalName, userId) {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `profile-${userId}-${timestamp}-${random}${ext}`;
  }

  // 이미지 처리 및 여러 크기 생성
  async processProfileImage(inputPath, fileName, userId) {
    await this.ensureDirectoriesExist();

    const results = {};
    const userDir = path.join(this.profilesDir, userId.toString());

    // 사용자별 디렉토리 생성
    try {
      await fs.access(userDir);
    } catch {
      await fs.mkdir(userDir, { recursive: true });
    }

    try {
      // 원본 이미지 정보 가져오기
      const imageInfo = await sharp(inputPath).metadata();
      console.log(`📷 Processing image: ${imageInfo.width}x${imageInfo.height}, format: ${imageInfo.format}`);

      // 각 크기별로 이미지 생성
      for (const [sizeName, dimensions] of Object.entries(this.profileSizes)) {
        const sizeFileName = `${sizeName}-${fileName}`;
        const outputPath = path.join(userDir, sizeFileName);

        await sharp(inputPath)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ 
            quality: sizeName === 'thumbnail' ? 85 : 90,
            progressive: true 
          })
          .toFile(outputPath);

        results[sizeName] = {
          path: `/uploads/profiles/${userId}/${sizeFileName}`,
          filename: sizeFileName,
          size: dimensions
        };

        console.log(`✅ Created ${sizeName} image: ${sizeFileName}`);
      }

      // 원본 파일 삭제 (임시 파일)
      try {
        await fs.unlink(inputPath);
      } catch (error) {
        console.log('Original file cleanup warning:', error.message);
      }

      return {
        success: true,
        images: results,
        metadata: {
          originalWidth: imageInfo.width,
          originalHeight: imageInfo.height,
          originalFormat: imageInfo.format,
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      // 실패 시 생성된 파일들 정리
      for (const [sizeName] of Object.entries(this.profileSizes)) {
        const sizeFileName = `${sizeName}-${fileName}`;
        const outputPath = path.join(userDir, sizeFileName);
        try {
          await fs.unlink(outputPath);
        } catch {}
      }

      throw new Error(`이미지 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  // 기존 프로필 이미지 삭제
  async deleteProfileImages(userId, imagePaths) {
    if (!imagePaths || typeof imagePaths !== 'object') {
      return;
    }

    const userDir = path.join(this.profilesDir, userId.toString());

    try {
      // 각 크기별 이미지 삭제
      for (const imageData of Object.values(imagePaths)) {
        if (imageData && imageData.filename) {
          const filePath = path.join(userDir, imageData.filename);
          try {
            await fs.unlink(filePath);
            console.log(`🗑️ Deleted image: ${imageData.filename}`);
          } catch (error) {
            console.log(`Warning: Could not delete ${imageData.filename}:`, error.message);
          }
        }
      }

      // 디렉토리가 비어있으면 삭제
      try {
        const files = await fs.readdir(userDir);
        if (files.length === 0) {
          await fs.rmdir(userDir);
          console.log(`🗑️ Deleted empty user directory: ${userId}`);
        }
      } catch (error) {
        console.log('Directory cleanup warning:', error.message);
      }

    } catch (error) {
      console.error('Delete profile images error:', error);
    }
  }

  // 이미지 존재 확인
  async checkImageExists(imagePath) {
    try {
      const fullPath = path.join(__dirname, '..', imagePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  // 이미지 메타데이터 조회
  async getImageMetadata(imagePath) {
    try {
      const fullPath = path.join(__dirname, '..', imagePath);
      const stats = await fs.stat(fullPath);
      const imageInfo = await sharp(fullPath).metadata();

      return {
        size: stats.size,
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`이미지 메타데이터 조회 실패: ${error.message}`);
    }
  }

  // 사용자 디렉토리의 모든 이미지 목록 조회
  async getUserImages(userId) {
    try {
      const userDir = path.join(this.profilesDir, userId.toString());
      const files = await fs.readdir(userDir);
      
      const images = [];
      for (const file of files) {
        const filePath = path.join(userDir, file);
        const stats = await fs.stat(filePath);
        
        images.push({
          filename: file,
          path: `/uploads/profiles/${userId}/${file}`,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }

      return images;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // 디렉토리가 없으면 빈 배열 반환
      }
      throw error;
    }
  }

  // 임시 파일 정리 (주기적으로 실행)
  async cleanupTempFiles() {
    try {
      const tempDir = path.join(this.uploadsDir, 'temp');
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24시간

      try {
        const files = await fs.readdir(tempDir);
        
        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            console.log(`🧹 Cleaned up old temp file: ${file}`);
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error('Temp cleanup error:', error);
        }
      }
    } catch (error) {
      console.error('Cleanup temp files error:', error);
    }
  }

  // 스토리지 사용량 통계
  async getStorageStats() {
    try {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        userDirectories: 0,
        breakdown: {}
      };

      const userDirs = await fs.readdir(this.profilesDir);
      
      for (const userDir of userDirs) {
        const userPath = path.join(this.profilesDir, userDir);
        const userStat = await fs.stat(userPath);
        
        if (userStat.isDirectory()) {
          stats.userDirectories++;
          
          const files = await fs.readdir(userPath);
          let userSize = 0;
          
          for (const file of files) {
            const filePath = path.join(userPath, file);
            const fileStat = await fs.stat(filePath);
            
            if (fileStat.isFile()) {
              stats.totalFiles++;
              userSize += fileStat.size;
            }
          }
          
          stats.totalSize += userSize;
          stats.breakdown[userDir] = {
            files: files.length,
            size: userSize
          };
        }
      }

      return stats;
    } catch (error) {
      console.error('Get storage stats error:', error);
      return { error: error.message };
    }
  }
}

module.exports = new ImageService();