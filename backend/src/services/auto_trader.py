import logging
import asyncio
from typing import Dict, Any, List
from datetime import datetime
import json
import os
from utils.db import save_position, remove_position, get_active_positions, increment_rugs_avoided

logger = logging.getLogger(__name__)

CONFIG_FILE = 'auto_trader_config.json'

class AutoTraderService:
    """
    Service for automated memecoin trading.
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
        self.owned_tokens: Dict[str, Dict] = {}
        self.config = self._load_config()

    def post_init(self):
        """Called after all dependencies are injected."""
        # Load active positions from database
        db_positions = get_active_positions()
        self.owned_tokens = {p['token_address']: p for p in db_positions}
        logger.info(f"Loaded {len(self.owned_tokens)} active positions from DB.")

    def _load_config(self) -> Dict:
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading config: {e}")
        
        return {
            "min_liquidity": 5000,
            "max_liquidity": 50000,
            "max_age_hours": 12,
            "min_volume_24h": 10000,
            "min_ai_probability_score": 75,
            "buy_amount_sol": 0.05,
            "slippage": 1.5,
            "profit_target_x": 1.5,
            "stop_loss_percentage": 0.15,
            "trailing_stop_loss_percentage": 0.10,
            "max_risk_score": 40
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

            from main import background_loop
            if background_loop and background_loop.is_running():
                self.trade_loop_task = asyncio.run_coroutine_threadsafe(self._trade_loop(), background_loop)
            else:
                self.trade_loop_task = asyncio.create_task(self._trade_loop())

            if self.socketio:
                self.socketio.emit('trading_status', {'enabled': True, 'message': 'Automated trading started.'})

    def stop_trading(self):
        if self.trading_enabled:
            self.trading_enabled = False
            if self.trade_loop_task:
                self.trade_loop_task.cancel()
                self.trade_loop_task = None
            if self.socketio:
                self.socketio.emit('trading_status', {'enabled': False, 'message': 'Automated trading stopped.'})

    async def _trade_loop(self):
        while self.trading_enabled:
            try:
                await self._scan_and_buy()
                await self._monitor_and_sell()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"AutoTrader: Error in trade loop: {e}")
            await asyncio.sleep(self.scan_interval_seconds)

    async def _scan_and_buy(self):
        logger.info("AutoTrader: Scanning for new tokens...")
        try:
            all_tokens = await self.data_fetcher_service.get_all_tokens()
            
            # Robust defaults for filtering if missing from config
            min_liq = self.config.get("min_liquidity", 5000)
            max_liq = self.config.get("max_liquidity", float('inf'))
            max_age = self.config.get("max_age_hours", 24)

            for token in all_tokens:
                liquidity = token.get('liquidity', 0)
                age = token.get('age_hours', 0)

                if (liquidity < min_liq or liquidity > max_liq or age > max_age):
                    logger.debug(f"AutoTrader: Skipping {token.get('symbol')} - Liq: {liquidity}, Age: {age}")
                    continue

                if token['address'] in self.owned_tokens:
                    continue

                await self._analyze_and_buy(token)

        except Exception as e:
            logger.error(f"AutoTrader: Error during scan and buy: {e}")

    async def _monitor_and_sell(self):
        tokens_to_remove = []
        for token_address, details in self.owned_tokens.items():
            try:
                # Real balance check
                current_balance = await self.wallet_service.get_token_balance(token_address)
                if current_balance <= 0:
                    tokens_to_remove.append(token_address)
                    continue

                # Sync balance if it changed
                if current_balance != details.get('amount_tokens'):
                    details['amount_tokens'] = current_balance
                    save_position(details)

                current_token_data = await self.data_fetcher_service.get_token_by_address(token_address)
                if not current_token_data: continue

                current_price = current_token_data['price']
                buy_price = details['buy_price']

                # Update highest price for trailing stop-loss
                if current_price > details.get('highest_price', 0):
                    details['highest_price'] = current_price
                    save_position(details)
                    logger.info(f"AutoTrader: New highest price for {details['token_symbol']}: {current_price}")

                should_sell = False
                reason = ""

                if current_price >= buy_price * self.config["profit_target_x"]:
                    should_sell = True
                    reason = "profit_target"
                elif current_price <= details.get('highest_price', current_price) * (1 - self.config.get("trailing_stop_loss_percentage", 0.10)):
                    should_sell = True
                    reason = "trailing_stop_loss"
                elif current_price <= buy_price * (1 - self.config["stop_loss_percentage"]):
                    should_sell = True
                    reason = "stop_loss"

                if should_sell:
                    sell_result = await self.trading_service.execute_sell_order(
                        token_address=token_address,
                        amount_tokens=details["amount_tokens"],
                        slippage=self.config["slippage"]
                    )
                    if sell_result.get("success"):
                        tokens_to_remove.append(token_address)
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': details['token_symbol'], 'reason': reason, 'status': 'success'})

            except Exception as e:
                logger.error(f"AutoTrader: Error monitoring {token_address}: {e}")
        
        for token_address in tokens_to_remove:
            self.owned_tokens.pop(token_address, None)
            remove_position(token_address)

    async def handle_new_token(self, token_data: Dict):
        """Callback for newly detected tokens from mempool."""
        if not self.trading_enabled:
            return

        token_address = token_data.get('address')
        if not token_address or token_address in self.owned_tokens:
            return

        # Simple initial filter for autonomous trade
        min_liq = self.config.get("min_liquidity", 5000)
        max_liq = self.config.get("max_liquidity", float('inf'))
        liquidity = token_data.get('liquidity', 0)

        if liquidity > 0 and (liquidity < min_liq or liquidity > max_liq):
             return

        logger.info(f"AutoTrader: New token detected via mempool, analyzing {token_address}...")
        await self._analyze_and_buy(token_data)

    async def _analyze_and_buy(self, token: Dict):
        token_address = token['address']

        # Final pre-buy validation
        if token_address in self.owned_tokens:
            return

        analysis = await self.ai_analysis_service.analyze_token(token_address)

        if analysis and analysis['recommendation'] == "Buy" and \
           analysis['probability_score'] >= self.config["min_ai_probability_score"] and \
           analysis['risk_assessment'] != "High":

            logger.info(f"AutoTrader: AI recommends BUY for {token.get('symbol', token_address)} (Score: {analysis['probability_score']}, Risk: {analysis['risk_assessment']}).")
            
            # Double check current liquidity from analysis data or data_fetcher
            current_token = await self.data_fetcher_service.get_token_by_address(token_address)
            if current_token:
                liquidity = current_token.get('liquidity', 0)
                if liquidity < self.config["min_liquidity"] or liquidity > self.config.get("max_liquidity", 1000000):
                    logger.warning(f"AutoTrader: Skipping {token.get('symbol', token_address)} due to liquidity mismatch: {liquidity}")
                    return

            buy_result = await self.trading_service.execute_buy_order(
                token_address=token_address,
                amount_sol=self.config["buy_amount_sol"],
                slippage=self.config["slippage"]
            )

            if buy_result.get("success"):
                # Wait for transaction finality and receive tokens
                await asyncio.sleep(5)
                token_balance = await self.wallet_service.get_token_balance(token_address)

                if token_balance > 0:
                    position_data = {
                        "token_address": token_address,
                        "token_symbol": token.get('symbol') or 'UNKNOWN',
                        "buy_price": token.get('price', 0),
                        "highest_price": token.get('price', 0),
                        "buy_amount_sol": self.config["buy_amount_sol"],
                        "amount_tokens": token_balance,
                        "purchase_time": datetime.now().isoformat()
                    }
                    self.owned_tokens[token_address] = position_data
                    save_position(position_data)

                    if self.socketio:
                        self.socketio.emit('auto_trade_event', {'type': 'buy', 'token': position_data['token_symbol'], 'status': 'success'})
                else:
                    logger.warning(f"AutoTrader: Buy confirmed for {token_address} but 0 balance detected.")

    async def handle_rugpull_alert(self, data: Dict):
        token_address = data.get('token_address') or data.get('details', {}).get('mint')
        if not token_address or token_address not in self.owned_tokens:
            return

        logger.warning(f"AutoTrader: Rugpull alert for {token_address}. Emergency sell!")

        details = self.owned_tokens[token_address]
        sell_amount = await self.wallet_service.get_token_balance(token_address)

        if sell_amount > 0:
            sell_result = await self.trading_service.execute_sell_order(
                token_address=token_address,
                amount_tokens=sell_amount,
                slippage=100
            )
            if sell_result.get("success"):
                increment_rugs_avoided()

        self.owned_tokens.pop(token_address, None)
        remove_position(token_address)

auto_trader_service = AutoTraderService()
