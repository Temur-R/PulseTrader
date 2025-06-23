import { Stock, StockSearchResult, Notification, Analysis } from '../types';

export interface YahooStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  targetPrice?: number;
  alertType?: 'above' | 'below';
}

export class PulseTraderAPI {
  private token: string | null;
  private baseUrl: string;

  constructor() {
    this.token = localStorage.getItem('pulsetrader_token');
    this.baseUrl = 'http://localhost:3001/api';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    console.log('Making API request to:', `${this.baseUrl}${endpoint}`);
    console.log('Request options:', {
      ...options,
      headers: {
        ...headers,
        Authorization: this.token ? 'Bearer [TOKEN]' : undefined
      }
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        error
      });
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();
    console.log('API response:', data);
    return data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('pulsetrader_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  // Authentication methods
  async register(userData: { 
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async loginWithGoogle(credential: string) {
    const response = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getUserProfile() {
    return this.request('/user/profile');
  }

  // Stock operations
  async searchStocks(query: string): Promise<YahooStockData[]> {
    return this.request(`/stocks/search?q=${encodeURIComponent(query)}`);
  }

  async getStockData(symbol: string): Promise<YahooStockData> {
    return this.request(`/stocks/${symbol}`);
  }

  async getTrendingStocks(): Promise<YahooStockData[]> {
    return this.request('/stocks/trending/market');
  }

  // Watchlist operations
  async getWatchlist(): Promise<YahooStockData[]> {
    return this.request('/watchlist');
  }

  async addToWatchlist(symbol: string, targetPrice: number, alertType: 'above' | 'below' = 'above'): Promise<void> {
    return this.request('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ symbol, targetPrice, alertType }),
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