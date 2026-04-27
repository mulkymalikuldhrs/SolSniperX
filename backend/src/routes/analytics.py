# backend/src/routes/analytics.py

import logging
from flask import Blueprint, current_app, request
from utils.responses import success_response, error_response
from utils.db import get_recent_trades, get_trade_stats
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
async def get_dashboard_data():
    """Get summarized data for the dashboard"""
    try:
        auto_trader = current_app.services['auto_trader']
        wallet_service = current_app.services['wallet']
        data_fetcher = current_app.services['data_fetcher']

        # Get wallet info
        wallet_info = await wallet_service.get_wallet_info()

        # Get trending tokens
        trending_tokens = await data_fetcher.get_all_tokens()
        top_tokens = trending_tokens[:5] if trending_tokens else []

        active_positions = list(auto_trader.owned_tokens.values())

        # Get real stats from DB
        db_stats = get_trade_stats()
        recent_trades = get_recent_trades(limit=10)

        # Calculate PnL for active positions (optional/simplified)
        current_active_pnl = 0.0
        for pos in active_positions:
            try:
                # This could be slow if there are many positions, but usually it's few
                token_data = await data_fetcher.get_token_by_address(pos['token_address'])
                if token_data:
                    current_value_sol = (pos['amount_tokens'] * token_data['price']) / (wallet_info.get('sol_price', 1) or 1)
                    current_active_pnl += (current_value_sol - pos['buy_amount_sol'])
            except Exception:
                continue

        stats = {
            "totalProfit": db_stats.get('totalProfit', 0.0),
            "totalTrades": db_stats.get('totalTrades', 0),
            "totalBuys": db_stats.get('totalBuys', 0),
            "totalSells": db_stats.get('totalSells', 0),
            "successRate": db_stats.get('successRate', 0.0),
            "rugsAvoided": db_stats.get('rugsAvoided', 0),
            "activeTokens": len(active_positions),
            "currentActivePnL": round(current_active_pnl, 4),
            "solBalance": wallet_info.get('sol_balance', 0) if wallet_info else 0
        }

        response_data = {
            "stats": stats,
            "topTokens": top_tokens,
            "recentTrades": recent_trades,
            "activePositions": active_positions
        }

        return success_response(data=response_data)
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        return error_response('Failed to fetch dashboard data', details=str(e))

@analytics_bp.route('/transactions', methods=['GET'])
async def get_transactions():
    """Get recent transactions/trades"""
    try:
        limit = int(request.args.get('limit', 50))
        trades = get_recent_trades(limit=limit)
        return success_response(data=trades, count=len(trades))
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        return error_response('Failed to fetch transactions', details=str(e))

@analytics_bp.route('/performance', methods=['GET'])
async def get_performance_metrics():
    """Get detailed performance metrics"""
    try:
        db_stats = get_trade_stats()
        metrics = {
            "totalProfit": db_stats.get('totalProfit', 0.0),
            "totalTrades": db_stats.get('totalTrades', 0),
            "successRate": db_stats.get('successRate', 0.0),
            "totalBuys": db_stats.get('totalBuys', 0),
            "totalSells": db_stats.get('totalSells', 0)
        }
        return success_response(data=metrics)
    except Exception as e:
        logger.error(f"Error fetching performance metrics: {str(e)}")
        return error_response('Failed to fetch performance metrics', details=str(e))
