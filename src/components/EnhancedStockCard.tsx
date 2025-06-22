import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { WatchlistItem } from '../types';
import { StockPulseAPI } from '../services/api';

interface EnhancedStockCardProps {
  stock: WatchlistItem;
  onRemove: (symbol: string) => void;
  api: StockPulseAPI;
}

export const EnhancedStockCard: React.FC<EnhancedStockCardProps> = ({ stock, onRemove }) => {
  const isPositive = (stock.change || 0) >= 0;
  
  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined, decimals: number = 2): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    return value.toFixed(decimals);
  };

  // Helper function to format large numbers
  const formatLargeNumber = (value: number | undefined): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A';
    }
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const targetDistance = stock.price ? 
    ((stock.targetPrice - stock.price) / stock.price * 100) : 0;

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
          ${formatNumber(stock.price)}
        </div>
        <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="ml-1">{formatNumber(stock.changePercent)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm">Target Price</p>
          <p className="text-white font-semibold">${formatNumber(stock.targetPrice)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Distance</p>
          <p className={`font-semibold ${targetDistance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatNumber(targetDistance)}%
          </p>
        </div>
      </div>

      {stock.volume !== undefined && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Volume</p>
              <p className="text-white">{stock.volume.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Market Cap</p>
              <p className="text-white">{formatLargeNumber(stock.marketCap)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 