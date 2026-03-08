import logging
import asyncio
import json
from typing import Dict, Optional
from solana.rpc.websocket_api import SolanaWsClient, connect
from solana.rpc.api import Client
from solana.rpc.commitment import Commitment, Confirmed
from solana.rpc.core import RPCException
from solders.rpc.config import RpcTransactionLogsFilterMentions
from solders.pubkey import Pubkey
from solders.signature import Signature
from solders.transaction import Transaction as SoldersTransaction # Renamed to avoid conflict
from solders.instruction import CompiledInstruction
from solders.message import Message
from solders.system_program import ID as SYSTEM_PROGRAM_ID
from solders.token_program import ID as TOKEN_PROGRAM_ID

from config import SOLANA_RPC_URL, SOLANA_WS_URL

logger = logging.getLogger(__name__)

PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5DkZJv9RKzyAXYVqBCTs2Fmb7sK559pwt"
RAYDIUM_LIQUIDITY_POOL_V4_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"

class MempoolMonitorService:
    """
    Service to monitor the Solana mempool for new token launches and potential rugpulls.
    Connects to a Solana RPC WebSocket to listen for new transactions.
    """

    def __init__(self, socketio=None, data_fetcher_service=None):
        self.socketio = socketio
        self.data_fetcher_service = data_fetcher_service
        self.solana_client = Client(SOLANA_RPC_URL)
        self.ws_client: Optional[SolanaWsClient] = None
        self.monitoring_task = None

    async def _connect_websocket(self):
        """
        Establishes a WebSocket connection to the Solana RPC.
        """
        try:
            self.ws_client = SolanaWsClient(SOLANA_WS_URL)
            await self.ws_client.connect()
            logger.info(f"Connected to Solana WebSocket: {SOLANA_WS_URL}")
        except Exception as e:
            logger.error(f"Failed to connect to Solana WebSocket: {e}")
            self.ws_client = None

    async def _disconnect_websocket(self):
        """
        Closes the WebSocket connection.
        """
        if self.ws_client:
            await self.ws_client.close()
            self.ws_client = None
            logger.info("Disconnected from Solana WebSocket.")

    async def _monitor_transactions(self):
        """
        Monitors new transactions on the Solana network for new token launches and potential rugpulls.
        Uses a reconnection loop with exponential backoff.
        """
        retry_delay = 1
        max_retry_delay = 60

        while True:
            try:
                async with connect(SOLANA_WS_URL) as ws:
                    logger.info(f"Connected to Solana WebSocket: {SOLANA_WS_URL}")
                    self.ws_client = ws
                    retry_delay = 1 # Reset retry delay on successful connection

                    # Filter for Pump.fun and Raydium to reduce load
                    # Note: Multiple filters might require multiple subscriptions depending on RPC
                    # Here we use RpcTransactionLogsFilterMentions for Pump.fun as an example
                    await ws.logs_subscribe(
                        filter_=RpcTransactionLogsFilterMentions(Pubkey.from_string(PUMP_FUN_PROGRAM_ID)),
                        commitment=Commitment('processed')
                    )
                    logger.info("Subscribed to Pump.fun logs.")

                    async for msg in ws:
                        # Handle different possible message formats from solana-py WebSocket
                        if isinstance(msg, list):
                            events = msg
                        else:
                            events = [msg]

                        for event in events:
                            try:
                                # Check for the 'result' attribute which contains the log data in newer solana-py
                                if hasattr(event, 'result') and event.result:
                                    value = event.result.value
                                    signature = str(value.signature)
                                    logs = value.logs
                                    await self._process_mempool_event(signature, logs)
                                # Fallback for dictionary-like access if the object doesn't have the attribute
                                elif isinstance(event, dict) and 'params' in event:
                                    result = event['params']['result']['value']
                                    signature = result['signature']
                                    logs = result['logs']
                                    await self._process_mempool_event(signature, logs)
                            except (AttributeError, KeyError, TypeError) as e:
                                logger.debug(f"Skipping non-log message or malformed event: {e}")
                                continue

            except Exception as e:
                logger.error(f"WebSocket connection error: {e}. Retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, max_retry_delay)

    async def _process_mempool_event(self, signature: str, logs: list):
        # Check for potential token creation (initializeMint)
        if any("initializeMint" in log for log in logs) or any("create" in log.lower() for log in logs):
            logger.info(f"Potential new token transaction detected: {signature}")
            await self._process_new_token_transaction(signature)

        # Check for potential rugpulls
        await self._process_rugpull_indicators(signature, logs)

    async def _process_new_token_transaction(self, signature: str):
        """
        Fetches and processes transaction details to identify new token mints.
        """
        try:
            transaction_response = self.solana_client.get_transaction(
                signature,
                encoding="jsonParsed",
                commitment=Confirmed
            )
            
            transaction_data = transaction_response.value.transaction
            if not transaction_data or not transaction_data.meta:
                logger.warning(f"No transaction data or meta for signature {signature}")
                return

            for instruction in transaction_data.transaction.message.instructions:
                if str(instruction.program_id) == str(TOKEN_PROGRAM_ID):
                    # Manual instruction parsing
                    # initializeMint is often instruction 0
                    data = instruction.data
                    if data and data[0] == 0: # 0 is initializeMint
                        # Mint address is usually in accounts
                        mint_address = instruction.accounts[0]
                        logger.info(f"Confirmed new token mint: {mint_address}")

                        token_details = await self.data_fetcher_service.get_token_by_address(str(mint_address))

                        if token_details:
                            logger.info(f"New token details fetched: {token_details['symbol']} ({token_details['address']})")
                            if self.socketio:
                                self.socketio.emit('new_token', token_details)
                        else:
                            logger.warning(f"Could not fetch details for new token mint: {mint_address}")
                        return

        except RPCException as tx_e:
            logger.error(f"RPC error fetching transaction {signature} for new token: {tx_e}")
        except Exception as tx_e:
            logger.error(f"Error processing new token transaction {signature}: {tx_e}")

    async def _process_rugpull_indicators(self, signature: str, logs: list):
        """
        Analyzes transaction logs and instructions for potential rugpull indicators.
        """
        # Simplified checks for now. Real rugpull detection is complex.
        # Look for large token transfers, LP removal, or token burns.

        # Check logs for common rugpull phrases (very basic)
        for log in logs:
            if "withdraw liquidity" in log.lower() or "burn" in log.lower() or "close account" in log.lower():
                logger.warning(f"Potential rugpull indicator in logs for {signature}: {log}")
                if self.socketio:
                    self.socketio.emit('rugpull_alert', {
                        'signature': signature,
                        'reason': 'Keyword detected in logs',
                        'log_message': log
                    })
                return # Alert once per transaction

        try:
            transaction_response = self.solana_client.get_transaction(
                signature,
                encoding="jsonParsed",
                commitment=Confirmed
            )
            
            transaction_data = transaction_response.value.transaction
            if not transaction_data or not transaction_data.meta:
                return

            for instruction in transaction_data.transaction.message.instructions:
                if str(instruction.program_id) == str(TOKEN_PROGRAM_ID):
                    data = instruction.data
                    if not data: continue
                    instruction_type = data[0]

                    # 3 is Transfer, 12 is TransferChecked
                    if instruction_type in [3, 12]:
                        # Basic heuristic for rugpull detection
                        pass

                    # 8 is Burn
                    elif instruction_type == 8:
                        logger.warning(f"Token burn detected in {signature}")
                        if self.socketio:
                            self.socketio.emit('rugpull_alert', {
                                'signature': signature,
                                'reason': 'Token burn detected'
                            })

                    # 9 is CloseAccount
                    elif instruction_type == 9:
                        logger.warning(f"Token account closed in {signature}")
                        if self.socketio:
                            self.socketio.emit('rugpull_alert', {
                                'signature': signature,
                                'reason': 'Token account closed'
                            })

        except RPCException as tx_e:
            logger.error(f"RPC error fetching transaction {signature} for rugpull check: {tx_e}")
        except Exception as tx_e:
            logger.error(f"Error processing transaction {signature} for rugpull check: {tx_e}")

    async def start_monitoring(self):
        """
        Starts the background task for mempool monitoring.
        """
        if self.monitoring_task and not self.monitoring_task.done():
            logger.info("Mempool monitoring already running.")
            return
        logger.info("Starting mempool monitoring task.")
        self.monitoring_task = asyncio.create_task(self._monitor_transactions())

    async def stop_monitoring(self):
        """
        Stops the background task for mempool monitoring.
        """
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                logger.info("Mempool monitoring task cancelled.")
            finally:
                self.monitoring_task = None
        await self._disconnect_websocket()

    async def monitor_new_tokens(self) -> Optional[Dict]:
        """
        This method is kept for API compatibility but the actual monitoring
        is done in the background task. It will return None as it's not
        designed for a single-shot check anymore.
        """
        logger.debug("monitor_new_tokens called. Monitoring runs in background.")
        return None

# Create a singleton instance
mempool_monitor_service = MempoolMonitorService()