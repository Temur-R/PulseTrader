export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  change: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

export interface Analysis {
  summary: string;
  sentiment: 'bullish' | 'bearish';
  confidence: number;
}

export interface WebSocketMessage {
  type: 'price_update' | 'notification';
  symbol?: string;
  price?: number;
  change?: number;
  notification?: Notification;
} 