import React, { useState, useEffect } from 'react';
import { Bell, Plus, TrendingUp, Settings, X } from 'lucide-react';
import { Stock, WatchlistItem, Notification, WebSocketMessage } from '../types';
import { PulseTraderAPI, YahooStockData } from '../services/api';
import { PulseTraderWebSocket } from '../services/websocket';
import { EnhancedStockCard } from './EnhancedStockCard';
import { StockCard } from './StockCard';

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
    const ws = new PulseTraderWebSocket(api.getToken() || '', handleWebSocketMessage);
    ws.connect();

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
      ws.disconnect();
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

  const addToWatchlist = async (result: YahooStockData) => {
    try {
      if (!result?.symbol || !result.price) {
        console.error('Invalid stock result:', result);
        return;
      }

      // Use actual price from search result
      const targetPrice = result.price * 1.1;
      const alertType = 'above';
      
      console.log('Calling addToWatchlist with:', { symbol: result.symbol, targetPrice, alertType });
      await api.addToWatchlist(result.symbol, targetPrice, alertType);
      console.log('Successfully added to watchlist, fetching updated watchlist');
      
      // Fetch the updated watchlist
      const watchlistData = await api.getWatchlist();
      console.log('New watchlist data:', watchlistData);
      
      // Convert YahooStockData to WatchlistItem
      const validWatchlistData = watchlistData.map(item => ({
        symbol: item.symbol,
        name: item.name || item.symbol,
        price: parseFloat(item.price) || 0,
        change: parseFloat(item.change) || 0,
        changePercent: parseFloat(item.changePercent) || 0,
        volume: parseFloat(item.volume) || 0,
        marketCap: parseFloat(item.marketCap) || 0,
        targetPrice: parseFloat(item.targetPrice) || parseFloat(item.price) * 1.1 || 0,
        alertType: item.alertType || 'above'
      }));
      
      // Update the local state with the new watchlist
      setStocks(validWatchlistData);
      
      // Clear the search
      setSearchResults([]);
      setSearchQuery('');
      
      // Show success message
      console.log('Successfully added', result.symbol, 'to watchlist');
    } catch (error) {
      console.error('Failed to add stock:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        // Show error message to user
        alert(`Failed to add stock: ${error.message}`);
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
            
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-slate-800 border border-cyan-500/20 rounded-lg shadow-lg z-50">
                {searchResults.map(result => (
                  <button
                    key={result.symbol}
                    onClick={() => addToWatchlist(result)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-700/50 text-white"
                  >
                    <div className="font-semibold">{result.symbol}</div>
                    <div className="text-sm text-gray-400">{result.name || 'N/A'}</div>
                    <div className="text-sm">
                      {result.price ? (
                        <span className={result.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          ${result.price.toFixed(2)} ({result.change >= 0 ? '+' : ''}{result.change?.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-gray-400">Price unavailable</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-6 h-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
                  </button>
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Your Watchlist</h2>
          {loading ? (
            <div className="text-white">Loading watchlist...</div>
          ) : stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stocks.map(stock => (
                <EnhancedStockCard
                  key={stock.symbol}
                  stock={stock}
                  onRemove={removeFromWatchlist}
                  api={api}
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-400">
              <div className="flex flex-col items-center space-y-4">
                <div className="text-gray-400">No matching stocks found</div>
                {searchQuery && (
                  <div className="text-sm text-gray-500">
                    Searching for: "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trending Stocks Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
              Trending Stocks
            </div>
          </h2>
          {loading ? (
            <div className="text-white">Loading trending stocks...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingStocks.map(stock => (
                <StockCard
                  key={stock.symbol}
                  stock={stock}
                  onAddToWatchlist={() => addToWatchlist(stock)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed inset-y-0 right-0 w-96 bg-slate-800 border-l border-cyan-500/20 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg ${
                      notification.read ? 'bg-slate-700/50' : 'bg-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-white">{notification.title}</div>
                    <div className="text-gray-400">{notification.message}</div>
                    <div className="text-sm text-gray-500 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400">No notifications</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 
