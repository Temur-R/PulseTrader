const express = require('express');
const cors = require('cors');
const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Optionally, specify projectId or other config if needed
  });
}

const firestore = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Firestore User Helper Functions ---
const USERS_COLLECTION = 'users';

async function getUserById(userId) {
  const userDoc = await firestore.collection(USERS_COLLECTION).doc(userId).get();
  return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
}

async function getUserByEmail(email) {
  const snapshot = await firestore.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function updateUser(userId, data) {
  await firestore.collection(USERS_COLLECTION).doc(userId).update(data);
}

async function createUser(userData) {
  const userRef = await firestore.collection(USERS_COLLECTION).add(userData);
  const userDoc = await userRef.get();
  return { id: userDoc.id, ...userDoc.data() };
}

// Stock data cache
const stockCache = new Map();
const CACHE_DURATION = 60000; // 1 minute

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

// Email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Stock data service using Finnhub API
class StockDataService {
  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY;
    this.baseUrl = 'https://finnhub.io/api/v1';
  }

  async getStockPrice(symbol) {
    try {
      // Check cache first
      const cacheKey = `${symbol}-price`;
      const cached = stockCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      // Finnhub quote endpoint
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol: symbol,
          token: this.apiKey
        }
      });

      const quote = response.data;
      if (!quote || quote.c === 0) {
        throw new Error('Stock not found');
      }

      const stockData = {
        symbol: symbol.toUpperCase(),
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        volume: quote.v,
        lastUpdate: new Date()
      };

      // Cache the result
      stockCache.set(cacheKey, {
        data: stockData,
        timestamp: Date.now()
      });

      return stockData;
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getStockNews(symbol) {
    try {
      // Finnhub company-news endpoint (last 7 days)
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const to = new Date().toISOString().slice(0, 10);
      const response = await axios.get(`${this.baseUrl}/company-news`, {
        params: {
          symbol: symbol,
          from,
          to,
          token: this.apiKey
        }
      });
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error.message);
      return [];
    }
  }

  async searchStock(query) {
    try {
      // Finnhub symbol-search endpoint
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          token: this.apiKey
        }
      });
      // Return matches in a similar format as before
      return (response.data.result || []).map(match => ({
        symbol: match.symbol,
        name: match.description,
        type: match.type,
        region: match.region || '',
        currency: match.currency || ''
      }));
    } catch (error) {
      console.error(`Error searching stocks:`, error.message);
      return [];
    }
  }
}

// ChatGPT Integration Service
class AIAnalysisService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
  }

  async analyzeStock(stockData, newsData = []) {
    try {
      const prompt = `Analyze the following stock data and provide insights:

Stock: ${stockData.symbol}
Current Price: $${stockData.price}
Change: ${stockData.change} (${stockData.changePercent}%)
Volume: ${stockData.volume}

Recent News Headlines:
${newsData.slice(0, 3).map(news => `- ${news.title}`).join('\n')}

Please provide:
1. Brief market sentiment analysis
2. Key factors affecting the stock
3. Short-term outlook (1-2 sentences)
4. Risk assessment (Low/Medium/High)

Keep the response concise and professional.`;

      const response = await axios.post(this.baseUrl, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial analyst providing concise stock market insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting AI analysis:', error.message);
      return 'AI analysis temporarily unavailable. Please check back later.';
    }
  }
}

// --- Refactored NotificationService for Firestore ---
class NotificationService {
  static async sendEmail(to, subject, html) {
    try {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error.message);
    }
  }

  static async createNotification(userId, message, type = 'info') {
    try {
      const user = await getUserById(userId);
      if (!user) return;
      const notification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
      };
      const notifications = [notification, ...(user.notifications || [])];
      if (notifications.length > 50) notifications.splice(50);
      await updateUser(userId, { notifications });
      this.broadcastToUser(userId, {
        type: 'notification',
        data: notification
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error.message);
    }
  }

  static broadcastToUser(userId, data) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.userId === userId) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

// Initialize services
const stockService = new StockDataService();
const aiService = new AIAnalysisService();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock routes
app.get('/api/stocks/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await stockService.searchStock(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await stockService.getStockPrice(symbol);
    const newsData = await stockService.getStockNews(symbol);
    const aiAnalysis = await aiService.analyzeStock(stockData, newsData);

    res.json({
      stock: stockData,
      news: newsData,
      analysis: aiAnalysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stocks/:symbol/price', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await stockService.getStockPrice(symbol);
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Watchlist routes
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const watchlist = user.watchlist || [];
    const watchlistWithPrices = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const stockData = await stockService.getStockPrice(item.symbol);
          return {
            ...item,
            currentPrice: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            lastUpdate: stockData.lastUpdate
          };
        } catch (error) {
          return {
            ...item,
            currentPrice: 0,
            change: 0,
            changePercent: 0,
            error: 'Price unavailable'
          };
        }
      })
    );
    res.json(watchlistWithPrices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const { symbol, targetPrice, alertType = 'above' } = req.body;
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const watchlist = user.watchlist || [];
    const existingItem = watchlist.find(item => item.symbol === symbol.toUpperCase());
    if (existingItem) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }
    try {
      const stockData = await stockService.getStockPrice(symbol);
      const newItem = {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Corp.`,
        targetPrice: parseFloat(targetPrice),
        alertType,
        isActive: true,
        addedAt: new Date().toISOString()
      };
      watchlist.push(newItem);
      await updateUser(user.id, { watchlist });
      await NotificationService.createNotification(user.id, `Added ${symbol.toUpperCase()} to watchlist with target price $${targetPrice}`, 'positive');
      res.status(201).json({ message: 'Stock added to watchlist', stock: stockData });
    } catch (error) {
      res.status(400).json({ error: 'Invalid stock symbol' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const watchlist = (user.watchlist || []).filter(item => item.symbol !== symbol.toUpperCase());
    await updateUser(user.id, { watchlist });
    await NotificationService.createNotification(user.id, `Removed ${symbol.toUpperCase()} from watchlist`, 'warning');
    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.notifications || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const notifications = (user.notifications || []).map(notif => notif.id === id ? { ...notif, read: true } : notif);
    await updateUser(user.id, { notifications });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const notifications = (user.notifications || []).filter(notif => notif.id !== id);
    await updateUser(user.id, { notifications });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Price alert checker (runs every minute)
cron.schedule('* * * * *', async () => {
  try {
    const usersSnapshot = await firestore.collection(USERS_COLLECTION).where('watchlist', '!=', null).get();
    for (const userDoc of usersSnapshot.docs) {
      const user = { id: userDoc.id, ...userDoc.data() };
      const watchlist = user.watchlist || [];
      for (const watchItem of watchlist) {
        if (!watchItem.isActive) continue;
        try {
          const stockData = await stockService.getStockPrice(watchItem.symbol);
          const currentPrice = stockData.price;
          const targetPrice = watchItem.targetPrice;
          let shouldAlert = false;
          let alertMessage = '';
          if (watchItem.alertType === 'above' && currentPrice >= targetPrice) {
            shouldAlert = true;
            alertMessage = `${watchItem.symbol} reached $${currentPrice.toFixed(2)} (target: $${targetPrice.toFixed(2)})`;
          } else if (watchItem.alertType === 'below' && currentPrice <= targetPrice) {
            shouldAlert = true;
            alertMessage = `${watchItem.symbol} dropped to $${currentPrice.toFixed(2)} (target: $${targetPrice.toFixed(2)})`;
          }
          if (shouldAlert) {
            await NotificationService.createNotification(
              user.id,
              alertMessage,
              currentPrice >= targetPrice ? 'positive' : 'warning'
            );
            if (user.settings && user.settings.emailNotifications) {
              await NotificationService.sendEmail(
                user.email,
                `StockPulse Alert: ${watchItem.symbol}`,
                `
                <h2>Price Alert Triggered</h2>
                <p>${alertMessage}</p>
                <p>Current change: ${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)</p>
                <p>Check your StockPulse dashboard for more details.</p>
                `
              );
            }
          }
        } catch (error) {
          console.error(`Error checking alerts for ${watchItem.symbol}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in price alert checker:', error.message);
  }
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'auth' && data.token) {
        jwt.verify(data.token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
          if (!err) {
            ws.userId = user.userId;
            ws.send(JSON.stringify({ type: 'auth', status: 'success' }));
          }
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error.message);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`StockPulse backend server running on port ${PORT}`);
  console.log(`WebSocket server running on port 8080`);
});