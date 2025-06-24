import React, { useState } from 'react';
import { Bell, Plus, TrendingUp, TrendingDown, X, Settings } from 'lucide-react';

// Header Component
const Header = ({ notificationCount }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-cyan-500/20">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Stock Notifier</h1>
              <p className="text-cyan-300 text-sm">Real-time market alerts</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-cyan-400" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>
            <Settings className="w-6 h-6 text-gray-400 hover:text-cyan-400 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Stock Form Component
const AddStockForm = ({ isVisible, newStock, onStockChange, onAdd, onCancel }) => {
  if (!isVisible) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-medium text-white mb-4">Add New Stock</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Stock Symbol (e.g., AAPL)"
          value={newStock.symbol}
          onChange={(e) => onStockChange({...newStock, symbol: e.target.value})}
          className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
        />
        <input
          type="number"
          placeholder="Target Price"
          value={newStock.target}
          onChange={(e) => onStockChange({...newStock, target: e.target.value})}
          className="bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-500"
        />
      </div>
      <div className="flex space-x-3 mt-4">
        <button
          onClick={onAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Stock
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Individual Stock Card Component
const StockCard = ({ stock, onRemove }) => {
  const isPositive = stock.change >= 0;
  const targetDistance = ((stock.target - stock.price) / stock.price * 100).toFixed(1);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-white">{stock.symbol}</h3>
            <span className="text-gray-400">{stock.name}</span>
            <button
              onClick={() => onRemove(stock.symbol)}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-white">${stock.price.toFixed(2)}</span>
            <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>${Math.abs(stock.change).toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">Target</div>
          <div className="text-lg font-semibold text-cyan-400">${stock.target.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            {targetDistance}% to target
          </div>
        </div>
      </div>
    </div>
  );
};

// Watchlist Section Component
const WatchlistSection = ({ watchlist, showAddForm, onToggleAddForm, newStock, onStockChange, onAddStock, onRemoveStock, onCancelAdd }) => {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Your Watchlist</h2>
        <button
          onClick={onToggleAddForm}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock</span>
        </button>
      </div>

      <AddStockForm
        isVisible={showAddForm}
        newStock={newStock}
        onStockChange={onStockChange}
        onAdd={onAddStock}
        onCancel={onCancelAdd}
      />

      <div className="space-y-4">
        {watchlist.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onRemove={onRemoveStock}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Notification Component
const NotificationCard = ({ notification, onDismiss }) => {
  const getBgColor = (type) => {
    switch (type) {
      case 'positive': return 'bg-green-400';
      case 'warning': return 'bg-yellow-400';
      default: return 'bg-red-400';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-2 h-2 rounded-full mb-2 ${getBgColor(notification.type)}`}></div>
          <p className="text-white text-sm mb-2">{notification.message}</p>
          <p className="text-gray-400 text-xs">{notification.time}</p>
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Portfolio Summary Component
const PortfolioSummary = ({ watchlistCount, notificationCount }) => {
  return (
    <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Portfolio Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Watching</span>
          <span className="text-white font-semibold">{watchlistCount} stocks</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Active Alerts</span>
          <span className="text-cyan-400 font-semibold">{notificationCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Avg. Performance</span>
          <span className="text-green-400 font-semibold">+1.54%</span>
        </div>
      </div>
    </div>
  );
};

// Notifications Sidebar Component
const NotificationsSidebar = ({ notifications, onDismissNotification, watchlistCount }) => {
  return (
    <div className="lg:col-span-1">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Alerts</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onDismiss={onDismissNotification}
          />
        ))}
      </div>
      
      <PortfolioSummary 
        watchlistCount={watchlistCount}
        notificationCount={notifications.length}
      />
    </div>
  );
};

// Main App Component
export default function StockNotifier() {
  const [watchlist, setWatchlist] = useState([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.25, change: 2.45, changePercent: 1.34, target: 190.00 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.50, change: -12.30, changePercent: -0.43, target: 2900.00 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.75, change: 8.90, changePercent: 3.71, target: 260.00 },
  ]);
  
  const [newStock, setNewStock] = useState({ symbol: '', target: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'AAPL reached $185.25 (+1.34%)', time: '2 min ago', type: 'positive' },
    { id: 2, message: 'TSLA alert: Price target approaching', time: '5 min ago', type: 'warning' },
  ]);

  const handleAddStock = () => {
    if (newStock.symbol && newStock.target) {
      setWatchlist([...watchlist, {
        symbol: newStock.symbol.toUpperCase(),
        name: `${newStock.symbol.toUpperCase()} Corp.`,
        price: 0.00,
        change: 0.00,
        changePercent: 0.00,
        target: parseFloat(newStock.target)
      }]);
      setNewStock({ symbol: '', target: '' });
      setShowAddForm(false);
    }
  };

  const handleRemoveStock = (symbol) => {
    setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
  };

  const handleDismissNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleToggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewStock({ symbol: '', target: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Header notificationCount={notifications.length} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <WatchlistSection
            watchlist={watchlist}
            showAddForm={showAddForm}
            onToggleAddForm={handleToggleAddForm}
            newStock={newStock}
            onStockChange={setNewStock}
            onAddStock={handleAddStock}
            onRemoveStock={handleRemoveStock}
            onCancelAdd={handleCancelAdd}
          />
          
          <NotificationsSidebar
            notifications={notifications}
            onDismissNotification={handleDismissNotification}
            watchlistCount={watchlist.length}
          />
        </div>
      </div>
    </div>
  );
}