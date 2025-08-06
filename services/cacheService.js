const Redis = require('redis');
const { LRUCache } = require('lru-cache');

/**
 * Advanced Cache Service
 * 다층 캐싱 시스템: 메모리(LRU) + Redis + MongoDB 인덱싱
 */

class CacheService {
  constructor() {
    this.isRedisAvailable = false;
    this.redisClient = null;
    
    // L1 캐시: 메모리 LRU 캐시 (v10 호환)
    this.memoryCache = new LRUCache({
      max: 1000, // 최대 1000개 항목
      ttl: 5 * 60 * 1000, // 5분 TTL
      updateAgeOnGet: true
    });

    // L2 캐시: Redis 설정
    this.initializeRedis();

    // 캐시 통계
    this.stats = {
      hits: 0,
      misses: 0,
      memoryHits: 0,
      redisHits: 0,
      sets: 0,
      deletes: 0
    };
  }

  // Redis 초기화
  async initializeRedis() {
    try {
      if (process.env.REDIS_URL || process.env.REDIS_HOST) {
        const redisOptions = process.env.REDIS_URL ? 
          { url: process.env.REDIS_URL } : 
          {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
          };

        if (process.env.REDIS_PASSWORD) {
          redisOptions.password = process.env.REDIS_PASSWORD;
        }

        this.redisClient = Redis.createClient(redisOptions);

        this.redisClient.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isRedisAvailable = false;
        });

        this.redisClient.on('connect', () => {
          console.log('✅ Redis connected');
          this.isRedisAvailable = true;
        });

        this.redisClient.on('disconnect', () => {
          console.log('⚠️ Redis disconnected');
          this.isRedisAvailable = false;
        });

        await this.redisClient.connect();
      } else {
        console.log('📝 Redis not configured, using memory cache only');
      }
    } catch (error) {
      console.error('Redis initialization failed:', error);
      this.isRedisAvailable = false;
    }
  }

  // 캐시 키 생성 (네임스페이스 포함)
  generateKey(namespace, key, userId = null) {
    const prefix = process.env.CACHE_PREFIX || 'charm_inyeon';
    const userPart = userId ? `:user:${userId}` : '';
    return `${prefix}:${namespace}${userPart}:${key}`;
  }

  // 데이터 조회 (L1 -> L2 순서)
  async get(namespace, key, userId = null) {
    const cacheKey = this.generateKey(namespace, key, userId);

    try {
      // L1 캐시 (메모리) 확인
      const memoryResult = this.memoryCache.get(cacheKey);
      if (memoryResult !== undefined) {
        this.stats.hits++;
        this.stats.memoryHits++;
        return this.deserialize(memoryResult);
      }

      // L2 캐시 (Redis) 확인
      if (this.isRedisAvailable && this.redisClient) {
        const redisResult = await this.redisClient.get(cacheKey);
        if (redisResult !== null) {
          this.stats.hits++;
          this.stats.redisHits++;
          
          // L1 캐시에도 저장 (Redis에서 가져온 것을 메모리에 캐싱)
          this.memoryCache.set(cacheKey, redisResult);
          
          return this.deserialize(redisResult);
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  // 데이터 저장 (L1 + L2)
  async set(namespace, key, value, ttl = 300, userId = null) {
    const cacheKey = this.generateKey(namespace, key, userId);
    const serializedValue = this.serialize(value);

    try {
      // L1 캐시 (메모리) 저장
      this.memoryCache.set(cacheKey, serializedValue, {
        ttl: Math.min(ttl * 1000, 5 * 60 * 1000) // 최대 5분
      });

      // L2 캐시 (Redis) 저장
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.setEx(cacheKey, ttl, serializedValue);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // 데이터 삭제
  async delete(namespace, key, userId = null) {
    const cacheKey = this.generateKey(namespace, key, userId);

    try {
      // L1 캐시에서 삭제
      this.memoryCache.delete(cacheKey);

      // L2 캐시에서 삭제
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.del(cacheKey);
      }

      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // 패턴 매칭으로 다중 삭제
  async deletePattern(pattern) {
    try {
      // 메모리 캐시는 패턴 매칭 지원하지 않으므로 전체 클리어
      this.memoryCache.clear();

      // Redis 패턴 삭제
      if (this.isRedisAvailable && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }

      return true;
    } catch (error) {
      console.error('Cache deletePattern error:', error);
      return false;
    }
  }

  // 사용자별 캐시 무효화
  async invalidateUserCache(userId) {
    const pattern = this.generateKey('*', '*', userId).replace(/\*/g, '*');
    return await this.deletePattern(pattern);
  }

  // 네임스페이스별 캐시 무효화
  async invalidateNamespace(namespace) {
    const pattern = this.generateKey(namespace, '*').replace(/\*/g, '*');
    return await this.deletePattern(pattern);
  }

  // 캐시 또는 DB에서 데이터 조회 (Cache-Aside 패턴)
  async getOrSet(namespace, key, fetchFunction, ttl = 300, userId = null) {
    // 캐시에서 먼저 조회
    let data = await this.get(namespace, key, userId);
    
    if (data !== null) {
      return data;
    }

    try {
      // 캐시에 없으면 DB에서 조회
      data = await fetchFunction();
      
      if (data !== null && data !== undefined) {
        // 조회한 데이터를 캐시에 저장
        await this.set(namespace, key, data, ttl, userId);
      }
      
      return data;
    } catch (error) {
      console.error('Cache getOrSet fetchFunction error:', error);
      throw error;
    }
  }

  // 배치 조회
  async getBatch(requests) {
    const results = [];
    
    for (const request of requests) {
      const { namespace, key, userId } = request;
      const result = await this.get(namespace, key, userId);
      results.push({
        ...request,
        data: result,
        hit: result !== null
      });
    }
    
    return results;
  }

  // 배치 저장
  async setBatch(items) {
    const promises = items.map(item => {
      const { namespace, key, value, ttl = 300, userId } = item;
      return this.set(namespace, key, value, ttl, userId);
    });
    
    return await Promise.all(promises);
  }

  // 데이터 직렬화
  serialize(value) {
    try {
      return JSON.stringify({
        data: value,
        timestamp: Date.now(),
        type: typeof value
      });
    } catch (error) {
      console.error('Cache serialize error:', error);
      return null;
    }
  }

  // 데이터 역직렬화
  deserialize(value) {
    try {
      const parsed = JSON.parse(value);
      return parsed.data;
    } catch (error) {
      console.error('Cache deserialize error:', error);
      return null;
    }
  }

  // 캐시 상태 및 통계
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 ? 
                   (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memoryHitRate: this.stats.hits > 0 ? 
                    `${(this.stats.memoryHits / this.stats.hits * 100).toFixed(2)}%` : '0%',
      redisHitRate: this.stats.hits > 0 ? 
                   `${(this.stats.redisHits / this.stats.hits * 100).toFixed(2)}%` : '0%',
      memorySize: this.memoryCache.size,
      memoryLoad: this.memoryCache.load,
      isRedisAvailable: this.isRedisAvailable
    };
  }

  // 캐시 초기화
  async clear() {
    try {
      this.memoryCache.clear();
      
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.flushDb();
      }
      
      // 통계 초기화
      this.stats = {
        hits: 0,
        misses: 0,
        memoryHits: 0,
        redisHits: 0,
        sets: 0,
        deletes: 0
      };
      
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // 캐시 워밍업 (자주 사용되는 데이터 미리 로드)
  async warmup(warmupTasks) {
    console.log('🔥 Starting cache warmup...');
    
    for (const task of warmupTasks) {
      try {
        const { namespace, key, fetchFunction, ttl, userId } = task;
        await this.getOrSet(namespace, key, fetchFunction, ttl, userId);
        console.log(`✅ Warmed up: ${namespace}:${key}`);
      } catch (error) {
        console.error(`❌ Warmup failed for ${task.namespace}:${task.key}:`, error);
      }
    }
    
    console.log('🔥 Cache warmup completed');
  }

  // 캐시 연결 종료
  async disconnect() {
    try {
      if (this.redisClient) {
        await this.redisClient.disconnect();
        console.log('Redis disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }

  // 메모리 사용량 모니터링
  getMemoryUsage() {
    const used = process.memoryUsage();
    return {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100,
      cacheSize: this.memoryCache.size,
      cacheLoad: this.memoryCache.load
    };
  }
}

// 싱글톤 인스턴스
let cacheServiceInstance = null;

const getCacheService = () => {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
};

// 매칭 플랫폼 전용 캐시 네임스페이스
const CACHE_NAMESPACES = {
  USER: 'user',
  MATCH: 'match',
  CONVERSATION: 'conversation',
  MESSAGE: 'message',
  VALUES_ASSESSMENT: 'values_assessment',
  STATISTICS: 'statistics',
  SEARCH: 'search',
  RECOMMENDATIONS: 'recommendations'
};

// 매칭 플랫폼용 캐시 헬퍼 함수들
const CacheHelpers = {
  // 사용자 프로필 캐시
  async getUserProfile(userId, fetchFunction) {
    const cache = getCacheService();
    return await cache.getOrSet(
      CACHE_NAMESPACES.USER, 
      `profile:${userId}`, 
      fetchFunction, 
      600, // 10분
      userId
    );
  },

  // 매치 결과 캐시
  async getMatchResults(userId, fetchFunction) {
    const cache = getCacheService();
    return await cache.getOrSet(
      CACHE_NAMESPACES.MATCH, 
      `results:${userId}`, 
      fetchFunction, 
      1800, // 30분
      userId
    );
  },

  // 대화 목록 캐시
  async getConversations(userId, fetchFunction) {
    const cache = getCacheService();
    return await cache.getOrSet(
      CACHE_NAMESPACES.CONVERSATION, 
      `list:${userId}`, 
      fetchFunction, 
      300, // 5분
      userId
    );
  },

  // 통계 데이터 캐시
  async getStatistics(key, fetchFunction, ttl = 3600) {
    const cache = getCacheService();
    return await cache.getOrSet(
      CACHE_NAMESPACES.STATISTICS, 
      key, 
      fetchFunction, 
      ttl // 1시간
    );
  },

  // 검색 결과 캐시
  async getSearchResults(query, filters, fetchFunction) {
    const cache = getCacheService();
    const searchKey = `${query}:${JSON.stringify(filters)}`;
    return await cache.getOrSet(
      CACHE_NAMESPACES.SEARCH, 
      searchKey, 
      fetchFunction, 
      600 // 10분
    );
  },

  // 사용자 관련 캐시 무효화
  async invalidateUserData(userId) {
    const cache = getCacheService();
    await Promise.all([
      cache.invalidateUserCache(userId),
      cache.delete(CACHE_NAMESPACES.MATCH, `results:${userId}`, userId),
      cache.delete(CACHE_NAMESPACES.CONVERSATION, `list:${userId}`, userId),
      cache.delete(CACHE_NAMESPACES.USER, `profile:${userId}`, userId)
    ]);
  },

  // 매치 관련 캐시 무효화
  async invalidateMatchData(userId1, userId2) {
    const cache = getCacheService();
    await Promise.all([
      cache.delete(CACHE_NAMESPACES.MATCH, `results:${userId1}`, userId1),
      cache.delete(CACHE_NAMESPACES.MATCH, `results:${userId2}`, userId2),
      cache.invalidateNamespace(CACHE_NAMESPACES.STATISTICS)
    ]);
  }
};

module.exports = {
  CacheService,
  getCacheService,
  CACHE_NAMESPACES,
  CacheHelpers
};