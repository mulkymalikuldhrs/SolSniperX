# backend/src/config.py

import os

# API Keys (loaded from environment variables)
DEXSCREENER_API_KEY = os.getenv("DEXSCREENER_API_KEY")
BIRDEYE_API_KEY = os.getenv("BIRDEYE_API_KEY")
LLM7_API_KEY = os.getenv("LLM7_API_KEY")

# Solana Private Key (loaded from environment variable)
SOLANA_PRIVATE_KEY = os.getenv("SOLANA_PRIVATE_KEY")

# Base URLs for external APIs
DEXSCREENER_BASE_URL = "https://api.dexscreener.com/latest/dex"
BIRDEYE_BASE_URL = "https://public-api.birdeye.so/public"
LLM7_BASE_URL = "https://api.llm7.io/v1"

# Solana RPC URL
SOLANA_RPC_URL = os.getenv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com")
SOLANA_WS_URL = os.getenv("SOLANA_WS_URL", "wss://api.mainnet-beta.solana.com/")

# Known Program IDs
PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5DkZJv9RKzyAXYVqBCTs2Fmb7sK559pwt"
RAYDIUM_AMM_V4_PROGRAM_ID = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
