import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
import base64

from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solders.keypair import Keypair as SoldersKeypair
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction
from solders.signature import Signature
from solders.message import Message

from config import SOLANA_RPC_URL
from services.wallet_service import wallet_service

logger = logging.getLogger(__name__)

JUPITER_API_BASE_URL = "https://quote-api.jup.ag/v6"

class TradingService:
    """
    Service to handle actual trading operations on the Solana blockchain using Jupiter Aggregator.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.solana_client = AsyncClient(SOLANA_RPC_URL)
        self.http_client = httpx.AsyncClient()

    async def _get_token_decimals(self, token_mint_address: str) -> Optional[int]:
        """
        Fetches the decimals for a given token mint address from the Solana blockchain.
        """
        try:
            mint_pubkey = Pubkey.from_string(token_mint_address)
            response = await self.solana_client.get_account_info(mint_pubkey)
            if response.value is None:
                logger.warning(f"Mint account not found for {token_mint_address}")
                return None
            
            # Decode the mint account data (decimals at offset 44)
            data = response.value.data
            if len(data) >= 45:
                return data[44]
            return None
        except Exception as e:
            logger.error(f"Error fetching decimals for {token_mint_address}: {e}")
            return None

    async def _get_swap_instructions(self, input_mint: str, output_mint: str, amount: int, slippage_bps: int) -> Optional[Dict]:
        """
        Fetches swap instructions from Jupiter Aggregator.
        amount is in lamports (for SOL) or smallest unit (for tokens).
        slippage_bps is slippage in basis points (e.g., 50 for 0.5%).
        """
        if not wallet_service.wallet_address:
            logger.error("Wallet address not available for Jupiter swap.")
            return None

        params = {
            "inputMint": input_mint,
            "outputMint": output_mint,
            "amount": amount,
            "slippageBps": slippage_bps,
            "swapMode": "ExactIn",
            "userPublicKey": str(wallet_service.wallet_address),
            "wrapUnwrapSOL": True
        }

        try:
            logger.info(f"Fetching Jupiter swap quote with params: {params}")
            response = await self.http_client.get(f"{JUPITER_API_BASE_URL}/quote", params=params)
            response.raise_for_status()
            quote_data = response.json()

            if not quote_data:
                logger.error(f"No swap quote found from Jupiter: {quote_data}")
                return None

            # Fetch the serialized transaction
            logger.info("Fetching Jupiter swap transaction...")
            swap_payload = {
                "quoteResponse": quote_data,
                "userPublicKey": str(wallet_service.wallet_address),
                "wrapAndUnwrapSol": True,
                "prioritizationFeeLamports": "auto"
            }
            response = await self.http_client.post(f"{JUPITER_API_BASE_URL}/swap", json=swap_payload)
            response.raise_for_status()
            swap_data = response.json()

            if "swapTransaction" not in swap_data:
                logger.error(f"No swap transaction found from Jupiter: {swap_data}")
                return None

            return swap_data

        except httpx.RequestError as e:
            logger.error(f"Error fetching Jupiter swap instructions: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in _get_swap_instructions: {e}")
            return None

    async def execute_buy_order(self, token_address: str, amount_sol: float, slippage: float = 1.0) -> Dict:
        """
        Executes a buy order for a given token using SOL via Jupiter Aggregator.
        """
        if not wallet_service.wallet_keypair or not wallet_service.wallet_address:
            return {"success": False, "message": "Wallet not initialized. Cannot execute buy order."}

        logger.info(f"Executing BUY order for {token_address}: {amount_sol} SOL with {slippage}% slippage.")

        try:
            amount_lamports = int(amount_sol * 10**9)
            slippage_bps = int(slippage * 100)

            swap_data = await self._get_swap_instructions(
                input_mint="So11111111111111111111111111111111111111112",
                output_mint=token_address,
                amount=amount_lamports,
                slippage_bps=slippage_bps
            )

            if not swap_data:
                return {"success": False, "message": "Failed to get swap instructions from Jupiter."}

            serialized_transaction = base64.b64decode(swap_data["swapTransaction"])
            transaction = VersionedTransaction.from_bytes(serialized_transaction)
            signed_transaction = transaction.sign([wallet_service.wallet_keypair])

            response = await self.solana_client.send_raw_transaction(bytes(signed_transaction))
            tx_signature = response.value
            logger.info(f"Transaction sent: {tx_signature}")

            # Confirm transaction
            confirmed = await self._confirm_transaction(tx_signature)
            if not confirmed:
                logger.warning(f"Transaction not confirmed after timeout: {tx_signature}")

            transaction_id = str(tx_signature)
            trade_data = {
                "type": "buy",
                "token_address": token_address,
                "amount_sol": amount_sol,
                "slippage": slippage,
                "transaction_id": transaction_id,
                "status": "confirmed" if confirmed else "pending",
                "timestamp": datetime.now().isoformat()
            }
            if self.socketio:
                self.socketio.emit('trade_executed', trade_data)
            return {"success": True, "message": f"Successfully bought {amount_sol} SOL worth of {token_address}", "transaction_id": transaction_id, "token_address": token_address, "amount_sol": amount_sol, "slippage": slippage, "status": "confirmed" if confirmed else "pending"}

        except Exception as e:
            logger.error(f"Error executing buy order: {str(e)}")
            return {"success": False, "message": f"Failed to execute buy order: {str(e)}", "token_address": token_address, "amount_sol": amount_sol, "slippage": slippage, "status": "failed"}

    async def execute_sell_order(self, token_address: str, amount_tokens: float, slippage: float = 1.0) -> Dict:
        """
        Executes a sell order for a given token to SOL via Jupiter Aggregator.
        """
        if not wallet_service.wallet_keypair or not wallet_service.wallet_address:
            return {"success": False, "message": "Wallet not initialized. Cannot execute sell order."}

        logger.info(f"Executing SELL order for {token_address}: {amount_tokens} tokens with {slippage}% slippage.")

        try:
            token_decimals = await self._get_token_decimals(token_address)
            if token_decimals is None:
                return {"success": False, "message": f"Could not determine decimals for token {token_address}."}

            amount_smallest_unit = int(amount_tokens * (10**token_decimals))
            slippage_bps = int(slippage * 100)

            swap_data = await self._get_swap_instructions(
                input_mint=token_address,
                output_mint="So11111111111111111111111111111111111111112",
                amount=amount_smallest_unit,
                slippage_bps=slippage_bps
            )

            if not swap_data:
                return {"success": False, "message": "Failed to get swap instructions from Jupiter."}

            serialized_transaction = base64.b64decode(swap_data["swapTransaction"])
            transaction = VersionedTransaction.from_bytes(serialized_transaction)
            signed_transaction = transaction.sign([wallet_service.wallet_keypair])

            response = await self.solana_client.send_raw_transaction(bytes(signed_transaction))
            tx_signature = response.value
            logger.info(f"Transaction sent: {tx_signature}")

            confirmed = await self._confirm_transaction(tx_signature)
            if not confirmed:
                logger.warning(f"Transaction not confirmed after timeout: {tx_signature}")

            transaction_id = str(tx_signature)
            trade_data = {
                "type": "sell",
                "token_address": token_address,
                "amount_tokens": amount_tokens,
                "slippage": slippage,
                "transaction_id": transaction_id,
                "status": "confirmed" if confirmed else "pending",
                "timestamp": datetime.now().isoformat()
            }
            if self.socketio:
                self.socketio.emit('trade_executed', trade_data)
            return {"success": True, "message": f"Successfully sold {amount_tokens} tokens", "transaction_id": transaction_id, "token_address": token_address, "amount_tokens": amount_tokens, "slippage": slippage, "status": "confirmed" if confirmed else "pending"}

        except Exception as e:
            logger.error(f"Error executing sell order: {str(e)}")
            return {"success": False, "message": f"Failed to execute sell order: {str(e)}", "token_address": token_address, "amount_tokens": amount_tokens, "slippage": slippage, "status": "failed"}

    async def _confirm_transaction(self, signature: Signature, timeout: int = 60, interval: int = 2) -> bool:
        """
        Polls for transaction confirmation.
        """
        start_time = datetime.now().timestamp()
        while (datetime.now().timestamp() - start_time) < timeout:
            try:
                response = await self.solana_client.get_signature_statuses([signature])
                if response.value and response.value[0]:
                    status = response.value[0]
                    if status.confirmations is not None or status.err is None:
                        return True
            except Exception as e:
                logger.debug(f"Error polling signature status: {e}")
            await asyncio.sleep(interval)
        return False
