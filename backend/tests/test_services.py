import pytest
import json
from services.ai_analysis import AIAnalysisService
from services.data_fetcher import DataFetcherService
from unittest.mock import MagicMock, AsyncMock

@pytest.fixture
def ai_service():
    return AIAnalysisService()

@pytest.fixture
def data_fetcher():
    return DataFetcherService()

def test_parse_llm_analysis_json(ai_service):
    json_content = """
    {
        "summary": "Bullish on this token.",
        "sentiment": "Bullish",
        "probability_score": 85,
        "risk_assessment": "Low",
        "recommendation": "Buy",
        "key_factors": ["High liquidity", "Strong volume"]
    }
    """
    result = ai_service._parse_llm_analysis(json_content)
    assert result["sentiment"] == "Bullish"
    assert result["probability_score"] == 85
    assert result["recommendation"] == "Buy"

def test_parse_llm_analysis_markdown_json(ai_service):
    markdown_content = """
    ```json
    {
        "summary": "Bearish.",
        "sentiment": "Bearish",
        "probability_score": 20,
        "risk_assessment": "High",
        "recommendation": "Avoid",
        "key_factors": ["Low liquidity"]
    }
    ```
    """
    result = ai_service._parse_llm_analysis(markdown_content)
    assert result["sentiment"] == "Bearish"
    assert result["probability_score"] == 20

def test_data_fetcher_cache(data_fetcher):
    key = "test_key"
    data = {"test": "data"}
    data_fetcher._save_to_cache(key, data)

    # Cache hit
    assert data_fetcher._get_from_cache(key) == data

    # Cache expiration (manual manipulation of timestamp)
    val, ts = data_fetcher._cache[key]
    data_fetcher._cache[key] = (val, ts - 100) # Expire it
    assert data_fetcher._get_from_cache(key) is None
