import eventlet
eventlet.monkey_patch()
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import logging
import asyncio
import threading
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

from services.data_fetcher import data_fetcher_service
from services.mempool_monitor import mempool_monitor_service
from services.trading_service import trading_service
from services.wallet_service import wallet_service
from services.ai_analysis import AIAnalysisService, ai_analysis_service
from services.auto_trader import auto_trader_service

# Import Blueprints
from routes.tokens import tokens_bp
from routes.ai import ai_bp
from routes.scanner import scanner_bp
from routes.mempool import mempool_bp
from routes.trading import trading_bp
from routes.wallet import wallet_bp
from routes.auto_trader import auto_trader_bp
from routes.analytics import analytics_bp
from utils.responses import error_response
from utils.db import init_db

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Service definitions will be updated in __main__
app.services = {}

# Register Blueprints
app.register_blueprint(tokens_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(scanner_bp)
app.register_blueprint(mempool_bp)
app.register_blueprint(trading_bp)
app.register_blueprint(wallet_bp)
app.register_blueprint(auto_trader_bp)
app.register_blueprint(analytics_bp)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'SolSniperX Backend v3.0.0 (Grand Consolidation)',
        'features': ['Token Scanner', 'AI Analysis', 'Trading Signals', 'Local Storage', 'RugCheck API', 'JITO Support', 'Dynamic JITO Tip', 'Consolidated Production Ready']
    })

@app.errorhandler(404)
def not_found(error):
    return error_response('Endpoint not found', 404)

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return error_response('Internal server error', 500)

# Global background loop
background_loop = None

def start_async_loop():
    """
    Starts an asyncio event loop in a background thread for monitoring and auto-trading.
    """
    global background_loop
    background_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(background_loop)

    # Inform services about the background loop
    auto_trader_service.set_loop(background_loop)

    # Schedule background tasks
    # Access properties to initialize them within the loop context
    _ = data_fetcher_service.http_client
    _ = ai_analysis_service.http_client
    _ = trading_service.solana_client
    _ = trading_service.http_client
    _ = wallet_service.solana_client
    _ = wallet_service.http_client

    background_loop.create_task(mempool_monitor_service.start_monitoring())

    # Start limit order checker
    async def limit_order_loop():
        while True:
            try:
                await trading_service.check_and_execute_limit_orders()
            except Exception as e:
                logger.error(f"Error in limit order loop: {e}")
            await asyncio.sleep(30) # Check every 30 seconds

    background_loop.create_task(limit_order_loop())

    logger.info("Background asyncio loop started.")
    background_loop.run_forever()

if __name__ == '__main__':
    # Initialize database early
    init_db()

    # Service Initialization with socketio
    wallet_service.socketio = socketio
    wallet_service.data_fetcher_service = data_fetcher_service

    trading_service.socketio = socketio
    trading_service.data_fetcher_service = data_fetcher_service

    mempool_monitor_service.socketio = socketio
    mempool_monitor_service.data_fetcher_service = data_fetcher_service

    data_fetcher_service.socketio = socketio

    ai_analysis_service.socketio = socketio
    ai_analysis_service.data_fetcher_service = data_fetcher_service

    auto_trader_service.socketio = socketio
    auto_trader_service.data_fetcher_service = data_fetcher_service
    auto_trader_service.ai_analysis_service = ai_analysis_service
    auto_trader_service.trading_service = trading_service
    auto_trader_service.wallet_service = wallet_service
    auto_trader_service.post_init()

    # Setup callbacks for autonomous action
    mempool_monitor_service.on_new_token(auto_trader_service.handle_new_token)
    mempool_monitor_service.on_rugpull(auto_trader_service.handle_rugpull_alert)

    # Update app.services
    app.services.update({
        "wallet": wallet_service,
        "trading": trading_service,
        "mempool": mempool_monitor_service,
        "data_fetcher": data_fetcher_service,
        "ai_analysis": ai_analysis_service,
        "auto_trader": auto_trader_service
    })

    # Start background asyncio services in a dedicated thread
    bg_thread = threading.Thread(target=start_async_loop, daemon=True)
    bg_thread.start()

    # Run the Flask-SocketIO app
    logger.info("Starting Flask-SocketIO server on port 5000...")
    socketio.run(app, host='0.0.0.0', port=5000)
