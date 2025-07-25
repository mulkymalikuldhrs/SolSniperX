# backend/src/routes/wallet.py

import logging
from flask import Blueprint, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
wallet_bp = Blueprint('wallet_bp', __name__, url_prefix='/api/wallet')

@wallet_bp.route('/balance', methods=['GET'])
async def get_wallet_balance():
    """Get wallet balance"""
    wallet_service = current_app.services['wallet']
    try:
        balance_data = await wallet_service.get_wallet_balance()
        return success_response(data=balance_data)
    except Exception as e:
        logger.error(f"Error fetching wallet balance: {str(e)}")
        return error_response('Failed to fetch wallet balance', details=e)