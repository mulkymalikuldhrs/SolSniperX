import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from services.data_fetcher import DataFetcherService
from services.ai_analysis import AIAnalysisService

@pytest.fixture
def mock_socketio():
    return MagicMock()

@pytest.mark.asyncio
async def test_data_fetcher_caching(mock_socketio):
    service = DataFetcherService(socketio=mock_socketio)
    token_address = "So11111111111111111111111111111111111111112"

    # Mock the internal fetcher to avoid real network calls
    service._fetch_from_dexscreener = AsyncMock(return_value=[{"address": token_address, "price": 100}])

    # First call - should hit the mock fetcher
    token1 = await service.get_token_by_address(token_address)
    assert token1["address"] == token_address
    assert service._fetch_from_dexscreener.call_count == 1

    # Second call - should hit the cache (fetcher call count remains 1)
    token2 = await service.get_token_by_address(token_address)
    assert token2["address"] == token_address
    assert service._fetch_from_dexscreener.call_count == 1

@pytest.mark.asyncio
async def test_ai_analysis_parsing(mock_socketio):
    service = AIAnalysisService(socketio=mock_socketio)
    json_content = '{"summary": "Test Summary", "sentiment": "Bullish", "probability_score": 85, "risk_assessment": "Low", "recommendation": "Buy", "key_factors": ["F1"]}'

    # The service in 'main' uses _parse_json_response
    parsed = service._parse_json_response(json_content)
    assert parsed["sentiment"] == "Bullish"
    assert parsed["probability_score"] == 85
    assert parsed["recommendation"] == "Buy"

    # Test markdown wrap parsing
    markdown_content = "```json\n" + json_content + "\n```"
    parsed_md = service._parse_json_response(markdown_content)
    assert parsed_md["sentiment"] == "Bullish"
