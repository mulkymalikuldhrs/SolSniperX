import pytest
import asyncio
from unittest.mock import MagicMock
from services.data_fetcher import DataFetcherService
from services.ai_analysis import AIAnalysisService
from services.wallet_service import WalletService

@pytest.fixture
def mock_socketio():
    return MagicMock()

@pytest.mark.asyncio
async def test_data_fetcher_caching(mock_socketio):
    service = DataFetcherService(socketio=mock_socketio)
    token_address = "So11111111111111111111111111111111111111112"

    # Mock the internal fetcher to avoid real network calls during unit test
    async def mock_fetch(pair_address=None):
        return [{"address": token_address, "price": 100}]

    service._fetch_from_dexscreener = mock_fetch

    # First call - should hit the mock fetcher
    token1 = await service.get_token_by_address(token_address)
    assert token1["address"] == token_address

    # Check if cached
    assert token_address in service.cache

    # Second call - should hit the cache
    token2 = await service.get_token_by_address(token_address)
    assert token2["address"] == token_address

@pytest.mark.asyncio
async def test_ai_analysis_parsing(mock_socketio):
    service = AIAnalysisService(socketio=mock_socketio)
    json_content = '{"summary": "Test Summary", "sentiment": "Bullish", "probability_score": 85, "risk_assessment": "Low", "recommendation": "Buy", "key_factors": ["F1"]}'

    parsed = service._parse_llm_analysis(json_content)
    assert parsed["sentiment"] == "Bullish"
    assert parsed["probability_score"] == 85
    assert parsed["recommendation"] == "Buy"

    # Test markdown wrap parsing
    markdown_content = "```json\n" + json_content + "\n```"
    parsed_md = service._parse_llm_analysis(markdown_content)
    assert parsed_md["sentiment"] == "Bullish"
