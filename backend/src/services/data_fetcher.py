import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncio
import httpx
from config import DEXSCREENER_BASE_URL, BIRDEYE_BASE_URL, BIRDEYE_API_KEY

logger = logging.getLogger(__name__)

class DataFetcherService:
    """
    Service to fetch token data from various sources with internal caching.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.http_client = httpx.AsyncClient()
        self.cache: Dict[str, Dict] = {} # {token_address: {data, timestamp}}
        self.cache_ttl = 60 # 60 seconds TTL

    async def _fetch_from_dexscreener(self, pair_address: Optional[str] = None) -> List[Dict]:
        """
        Fetches data from Dexscreener API.
        """
        logger.info(f"Fetching from Dexscreener: {pair_address or 'trending'}")
        try:
            url = f"{DEXSCREENER_BASE_URL}/pairs/solana/{pair_address}" if pair_address else f"{DEXSCREENER_BASE_URL}/latest/dex/tokens/So11111111111111111111111111111111111111112" # Simple fallback for SOL-based tokens
            response = await self.http_client.get(url)
            response.raise_for_status()
            data = response.json()
            return self._process_dexscreener_data(data)
        except Exception as e:
            logger.error(f"Error fetching from Dexscreener: {e}")
        return []

    async def _fetch_from_birdeye(self, token_address: Optional[str] = None) -> List[Dict]:
        """
        Fetches data from Birdeye API.
        """
        logger.info(f"Fetching from Birdeye: {token_address or 'general'}")
        try:
            headers = {"X-API-KEY": BIRDEYE_API_KEY}
            url = f"{BIRDEYE_BASE_URL}/token_overview?address={token_address}" if token_address else f"{BIRDEYE_BASE_URL}/tokenlist"
            response = await self.http_client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return self._process_birdeye_data(data)
        except Exception as e:
            logger.error(f"Error fetching from Birdeye: {e}")
        return []

    def _process_dexscreener_data(self, data: Dict) -> List[Dict]:
        processed_tokens = []
        pairs = data.get('pairs', [])
        if not pairs: return []

        for pair in pairs:
            try:
                token_address = pair.get('baseToken', {}).get('address')
                token_symbol = pair.get('baseToken', {}).get('symbol')
                price_usd = float(pair.get('priceUsd', 0) or 0)
                liquidity_usd = float(pair.get('liquidity', {}).get('usd', 0) or 0)
                
                processed_tokens.append({
                    'address': token_address,
                    'name': pair.get('baseToken', {}).get('name'),
                    'symbol': token_symbol,
                    'price': price_usd,
                    'market_cap': float(pair.get('fdv', 0) or 0),
                    'volume_24h': float(pair.get('volume', {}).get('h24', 0) or 0),
                    'price_change_24h': float(pair.get('priceChange', {}).get('h24', 0) or 0),
                    'liquidity': liquidity_usd,
                    'age_hours': (datetime.now() - datetime.fromtimestamp(pair.get('pairCreatedAt', 0) / 1000)).total_seconds() / 3600 if pair.get('pairCreatedAt') else 0
                })
            except Exception: continue
        return processed_tokens

    def _process_birdeye_data(self, data: Dict) -> List[Dict]:
        processed_tokens = []
        if 'data' in data and isinstance(data['data'], dict):
            token_info = data['data']
            try:
                processed_tokens.append({
                    'address': token_info.get('address'),
                    'name': token_info.get('name'),
                    'symbol': token_info.get('symbol'),
                    'price': float(token_info.get('price', 0) or 0),
                    'market_cap': float(token_info.get('mc', 0) or 0),
                    'volume_24h': float(token_info.get('v24h', 0) or 0),
                    'price_change_24h': float(token_info.get('priceChange24h', 0) or 0),
                    'liquidity': float(token_info.get('liquidity', 0) or 0),
                    'holder_count': int(token_info.get('holders', 0) or 0)
                })
            except Exception: pass
        return processed_tokens

    async def get_all_tokens(self) -> List[Dict]:
        # Implementation of fetching trending or list from sources
        dex_tokens = await self._fetch_from_dexscreener()
        # Cache trending results too for efficiency
        return dex_tokens

    async def get_token_by_address(self, token_address: str) -> Optional[Dict]:
        """
        Returns details for a specific token with caching logic.
        """
        if token_address in self.cache:
            entry = self.cache[token_address]
            if (datetime.now() - entry['timestamp']).total_seconds() < self.cache_ttl:
                return entry['data']

        # Cache miss, fetch fresh data
        tokens = await self._fetch_from_dexscreener(pair_address=token_address)
        if not tokens:
            tokens = await self._fetch_from_birdeye(token_address=token_address)

        if tokens:
            self.cache[token_address] = {'data': tokens[0], 'timestamp': datetime.now()}
            return tokens[0]

        return None

# data_fetcher_service instantiation handled in main.py

data_fetcher_service = DataFetcherService()
