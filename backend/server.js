const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const yahooFinance = require('yahoo-finance2').default;
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

// Initialize Firebase Admin with your service account
const serviceAccount = {
  "type": "service_account",
  "project_id": "pulsetrader-3505c",
  "private_key_id": "5f75ad4c7dccc88f2353ca95ec83683e4d10b5bc",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpmZ6sHXhppQlf\nx2hxT+GIcqTNMefpn1+OIK613MbCOVgSRpZPYBvwGRJ5P9Tb9I6Xdn8PvVtjOlIZ\n0tbmrCOSBHfdaT64CAsni4M0HdTeNa3k/1hWDoPtRoAyuabCC5VLin5HroGWrHMJ\nqD70Yt+acdw1F91wWL1FT+IUA48KVAuFBJn1JgOnTVKg7d/ZmsUeoeL1hYfQnUg6\ngnmBBk2HBDk5DhO0dJKGUEwstXq4tfrtWr90tPFnTStrS2rclBEZFMBVxTDYKoyA\nKR6N03k36r14lctslJfdaCWt0gEQeo2BHIrAUiqzuoVVgtF7J96CT+lc3CPKQnyZ\nseq1j37BAgMBAAECggEAB8+6Ba5jzeXajS1Hi7SErD6vhX3vcwyyn3603U56Xxa6\nDjlvEd/Y2ZGmDqyYdrsIWESObKCplWPpxSO3Xy99geuvw6RlzZ8dOGiOFffrxoJN\nbJcwL+KCRArzu6JeYmCbMzwBPfb1JAX0VHUJ1UK6jsgAvvdG7TZBHXCk9owFahHK\nrSWNTsb4fKOwIL6ybRkOleKvANXixTfp6Wmxk9VAmzbILCK1Aofcesq2N/Px2VBW\n1WH7po8VVOb5ddP2ShIhhKQ5ws8jvKRTTyAukEim+EKGrp6ZJ2tFSIXyFzhHOesP\nyWnSb+1ftoB2bOdHi97wygAUBxG2/c9EWyDj2fY++QKBgQDddh2nzGQBE3ay9q1S\n3cgPrNHx8RwGnBQrOCoG20gWRrDnCc0X0xlskmmpr8C3/7d2+ywRIdG39odIiKY+\nHHz4WHNcD+mya+oLjEgTc6RYQ+PNiMMi9GibyaDcWmHpKsJBT+Eq/vbcPY4UFx0X\n0tLKw/exbb4Az99tRo3lrVf1jQKBgQDEDO6gCO4sgcJJ+EriENuDdCoE/QsEWwYc\n2rAOx++ffGxOrAUjTAQW7aav1O7XOYz7+epn4p8L0FQKQQuzV3DnPhYvDSuNB11i\nw6pIQOG3wOMGZjG/6wLrWD5O3fG7A2vola44TB9VbTYTEr686PV7eLoAoA3ONUQM\nMhYR75I/BQKBgQCIve/dthRhnbUDF9E5g3uOQjV34Fpfsmu5q/o3NZqzNn7wiVq7\nxTrDkTvw7HZgpmKP8tLo2Sr3Hh+2J7oOS+TWKzc/twujgYKIEtxGNndZkMHOHQ3w\nPV2CI+NRa/Vc1WwQi9QKile+8bsSqJrsJN7HGG2OfqZ9Nd1NSe0/zeKr2QKBgHNC\nryBDX9OmzhUy9sOF6aiVKQcZxdpfsW5RW+S0wzpeqkZud+7SiCz6t170rx615R9X\nROqin6MQbfhBWaGsrOIm7F/pPEuDovGn23rzOkEQE+j1OBZ/Eo5OqQMxFSc/0bdC\nGNVcW6ebt4jrIlxqEbjvt1savkMXqdQJtlQBJ1gJAoGAblbwJX9lNmwkeyQ7AuDH\nG5oQOYPoY9ULI/iGQeADD0JwdsQm5rQPZ3FMREZMq65+vb1mIRb6ox1TPDt8AMtu\nH7I9JBuTk4HzVlJdf2F8IUPLkFgpDXKB/PBIU1SPVqPSJ18ibfc5DU68MCRcWt4m\nCO1BWZ/m4uz14gO8jorIgqE=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@pulsetrader-3505c.iam.gserviceaccount.com",
  "client_id": "114454841593864974776",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pulsetrader-3505c.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Configure CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// In-memory user storage (replace with a database in production)
const users = new Map();
const watchlists = new Map();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ error: 'Invalid token' });
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

// Stock-related endpoints
app.get('/api/stocks/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log('Searching for:', query);
    const results = await yahooFinance.search(query, { newsCount: 0 });
    console.log('Search results:', results);

    if (!results || !results.quotes) {
      return res.status(404).json({ error: 'No results found' });
    }

    const stocks = await Promise.all(
      results.quotes
        .filter(quote => quote.quoteType === 'EQUITY')
        .slice(0, 5)
        .map(async (quote) => {
          try {
            console.log(`Fetching details for ${quote.symbol}`);
            const details = await yahooFinance.quote(quote.symbol);
            console.log(`Details for ${quote.symbol}:`, details);
            return {
              symbol: details.symbol || quote.symbol,
              name: details.longName || details.shortName || quote.shortName || quote.symbol,
              price: details.regularMarketPrice || 0,
              change: details.regularMarketChange || 0,
              changePercent: details.regularMarketChangePercent || 0,
              volume: details.regularMarketVolume || 0,
              marketCap: details.marketCap || 0
            };
          } catch (error) {
            console.error(`Error fetching details for ${quote.symbol}:`, error);
            return null;
          }
        })
    );

    const validStocks = stocks.filter(stock => stock !== null);
    console.log('Sending response:', validStocks);
    res.json(validStocks);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search stocks', details: error.message });
  }
});

app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`Fetching data for symbol: ${symbol}`);
    
    const quote = await yahooFinance.quote(symbol);
    console.log('Received quote data:', quote);
    
    if (!quote) {
      return res.status(404).json({ error: 'Stock data not found' });
    }

    const result = {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || symbol,
      price: quote.regularMarketPrice || quote.price || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap || 0,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      open: quote.regularMarketOpen || 0,
      previousClose: quote.regularMarketPreviousClose || 0
    };
    
    console.log('Sending response:', result);
    res.json(result);
  } catch (error) {
    console.error('Stock data error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.get('/api/stocks/trending/market', async (req, res) => {
  try {
    const trendingStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD'];
    console.log('Fetching trending stocks:', trendingStocks);
    
    const quotes = await Promise.all(
      trendingStocks.map(async (symbol) => {
        try {
          console.log(`Fetching data for ${symbol}...`);
          const quote = await yahooFinance.quote(symbol);
          console.log(`Received data for ${symbol}:`, quote);
          
          if (!quote) {
            console.error(`No data available for ${symbol}`);
            return null;
          }

          return {
            symbol: quote.symbol,
            name: quote.longName || quote.shortName || symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0
          };
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error);
          return null;
        }
      })
    );

    const validQuotes = quotes.filter(quote => quote !== null);
    console.log('Sending trending stocks:', validQuotes);
    res.json(validQuotes);
  } catch (error) {
    console.error('Error fetching trending stocks:', error);
    res.status(500).json({ error: 'Failed to fetch trending stocks' });
  }
});

// Watchlist endpoints
app.get('/api/watchlist', authenticateToken, async (req, res) => {
  try {
    const userWatchlist = watchlists.get(req.user.email) || [];
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
    const { symbol, targetPrice, alertType } = req.body;
    
    if (!symbol || targetPrice === undefined || !alertType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the stock exists and get current data
    try {
      const quote = await yahooFinance.quote(symbol);
      if (!quote || !quote.regularMarketPrice) {
        return res.status(404).json({ error: 'Stock not found' });
      }
    } catch (error) {
      console.error(`Error verifying stock ${symbol}:`, error);
      return res.status(404).json({ error: 'Stock not found' });
    }

    const userEmail = req.user.email;
    const userWatchlist = watchlists.get(userEmail) || [];
    
    if (userWatchlist.some(item => item.symbol === symbol)) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    userWatchlist.push({ 
      symbol, 
      targetPrice: Number(targetPrice), 
      alertType,
      addedAt: new Date().toISOString()
    });
    watchlists.set(userEmail, userWatchlist);
    
    console.log(`Added ${symbol} to watchlist for ${userEmail}`);
    res.status(201).json({ message: 'Added to watchlist' });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

app.delete('/api/watchlist/:symbol', authenticateToken, (req, res) => {
  try {
    const { symbol } = req.params;
    const userEmail = req.user.email;
    const userWatchlist = watchlists.get(userEmail) || [];
    
    const updatedWatchlist = userWatchlist.filter(item => item.symbol !== symbol);
    watchlists.set(userEmail, updatedWatchlist);
    
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 