import asyncio
import httpx
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from services.data_fetcher import data_fetcher_service
from config import LLM7_BASE_URL, LLM7_API_KEY

logger = logging.getLogger(__name__)

class AIAnalysisService:
    """
    AI Analysis Service for SolSniperX.
    Integrates with LLM7 API and provides JSON-formatted token analysis.
    """
    
    def __init__(self, socketio=None):
        self.llm7_base_url = LLM7_BASE_URL
        self.llm7_api_key = LLM7_API_KEY
        self.socketio = socketio
        self.http_client = httpx.AsyncClient()
    
    async def analyze_token(self, token_address: str) -> Dict:
        """
        Analyze token using LLM7 API with JSON request/response.
        """
        try:
            token_data = await data_fetcher_service.get_token_by_address(token_address)
            if not token_data:
                logger.warning(f"Token {token_address} not found for AI analysis.")
                return self._create_fallback_analysis({'address': token_address})

            # Prepare analysis prompt
            prompt = self._create_analysis_prompt(token_data)
            
            payload = {
                "model": "gpt-4",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are SolSniperX AI. Provide token analysis strictly in JSON format. Output keys: summary, sentiment, probability_score, risk_assessment, recommendation, key_factors."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "response_format": { "type": "json_object" } # Assuming API supports this, or we handle string to JSON conversion
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.llm7_api_key}"
            }

            response = await self.http_client.post(f"{self.llm7_base_url}/chat/completions", json=payload, headers=headers)
            response.raise_for_status()
            llm_response = response.json()
            
            if llm_response and llm_response.get('choices'):
                content = llm_response['choices'][0]['message']['content']
                logger.info(f"LLM7 analysis successful for {token_address}")
                return json.loads(content)
            else:
                return self._create_fallback_analysis(token_data)

        except Exception as e:
            logger.error(f"Error during AI analysis for {token_address}: {e}")
            return self._create_fallback_analysis(token_data)

    def _create_analysis_prompt(self, token_data: Dict) -> str:
        return f"""Analyze this Solana memecoin:
        - Symbol: {token_data.get('symbol')}
        - Price: {token_data.get('price'):.8f}
        - Liquidity: {token_data.get('liquidity'):.2f}
        - 24h Volume: {token_data.get('volume_24h'):.2f}
        - 24h Price Change: {token_data.get('price_change_24h'):.2f}%
        - Holder Count: {token_data.get('holder_count')}
        - Age (hours): {token_data.get('age_hours', 0):.2f}
        - Buy/Sell Ratio: {token_data.get('buy_sell_ratio', 0):.2f}
        - Top Holder Percentage: {token_data.get('top_holder_percentage', 0):.2f}%

        Return your response in valid JSON format. Provide detailed analysis and clear signals.
        """

    def _create_fallback_analysis(self, token_data: Dict) -> Dict:
        return {
            "summary": "Full AI analysis could not be performed due to an error.",
            "sentiment": "Neutral",
            "probability_score": 50,
            "risk_assessment": "Medium",
            "recommendation": "Hold",
            "key_factors": ["Manual review recommended"]
        }

    async def get_trading_signals(self, token_address: str) -> Dict:
        analysis = await self.analyze_token(token_address)
        return {
            "token_address": token_address,
            **analysis,
            "timestamp": datetime.now().isoformat()
        }

# ai_analysis_service singleton instantiation handled in main.py
