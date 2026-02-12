from flask import Blueprint, jsonify, request, current_app
import logging
from datetime import datetime, timedelta
from typing import List, Dict

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')
logger = logging.getLogger(__name__)

@analytics_bp.route('/dashboard', methods=['GET'])
def get_dashboard_stats():
    """
    Returns aggregated stats for the dashboard using real service data.
    """
    try:
        # Avoid circular dependencies by using current_app.services
        auto_trader = current_app.services.get('auto_trader')
        data_fetcher = current_app.services.get('data_fetcher')

        if not auto_trader or not data_fetcher:
            return jsonify({"error": "Services not initialized"}), 500

        # Calculate real PnL from trade history
        total_profit_usd = sum(t.get('profit_usd', 0.0) for t in auto_trader.trade_history)
        total_trades = len(auto_trader.trade_history)
        successful_trades = len([t for t in auto_trader.trade_history if t.get('type') == 'sell' and t.get('success')])

        # Calculate today's profit
        today = datetime.now().date()
        today_profit = sum(t.get('profit_usd', 0.0) for t in auto_trader.trade_history
                           if datetime.fromisoformat(t.get('timestamp')).date() == today)

        stats = {
            "totalProfit": total_profit_usd,
            "totalTrades": total_trades,
            "successRate": (successful_trades / (total_trades/2) * 100) if total_trades > 1 else 0, # total_trades includes both buy and sell
            "activeTokens": len(auto_trader.owned_tokens),
            "todayProfit": today_profit,
            "weeklyProfit": total_profit_usd # Placeholder for more complex weekly calc
        }

        # Fetch top tokens for real
        # Since this is a route, we can't easily await an async function without a helper.
        # For now, we return empty and rely on TokenScanner for real-time list.
        # Alternatively, we could have a cache in DataFetcher.
        top_tokens = []

        return jsonify({
            "stats": stats,
            "topTokens": top_tokens,
            "recentTrades": auto_trader.trade_history[-10:]
        })
    except Exception as e:
        logger.error(f"Error in dashboard analytics: {e}")
        return jsonify({"error": str(e)}), 500

@analytics_bp.route('/transactions', methods=['GET'])
def get_transactions():
    limit = request.args.get('limit', default=50, type=int)
    auto_trader = current_app.services.get('auto_trader')
    return jsonify(auto_trader.trade_history[-limit:])

@analytics_bp.route('/positions', methods=['GET'])
def get_positions():
    auto_trader = current_app.services.get('auto_trader')
    return jsonify(auto_trader.owned_tokens)
