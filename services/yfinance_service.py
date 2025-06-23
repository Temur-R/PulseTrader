import yfinance as yf
import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/search')
def search_stocks():
    query = request.args.get('q', '').upper()
    response = jsonify({'error': 'No results found'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    
    try:
        # First search for matching symbols
        search_url = f'https://query2.finance.yahoo.com/v1/finance/search?q={query}&lang=en-US&region=US&quotesCount=10'
        search_response = requests.get(search_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'application/json'
        }, timeout=10)
        
        search_data = search_response.json()
        symbols = [result['symbol'] for result in search_data.get('quotes', []) 
                  if result['quoteType'] == 'EQUITY' and '.' not in result['symbol']]
        
        # Get detailed info for found symbols
        results = []
        for symbol in symbols[:10]:  # Limit to top 10 results
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                price_data = ticker.history(period='1d')
                
                if not price_data.empty:
                    results.append({
                        'symbol': symbol,
                        'name': info.get('longName', info.get('shortName', symbol)),
                        'price': round(info.get('currentPrice', price_data['Close'].iloc[-1]), 2),
                        'change': round(info.get('regularMarketChange', price_data['Close'].iloc[-1] - price_data['Open'].iloc[-1]), 2),
                        'exchange': info.get('exchange', 'N/A')
                    })
            except Exception as e:
                print(f"Error fetching data for {symbol}: {str(e)}")
                continue

        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
