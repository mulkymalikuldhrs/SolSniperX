## SolSniperX - AI-Powered Solana Memecoin Sniper Bot

SolSniperX is an advanced, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface.

### Key Features:

1.  **Real-time Token Detection:** Monitors Pump.fun, Raydium, Birdeye, Dexscreener, and Solana Mempool for new token listings and early launches.
2.  **AI-Powered Analysis:** Utilizes AI to assess token potential, including liquidity, market cap, holder distribution, and contract red flags.
3.  **Automated Trading Execution:** Executes buy orders automatically based on predefined parameters and can auto-sell at target profits or stop-loss.
4.  **Anti-Rug Protection:** Implements automatic cut-loss mechanisms if liquidity withdrawal or token burns are detected.
5.  **Secure Wallet Management:** Connects directly to a single Solana wallet using a private key provided via environment variable. No traditional login or registration is required.
6.  **Real-time Dashboard:** Track PnL, success rate, active positions, and recent trades in real-time via WebSocket (Socket.IO).
7.  **Jupiter V6 Integration:** Uses Jupiter Aggregator for optimized swaps and best pricing.

### Project Structure:

-   **`backend/`**: Flask API for token data, AI analysis, trading logic, and Solana blockchain interaction.
    -   `src/main.py`: Main Flask application.
    -   `src/services/mempool_monitor.py`: Optimized filtering for Pump.fun and Raydium.
    -   `src/services/trading_service.py`: Real swap execution with Jupiter V6 and confirmation logic.
    -   `src/services/auto_trader.py`: Automated strategy with real balance tracking.
    -   `src/routes/analytics.py`: Real-time performance and history API.
-   **`frontend/`**: React application for the user interface.
    -   `src/contexts/WebSocketContext.jsx`: Real-time communication via Socket.IO.
    -   `src/pages/DashboardPage.jsx`: Real-time performance overview.
    -   `src/pages/TradingPage.jsx`: Trading terminal with bot control and manual trades.

### Installation & Setup:

#### Prerequisites:
- Python 3.11+
- Node.js (for pnpm)
- pnpm

#### Environment Variables:
Create a `.env` file in the `backend` directory:
```
DEXSCREENER_API_KEY="YOUR_DEXSCREENER_API_KEY"
BIRDEYE_API_KEY="YOUR_BIRDEYE_API_KEY"
LLM7_API_KEY="YOUR_LLM7_API_KEY"
SOLANA_PRIVATE_KEY="YOUR_SOLANA_WALLET_PRIVATE_KEY_BASE58_ENCODED"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```

#### Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

#### Frontend:
```bash
cd frontend
pnpm install
pnpm run dev
```

### Development:
Use `start_dev.sh` to start both servers simultaneously.

### Creator:
**Mulky Malikul Dhaher**
Contact: mulkymalikuldhr@mail.com
