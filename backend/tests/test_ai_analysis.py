import pytest
from unittest.mock import MagicMock, AsyncMock
from services.ai_analysis import AIAnalysisService

@pytest.mark.asyncio
async def test_ai_analysis_fallback():
    service = AIAnalysisService()
    # Mock http client to fail
    service.http_client.post = AsyncMock(side_effect=Exception("API Error"))

    result = await service.analyze_token("dummy_address")
    assert result["sentiment"] == "Neutral"
    assert "manual review" in result["summary"].lower()

def test_json_parsing():
    service = AIAnalysisService()
    content = '```json\n{"summary": "Test", "sentiment": "Bullish", "probability_score": 90, "risk_assessment": "Low", "recommendation": "Buy", "key_factors": ["F1"]}\n```'
    parsed = service._parse_json_response(content)
    assert parsed["sentiment"] == "Bullish"
    assert parsed["probability_score"] == 90
