import React, { useState, useEffect } from 'react';
import { Bell, Plus, TrendingUp, Settings } from 'lucide-react';
import { Stock, WatchlistItem, Notification, WebSocketMessage } from '../types';
import { PulseTraderAPI, YahooStockData } from '../services/api';
import { PulseTraderWebSocket } from '../services/websocket';
import { EnhancedStockCard } from './EnhancedStockCard';
import { auth } from '../services/firebase';

interface DashboardProps {
  api: PulseTraderAPI;
}

export const Dashboard: React.FC<DashboardProps> = ({ api }) => {
  const [stocks, setStocks] = useState<WatchlistItem[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YahooStockData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(decimals);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [watchlistData, notificationsData, trendingData] = await Promise.all([
          api.getWatchlist(),
          api.getNotifications(),
          api.getTrendingStocks()
        ]);
        // Ensure watchlist items have required properties
        const validWatchlistData = watchlistData.map(item => ({
          ...item,
          targetPrice: item.targetPrice || item.price * 1.1,
          alertType: item.alertType || 'above'
        })) as WatchlistItem[];
        setStocks(validWatchlistData);
        setNotifications(notificationsData);
        setTrendingStocks(trendingData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Setup WebSocket
    const setupWebSocket = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('No user found for WebSocket connection');
          return null;
        }
        const token = await user.getIdToken();
        const ws = new PulseTraderWebSocket(token, handleWebSocketMessage);
        ws.connect();
        return ws;
      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
        return null;
      }
    };

    let ws: PulseTraderWebSocket | null = null;
    setupWebSocket().then(websocket => {
      if (websocket) {
        ws = websocket;
      }
    });

    // Refresh trending stocks every minute
    const trendingInterval = setInterval(async () => {
      try {
        const trendingData = await api.getTrendingStocks();
        setTrendingStocks(trendingData);
      } catch (error) {
        console.error('Failed to refresh trending stocks:', error);
      }
    }, 60000);

    return () => {
      if (ws) {
        ws.disconnect();
      }
      clearInterval(trendingInterval);
    };
  }, []);

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'price_update':
        if (data.symbol && data.price !== undefined && data.change !== undefined && data.changePercent !== undefined) {
          setStocks(current =>
            current.map(stock =>
              stock.symbol === data.symbol
                ? { ...stock, price: data.price!, change: data.change!, changePercent: data.changePercent! }
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

  const addToWatchlist = async (symbol: string) => {
    try {
      console.log('Adding to watchlist:', symbol);
      const stockData = await api.getStockData(symbol);
      console.log('Stock data received:', stockData);
      
      if (!stockData || !stockData.price) {
        console.error('Invalid stock data received:', stockData);
        return;
      }

      // Set default target price to 10% above current price
      const targetPrice = stockData.price * 1.1;
      // Set default alert type to 'above'
      const alertType = 'above';
      
      console.log('Calling addToWatchlist with:', { symbol, targetPrice, alertType });
      await api.addToWatchlist(symbol, targetPrice, alertType);
      console.log('Successfully added to watchlist, fetching updated watchlist');
      
      // Fetch the updated watchlist
      const watchlistData = await api.getWatchlist();
      console.log('New watchlist data:', watchlistData);
      
      // Convert YahooStockData to WatchlistItem
      const validWatchlistData = watchlistData.map(item => ({
        ...item,
        targetPrice: item.targetPrice || item.price * 1.1,
        alertType: item.alertType || 'above'
      })) as WatchlistItem[];
      
      // Update the local state with the new watchlist
      setStocks(validWatchlistData);
      
      // Clear the search
      setSearchResults([]);
      setSearchQuery('');
      
      // Show success message (you can add a toast notification here if you want)
      console.log('Successfully added', symbol, 'to watchlist');
    } catch (error) {
      console.error('Failed to add stock:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      console.log('Removing from watchlist:', symbol);
      await api.removeFromWatchlist(symbol);
      console.log('Successfully removed from watchlist');
      setStocks(current => current.filter(stock => stock.symbol !== symbol));
    } catch (error) {
      console.error('Failed to remove stock:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
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
            
            {searchResults.length > 0 && searchQuery.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-cyan-500/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map(result => (
                  <button
                    key={result.symbol}
                    onClick={() => {
                      addToWatchlist(result.symbol);
                      // Clear search after adding to watchlist
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-700/50 text-white text-sm transition-colors duration-150 ease-in-out flex flex-col gap-0.5"
                  >
                    <div className="font-semibold truncate">{result.symbol}</div>
                    <div className="text-xs text-gray-400 truncate">{result.name}</div>
                    <div className="text-xs">
                      <span className={result.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${formatNumber(result.price)} ({formatNumber(result.changePercent)}%)
                      </span>
                    </div>
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

        {/* Trending Stocks */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400 mr-2" />
            <h2 className="text-xl font-semibold text-white">Trending Stocks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingStocks.map(stock => (
              <div
                key={stock.symbol}
                className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{stock.symbol}</h3>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                  </div>
                  <button
                    onClick={() => addToWatchlist(stock.symbol)}
                    className="p-1 text-cyan-400 hover:text-cyan-300"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">${formatNumber(stock.price)}</span>
                  <span
                    className={
                      (stock.change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {(stock.changePercent || 0) >= 0 ? '+' : ''}
                    {formatNumber(stock.changePercent)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watchlist */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white mb-4">Your Watchlist</h2>
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
    </div>
  );
};