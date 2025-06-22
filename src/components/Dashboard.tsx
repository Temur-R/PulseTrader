import React, { useState, useEffect } from 'react';
import { Bell, Plus, TrendingUp, Settings } from 'lucide-react';
import { Stock, StockSearchResult, Notification, WebSocketMessage } from '../types';
import { StockPulseAPI } from '../services/api';
import { StockPulseWebSocket } from '../services/websocket';
import { EnhancedStockCard } from './EnhancedStockCard';

interface DashboardProps {
  api: StockPulseAPI;
}

export const Dashboard: React.FC<DashboardProps> = ({ api }) => {
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
        setStocks(watchlistData);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Setup WebSocket
    const ws = new StockPulseWebSocket(api.getToken() || '', handleWebSocketMessage);
    ws.connect();

    return () => ws.disconnect();
  }, []);

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'price_update':
        if (data.symbol && data.price !== undefined && data.change !== undefined) {
          setStocks(current =>
            current.map(stock =>
              stock.symbol === data.symbol
                ? { ...stock, currentPrice: data.price!, change: data.change! }
                : stock
            )
          );
        }
        break;
      case 'notification':
        if (data.notification) {
          setNotifications(current => [data.notification!, ...current]);
        }
        break;
    }
  };

  const handleSearch = async (query: string) => {
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

  const addToWatchlist = async (symbol: string, targetPrice: number) => {
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

  const removeFromWatchlist = async (symbol: string) => {
    try {
      await api.removeFromWatchlist(symbol);
      setStocks(current => current.filter(stock => stock.symbol !== symbol));
    } catch (error) {
      console.error('Failed to remove stock:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Controls */}
        <div className="mb-8 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Search stocks..."
              className="w-full bg-slate-800/50 border border-cyan-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500/40"
            />
            
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-slate-800 border border-cyan-500/20 rounded-lg shadow-lg z-50">
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

          <div className="flex items-center space-x-4 ml-4">
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
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-cyan-500/20 rounded-lg shadow-lg z-50">
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
          </div>
        </div>

        {/* Stocks Grid */}
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
      </div>
    </div>
  );
}; 