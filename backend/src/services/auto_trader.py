import logging
import asyncio
from typing import Dict, Any, List
from datetime import datetime
import json
import os

# These will be passed in during initialization
# from services.data_fetcher import data_fetcher_service
# from services.ai_analysis import ai_analysis_service
# from services.trading_service import trading_service
# from services.wallet_service import wallet_service

logger = logging.getLogger(__name__)

CONFIG_FILE = 'auto_trader_config.json'

class AutoTraderService:
    """
    Service for automated memecoin trading.
    This service will:
    1. Periodically scan for new tokens.
    2. Analyze promising tokens using AI.
    3. Execute buy orders based on predefined criteria and AI signals.
    4. Monitor owned tokens for sell opportunities (profit targets, stop-loss, rugpulls).
    5. Execute sell orders automatically.
    """

    def __init__(self, socketio=None, data_fetcher_service=None, ai_analysis_service=None, trading_service=None, wallet_service=None):
        self.socketio = socketio
        self.data_fetcher_service = data_fetcher_service
        self.ai_analysis_service = ai_analysis_service
        self.trading_service = trading_service
        self.wallet_service = wallet_service
        self.trading_enabled = False
        self.scan_interval_seconds = 60 # Scan for new tokens every 60 seconds
        self.trade_loop_task = None
        self.owned_tokens: Dict[str, Dict] = {} # {token_address: {amount, buy_price, ...}}

        # Default trading parameters (configurable via UI later)
        self.config = self._load_config()

        if self.socketio:
            self.socketio.on('rugpull_alert', self._handle_rugpull_alert)
            logger.info("Registered rugpull_alert handler.")

    def _load_config(self) -> Dict:
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    config = json.load(f)
                    logger.info(f"Loaded auto-trader config from {CONFIG_FILE}")
                    return config
            except Exception as e:
                logger.error(f"Error loading config from {CONFIG_FILE}: {e}. Using default config.")
        
        # Default configuration
        return {
            "min_liquidity": 10000, # Minimum liquidity for a token to be considered
            "max_age_hours": 24,    # Maximum age of a token to be considered
            "min_volume_24h": 50000, # Minimum 24h volume
            "min_ai_probability_score": 70, # Minimum AI probability score to buy
            "buy_amount_sol": 0.01, # Amount of SOL to spend per buy
            "slippage": 1.0,     # Slippage in percentage (1.0%)
            "profit_target_x": 2.0, # Sell when price is 2x buy price
            "stop_loss_percentage": 0.20, # Sell if price drops 20% from buy price
            "max_risk_score": 30 # Max AI risk score to consider buying
        }

    def _save_config(self):
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f, indent=4)
            logger.info(f"Saved auto-trader config to {CONFIG_FILE}")
        except Exception as e:
            logger.error(f"Error saving config to {CONFIG_FILE}: {e}")

    def update_config(self, new_config: Dict):
        self.config.update(new_config)
        self._save_config()
        logger.info("Auto-trader config updated.")

    def get_config(self) -> Dict:
        return self.config

    def start_trading(self):
        if not self.trading_enabled:
            self.trading_enabled = True
            logger.info("Automated trading enabled.")
            self.trade_loop_task = asyncio.create_task(self._trade_loop())
            if self.socketio:
                self.socketio.emit('trading_status', {'enabled': True, 'message': 'Automated trading started.'})

    def stop_trading(self):
        if self.trading_enabled:
            self.trading_enabled = False
            if self.trade_loop_task:
                self.trade_loop_task.cancel()
                self.trade_loop_task = None
            logger.info("Automated trading disabled.")
            if self.socketio:
                self.socketio.emit('trading_status', {'enabled': False, 'message': 'Automated trading stopped.'})

    async def _trade_loop(self):
        while self.trading_enabled:
            try:
                logger.info("AutoTrader: Running trade loop...")
                await self._scan_and_buy()
                await self._monitor_and_sell()
            except asyncio.CancelledError:
                logger.info("AutoTrader: Trade loop cancelled.")
                break
            except Exception as e:
                logger.error(f"AutoTrader: Error in trade loop: {e}")
            await asyncio.sleep(self.scan_interval_seconds)

    async def _scan_and_buy(self):
        logger.info("AutoTrader: Scanning for new tokens...")
        try:
            all_tokens = await self.data_fetcher_service.get_all_tokens()
            
            for token in all_tokens:
                # Apply initial filters
                if (token.get('liquidity', 0) < self.config["min_liquidity"] or
                    token.get('age_hours', 0) > self.config["max_age_hours"] or
                    token.get('volume_24h', 0) < self.config["min_volume_24h"]):
                    logger.debug(f"AutoTrader: Skipping {token.get('symbol', token.get('address'))} - failed initial filters.")
                    continue

                # Check if already owned
                if token['address'] in self.owned_tokens:
                    logger.debug(f"AutoTrader: Skipping {token.get('symbol', token.get('address'))} - already owned.")
                    continue

                logger.info(f"AutoTrader: Analyzing {token.get('symbol', token.get('address'))} with AI...")
                analysis = await self.ai_analysis_service.analyze_token(token['address'])

                if analysis and analysis['recommendation'] == "Buy" and \
                   analysis['probability_score'] >= self.config["min_ai_probability_score"] and \
                   analysis['risk_assessment'] != "High": # Assuming AI returns Low/Medium/High
                    logger.info(f"AutoTrader: AI recommends BUY for {token.get('symbol', token.get('address'))} (Score: {analysis['probability_score']}).")
                    
                    # Execute buy order
                    buy_result = await self.trading_service.execute_buy_order(
                        token_address=token['address'],
                        amount_sol=self.config["buy_amount_sol"],
                        slippage=self.config["slippage"]
                    )

                    if buy_result.get("success"):
                        logger.info(f"AutoTrader: Successfully bought {token.get('symbol', token.get('address'))}. Transaction: {buy_result.get('transaction_id')}")
                        # Record owned token details
                        self.owned_tokens[token['address']] = {
                            "symbol": token.get('symbol'),
                            "buy_price": token['price'], # Price at time of buy
                            "buy_amount_sol": self.config["buy_amount_sol"],
                            "transaction_id": buy_result.get('transaction_id'),
                            "purchase_time": datetime.now().isoformat(),
                            "current_amount_tokens": 0 # This needs to be updated after the trade confirms and we know how many tokens were received
                        }
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'buy', 'token': token['symbol'], 'amount_sol': self.config["buy_amount_sol"], 'status': 'success'})
                    else:
                        logger.error(f"AutoTrader: Failed to buy {token.get('symbol', token.get('address'))}: {buy_result.get('message')}")
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'buy', 'token': token['symbol'], 'amount_sol': self.config["buy_amount_sol"], 'status': 'failed', 'error': buy_result.get('message')})
                else:
                    logger.debug(f"AutoTrader: AI did not recommend BUY for {token.get('symbol', token.get('address'))} (Score: {analysis.get('probability_score')}, Risk: {analysis.get('risk_assessment')}).")

        except Exception as e:
            logger.error(f"AutoTrader: Error during scan and buy: {e}")

    async def _monitor_and_sell(self):
        logger.info("AutoTrader: Monitoring owned tokens for sell opportunities...")
        tokens_to_remove = []
        for token_address, details in self.owned_tokens.items():
            try:
                current_token_data = await self.data_fetcher_service.get_token_by_address(token_address)
                if not current_token_data:
                    logger.warning(f"AutoTrader: Owned token {details.get('symbol', token_address)} not found in data fetcher. Skipping sell monitoring.")
                    continue

                current_price = current_token_data['price']
                buy_price = details['buy_price']

                # Profit target check
                if current_price >= buy_price * self.config["profit_target_x"]:
                    logger.info(f"AutoTrader: Profit target reached for {details['symbol']}. Selling...")
                    # Execute sell order (sell all owned tokens of this type)
                    # This requires knowing the exact amount of tokens owned, which needs to be updated after buy confirmation
                    # For now, using a placeholder amount.
                    sell_amount = details["current_amount_tokens"] if details["current_amount_tokens"] > 0 else 0.000001 # Placeholder
                    sell_result = await self.trading_service.execute_sell_order(
                        token_address=token_address,
                        amount_tokens=sell_amount,
                        slippage=self.config["slippage"]
                    )
                    if sell_result.get("success"):
                        logger.info(f"AutoTrader: Successfully sold {details['symbol']}. Transaction: {sell_result.get('transaction_id')}")
                        tokens_to_remove.append(token_address)
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': details['symbol'], 'reason': 'profit_target', 'status': 'success'})
                    else:
                        logger.error(f"AutoTrader: Failed to sell {details['symbol']}: {sell_result.get('message')}")
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': details['symbol'], 'reason': 'profit_target', 'status': 'failed', 'error': sell_result.get('message')})

                # Stop-loss check
                elif current_price <= buy_price * (1 - self.config["stop_loss_percentage"]):
                    logger.warning(f"AutoTrader: Stop-loss triggered for {details['symbol']}. Selling...")
                    # Execute sell order (sell all owned tokens of this type)
                    sell_amount = details["current_amount_tokens"] if details["current_amount_tokens"] > 0 else 0.000001 # Placeholder
                    sell_result = await self.trading_service.execute_sell_order(
                        token_address=token_address,
                        amount_tokens=sell_amount,
                        slippage=self.config["slippage"]
                    )
                    if sell_result.get("success"):
                        logger.info(f"AutoTrader: Successfully sold {details['symbol']}. Transaction: {sell_result.get('transaction_id')}")
                        tokens_to_remove.append(token_address)
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': details['symbol'], 'reason': 'stop_loss', 'status': 'success'})
                    else:
                        logger.error(f"AutoTrader: Failed to sell {details['symbol']}: {sell_result.get('message')}")
                        if self.socketio:
                            self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': details['symbol'], 'reason': 'stop_loss', 'status': 'failed', 'error': sell_result.get('message')})

            except Exception as e:
                logger.error(f"AutoTrader: Error monitoring {token_address}: {e}")
        
        for token_address in tokens_to_remove:
            del self.owned_tokens[token_address]

    async def _handle_rugpull_alert(self, data: Dict):
        token_address = data.get('token_address') or data.get('details', {}).get('mint')
        if not token_address:
            logger.warning(f"Rugpull alert received without token address: {data}")
            return

        if token_address in self.owned_tokens:
            logger.warning(f"AutoTrader: Rugpull alert for owned token {self.owned_tokens[token_address]['symbol']} ({token_address}). Initiating emergency sell!")
            
            # Attempt to sell all of the affected token
            sell_amount = self.owned_tokens[token_address]["current_amount_tokens"]
            if sell_amount <= 0:
                logger.warning(f"AutoTrader: No tokens to sell for {self.owned_tokens[token_address]['symbol']} on rugpull alert.")
                del self.owned_tokens[token_address]
                return

            sell_result = await self.trading_service.execute_sell_order(
                token_address=token_address,
                amount_tokens=sell_amount,
                slippage=100 # Max slippage for emergency sell
            )

            if sell_result.get("success"):
                logger.info(f"AutoTrader: Successfully executed emergency sell for {self.owned_tokens[token_address]['symbol']}. Transaction: {sell_result.get('transaction_id')}")
                if self.socketio:
                    self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': self.owned_tokens[token_address]['symbol'], 'reason': 'rugpull_cut_loss', 'status': 'success'})
            else:
                logger.error(f"AutoTrader: Failed to execute emergency sell for {self.owned_tokens[token_address]['symbol']}: {sell_result.get('message')}")
                if self.socketio:
                    self.socketio.emit('auto_trade_event', {'type': 'sell', 'token': self.owned_tokens[token_address]['symbol'], 'reason': 'rugpull_cut_loss', 'status': 'failed', 'error': sell_result.get('message')})
            
            del self.owned_tokens[token_address] # Remove from owned tokens after attempting to sell
        else:
            logger.info(f"AutoTrader: Rugpull alert for unowned token {token_address}. No action taken.")

# Create a singleton instance
# auto_trader_service = AutoTraderService() # Instantiation will be handled in main.py
