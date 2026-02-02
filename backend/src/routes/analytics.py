# backend/src/routes/analytics.py

import logging
from datetime import datetime
from flask import Blueprint, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    """Get dashboard analytics data"""
    auto_trader = current_app.services['auto_trader']
    wallet = current_app.services['wallet']

    try:
        # Calculate stats from trade history
        history = auto_trader.trade_history
        total_trades = len(history)
        total_profit = sum(t.get('profit_usd', 0) for t in history)
        success_trades = len([t for t in history if t.get('profit_usd', 0) > 0])
        success_rate = (success_trades / total_trades * 100) if total_trades > 0 else 0

        # Get active positions
        active_tokens = len(auto_trader.owned_tokens)

        # Today's profit
        now = datetime.now()
        today = now.date()
        today_profit = sum(t.get('profit_usd', 0) for t in history if datetime.fromisoformat(t['sell_time']).date() == today)

        # Weekly profit
        one_week_ago = now - timedelta(days=7)
        weekly_profit = sum(t.get('profit_usd', 0) for t in history if datetime.fromisoformat(t['sell_time']) >= one_week_ago)

        response_data = {
            'stats': {
                'totalProfit': total_profit,
                'totalTrades': total_trades,
                'successRate': success_rate,
                'activeTokens': active_tokens,
                'todayProfit': today_profit,
                'weeklyProfit': weekly_profit
            },
            'recentTrades': history[-10:][::-1], # Last 10 trades, reversed
            'activePositions': list(auto_trader.owned_tokens.values())
        }

        return success_response(data=response_data)
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        return error_response('Failed to fetch dashboard data', details=str(e))
