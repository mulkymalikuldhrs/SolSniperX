import pytest
import json
import asyncio
from unittest.mock import MagicMock, AsyncMock, patch
from services.ai_analysis import AIAnalysisService

@pytest.mark.asyncio
async def test_ai_analysis_fallback():
    # Mock data_fetcher_service.get_token_by_address to return something
    mock_fetcher = AsyncMock()
    mock_fetcher.get_token_by_address.return_value = {"symbol": "TEST", "address": "addr", "price": 1.0, "liquidity": 1000, "volume_24h": 500, "price_change_24h": 5, "holder_count": 10}

    service = AIAnalysisService(data_fetcher_service=mock_fetcher)
    # Mock http client to fail
    service.http_client.post = AsyncMock(side_effect=Exception("API Error"))

    result = await service.analyze_token("dummy_address")
    assert result["sentiment"] == "Neutral"
    assert "analysis could not be performed" in result["summary"].lower()

@pytest.mark.asyncio
async def test_ai_analysis_success():
    # Mock data_fetcher_service.get_token_by_address
    mock_fetcher = AsyncMock()
    mock_fetcher.get_token_by_address.return_value = {"symbol": "TEST", "address": "addr", "price": 1.0, "liquidity": 1000, "volume_24h": 500, "price_change_24h": 5, "holder_count": 10}

    service = AIAnalysisService(data_fetcher_service=mock_fetcher)

    # Mock successful LLM response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [{
            "message": {
                "content": json.dumps({
                    "summary": "Everything looks great.",
                    "sentiment": "Bullish",
                    "probability_score": 85,
                    "risk_assessment": "Low",
                    "recommendation": "Buy",
                    "key_factors": ["High liquidity", "Strong volume"]
                })
            }
        }]
    }
    mock_response.raise_for_status = MagicMock()
    service.http_client.post = AsyncMock(return_value=mock_response)

    result = await service.analyze_token("dummy_address")
    assert result["sentiment"] == "Bullish"
    assert result["probability_score"] == 85
    assert result["recommendation"] == "Buy"
