# SolSniperX v3.0.0 — Production-Ready AI-Powered Solana Memecoin Sniper Bot

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![Version](https://img.shields.io/badge/Version-3.0.0-blue)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

SolSniperX is an advanced, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface.

## 🚀 Key Features

1.  **Real-time Token Detection:** Monitors Pump.fun, Birdeye, Dexscreener, and Solana Mempool for new token listings and early launches using optimized WebSocket connections.
2.  **AI-Powered Analysis:** Utilizes AI (LLM7) to assess token potential, including liquidity, market cap, holder distribution, dev wallet activity, and contract red flags. The LLM informs automated buy/sell decisions and anti-rugpull strategies.
3.  **Automated Trading Execution:** Executes buy orders automatically based on predefined parameters and auto-sells at target profits (take-profit, stop-loss, trailing stop-loss).
4.  **Anti-Rug Protection:** Implements automatic cut-loss mechanisms if dev sells, LP is pulled, or significant price dumps occur, detected in real-time from the mempool.
5.  **Secure Wallet Management (Private Key Based):** Connects directly to a Solana wallet using a private key provided via environment variable. No traditional login or registration is required.
6.  **Intuitive Web Dashboard:** Provides a sleek, responsive, and interactive user interface with live watchlist, token detail view, wallet performance, and manual snipe mode.
7.  **Advanced Analytics:** Tracks trading performance, win rates, and PnL using a persistent SQLite database.
8.  **Real-Time Price Data:** Uses Jupiter Price API v2 for real-time SOL and token price lookups — no hardcoded or mock values.
9.  **Socket.IO Integration:** Full real-time communication between backend and frontend for live trade events, token detection, and rugpull alerts.
10. **Limit Orders:** Place buy/sell limit orders that execute automatically when price targets are reached.

## 📁 Project Structure

-   **`backend/`**: Flask API for token data, AI analysis, trading logic, and Solana blockchain interaction.
    -   `src/main.py`: Main Flask application with eventlet and background asyncio loop.
    -   `src/services/ai_analysis.py`: AI integration with LLM7 (JSON-enforced parsing).
    -   `src/services/wallet_service.py`: Manages the Solana wallet and fetches real balances/prices via Jupiter.
    -   `src/services/data_fetcher.py`: Fetches real-time data from Dexscreener and Birdeye APIs.
    -   `src/services/mempool_monitor.py`: Monitors Solana mempool for new token launches and rugpull indicators.
    -   `src/services/trading_service.py`: Executes real Solana transactions via Jupiter V6 Aggregator.
    -   `src/services/auto_trader.py`: Fully autonomous trading strategy with position management.
-   **`frontend/`**: React application for the user interface.
    -   `src/App.jsx`: Main application component and routing.
    -   `src/pages/`: Individual pages (Dashboard, TokenScanner, Trading, Wallet, Settings, Analytics).
    -   `src/contexts/`: React Contexts for theme, API, and WebSocket.

## 🔧 Installation & Setup (Development)

### Prerequisites:
- Python 3.11+
- Node.js (for pnpm)
- pnpm

### Environment Variables:
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

### Backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

### Frontend:

```bash
cd frontend
pnpm install
pnpm run dev
```

### Quick Start (Both):

```bash
chmod +x start_dev.sh
./start_dev.sh
```

## 🛡️ What's New in v3.0.0

- **All 12 critical bugs fixed** — No more crashes from undefined variables, broken imports, or Flask async incompatibility
- **All 16 mock/dummy data instances removed** — Dashboard, Trading, Analytics, Watchlist, Sidebar all use real API data
- **Real SOL price via Jupiter API** — Wallet page shows real USD values, not hardcoded 0
- **Socket.IO integration** — Replaced raw WebSocket with socket.io-client for reliable real-time updates
- **Real notifications** — Navbar notifications driven by WebSocket events instead of hardcoded
- **Watchlist with localStorage** — Persisted watchlist with real token lookup, no dummy PEPE/BONK data
- **Sidebar with live stats** — Performance stats fetched from API instead of hardcoded numbers
- **95 stale branches cleaned** — Only master branch remains
- **eventlet monkey_patch** — Proper Flask async compatibility
- **python-dotenv** — Environment variables loaded properly

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Creator

**Mulky Malikul Dhaher**  
📧 Contact: [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

---

## ⚠️ Disclaimer

**English:** This project is for Education Purpose only. Use at your own risk. We are not responsible for any financial losses, damages, or risks arising from the use of this software. Cryptocurrency trading involves significant risk and may result in the loss of your capital.

**Bahasa Indonesia:** Proyek ini hanya untuk tujuan Pendidikan. Gunakan dengan risiko Anda sendiri. Kami tidak bertanggung jawab atas kerugian keuangan, kerusakan, atau risiko yang timbul dari penggunaan perangkat lunak ini. Perdagangan cryptocurrency melibatkan risiko signifikan dan dapat mengakibatkan hilangnya modal Anda.

**中文:** 本项目仅供教育目的。使用风险自负。我们不对因使用本软件而产生的任何财务损失、损害或风险承担责任。加密货币交易涉及重大风险，可能导致您的资本损失。
