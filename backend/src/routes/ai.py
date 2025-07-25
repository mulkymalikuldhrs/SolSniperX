# backend/src/routes/ai.py

import logging
from datetime import datetime
from flask import Blueprint, current_app
from utils.responses import success_response, error_response

logger = logging.getLogger(__name__)
ai_bp = Blueprint('ai_bp', __name__, url_prefix='/api/ai')

@ai_bp.route('/analyze/<token_address>', methods=['POST'])
async def analyze_token_ai(token_address):
    """AI analysis for a specific token"""
    ai_analysis_service = current_app.services['ai_analysis']
    try:
        analysis = await ai_analysis_service.analyze_token(token_address)
        
        if not analysis:
            return error_response('Token not found or analysis failed', 404)
        
        return success_response(data=analysis)
            
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        return error_response('AI analysis failed', details=e)

@ai_bp.route('/trading-signals/<token_address>', methods=['POST'])
async def get_ai_trading_signals(token_address):
    """Get AI-powered trading signals"""
    ai_analysis_service = current_app.services['ai_analysis']
    try:
        signals = await ai_analysis_service.get_trading_signals(token_address)
        
        if not signals:
            return error_response('Token not found or signal generation failed', 404)
        
        return success_response(data=signals)
            
    except Exception as e:
        logger.error(f"Error generating trading signals: {str(e)}")
        return error_response('Trading signal generation failed', details=e)