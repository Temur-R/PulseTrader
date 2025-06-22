export interface Stock {
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
}

export interface WatchlistItem extends Stock {
  targetPrice: number;
  alertType: 'above' | 'below';
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface Notification {
  id: string;
  type: 'price_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  stockSymbol?: string;
}

export interface Analysis {
  recommendation: 'buy' | 'sell' | 'hold';
  targetPrice: number;
  summary: string;
  technicalIndicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    movingAverages: {
      sma20: number;
      sma50: number;
      sma200: number;
    };
  };
}

export interface WebSocketMessage {
  type: 'price_update' | 'notification';
  symbol?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  notification?: Notification;
} 