import React, { useState } from 'react';
import { TrendingUp, TrendingDown, X, Brain } from 'lucide-react';
import { Stock, Analysis } from '../types';
import { StockPulseAPI } from '../services/api';

interface EnhancedStockCardProps {
  stock: Stock;
  onRemove: (symbol: string) => void;
  api: StockPulseAPI;
}

export const EnhancedStockCard: React.FC<EnhancedStockCardProps> = ({ stock, onRemove, api }) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const isPositive = stock.change >= 0;
  const targetDistance = stock.currentPrice ? 
    ((stock.targetPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2) : 0;

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await api.getStockAnalysis(stock.symbol);
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