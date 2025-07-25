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
    AI Analysis Service for SolSniperX
    Integrates with LLM7 API and provides comprehensive token analysis
    """
    
    def __init__(self, socketio=None):
        self.llm7_base_url = LLM7_BASE_URL
        self.llm7_api_key = LLM7_API_KEY
        self.socketio = socketio
        self.http_client = httpx.AsyncClient()
    
    async def analyze_token_with_llm7(self, token_address: str) -> Dict:
        """
        Analyze token using LLM7 API
        """
        try:
            token_data = await data_fetcher_service.get_token_by_address(token_address)
            if not token_data:
                logger.warning(f"Token {token_address} not found for AI analysis.")
                return self._create_fallback_analysis({'address': token_address})

            # Prepare analysis prompt
            prompt = self._create_analysis_prompt(token_data)
            
            # LLM7 API request
            payload = {
                "model": "gpt-4",  # or other available models
                "messages": [
                    {
                        "role": "system",
                        "content": "You are SolSniperX AI, an expert cryptocurrency analyst specializing in Solana memecoins. Provide detailed analysis with risk assessment, sentiment analysis, and trading recommendations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.llm7_api_key}"
            }

            response = await self.http_client.post(f"{self.llm7_base_url}/chat/completions", json=payload, headers=headers)
            response.raise_for_status()  # Raise an exception for HTTP errors
            llm_response = response.json()
            
            if llm_response and llm_response.get('choices') and llm_response['choices'][0].get('message'):
                analysis_content = llm_response['choices'][0]['message']['content']
                logger.info(f"LLM7 analysis successful for {token_address}")
                return self._parse_llm_analysis(analysis_content)
            else:
                logger.error(f"Invalid response from LLM7 API: {llm_response}")
                return self._create_fallback_analysis(token_data)

        except httpx.RequestError as e:
            logger.error(f"HTTP error with LLM7 API for {token_address}: {e}")
            return self._create_fallback_analysis(token_data)
        except Exception as e:
            logger.error(f"Error during LLM7 analysis for {token_address}: {e}")
            return self._create_fallback_analysis(token_data)

    def _create_analysis_prompt(self, token_data: Dict) -> str:
        """
        Creates a detailed prompt for the LLM based on token data.
        """
        prompt = f"""Analyze the following Solana memecoin data and provide a comprehensive report. 
        Focus on identifying high-probability trading opportunities and potential rugpull risks. 
        Provide a clear sentiment (Bullish, Neutral, Bearish), a probability score (0-100), 
        and a concise trading recommendation (Buy, Sell, Hold, Avoid).

        Token Details:
        - Name: {token_data.get('name')}
        - Symbol: {token_data.get('symbol')}
        - Address: {token_data.get('address')}
        - Price (USD): {token_data.get('price'):.8f}
        - 24h Volume: {token_data.get('volume_24h'):.2f}
        - 24h Price Change (%): {token_data.get('price_change_24h'):.2f}
        - Liquidity (USD): {token_data.get('liquidity'):.2f}
        - Holder Count: {token_data.get('holder_count')}
        - Age (hours): {token_data.get('age_hours'):.2f}
        - Transactions (24h): {token_data.get('transactions_24h')}
        - Buy/Sell Ratio: {token_data.get('buy_sell_ratio'):.2f}
        - Top Holder Percentage: {token_data.get('top_holder_percentage'):.2f}%
        - Dev Wallet Active: {token_data.get('dev_wallet_active')}

        Based on this data, provide:
        1.  **Analysis Summary:** A paragraph summarizing the token's current state, potential, and risks.
        2.  **Sentiment:** [Bullish/Neutral/Bearish]
        3.  **Probability Score:** [0-100] (Higher means higher probability of positive movement)
        4.  **Risk Assessment:** [Low/Medium/High] (Detail potential rugpull indicators or other risks)
        5.  **Trading Recommendation:** [Buy/Sell/Hold/Avoid] (Justify your recommendation)
        6.  **Key Factors:** List 3-5 key factors supporting your analysis.

        Format your response clearly, using markdown for readability. Ensure the Sentiment, Probability Score, Risk Assessment, and Trading Recommendation are easily extractable.
        """
        return prompt

    def _parse_llm_analysis(self, analysis_content: str) -> Dict:
        """
        Parses the LLM's analysis content into a structured dictionary.
        This is a basic parsing; more robust methods (e.g., regex, keyword extraction)
        might be needed for complex LLM outputs.
        """
        parsed_data = {
            "summary": analysis_content, # Default to full content if parsing fails
            "sentiment": "Neutral",
            "probability_score": 50,
            "risk_assessment": "Medium",
            "recommendation": "Hold",
            "key_factors": []
        }

        # Attempt to extract specific fields
        lines = analysis_content.split('\n')
        for line in lines:
            if "Sentiment:" in line:
                parsed_data["sentiment"] = line.split("Sentiment:")[1].strip().replace("[","").replace("]","")
            elif "Probability Score:" in line:
                try:
                    score_str = line.split("Probability Score:")[1].strip().replace("[","").replace("]","")
                    parsed_data["probability_score"] = int(score_str.split(" ")[0])
                except ValueError: pass
            elif "Risk Assessment:" in line:
                parsed_data["risk_assessment"] = line.split("Risk Assessment:")[1].strip().replace("[","").replace("]","")
            elif "Trading Recommendation:" in line:
                parsed_data["recommendation"] = line.split("Trading Recommendation:")[1].strip().replace("[","").replace("]","")
            elif "Key Factors:" in line:
                # This is a simple approach; might need more sophisticated parsing for lists
                factors = [f.strip() for f in line.split("Key Factors:")[1].strip().split('\n') if f.strip()]
                parsed_data["key_factors"] = factors
        
        # If summary is still the full content, try to extract the first paragraph
        if parsed_data["summary"] == analysis_content:
            first_paragraph = analysis_content.split('\n\n')[0]
            parsed_data["summary"] = first_paragraph.strip()

        return parsed_data

    def _create_fallback_analysis(self, token_data: Dict) -> Dict:
        """
        Creates a fallback analysis in case LLM call fails.
        """
        logger.warning(f"Returning fallback analysis for {token_data.get('address')}")
        return {
            "summary": f"Due to an issue, a full AI analysis could not be performed for {token_data.get('symbol', 'this token')}. Basic data is available.",
            "sentiment": "Neutral",
            "probability_score": 50,
            "risk_assessment": "Medium",
            "recommendation": "Hold",
            "key_factors": ["Data unavailable", "Manual review recommended"]
        }

    async def analyze_token(self, token_address: str) -> Dict:
        """
        Performs AI analysis for a given token.
        """
        return await self.analyze_token_with_llm7(token_address)

    async def get_trading_signals(self, token_address: str) -> Dict:
        """
        Generates trading signals based on AI analysis.
        """
        analysis = await self.analyze_token(token_address)
        
        signals = {
            "token_address": token_address,
            "recommendation": analysis['recommendation'],
            "sentiment": analysis['sentiment'],
            "probability_score": analysis['probability_score'],
            "risk_assessment": analysis['risk_assessment'],
            "signal_details": analysis['summary'],
            "timestamp": datetime.now().isoformat()
        }
        return signals

# ai_analysis_service = AIAnalysisService() # Instantiation will be handled in main.py
