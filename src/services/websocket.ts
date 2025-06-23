import { WebSocketMessage } from '../types';

export class PulseTraderWebSocket {
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
        const data = JSON.parse(event.data) as WebSocketMessage;
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