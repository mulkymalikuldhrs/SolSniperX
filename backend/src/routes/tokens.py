# backend/src/routes/tokens.py

import logging
from datetime import datetime
from flask import Blueprint, request, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
tokens_bp = Blueprint('tokens_bp', __name__, url_prefix='/api/tokens')

@tokens_bp.route('/', methods=['GET'])
async def get_tokens():
    """Get list of tokens"""
    data_fetcher_service = current_app.services['data_fetcher']
    try:
        tokens = await data_fetcher_service.get_all_tokens()
        return success_response(data=tokens, count=len(tokens))
    except Exception as e:
        logger.error(f"Error fetching tokens: {str(e)}")
        return error_response('Failed to fetch tokens', details=e)

@tokens_bp.route('/<token_address>', methods=['GET'])
async def get_token_details(token_address):
    """Get detailed token information"""
    data_fetcher_service = current_app.services['data_fetcher']
    try:
        token = await data_fetcher_service.get_token_by_address(token_address)
        
        if not token:
            return error_response('Token not found', 404)
        
        return success_response(data=token)
    except Exception as e:
        logger.error(f"Error fetching token details: {str(e)}")
        return error_response('Failed to fetch token details', details=e)

@tokens_bp.route('/<token_address>/history', methods=['GET'])
async def get_token_history(token_address):
    """Get historical price data for a specific token"""
    data_fetcher_service = current_app.services['data_fetcher']
    try:
        interval = request.args.get('interval', '1h')
        limit = int(request.args.get('limit', 24))
        
        history = await data_fetcher_service.get_historical_prices(token_address, interval, limit)
        
        if not history:
            return error_response('Historical data not found for token', 404)
        
        return success_response(data=history)
    except Exception as e:
        logger.error(f"Error fetching token history: {str(e)}")
        return error_response('Failed to fetch token history', details=e)