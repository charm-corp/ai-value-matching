// API Client for CHARM_INYEON Platform
class APIClient {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.token = localStorage.getItem('charm_token');
    this.refreshToken = localStorage.getItem('charm_refresh_token');
  }

  // Set authorization header
  getHeaders(contentType = 'application/json') {
    const headers = {
      'Content-Type': contentType
    };
        
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
        
    return headers;
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}` 
      }));
            
      // Token expired - try to refresh
      if (response.status === 401 && error.expired && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          throw new Error('TOKEN_REFRESHED'); // Signal to retry request
        }
      }
            
      throw new Error(error.error || error.message || 'Unknown error');
    }
        
    return await response.json();
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
            
      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.data.token, data.data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
        
    this.logout();
    return false;
  }

  // Make API request with automatic retry on token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error.message === 'TOKEN_REFRESHED') {
        // Retry with new token
        config.headers = {
          ...this.getHeaders(),
          ...options.headers
        };
        const response = await fetch(url, config);
        return await this.handleResponse(response);
      }
      throw error;
    }
  }

  // Set authentication tokens
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('charm_token', token);
    localStorage.setItem('charm_refresh_token', refreshToken);
  }

  // Clear authentication
  logout() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('charm_token');
    localStorage.removeItem('charm_refresh_token');
    localStorage.removeItem('charm_user');
  }

  // Get current user info
  getCurrentUser() {
    const userStr = localStorage.getItem('charm_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set current user info
  setCurrentUser(user) {
    localStorage.setItem('charm_user', JSON.stringify(user));
  }

  // Authentication APIs
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
        
    if (response.success) {
      // 테스트 서버와 실제 서버 모두 지원
      const token = response.token || response.data?.token;
      const refreshToken = response.refreshToken || response.data?.refreshToken;
      const user = response.user || response.data?.user;
      
      if (token) {
        this.setTokens(token, refreshToken);
      }
      if (user) {
        this.setCurrentUser(user);
      }
    }
        
    return response;
  }

  async login(email, password, rememberMe = false) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe })
    });
        
    if (response.success) {
      // 테스트 서버와 실제 서버 모두 지원
      const token = response.token || response.data?.token;
      const refreshToken = response.refreshToken || response.data?.refreshToken;
      const user = response.user || response.data?.user;
      
      if (token) {
        this.setTokens(token, refreshToken);
      }
      if (user) {
        this.setCurrentUser(user);
      }
    }
        
    return response;
  }

  async getCurrentUserInfo() {
    return await this.request('/auth/me');
  }

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
  }

  // Values Assessment APIs
  async getValuesQuestions() {
    return await this.request('/values/questions');
  }

  async submitValuesAssessment(answers) {
    return await this.request('/values/submit', {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  async getValuesAssessment() {
    return await this.request('/values/assessment');
  }

  async calculateCompatibility(targetUserId) {
    return await this.request('/values/compatibility', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  }

  // Matching APIs
  async generateMatches() {
    return await this.request('/matching/generate', { method: 'POST' });
  }

  async getMyMatches(status = null, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    if (status) {params.append('status', status);}
        
    return await this.request(`/matching/my-matches?${params}`);
  }

  async respondToMatch(matchId, action, note = '') {
    return await this.request(`/matching/matches/${matchId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, note })
    });
  }

  async getMutualMatches() {
    return await this.request('/matching/mutual-matches');
  }

  async getMatchingStats() {
    return await this.request('/matching/stats');
  }

  // User Profile APIs
  async getUserProfile(userId = null) {
    const endpoint = userId ? `/users/${userId}` : '/users/profile';
    return await this.request(endpoint);
  }

  async updateProfile(profileData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async uploadProfileImage(imageFile) {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
        
    return await this.request('/profile/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
  }

  async getProfileCompleteness() {
    return await this.request('/profile/complete');
  }

  async searchUsers(query = '', filters = {}, page = 1, limit = 20) {
    const params = new URLSearchParams({ page, limit });
    if (query) {params.append('q', query);}
        
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {params.append(key, value);}
    });
        
    return await this.request(`/users/search?${params}`);
  }

  // Chat APIs
  async getConversations(status = 'active', page = 1, limit = 20) {
    const params = new URLSearchParams({ status, page, limit });
    return await this.request(`/chat/conversations?${params}`);
  }

  async startConversation(matchId, initialMessage = '') {
    return await this.request('/chat/conversations/start', {
      method: 'POST',
      body: JSON.stringify({ matchId, initialMessage })
    });
  }

  async getMessages(conversationId, page = 1, limit = 50, before = null) {
    const params = new URLSearchParams({ page, limit });
    if (before) {params.append('before', before);}
        
    return await this.request(`/chat/conversations/${conversationId}/messages?${params}`);
  }

  async sendMessage(conversationId, content, type = 'text', replyTo = null) {
    return await this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, type, replyTo })
    });
  }

  async getUnreadCount() {
    return await this.request('/chat/unread-count');
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  async checkServerHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Error handling helper
  showError(message, details = null) {
    console.error('API Error:', message, details);
        
    // Show user-friendly error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error-toast';
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
    errorDiv.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">오류 발생</div>
            <div style="font-size: 0.9rem;">${message}</div>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
            ">&times;</button>
        `;
        
    document.body.appendChild(errorDiv);
        
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  // Success message helper
  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'api-success-toast';
    successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
    successDiv.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem;">성공!</div>
            <div style="font-size: 0.9rem;">${message}</div>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 10px;
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
            ">&times;</button>
        `;
        
    document.body.appendChild(successDiv);
        
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 3000);
  }
}

// Add CSS for toast animations
const toastStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.api-error-toast,
.api-success-toast {
    font-family: 'Noto Sans KR', sans-serif;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);

// Create global API client instance
window.apiClient = new APIClient();