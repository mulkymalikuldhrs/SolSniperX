import logging
import os
from typing import Dict, Any, Optional, List
from solana.rpc.api import Client
from solana.keypair import Keypair
# from solana.publickey import PublicKey # Use solders types directly
from solana.rpc.types import TokenAccountOpts
from spl.token.client import Token
from spl.token.instructions import get_associated_token_address
from spl.token.state import AccountInfo as SplTokenAccountInfo
from solders.pubkey import Pubkey
from solders.keypair import Keypair as SoldersKeypair
from solders.system_program import TransferParams, transfer
from solders.transaction import Transaction
from solders.compute_budget import set_compute_unit_limit, set_compute_unit_price
import base58
import asyncio
from datetime import datetime

from config import SOLANA_PRIVATE_KEY, SOLANA_RPC_URL

logger = logging.getLogger(__name__)

class WalletService:
    """
    Service to handle actual Solana wallet management using a private key.
    """

    def __init__(self, socketio=None):
        self.socketio = socketio
        self.solana_client = Client(SOLANA_RPC_URL)
        self.wallet_keypair: Optional[SoldersKeypair] = None
        self.wallet_address: Optional[Pubkey] = None
        self._initialize_wallet()

    def _initialize_wallet(self):
        if not SOLANA_PRIVATE_KEY:
            logger.error("SOLANA_PRIVATE_KEY environment variable not set. Wallet service will not function.")
            return

        try:
            # Decode the base58 private key
            private_key_bytes = base58.b58decode(SOLANA_PRIVATE_KEY)
            # Create a SoldersKeypair from the decoded bytes
            self.wallet_keypair = SoldersKeypair.from_bytes(private_key_bytes)
            self.wallet_address = self.wallet_keypair.pubkey()
            logger.info(f"Wallet initialized with address: {self.wallet_address}")
        except Exception as e:
            logger.error(f"Error initializing wallet from private key: {e}")
            self.wallet_keypair = None
            self.wallet_address = None

    async def get_wallet_info(self) -> Optional[Dict]:
        """
        Retrieves information about the initialized wallet.
        """
        if not self.wallet_address:
            logger.warning("Wallet not initialized. Cannot fetch wallet info.")
            return None

        try:
            balance_response = self.solana_client.get_balance(self.wallet_address)
            sol_balance = balance_response.value / 10**9  # Convert lamports to SOL

            # Fetch token accounts
            token_accounts_response = self.solana_client.get_token_accounts_by_owner(
                self.wallet_address,
                TokenAccountOpts(program_id=Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5mW")),
            )
            tokens = []
            for account_info in token_accounts_response.value:
                pubkey = account_info.pubkey
                try:
                    # Correctly parse the SPL token account data
                    account_info_data = SplTokenAccountInfo.from_bytes(account_info.account.data)
                    mint = str(account_info_data.mint)
                    amount = account_info_data.amount
 
                    # To get decimals, we would need another call, which can be slow.
                    # For now, we'll assume we can fetch it later or display the raw amount.
                    # A better approach would be to have a token metadata cache.
                    tokens.append({
                        "account_address": str(pubkey),
                        "mint_address": mint,
                        "balance_raw": amount,
                        "balance": 0, # Placeholder for balance with decimals
                        "usd_value": 0.0 # Placeholder
                    })
                except Exception as e:
                    logger.warning(f"Could not parse token account {pubkey}: {e}")

            # TODO: Fetch USD value for SOL and tokens
            usd_value = sol_balance * 0 # Placeholder for actual SOL price
            total_value_usd = usd_value + sum(t["usd_value"] for t in tokens)

            wallet_info = {
                "address": str(self.wallet_address),
                "sol_balance": sol_balance,
                "usd_value": usd_value,
                "tokens": tokens,
                "total_value_usd": total_value_usd,
                "last_updated": datetime.now().isoformat()
            }
            return wallet_info
        except Exception as e:
            logger.error(f"Error fetching wallet info for {self.wallet_address}: {e}")
            return None

    async def get_wallet_balance(self) -> Dict:
        """
        Gets the balance of the initialized wallet.
        """
        wallet_info = await self.get_wallet_info()
        if wallet_info:
            return {
                'sol_balance': wallet_info['sol_balance'],
                'usd_value': wallet_info['usd_value'],
                'tokens': wallet_info['tokens'],
                'total_value_usd': wallet_info['total_value_usd'],
                'last_updated': wallet_info['last_updated']
            }
        return {'sol_balance': 0, 'usd_value': 0, 'tokens': [], 'total_value_usd': 0, 'last_updated': datetime.now().isoformat()}

    # Removed simulated wallet management functions (add_wallet, update_wallet, delete_wallet)
    # as they are no longer relevant for a single, private-key-based wallet.

# Create a singleton instance
# wallet_service = WalletService() # Instantiation will be handled in main.py