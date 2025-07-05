// api.ts

// Use import.meta.env for client-side environment variables in a Vite project
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
    // Try to get token from localStorage on initialization
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
        // Handle error responses
        if (response.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.logout();
          window.location.href = '/login';
        }

        throw new Error(data.detail || data.message || `API Error: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
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
    const response = await this.request<{
      user_id: number;
      username: string;
      email: string;
      token: string;
      is_admin: boolean;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
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
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async getMe() {
    return this.request<{
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
    }>('/auth/me');
  }

  async updateProfile(updates: {
    full_name?: string;
    flat_number?: string;
    phone_number?: string;
    preferred_contact?: string;
    contact_times?: string[];
    interests?: string[];
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
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
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<Array<{
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
    }>>(`/books?${queryString}`);
  }

  async getBook(id: number) {
    return this.request(`/books/${id}`);
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
    return this.request<{ id: number }>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id: number, bookData: any) {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id: number) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Board Games methods
  async getBoardGames(params?: {
    search?: string;
    complexity?: string;
    available?: boolean;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<Array<{
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
    }>>(`/boardgames?${queryString}`);
  }

  async getBoardGame(id: number) {
    return this.request(`/boardgames/${id}`);
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
    return this.request<{ id: number }>('/boardgames', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async updateBoardGame(id: number, gameData: any) {
    return this.request(`/boardgames/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gameData),
    });
  }

  async deleteBoardGame(id: number) {
    return this.request(`/boardgames/${id}`, {
      method: 'DELETE',
    });
  }

  // Requests methods
  async getRequests(params?: {
    status?: string;
    type?: string; // 'sent' or 'received'
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<Array<{
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
    }>>(`/requests?${queryString}`);
  }

  async createRequest(requestData: {
    item_type: string; // 'book' or 'boardgame'
    item_id: number;
    pickup_date: string;
    return_date: string;
    notes?: string;
  }) {
    return this.request<{ id: number }>('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async approveRequest(requestId: number) {
    return this.request(`/requests/${requestId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectRequest(requestId: number) {
    return this.request(`/requests/${requestId}/reject`, {
      method: 'PUT',
    });
  }

  async returnItem(requestId: number) {
    return this.request(`/requests/${requestId}/return`, {
      method: 'PUT',
    });
  }

  // Notifications methods
  async getNotifications() {
    return this.request<Array<{
      id: number;
      user_id: number;
      title: string;
      message: string;
      type: string;
      is_read: boolean;
      created_at: string;
    }>>('/notifications');
  }

  async markNotificationRead(notificationId: number) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // Admin methods
  async getAdminStats() {
    return this.request<{
      total_users: number;
      total_books: number;
      total_boardgames: number;
      pending_requests: number;
      active_loans: number;
      recent_activities: Array<{
        id: number;
        user_id: number;
        username: string;
        action: string;
        item_type: string;
        item_id: number;
        created_at: string;
      }>;
    }>('/admin/stats');
  }

  async getUsers() {
    return this.request<Array<{
      id: number;
      username: string;
      email: string;
      full_name?: string;
      is_admin: boolean;
      is_active: boolean;
      created_at: string;
    }>>('/admin/users');
  }

  async updateUser(userId: number, updates: {
    is_admin?: boolean;
    is_active?: boolean;
  }) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Search method
  async search(query: string) {
    return this.request<{
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
    }>(`/search?q=${encodeURIComponent(query)}`);
  }

  // Activity log
  async getActivityLog(params?: {
    user_id?: number;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<Array<{
      id: number;
      user_id: number;
      username: string;
      action: string;
      item_type: string;
      item_id: number;
      details?: any;
      created_at: string;
    }>>(`/activity?${queryString}`);
  }

  // File upload helper
  async uploadImage(file: File, type: 'book' | 'boardgame' = 'book'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  }
}

// Export singleton instance
export default new ApiService();