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

        stats = {
            "totalProfit": db_stats.get('totalProfit', 0.0),
            "totalTrades": db_stats.get('totalTrades', 0),
            "successRate": db_stats.get('successRate', 0.0),
            "activeTokens": len(active_positions),
            "todayProfit": 0.0,
            "weeklyProfit": 0.0,
            "solBalance": wallet_info.get('sol_balance', 0) if wallet_info else 0
        }

        response_data = {
            "stats": stats,
            "topTokens": top_tokens,
            "recentTrades": recent_trades
        }

        return success_response(data=response_data)
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        return error_response('Failed to fetch dashboard data', details=e)

@analytics_bp.route('/transactions', methods=['GET'])
async def get_transactions():
    """Get recent transactions/trades"""
    try:
        limit = int(request.args.get('limit', 50))
        trades = get_recent_trades(limit=limit)
        return success_response(data=trades, count=len(trades))
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        return error_response('Failed to fetch transactions', details=e)

@analytics_bp.route('/performance', methods=['GET'])
async def get_performance_metrics():
    """Get detailed performance metrics"""
    try:
        # In a real app, these would be calculated from a database
        # For now, returning zeros until trade history is implemented in DB
        metrics = {
            "totalProfit": 0.0,
            "totalTrades": 0,
            "successRate": 0.0,
            "avgProfit": 0.0,
            "bestTrade": 0.0,
            "worstTrade": 0.0,
            "winStreak": 0,
            "currentStreak": 0
        }
        return success_response(data=metrics)
    except Exception as e:
        logger.error(f"Error fetching performance metrics: {str(e)}")
        return error_response('Failed to fetch performance metrics', details=e)
