import logging
import asyncio
import json
from typing import Dict, Optional, List
from solana.rpc.websocket_api import connect
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Commitment, Confirmed, Processed
from solana.rpc.core import RPCException
from solders.pubkey import Pubkey
from solders.signature import Signature
from solders.rpc.config import RpcTransactionLogsFilterMentions
import base58

from config import SOLANA_RPC_URL, SOLANA_WS_URL
# Avoid circular import, import inside methods if needed
# from services.data_fetcher import data_fetcher_service

logger = logging.getLogger(__name__)

# Constants for common Solana programs
PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5DkZJv9RKzyAXYVqBCTs2Fmb7sK559pwt"
RAYDIUM_LIQUIDITY_POOL_V4_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

class MempoolMonitorService:
    """
    Service to monitor the Solana mempool for new token launches and potential rugpulls.
    Connects to a Solana RPC WebSocket to listen for new transactions with optimized filtering.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.async_solana_client = AsyncClient(SOLANA_RPC_URL)
        self.ws_client = None
        self.monitoring_task = None

    async def _monitor_transactions(self):
        """
        Monitors new transactions on the Solana network for new token launches and potential rugpulls.
        Uses a non-recursive while loop with exponential backoff for reconnection.
        """
        retry_delay = 1
        max_retry_delay = 60

        while True:
            try:
                logger.info(f"Connecting to Solana WebSocket: {SOLANA_WS_URL}")
                async with connect(SOLANA_WS_URL) as ws:
                    self.ws_client = ws
                    retry_delay = 1 # Reset retry delay on success

                    # Subscribe to logs involving Pump.fun and Raydium
                    await ws.logs_subscribe(
                        filter_=RpcTransactionLogsFilterMentions(Pubkey.from_string(PUMP_FUN_PROGRAM_ID)),
                        commitment=Processed
                    )
                    logger.info("Subscribed to Pump.fun logs.")

                    await ws.logs_subscribe(
                        filter_=RpcTransactionLogsFilterMentions(Pubkey.from_string(RAYDIUM_LIQUIDITY_POOL_V4_ID)),
                        commitment=Processed
                    )
                    logger.info("Subscribed to Raydium logs.")

                    async for msg in ws:
                        events = msg if isinstance(msg, list) else [msg]
                        for event in events:
                            try:
                                if hasattr(event, 'result') and event.result:
                                    value = event.result.value
                                    signature = str(value.signature)
                                    logs = value.logs
                                    await self._process_mempool_event(signature, logs)
                            except Exception as e:
                                logger.debug(f"Skipping malformed mempool event: {e}")
                                continue

            except Exception as e:
                logger.error(f"WebSocket connection error: {e}. Reconnecting in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, max_retry_delay)

    async def _process_mempool_event(self, signature: str, logs: List[str]):
        """
        Processes a mempool event based on transaction logs.
        """
        if any("initializeMint" in log for log in logs) or any("create" in log.lower() for log in logs):
            logger.info(f"Potential new token detected in tx: {signature}")
            await self._process_new_token_transaction(signature)

        await self._process_rugpull_indicators(signature, logs)

    async def _process_new_token_transaction(self, signature: str):
        """
        Identifies the new token mint address from transaction details.
        """
        try:
            # Using AsyncClient to avoid blocking the event loop
            tx_resp = await self.async_solana_client.get_transaction(
                Signature.from_string(signature),
                encoding="jsonParsed",
                commitment=Confirmed,
                max_supported_transaction_version=0
            )
            
            if not tx_resp or not tx_resp.value:
                return

            tx = tx_resp.value.transaction

            mint_address = None
            for ix in tx.transaction.message.instructions:
                if str(ix.program_id) == TOKEN_PROGRAM_ID:
                    if hasattr(ix, 'parsed') and ix.parsed.get('type') == 'initializeMint':
                        mint_address = ix.parsed['info']['mint']
                        break

            if mint_address:
                logger.info(f"Confirmed new token mint: {mint_address}")
                from services.data_fetcher import data_fetcher_service
                token_details = await data_fetcher_service.get_token_by_address(str(mint_address))
                if token_details and self.socketio:
                    self.socketio.emit('new_token', token_details)
        except Exception as e:
            logger.error(f"Error processing new token tx {signature}: {e}")

    async def _process_rugpull_indicators(self, signature: str, logs: List[str]):
        """
        Basic rugpull detection based on logs.
        """
        indicators = ["withdraw", "close account", "burn"]
        for log in logs:
            if any(indicator in log.lower() for indicator in indicators):
                logger.warning(f"Rugpull indicator detected in {signature}: {log}")
                if self.socketio:
                    self.socketio.emit('rugpull_alert', {
                        'signature': signature,
                        'reason': 'Suspicious log pattern',
                        'log': log
                    })
                break

    async def start_monitoring(self):
        if self.monitoring_task and not self.monitoring_task.done():
            return
        logger.info("Starting background mempool monitoring.")
        self.monitoring_task = asyncio.create_task(self._monitor_transactions())

    async def stop_monitoring(self):
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass
            self.monitoring_task = None
        logger.info("Mempool monitoring stopped.")

# Create singleton instance
mempool_monitor_service = MempoolMonitorService()
