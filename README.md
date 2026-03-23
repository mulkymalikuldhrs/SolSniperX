## SolSniperX - AI-Powered Solana Memecoin Sniper Bot (v2.1)

SolSniperX is an advanced, production-ready AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface.

### Key Features (v2.1):

1.  **Real-time Token Detection:** Monitors Pump.fun and Raydium launches in the Solana Mempool via robust asynchronous WebSocket connections with reconnection logic.
2.  **AI-Powered Analysis:** Integrates with LLM7 API to provide deep analysis of token potential, including risk assessment, sentiment, and automated trading recommendations.
3.  **Automated Trading Execution:** High-performance trade execution using the **Jupiter V6 Aggregator** for optimal routing and minimal slippage. Supports both automated and manual modes.
4.  **Anti-Rug Protection:** Real-time monitoring of transaction logs for liquidity withdrawals, burns, and account closures, triggering emergency sell orders for protected tokens.
5.  **Persistent Order Management:** Uses a local SQLite database to track active positions, trade history, and performance metrics, ensuring state recovery after bot restarts.
6.  **Trailing Stop-Loss:** Advanced risk management with dynamic trailing stop-loss logic to lock in profits while protecting against sudden dumps.
7.  **Single-Wallet Model:** Secure, simplified access using a private key (provided via environment variable). No traditional login or registration needed.
8.  **Comprehensive Dashboard:** Real-time PnL tracking, balance monitoring, and analytics provided by a modern React-based frontend.

### Project Architecture:

-   **`backend/`**: Asynchronous Python Flask-SocketIO server.
    -   `src/main.py`: Entry point, manages background asyncio threads for monitoring and trading.
    -   `src/services/mempool_monitor.py`: Real-time transaction parsing for new launches and rugs.
    -   `src/services/trading_service.py`: On-chain execution via Jupiter V6 and `solana.rpc.async_api`.
    -   `src/services/auto_trader.py`: Core logic for autonomous trading, scanning, and position management.
    -   `src/database/app.db`: Persistent SQLite storage for state.
-   **`frontend/`**: Modern React + Vite + Tailwind UI.
    -   `src/pages/DashboardPage.jsx`: Real-time performance overview.
    -   `src/pages/TradingPage.jsx`: Unified interface for auto-trading and manual execution.
    -   `src/pages/TokenScannerPage.jsx`: Real-time discovery and AI analysis.

### Installation & Setup:

#### Prerequisites:
- Python 3.11+
- Node.js & pnpm
- Solana RPC & WebSocket endpoints

#### Environment Variables:
Create a `.env` file in the root directory (or in `backend/`):
```
DEXSCREENER_API_KEY="YOUR_DEXSCREENER_API_KEY"
BIRDEYE_API_KEY="YOUR_BIRDEYE_API_KEY"
LLM7_API_KEY="YOUR_LLM7_API_KEY"
SOLANA_PRIVATE_KEY="YOUR_SOLANA_WALLET_PRIVATE_KEY_BASE58_ENCODED"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```

#### Quick Start (Development):

```bash
chmod +x start_dev.sh
./start_dev.sh
```

#### Manual Setup:

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run dev
```

### System Validation:
To run the automated validation suite:
```bash
# Backend unit tests
PYTHONPATH=backend/src ./backend/venv/bin/pytest backend/tests/

# Frontend/System verification (requires Playwright)
python verify_consolidated.py
```

### Creator:
**Mulky Malikul Dhaher**
Contact: mulkymalikuldhr@mail.com
