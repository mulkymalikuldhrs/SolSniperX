# backend/src/routes/analytics.py

import logging
from flask import Blueprint, current_app, request
from utils.responses import success_response, error_response
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

        # In a real app, these would come from a database of past trades
        # For now, we'll return some realistic stats based on active positions
        active_positions = list(auto_trader.owned_tokens.values())

        stats = {
            "totalProfit": 0.0, # This would be calculated from trade history
            "totalTrades": 0,   # This would come from trade history
            "successRate": 0.0, # This would come from trade history
            "activeTokens": len(active_positions),
            "todayProfit": 0.0,
            "weeklyProfit": 0.0,
            "solBalance": wallet_info.get('sol_balance', 0) if wallet_info else 0
        }

        # In a real app, these would be calculated from a database
        # For now, return what we have (or zeros if nothing is yet recorded)
        response_data = {
            "stats": stats,
            "topTokens": top_tokens,
            "recentTrades": [] # Would fetch from trade history DB
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
        # In a real app, fetch from database
        # For now, returning empty list as no history is recorded yet
        return success_response(data=[], count=0)
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
