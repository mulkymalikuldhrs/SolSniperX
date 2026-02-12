import logging
import asyncio
import base64
from datetime import datetime
from typing import Dict, Any, Optional, List

import httpx
from solana.rpc.api import Client
from solana.rpc.commitment import Confirmed, Finalized
from solders.keypair import Keypair as SoldersKeypair
from solders.pubkey import Pubkey
from solders.signature import Signature
from solders.transaction import VersionedTransaction
from spl.token.constants import TOKEN_PROGRAM_ID
from spl.token.state import Mint

from config import SOLANA_RPC_URL
from services.wallet_service import wallet_service

logger = logging.getLogger(__name__)

JUPITER_API_BASE_URL = "https://quote-api.jup.ag/v6"

class TradingService:
    """
    Handles trading operations on Solana using Jupiter Aggregator.
    Ensures transaction finality and provides detailed results.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.solana_client = Client(SOLANA_RPC_URL)
        self.http_client = httpx.AsyncClient()

    async def _get_token_decimals(self, token_mint_address: str) -> Optional[int]:
        try:
            mint_pubkey = Pubkey.from_string(token_mint_address)
            account_info = self.solana_client.get_account_info(mint_pubkey)
            if account_info.value is None:
                return None
            mint_data = Mint.decode(account_info.value.data)
            return mint_data.decimals
        except Exception as e:
            logger.error(f"Error fetching decimals: {e}")
            return None

    async def _confirm_transaction(self, signature_str: str, max_retries: int = 30) -> bool:
        """
        Polls for transaction confirmation.
        """
        for _ in range(max_retries):
            try:
                sig = Signature.from_string(signature_str)
                status = self.solana_client.get_signature_statuses([sig])
                if status.value and status.value[0]:
                    if status.value[0].confirmation_status in ['confirmed', 'finalized']:
                        if status.value[0].err:
                            logger.error(f"Transaction {signature_str} failed with error: {status.value[0].err}")
                            return False
                        return True
            except Exception as e:
                logger.warning(f"Error checking status for {signature_str}: {e}")
            await asyncio.sleep(1)
        return False

    async def execute_buy_order(self, token_address: str, amount_sol: float, slippage: float = 1.0) -> Dict:
        if not wallet_service.wallet_keypair:
            return {"success": False, "message": "Wallet not initialized"}

        try:
            amount_lamports = int(amount_sol * 10**9)

            # 1. Get Quote
            quote_params = {
                "inputMint": "So11111111111111111111111111111111111111112",
                "outputMint": token_address,
                "amount": amount_lamports,
                "slippageBps": int(slippage * 100)
            }
            quote_resp = await self.http_client.get(f"{JUPITER_API_BASE_URL}/quote", params=quote_params)
            quote_resp.raise_for_status()
            quote_data = quote_resp.json()

            # 2. Get Swap Transaction
            swap_payload = {
                "quoteResponse": quote_data,
                "userPublicKey": str(wallet_service.wallet_address),
                "wrapAndUnwrapSol": True,
                "dynamicComputeUnitLimit": True,
                "prioritizationFeeLamports": "auto"
            }
            swap_resp = await self.http_client.post(f"{JUPITER_API_BASE_URL}/swap", json=swap_payload)
            swap_resp.raise_for_status()
            swap_data = swap_resp.json()

            # 3. Sign and Send
            raw_tx = base64.b64decode(swap_data["swapTransaction"])
            transaction = VersionedTransaction.from_bytes(raw_tx)
            signature = wallet_service.wallet_keypair.sign_message(transaction.message.serialize())
            signed_tx = VersionedTransaction(transaction.message, [signature])

            send_resp = self.solana_client.send_raw_transaction(bytes(signed_tx))
            tx_sig = str(send_resp.value)

            # 4. Confirm
            confirmed = await self._confirm_transaction(tx_sig)
            if not confirmed:
                return {"success": False, "message": "Transaction failed or timed out during confirmation", "tx_sig": tx_sig}

            result = {
                "success": True,
                "type": "buy",
                "token_address": token_address,
                "amount_sol": amount_sol,
                "transaction_id": tx_sig,
                "status": "confirmed",
                "timestamp": datetime.now().isoformat()
            }
            if self.socketio:
                self.socketio.emit('trade_executed', result)
            return result

        except Exception as e:
            logger.error(f"Buy order error: {e}")
            return {"success": False, "message": str(e)}

    async def execute_sell_order(self, token_address: str, amount_tokens: float, slippage: float = 1.0) -> Dict:
        if not wallet_service.wallet_keypair:
            return {"success": False, "message": "Wallet not initialized"}

        try:
            decimals = await self._get_token_decimals(token_address)
            if decimals is None: return {"success": False, "message": "Could not fetch decimals"}

            amount_smallest = int(amount_tokens * 10**decimals)

            # 1. Get Quote
            quote_params = {
                "inputMint": token_address,
                "outputMint": "So11111111111111111111111111111111111111112",
                "amount": amount_smallest,
                "slippageBps": int(slippage * 100)
            }
            quote_resp = await self.http_client.get(f"{JUPITER_API_BASE_URL}/quote", params=quote_params)
            quote_resp.raise_for_status()
            quote_data = quote_resp.json()

            # 2. Get Swap Transaction
            swap_payload = {
                "quoteResponse": quote_data,
                "userPublicKey": str(wallet_service.wallet_address),
                "wrapAndUnwrapSol": True,
                "dynamicComputeUnitLimit": True,
                "prioritizationFeeLamports": "auto"
            }
            swap_resp = await self.http_client.post(f"{JUPITER_API_BASE_URL}/swap", json=swap_payload)
            swap_resp.raise_for_status()
            swap_data = swap_resp.json()

            # 3. Sign and Send
            raw_tx = base64.b64decode(swap_data["swapTransaction"])
            transaction = VersionedTransaction.from_bytes(raw_tx)
            signature = wallet_service.wallet_keypair.sign_message(transaction.message.serialize())
            signed_tx = VersionedTransaction(transaction.message, [signature])

            send_resp = self.solana_client.send_raw_transaction(bytes(signed_tx))
            tx_sig = str(send_resp.value)

            # 4. Confirm
            confirmed = await self._confirm_transaction(tx_sig)
            if not confirmed:
                return {"success": False, "message": "Transaction failed or timed out", "tx_sig": tx_sig}

            result = {
                "success": True,
                "type": "sell",
                "token_address": token_address,
                "amount_tokens": amount_tokens,
                "transaction_id": tx_sig,
                "status": "confirmed",
                "timestamp": datetime.now().isoformat()
            }
            if self.socketio:
                self.socketio.emit('trade_executed', result)
            return result

        except Exception as e:
            logger.error(f"Sell order error: {e}")
            return {"success": False, "message": str(e)}
