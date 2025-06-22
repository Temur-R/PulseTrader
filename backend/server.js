const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Google OAuth verification endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Verify the Google token
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const { email, given_name, family_name, sub: googleId } = response.data;

    // Check if user exists in your database, if not create a new user
    // For now, we'll just create a token with the Google user info
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

    res.json({ token });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ error: 'Invalid Google credentials' });
  }
});

// ... existing code ... 