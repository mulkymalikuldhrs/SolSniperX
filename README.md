## SolSniperX - AI-Powered Solana Memecoin Sniper Bot

SolSniperX is an advanced, production-ready, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and autonomous trading capabilities, all accessible through a modern and intuitive web interface.

### Key Features:

1.  **Real-time Token Detection:** Monitors Pump.fun and Raydium via Solana mempool for new token listings and early launches using high-speed WebSocket filtering.
2.  **AI-Powered Analysis:** Utilizes LLM7 Pi to assess token potential, including liquidity, market cap, holder distribution, and contract red flags. The LLM informs automated buy/sell decisions.
3.  **Autonomous Trading Execution:** Executes buy/sell orders automatically based on AI signals and predefined parameters. Integrated with **Jupiter V6 Aggregator** for optimal routing.
4.  **Anti-Rug Protection:** Implements real-time monitoring for liquidity withdrawal, token burns, and account closures with automated emergency sell (cut-loss) mechanisms.
5.  **Secure Wallet Management:** Connects directly to a Solana wallet using a private key provided via environment variable. All operations are asynchronous and non-blocking.
6.  **Intuitive Web Dashboard:** Provides a sleek, responsive UI with live watchlists, token details, wallet performance (PnL), and autonomous trading controls.
7.  **Production-Ready Backend:** Built with Python Flask-SocketIO and an asynchronous service layer (`asyncio`) to handle high-concurrency blockchain events.

### Project Structure:

-   **`backend/`**: Flask-SocketIO API and asynchronous service layer.
    -   `src/main.py`: Entry point with background asyncio loop.
    -   `src/services/ai_analysis.py`: LLM7 integration for token analysis.
    -   `src/services/wallet_service.py`: Real-time wallet and balance management.
    -   `src/services/mempool_monitor.py`: High-speed mempool monitoring for new tokens and rugpulls.
    -   `src/services/trading_service.py`: Jupiter V6 integration for swaps.
    -   `src/services/auto_trader.py`: Autonomous position management and strategy.
    -   `src/utils/db.py`: SQLite-based persistent storage for trades and performance analytics.
-   **`frontend/`**: React application (Vite, Tailwind, Shadcn UI).

### Installation & Setup:

#### Prerequisites:
- Python 3.11+
- Node.js & pnpm

#### Backend Setup:
1. Create a `.env` file in `backend/`:
```
DEXSCREENER_API_KEY="YOUR_API_KEY"
BIRDEYE_API_KEY="YOUR_API_KEY"
LLM7_API_KEY="YOUR_API_KEY"
LLM7_BASE_URL="https://api.llm7.pi/v1"
SOLANA_PRIVATE_KEY="YOUR_BASE58_PRIVATE_KEY"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```
2. Install and run:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

#### Frontend Setup:
```bash
cd frontend
pnpm install
pnpm run dev
```

### Creator:
**Mulky Malikul Dhaher**
Contact: mulkymalikuldhr@mail.com
