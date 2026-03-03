import asyncio
import httpx
import json
import logging
import re
from datetime import datetime
from typing import Dict, List, Optional, Any
from services.data_fetcher import data_fetcher_service
from config import LLM7_BASE_URL, LLM7_API_KEY

logger = logging.getLogger(__name__)

class AIAnalysisService:
    """
    AI Analysis Service for SolSniperX.
    Uses LLM7 API for deep token analysis and provides structured JSON results.
    """
    
    def __init__(self, socketio=None):
        self.llm7_base_url = LLM7_BASE_URL
        self.llm7_api_key = LLM7_API_KEY
        self.socketio = socketio
        self.http_client = httpx.AsyncClient()
    
    async def analyze_token(self, token_address: str) -> Dict:
        """Analyzes a token and returns structured data."""
        try:
            token_data = await data_fetcher_service.get_token_by_address(token_address)
            if not token_data:
                logger.warning(f"Token {token_address} not found for AI analysis.")
                return self._create_fallback_analysis({'address': token_address})

            prompt = self._create_analysis_prompt(token_data)
            
            payload = {
                "model": "gpt-4",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are SolSniperX AI, an expert Solana memecoin analyst. Always respond in valid JSON format."
                    },
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"} # Some LLMs support this directly
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.llm7_api_key}"
            }

            response = await self.http_client.post(f"{self.llm7_base_url}/chat/completions", json=payload, headers=headers)
            response.raise_for_status()
            llm_response = response.json()
            
            if llm_response and 'choices' in llm_response:
                content = llm_response['choices'][0]['message']['content']
                return self._parse_json_response(content)
            else:
                logger.error(f"Invalid LLM7 response: {llm_response}")
                return self._create_fallback_analysis(token_data)

        except Exception as e:
            logger.error(f"AI analysis failed for {token_address}: {e}")
            return self._create_fallback_analysis(token_data if 'token_data' in locals() else {'address': token_address})

    def _create_analysis_prompt(self, token_data: Dict) -> str:
        """Creates a structured prompt for the LLM."""
        return f"""Analyze this Solana memecoin and provide a JSON report.
        Token Data: {json.dumps(token_data, indent=2)}
        
        REQUIRED JSON FORMAT:
        {{
          "summary": "Short paragraph analyzing the token's potential and risks.",
          "sentiment": "Bullish|Neutral|Bearish",
          "probability_score": 0-100,
          "risk_assessment": "Low|Medium|High",
          "recommendation": "Buy|Sell|Hold|Avoid",
          "key_factors": ["Factor 1", "Factor 2", "Factor 3"]
        }}
        """

    def _parse_json_response(self, content: str) -> Dict:
        """Parses LLM response, handling potential formatting issues."""
        try:
            # Clean content if it contains markdown code blocks
            json_str = re.sub(r'```json\s*|\s*```', '', content).strip()
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Failed to parse AI JSON response: {e}. Content: {content}")
            return self._create_fallback_analysis({})

    def _create_fallback_analysis(self, token_data: Dict) -> Dict:
        """Fallback analysis result."""
        return {
            "summary": f"Basic analysis for {token_data.get('symbol', 'token')}. Manual review advised.",
            "sentiment": "Neutral",
            "probability_score": 50,
            "risk_assessment": "Medium",
            "recommendation": "Hold",
            "key_factors": ["AI analysis unavailable", "Check liquidity manually"]
        }

    async def get_trading_signals(self, token_address: str) -> Dict:
        """Generates trading signals."""
        analysis = await self.analyze_token(token_address)
        return {
            **analysis,
            "token_address": token_address,
            "timestamp": datetime.now().isoformat()
        }

# Service instantiated in main.py
