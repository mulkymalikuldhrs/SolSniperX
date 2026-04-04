import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncio
import httpx
from config import DEXSCREENER_BASE_URL, BIRDEYE_BASE_URL, BIRDEYE_API_KEY

logger = logging.getLogger(__name__)

class DataFetcherService:
    """
    Service to fetch token data from various sources.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.http_client = httpx.AsyncClient()
        self._cache = {} # {key: (data, timestamp)}
        self._cache_ttl = 60 # 60 seconds TTL

    def _get_from_cache(self, key: str) -> Optional[Any]:
        if key in self._cache:
            data, timestamp = self._cache[key]
            if datetime.now().timestamp() - timestamp < self._cache_ttl:
                logger.debug(f"Cache hit for {key}")
                return data
            else:
                del self._cache[key]
        return None

    def _save_to_cache(self, key: str, data: Any):
        self._cache[key] = (data, datetime.now().timestamp())

    async def _fetch_from_dexscreener(self, pair_address: Optional[str] = None) -> List[Dict]:
        """
        Fetches data from Dexscreener API.
        """
        logger.info(f"Fetching data from Dexscreener for pair: {pair_address or 'recent'}")
        try:
            if pair_address:
                url = f"{DEXSCREENER_BASE_URL}/pairs/solana/{pair_address}"
            else:
                # Dexscreener doesn't have a simple 'trending' endpoint for all of Solana easily.
                # We can use the latest token boosts or just specific pairs.
                # For now, we'll try a common one or return empty if not found.
                url = f"{DEXSCREENER_BASE_URL}/token-boosts/top/v1"

            response = await self.http_client.get(url)
            if response.status_code == 404 and not pair_address:
                logger.warning("Dexscreener trending endpoint not found, returning empty.")
                return []

            response.raise_for_status()
            data = response.json()
            return self._process_dexscreener_data(data)
        except httpx.RequestError as e:
            logger.error(f"HTTP error fetching from Dexscreener: {e}")
        except Exception as e:
            logger.error(f"Error fetching from Dexscreener: {e}")
        return []

    async def _fetch_from_birdeye(self, token_address: Optional[str] = None) -> List[Dict]:
        """
        Fetches data from Birdeye API.
        If token_address is provided, fetches data for that specific token.
        Otherwise, fetches a general list (if supported by API or a workaround is found).
        """
        logger.info(f"Fetching data from Birdeye for token: {token_address or 'general'}")
        try:
            headers = {"X-API-KEY": BIRDEYE_API_KEY}
            url = f"{BIRDEYE_BASE_URL}/token_overview?address={token_address}" if token_address else f"{BIRDEYE_BASE_URL}/tokenlist" # Assuming tokenlist endpoint exists
            response = await self.http_client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return self._process_birdeye_data(data)
        except httpx.RequestError as e:
            logger.error(f"HTTP error fetching from Birdeye: {e}")
        except Exception as e:
            logger.error(f"Error fetching from Birdeye: {e}")
        return []

    def _process_dexscreener_data(self, data: Dict) -> List[Dict]:
        """
        Helper to process Dexscreener API response into common token format.
        """
        processed_tokens = []
        if 'pairs' in data and isinstance(data['pairs'], list):
            for pair in data['pairs']:
                try:
                    token_address = pair.get('baseToken', {}).get('address')
                    token_name = pair.get('baseToken', {}).get('name')
                    token_symbol = pair.get('baseToken', {}).get('symbol')
                    price_usd = float(pair.get('priceUsd', 0) or 0)
                    volume_24h = float(pair.get('volume', {}).get('h24', 0) or 0)
                    liquidity_usd = float(pair.get('liquidity', {}).get('usd', 0) or 0)
                    price_change_24h = float(pair.get('priceChange', {}).get('h24', 0) or 0)
                    
                    # Dexscreener provides pair creation time in UTC milliseconds
                    created_at_unix_ms = pair.get('pairCreatedAt')
                    age_hours = 0
                    if created_at_unix_ms:
                        created_at_dt = datetime.fromtimestamp(created_at_unix_ms / 1000)
                        age_hours = (datetime.now() - created_at_dt).total_seconds() / 3600

                    txns_24h_data = pair.get('txns', {}).get('h24', {})
                    buys_24h = txns_24h_data.get('buys', 0)
                    sells_24h = txns_24h_data.get('sells', 0)
                    transactions_24h = buys_24h + sells_24h
                    buy_sell_ratio = buys_24h / sells_24h if sells_24h > 0 else (1.0 if buys_24h > 0 else 0)

                    processed_tokens.append({
                        'address': token_address,
                        'name': token_name,
                        'symbol': token_symbol,
                        'price': price_usd,
                        'market_cap': float(pair.get('fdv', 0) or 0),
                        'volume_24h': volume_24h,
                        'price_change_24h': price_change_24h,
                        'liquidity': liquidity_usd,
                        'holder_count': 0, # Dexscreener doesn't provide holder count
                        'age_hours': round(age_hours, 2),
                        'transactions_24h': transactions_24h,
                        'buy_sell_ratio': round(buy_sell_ratio, 2),
                        'top_holder_percentage': 0,
                        'dev_wallet_active': False
                    })
                except Exception as e:
                    logger.warning(f"Error processing Dexscreener pair: {e} - {pair}")
        return processed_tokens

    def _process_birdeye_data(self, data: Dict) -> List[Dict]:
        """
        Helper to process Birdeye API response into common token format.
        """
        processed_tokens = []
        if 'data' in data and isinstance(data['data'], dict):
            token_info = data['data']
            try:
                token_address = token_info.get('address')
                token_name = token_info.get('name')
                token_symbol = token_info.get('symbol')
                price_usd = float(token_info.get('price', 0) or 0)
                volume_24h = float(token_info.get('v24h', 0) or 0)
                liquidity_usd = float(token_info.get('liquidity', 0) or 0)
                price_change_24h = float(token_info.get('priceChange24h', 0) or 0)
                holder_count = int(token_info.get('holders', 0) or 0)
                market_cap = float(token_info.get('mc', 0) or 0)
                
                # Real data from Birdeye overview
                transactions_24h = int(token_info.get('trade24h', 0) or 0)
                v24h_buy = float(token_info.get('v24hBuy', 0) or 0)
                v24h_sell = float(token_info.get('v24hSell', 0) or 0)
                buy_sell_ratio = v24h_buy / v24h_sell if v24h_sell > 0 else (1.0 if v24h_buy > 0 else 0)

                # Age calculation if listTime is available
                list_time = token_info.get('lastTradeUnixTime') # Fallback to last trade if listTime not present
                age_hours = 0
                if list_time:
                    age_hours = (datetime.now().timestamp() - list_time) / 3600

                processed_tokens.append({
                    'address': token_address,
                    'name': token_name,
                    'symbol': token_symbol,
                    'price': price_usd,
                    'market_cap': market_cap,
                    'volume_24h': volume_24h,
                    'price_change_24h': price_change_24h,
                    'liquidity': liquidity_usd,
                    'holder_count': holder_count,
                    'age_hours': round(age_hours, 2),
                    'transactions_24h': transactions_24h,
                    'buy_sell_ratio': round(buy_sell_ratio, 2),
                    'top_holder_percentage': 0, # Still needs security API for precise value
                    'dev_wallet_active': False
                })
            except Exception as e:
                logger.warning(f"Error processing Birdeye token data: {e} - {token_info}")
        elif 'data' in data and isinstance(data['data'], list): # For tokenlist endpoint
            for token_info in data['data']:
                try:
                    token_address = token_info.get('address')
                    token_name = token_info.get('name')
                    token_symbol = token_info.get('symbol')
                    price_usd = float(token_info.get('price', 0) or 0)
                    volume_24h = float(token_info.get('v24h', 0) or 0)
                    liquidity_usd = float(token_info.get('liquidity', 0) or 0)
                    price_change_24h = float(token_info.get('priceChange24h', 0) or 0)
                    holder_count = int(token_info.get('holders', 0) or 0)
                    market_cap = float(token_info.get('mc', 0) or 0)

                    v24h_buy = float(token_info.get('vBuy24h', 0) or 0)
                    v24h_sell = float(token_info.get('vSell24h', 0) or 0)
                    buy_sell_ratio = v24h_buy / v24h_sell if v24h_sell > 0 else (1.0 if v24h_buy > 0 else 0)

                    processed_tokens.append({
                        'address': token_address,
                        'name': token_name,
                        'symbol': token_symbol,
                        'price': price_usd,
                        'market_cap': market_cap,
                        'volume_24h': volume_24h,
                        'price_change_24h': price_change_24h,
                        'liquidity': liquidity_usd,
                        'holder_count': holder_count,
                        'age_hours': 0, # list endpoint doesn't usually provide age
                        'transactions_24h': int(token_info.get('trade24h', 0) or 0),
                        'buy_sell_ratio': round(buy_sell_ratio, 2),
                        'top_holder_percentage': 0, 
                        'dev_wallet_active': False 
                    })
                except Exception as e:
                    logger.warning(f"Error processing Birdeye token list item: {e} - {token_info}")
        return processed_tokens

    async def fetch_real_time_data(self) -> List[Dict]:
        """
        Fetches real-time token data from Dexscreener and Birdeye.
        """
        cache_key = "real_time_data"
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data

        logger.info("Fetching real-time token data.")
        
        dexscreener_data = await self._fetch_from_dexscreener()
        birdeye_data = await self._fetch_from_birdeye()

        # Simple merge: prioritize Birdeye data if available, then Dexscreener
        combined_data = {token['address']: token for token in dexscreener_data}
        for token in birdeye_data:
            combined_data[token['address']] = {**combined_data.get(token['address'], {}), **token}
        
        result = list(combined_data.values())
        self._save_to_cache(cache_key, result)
        return result

    async def get_all_tokens(self) -> List[Dict]:
        """
        Returns a list of all available tokens, fetching from real-time source.
        """
        return await self.fetch_real_time_data()

    async def get_token_by_address(self, token_address: str) -> Optional[Dict]:
        """
        Returns details for a specific token by its address, fetching from real-time source.
        Includes security data from Birdeye.
        """
        cache_key = f"token_{token_address}"
        cached_token = self._get_from_cache(cache_key)
        if cached_token:
            return cached_token

        # Fetch basic info from Birdeye overview
        birdeye_token_list = await self._fetch_from_birdeye(token_address=token_address)
        token = birdeye_token_list[0] if birdeye_token_list else None

        if not token:
            # Fallback to Dexscreener
            dexscreener_token = await self._fetch_from_dexscreener(pair_address=token_address)
            if dexscreener_token:
                token = dexscreener_token[0]

        if token:
            # Enrich with security data if possible
            security_data = await self._fetch_token_security(token['address'])
            if security_data:
                token['top_holder_percentage'] = security_data.get('top10HolderPercent', 0)
                token['dev_wallet_active'] = security_data.get('creatorHasFullControl', False) or (not security_data.get('ownerRenounced', True))

            self._save_to_cache(cache_key, token)
            return token

        return None

    async def _fetch_token_security(self, token_address: str) -> Optional[Dict]:
        """
        Fetches security information for a token from Birdeye.
        """
        if not BIRDEYE_API_KEY:
            return None

        try:
            headers = {"X-API-KEY": BIRDEYE_API_KEY, "x-chain": "solana"}
            url = f"{BIRDEYE_BASE_URL}/token_security?address={token_address}"
            response = await self.http_client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            if data.get('success'):
                return data.get('data')
        except Exception as e:
            logger.error(f"Error fetching token security from Birdeye: {e}")
        return None

    async def get_historical_prices(self, token_address: str, interval: str = '1h', limit: int = 24) -> List[Dict]:
        """
        Fetches historical price data for a given token from Birdeye.
        Returns a list of price points with timestamps.
        """
        logger.info(f"Fetching historical prices for {token_address} (interval: {interval}, limit: {limit})")

        if not BIRDEYE_API_KEY:
            logger.warning("Birdeye API key missing. Cannot fetch real historical data.")
            return []

        try:
            # Calculate time range
            now = int(datetime.now().timestamp())
            hours = limit if interval == '1h' else limit * 24
            time_from = now - (hours * 3600)

            url = f"{BIRDEYE_BASE_URL}/history/price?address={token_address}&address_type=token&type={interval}&time_from={time_from}&time_to={now}"
            headers = {"X-API-KEY": BIRDEYE_API_KEY}

            response = await self.http_client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            history = []
            if 'data' in data and 'items' in data['data']:
                for item in data['data']['items']:
                    history.append({
                        'timestamp': datetime.fromtimestamp(item['unixTime']).isoformat(),
                        'price': item['value'],
                        'volume': 0 # Birdeye price history might not have volume in this endpoint
                    })
            return history
        except Exception as e:
            logger.error(f"Error fetching historical prices from Birdeye: {e}")
            return []

# Create a singleton instance for easy import
data_fetcher_service = DataFetcherService()

