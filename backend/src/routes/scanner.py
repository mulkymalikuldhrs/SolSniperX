# backend/src/routes/scanner.py

import logging
from datetime import datetime
from flask import Blueprint, request, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
scanner_bp = Blueprint('scanner_bp', __name__, url_prefix='/api/scanner')

@scanner_bp.route('/scan', methods=['POST'])
async def scan_tokens():
    """Scan for new tokens"""
    data_fetcher_service = current_app.services['data_fetcher']
    try:
        data = request.get_json() or {}
        min_liquidity = data.get('minLiquidity', 10000)
        max_age_hours = data.get('maxAge', 24)
        min_volume = data.get('minVolume', 50000)
        
        all_tokens = await data_fetcher_service.get_all_tokens()
        filtered_tokens = []
        for token in all_tokens:
            if (token.get('liquidity', 0) >= min_liquidity and
                token.get('age_hours', 0) <= max_age_hours and
                token.get('volume_24h', 0) >= min_volume):
                filtered_tokens.append(token)
        
        response_data = {
            'tokens': filtered_tokens,
            'scan_criteria': {
                'min_liquidity': min_liquidity,
                'max_age_hours': max_age_hours,
                'min_volume': min_volume
            },
            'total_found': len(filtered_tokens)
        }
        return success_response(data=response_data)
        
    except Exception as e:
        logger.error(f"Error scanning tokens: {str(e)}")
        return error_response('Token scanning failed', details=e)