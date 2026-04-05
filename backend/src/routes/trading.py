# backend/src/routes/trading.py

import logging
from flask import Blueprint, request, current_app, jsonify
from utils.responses import error_response

logger = logging.getLogger(__name__)
trading_bp = Blueprint('trading_bp', __name__, url_prefix='/api/trading')

@trading_bp.route('/buy', methods=['POST'])
async def buy_token():
    """Execute a buy order for a token"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        token_address = data.get('token_address')
        amount_sol = float(data.get('amount_sol', 0))
        slippage = float(data.get('slippage', 1.0))
        token_symbol = data.get('token_symbol')
        price_usd = data.get('price_usd')

        if not token_address or amount_sol <= 0:
            return error_response('Missing or invalid token_address or amount_sol', 400)

        result = await trading_service.execute_buy_order(
            token_address=token_address,
            amount_sol=amount_sol,
            slippage=slippage,
            token_symbol=token_symbol,
            price_usd=price_usd
        )
        return jsonify(result) # The service already returns a dict in the desired format

    except Exception as e:
        logger.error(f"Error executing buy order: {str(e)}")
        return error_response('Failed to execute buy order', details=e)

@trading_bp.route('/sell', methods=['POST'])
async def sell_token():
    """Execute a sell order for a token"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        token_address = data.get('token_address')
        amount_tokens = float(data.get('amount_tokens', 0))
        slippage = float(data.get('slippage', 1.0))
        token_symbol = data.get('token_symbol')
        price_usd = data.get('price_usd')

        if not token_address or amount_tokens <= 0:
            return error_response('Missing or invalid token_address or amount_tokens', 400)

        result = await trading_service.execute_sell_order(
            token_address=token_address,
            amount_tokens=amount_tokens,
            slippage=slippage,
            token_symbol=token_symbol,
            price_usd=price_usd
        )
        return jsonify(result) # The service already returns a dict in the desired format

    except Exception as e:
        logger.error(f"Error executing sell order: {str(e)}")
        return error_response('Failed to execute sell order', details=e)