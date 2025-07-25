from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import logging
from datetime import datetime
from services.data_fetcher import DataFetcherService
from services.mempool_monitor import MempoolMonitorService
from services.trading_service import TradingService
from services.wallet_service import WalletService
from services.ai_analysis import AIAnalysisService
from services.auto_trader import AutoTraderService

# Import Blueprints
from routes.tokens import tokens_bp
from routes.ai import ai_bp
from routes.scanner import scanner_bp
from routes.mempool import mempool_bp
from routes.trading import trading_bp
from routes.wallet import wallet_bp
from routes.auto_trader import auto_trader_bp
from utils.responses import error_response

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Service Instantiation
wallet_service = WalletService(socketio=socketio)
trading_service = TradingService(socketio=socketio)
mempool_monitor_service = MempoolMonitorService(socketio=socketio)
data_fetcher_service = DataFetcherService(socketio=socketio)
ai_analysis_service = AIAnalysisService(socketio=socketio)
auto_trader_service = AutoTraderService(
    socketio=socketio,
    data_fetcher_service=data_fetcher_service,
    ai_analysis_service=ai_analysis_service,
    trading_service=trading_service,
    wallet_service=wallet_service
)

# Add services to the app context for easier access in blueprints if needed later
app.services = {
    "wallet": wallet_service,
    "trading": trading_service,
    "mempool": mempool_monitor_service,
    "data_fetcher": data_fetcher_service,
    "ai_analysis": ai_analysis_service,
    "auto_trader": auto_trader_service
}

# Register Blueprints
app.register_blueprint(tokens_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(scanner_bp)
app.register_blueprint(mempool_bp)
app.register_blueprint(trading_bp)
app.register_blueprint(wallet_bp)
app.register_blueprint(auto_trader_bp)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'SolSniperX Backend v2.0',
        'features': ['Token Scanner', 'AI Analysis', 'Trading Signals', 'Local Storage']
    })

@app.errorhandler(404)
def not_found(error):
    return error_response('Endpoint not found', 404)

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {error}")
    return error_response('Internal server error', 500)

if __name__ == '__main__':
    # Start background services
    # asyncio.run(mempool_monitor_service.start_monitoring()) # This needs to be run in a separate thread or managed by eventlet
    # For eventlet, tasks are usually spawned directly
    socketio.start_background_task(mempool_monitor_service.start_monitoring)
    socketio.run(app, host='0.0.0.0', port=5000)



