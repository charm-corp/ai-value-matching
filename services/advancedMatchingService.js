const User = require('../models/User');
const ValuesAssessment = require('../models/ValuesAssessment');
const Match = require('../models/Match');

class AdvancedMatchingService {
  constructor() {
    this.ageWeights = {
      '40-45': { '40-45': 1.0, '46-50': 0.9, '51-55': 0.7, '56-60': 0.5, '60+': 0.3 },
      '46-50': { '40-45': 0.9, '46-50': 1.0, '51-55': 0.9, '56-60': 0.7, '60+': 0.5 },
      '51-55': { '40-45': 0.7, '46-50': 0.9, '51-55': 1.0, '56-60': 0.9, '60+': 0.7 },
      '56-60': { '40-45': 0.5, '46-50': 0.7, '51-55': 0.9, '56-60': 1.0, '60+': 0.9 },
      '60+': { '40-45': 0.3, '46-50': 0.5, '51-55': 0.7, '56-60': 0.9, '60+': 1.0 },
    };

    this.matchingWeights = {
      values: 0.25,
      lifestyle: 0.2,
      maritalStatus: 0.15,
      children: 0.15,
      location: 0.1,
      occupation: 0.1,
      age: 0.05,
    };
  }

  async calculateCompatibilityScore(user1, user2) {
    const scores = {
      valuesScore: await this.calculateValuesCompatibility(user1, user2),
      lifestyleScore: this.calculateLifestyleCompatibility(user1, user2),
      maritalStatusScore: this.calculateMaritalStatusCompatibility(user1, user2),
      childrenScore: this.calculateChildrenCompatibility(user1, user2),
      locationScore: this.calculateLocationCompatibility(user1, user2),
      occupationScore: this.calculateOccupationCompatibility(user1, user2),
      ageScore: this.calculateAgeCompatibility(user1, user2),
    };

    const weightedScore =
      scores.valuesScore * this.matchingWeights.values +
      scores.lifestyleScore * this.matchingWeights.lifestyle +
      scores.maritalStatusScore * this.matchingWeights.maritalStatus +
      scores.childrenScore * this.matchingWeights.children +
      scores.locationScore * this.matchingWeights.location +
      scores.occupationScore * this.matchingWeights.occupation +
      scores.ageScore * this.matchingWeights.age;

    return {
      totalScore: Math.round(weightedScore * 100),
      breakdown: {
        valuesAlignment: Math.round(scores.valuesScore * 100),
        lifestyleMatch: Math.round(scores.lifestyleScore * 100),
        maritalStatusCompatibility: Math.round(scores.maritalStatusScore * 100),
        childrenCompatibility: Math.round(scores.childrenScore * 100),
        locationCompatibility: Math.round(scores.locationScore * 100),
        occupationCompatibility: Math.round(scores.occupationScore * 100),
        ageCompatibility: Math.round(scores.ageScore * 100),
      },
    };
  }

  async calculateValuesCompatibility(user1, user2) {
    try {
      const assessment1 = await ValuesAssessment.findOne({ userId: user1._id });
      const assessment2 = await ValuesAssessment.findOne({ userId: user2._id });

      if (!assessment1 || !assessment2) {
        return 0.5;
      }

      const values1 = assessment1.valueCategories;
      const values2 = assessment2.valueCategories;
      const personality1 = assessment1.personalityScores;
      const personality2 = assessment2.personalityScores;

      let valuesSimilarity = 0;
      let personalitySimilarity = 0;
      let valuesCount = 0;
      let personalityCount = 0;

      Object.keys(values1).forEach(key => {
        if (
          values1[key] &&
          values2[key] &&
          values1[key] !== 'undefined' &&
          values2[key] !== 'undefined'
        ) {
          const diff = Math.abs(values1[key] - values2[key]);
          valuesSimilarity += Math.max(0, 1 - diff / 10);
          valuesCount++;
        }
      });

      Object.keys(personality1).forEach(key => {
        if (
          personality1[key] &&
          personality2[key] &&
          personality1[key] !== 'undefined' &&
          personality2[key] !== 'undefined'
        ) {
          const diff = Math.abs(personality1[key] - personality2[key]);
          personalitySimilarity += Math.max(0, 1 - diff / 10);
          personalityCount++;
        }
      });

      const avgValuesSimilarity = valuesCount > 0 ? valuesSimilarity / valuesCount : 0.5;
      const avgPersonalitySimilarity =
        personalityCount > 0 ? personalitySimilarity / personalityCount : 0.5;

      return avgValuesSimilarity * 0.6 + avgPersonalitySimilarity * 0.4;
    } catch (error) {
      console.error('Values compatibility calculation error:', error);
      return 0.5;
    }
  }

  calculateLifestyleCompatibility(user1, user2) {
    const lifestyle1 = user1.lifestyle || {};
    const lifestyle2 = user2.lifestyle || {};

    let score = 0;
    let factors = 0;

    const lifestyleFactors = [
      'livingArrangement',
      'homeOwnership',
      'fitnessLevel',
      'socialLevel',
      'travelFrequency',
    ];

    lifestyleFactors.forEach(factor => {
      if (lifestyle1[factor] && lifestyle2[factor]) {
        if (lifestyle1[factor] === lifestyle2[factor]) {
          score += 1.0;
        } else {
          score += this.getLifestyleCompatibilityScore(
            factor,
            lifestyle1[factor],
            lifestyle2[factor]
          );
        }
        factors++;
      }
    });

    return factors > 0 ? score / factors : 0.5;
  }

  getLifestyleCompatibilityScore(factor, value1, value2) {
    const compatibilityMatrix = {
      fitnessLevel: {
        low: { moderate: 0.7, active: 0.3, very_active: 0.1 },
        moderate: { low: 0.7, active: 0.8, very_active: 0.6 },
        active: { low: 0.3, moderate: 0.8, very_active: 0.9 },
        very_active: { low: 0.1, moderate: 0.6, active: 0.9 },
      },
      socialLevel: {
        introvert: { ambivert: 0.7, extrovert: 0.4 },
        ambivert: { introvert: 0.7, extrovert: 0.7 },
        extrovert: { introvert: 0.4, ambivert: 0.7 },
      },
      travelFrequency: {
        rarely: { occasionally: 0.6, frequently: 0.3, very_frequently: 0.1 },
        occasionally: { rarely: 0.6, frequently: 0.8, very_frequently: 0.6 },
        frequently: { rarely: 0.3, occasionally: 0.8, very_frequently: 0.9 },
        very_frequently: { rarely: 0.1, occasionally: 0.6, frequently: 0.9 },
      },
    };

    return compatibilityMatrix[factor]?.[value1]?.[value2] || 0.5;
  }

  calculateMaritalStatusCompatibility(user1, user2) {
    const status1 = user1.maritalStatus;
    const status2 = user2.maritalStatus;
    const preferences1 = user1.preferences?.matching?.maritalStatusPreference || [];
    const preferences2 = user2.preferences?.matching?.maritalStatusPreference || [];

    if (!status1 || !status2) {
      return 0.5;
    }

    let score = 0;

    if (preferences1.length === 0 && preferences2.length === 0) {
      const compatibilityMatrix = {
        divorced: { divorced: 1.0, widowed: 0.8, separated: 0.9, single: 0.6 },
        widowed: { widowed: 1.0, divorced: 0.8, separated: 0.7, single: 0.7 },
        separated: { separated: 1.0, divorced: 0.9, widowed: 0.7, single: 0.6 },
        single: { single: 1.0, divorced: 0.6, widowed: 0.7, separated: 0.6 },
      };
      score = compatibilityMatrix[status1]?.[status2] || 0.5;
    } else {
      const pref1Match = preferences1.length === 0 || preferences1.includes(status2);
      const pref2Match = preferences2.length === 0 || preferences2.includes(status1);

      if (pref1Match && pref2Match) {
        score = 1.0;
      } else if (pref1Match || pref2Match) {
        score = 0.7;
      } else {
        score = 0.3;
      }
    }

    return score;
  }

  calculateChildrenCompatibility(user1, user2) {
    const hasChildren1 = user1.hasChildren;
    const hasChildren2 = user2.hasChildren;
    const childrenInfo1 = user1.childrenInfo || {};
    const childrenInfo2 = user2.childrenInfo || {};
    const pref1 = user1.preferences?.matching?.childrenPreference || 'no_preference';
    const pref2 = user2.preferences?.matching?.childrenPreference || 'no_preference';

    let score = 0;

    if (pref1 === 'no_preference' && pref2 === 'no_preference') {
      if (hasChildren1 === hasChildren2) {
        return 1.0;
      }
      if (!hasChildren1 && hasChildren2) {
        return 0.7;
      }
      if (hasChildren1 && !hasChildren2) {
        return 0.7;
      }
      return 0.8;
    }

    const checkPreference = (userHasChildren, userChildrenInfo, preference) => {
      switch (preference) {
        case 'has_children':
          return userHasChildren ? 1.0 : 0.2;
        case 'no_children':
          return !userHasChildren ? 1.0 : 0.2;
        case 'grown_children':
          if (!userHasChildren) {
            return 0.6;
          }
          const hasGrownChildren = userChildrenInfo.ages?.some(age => age === 'adult');
          return hasGrownChildren ? 1.0 : 0.4;
        default:
          return 0.8;
      }
    };

    const score1 = checkPreference(hasChildren2, childrenInfo2, pref1);
    const score2 = checkPreference(hasChildren1, childrenInfo1, pref2);

    score = (score1 + score2) / 2;

    if (hasChildren1 && hasChildren2) {
      const livingWith1 = childrenInfo1.livingWith;
      const livingWith2 = childrenInfo2.livingWith;

      if (livingWith1 === livingWith2) {
        score *= 1.1;
      } else if ((livingWith1 && !livingWith2) || (!livingWith1 && livingWith2)) {
        score *= 0.9;
      }
    }

    return Math.min(score, 1.0);
  }

  calculateLocationCompatibility(user1, user2) {
    const coord1 = user1.location?.coordinates;
    const coord2 = user2.location?.coordinates;
    const maxDistance1 = user1.preferences?.matching?.distance || 30;
    const maxDistance2 = user2.preferences?.matching?.distance || 30;

    if (!coord1 || !coord2) {
      return 0.3;
    }

    const distance = this.calculateDistance(coord1[1], coord1[0], coord2[1], coord2[0]);
    const maxAllowedDistance = Math.min(maxDistance1, maxDistance2);

    if (distance <= maxAllowedDistance) {
      const score = Math.max(0.5, 1 - (distance / maxAllowedDistance) * 0.5);
      return score;
    }

    return 0.1;
  }

  calculateOccupationCompatibility(user1, user2) {
    const occ1 = user1.occupation || {};
    const occ2 = user2.occupation || {};
    const importance1 = user1.preferences?.matching?.occupationImportance || 3;
    const importance2 = user2.preferences?.matching?.occupationImportance || 3;
    const avgImportance = (importance1 + importance2) / 2;

    if (!occ1.industry || !occ2.industry) {
      return 0.5;
    }

    let score = 0;
    let factors = 0;

    if (occ1.industry === occ2.industry) {
      score += 1.0;
    } else {
      score += this.getIndustryCompatibility(occ1.industry, occ2.industry);
    }
    factors++;

    if (occ1.position && occ2.position) {
      if (occ1.position === occ2.position) {
        score += 1.0;
      } else {
        score += this.getPositionCompatibility(occ1.position, occ2.position);
      }
      factors++;
    }

    if (occ1.workSchedule && occ2.workSchedule) {
      if (occ1.workSchedule === occ2.workSchedule) {
        score += 1.0;
      } else {
        score += this.getScheduleCompatibility(occ1.workSchedule, occ2.workSchedule);
      }
      factors++;
    }

    const baseScore = factors > 0 ? score / factors : 0.5;
    const importanceWeight = avgImportance / 5;

    return baseScore * importanceWeight + 0.5 * (1 - importanceWeight);
  }

  getIndustryCompatibility(industry1, industry2) {
    const compatibleIndustries = {
      finance: ['consulting', 'real_estate', 'legal'],
      healthcare: ['education', 'nonprofit'],
      education: ['healthcare', 'nonprofit', 'government'],
      technology: ['consulting', 'media'],
      consulting: ['finance', 'technology', 'legal'],
      legal: ['finance', 'consulting', 'government'],
    };

    if (compatibleIndustries[industry1]?.includes(industry2)) {
      return 0.7;
    }
    if (industry1 === 'retired' || industry2 === 'retired') {
      return 0.6;
    }
    return 0.4;
  }

  getPositionCompatibility(pos1, pos2) {
    const levels = ['entry', 'mid', 'senior', 'executive', 'owner'];
    const index1 = levels.indexOf(pos1);
    const index2 = levels.indexOf(pos2);

    if (index1 === -1 || index2 === -1) {
      return 0.5;
    }

    const diff = Math.abs(index1 - index2);
    return Math.max(0.3, 1 - diff * 0.2);
  }

  getScheduleCompatibility(schedule1, schedule2) {
    const compatibilityMatrix = {
      full_time: { full_time: 1.0, part_time: 0.6, contract: 0.7, freelance: 0.5, retired: 0.4 },
      part_time: { full_time: 0.6, part_time: 1.0, contract: 0.8, freelance: 0.9, retired: 0.7 },
      retired: { retired: 1.0, part_time: 0.7, freelance: 0.6, full_time: 0.4, contract: 0.3 },
    };

    return compatibilityMatrix[schedule1]?.[schedule2] || 0.5;
  }

  calculateAgeCompatibility(user1, user2) {
    const age1 = user1.age;
    const age2 = user2.age;

    if (!age1 || !age2) {
      return 0.5;
    }

    return this.ageWeights[age1]?.[age2] || 0.5;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async findPotentialMatches(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const filters = this.buildMatchingFilters(user);

      const candidates = await User.find(filters)
        .select('-password -emailVerificationToken -passwordResetToken')
        .limit(limit * 3);

      const existingMatches = await Match.find({
        $or: [{ user1: userId }, { user2: userId }],
      }).select('user1 user2');

      const existingMatchIds = new Set();
      existingMatches.forEach(match => {
        existingMatchIds.add(match.user1.toString());
        existingMatchIds.add(match.user2.toString());
      });

      const potentialMatches = [];

      for (const candidate of candidates) {
        if (candidate._id.toString() === userId.toString()) {
          continue;
        }
        if (existingMatchIds.has(candidate._id.toString())) {
          continue;
        }

        const compatibility = await this.calculateCompatibilityScore(user, candidate);

        if (compatibility.totalScore >= 60) {
          potentialMatches.push({
            user: candidate,
            compatibilityScore: compatibility.totalScore,
            compatibilityBreakdown: compatibility.breakdown,
          });
        }
      }

      potentialMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      return potentialMatches.slice(0, limit);
    } catch (error) {
      console.error('Error finding potential matches:', error);
      throw error;
    }
  }

  buildMatchingFilters(user) {
    const filters = {
      _id: { $ne: user._id },
      isActive: true,
      isVerified: true,
    };

    if (user.preferences?.matching) {
      const prefs = user.preferences.matching;

      if (prefs.genderPreference && prefs.genderPreference !== 'both') {
        filters.gender = prefs.genderPreference;
      }

      if (prefs.ageRange) {
        const ageValues = ['40-45', '46-50', '51-55', '56-60', '60+'];
        const minIndex = ageValues.findIndex(age => {
          const midAge = this.getAgeMidpoint(age);
          return midAge >= prefs.ageRange.min;
        });
        const maxIndex = ageValues.findIndex(age => {
          const midAge = this.getAgeMidpoint(age);
          return midAge > prefs.ageRange.max;
        });

        const validAges = ageValues.slice(
          Math.max(0, minIndex),
          maxIndex === -1 ? ageValues.length : maxIndex
        );

        if (validAges.length > 0) {
          filters.age = { $in: validAges };
        }
      }

      if (prefs.maritalStatusPreference && prefs.maritalStatusPreference.length > 0) {
        filters.maritalStatus = { $in: prefs.maritalStatusPreference };
      }

      if (user.location?.coordinates && prefs.distance) {
        filters['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: user.location.coordinates,
            },
            $maxDistance: prefs.distance * 1000,
          },
        };
      }
    }

    return filters;
  }

  getAgeMidpoint(ageRange) {
    const ageMidpoints = {
      '40-45': 42.5,
      '46-50': 48,
      '51-55': 53,
      '56-60': 58,
      '60+': 65,
    };
    return ageMidpoints[ageRange] || 50;
  }

  async createMatches(userId, potentialMatches) {
    const matches = [];

    for (const match of potentialMatches) {
      try {
        const newMatch = new Match({
          user1: userId,
          user2: match.user._id,
          compatibilityScore: match.compatibilityScore,
          compatibilityBreakdown: match.compatibilityBreakdown,
          status: 'pending',
          matchReason: {
            primaryFactors: this.getPrimaryMatchingFactors(match.compatibilityBreakdown),
            aiConfidence: this.calculateAIConfidence(match.compatibilityScore),
          },
        });

        const savedMatch = await newMatch.save();
        matches.push(savedMatch);
      } catch (error) {
        console.error('Error creating match:', error);
      }
    }

    return matches;
  }

  getPrimaryMatchingFactors(breakdown) {
    const factors = Object.entries(breakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([factor, score]) => ({ factor, score }));

    return factors;
  }

  calculateAIConfidence(score) {
    if (score >= 90) {
      return 'very_high';
    }
    if (score >= 80) {
      return 'high';
    }
    if (score >= 70) {
      return 'medium';
    }
    if (score >= 60) {
      return 'low';
    }
    return 'very_low';
  }
}

module.exports = new AdvancedMatchingService();
