## SolSniperX - AI-Powered Solana Memecoin Sniper Bot

SolSniperX is an advanced, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface.

### Key Features:

1.  **Real-time Token Detection:** Monitors Pump.fun, Birdeye, Dexscreener, and Solana Mempool for new token listings and early launches.
2.  **AI-Powered Analysis:** Utilizes AI (LLM7 Pi) to assess token potential, including liquidity, market cap, holder distribution, dev wallet activity, and contract red flags (honeypot, max txn, blacklist). The LLM informs automated buy/sell decisions and anti-rugpull strategies.
3.  **Automated Trading Execution:** Executes buy orders automatically based on predefined parameters (e.g., amount, slippage) and can auto-sell at target profits (2x, 3x, trailing stop).
4.  **Anti-Rug Protection:** Implements automatic cut-loss mechanisms if dev sells, LP is pulled, or significant price dumps occur.
5.  **Secure Wallet Management (Private Key Based):** Connects directly to a Solana wallet using a private key provided via environment variable. No traditional login or registration is required.
6.  **Intuitive Web Dashboard:** Provides a sleek, responsive, and interactive user interface with features like:
    *   Live Watchlist
    *   Token Detail View
    *   Wallet Performance & PnL
    *   Manual Snipe Mode
    *   AI Analysis Panel
    *   Trading Signals Panel
    *   Settings for customization
7.  **Notifications:** Telegram alerts for critical events and trading actions.
8.  **Advanced Analytics:** Tracks trading performance, win rates, and PnL.
9.  **User-Friendly Design:** Modern UI/UX inspired by leading platforms like GMGN, Burd AI, and Binance, with dark mode and smooth animations.

### Project Structure:

-   **`backend/`**: Flask API for token data, AI analysis, trading logic, and Solana blockchain interaction.
    -   `src/main.py`: Main Flask application.
    -   `src/services/ai_analysis.py`: AI integration with LLM7.
    -   `src/services/wallet_service.py`: Manages the single, private-key-derived Solana wallet.
    -   `src/services/data_fetcher.py`: Fetches real-time data from Dexscreener and Birdeye.
    -   `src/services/mempool_monitor.py`: Monitors Solana mempool for new token launches and rugpull indicators.
    -   `src/services/trading_service.py`: Executes real Solana blockchain transactions for trading via Jupiter Aggregator.
    -   `src/services/auto_trader.py`: Contains the automated trading strategy and logic.
-   **`frontend/`**: React application for the user interface.
    -   `src/App.jsx`: Main application component and routing.
    -   `src/pages/`: Individual pages (Dashboard, TokenScanner, Trading, Wallet, Settings, etc.).
    -   `src/components/`: Reusable UI components (e.g., Navbar, Sidebar, AIAnalysisPanel).
    -   `src/contexts/`: React Contexts for theme, API, and WebSocket.
    -   `src/utils/localStorage.js`: Utilities for local data storage and encryption.

### Installation & Setup (Development):

#### Prerequisites:
- Python 3.11+
- Node.js (for pnpm)
- pnpm

#### Environment Variables:
Create a `.env` file in the `backend` directory (or set them directly in your shell):
```
DEXSCREENER_API_KEY="YOUR_DEXSCREENER_API_KEY"
BIRDEYE_API_KEY="YOUR_BIRDEYE_API_KEY"
LLM7_API_KEY="YOUR_LLM7_API_KEY"
SOLANA_PRIVATE_KEY="YOUR_SOLANA_WALLET_PRIVATE_KEY_BASE58_ENCODED"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```
**WARNING:** Never commit your private key or API keys to version control. Use environment variables or a secure secrets management system.

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
