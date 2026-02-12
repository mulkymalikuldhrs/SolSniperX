import logging
import asyncio
import json
from typing import Dict, Optional, List
from solana.rpc.websocket_api import SolanaWsClient
from solana.rpc.api import Client
from solana.rpc.commitment import Commitment, Confirmed, Processed
from solana.rpc.core import RPCException
from solders.pubkey import Pubkey
from solders.signature import Signature
from solders.transaction import Transaction as SoldersTransaction
from solders.instruction import CompiledInstruction
from solders.message import Message
from solders.system_program import ID as SYSTEM_PROGRAM_ID
from solders.token_program import ID as TOKEN_PROGRAM_ID

from config import SOLANA_RPC_URL, SOLANA_WS_URL
from services.data_fetcher import data_fetcher_service

logger = logging.getLogger(__name__)

PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5DkZJv9RKzyAXYVqBCTs2Fmb7sK559pwt"
RAYDIUM_PROGRAM_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"

class MempoolMonitorService:
    """
    Service to monitor the Solana mempool for new token launches and potential rugpulls.
    Optimized to filter by Pump.fun and Raydium programs.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.solana_client = Client(SOLANA_RPC_URL)
        self.ws_client: Optional[SolanaWsClient] = None
        self.monitoring_task = None

    async def _connect_websocket(self):
        try:
            self.ws_client = SolanaWsClient(SOLANA_WS_URL)
            await self.ws_client.connect()
            logger.info(f"Connected to Solana WebSocket: {SOLANA_WS_URL}")
        except Exception as e:
            logger.error(f"Failed to connect to Solana WebSocket: {e}")
            self.ws_client = None

    async def _disconnect_websocket(self):
        if self.ws_client:
            await self.ws_client.close()
            self.ws_client = None
            logger.info("Disconnected from Solana WebSocket.")

    async def _monitor_transactions(self):
        if not self.ws_client:
            await self._connect_websocket()
            if not self.ws_client:
                logger.error("WebSocket client not available.")
                return

        logger.info(f"Monitoring transactions for programs: {PUMP_FUN_PROGRAM_ID}, {RAYDIUM_PROGRAM_ID}")
        try:
            # Filtering by mentions of specific programs to reduce volume and noise
            subscription_id = await self.ws_client.logs_subscribe(
                filter_={'mentions': [PUMP_FUN_PROGRAM_ID, RAYDIUM_PROGRAM_ID]},
                commitment=Processed
            )
            logger.info(f"Subscribed to logs (ID: {subscription_id})")

            async for msg in self.ws_client:
                if msg and 'params' in msg and 'result' in msg['params']:
                    result = msg['params']['result']
                    value = result['value']
                    signature = value['signature']
                    logs = value['logs']

                    # Identify Pump.fun new token creation
                    if any("Program log: Instruction: Create" in log for log in logs) and any(PUMP_FUN_PROGRAM_ID in log for log in logs):
                        logger.info(f"New Pump.fun token detected: {signature}")
                        await self._process_new_token_transaction(signature, source="pump_fun")

                    # Identify Raydium LP addition (Initialize)
                    elif any("Program log: Instruction: Initialize" in log for log in logs) and any(RAYDIUM_PROGRAM_ID in log for log in logs):
                        logger.info(f"New Raydium pool detected: {signature}")
                        await self._process_new_token_transaction(signature, source="raydium")

                    # Check for rugpull indicators in these filtered transactions
                    await self._process_rugpull_indicators(signature, logs)

        except RPCException as e:
            logger.error(f"RPC error during monitoring: {e}")
        except Exception as e:
            logger.error(f"Error during monitoring: {e}")
        finally:
            logger.info("Monitoring stopped.")
            await self._disconnect_websocket()

    async def _process_new_token_transaction(self, signature: str, source: str):
        """
        Extracts mint address and fetches details.
        """
        try:
            transaction_response = self.solana_client.get_transaction(
                signature,
                encoding="jsonParsed",
                commitment=Confirmed
            )
            
            if not transaction_response.value or not transaction_response.value.transaction:
                return

            tx_data = transaction_response.value.transaction
            mint_address = None
            
            if source == "pump_fun":
                for instruction in tx_data.message.instructions:
                    if str(instruction.program_id) == PUMP_FUN_PROGRAM_ID:
                        if hasattr(instruction, 'accounts') and len(instruction.accounts) > 1:
                            mint_address = str(instruction.accounts[0]) # Mint is usually 1st
                            break

            elif source == "raydium":
                # Raydium Initialize instruction usually contains both token mints
                for instruction in tx_data.message.instructions:
                    if str(instruction.program_id) == RAYDIUM_PROGRAM_ID:
                        if hasattr(instruction, 'accounts') and len(instruction.accounts) > 9:
                            # Heuristic: baseTokenMint and quoteTokenMint are usually in accounts
                            # We check for the one that isn't WSOL
                            mint0 = str(instruction.accounts[8])
                            mint1 = str(instruction.accounts[9])
                            wsol = "So11111111111111111111111111111111111111112"
                            mint_address = mint0 if mint0 != wsol else mint1
                            break

            if mint_address:
                logger.info(f"Extracted mint {mint_address} from {source}")
                token_details = await data_fetcher_service.get_token_by_address(mint_address)
                if token_details:
                    token_details['source'] = source
                    if self.socketio:
                        self.socketio.emit('new_token', token_details)

        except Exception as e:
            logger.error(f"Error processing {source} transaction {signature}: {e}")

    async def _process_rugpull_indicators(self, signature: str, logs: List[str]):
        indicators = []
        for log in logs:
            if any(k in log for k in ["Withdraw", "WithdrawLiquidity", "RemoveLiquidity"]):
                indicators.append("Liquidity Withdrawal")
            if "Program log: Instruction: Burn" in log:
                indicators.append("Token Burn")

        if indicators:
            logger.warning(f"Rugpull indicators detected for {signature}: {indicators}")
            if self.socketio:
                self.socketio.emit('rugpull_alert', {
                    'signature': signature,
                    'reasons': indicators,
                    'timestamp': asyncio.get_event_loop().time()
                })

    async def start_monitoring(self):
        if self.monitoring_task and not self.monitoring_task.done():
            return
        self.monitoring_task = asyncio.create_task(self._monitor_transactions())

    async def stop_monitoring(self):
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try: await self.monitoring_task
            except asyncio.CancelledError: pass
            finally: self.monitoring_task = None
        await self._disconnect_websocket()

mempool_monitor_service = MempoolMonitorService()
