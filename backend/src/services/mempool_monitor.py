import logging
import asyncio
import json
from typing import Dict, Optional
from solana.rpc.websocket_api import SolanaWsClient
from solana.rpc.api import Client
from solana.rpc.commitment import Commitment, Confirmed
from solana.rpc.core import RPCException
from solders.pubkey import Pubkey
from solders.signature import Signature
from solders.transaction import Transaction as SoldersTransaction # Renamed to avoid conflict
from solders.instruction import CompiledInstruction
from solders.message import Message
from solders.system_program import ID as SYSTEM_PROGRAM_ID
from solders.token_program import ID as TOKEN_PROGRAM_ID
# from solders.token_program import instruction as token_instruction_parser # For parsing token instructions
# from spl.token.state import Mint

from config import SOLANA_RPC_URL, SOLANA_WS_URL
from services.data_fetcher import data_fetcher_service # To fetch token details

logger = logging.getLogger(__name__)

class MempoolMonitorService:
    """
    Service to monitor the Solana mempool for new token launches and potential rugpulls.
    Connects to a Solana RPC WebSocket to listen for new transactions.
    """

    PUMP_FUN_PROGRAM = Pubkey.from_string("6EF8rrecthR5DkZJv9RKzyAXYVqBCTs2Fmb7sK559pwt")
    RAYDIUM_LIQUIDITY_POOL_V4 = Pubkey.from_string("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8")

    def __init__(self, socketio=None):
        self.socketio = socketio
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
        Uses logs_subscribe to filter for relevant program IDs.
        """
        if not self.ws_client:
            await self._connect_websocket()
            if not self.ws_client:
                logger.error("WebSocket client not available for monitoring.")
                return

        logger.info("Starting filtered transaction monitoring...")
        try:
            # Subscribe to logs for Pump.fun and Raydium
            # logs_subscribe only accepts one filter at a time or 'all'
            # We'll subscribe to 'all' but filter efficiently in the loop, or use multiple subscriptions if needed.
            # However, many RPC providers allow filtering by mentions.

            # Since we can't easily do multiple filters in one call, we subscribe to all and filter here
            # for better performance than full transaction fetching.
            subscription_id = await self.ws_client.logs_subscribe(
                filter_='all', commitment=Commitment('processed')
            )
            logger.info(f"Subscribed to logs with ID: {subscription_id}")

            async for msg in self.ws_client:
                if msg and 'params' in msg and 'result' in msg['params']:
                    result = msg['params']['result']
                    value = result['value']
                    signature = value['signature']
                    logs = value['logs']

                    # Filter for Pump.fun or Raydium mentions in logs
                    is_relevant = any(str(self.PUMP_FUN_PROGRAM) in log or str(self.RAYDIUM_LIQUIDITY_POOL_V4) in log for log in logs)

                    if is_relevant:
                        # Check for new token creation (e.g., "Program log: Instruction: InitializeMint" or "Program log: Instruction: Create")
                        if any("InitializeMint" in log or "Create" in log for log in logs):
                            logger.info(f"Potential new token transaction detected on relevant program: {signature}")
                            await self._process_new_token_transaction(signature)

                        # Check for potential rugpulls
                        await self._process_rugpull_indicators(signature, logs)

        except RPCException as e:
            logger.error(f"RPC error during transaction monitoring: {e}")
        except Exception as e:
            logger.error(f"Error during transaction monitoring: {e}")
        finally:
            logger.info("Transaction monitoring stopped.")
            await self._disconnect_websocket()

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
                if instruction.program_id == TOKEN_PROGRAM_ID:
                    try:
                        parsed_instruction = token_instruction_parser.parse_token_instruction(instruction)
                        if parsed_instruction and parsed_instruction.instruction_type == "initializeMint":
                            mint_address = parsed_instruction.args.mint
                            logger.info(f"Confirmed new token mint: {mint_address}")
                            
                            token_details = await data_fetcher_service.get_token_by_address(str(mint_address))
                            
                            if token_details:
                                logger.info(f"New token details fetched: {token_details['symbol']} ({token_details['address']})")
                                if self.socketio:
                                    self.socketio.emit('new_token', token_details)
                            else:
                                logger.warning(f"Could not fetch details for new token mint: {mint_address}")
                            return # Found the mint instruction, no need to check other instructions
                    except Exception as parse_e:
                        logger.warning(f"Error parsing token instruction for new token: {parse_e}")

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
                if instruction.program_id == TOKEN_PROGRAM_ID:
                    try:
                        parsed_instruction = token_instruction_parser.parse_token_instruction(instruction)
                        
                        # Check for large token transfers
                        if parsed_instruction and parsed_instruction.instruction_type == "transfer":
                            source_account = parsed_instruction.args.source
                            destination_account = parsed_instruction.args.destination
                            amount = parsed_instruction.args.amount
                            mint = parsed_instruction.args.mint # This is the token mint address

                            # Get token decimals to convert amount to human-readable
                            decimals = await self._get_token_decimals(str(mint))
                            human_amount = amount / (10**decimals) if decimals is not None else amount

                            # For now, a heuristic: if amount is very large, it might be suspicious
                            if human_amount > 1_000_000: # Example threshold for large transfer
                                logger.warning(f"Large token transfer detected: {human_amount} from {source_account} to {destination_account} for mint {mint}")
                                if self.socketio:
                                    self.socketio.emit('rugpull_alert', {
                                        'signature': signature,
                                        'reason': 'Large token transfer',
                                        'details': {'amount': amount, 'mint': str(mint), 'from': str(source_account), 'to': str(destination_account)}
                                    })

                        # Check for token burns
                        elif parsed_instruction and parsed_instruction.instruction_type == "burn":
                            mint = parsed_instruction.args.mint
                            amount = parsed_instruction.args.amount
                            logger.warning(f"Token burn detected: {amount} of {mint}")
                            if self.socketio:
                                self.socketio.emit('rugpull_alert', {
                                    'signature': signature,
                                    'reason': 'Token burn',
                                    'details': {'amount': amount, 'mint': str(mint)}
                                })

                        # Check for close account (could indicate LP removal if it's an LP token account)
                        elif parsed_instruction and parsed_instruction.instruction_type == "closeAccount":
                            account_to_close = parsed_instruction.args.account
                            logger.warning(f"Token account closed: {account_to_close}")
                            if self.socketio:
                                self.socketio.emit('rugpull_alert', {
                                    'signature': signature,
                                    'reason': 'Token account closed',
                                    'details': {'account': str(account_to_close)}
                                })

                    except Exception as parse_e:
                        logger.warning(f"Error parsing token instruction for rugpull check: {parse_e}")

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

    async def _get_token_decimals(self, mint_address: str) -> Optional[int]:
        """Fetches decimals for a token mint"""
        try:
            pubkey = Pubkey.from_string(mint_address)
            info = self.solana_client.get_account_info(pubkey)
            if info.value:
                # Mint data layout: decimals at offset 44 (1 byte)
                data = info.value.data
                return data[44]
        except Exception as e:
            logger.error(f"Error fetching decimals for {mint_address}: {e}")
        return None

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