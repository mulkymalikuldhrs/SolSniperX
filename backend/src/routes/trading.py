# backend/src/routes/trading.py

import logging
from flask import Blueprint, request, current_app, jsonify
from utils.responses import error_response
from utils.async_runner import run_async

logger = logging.getLogger(__name__)
trading_bp = Blueprint('trading_bp', __name__, url_prefix='/api/trading')

@trading_bp.route('/buy', methods=['POST'])
def buy_token():
    """Execute a buy order for a token"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        token_address = data.get('token_address')
        amount_sol = data.get('amount_sol')
        slippage = data.get('slippage', 1.0)

        if not token_address or not amount_sol:
            return error_response('Missing token_address or amount_sol', 400)

        result = run_async(trading_service.execute_buy_order(token_address, amount_sol, slippage))
        return jsonify(result) # The service already returns a dict in the desired format

    except Exception as e:
        logger.error(f"Error executing buy order: {str(e)}")
        return error_response('Failed to execute buy order', details=e)

@trading_bp.route('/sell', methods=['POST'])
def sell_token():
    """Execute a sell order for a token"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        token_address = data.get('token_address')
        amount_tokens = data.get('amount_tokens')
        slippage = data.get('slippage', 1.0)

        if not token_address or not amount_tokens:
            return error_response('Missing token_address or amount_tokens', 400)

        result = run_async(trading_service.execute_sell_order(token_address, amount_tokens, slippage))
        return jsonify(result) # The service already returns a dict in the desired format

    except Exception as e:
        logger.error(f"Error executing sell order: {str(e)}")
        return error_response('Failed to execute sell order', details=e)

@trading_bp.route('/limit-order', methods=['POST'])
def place_limit_order():
    """Place a limit order"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        token_address = data.get('token_address')
        target_price = data.get('target_price')
        amount_sol = data.get('amount_sol')
        side = data.get('side', 'buy')
        token_symbol = data.get('token_symbol')

        if not token_address or target_price is None or amount_sol is None:
            return error_response('Missing required fields for limit order', 400)

        result = run_async(trading_service.place_limit_order(token_address, target_price, amount_sol, side, token_symbol))
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error placing limit order: {str(e)}")
        return error_response('Failed to place limit order', details=e)
