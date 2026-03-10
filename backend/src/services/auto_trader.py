import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import os

from solders.pubkey import Pubkey
from solana.rpc.types import TokenAccountOpts

logger = logging.getLogger(__name__)

CONFIG_FILE = 'auto_trader_config.json'
TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

class AutoTraderService:
    """
    Service for automated memecoin trading.
    This service will:
    1. Periodically scan for new tokens.
    2. Analyze promising tokens using AI.
    3. Execute buy orders based on predefined criteria and AI signals.
    4. Monitor owned tokens for sell opportunities (fixed profit targets, stop-loss, trailing stop-loss, rugpulls).
    5. Execute sell orders automatically.
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
        self.owned_tokens: Dict[str, Dict] = {} # {token_address: {amount, buy_price, max_price, ...}}

        self.config = self._load_config()

        if self.socketio:
            self.socketio.on('rugpull_alert', self._handle_rugpull_alert)
            logger.info("Registered rugpull_alert handler for AutoTrader.")

    def _load_config(self) -> Dict:
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except Exception: pass
        
        return {
            "min_liquidity": 5000,
            "max_age_hours": 2,
            "min_volume_24h": 10000,
            "min_ai_probability_score": 75,
            "buy_amount_sol": 0.01,
            "slippage": 1.5,
            "profit_target_x": 2.0,
            "stop_loss_percentage": 0.25,
            "trailing_stop_loss": True,
            "trailing_stop_loss_percentage": 0.15,
            "max_risk_score": 30
        }

    def _save_config(self):
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving auto-trader config: {e}")

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
                self.socketio.emit('trading_status', {'enabled': True})

    def stop_trading(self):
        if self.trading_enabled:
            self.trading_enabled = False
            if self.trade_loop_task:
                self.trade_loop_task.cancel()
                self.trade_loop_task = None
            if self.socketio:
                self.socketio.emit('trading_status', {'enabled': False})

    async def _get_actual_token_balance(self, token_address: str) -> float:
        """
        Fetches the actual token balance from the wallet using get_token_accounts_by_owner.
        """
        if not self.wallet_service.wallet_address:
            return 0.0

        try:
            opts = TokenAccountOpts(mint=Pubkey.from_string(token_address))
            # Using async client
            response = await self.trading_service.async_solana_client.get_token_accounts_by_owner(
                self.wallet_service.wallet_address,
                opts
            )

            if response.value:
                # Use async client
                balance_resp = await self.trading_service.async_solana_client.get_token_account_balance(response.value[0].pubkey)
                if balance_resp.value:
                    return float(balance_resp.value.ui_amount or 0.0)
        except Exception as e:
            logger.error(f"Error fetching balance for {token_address}: {e}")
        return 0.0

    async def _trade_loop(self):
        while self.trading_enabled:
            try:
                await self._scan_and_buy()
                await self._monitor_and_sell()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in AutoTrader loop: {e}")
            await asyncio.sleep(self.scan_interval_seconds)

    async def _scan_and_buy(self):
        logger.info("AutoTrader: Scanning...")
        try:
            all_tokens = await self.data_fetcher_service.get_all_tokens()
            for token in all_tokens:
                if (token.get('liquidity', 0) < self.config["min_liquidity"] or
                    token.get('age_hours', 0) > self.config["max_age_hours"] or
                    token.get('address') in self.owned_tokens):
                    continue

                analysis = await self.ai_analysis_service.analyze_token(token['address'])
                if analysis and analysis['recommendation'] == "Buy" and \
                   analysis['probability_score'] >= self.config["min_ai_probability_score"]:
                    
                    buy_result = await self.trading_service.execute_buy_order(
                        token_address=token['address'],
                        amount_sol=self.config["buy_amount_sol"],
                        slippage=self.config["slippage"]
                    )

                    if buy_result.get("success"):
                        # Wait a few seconds for balance to update on-chain
                        await asyncio.sleep(5)
                        balance = await self._get_actual_token_balance(token['address'])

                        self.owned_tokens[token['address']] = {
                            "symbol": token.get('symbol'),
                            "buy_price": token['price'],
                            "max_price": token['price'],
                            "buy_amount_sol": self.config["buy_amount_sol"],
                            "current_amount_tokens": balance,
                            "purchase_time": datetime.now().isoformat()
                        }
                        logger.info(f"AutoTrader: Successfully bought {token.get('symbol')} with {balance} tokens.")
        except Exception as e:
            logger.error(f"Error in scan and buy: {e}")

    async def _monitor_and_sell(self):
        tokens_to_remove = []
        for token_address, details in self.owned_tokens.items():
            try:
                current_token_data = await self.data_fetcher_service.get_token_by_address(token_address)
                if not current_token_data: continue

                current_price = current_token_data['price']
                buy_price = details['buy_price']

                if current_price > details['max_price']:
                    details['max_price'] = current_price

                sell_reason = None
                if current_price >= buy_price * self.config["profit_target_x"]:
                    sell_reason = "profit_target"
                elif current_price <= buy_price * (1 - self.config["stop_loss_percentage"]):
                    sell_reason = "stop_loss"
                elif self.config["trailing_stop_loss"] and \
                     current_price <= details['max_price'] * (1 - self.config["trailing_stop_loss_percentage"]):
                    sell_reason = "trailing_stop_loss"

                if sell_reason:
                    logger.info(f"AutoTrader: Selling {details['symbol']} due to {sell_reason}")

                    balance = await self._get_actual_token_balance(token_address)
                    if balance <= 0:
                        tokens_to_remove.append(token_address)
                        continue

                    sell_result = await self.trading_service.execute_sell_order(
                        token_address=token_address,
                        amount_tokens=balance,
                        slippage=self.config["slippage"]
                    )
                    if sell_result.get("success"):
                        tokens_to_remove.append(token_address)
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {
                                'type': 'sell',
                                'token': details['symbol'],
                                'reason': sell_reason,
                                'status': 'success'
                            })

            except Exception as e:
                logger.error(f"Error monitoring {token_address}: {e}")
        
        for token_address in tokens_to_remove:
            del self.owned_tokens[token_address]

    async def _handle_rugpull_alert(self, data: Dict):
        token_address = data.get('token_address') or data.get('details', {}).get('mint')
        if not token_address or token_address not in self.owned_tokens:
            return

        logger.warning(f"AutoTrader: Emergency sell for {self.owned_tokens[token_address]['symbol']} - Rugpull Alert!")
        balance = await self._get_actual_token_balance(token_address)
        if balance > 0:
            await self.trading_service.execute_sell_order(
                token_address=token_address,
                amount_tokens=balance,
                slippage=100.0
            )
        del self.owned_tokens[token_address]

# auto_trader_service singleton instantiation handled in main.py
