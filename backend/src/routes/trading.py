# backend/src/routes/trading.py

import logging
from flask import Blueprint, request, current_app, jsonify
from utils.responses import error_response

logger = logging.getLogger(__name__)
trading_bp = Blueprint('trading_bp', __name__, url_prefix='/api/trading')

# Maximum allowed values to prevent abuse
MAX_TRADE_AMOUNT_SOL = 100.0
MAX_SLIPPAGE = 100.0

def _validate_buy_params(data):
    """Validate buy order parameters."""
    token_address = data.get('token_address')
    amount_sol = data.get('amount_sol')
    slippage = data.get('slippage', 1.0)

    if not token_address or not isinstance(token_address, str) or len(token_address) < 32:
        return None, error_response('Invalid or missing token_address', 400)
    
    try:
        amount_sol = float(amount_sol)
    except (TypeError, ValueError):
        return None, error_response('amount_sol must be a valid number', 400)
    
    if amount_sol <= 0 or amount_sol > MAX_TRADE_AMOUNT_SOL:
        return None, error_response(f'amount_sol must be between 0 and {MAX_TRADE_AMOUNT_SOL}', 400)
    
    try:
        slippage = float(slippage)
    except (TypeError, ValueError):
        slippage = 1.0
    
    if slippage < 0 or slippage > MAX_SLIPPAGE:
        return None, error_response(f'slippage must be between 0 and {MAX_SLIPPAGE}%', 400)

    return {'token_address': token_address, 'amount_sol': amount_sol, 'slippage': slippage}, None

def _validate_sell_params(data):
    """Validate sell order parameters."""
    token_address = data.get('token_address')
    amount_tokens = data.get('amount_tokens')
    slippage = data.get('slippage', 1.0)

    if not token_address or not isinstance(token_address, str) or len(token_address) < 32:
        return None, error_response('Invalid or missing token_address', 400)
    
    try:
        amount_tokens = float(amount_tokens)
    except (TypeError, ValueError):
        return None, error_response('amount_tokens must be a valid number', 400)
    
    if amount_tokens <= 0:
        return None, error_response('amount_tokens must be positive', 400)
    
    try:
        slippage = float(slippage)
    except (TypeError, ValueError):
        slippage = 1.0
    
    if slippage < 0 or slippage > MAX_SLIPPAGE:
        return None, error_response(f'slippage must be between 0 and {MAX_SLIPPAGE}%', 400)

    return {'token_address': token_address, 'amount_tokens': amount_tokens, 'slippage': slippage}, None

@trading_bp.route('/buy', methods=['POST'])
async def buy_token():
    """Execute a buy order for a token"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', 400)

        params, err = _validate_buy_params(data)
        if err:
            return err

        result = await trading_service.execute_buy_order(
            params['token_address'], params['amount_sol'], params['slippage']
        )
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error executing buy order: {str(e)}")
        return error_response('Failed to execute buy order', details=e)

@trading_bp.route('/sell', methods=['POST'])
async def sell_token():
    """Execute a sell order for a token"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', 400)

        params, err = _validate_sell_params(data)
        if err:
            return err

        result = await trading_service.execute_sell_order(
            params['token_address'], params['amount_tokens'], params['slippage']
        )
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error executing sell order: {str(e)}")
        return error_response('Failed to execute sell order', details=e)

@trading_bp.route('/limit-order', methods=['POST'])
async def place_limit_order():
    """Place a limit order"""
    trading_service = current_app.services['trading']
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', 400)

        token_address = data.get('token_address')
        target_price = data.get('target_price')
        amount_sol = data.get('amount_sol')
        side = data.get('side', 'buy')
        token_symbol = data.get('token_symbol')

        if not token_address or not isinstance(token_address, str) or len(token_address) < 32:
            return error_response('Invalid or missing token_address', 400)

        try:
            target_price = float(target_price)
            amount_sol = float(amount_sol)
        except (TypeError, ValueError):
            return error_response('target_price and amount_sol must be valid numbers', 400)

        if target_price <= 0 or amount_sol <= 0:
            return error_response('target_price and amount_sol must be positive', 400)

        if side not in ('buy', 'sell'):
            return error_response('side must be "buy" or "sell"', 400)

        result = await trading_service.place_limit_order(token_address, target_price, amount_sol, side, token_symbol)
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error placing limit order: {str(e)}")
        return error_response('Failed to place limit order', details=e)
