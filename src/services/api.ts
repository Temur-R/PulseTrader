import { Stock, StockSearchResult, Notification, Analysis } from '../types';

export class StockPulseAPI {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.token = localStorage.getItem('stockpulse_token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('stockpulse_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...(options.headers || {})
    };

    const config: RequestInit = {
      ...options,
      headers
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password } as any,
    });
  }

  async register(userData: { firstName: string; lastName: string; email: string; password: string }): Promise<{ token: string; user: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData as any,
    });
  }

  async loginWithGoogle(credential: string): Promise<{ token: string }> {
    return this.request('/auth/google', {
      method: 'POST',
      body: { credential } as any,
    });
  }

  // Stock operations
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    return this.request(`/stocks/search?q=${encodeURIComponent(query)}`);
  }

  async getStockData(symbol: string): Promise<Stock> {
    return this.request(`/stocks/${symbol}`);
  }

  async getStockPrice(symbol: string): Promise<number> {
    return this.request(`/stocks/${symbol}/price`);
  }

  async getStockAnalysis(symbol: string): Promise<{ analysis: Analysis }> {
    return this.request(`/stocks/${symbol}/analysis`);
  }

  // Watchlist operations
  async getWatchlist(): Promise<Stock[]> {
    return this.request('/watchlist');
  }

  async addToWatchlist(symbol: string, targetPrice: number, alertType: 'above' | 'below' = 'above'): Promise<void> {
    return this.request('/watchlist', {
      method: 'POST',
      body: { symbol, targetPrice, alertType } as any,
    });
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    return this.request(`/watchlist/${symbol}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
} 