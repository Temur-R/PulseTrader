const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Mock data
const users = new Map();
const stocks = new Map([
  ['AAPL', { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 172.50, change: 1.2 }],
  ['GOOGL', { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 141.80, change: -0.8 }],
  ['MSFT', { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 415.20, change: 2.1 }],
  ['AMZN', { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 175.35, change: 0.5 }],
  ['TSLA', { symbol: 'TSLA', name: 'Tesla, Inc.', currentPrice: 202.64, change: -1.5 }],
]);

const watchlists = new Map();
const notifications = new Map();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (users.has(email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  users.set(email, { email, password, name });
  const token = jwt.sign({ email }, JWT_SECRET);
  
  res.json({ token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email }, JWT_SECRET);
  res.json({ token });
});

// Stock routes
const axios = require('axios');

app.get('/api/stocks/search', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v6/finance/quote`, {
      params: {
        symbols: req.query.q,
        lang: 'en-US',
        region: 'US'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://finance.yahoo.com'
      }
    });
    
    const results = response.data.quoteResponse.result
      .filter(q => q.quoteType === 'EQUITY')
      .map(q => ({
        symbol: q.symbol,
        name: q.longName || q.shortName,
        price: q.regularMarketPrice,
        change: q.regularMarketChange
      }));
      
    res.json(results);
  } catch (error) {
    console.error('Yahoo Finance API error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.get('/api/stocks/:symbol', authenticateToken, (req, res) => {
  const stock = stocks.get(req.params.symbol);
  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }
  res.json(stock);
});

app.get('/api/stocks/:symbol/analysis', authenticateToken, (req, res) => {
  const stock = stocks.get(req.params.symbol);
  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }

  // Mock analysis
  const sentiment = stock.change >= 0 ? 'bullish' : 'bearish';
  res.json({
    analysis: {
      summary: `${stock.name} shows ${sentiment} trends with ${Math.abs(stock.change)}% movement.`,
      sentiment,
      confidence: 75 + Math.random() * 20
    }
  });
});

// Watchlist routes
app.get('/api/watchlist', authenticateToken, (req, res) => {
  const userWatchlist = watchlists.get(req.user.email) || [];
  const watchlistWithData = userWatchlist.map(symbol => ({
    ...stocks.get(symbol),
    targetPrice: 0 // Add target price from user preferences if needed
  }));
  res.json(watchlistWithData);
});

app.post('/api/watchlist', authenticateToken, (req, res) => {
  const { symbol, targetPrice } = req.body;
  if (!stocks.has(symbol)) {
    return res.status(404).json({ error: 'Stock not found' });
  }

  const userWatchlist = watchlists.get(req.user.email) || [];
  if (!userWatchlist.includes(symbol)) {
    userWatchlist.push(symbol);
    watchlists.set(req.user.email, userWatchlist);
  }

  res.json({ success: true });
});

app.delete('/api/watchlist/:symbol', authenticateToken, (req, res) => {
  const userWatchlist = watchlists.get(req.user.email) || [];
  const index = userWatchlist.indexOf(req.params.symbol);
  
  if (index !== -1) {
    userWatchlist.splice(index, 1);
    watchlists.set(req.user.email, userWatchlist);
  }

  res.json({ success: true });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.on('error', console.error);
  console.log('Client connected');

  // Send periodic updates
  const interval = setInterval(() => {
    stocks.forEach(stock => {
      // Random price movement
      const change = (Math.random() - 0.5) * 2;
      stock.currentPrice *= (1 + change / 100);
      stock.change = change;

      ws.send(JSON.stringify({
        type: 'price_update',
        symbol: stock.symbol,
        price: stock.currentPrice,
        change: stock.change
      }));
    });
  }, 5000);

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
