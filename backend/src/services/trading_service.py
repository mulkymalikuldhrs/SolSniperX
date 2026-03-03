import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
import httpx
import base64

from solana.rpc.api import Client
from solana.rpc.commitment import Confirmed, Processed
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction
from solders.signature import Signature

from config import SOLANA_RPC_URL
from services.wallet_service import wallet_service

logger = logging.getLogger(__name__)

JUPITER_API_BASE_URL = "https://quote-api.jup.ag/v6"

class TradingService:
    """
    Handles trading operations on Solana using Jupiter Aggregator.
    Includes robust transaction finality checks.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.solana_client = Client(SOLANA_RPC_URL)
        self.http_client = httpx.AsyncClient()

    async def _get_token_decimals(self, token_mint_address: str) -> Optional[int]:
        """Fetches decimals via byte slicing for performance and reliability."""
        try:
            mint_pubkey = Pubkey.from_string(token_mint_address)
            account_info = self.solana_client.get_account_info(mint_pubkey)
            if account_info.value:
                # Decimals are at offset 44 in the Mint account data
                data = account_info.value.data
                if len(data) >= 45:
                    return data[44]
            return None
        except Exception as e:
            logger.error(f"Error fetching decimals: {e}")
            return None

    async def _wait_for_confirmation(self, signature: str, max_retries: int = 20) -> bool:
        """Polls for transaction confirmation."""
        for _ in range(max_retries):
            try:
                sig = Signature.from_string(signature)
                status_response = self.solana_client.get_signature_statuses([sig])
                if status_response.value and status_response.value[0]:
                    status = status_response.value[0]
                    if status.confirmation_status in [str(Confirmed), "finalized"]:
                        if status.err:
                            logger.error(f"Transaction failed with error: {status.err}")
                            return False
                        return True
            except Exception as e:
                logger.warning(f"Error checking transaction status: {e}")
            await asyncio.sleep(2)
        return False

    async def _get_swap_instructions(self, input_mint: str, output_mint: str, amount: int, slippage_bps: int) -> Optional[Dict]:
        """Fetches swap quote and transaction from Jupiter."""
        if not wallet_service.wallet_address:
            return None

        try:
            params = {
                "inputMint": input_mint,
                "outputMint": output_mint,
                "amount": amount,
                "slippageBps": slippage_bps,
                "userPublicKey": str(wallet_service.wallet_address),
                "wrapAndUnwrapSol": True
            }

            quote_resp = await self.http_client.get(f"{JUPITER_API_BASE_URL}/quote", params=params)
            quote_resp.raise_for_status()
            quote_data = quote_resp.json()

            swap_payload = {
                "quoteResponse": quote_data,
                "userPublicKey": str(wallet_service.wallet_address),
                "wrapAndUnwrapSol": True,
                "prioritizationFeeLamports": "auto"
            }

            swap_resp = await self.http_client.post(f"{JUPITER_API_BASE_URL}/swap", json=swap_payload)
            swap_resp.raise_for_status()
            return swap_resp.json()

        except Exception as e:
            logger.error(f"Jupiter swap instruction error: {e}")
            return None

    async def execute_buy_order(self, token_address: str, amount_sol: float, slippage: float = 1.0) -> Dict:
        """Executes buy order and waits for confirmation."""
        if not wallet_service.wallet_keypair:
            return {"success": False, "message": "Wallet not initialized."}

        try:
            amount_lamports = int(amount_sol * 10**9)
            swap_data = await self._get_swap_instructions(
                "So11111111111111111111111111111111111111112",
                token_address,
                amount_lamports,
                int(slippage * 100)
            )

            if not swap_data:
                return {"success": False, "message": "Failed to fetch Jupiter swap."}

            tx_bytes = base64.b64decode(swap_data["swapTransaction"])
            tx = VersionedTransaction.from_bytes(tx_bytes)
            signed_tx = tx.sign([wallet_service.wallet_keypair])

            sig = self.solana_client.send_raw_transaction(bytes(signed_tx)).value
            logger.info(f"Buy transaction sent: {sig}")

            confirmed = await self._wait_for_confirmation(str(sig))
            if confirmed:
                logger.info(f"Buy transaction confirmed: {sig}")
                return {"success": True, "transaction_id": str(sig), "status": "confirmed"}
            else:
                return {"success": False, "message": "Transaction confirmation timed out.", "transaction_id": str(sig)}

        except Exception as e:
            logger.error(f"Buy execution failed: {e}")
            return {"success": False, "message": str(e)}

    async def execute_sell_order(self, token_address: str, amount_tokens: float, slippage: float = 1.0) -> Dict:
        """Executes sell order and waits for confirmation."""
        if not wallet_service.wallet_keypair:
            return {"success": False, "message": "Wallet not initialized."}

        try:
            decimals = await self._get_token_decimals(token_address)
            if decimals is None:
                return {"success": False, "message": "Could not determine token decimals."}

            amount_raw = int(amount_tokens * (10**decimals))
            swap_data = await self._get_swap_instructions(
                token_address,
                "So11111111111111111111111111111111111111112",
                amount_raw,
                int(slippage * 100)
            )

            if not swap_data:
                return {"success": False, "message": "Failed to fetch Jupiter swap."}

            tx_bytes = base64.b64decode(swap_data["swapTransaction"])
            tx = VersionedTransaction.from_bytes(tx_bytes)
            signed_tx = tx.sign([wallet_service.wallet_keypair])

            sig = self.solana_client.send_raw_transaction(bytes(signed_tx)).value
            logger.info(f"Sell transaction sent: {sig}")

            confirmed = await self._wait_for_confirmation(str(sig))
            if confirmed:
                logger.info(f"Sell transaction confirmed: {sig}")
                return {"success": True, "transaction_id": str(sig), "status": "confirmed"}
            else:
                return {"success": False, "message": "Transaction confirmation timed out.", "transaction_id": str(sig)}

        except Exception as e:
            logger.error(f"Sell execution failed: {e}")
            return {"success": False, "message": str(e)}

# Service initialized in main.py
