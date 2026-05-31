# SolSniperX v3.3.0 — Ultimate Intelligence Upgrade

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![Version](https://img.shields.io/badge/Version-3.3.0-blue)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

SolSniperX is a state-of-the-art, fully autonomous AI-powered Solana memecoin sniper bot. Designed for production-grade reliability, it integrates real-time mempool monitoring, multi-factor AI analysis, and high-speed execution to capture opportunities while maximizing security.

## 🚀 Key Features

1.  **Ultimate Intelligence Upgrade (v3.3.0):** Enhanced AI analysis using social metadata extraction (websites, X, Telegram) and improved LLM7 reasoning for deeper sentiment and risk assessment.
2.  **Autonomous Resilience:** Advanced "Service Watchdog" that automatically monitors and restarts critical background tasks (mempool monitor, auto-trader) ensuring 24/7 uptime.
3.  **Real-time Token Detection:** Monitors Pump.fun, Birdeye, Dexscreener, and Solana Mempool for new token listings using optimized WebSocket connections.
4.  **AI-Powered Analysis:** Utilizes LLM7 to assess token potential, liquidity, holder distribution, and contract red flags with structured JSON parsing.
5.  **Automated Trading Execution:** Executes trades via Jupiter V6 with support for take-profit tiers, trailing stop-loss, and fixed stop-loss.
6.  **Dynamic JITO Support:** Real-time JITO tip estimation (50th percentile) ensures your transactions land even during high network congestion.
7.  **Anti-Rug Protection:** Real-time mempool-based rugpull detection with emergency cut-loss execution.
8.  **Modern Web Dashboard:** Sleek, responsive React interface with live charts, watchlist (localStorage persisted), and wallet performance tracking.
9.  **Advanced Mempool Filtering:** Configurable SOL and liquidity thresholds to filter out noise and focus on high-quality launches.

## 📁 Project Structure

-   **`backend/`**: Flask-SocketIO API with an integrated `asyncio` background service loop.
    -   `src/main.py`: Entry point with service watchdog and asyncio lifecycle management.
    -   `src/services/`: Core logic (AI Analysis, AutoTrader, DataFetcher, MempoolMonitor, TradingService, WalletService).
    -   `src/routes/`: Modular Flask blueprints for the API.
    -   `src/utils/`: Database helpers and response utilities.
-   **`frontend/`**: Modern React SPA powered by Vite and Tailwind CSS.
    -   `src/components/`: Modular UI components and layout.
    -   `src/pages/`: Feature-rich pages (Dashboard, Scanner, Trading, etc.).
    -   `src/contexts/`: Global state management via React Context.

## 🔧 Installation & Setup

### Prerequisites:
- Python 3.11+
- Node.js & pnpm

### Quick Start:
```bash
chmod +x start_dev.sh
./start_dev.sh
```

### Environment Variables (.env):
Create `backend/.env`:
```
DEXSCREENER_API_KEY="..."
BIRDEYE_API_KEY="..."
LLM7_API_KEY="..."
SOLANA_PRIVATE_KEY="..."
SOLANA_RPC_URL="..."
SOLANA_WS_URL="..."
```

## 🛡️ Evolution to v3.3.0

- **v3.3.0 (Ultimate Intelligence Upgrade):** Added social metadata extraction and enhanced AI logic.
- **v3.2.0 (Ultimate Autonomous Upgrade):** Introduced the Service Watchdog and autonomous resilience.
- **v3.1.0 (Advanced Filtering Upgrade):** Implemented dynamic mempool filtering and threshold configuration.
- **v3.0.0 (Grand Consolidation):** Finalized the production baseline, removed all mocks, and established 100% real-API integration.

## 🤝 Contributing

Contributions are welcome! Please follow the `CONTRIBUTING.md` guidelines.

## 📄 License

This project is licensed under the MIT License.

---
**Creator:** Mulky Malikul Dhaher
**Disclaimer:** This project is for Educational Purposes only. Use at your own risk.
