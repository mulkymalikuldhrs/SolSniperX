# backend/src/routes/analytics.py

import logging
from flask import Blueprint, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
async def get_dashboard_stats():
    """Get real dashboard statistics from services"""
    try:
        auto_trader = current_app.services['auto_trader']
        wallet_service = current_app.services['wallet']
        data_fetcher = current_app.services['data_fetcher']

        wallet_info = await wallet_service.get_wallet_info()
        all_tokens = await data_fetcher.get_all_tokens()

        # Sort tokens by volume or change for "trending"
        trending_tokens = sorted(all_tokens, key=lambda x: x.get('volume_24h', 0), reverse=True)[:5]

        # Calculate stats from actual trades
        total_profit = 0.0
        successful_trades = 0
        total_trades = 0

        # Real-time calculation of profit for owned tokens
        recent_trades = []
        for addr, details in list(auto_trader.owned_tokens.items()):
            total_trades += 1
            current_token_data = await data_fetcher.get_token_by_address(addr)
            if current_token_data:
                current_price = current_token_data['price']
                buy_price = details['buy_price']
                profit_pct = ((current_price - buy_price) / buy_price) * 100
                total_profit += (current_price - buy_price) * (details['current_amount_tokens'] / (10**9)) # Simplified estimation

                if profit_pct > 0:
                    successful_trades += 1

                recent_trades.append({
                    "token": details.get('symbol', 'Unknown'),
                    "type": "buy",
                    "amount": details.get('buy_amount_sol', 0),
                    "profit": profit_pct,
                    "time": details.get('purchase_time', ''),
                    "status": "active"
                })

        success_rate = (successful_trades / total_trades * 100) if total_trades > 0 else 0

        # Format stats
        stats = {
            "totalProfit": total_profit,
            "totalTrades": total_trades,
            "successRate": round(success_rate, 2),
            "activeTokens": len(auto_trader.owned_tokens),
            "todayProfit": total_profit, # Placeholder for time-windowed profit
            "weeklyProfit": total_profit, # Placeholder
            "sol_balance": wallet_info.get('sol_balance', 0) if wallet_info else 0
        }

        return success_response(data={
            "stats": stats,
            "topTokens": trending_tokens,
            "recentTrades": recent_trades
        })
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        return error_response('Failed to fetch analytics', details=e)
