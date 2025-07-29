const path = require('path');
const fs = require('fs').promises;

class AvatarService {
  constructor() {
    this.avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');

    // 4060세대를 위한 기본 아바타 설정
    this.defaultAvatars = {
      male: {
        modern: '/uploads/avatars/male-modern.svg',
        classic: '/uploads/avatars/male-classic.svg',
        friendly: '/uploads/avatars/male-friendly.svg',
      },
      female: {
        modern: '/uploads/avatars/female-modern.svg',
        classic: '/uploads/avatars/female-classic.svg',
        friendly: '/uploads/avatars/female-friendly.svg',
      },
      neutral: {
        modern: '/uploads/avatars/neutral-modern.svg',
        classic: '/uploads/avatars/neutral-classic.svg',
        friendly: '/uploads/avatars/neutral-friendly.svg',
      },
    };
  }

  // 사용자에게 맞는 기본 아바타 추천
  getRecommendedAvatar(user) {
    const gender = user.gender || 'neutral';
    const style = this.getStyleByAge(user.age);

    if (this.defaultAvatars[gender] && this.defaultAvatars[gender][style]) {
      return {
        path: this.defaultAvatars[gender][style],
        style: style,
        gender: gender,
        description: this.getAvatarDescription(gender, style),
      };
    }

    // 기본값: 중성적인 친근한 스타일
    return {
      path: this.defaultAvatars.neutral.friendly,
      style: 'friendly',
      gender: 'neutral',
      description: '친근한 기본 프로필',
    };
  }

  // 연령대별 스타일 추천
  getStyleByAge(ageRange) {
    switch (ageRange) {
      case '40-45':
        return 'modern'; // 모던한 스타일
      case '46-50':
        return 'modern';
      case '51-55':
        return 'classic'; // 클래식한 스타일
      case '56-60':
        return 'classic';
      case '60+':
        return 'friendly'; // 친근한 스타일
      default:
        return 'friendly';
    }
  }

  // 아바타 설명 생성
  getAvatarDescription(gender, style) {
    const genderNames = {
      male: '남성',
      female: '여성',
      neutral: '중성',
    };

    const styleNames = {
      modern: '모던',
      classic: '클래식',
      friendly: '친근한',
    };

    return `${styleNames[style]} ${genderNames[gender]} 프로필`;
  }

  // 모든 사용 가능한 아바타 목록
  getAllAvatars() {
    const avatars = [];

    for (const [gender, styles] of Object.entries(this.defaultAvatars)) {
      for (const [style, path] of Object.entries(styles)) {
        avatars.push({
          path: path,
          gender: gender,
          style: style,
          description: this.getAvatarDescription(gender, style),
          category: `${gender}_${style}`,
        });
      }
    }

    return avatars;
  }

  // 성별별 아바타 목록
  getAvatarsByGender(gender) {
    if (!this.defaultAvatars[gender]) {
      return this.defaultAvatars.neutral;
    }

    return Object.entries(this.defaultAvatars[gender]).map(([style, path]) => ({
      path: path,
      gender: gender,
      style: style,
      description: this.getAvatarDescription(gender, style),
    }));
  }

  // SVG 아바타 생성 (간단한 SVG로 기본 이미지 제공)
  async generateSVGAvatar(gender, style, options = {}) {
    const colors = this.getColorScheme(gender, style);
    const size = options.size || 200;

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .avatar-bg { fill: ${colors.background}; }
            .avatar-face { fill: ${colors.skin}; }
            .avatar-hair { fill: ${colors.hair}; }
            .avatar-clothing { fill: ${colors.clothing}; }
            .avatar-text { font-family: 'Noto Sans KR', sans-serif; font-size: 12px; fill: #666; }
          </style>
        </defs>
        
        <!-- 배경 원 -->
        <circle cx="100" cy="100" r="95" class="avatar-bg"/>
        
        <!-- 얼굴 -->
        <circle cx="100" cy="85" r="35" class="avatar-face"/>
        
        <!-- 머리카락 -->
        <path d="M65 60 Q100 40 135 60 Q130 50 100 45 Q70 50 65 60" class="avatar-hair"/>
        
        <!-- 눈 -->
        <circle cx="90" cy="80" r="3" fill="#333"/>
        <circle cx="110" cy="80" r="3" fill="#333"/>
        
        <!-- 미소 -->
        <path d="M90 95 Q100 105 110 95" stroke="#333" stroke-width="2" fill="none"/>
        
        <!-- 옷 -->
        <path d="M70 120 Q100 110 130 120 L140 180 L60 180 Z" class="avatar-clothing"/>
        
        <!-- 스타일 표시 -->
        <text x="100" y="190" text-anchor="middle" class="avatar-text">${this.getAvatarDescription(gender, style)}</text>
      </svg>
    `;

    return svg;
  }

  // 색상 스키마 생성
  getColorScheme(gender, style) {
    const schemes = {
      male: {
        modern: {
          background: '#E3F2FD',
          skin: '#FFDBCF',
          hair: '#8D6E63',
          clothing: '#1976D2',
        },
        classic: {
          background: '#F3E5F5',
          skin: '#FFDBCF',
          hair: '#5D4037',
          clothing: '#7B1FA2',
        },
        friendly: {
          background: '#E8F5E8',
          skin: '#FFDBCF',
          hair: '#6D4C41',
          clothing: '#388E3C',
        },
      },
      female: {
        modern: {
          background: '#FCE4EC',
          skin: '#FFDBCF',
          hair: '#D7CCC8',
          clothing: '#E91E63',
        },
        classic: {
          background: '#F1F8E9',
          skin: '#FFDBCF',
          hair: '#8D6E63',
          clothing: '#689F38',
        },
        friendly: {
          background: '#FFF3E0',
          skin: '#FFDBCF',
          hair: '#A1887F',
          clothing: '#FF9800',
        },
      },
      neutral: {
        modern: {
          background: '#F5F5F5',
          skin: '#FFDBCF',
          hair: '#9E9E9E',
          clothing: '#607D8B',
        },
        classic: {
          background: '#FAFAFA',
          skin: '#FFDBCF',
          hair: '#795548',
          clothing: '#5D4037',
        },
        friendly: {
          background: '#E0F7FA',
          skin: '#FFDBCF',
          hair: '#78909C',
          clothing: '#00ACC1',
        },
      },
    };

    return schemes[gender]?.[style] || schemes.neutral.friendly;
  }

  // 기본 아바타 파일들 생성 (초기 설정용)
  async createDefaultAvatars() {
    try {
      await fs.mkdir(this.avatarsDir, { recursive: true });

      for (const [gender, styles] of Object.entries(this.defaultAvatars)) {
        for (const [style, relativePath] of Object.entries(styles)) {
          const filename = path.basename(relativePath);
          const filePath = path.join(this.avatarsDir, filename);

          // 파일이 없을 때만 생성
          try {
            await fs.access(filePath);
          } catch {
            const svg = await this.generateSVGAvatar(gender, style);
            await fs.writeFile(filePath, svg, 'utf8');
            console.log(`✅ Created default avatar: ${filename}`);
          }
        }
      }

      console.log('🎨 Default avatars system ready!');
      return true;
    } catch (error) {
      console.error('❌ Failed to create default avatars:', error);
      return false;
    }
  }

  // 사용자 프로필 이미지 상태 체크
  getUserImageStatus(user) {
    const hasCustomImage = !!(user.profileImages && user.profileImages.medium);
    const recommendedAvatar = this.getRecommendedAvatar(user);

    return {
      hasCustomImage: hasCustomImage,
      currentImage: hasCustomImage ? user.profileImages.medium.path : recommendedAvatar.path,
      recommendedAvatar: recommendedAvatar,
      isDefault: !hasCustomImage,
      uploadSuggestion: !hasCustomImage
        ? '프로필 사진을 업로드하면 매칭 확률이 3배 증가합니다!'
        : null,
    };
  }
}

module.exports = new AvatarService();
