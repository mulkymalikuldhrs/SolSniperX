# SolSniperX - AI-Powered Solana Memecoin Sniper Bot

SolSniperX is a high-performance, autonomous AI trading system for Solana memecoins. It integrates real-time mempool monitoring, LLM-driven market analysis, and Jupiter V6 execution to provide a production-ready sniping and position management solution.

### v2.1.2 Release Notes (Production Ready)
This version represents the fully hardened, production-ready state of SolSniperX, consolidating all autonomous features and real-data integrations.

- **Persistent Stats:** All trades, positions, and global metrics (like rugs avoided) are stored in a local SQLite database.
- **Real-Time Analytics:** The dashboard and analytics pages consume live data from the backend, including real price tracking and PnL.
- **Autonomous Hardening:** Refined `AutoTraderService` with robust error handling and verifiable rugpull protection.
- **Limit Order Support:** Integrated buy/sell limit orders with background price monitoring.
- **Production UI:** Modern, responsive React interface with real-time WebSocket updates and dynamic chart visualizations.

### Key Features:

1.  **Real-time Token Detection:** Monitors Pump.fun, Birdeye, Dexscreener, and Solana Mempool for new token listings.
2.  **AI-Powered Analysis:** Uses LLM7 to assess token potential and inform automated trading decisions.
3.  **Automated Trading Execution:** Executes swaps via Jupiter V6 based on AI recommendations and risk filters.
4.  **Limit Orders:** Place pending buy/sell orders that execute automatically when target prices are hit.
5.  **Anti-Rug Protection:** Real-time mempool log analysis triggers emergency sells if rugpull indicators are detected.
5.  **Secure Wallet Management:** Operates with a single Solana wallet derived from an environment variable.
6.  **Intuitive Web Dashboard:** Live watchlist, active positions, performance analytics, and manual sniping.

### Project Structure:

-   **`backend/`**: Flask API & Async Services.
    -   `src/main.py`: Flask-SocketIO app with `eventlet` and background `asyncio` loop.
    -   `src/services/mempool_monitor.py`: Real-time Solana event listener with log analysis.
    -   `src/services/trading_service.py`: Jupiter V6 integration for swaps and Limit Orders.
    -   `src/services/auto_trader.py`: Autonomous strategy and lifecycle management.
    -   `src/services/data_fetcher.py`: Real-time data from Dexscreener and Birdeye.
    -   `src/services/ai_analysis.py`: LLM7-powered token assessment.
    -   `src/utils/db.py`: SQLite persistence layer for all state.
-   **`frontend/`**: React application.
    -   `src/pages/DashboardPage.jsx`: Real-time performance and market overview.
    -   `src/pages/TradingPage.jsx`: Autonomous settings and manual execution.
    -   `src/pages/WalletPage.jsx`: Portfolio tracking and asset management.
    -   `src/pages/AnalyticsPage.jsx`: Detailed trade history and visual insights.

### Installation & Setup (Production):

#### Prerequisites:
- Python 3.11+
- Node.js & pnpm

#### 1. Environment Setup:
Create a `.env` file in the root directory:
```bash
SOLANA_PRIVATE_KEY="your_base58_private_key"
BIRDEYE_API_KEY="your_birdeye_api_key"
LLM7_API_KEY="your_llm7_api_key"
DEXSCREENER_API_KEY="your_dex_key"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```

#### 2. Start Development Environment:
```bash
chmod +x start_dev.sh
./start_dev.sh
```

### Verification:
Run the system-wide verification script:
```bash
PYTHONPATH=backend/src ./backend/venv/bin/python verify_consolidated.py
```

### Creator:
**Mulky Malikul Dhaher**
Contact: mulkymalikuldhr@mail.com
