import yfinance as yf
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/search')
def search_stocks():
    query = request.args.get('q', '').upper()
    # Add CORS headers
    response = jsonify({'error': 'No results found'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    try:
        results = []
        tickers = yf.Tickers(query)
        
        for ticker in tickers.tickers.values():
            info = ticker.info
            results.append({
                'symbol': info.get('symbol', ''),
                'name': info.get('longName', info.get('shortName', '')),
                'price': info.get('currentPrice', info.get('regularMarketPrice', 0)),
                'change': info.get('regularMarketChange', 0),
                'exchange': info.get('exchange', '')
            })
            
        return jsonify([r for r in results if r['symbol']])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
