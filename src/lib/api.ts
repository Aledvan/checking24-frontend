const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  message?: string;
}

interface User {
  id: number;
  email: string;
  name: string | null;
  roles: string[];
  isEmailVerified: boolean;
}

interface AuthData {
  user: User;
  accessToken: string;
  expiresIn: number;
}

interface TokenData {
  accessToken: string;
  expiresIn: number;
}

class ApiClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Load token from localStorage on init
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const { accessToken, expiresAt } = JSON.parse(stored);
        this.accessToken = accessToken;
        this.tokenExpiresAt = expiresAt;
      } catch {
        localStorage.removeItem('auth');
      }
    }
  }

  setTokens(accessToken: string, expiresIn: number) {
    this.accessToken = accessToken;
    this.tokenExpiresAt = Date.now() + expiresIn * 1000;
    localStorage.setItem('auth', JSON.stringify({
      accessToken,
      expiresAt: this.tokenExpiresAt,
    }));
  }

  clearTokens() {
    this.accessToken = null;
    this.tokenExpiresAt = null;
    localStorage.removeItem('auth');
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) return true;
    // Consider token expired 30 seconds before actual expiry
    return Date.now() > this.tokenExpiresAt - 30000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          errors: data.errors,
        };
      }

      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Try to refresh token if expired
    if (this.isTokenExpired() && this.accessToken) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        this.clearTokens();
        return { success: false, error: 'Session expired' };
      }
    }

    const result = await this.request<T>(endpoint, options);

    // If unauthorized, try to refresh and retry once
    if (!result.success && result.error === 'Invalid token') {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request<T>(endpoint, options);
      }
      this.clearTokens();
    }

    return result;
  }

  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const result = await this.request<TokenData>('/auth/refresh', {
        method: 'POST',
      });

      if (result.success && result.data) {
        this.setTokens(result.data.accessToken, result.data.expiresIn);
        return true;
      }

      return false;
    })();

    const success = await this.refreshPromise;
    this.refreshPromise = null;
    return success;
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string): Promise<ApiResponse<AuthData>> {
    const result = await this.request<AuthData>('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (result.success && result.data) {
      this.setTokens(result.data.accessToken, result.data.expiresIn);
    }

    return result;
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const result = await this.request<AuthData>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success && result.data) {
      this.setTokens(result.data.accessToken, result.data.expiresIn);
    }

    return result;
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    });

    this.clearTokens();

    return result;
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.authenticatedRequest<User>('/auth/me');
  }

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    return this.authenticatedRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.authenticatedRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Incidents endpoints
  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    return this.authenticatedRequest<Incident[]>('/incidents');
  }

  async getActiveIncidents(): Promise<ApiResponse<Incident[]>> {
    return this.authenticatedRequest<Incident[]>('/incidents/active');
  }

  async getResolvedIncidents(): Promise<ApiResponse<Incident[]>> {
    return this.authenticatedRequest<Incident[]>('/incidents/resolved');
  }

  // Warnings endpoints
  async getWarnings(): Promise<ApiResponse<Warning[]>> {
    return this.authenticatedRequest<Warning[]>('/warnings');
  }

  async getPendingWarnings(): Promise<ApiResponse<Warning[]>> {
    return this.authenticatedRequest<Warning[]>('/warnings/pending');
  }

  // Monitoring endpoints
  async getSites(): Promise<ApiResponse<Site[]>> {
    return this.authenticatedRequest<Site[]>('/monitoring');
  }

  async getSite(id: number): Promise<ApiResponse<Site>> {
    return this.authenticatedRequest<Site>(`/monitoring/${id}`);
  }

  async addSite(data: CreateSiteData): Promise<ApiResponse<Site>> {
    return this.authenticatedRequest<Site>('/monitoring/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSite(id: number, data: UpdateSiteData): Promise<ApiResponse<Site>> {
    return this.authenticatedRequest<Site>(`/monitoring/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSite(id: number): Promise<ApiResponse> {
    return this.authenticatedRequest(`/monitoring/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.authenticatedRequest<DashboardStats>('/dashboard/stats');
  }
}

interface Site {
  id: number;
  name: string;
  url: string;
  status: 'up' | 'down' | 'warning';
  httpStatusCode: number | null;
  uptime: string;
  responseTime: number;
  checkInterval: number;
  isActive: boolean;
  checkSsl?: boolean;
  checkDomain?: boolean;
  lastCheckAt: string | null;
  sslExpiresAt: string | null;
  domainExpiresAt: string | null;
  createdAt: string;
}

interface CreateSiteData {
  name: string;
  url: string;
  checkInterval?: number;
  checkSsl?: boolean;
  checkDomain?: boolean;
}

interface UpdateSiteData {
  name: string;
  url: string;
  checkInterval?: number;
  isActive?: boolean;
  checkSsl?: boolean;
  checkDomain?: boolean;
}

interface Incident {
  id: number;
  siteId: number;
  siteName: string;
  url: string;
  startedAt: string;
  resolvedAt: string | null;
  duration: string | null;
  cause: string;
}

interface Warning {
  id: number;
  siteId: number;
  siteName: string;
  type: 'ssl' | 'domain';
  expiresAt: string;
  daysLeft: number;
  lastNotifiedAt: string | null;
}

interface UptimeChartPoint {
  time: string;
  uptime: number;
}

interface ResponseTimeChartPoint {
  time: string;
  ms: number;
}

interface DashboardStats {
  totalSites: number;
  activeSites: number;
  averageUptime: string;
  activeIncidents: number;
  avgResponseTime: number | null;
  uptimeChart: UptimeChartPoint[];
  responseTimeChart: ResponseTimeChartPoint[];
}

interface UpdateProfileData {
  name: string;
  email: string;
}

export const api = new ApiClient();
export type { User, AuthData, ApiResponse, Site, CreateSiteData, UpdateSiteData, Incident, Warning, DashboardStats, UptimeChartPoint, ResponseTimeChartPoint, UpdateProfileData };
