# SolSniperX - AI-Powered Solana Memecoin Sniper Bot (v3.1.0)

SolSniperX is an advanced, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface.

### Key Features:

1.  **Real-time Token Detection:** Monitors Pump.fun, Birdeye, Dexscreener, and Solana Mempool for new token listings and early launches.
2.  **Advanced Mempool Filtering:** (v3.1.0) Filters noise and low-liquidity pairs directly in the mempool monitor based on SOL threshold and liquidity criteria.
3.  **AI-Powered Analysis:** Utilizes AI (LLM7) to assess token potential, including liquidity, market cap, holder distribution, and contract red flags.
4.  **Automated Trading Execution:** Executes buy/sell orders automatically based on AI signals, RugCheck scores, and configurable parameters.
5.  **Dynamic JITO Tip:** Implements competitive transaction execution via JITO Block Engine with dynamic tip estimation.
6.  **Anti-Rug Protection:** Real-time rugpull detection and emergency sell mechanisms.
7.  **Production Ready:** 100% mock-free implementation using real-world APIs (Jupiter V6, Birdeye, Dexscreener, RugCheck).

### Project Structure:

-   **`backend/`**: Flask API and background asyncio services.
-   **`frontend/`**: React application with real-time WebSocket updates.

### Environment Variables:
Create a `.env` file in the `backend` directory:
```
DEXSCREENER_API_KEY="YOUR_API_KEY"
BIRDEYE_API_KEY="YOUR_API_KEY"
LLM7_API_KEY="YOUR_API_KEY"
SOLANA_PRIVATE_KEY="YOUR_PRIVATE_KEY"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```
