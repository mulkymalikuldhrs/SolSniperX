import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
import base64

from solana.rpc.api import Client
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solders.keypair import Keypair as SoldersKeypair
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction
from solders.message import Message
from solders.signature import Signature
from solders.rpc.config import RpcTransactionConfig

from config import SOLANA_RPC_URL
from services.wallet_service import wallet_service

logger = logging.getLogger(__name__)

JUPITER_API_BASE_URL = "https://quote-api.jup.ag/v6"
WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112"

class TradingService:
    """
    Service to handle actual trading operations on the Solana blockchain using Jupiter Aggregator.
    Integrated with Jupiter V6 API and implements transaction finality checks.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.solana_client = Client(SOLANA_RPC_URL)
        self.async_solana_client = AsyncClient(SOLANA_RPC_URL)
        self.http_client = httpx.AsyncClient()

    async def _get_token_decimals(self, token_mint_address: str) -> Optional[int]:
        """
        Fetches the decimals for a given token mint address from the Solana blockchain.
        Using direct byte slicing for robustness if SPL decode fails.
        """
        try:
            mint_pubkey = Pubkey.from_string(token_mint_address)
            # Use async client for non-blocking fetch
            resp = await self.async_solana_client.get_account_info(mint_pubkey)
            if resp.value is None:
                logger.warning(f"Mint account not found for {token_mint_address}")
                return None
            
            # The decimals are at offset 44 for SPL tokens
            data = resp.value.data
            if len(data) < 45:
                logger.warning(f"Insufficient data for mint {token_mint_address}")
                return None

            return int(data[44])
        except Exception as e:
            logger.error(f"Error fetching decimals for {token_mint_address}: {e}")
            return None

    async def _get_swap_instructions(self, input_mint: str, output_mint: str, amount: int, slippage_bps: int) -> Optional[Dict]:
        """
        Fetches swap instructions from Jupiter Aggregator V6.
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
            logger.info(f"Fetching Jupiter swap quote for {amount} {input_mint} to {output_mint}")
            response = await self.http_client.get(f"{JUPITER_API_BASE_URL}/quote", params=params)
            response.raise_for_status()
            quote_data = response.json()

            # Fetch the serialized transaction
            swap_payload = {
                "quoteResponse": quote_data,
                "userPublicKey": str(wallet_service.wallet_address),
                "wrapAndUnwrapSol": True,
                "prioritizationFeeLamports": "auto"
            }
            response = await self.http_client.post(f"{JUPITER_API_BASE_URL}/swap", json=swap_payload)
            response.raise_for_status()
            swap_data = response.json()

            return swap_data

        except Exception as e:
            logger.error(f"Error in _get_swap_instructions: {e}")
            return None

    async def _wait_for_confirmation(self, signature_str: str, max_retries: int = 15) -> bool:
        """
        Polls for transaction confirmation using get_signature_statuses.
        """
        try:
            signature = Signature.from_string(signature_str)
            for i in range(max_retries):
                # Use async client
                resp = await self.async_solana_client.get_signature_statuses([signature])
                if resp.value and resp.value[0]:
                    status = resp.value[0]
                    if status.confirmation_status in ['confirmed', 'finalized']:
                        if status.err:
                            logger.error(f"Transaction failed in status: {status.err}")
                            return False
                        return True
                await asyncio.sleep(2)
            return False
        except Exception as e:
            logger.error(f"Error polling for confirmation of {signature_str}: {e}")
            return False

    async def execute_buy_order(self, token_address: str, amount_sol: float, slippage: float = 1.0) -> Dict:
        """
        Executes a buy order for a given token using SOL via Jupiter Aggregator.
        """
        if not wallet_service.wallet_keypair or not wallet_service.wallet_address:
            return {"success": False, "message": "Wallet not initialized."}

        try:
            amount_lamports = int(amount_sol * 10**9)
            slippage_bps = int(slippage * 100)

            swap_data = await self._get_swap_instructions(
                input_mint=WRAPPED_SOL_MINT,
                output_mint=token_address,
                amount=amount_lamports,
                slippage_bps=slippage_bps
            )

            if not swap_data:
                return {"success": False, "message": "Failed to get swap instructions from Jupiter."}

            serialized_transaction = base64.b64decode(swap_data["swapTransaction"])
            transaction = VersionedTransaction.from_bytes(serialized_transaction)
            signed_transaction = transaction.sign([wallet_service.wallet_keypair])

            # Use async client
            tx_resp = await self.async_solana_client.send_raw_transaction(bytes(signed_transaction))
            tx_signature = str(tx_resp.value)
            logger.info(f"Buy Transaction sent: {tx_signature}")

            confirmed = await self._wait_for_confirmation(tx_signature)
            if not confirmed:
                return {"success": False, "message": "Transaction confirmation timed out or failed.", "transaction_id": tx_signature}

            trade_data = {
                "type": "buy",
                "token_address": token_address,
                "amount_sol": amount_sol,
                "transaction_id": tx_signature,
                "status": "confirmed",
                "timestamp": datetime.now().isoformat()
            }
            if self.socketio:
                self.socketio.emit('trade_executed', trade_data)
            return {"success": True, "message": f"Successfully bought {amount_sol} SOL of {token_address}", "transaction_id": tx_signature}

        except Exception as e:
            logger.error(f"Error executing buy order: {str(e)}")
            return {"success": False, "message": f"Failed to execute buy order: {str(e)}"}

    async def execute_sell_order(self, token_address: str, amount_tokens: float, slippage: float = 1.0) -> Dict:
        """
        Executes a sell order for a given token to SOL via Jupiter Aggregator.
        """
        if not wallet_service.wallet_keypair or not wallet_service.wallet_address:
            return {"success": False, "message": "Wallet not initialized."}

        try:
            token_decimals = await self._get_token_decimals(token_address)
            if token_decimals is None:
                return {"success": False, "message": f"Could not determine decimals for {token_address}."}

            amount_smallest_unit = int(amount_tokens * (10**token_decimals))
            slippage_bps = int(slippage * 100)

            swap_data = await self._get_swap_instructions(
                input_mint=token_address,
                output_mint=WRAPPED_SOL_MINT,
                amount=amount_smallest_unit,
                slippage_bps=slippage_bps
            )

            if not swap_data:
                return {"success": False, "message": "Failed to get swap instructions from Jupiter."}

            serialized_transaction = base64.b64decode(swap_data["swapTransaction"])
            transaction = VersionedTransaction.from_bytes(serialized_transaction)
            signed_transaction = transaction.sign([wallet_service.wallet_keypair])

            # Use async client
            tx_resp = await self.async_solana_client.send_raw_transaction(bytes(signed_transaction))
            tx_signature = str(tx_resp.value)
            logger.info(f"Sell Transaction sent: {tx_signature}")

            confirmed = await self._wait_for_confirmation(tx_signature)
            if not confirmed:
                return {"success": False, "message": "Transaction confirmation timed out or failed.", "transaction_id": tx_signature}

            trade_data = {
                "type": "sell",
                "token_address": token_address,
                "amount_tokens": amount_tokens,
                "transaction_id": tx_signature,
                "status": "confirmed",
                "timestamp": datetime.now().isoformat()
            }
            if self.socketio:
                self.socketio.emit('trade_executed', trade_data)
            return {"success": True, "message": f"Successfully sold {amount_tokens} {token_address}", "transaction_id": tx_signature}

        except Exception as e:
            logger.error(f"Error executing sell order: {str(e)}")
            return {"success": False, "message": f"Failed to execute sell order: {str(e)}"}

# trading_service singleton instantiation handled in main.py
