const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          window.location.href = '/';
        }
        throw new Error(data.detail || data.message || `API Error: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Generic GET method
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`${endpoint}${queryString}`);
  }

  // Generic POST method
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic PUT method
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic DELETE method
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Auth methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    flat_number?: string;
    phone_number?: string;
    preferred_contact?: string;
    contact_times?: string[];
    interests?: string[];
  }) {
    const response = await this.post<{
      user_id: number;
      username: string;
      email: string;
      token: string;
      is_admin: boolean;
    }>('/api/auth/register', userData);

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.post<{
      user_id: number;
      username: string;
      email: string;
      full_name?: string;
      flat_number?: string;
      phone_number?: string;
      preferred_contact?: string;
      contact_times?: string[];
      interests?: string[];
      is_admin: boolean;
      token: string;
    }>('/api/auth/login', { email, password });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async getMe() {
    return this.get<{
      id: number;
      username: string;
      email: string;
      full_name?: string;
      flat_number?: string;
      phone_number?: string;
      preferred_contact?: string;
      contact_times?: string[];
      interests?: string[];
      is_admin: boolean;
    }>('/api/auth/me');
  }

  async updateProfile(updates: {
    full_name?: string;
    flat_number?: string;
    phone_number?: string;
    preferred_contact?: string;
    contact_times?: string[];
    interests?: string[];
  }) {
    return this.put('/api/auth/profile', updates);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Books methods
  async getBooks(params?: {
    search?: string;
    genre?: string;
    available?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return this.get<Array<{
      id: number;
      title: string;
      author: string;
      isbn?: string;
      genre?: string;
      publication_year?: number;
      language?: string;
      description?: string;
      cover_url?: string;
      owner_id: number;
      owner_name: string;
      is_available: boolean;
      tags: string[];
      created_at: string;
    }>>('/api/books', params);
  }

  async getBook(id: number) {
    return this.get(`/api/books/${id}`);
  }

  async createBook(bookData: {
    title: string;
    author: string;
    isbn?: string;
    genre?: string;
    publication_year?: number;
    language?: string;
    description?: string;
    cover_url?: string;
    tags?: string[];
  }) {
    return this.post<{ id: number }>('/api/books', bookData);
  }

  async updateBook(id: number, bookData: any) {
    return this.put(`/api/books/${id}`, bookData);
  }

  async deleteBook(id: number) {
    return this.delete(`/api/books/${id}`);
  }

  async getMyBooks(params?: { available?: boolean }) {
    return this.get('/api/books/my/books', params);
  }

  // Board Games methods
  async getBoardGames(params?: {
    search?: string;
    complexity?: string;
    available?: boolean;
    min_players?: number;
    limit?: number;
    offset?: number;
  }) {
    return this.get<Array<{
      id: number;
      title: string;
      designer?: string;
      min_players?: number;
      max_players?: number;
      play_time?: string;
      complexity?: string;
      description?: string;
      image_url?: string;
      owner_id: number;
      owner_name: string;
      is_available: boolean;
      categories: string[];
      components: string[];
      created_at: string;
    }>>('/api/boardgames', params);
  }

  async getBoardGame(id: number) {
    return this.get(`/api/boardgames/${id}`);
  }

  async createBoardGame(gameData: {
    title: string;
    designer?: string;
    min_players?: number;
    max_players?: number;
    play_time?: string;
    complexity?: string;
    description?: string;
    image_url?: string;
    categories?: string[];
    components?: string[];
  }) {
    return this.post<{ id: number }>('/api/boardgames', gameData);
  }

  async updateBoardGame(id: number, gameData: any) {
    return this.put(`/api/boardgames/${id}`, gameData);
  }

  async deleteBoardGame(id: number) {
    return this.delete(`/api/boardgames/${id}`);
  }

  async getMyBoardGames(params?: { available?: boolean }) {
    return this.get('/api/boardgames/my/boardgames', params);
  }

  // Requests methods
  async getRequests(params?: {
    status?: string;
    type?: string;
    item_type?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get<Array<{
      id: number;
      item_type: string;
      item_id: number;
      item_title: string;
      item_creator: string;
      requester_id: number;
      requester_name: string;
      requester_email: string;
      owner_id: number;
      owner_name: string;
      owner_email: string;
      status: string;
      request_date: string;
      response_date?: string;
      pickup_date: string;
      return_date: string;
      notes?: string;
      is_owner: boolean;
      is_requester: boolean;
    }>>('/api/requests', params);
  }

  async getRequest(id: number) {
    return this.get(`/api/requests/${id}`);
  }

  async createRequest(requestData: {
    item_type: string;
    item_id: number;
    pickup_date: string;
    return_date: string;
    notes?: string;
  }) {
    return this.post<{ id: number }>('/api/requests', requestData);
  }

  async updateRequest(id: number, requestData: {
    pickup_date?: string;
    return_date?: string;
    notes?: string;
  }) {
    return this.put(`/api/requests/${id}`, requestData);
  }

  async approveRequest(requestId: number) {
    return this.put(`/api/requests/${requestId}/approve`);
  }

  async rejectRequest(requestId: number) {
    return this.put(`/api/requests/${requestId}/reject`);
  }

  async cancelRequest(requestId: number) {
    return this.put(`/api/requests/${requestId}/cancel`);
  }

  async returnItem(requestId: number) {
    return this.put(`/api/requests/${requestId}/return`);
  }

  async getRequestStats() {
    return this.get('/api/requests/stats/summary');
  }

  // Notifications methods
  async getNotifications(params?: {
    is_read?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return this.get<Array<{
      id: number;
      user_id: number;
      title: string;
      message: string;
      type: string;
      is_read: boolean;
      created_at: string;
    }>>('/api/notifications', params);
  }

  async markNotificationRead(notificationId: number) {
    return this.put(`/api/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead() {
    return this.put('/api/notifications/read-all');
  }

  async deleteNotification(notificationId: number) {
    return this.delete(`/api/notifications/${notificationId}`);
  }

  async deleteAllNotifications() {
    return this.delete('/api/notifications');
  }

  async getNotificationCount() {
    return this.get('/api/notifications/count');
  }

  // Admin methods
  async getAdminStats() {
    return this.get<{
      users: { total: number; active: number; new_this_week: number; admins: number };
      books: { total: number; available: number; genres: number };
      boardgames: { total: number; available: number; easy: number; medium: number; hard: number };
      requests: { total: number; pending: number; approved: number; rejected: number; returned: number; active_loans: number };
      recent_activities: Array<{
        id: number;
        user_id: number;
        username: string;
        action: string;
        item_type: string;
        item_id: number;
        details?: any;
        created_at: string;
      }>;
      top_users: {
        lenders: Array<{ id: number; username: string; loans_count: number }>;
        borrowers: Array<{ id: number; username: string; borrows_count: number }>;
      };
    }>('/api/admin/stats');
  }

  async getUsers(params?: {
    search?: string;
    is_active?: boolean;
    is_admin?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return this.get('/api/admin/users', params);
  }

  async getUserDetails(userId: number) {
    return this.get(`/api/admin/users/${userId}`);
  }

  async updateUser(userId: number, updates: {
    is_admin?: boolean;
    is_active?: boolean;
  }) {
    return this.put(`/api/admin/users/${userId}`, updates);
  }

  async deleteUser(userId: number) {
    return this.delete(`/api/admin/users/${userId}`);
  }

  // Activity log
  async getActivityLog(params?: {
    user_id?: number;
    action?: string;
    item_type?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.get<Array<{
      id: number;
      user_id: number;
      username: string;
      action: string;
      item_type: string;
      item_id: number;
      details?: any;
      created_at: string;
    }>>('/api/activity', params);
  }

  async getActivitySummary(days: number = 7) {
    return this.get('/api/activity/summary', { days });
  }

  // Search method
  async search(query: string) {
    return this.get<{
      books: Array<{
        id: number;
        title: string;
        author: string;
        owner_name: string;
        is_available: boolean;
      }>;
      boardgames: Array<{
        id: number;
        title: string;
        designer?: string;
        owner_name: string;
        is_available: boolean;
      }>;
      query: string;
      total_results: number;
    }>('/api/search', { q: query });
  }
}

export default new ApiService();