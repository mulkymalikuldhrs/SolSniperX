# backend/src/routes/auto_trader.py

import logging
from flask import Blueprint, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
auto_trader_bp = Blueprint('auto_trader_bp', __name__, url_prefix='/api/auto-trader')

@auto_trader_bp.route('/start', methods=['POST'])
async def start_auto_trader():
    """Starts the automated trading bot."""
    auto_trader_service = current_app.services['auto_trader']
    try:
        auto_trader_service.start_trading()
        return success_response(message='Automated trading started.')
    except Exception as e:
        logger.error(f"Error starting auto trader: {str(e)}")
        return error_response('Failed to start automated trading', details=e)

@auto_trader_bp.route('/stop', methods=['POST'])
async def stop_auto_trader():
    """Stops the automated trading bot."""
    auto_trader_service = current_app.services['auto_trader']
    try:
        auto_trader_service.stop_trading()
        return success_response(message='Automated trading stopped.')
    except Exception as e:
        logger.error(f"Error stopping auto trader: {str(e)}")
        return error_response('Failed to stop automated trading', details=e)