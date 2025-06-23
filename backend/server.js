const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const yahooFinance = require('yahoo-finance2').default;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'your-project-id';

// In-memory user storage (replace with a database in production)
const users = new Map();
const watchlists = new Map();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  console.log('Authenticating request...');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token found:', !!token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('Token verified successfully for user:', user.email);
    req.user = user;
    next();
  });
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
            const details = await yahooFinance.quote(quote.symbol);
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
    res.json(validStocks);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
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
    console.log('GET /api/watchlist - User:', req.user.email);
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
    } catch (error) {
      console.error(`Error verifying stock ${symbol}:`, error);
      return res.status(404).json({ error: 'Stock not found' });
    }

    const userEmail = req.user.email;
    const userWatchlist = watchlists.get(userEmail) || [];
    
    if (userWatchlist.some(item => item.symbol === symbol)) {
      console.log(`Stock ${symbol} already in watchlist for user ${userEmail}`);
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    const newWatchlistItem = { 
      symbol, 
      targetPrice: Number(targetPrice), 
      alertType,
      addedAt: new Date().toISOString()
    };
    
    userWatchlist.push(newWatchlistItem);
    watchlists.set(userEmail, userWatchlist);
    
    console.log(`Added ${symbol} to watchlist for ${userEmail}:`, newWatchlistItem);
    console.log('Updated watchlist:', watchlists.get(userEmail));
    
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