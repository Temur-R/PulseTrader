import React, { useState, useEffect } from 'react';
import { Bell, Plus, TrendingUp, TrendingDown, X, Settings, Search, BarChart, Brain, Shield, Menu, ArrowRight } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  change: number;
}

interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

interface Analysis {
  summary: string;
  sentiment: 'bullish' | 'bearish';
  confidence: number;
}

interface WebSocketMessage {
  type: 'price_update' | 'notification';
  symbol?: string;
  price?: number;
  change?: number;
  notification?: Notification;
}

// API Service
class StockPulseAPI {
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

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...(options.headers || {})
      }
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
      body: { email, password },
    });
  }

  async register(userData: { email: string; password: string; name: string }): Promise<{ token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
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

  // Watchlist operations
  async getWatchlist(): Promise<Stock[]> {
    return this.request('/watchlist');
  }

  async addToWatchlist(symbol: string, targetPrice: number, alertType: 'above' | 'below' = 'above'): Promise<void> {
    return this.request('/watchlist', {
      method: 'POST',
      body: { symbol, targetPrice, alertType },
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

// WebSocket connection for real-time updates
class StockPulseWebSocket {
  private ws: WebSocket | null;
  private token: string;
  private onMessage: (data: WebSocketMessage) => void;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;

  constructor(token: string, onMessage: (data: WebSocketMessage) => void) {
    this.ws = null;
    this.token = token;
    this.onMessage = onMessage;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(): void {
    try {
      this.ws = new WebSocket('ws://localhost:8080');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        // Authenticate
        if (this.ws) {
          this.ws.send(JSON.stringify({ type: 'auth', token: this.token }));
        }
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 3000 * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Enhanced Stock Card with AI Analysis
const EnhancedStockCard = ({ stock, onRemove, api }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const isPositive = stock.change >= 0;
  const targetDistance = stock.currentPrice ? 
    ((stock.targetPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2) : 0;

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await api.request(`/stocks/${stock.symbol}/analysis`);
      setAnalysis(response.analysis);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{stock.symbol}</h3>
          <p className="text-gray-400">{stock.name}</p>
        </div>
        <button
          onClick={() => onRemove(stock.symbol)}
          className="text-gray-400 hover:text-red-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="text-2xl font-bold text-white">
          ${stock.currentPrice?.toFixed(2)}
        </div>
        <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="ml-1">{Math.abs(stock.change)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm">Target Price</p>
          <p className="text-white font-semibold">${stock.targetPrice}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Distance</p>
          <p className="text-white font-semibold">{targetDistance}%</p>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={() => {
            if (!analysis && !showAnalysis) {
              fetchAnalysis();
            }
            setShowAnalysis(!showAnalysis);
          }}
          className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Brain className="w-4 h-4" />
          <span>{showAnalysis ? 'Hide Analysis' : 'Show Analysis'}</span>
        </button>

        {showAnalysis && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
            {loading ? (
              <div className="text-center text-gray-400">Loading analysis...</div>
            ) : analysis ? (
              <div>
                <p className="text-white mb-2">{analysis.summary}</p>
                <div className="flex items-center space-x-2 text-sm">
                  <span className={`px-2 py-1 rounded ${analysis.sentiment === 'bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {analysis.sentiment.toUpperCase()}
                  </span>
                  <span className="text-gray-400">Confidence: {analysis.confidence}%</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">Failed to load analysis</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ api }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [watchlistData, notificationsData] = await Promise.all([
          api.getWatchlist(),
          api.getNotifications()
        ]);
        // Defensive: Ensure watchlistData is always an array of objects with required fields
        const safeStocks = Array.isArray(watchlistData)
          ? watchlistData.map(item => ({
              symbol: item.symbol || '',
              name: item.name || '',
              currentPrice: typeof item.currentPrice === 'number' ? item.currentPrice : 0,
              targetPrice: typeof item.targetPrice === 'number' ? item.targetPrice : 0,
              change: typeof item.change === 'number' ? item.change : 0,
              // ...add any other required fields with defaults
            }))
          : [];
        setStocks(safeStocks);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Setup WebSocket
    const ws = new StockPulseWebSocket(api.token, handleWebSocketMessage);
    ws.connect();

    return () => ws.disconnect();
  }, []);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'price_update':
        setStocks(current =>
          current.map(stock =>
            stock.symbol === data.symbol
              ? { ...stock, currentPrice: data.price, change: data.change }
              : stock
          )
        );
        break;
      case 'notification':
        setNotifications(current => [data.notification, ...current]);
        break;
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchStocks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const addToWatchlist = async (symbol, targetPrice) => {
    try {
      await api.addToWatchlist(symbol, targetPrice);
      const stockData = await api.getStockData(symbol);
      setStocks(current => [...current, stockData]);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      await api.removeFromWatchlist(symbol);
      setStocks(current => current.filter(stock => stock.symbol !== symbol));
    } catch (error) {
      console.error('Failed to remove stock:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">StockPulse</span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="Search stocks..."
                  className="bg-slate-800/50 border border-cyan-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/40 w-64"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-slate-800 border border-cyan-500/20 rounded-lg shadow-lg">
                    {searchResults.map(result => (
                      <button
                        key={result.symbol}
                        onClick={() => addToWatchlist(result.symbol, result.price * 1.1)}
                        className="w-full px-4 py-2 text-left hover:bg-slate-700/50 text-white"
                      >
                        <div className="font-semibold">{result.symbol}</div>
                        <div className="text-sm text-gray-400">{result.name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-300 hover:text-white transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-cyan-500/20 rounded-lg shadow-lg">
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-2">Notifications</h3>
                      {notifications.length === 0 ? (
                        <p className="text-gray-400">No notifications</p>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map(notification => (
                            <div
                              key={notification.id}
                              className="p-2 hover:bg-slate-700/50 rounded"
                            >
                              <p className="text-white">{notification.message}</p>
                              <p className="text-sm text-gray-400">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="text-gray-300 hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-cyan-400 text-xl">Loading your watchlist...</div>
            </div>
          ) : stocks.length === 0 ? (
            <div className="col-span-full bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
              <p className="text-gray-400 mb-4">
                Start by searching for stocks to add to your watchlist
              </p>
            </div>
          ) : (
            stocks.map(stock => (
              <EnhancedStockCard
                key={stock.symbol}
                stock={stock}
                onRemove={removeFromWatchlist}
                api={api}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  const [api] = useState(() => new StockPulseAPI());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('stockpulse_token');
    if (token) {
      api.setToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await api.login(email, password);
      api.setToken(response.token);
      setIsAuthenticated(true);
      setAuthError('');
    } catch (error) {
      setAuthError('Invalid email or password');
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await api.register(userData);
      api.setToken(response.token);
      setIsAuthenticated(true);
      setAuthError('');
    } catch (error) {
      setAuthError('Registration failed. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StockPulse</span>
          </div>

          {authError && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6">
              {authError}
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin(e.target.email.value, e.target.password.value);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-slate-700/50 border border-cyan-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/40"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full bg-slate-700/50 border border-cyan-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/40"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => {/* Implement register view toggle */}}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard api={api} />;
};

export default App;