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

    async def _fetch_from_dexscreener(self, pair_address: Optional[str] = None) -> List[Dict]:
        """
        Fetches data from Dexscreener API.
        If pair_address is provided, fetches data for that specific pair.
        Otherwise, fetches trending pairs (if supported by API or a workaround is found).
        """
        logger.info(f"Fetching data from Dexscreener for pair: {pair_address or 'trending'}")
        try:
            url = f"{DEXSCREENER_BASE_URL}/pairs/solana/{pair_address}" if pair_address else f"{DEXSCREENER_BASE_URL}/pairs/solana/trending" # Assuming trending endpoint exists
            response = await self.http_client.get(url)
            response.raise_for_status() # Raise an exception for HTTP errors
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

                    processed_tokens.append({
                        'address': token_address,
                        'name': token_name,
                        'symbol': token_symbol,
                        'price': price_usd,
                        'market_cap': 0, # Dexscreener might not provide directly
                        'volume_24h': volume_24h,
                        'price_change_24h': price_change_24h,
                        'liquidity': liquidity_usd,
                        'holder_count': 0, # Not directly from Dexscreener
                        'age_hours': age_hours,
                        'transactions_24h': 0, # Not directly from Dexscreener
                        'buy_sell_ratio': 0, # Not directly from Dexscreener
                        'top_holder_percentage': 0, # Not directly from Dexscreener
                        'dev_wallet_active': False # Not directly from Dexscreener
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
                
                # Birdeye might provide age, dev wallet info, etc. - need to check API docs
                # For now, placeholders
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
                    'age_hours': 0, # Placeholder - check Birdeye API for creation time
                    'transactions_24h': 0, # Placeholder
                    'buy_sell_ratio': 0, # Placeholder
                    'top_holder_percentage': 0, # Placeholder
                    'dev_wallet_active': False # Placeholder
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
                        'age_hours': 0, 
                        'transactions_24h': 0, 
                        'buy_sell_ratio': 0, 
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
        logger.info("Fetching real-time token data.")
        
        dexscreener_data = await self._fetch_from_dexscreener()
        birdeye_data = await self._fetch_from_birdeye()

        # Simple merge: prioritize Birdeye data if available, then Dexscreener
        combined_data = {token['address']: token for token in dexscreener_data}
        for token in birdeye_data:
            combined_data[token['address']] = {**combined_data.get(token['address'], {}), **token}
        
        return list(combined_data.values())

    async def get_all_tokens(self) -> List[Dict]:
        """
        Returns a list of all available tokens, fetching from real-time source.
        """
        return await self.fetch_real_time_data()

    async def get_token_by_address(self, token_address: str) -> Optional[Dict]:
        """
        Returns details for a specific token by its address, fetching from real-time source.
        """
        # Try fetching from Dexscreener first for specific pair
        dexscreener_token = await self._fetch_from_dexscreener(pair_address=token_address) # Assuming token_address can be used as pair_address
        if dexscreener_token:
            return dexscreener_token[0] # Expecting a list with one token

        # If not found on Dexscreener, try Birdeye
        birdeye_token = await self._fetch_from_birdeye(token_address=token_address)
        if birdeye_token:
            return birdeye_token[0] # Expecting a list with one token

        return None

    async def get_historical_prices(self, token_address: str, interval: str = '1h', limit: int = 24) -> List[Dict]:
        """
        Fetches historical price data for a given token.
        TODO: Integrate with a real historical data API (e.g., Birdeye historical data).
        For now, it will return empty list.
        """
        logger.info(f"Fetching historical prices for {token_address} (interval: {interval}, limit: {limit})")
        # Birdeye has historical data API, e.g., /history/price
        # Example: https://public-api.birdeye.so/public/history/price?address=TOKEN_ADDRESS&type=1m&time_from=1678886400&time_to=1678972800
        # This would require calculating time_from and time_to based on interval and limit.
        return [] # Returning empty for now until implemented

# Create a singleton instance for easy import
# data_fetcher_service = DataFetcherService() # Instantiation will be handled in main.py

