from flask import Blueprint, jsonify, current_app
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
async def get_dashboard_stats():
    """Returns real dashboard statistics from services."""
    try:
        wallet_service = current_app.services['wallet']
        auto_trader = current_app.services['auto_trader']

        wallet_info = await wallet_service.get_wallet_info()

        # Real-time stats based on current state
        stats = {
            "totalProfit": 0, # Should be calculated from history in production
            "totalTrades": 0,
            "successRate": 0,
            "activeTokens": len(auto_trader.owned_tokens),
            "todayProfit": 0,
            "sol_balance": wallet_info.get('sol_balance', 0) if wallet_info else 0,
            "total_value_usd": wallet_info.get('total_value_usd', 0) if wallet_info else 0
        }

        # In a real app, you'd fetch history from a DB here.
        # For now, we return what we have from live services.

        return jsonify({
            "success": True,
            "data": {
                "stats": stats,
                "owned_tokens": list(auto_trader.owned_tokens.values()),
                "timestamp": datetime.now().isoformat()
            }
        })
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
