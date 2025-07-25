# backend/src/routes/mempool.py

import logging
from flask import Blueprint, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
mempool_bp = Blueprint('mempool_bp', __name__, url_prefix='/api/mempool')

@mempool_bp.route('/monitor', methods=['GET'])
async def monitor_mempool():
    """Monitor mempool for new token launches"""
    mempool_monitor_service = current_app.services['mempool']
    try:
        new_token = await mempool_monitor_service.monitor_new_tokens()
        if new_token:
            return success_response(data=new_token, message='New token detected')
        else:
            return success_response(data=None, message='No new tokens detected')
    except Exception as e:
        logger.error(f"Error monitoring mempool: {str(e)}")
        return error_response('Mempool monitoring failed', details=e)