const { createRLSQuery } = require('./rlsQueryBuilder');

/**
 * Base Service Class
 * 모든 서비스의 기본 클래스로 RLS 및 공통 기능 제공
 */
class BaseService {
  constructor(Model, rlsContext = null) {
    this.Model = Model;
    this.rlsContext = rlsContext;
    this.modelName = Model.modelName;
  }

  // RLS 컨텍스트 설정
  setRLSContext(rlsContext) {
    this.rlsContext = rlsContext;
    return this;
  }

  // RLS 검증이 포함된 조회
  async findById(id, options = {}) {
    try {
      const { populate = [], select = null } = options;

      let query = createRLSQuery(this.rlsContext)
        .setModel(this.Model)
        .where({ _id: id });

      if (select) {
        query = query.select(select);
      }

      populate.forEach(pop => {
        if (typeof pop === 'string') {
          query = query.populate(pop);
        } else {
          query = query.populate(pop.path, pop.select);
        }
      });

      return await query.findOne();
    } catch (error) {
      console.error(`Error in ${this.modelName} findById:`, error);
      throw new Error(`${this.modelName} 조회 중 오류가 발생했습니다.`);
    }
  }

  // RLS 검증이 포함된 목록 조회
  async find(conditions = {}, options = {}) {
    try {
      const { 
        populate = [], 
        select = null, 
        sort = { createdAt: -1 }, 
        limit = null,
        skip = 0 
      } = options;

      let query = createRLSQuery(this.rlsContext)
        .setModel(this.Model)
        .where(conditions)
        .sort(sort);

      if (select) {
        query = query.select(select);
      }

      if (limit) {
        query = query.limit(limit);
      }

      populate.forEach(pop => {
        if (typeof pop === 'string') {
          query = query.populate(pop);
        } else {
          query = query.populate(pop.path, pop.select);
        }
      });

      const results = await query.execute();
      
      // skip 처리 (메모리에서)
      if (skip > 0) {
        return results.slice(skip);
      }

      return results;
    } catch (error) {
      console.error(`Error in ${this.modelName} find:`, error);
      throw new Error(`${this.modelName} 목록 조회 중 오류가 발생했습니다.`);
    }
  }

  // RLS 검증이 포함된 단일 조회
  async findOne(conditions = {}, options = {}) {
    try {
      const { populate = [], select = null } = options;

      let query = createRLSQuery(this.rlsContext)
        .setModel(this.Model)
        .where(conditions);

      if (select) {
        query = query.select(select);
      }

      populate.forEach(pop => {
        if (typeof pop === 'string') {
          query = query.populate(pop);
        } else {
          query = query.populate(pop.path, pop.select);
        }
      });

      return await query.findOne();
    } catch (error) {
      console.error(`Error in ${this.modelName} findOne:`, error);
      throw new Error(`${this.modelName} 조회 중 오류가 발생했습니다.`);
    }
  }

  // RLS 검증이 포함된 생성
  async create(data) {
    try {
      // 생성 권한 확인 (RLS 정책 기반)
      if (this.rlsContext && !this.rlsContext.canAccess(this.modelName, data, 'create')) {
        throw new Error('생성 권한이 없습니다.');
      }

      // 데이터 검증 및 전처리
      const processedData = await this.preprocessCreateData(data);

      const document = new this.Model(processedData);
      const savedDocument = await document.save();

      // 후처리
      await this.postprocessCreate(savedDocument);

      return savedDocument;
    } catch (error) {
      console.error(`Error in ${this.modelName} create:`, error);
      if (error.message === '생성 권한이 없습니다.') {
        throw error;
      }
      throw new Error(`${this.modelName} 생성 중 오류가 발생했습니다.`);
    }
  }

  // RLS 검증이 포함된 업데이트
  async updateById(id, updateData) {
    try {
      // 기존 문서 조회 (RLS 적용)
      const existingDocument = await this.findById(id);
      
      if (!existingDocument) {
        throw new Error('업데이트할 문서를 찾을 수 없습니다.');
      }

      // 업데이트 권한 확인
      if (this.rlsContext && !this.rlsContext.canAccess(this.modelName, existingDocument, 'update')) {
        throw new Error('업데이트 권한이 없습니다.');
      }

      // 데이터 전처리
      const processedData = await this.preprocessUpdateData(updateData, existingDocument);

      const updatedDocument = await this.Model.findByIdAndUpdate(
        id,
        processedData,
        { new: true, runValidators: true }
      );

      // 후처리
      await this.postprocessUpdate(updatedDocument, existingDocument);

      return updatedDocument;
    } catch (error) {
      console.error(`Error in ${this.modelName} updateById:`, error);
      if (error.message.includes('권한이 없습니다') || error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error(`${this.modelName} 업데이트 중 오류가 발생했습니다.`);
    }
  }

  // RLS 검증이 포함된 삭제
  async deleteById(id) {
    try {
      // 기존 문서 조회 (RLS 적용)
      const existingDocument = await this.findById(id);
      
      if (!existingDocument) {
        throw new Error('삭제할 문서를 찾을 수 없습니다.');
      }

      // 삭제 권한 확인
      if (this.rlsContext && !this.rlsContext.canAccess(this.modelName, existingDocument, 'delete')) {
        throw new Error('삭제 권한이 없습니다.');
      }

      // 소프트 삭제인지 하드 삭제인지 결정
      const shouldSoftDelete = this.shouldUseSoftDelete(existingDocument);

      if (shouldSoftDelete) {
        // 소프트 삭제
        const deletedDocument = await this.Model.findByIdAndUpdate(
          id,
          { 
            isDeleted: true, 
            deletedAt: new Date(),
            deletedBy: this.rlsContext?.userId 
          },
          { new: true }
        );

        await this.postprocessSoftDelete(deletedDocument);
        return deletedDocument;
      } else {
        // 하드 삭제
        const deletedDocument = await this.Model.findByIdAndDelete(id);
        await this.postprocessHardDelete(deletedDocument);
        return deletedDocument;
      }
    } catch (error) {
      console.error(`Error in ${this.modelName} deleteById:`, error);
      if (error.message.includes('권한이 없습니다') || error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error(`${this.modelName} 삭제 중 오류가 발생했습니다.`);
    }
  }

  // 개수 조회
  async count(conditions = {}) {
    try {
      return await createRLSQuery(this.rlsContext)
        .setModel(this.Model)
        .where(conditions)
        .count();
    } catch (error) {
      console.error(`Error in ${this.modelName} count:`, error);
      throw new Error(`${this.modelName} 개수 조회 중 오류가 발생했습니다.`);
    }
  }

  // 페이지네이션 조회
  async paginate(conditions = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = [],
        select = null
      } = options;

      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        this.find(conditions, { 
          populate, 
          select, 
          sort, 
          limit, 
          skip 
        }),
        this.count(conditions)
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error(`Error in ${this.modelName} paginate:`, error);
      throw new Error(`${this.modelName} 페이지네이션 조회 중 오류가 발생했습니다.`);
    }
  }

  // 검색 기능
  async search(searchTerm, searchFields, options = {}) {
    try {
      const searchConditions = {
        $or: searchFields.map(field => ({
          [field]: { $regex: searchTerm, $options: 'i' }
        }))
      };

      return await this.find(searchConditions, options);
    } catch (error) {
      console.error(`Error in ${this.modelName} search:`, error);
      throw new Error(`${this.modelName} 검색 중 오류가 발생했습니다.`);
    }
  }

  // 집계 쿼리 (RLS 적용)
  async aggregate(pipeline) {
    try {
      // RLS 필터를 pipeline 첫 단계에 추가
      if (this.rlsContext && !this.rlsContext.isAdmin() && !this.rlsContext.isSystem()) {
        const rlsFilter = this.getRLSFilterForAggregate();
        if (rlsFilter) {
          pipeline.unshift({ $match: rlsFilter });
        }
      }

      return await this.Model.aggregate(pipeline);
    } catch (error) {
      console.error(`Error in ${this.modelName} aggregate:`, error);
      throw new Error(`${this.modelName} 집계 조회 중 오류가 발생했습니다.`);
    }
  }

  // Aggregate용 RLS 필터 생성
  getRLSFilterForAggregate() {
    const userId = this.rlsContext?.userId;
    if (!userId) return null;

    switch (this.modelName) {
      case 'User':
        return { _id: userId };
      case 'Match':
        return {
          $or: [
            { user1: userId },
            { user2: userId }
          ]
        };
      case 'Conversation':
        return { participants: userId };
      case 'Message':
        // 복잡한 조건이므로 별도 처리 필요
        return null;
      case 'ValuesAssessment':
        return { userId: userId };
      default:
        return { userId: userId };
    }
  }

  // 데이터 전처리 (생성 시)
  async preprocessCreateData(data) {
    // 기본적으로 현재 사용자 ID 추가 (해당 필드가 있는 경우)
    if (this.rlsContext?.userId && this.Model.schema.paths.userId) {
      data.userId = this.rlsContext.userId;
    }

    return data;
  }

  // 데이터 전처리 (업데이트 시)
  async preprocessUpdateData(updateData, existingDocument) {
    // 보안상 중요한 필드는 업데이트 제한
    const restrictedFields = ['_id', 'createdAt', 'userId'];
    
    restrictedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        delete updateData[field];
      }
    });

    return updateData;
  }

  // 생성 후처리
  async postprocessCreate(document) {
    // 기본적으로는 아무것도 하지 않음
    // 하위 클래스에서 오버라이드하여 사용
  }

  // 업데이트 후처리
  async postprocessUpdate(updatedDocument, originalDocument) {
    // 기본적으로는 아무것도 하지 않음
    // 하위 클래스에서 오버라이드하여 사용
  }

  // 소프트 삭제 후처리
  async postprocessSoftDelete(deletedDocument) {
    // 기본적으로는 아무것도 하지 않음
    // 하위 클래스에서 오버라이드하여 사용
  }

  // 하드 삭제 후처리
  async postprocessHardDelete(deletedDocument) {
    // 기본적으로는 아무것도 하지 않음
    // 하위 클래스에서 오버라이드하여 사용
  }

  // 소프트 삭제 사용 여부 결정
  shouldUseSoftDelete(document) {
    // 기본적으로는 하드 삭제 사용
    // 하위 클래스에서 오버라이드하여 소프트 삭제 정책 구현
    return false;
  }

  // 시스템 권한으로 실행 (RLS 우회)
  async executeAsSystem(operation) {
    const originalContext = this.rlsContext;
    
    try {
      // 임시로 시스템 컨텍스트 설정
      this.rlsContext = {
        userId: 'system',
        role: 'system',
        isAdmin: () => true,
        isSystem: () => true,
        canAccess: () => true
      };

      return await operation();
    } finally {
      // 원래 컨텍스트 복원
      this.rlsContext = originalContext;
    }
  }

  // 배치 처리 (대량 데이터 처리)
  async batchProcess(conditions, batchSize = 100, processor) {
    try {
      let processed = 0;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const batch = await this.find(conditions, {
          limit: batchSize,
          skip: skip
        });

        if (batch.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of batch) {
          await processor(item);
          processed++;
        }

        skip += batchSize;
        console.log(`Processed ${processed} ${this.modelName} documents...`);
      }

      return processed;
    } catch (error) {
      console.error(`Error in ${this.modelName} batchProcess:`, error);
      throw new Error(`${this.modelName} 배치 처리 중 오류가 발생했습니다.`);
    }
  }

  // 트랜잭션 실행
  async executeInTransaction(operations) {
    const session = await this.Model.db.startSession();
    
    try {
      session.startTransaction();
      
      const results = [];
      for (const operation of operations) {
        const result = await operation(session);
        results.push(result);
      }
      
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // 캐시 키 생성
  getCacheKey(method, params = {}) {
    const paramsString = JSON.stringify(params);
    const userId = this.rlsContext?.userId || 'anonymous';
    return `${this.modelName}:${method}:${userId}:${Buffer.from(paramsString).toString('base64')}`;
  }

  // 성능 모니터링
  async measurePerformance(operationName, operation) {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      console.log(`${this.modelName}.${operationName} completed in ${duration}ms`);
      
      // 성능 로그를 외부 모니터링 시스템에 전송 (예: DataDog, New Relic)
      if (process.env.PERFORMANCE_MONITORING === 'true') {
        // 성능 메트릭 전송 로직
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`${this.modelName}.${operationName} failed after ${duration}ms:`, error);
      throw error;
    }
  }
}

module.exports = BaseService;