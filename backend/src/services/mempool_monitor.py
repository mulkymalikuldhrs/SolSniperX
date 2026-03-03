import logging
import asyncio
import json
from typing import Dict, Optional, List
from datetime import datetime
from solana.rpc.websocket_api import connect
from solana.rpc.api import Client
from solana.rpc.commitment import Commitment, Confirmed, Processed
from solana.rpc.core import RPCException
from solders.pubkey import Pubkey
from solders.rpc.config import RpcTransactionLogsFilterMentions

from config import SOLANA_RPC_URL, SOLANA_WS_URL
from services.data_fetcher import data_fetcher_service

logger = logging.getLogger(__name__)

# Program IDs to monitor
PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5DkZJv9RKzyAXYVqBCTs2Fmb7sK559pwt"
RAYDIUM_LIQUIDITY_POOL_V4 = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"

class MempoolMonitorService:
    """
    Service to monitor the Solana mempool for new token launches and potential rugpulls.
    Optimized to filter by relevant program IDs.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.solana_client = Client(SOLANA_RPC_URL)
        self.monitoring_task = None
        self.is_running = False

    async def _monitor_transactions(self):
        """
        Monitors transactions filtered by Pump.fun and Raydium programs.
        Uses a loop with backoff for reconnection.
        """
        while self.is_running:
            logger.info(f"Connecting to Solana WebSocket: {SOLANA_WS_URL}")
            try:
                async with connect(SOLANA_WS_URL) as websocket:
                    filters = RpcTransactionLogsFilterMentions(
                        [Pubkey.from_string(PUMP_FUN_PROGRAM_ID),
                         Pubkey.from_string(RAYDIUM_LIQUIDITY_POOL_V4)]
                    )

                    await websocket.logs_subscribe(
                        filter_=filters,
                        commitment=Processed
                    )
                    logger.info("Subscribed to filtered transaction logs.")

                    async for msg in websocket:
                        if not self.is_running:
                            break

                        for result in msg:
                            if hasattr(result, 'value'):
                                value = result.value
                                signature = str(value.signature)
                                logs = value.logs

                                if any("Program log: Instruction: InitializeMint" in log for log in logs) or \
                                   any("Program log: Instruction: Create" in log for log in logs):
                                    logger.info(f"New token detected: {signature}")
                                    await self._process_new_token_transaction(signature)

                                await self._process_rugpull_indicators(signature, logs)

            except Exception as e:
                logger.error(f"Error in mempool monitoring: {e}")
                if self.is_running:
                    logger.info("Reconnecting in 5 seconds...")
                    await asyncio.sleep(5)

    async def _process_new_token_transaction(self, signature: str):
        """Processes transaction to extract token details."""
        try:
            # We need to find the token address. Usually it's in the instruction data.
            # For Pump.fun and Raydium, we can try to fetch the transaction and parse it.
            tx_response = self.solana_client.get_transaction(
                signature,
                encoding="jsonParsed",
                max_supported_transaction_version=0,
                commitment=Confirmed
            )
            
            if tx_response.value:
                # Heuristic: Find the first account that looks like a new mint or is involved in a 'Create'
                # This is a simplified extraction.
                meta = tx_response.value.transaction.meta
                token_address = None

                # Look for new token accounts in post_token_balances if they weren't in pre_token_balances
                pre_mints = {b.mint for b in meta.pre_token_balances} if meta.pre_token_balances else set()
                post_mints = {b.mint for b in meta.post_token_balances} if meta.post_token_balances else set()
                new_mints = post_mints - pre_mints

                if new_mints:
                    token_address = list(new_mints)[0]

                if token_address:
                    token_details = await data_fetcher_service.get_token_by_address(token_address)
                    if token_details:
                        logger.info(f"Emitting new token: {token_details['symbol']} ({token_address})")
                        if self.socketio:
                            self.socketio.emit('new_token', token_details)
                        return

                # Fallback to just sending the signature if we can't resolve the token yet
                if self.socketio:
                    self.socketio.emit('new_token', {'signature': signature, 'timestamp': datetime.now().isoformat()})
        except Exception as e:
            logger.error(f"Error processing new token {signature}: {e}")

    async def _process_rugpull_indicators(self, signature: str, logs: List[str]):
        """Analyzes logs for rugpull indicators."""
        indicators = ["withdraw", "remove_liquidity", "burn", "close_account"]
        for log in logs:
            if any(indicator in log.lower() for indicator in indicators):
                logger.warning(f"Rugpull indicator detected: {signature} - {log}")
                if self.socketio:
                    self.socketio.emit('rugpull_alert', {
                        'signature': signature,
                        'indicator': log,
                        'timestamp': datetime.now().isoformat()
                    })
                break

    async def start_monitoring(self):
        """Starts monitoring in the background."""
        if not self.is_running:
            self.is_running = True
            self.monitoring_task = asyncio.create_task(self._monitor_transactions())
            logger.info("Mempool monitoring service started.")

    async def stop_monitoring(self):
        """Stops monitoring."""
        self.is_running = False
        if self.monitoring_task:
            self.monitoring_task.cancel()
            logger.info("Mempool monitoring service stopped.")
