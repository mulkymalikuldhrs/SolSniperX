import logging
import asyncio
from typing import Dict, Any, List
from datetime import datetime
import json
import os

from solders.pubkey import Pubkey
from solana.rpc.types import TokenAccountOpts
from spl.token.constants import TOKEN_PROGRAM_ID

logger = logging.getLogger(__name__)

CONFIG_FILE = 'auto_trader_config.json'

class AutoTraderService:
    """
    Automated memecoin trading service.
    Handles scanning, AI analysis, buying, monitoring, and selling.
    Includes real token balance tracking.
    """

    def __init__(self, socketio=None, data_fetcher_service=None, ai_analysis_service=None, trading_service=None, wallet_service=None):
        self.socketio = socketio
        self.data_fetcher_service = data_fetcher_service
        self.ai_analysis_service = ai_analysis_service
        self.trading_service = trading_service
        self.wallet_service = wallet_service
        self.trading_enabled = False
        self.scan_interval_seconds = 60
        self.trade_loop_task = None
        self.owned_tokens: Dict[str, Dict] = {} # {token_address: details}
        self.trade_history: List[Dict] = []

        self.config = self._load_config()

        if self.socketio:
            self.socketio.on('rugpull_alert', self._handle_rugpull_alert)

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
            "min_ai_probability_score": 70,
            "buy_amount_sol": 0.01,
            "slippage": 1.0,
            "profit_target_x": 2.0,
            "stop_loss_percentage": 0.20,
            "max_risk_score": 30
        }

    def _save_config(self):
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving config: {e}")

    def update_config(self, new_config: Dict):
        self.config.update(new_config)
        self._save_config()

    def get_config(self) -> Dict:
        return self.config

    def start_trading(self):
        if not self.trading_enabled:
            self.trading_enabled = True
            self.trade_loop_task = asyncio.create_task(self._trade_loop())
            if self.socketio:
                self.socketio.emit('trading_status', {'enabled': True, 'message': 'Started'})

    def stop_trading(self):
        if self.trading_enabled:
            self.trading_enabled = False
            if self.trade_loop_task:
                self.trade_loop_task.cancel()
            if self.socketio:
                self.socketio.emit('trading_status', {'enabled': False, 'message': 'Stopped'})

    async def _trade_loop(self):
        while self.trading_enabled:
            try:
                await self._scan_and_buy()
                await self._monitor_and_sell()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Trade loop error: {e}")
            await asyncio.sleep(self.scan_interval_seconds)

    async def _get_real_token_balance(self, token_address: str) -> float:
        """
        Fetches the actual token balance for the wallet.
        """
        try:
            if not self.wallet_service.wallet_address:
                return 0.0

            # Fix: Added required TokenAccountOpts
            opts = TokenAccountOpts(program_id=TOKEN_PROGRAM_ID)
            resp = self.trading_service.solana_client.get_token_accounts_by_owner_json_parsed(
                self.wallet_service.wallet_address,
                opts
            )

            if not resp.value:
                return 0.0

            for account in resp.value:
                parsed_info = account.account.data.parsed['info']
                if parsed_info['mint'] == token_address:
                    return float(parsed_info['tokenAmount']['uiAmount'])
            
            return 0.0
        except Exception as e:
            logger.error(f"Error fetching balance for {token_address}: {e}")
            return 0.0

    async def _scan_and_buy(self):
        try:
            tokens = await self.data_fetcher_service.get_all_tokens()
            for token in tokens:
                if (token.get('liquidity', 0) < self.config["min_liquidity"] or
                    token.get('age_hours', 25) > self.config["max_age_hours"] or
                    token.get('volume_24h', 0) < self.config["min_volume_24h"]):
                    continue

                if token['address'] in self.owned_tokens:
                    continue

                analysis = await self.ai_analysis_service.analyze_token(token['address'])
                if analysis and analysis.get('recommendation') == "Buy" and \
                   analysis.get('probability_score', 0) >= self.config["min_ai_probability_score"]:
                    
                    buy_result = await self.trading_service.execute_buy_order(
                        token_address=token['address'],
                        amount_sol=self.config["buy_amount_sol"],
                        slippage=self.config["slippage"]
                    )

                    if buy_result.get("success"):
                        # Wait a bit for balance to reflect
                        await asyncio.sleep(5) # Increased wait time for better reliability
                        real_balance = await self._get_real_token_balance(token['address'])

                        self.owned_tokens[token['address']] = {
                            "symbol": token.get('symbol'),
                            "buy_price": token['price'],
                            "buy_amount_sol": self.config["buy_amount_sol"],
                            "transaction_id": buy_result.get('transaction_id'),
                            "purchase_time": datetime.now().isoformat(),
                            "current_amount_tokens": real_balance
                        }
                        self.trade_history.append({**buy_result, "token_symbol": token.get('symbol'), "timestamp": datetime.now().isoformat()})
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'buy', 'token': token['symbol'], 'status': 'success'})

        except Exception as e:
            logger.error(f"Scan and buy error: {e}")

    async def _monitor_and_sell(self):
        tokens_to_remove = []
        for token_address, details in self.owned_tokens.items():
            try:
                # Refresh balance if it was 0
                if details["current_amount_tokens"] <= 0:
                    details["current_amount_tokens"] = await self._get_real_token_balance(token_address)
                    if details["current_amount_tokens"] <= 0: continue

                token_data = await self.data_fetcher_service.get_token_by_address(token_address)
                if not token_data: continue

                current_price = token_data['price']
                buy_price = details['buy_price']

                # Take Profit or Stop Loss
                if (current_price >= buy_price * self.config["profit_target_x"] or
                    current_price <= buy_price * (1 - self.config["stop_loss_percentage"])):

                    sell_result = await self.trading_service.execute_sell_order(
                        token_address=token_address,
                        amount_tokens=details["current_amount_tokens"],
                        slippage=self.config["slippage"]
                    )
                    if sell_result.get("success"):
                        # Calculate profit
                        profit_usd = (current_price - buy_price) * details["current_amount_tokens"]
                        tokens_to_remove.append(token_address)
                        self.trade_history.append({
                            **sell_result,
                            "token_symbol": details['symbol'],
                            "profit_usd": profit_usd,
                            "timestamp": datetime.now().isoformat()
                        })
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': details['symbol'], 'status': 'success', 'profit': profit_usd})

            except Exception as e:
                logger.error(f"Monitor and sell error for {token_address}: {e}")
        
        for addr in tokens_to_remove:
            del self.owned_tokens[addr]

    async def _handle_rugpull_alert(self, data: Dict):
        token_address = data.get('token_address') or data.get('details', {}).get('mint')
        if token_address in self.owned_tokens:
            logger.warning(f"EMERGENCY SELL for {token_address} due to rugpull alert!")
            details = self.owned_tokens[token_address]
            balance = await self._get_real_token_balance(token_address)
            if balance > 0:
                await self.trading_service.execute_sell_order(token_address, balance, slippage=99.0)
            del self.owned_tokens[token_address]
