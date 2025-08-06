/**
 * Base Controller
 * RLS와 서비스 레이어를 통합한 기본 컨트롤러 클래스
 */

class BaseController {
  constructor(ServiceClass) {
    this.ServiceClass = ServiceClass;
  }

  // 서비스 인스턴스 생성 (RLS 컨텍스트 포함)
  getService(req) {
    return new this.ServiceClass(req.rlsContext);
  }

  // 표준 응답 형식
  sendResponse(res, data, message = null, statusCode = 200) {
    const response = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  // 에러 응답 형식
  sendError(res, error, statusCode = 500, code = null) {
    const response = {
      success: false,
      error: error.message || error,
      timestamp: new Date().toISOString()
    };

    if (code) {
      response.code = code;
    }

    // 개발 환경에서는 스택 트레이스 포함
    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
  }

  // 페이지네이션 응답 형식
  sendPaginatedResponse(res, data, pagination, message = null) {
    const response = {
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };

    if (message) {
      response.message = message;
    }

    return res.json(response);
  }

  // 기본 CRUD 메서드들
  
  // 생성
  create = async (req, res) => {
    try {
      const service = this.getService(req);
      const result = await service.create(req.body);
      
      this.sendResponse(res, result, '성공적으로 생성되었습니다.', 201);
    } catch (error) {
      console.error(`Error in ${this.constructor.name} create:`, error);
      
      if (error.message.includes('권한')) {
        return this.sendError(res, error, 403, 'PERMISSION_DENIED');
      }
      
      if (error.name === 'ValidationError') {
        return this.sendError(res, error, 400, 'VALIDATION_ERROR');
      }
      
      this.sendError(res, error, 500, 'CREATE_ERROR');
    }
  };

  // 목록 조회
  getList = async (req, res) => {
    try {
      const service = this.getService(req);
      const {
        page = 1,
        limit = 20,
        sort = '-createdAt',
        ...filters
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100), // 최대 100개로 제한
        sort: this.parseSortString(sort)
      };

      const result = await service.paginate(filters, options);
      
      this.sendPaginatedResponse(res, result.data, result.pagination);
    } catch (error) {
      console.error(`Error in ${this.constructor.name} getList:`, error);
      this.sendError(res, error, 500, 'GET_LIST_ERROR');
    }
  };

  // 단일 조회
  getById = async (req, res) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;
      
      const result = await service.findById(id, {
        populate: this.getPopulateFields()
      });

      if (!result) {
        return this.sendError(res, '데이터를 찾을 수 없습니다.', 404, 'NOT_FOUND');
      }

      this.sendResponse(res, result);
    } catch (error) {
      console.error(`Error in ${this.constructor.name} getById:`, error);
      
      if (error.message.includes('권한')) {
        return this.sendError(res, error, 403, 'PERMISSION_DENIED');
      }
      
      this.sendError(res, error, 500, 'GET_BY_ID_ERROR');
    }
  };

  // 업데이트
  updateById = async (req, res) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;
      
      const result = await service.updateById(id, req.body);

      if (!result) {
        return this.sendError(res, '데이터를 찾을 수 없습니다.', 404, 'NOT_FOUND');
      }

      this.sendResponse(res, result, '성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error(`Error in ${this.constructor.name} updateById:`, error);
      
      if (error.message.includes('권한')) {
        return this.sendError(res, error, 403, 'PERMISSION_DENIED');
      }
      
      if (error.name === 'ValidationError') {
        return this.sendError(res, error, 400, 'VALIDATION_ERROR');
      }
      
      this.sendError(res, error, 500, 'UPDATE_ERROR');
    }
  };

  // 삭제
  deleteById = async (req, res) => {
    try {
      const service = this.getService(req);
      const { id } = req.params;
      
      const result = await service.deleteById(id);

      if (!result) {
        return this.sendError(res, '데이터를 찾을 수 없습니다.', 404, 'NOT_FOUND');
      }

      this.sendResponse(res, result, '성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error(`Error in ${this.constructor.name} deleteById:`, error);
      
      if (error.message.includes('권한')) {
        return this.sendError(res, error, 403, 'PERMISSION_DENIED');
      }
      
      this.sendError(res, error, 500, 'DELETE_ERROR');
    }
  };

  // 검색
  search = async (req, res) => {
    try {
      const service = this.getService(req);
      const {
        q: searchTerm,
        page = 1,
        limit = 20,
        sort = '-createdAt'
      } = req.query;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return this.sendError(res, '검색어는 최소 2글자 이상이어야 합니다.', 400, 'INVALID_SEARCH_TERM');
      }

      const searchFields = this.getSearchFields();
      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100),
        sort: this.parseSortString(sort)
      };

      const results = await service.search(searchTerm.trim(), searchFields, options);
      
      this.sendPaginatedResponse(res, results.data, results.pagination);
    } catch (error) {
      console.error(`Error in ${this.constructor.name} search:`, error);
      this.sendError(res, error, 500, 'SEARCH_ERROR');
    }
  };

  // 통계 조회
  getStats = async (req, res) => {
    try {
      const service = this.getService(req);
      
      // 기본 통계 (하위 클래스에서 오버라이드)
      const stats = await service.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0]
              }
            }
          }
        }
      ]);

      this.sendResponse(res, stats[0] || { total: 0, active: 0 });
    } catch (error) {
      console.error(`Error in ${this.constructor.name} getStats:`, error);
      this.sendError(res, error, 500, 'STATS_ERROR');
    }
  };

  // 일괄 처리
  bulkOperation = async (req, res) => {
    try {
      const service = this.getService(req);
      const { operation, ids, data } = req.body;

      if (!operation || !ids || !Array.isArray(ids)) {
        return this.sendError(res, '올바른 일괄 처리 요청이 아닙니다.', 400, 'INVALID_BULK_REQUEST');
      }

      let results = [];

      switch (operation) {
        case 'delete':
          for (const id of ids) {
            try {
              await service.deleteById(id);
              results.push({ id, success: true });
            } catch (error) {
              results.push({ id, success: false, error: error.message });
            }
          }
          break;

        case 'update':
          if (!data) {
            return this.sendError(res, '업데이트 데이터가 필요합니다.', 400, 'MISSING_UPDATE_DATA');
          }
          
          for (const id of ids) {
            try {
              const result = await service.updateById(id, data);
              results.push({ id, success: true, data: result });
            } catch (error) {
              results.push({ id, success: false, error: error.message });
            }
          }
          break;

        default:
          return this.sendError(res, '지원하지 않는 일괄 처리 작업입니다.', 400, 'UNSUPPORTED_BULK_OPERATION');
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      this.sendResponse(res, {
        results,
        summary: {
          total: results.length,
          success: successCount,
          failure: failureCount
        }
      }, `일괄 처리 완료: ${successCount}개 성공, ${failureCount}개 실패`);
    } catch (error) {
      console.error(`Error in ${this.constructor.name} bulkOperation:`, error);
      this.sendError(res, error, 500, 'BULK_OPERATION_ERROR');
    }
  };

  // 유틸리티 메서드들

  // 정렬 문자열 파싱
  parseSortString(sortString) {
    if (!sortString) return { createdAt: -1 };

    const sortObj = {};
    const sortFields = sortString.split(',');

    for (const field of sortFields) {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('-')) {
        sortObj[trimmedField.substring(1)] = -1;
      } else {
        sortObj[trimmedField] = 1;
      }
    }

    return sortObj;
  }

  // 하위 클래스에서 오버라이드할 메서드들

  // populate할 필드들 정의
  getPopulateFields() {
    return [];
  }

  // 검색 가능한 필드들 정의
  getSearchFields() {
    return ['name'];
  }

  // 커스텀 검증 로직
  validateCreateData(data) {
    return true;
  }

  validateUpdateData(data) {
    return true;
  }

  // 데이터 전처리
  preprocessCreateData(data, req) {
    return data;
  }

  preprocessUpdateData(data, req) {
    return data;
  }

  // 응답 데이터 후처리
  postprocessResponseData(data, req) {
    return data;
  }

  // 에러 핸들링 커스터마이징
  handleCustomError(error, req, res) {
    // 하위 클래스에서 특별한 에러 처리가 필요한 경우 오버라이드
    return false; // false를 반환하면 기본 에러 처리 실행
  }

  // 권한 체크 커스터마이징
  checkCustomPermissions(req, operation) {
    // 하위 클래스에서 추가 권한 체크가 필요한 경우 오버라이드
    return true;
  }

  // 감사 로그 (audit log) 기록
  logAuditEvent(req, operation, data, result = null) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId: req.rlsContext?.userId,
      operation,
      resource: this.constructor.name.replace('Controller', ''),
      data: this.sanitizeAuditData(data),
      result: result ? 'success' : 'failure',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // 감사 로그 저장 (비동기)
    if (process.env.AUDIT_LOGGING === 'true') {
      this.saveAuditLog(auditLog).catch(error => {
        console.error('Failed to save audit log:', error);
      });
    }

    console.log('Audit Log:', auditLog);
  }

  // 감사 데이터 정제 (민감한 정보 제거)
  sanitizeAuditData(data) {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // 감사 로그 저장 (구현은 하위 클래스나 별도 서비스에서)
  async saveAuditLog(auditLog) {
    // 기본적으로는 콘솔에만 출력
    // 실제 구현에서는 DB나 외부 로그 시스템에 저장
  }

  // 성능 모니터링
  async measurePerformance(operation, req, res, next) {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // 성능 메트릭 기록
      const perfLog = {
        operation,
        controller: this.constructor.name,
        duration,
        statusCode: res.statusCode,
        userId: req.rlsContext?.userId,
        timestamp: new Date().toISOString()
      };

      if (duration > 1000) { // 1초 이상 걸린 요청은 경고
        console.warn('Slow Operation:', perfLog);
      }

      if (process.env.PERFORMANCE_LOGGING === 'true') {
        console.log('Performance Log:', perfLog);
      }

      originalSend.call(this, data);
    }.bind(this);

    return next();
  }

  // 캐시 키 생성
  generateCacheKey(req, operation = 'default') {
    const userId = req.rlsContext?.userId || 'anonymous';
    const queryString = JSON.stringify(req.query);
    const paramString = JSON.stringify(req.params);
    
    return `${this.constructor.name}:${operation}:${userId}:${Buffer.from(queryString + paramString).toString('base64')}`;
  }
}

module.exports = BaseController;