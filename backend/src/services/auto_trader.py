import logging
import asyncio
import json
import os
from typing import Dict, Any, List
from datetime import datetime
from solders.pubkey import Pubkey

logger = logging.getLogger(__name__)

CONFIG_FILE = 'auto_trader_config.json'

class AutoTraderService:
    """
    Core automated trading logic.
    Tracks balances in real-time and implements profit targets and stop-loss.
    """

    def __init__(self, socketio=None, data_fetcher_service=None, ai_analysis_service=None, trading_service=None, wallet_service=None):
        self.socketio = socketio
        self.data_fetcher_service = data_fetcher_service
        self.ai_analysis_service = ai_analysis_service
        self.trading_service = trading_service
        self.wallet_service = wallet_service
        self.trading_enabled = False
        self.scan_interval = 60
        self.trade_loop_task = None
        self.owned_tokens: Dict[str, Dict] = {} # {mint: {amount, buy_price, max_price, ...}}
        self.config = self._load_config()

    def _load_config(self) -> Dict:
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading config: {e}")
        
        return {
            "min_liquidity": 10000,
            "max_age_hours": 24,
            "min_volume_24h": 50000,
            "min_ai_score": 75,
            "buy_amount_sol": 0.1,
            "slippage": 1.0,
            "take_profit_x": 2.0,
            "stop_loss_pct": 20.0,
            "trailing_stop_pct": 10.0
        }

    async def _update_owned_token_amount(self, mint: str):
        """Checks wallet balance to find exact token amount held."""
        try:
            wallet_info = await self.wallet_service.get_wallet_info()
            if wallet_info and 'tokens' in wallet_info:
                for token in wallet_info['tokens']:
                    if token['mint_address'] == mint:
                        decimals = await self.trading_service._get_token_decimals(mint)
                        if decimals is not None:
                            amount = token['balance_raw'] / (10**decimals)
                            if mint in self.owned_tokens:
                                self.owned_tokens[mint]['amount'] = amount
                                return amount
            return 0
        except Exception as e:
            logger.error(f"Error updating token amount for {mint}: {e}")
            return 0

    async def _trade_loop(self):
        while self.trading_enabled:
            try:
                await self._scan_and_buy()
                await self._monitor_and_sell()
            except Exception as e:
                logger.error(f"Error in trade loop: {e}")
            await asyncio.sleep(self.scan_interval)

    async def _scan_and_buy(self):
        tokens = await self.data_fetcher_service.get_all_tokens()
        for token in tokens:
            mint = token['address']
            if mint in self.owned_tokens:
                continue

            if (token.get('liquidity', 0) >= self.config['min_liquidity'] and
                token.get('age_hours', 0) <= self.config['max_age_hours']):

                analysis = await self.ai_analysis_service.analyze_token(mint)
                if analysis['probability_score'] >= self.config['min_ai_score'] and analysis['recommendation'] == 'Buy':
                    logger.info(f"AutoTrader: Buying {token['symbol']} ({mint})")
                    res = await self.trading_service.execute_buy_order(mint, self.config['buy_amount_sol'], self.config['slippage'])
                    
                    if res.get('success'):
                        # Wait a bit for balance to reflect
                        await asyncio.sleep(5)
                        amount = await self._update_owned_token_amount(mint)
                        self.owned_tokens[mint] = {
                            "symbol": token['symbol'],
                            "buy_price": token['price'],
                            "max_price": token['price'],
                            "amount": amount,
                            "timestamp": datetime.now().isoformat()
                        }
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'buy', 'token': token['symbol'], 'status': 'success'})

    async def _monitor_and_sell(self):
        for mint, details in list(self.owned_tokens.items()):
            token_data = await self.data_fetcher_service.get_token_by_address(mint)
            if not token_data:
                continue

            current_price = token_data['price']
            buy_price = details['buy_price']
            details['max_price'] = max(details['max_price'], current_price)
            
            sell_reason = None
            if current_price >= buy_price * self.config['take_profit_x']:
                sell_reason = "take_profit"
            elif current_price <= buy_price * (1 - self.config['stop_loss_pct']/100):
                sell_reason = "stop_loss"
            elif current_price <= details['max_price'] * (1 - self.config['trailing_stop_pct']/100):
                sell_reason = "trailing_stop"

            if sell_reason:
                logger.info(f"AutoTrader: Selling {details['symbol']} ({mint}) - Reason: {sell_reason}")
                # Refresh amount before selling
                amount = await self._update_owned_token_amount(mint)
                if amount > 0:
                    res = await self.trading_service.execute_sell_order(mint, amount, self.config['slippage'])
                    if res.get('success'):
                        del self.owned_tokens[mint]
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': details['symbol'], 'reason': sell_reason, 'status': 'success'})

    def start_trading(self):
        if not self.trading_enabled:
            self.trading_enabled = True
            self.trade_loop_task = asyncio.create_task(self._trade_loop())
            logger.info("AutoTrader started.")

    def stop_trading(self):
        self.trading_enabled = False
        if self.trade_loop_task:
            self.trade_loop_task.cancel()
            logger.info("AutoTrader stopped.")

# Instance initialized in main.py
