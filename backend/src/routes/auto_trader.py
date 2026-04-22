# backend/src/routes/auto_trader.py

import logging
from flask import Blueprint, current_app, request
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
auto_trader_bp = Blueprint('auto_trader_bp', __name__, url_prefix='/api/auto-trader')

@auto_trader_bp.route('/start', methods=['POST'])
def start_auto_trader():
    """Starts the automated trading bot."""
    auto_trader_service = current_app.services['auto_trader']
    try:
        auto_trader_service.start_trading()
        return success_response(message='Automated trading started.')
    except Exception as e:
        logger.error(f"Error starting auto trader: {str(e)}")
        return error_response('Failed to start automated trading', details=e)

@auto_trader_bp.route('/stop', methods=['POST'])
def stop_auto_trader():
    """Stops the automated trading bot."""
    auto_trader_service = current_app.services['auto_trader']
    try:
        auto_trader_service.stop_trading()
        return success_response(message='Automated trading stopped.')
    except Exception as e:
        logger.error(f"Error stopping auto trader: {str(e)}")
        return error_response('Failed to stop automated trading', details=e)

@auto_trader_bp.route('/config', methods=['GET'])
def get_auto_trader_config():
    """Retrieves the current auto trader configuration."""
    auto_trader_service = current_app.services['auto_trader']
    try:
        config = auto_trader_service.get_config()
        return success_response(data=config)
    except Exception as e:
        logger.error(f"Error fetching auto trader config: {str(e)}")
        return error_response('Failed to fetch auto trader configuration', details=e)

@auto_trader_bp.route('/config', methods=['POST'])
def update_auto_trader_config():
    """Updates the auto trader configuration."""
    auto_trader_service = current_app.services['auto_trader']
    try:
        new_config = request.get_json()
        auto_trader_service.update_config(new_config)
        return success_response(message='Auto trader configuration updated successfully.')
    except Exception as e:
        logger.error(f"Error updating auto trader config: {str(e)}")
        return error_response('Failed to update auto trader configuration', details=e)