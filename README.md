# SolSniperX - AI-Powered Solana Memecoin Sniper Bot

SolSniperX is an advanced, production-ready, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain.

### Recent Production-Ready Upgrades:

- **Enhanced Mempool Monitoring:** Efficiently filters Pump.fun and Raydium logs using `logs_subscribe` for near-instant detection of new token launches.
- **Jupiter V6 Integration:** Fully integrated with Jupiter Aggregator V6 for best-in-class trade execution and swap routes.
- **Real-Time Finality Checks:** Implements robust signature polling to ensure transaction confirmation before proceeding with further logic.
- **Smart Autonomous Trading:** Features advanced position management, including fixed take-profit (TP), stop-loss (SL), and dynamic trailing stop-loss (TSL).
- **On-Chain Balance Tracking:** Automatically verifies token amounts in the wallet using real-time on-chain data for accurate trade monitoring.
- **AI-Powered Logic:** Enhanced prompt engineering with LLM7 Pi to generate structured JSON analysis for better decision-making and risk assessment.
- **Optimized Data Layer:** Implemented caching for external API metadata to respect rate limits while maintaining high responsiveness.
- **Unified WebSocket Layer:** Seamless real-time updates for prices, trades, and wallet state via Socket.io.

### Key Features:

1.  **Real-time Token Detection:** Monitors Pump.fun and Raydium via the Solana Mempool for new token listings.
2.  **AI-Powered Analysis:** Uses AI to assess token potential, including liquidity, market cap, and contract risks (rugpull indicators).
3.  **Automated Trading Execution:** Executes trades based on predefined filters and AI signals using Jupiter V6.
4.  **Position Management:** Implements TP, SL, and Trailing SL to protect capital and lock in profits automatically.
5.  **Secure Wallet Management:** Directly uses the private key provided via environment variables for secure, high-speed execution.

### Installation & Setup (Production):

#### Prerequisites:
- Python 3.11+
- Node.js & pnpm

#### Backend:
```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python3 src/main.py
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
