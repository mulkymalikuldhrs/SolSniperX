## SolSniperX - AI-Powered Solana Memecoin Sniper Bot

SolSniperX is a high-performance, autonomous AI trading system for Solana memecoins. It integrates real-time mempool monitoring, LLM-driven market analysis, and Jupiter V6 execution to provide a production-ready sniping and position management solution.

### Key Features:

1.  **High-Speed Mempool Monitoring:** Direct WebSocket integration with Solana RPC to filter Pump.fun 'Create' and Raydium 'Initialize2' instructions in real-time.
2.  **LLM-Powered Token Analysis:** Deep-dives into token metadata, security (ownership, honeypot, top holders), and sentiment using LLM7 to generate actionable trading signals.
3.  **Full-Cycle Autonomous Trading:** Automated buy execution gated by AI confidence scores and real-time sell management (Profit Target, Stop-Loss, and Dynamic Trailing Stop-Loss).
4.  **Integrated Anti-Rug Protection:** Immediate emergency exit on liquidity withdrawal, account closure, or token burn detection.
5.  **Advanced Data Integration:** Real-time and historical data enrichment from Birdeye and Dexscreener for accurate PnL tracking and performance analytics.
6.  **Persistent Position Management:** SQLite-backed state management allows the bot to resume monitoring and managing active trades across restarts.
7.  **Production Architecture:** Flask-SocketIO backend with a dedicated asynchronous service thread (`asyncio`) ensures non-blocking UI and high-concurrency event handling.

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

### Running in Production (Autonomous Mode):

1.  **Configure `.env`**: Ensure all API keys and `SOLANA_PRIVATE_KEY` are correctly set.
2.  **Start Services**: Use `start_dev.sh` or run backend and frontend manually.
3.  **Enable Auto-Trader**:
    *   Navigate to the **Settings** page in the web dashboard.
    *   Configure your trading parameters (min liquidity, buy amount, stop-loss, etc.).
    *   Toggle **Autonomous Trading** to ON.
    *   The bot will now automatically monitor the mempool, analyze new tokens using AI, and execute trades based on your criteria.
4.  **Monitor**: Keep the dashboard open or check Telegram notifications (if configured) to track performance and active positions.

### Creator:
**Mulky Malikul Dhaher**
Contact: mulkymalikuldhr@mail.com

### Deployment & Production:
SolSniperX is built for high availability. Ensure you use a high-performance Solana RPC provider (e.g., Helius, QuickNode) and a valid LLM7/Birdeye API key for full functionality.
