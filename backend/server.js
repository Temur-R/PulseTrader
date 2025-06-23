const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const yahooFinance = require('yahoo-finance2').default;
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'your-project-id';

// File path for watchlist data
const WATCHLIST_FILE = path.join(__dirname, 'watchlist.json');

// Initialize or load watchlists from file
let watchlists = new Map();
try {
  if (fs.existsSync(WATCHLIST_FILE)) {
    const data = JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf8'));
    watchlists = new Map(Object.entries(data));
    console.log('Loaded watchlists from file:', watchlists);
  }
} catch (error) {
  console.error('Error loading watchlist file:', error);
}

// Function to save watchlists to file
const saveWatchlists = () => {
  try {
    const data = Object.fromEntries(watchlists);
    fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(data, null, 2));
    console.log('Saved watchlists to file');
  } catch (error) {
    console.error('Error saving watchlist file:', error);
  }
};

// In-memory user storage (replace with a database in production)
const users = new Map();

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  console.log('Authenticating request...');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token found:', !!token);
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Token verified successfully for user:', decodedToken.email);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Google OAuth verification endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const { email, given_name, family_name, sub: googleId } = response.data;

    // Check if user exists, if not create a new one
    if (!users.has(email)) {
      users.set(email, {
        email,
        firstName: given_name,
        lastName: family_name,
        googleId,
        isGoogleUser: true
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email,
        firstName: given_name,
        lastName: family_name,
        googleId
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        email,
        firstName: given_name,
        lastName: family_name
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ error: 'Invalid Google credentials' });
  }
});

// Firebase token exchange endpoint
app.post('/api/auth/firebase', async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    
    if (!firebaseToken) {
      return res.status(400).json({ error: 'Firebase token is required' });
    }

    // Decode the token first to get basic info
    const decodedToken = jwt.decode(firebaseToken);
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ error: 'Invalid Firebase token format' });
    }

    const { email } = decodedToken;
    
    // Create or update user in our system
    if (!users.has(email)) {
      users.set(email, {
        email,
        firstName: decodedToken.name?.split(' ')[0] || 'User',
        lastName: decodedToken.name?.split(' ').slice(1).join(' ') || '',
        firebaseUid: decodedToken.sub,
        isFirebaseUser: true
      });
    }

    // Generate our own JWT token
    const token = jwt.sign(
      { 
        email,
        firebaseUid: decodedToken.sub,
        firstName: users.get(email).firstName,
        lastName: users.get(email).lastName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        email,
        firstName: users.get(email).firstName,
        lastName: users.get(email).lastName
      }
    });
  } catch (error) {
    console.error('Firebase token exchange error:', error);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

// Regular email/password registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (users.has(email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Store user
    users.set(email, {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isGoogleUser: false
    });

    // Generate token
    const token = jwt.sign(
      { email, firstName, lastName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { email, firstName, lastName }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Regular email/password login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isGoogleUser) {
      return res.status(400).json({ error: 'Please use Google Sign-In for this account' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email, firstName: user.firstName, lastName: user.lastName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected route example
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isGoogleUser: user.isGoogleUser
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next(err);
});

// Configure Yahoo Finance options
const yahooOptions = {
  queue: {
    concurrent: 5, // Number of concurrent requests
    interval: 1000, // Delay between requests in ms
    timeout: 10000 // Request timeout in ms
  }
};

// Initialize Yahoo Finance with options
let yahooClient;
try {
  yahooClient = yahooFinance;
  console.log('Yahoo Finance client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Yahoo Finance client:', error);
}

// Stock-related endpoints
app.get('/api/stocks/search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    console.log('Searching for stocks with query:', query);

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    if (!yahooClient) {
      console.error('Yahoo Finance client not initialized');
      return res.status(500).json({ error: 'Stock service unavailable' });
    }

    console.log('Making Yahoo Finance search request...');
    const results = await yahooClient.search(query, yahooOptions);
    console.log('Search results:', results);

    if (!results || !results.quotes) {
      console.warn('No results found for query:', query);
      return res.json([]);
    }

    const quotes = await Promise.all(
      results.quotes
        .filter(quote => quote.quoteType === 'EQUITY')
        .slice(0, 5)
        .map(async quote => {
          try {
            console.log('Fetching details for symbol:', quote.symbol);
            const detail = await yahooClient.quote(quote.symbol, yahooOptions);
            console.log('Details received for symbol:', quote.symbol, detail);
            
            return {
              symbol: detail.symbol,
              name: detail.longName || detail.shortName,
              price: detail.regularMarketPrice,
              change: detail.regularMarketChange,
              changePercent: detail.regularMarketChangePercent,
              volume: detail.regularMarketVolume,
              marketCap: detail.marketCap
            };
          } catch (error) {
            console.error(`Error fetching details for ${quote.symbol}:`, error);
            return null;
          }
        })
    );

    const validQuotes = quotes.filter(q => q !== null);
    console.log('Sending response with valid quotes:', validQuotes);
    res.json(validQuotes);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
});

app.get('/api/stocks/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log('Fetching stock details for symbol:', symbol);

    if (!yahooClient) {
      console.error('Yahoo Finance client not initialized');
      return res.status(500).json({ error: 'Stock service unavailable' });
    }

    const quote = await yahooClient.quote(symbol, yahooOptions);
    console.log('Received quote data:', quote);
    
    if (!quote) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const response = {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Stock data error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data: ' + error.message });
  }
});

app.get('/api/stocks/trending/market', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching trending stocks');
    const trendingSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD'];
    
    if (!yahooClient) {
      console.error('Yahoo Finance client not initialized');
      return res.status(500).json({ error: 'Stock service unavailable' });
    }

    const trendingData = await Promise.all(
      trendingSymbols.map(async symbol => {
        try {
          console.log(`Fetching data for trending stock: ${symbol}`);
          const quote = await yahooClient.quote(symbol, yahooOptions);
          console.log(`Received data for ${symbol}:`, quote);
          
          return {
            symbol: quote.symbol,
            name: quote.longName || quote.shortName,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            marketCap: quote.marketCap
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return null;
        }
      })
    );

    const validTrendingData = trendingData.filter(stock => stock !== null);
    console.log('Sending trending stocks:', validTrendingData);
    res.json(validTrendingData);
  } catch (error) {
    console.error('Trending stocks error:', error);
    res.status(500).json({ error: 'Failed to fetch trending stocks: ' + error.message });
  }
});

// Watchlist endpoints
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    console.log('GET /api/watchlist - User:', req.user.email);
    
    // Get user's watchlist from Firestore
    const watchlistRef = db.collection('watchlists');
    const snapshot = await watchlistRef.where('userId', '==', req.user.uid).get();
    
    const userWatchlist = snapshot.docs.map(doc => doc.data());
    console.log(`Fetching watchlist for user ${req.user.email}:`, userWatchlist);
    
    const watchlistData = await Promise.all(
      userWatchlist.map(async (item) => {
        try {
          console.log(`Fetching data for ${item.symbol}...`);
          const quote = await yahooFinance.quote(item.symbol);
          console.log(`Received data for ${item.symbol}:`, quote);
          
          if (!quote) {
            console.error(`No data available for ${item.symbol}`);
            return null;
          }

          return {
            symbol: quote.symbol || item.symbol,
            name: quote.longName || quote.shortName || item.symbol,
            price: quote.regularMarketPrice || quote.price || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            targetPrice: item.targetPrice,
            alertType: item.alertType
          };
        } catch (error) {
          console.error(`Error fetching ${item.symbol}:`, error);
          return null;
        }
      })
    );
    
    const validWatchlistData = watchlistData.filter(item => item !== null);
    console.log('Sending watchlist data:', validWatchlistData);
    res.json(validWatchlistData);
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

app.post('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    console.log('POST /api/watchlist - User:', req.user.email);
    console.log('Request body:', req.body);
    
    const { symbol, targetPrice, alertType } = req.body;
    
    if (!symbol || targetPrice === undefined || !alertType) {
      console.error('Missing required fields:', { symbol, targetPrice, alertType });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the stock exists and get current data
    try {
      console.log(`Verifying stock ${symbol}...`);
      const quote = await yahooFinance.quote(symbol);
      console.log(`Stock verification result:`, quote);
      
      if (!quote || !quote.regularMarketPrice) {
        console.error(`Stock not found: ${symbol}`);
        return res.status(404).json({ error: 'Stock not found' });
      }

      // Check if stock already exists in watchlist
      const watchlistRef = db.collection('watchlists');
      const docRef = watchlistRef.doc(`${req.user.uid}_${symbol}`);
      const doc = await docRef.get();

      if (doc.exists) {
        console.log(`Stock ${symbol} already in watchlist for user ${req.user.email}`);
        return res.status(400).json({ error: 'Stock already in watchlist' });
      }

      // Add to Firestore
      await docRef.set({
        userId: req.user.uid,
        symbol,
        targetPrice: Number(targetPrice),
        alertType,
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
        name: quote.longName || quote.shortName || symbol,
        price: quote.regularMarketPrice || quote.price || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0
      });
      
      console.log(`Added ${symbol} to watchlist for ${req.user.email}`);
      res.status(201).json({ message: 'Added to watchlist' });
    } catch (error) {
      console.error(`Error verifying stock ${symbol}:`, error);
      return res.status(404).json({ error: 'Stock not found' });
    }
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`DELETE /api/watchlist/${symbol} - User:`, req.user.email);

    // Delete from Firestore
    const docRef = db.collection('watchlists').doc(`${req.user.uid}_${symbol}`);
    await docRef.delete();
    
    console.log(`Removed ${symbol} from watchlist for ${req.user.email}`);
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 