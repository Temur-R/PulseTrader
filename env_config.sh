# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/stockpulse

# JWT Secret
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Alpha Vantage API (Free stock data API)
# Get your free API key at: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

# OpenAI API Key for ChatGPT integration
# Get your API key at: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key

# Email Configuration (for notifications)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password

# Optional: Alternative stock data APIs
# FINNHUB_API_KEY=your-finnhub-api-key
# IEX_CLOUD_API_KEY=your-iex-cloud-api-key

# Redis (optional, for advanced caching)
# REDIS_URL=redis://localhost:6379

# Security
BCRYPT_ROUNDS=10
SESSION_SECRET=your-session-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100