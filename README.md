## SolSniperX v2.9.0 - Ultimate Consolidated Upgrade AI-Powered Solana Memecoin Sniper Bot

SolSniperX is an advanced, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface.

### Key Features:

1.  **Real-time Token Detection:** Monitors Pump.fun, Birdeye, Dexscreener, and Solana Mempool for new token listings and early launches using optimized WebSocket connections.
2.  **AI-Powered Analysis:** Utilizes AI (LLM7) to assess token potential, including liquidity, market cap, holder distribution, dev wallet activity, and contract red flags. The LLM informs automated buy/sell decisions and anti-rugpull strategies.
3.  **Automated Trading Execution:** Executes buy orders automatically based on predefined parameters and auto-sells at target profits (take-profit, stop-loss, trailing stop-loss).
4.  **Anti-Rug Protection:** Implements automatic cut-loss mechanisms if dev sells, LP is pulled, or significant price dumps occur, detected in real-time from the mempool.
5.  **Secure Wallet Management (Private Key Based):** Connects directly to a Solana wallet using a private key provided via environment variable. No traditional login or registration is required.
6.  **Intuitive Web Dashboard:** Provides a sleek, responsive, and interactive user interface with live watchlist, token detail view, wallet performance, and manual snipe mode.
7.  **Advanced Analytics:** Tracks trading performance, win rates, and PnL using a persistent SQLite database.

### Project Structure:

-   **`backend/`**: Flask API for token data, AI analysis, trading logic, and Solana blockchain interaction.
    -   `src/main.py`: Main Flask application with eventlet and background asyncio loop.
    -   `src/services/ai_analysis.py`: AI integration with LLM7 (JSON-enforced parsing).
    -   `src/services/wallet_service.py`: Manages the Solana wallet and fetches real balances/prices.
    -   `src/services/data_fetcher.py`: Fetches real-time data from Dexscreener and Birdeye APIs.
    -   `src/services/mempool_monitor.py`: Monitors Solana mempool for new token launches and rugpull indicators.
    -   `src/services/trading_service.py`: Executes real Solana transactions via Jupiter V6 Aggregator.
    -   `src/services/auto_trader.py`: Fully autonomous trading strategy with position management.
-   **`frontend/`**: React application for the user interface.
    -   `src/App.jsx`: Main application component and routing.
    -   `src/pages/`: Individual pages (Dashboard, TokenScanner, Trading, Wallet, Settings, Analytics).
    -   `src/contexts/`: React Contexts for theme, API, and WebSocket.

### Installation & Setup (Development):

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
**WARNING:** Never commit your private key or API keys to version control.

#### Backend:

```bash
cd backend
python3.11 -m venv venv
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

### Creator:

**Mulky Malikul Dhaher**
Contact: mulkymalikuldhr@mail.com
