<p align="center">
  <img src="https://img.shields.io/badge/SolSniperX-Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="SolSniperX">
  <img src="https://img.shields.io/badge/Version-2.0-14F195?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

<p align="center">
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README.md">English</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_id.md">Bahasa Indonesia</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_zh.md">中文</a>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=14F195&center=true&vCenter=true&width=600&lines=AI-Powered+Solana+Memecoin+Sniper;Automated+Trading+%2B+Anti-Rug+Protection;Jupiter+Aggregator+Integration;Real-Time+Mempool+Monitoring" alt="Typing SVG" />
</p>

---

## Overview

SolSniperX is an advanced, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface. The platform combines on-chain monitoring with LLM-driven analysis to identify high-probability trading opportunities before they reach mainstream attention.

This project is part of the [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) ecosystem, an initiative to build sovereign-grade, AI-native financial intelligence systems across both traditional and decentralized markets.

## Key Features

### Real-Time Token Detection
Monitors Pump.fun, Birdeye, Dexscreener, and the Solana Mempool for new token listings and early launches. The mempool monitor connects directly to Solana WebSocket endpoints to parse incoming transactions and identify new token mints in real-time, giving you a critical speed advantage.

### AI-Powered Analysis
Utilizes AI (LLM7 Pi) to assess token potential across multiple dimensions including liquidity depth, market cap trajectory, holder distribution patterns, dev wallet activity, and contract red flags (honeypot detection, max transaction limits, blacklist functionality). The LLM generates structured buy/sell recommendations with probability scores that inform automated trading decisions.

### Automated Trading Execution
Executes buy orders automatically based on predefined parameters (amount, slippage) and integrates with Jupiter Aggregator v6 for real on-chain swaps. The auto-trader can execute sell orders at target profits (2x, 3x, trailing stop) with configurable stop-loss percentages to protect capital.

### Anti-Rug Protection
Implements automatic cut-loss mechanisms triggered by on-chain rug indicators: dev wallet sells, liquidity pool removals, and significant price dumps. The mempool monitor analyzes transaction logs and token program instructions in real-time, and the auto-trader executes emergency sell orders with maximum slippage to exit positions as quickly as possible when rug activity is detected.

### Secure Wallet Management
Connects directly to a Solana wallet using a private key provided via environment variable. No traditional login or registration is required. The private key is loaded into memory only at startup and is never persisted to disk. The frontend never directly handles the private key; all wallet operations are proxied through the backend.

### Intuitive Web Dashboard
A sleek, responsive, and interactive user interface built with React, Tailwind CSS, and shadcn/ui components, featuring:
- **Live Watchlist** with real-time price updates via WebSocket
- **Token Detail View** with comprehensive on-chain metrics
- **Wallet Performance & PnL** tracking
- **Manual Snipe Mode** for discretionary trades
- **AI Analysis Panel** with LLM-generated insights
- **Trading Signals Panel** with probability scores
- **Auto-Trader Controls** with configurable parameters
- **Settings** for customization of trading strategies

### Notifications
Telegram alerts for critical events including new token detections, executed trades, rugpull warnings, and auto-trader status changes.

### Advanced Analytics
Tracks comprehensive trading performance metrics including win rates, average PnL per trade, cumulative returns, and historical performance charts.

## Project Structure

```
SolSniperX/
├── backend/                      # Python Flask API
│   ├── src/
│   │   ├── main.py               # Flask app entry point & service orchestration
│   │   ├── config.py             # API keys, RPC URLs, environment configuration
│   │   ├── routes/               # API route blueprints
│   │   │   ├── tokens.py         # Token data endpoints
│   │   │   ├── ai.py             # AI analysis endpoints
│   │   │   ├── scanner.py        # Token scanner endpoints
│   │   │   ├── mempool.py        # Mempool monitoring endpoints
│   │   │   ├── trading.py        # Manual trading endpoints
│   │   │   ├── wallet.py         # Wallet management endpoints
│   │   │   └── auto_trader.py    # Auto-trader control endpoints
│   │   ├── services/             # Core business logic
│   │   │   ├── ai_analysis.py          # LLM7 integration for token analysis
│   │   │   ├── data_fetcher.py         # Dexscreener & Birdeye API integration
│   │   │   ├── mempool_monitor.py      # Solana mempool WebSocket monitoring
│   │   │   ├── trading_service.py      # Jupiter Aggregator swap execution
│   │   │   ├── wallet_service.py       # Solana wallet management
│   │   │   └── auto_trader.py          # Automated trading strategy engine
│   │   ├── utils/                # Shared utilities
│   │   │   └── responses.py            # Standardized API response helpers
│   │   └── database/             # SQLite database storage
│   └── requirements.txt          # Python dependencies
├── frontend/                     # React web application
│   ├── src/
│   │   ├── App.jsx               # Main app component & routing
│   │   ├── pages/                # Application pages
│   │   │   ├── DashboardPage.jsx       # Main dashboard
│   │   │   ├── TokenScannerPage.jsx    # Token discovery
│   │   │   ├── TradingPage.jsx         # Trading interface
│   │   │   ├── WalletPage.jsx          # Wallet overview
│   │   │   ├── WatchlistPage.jsx       # Watchlist management
│   │   │   ├── AnalyticsPage.jsx       # Performance analytics
│   │   │   └── SettingsPage.jsx        # Configuration
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ai/                     # AI analysis components
│   │   │   ├── layout/                 # Navbar, Sidebar
│   │   │   └── ui/                     # shadcn/ui components
│   │   ├── contexts/             # React contexts
│   │   │   ├── ApiContext.jsx           # API communication
│   │   │   ├── WebSocketContext.jsx     # Real-time data
│   │   │   └── ThemeContext.jsx         # Dark/light mode
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utility functions
│   │   └── utils/                # Local storage & helpers
│   ├── package.json              # Node.js dependencies
│   └── vite.config.js            # Vite build configuration
├── start_dev.sh                  # Development launcher script
├── blueprint.md                  # Project blueprint & architecture notes
└── TODO.md                       # Development roadmap
```

## Installation & Setup

### Prerequisites

- Python 3.11+
- Node.js 18+ (for pnpm)
- pnpm 10+

### Environment Variables

Create a `.env` file in the `backend` directory (or set them directly in your shell):

```env
DEXSCREENER_API_KEY="YOUR_DEXSCREENER_API_KEY"
BIRDEYE_API_KEY="YOUR_BIRDEYE_API_KEY"
LLM7_API_KEY="YOUR_LLM7_API_KEY"
SOLANA_PRIVATE_KEY="YOUR_SOLANA_WALLET_PRIVATE_KEY_BASE58_ENCODED"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```

**WARNING:** Never commit your private key or API keys to version control. Use environment variables or a secure secrets management system. The `.env` file is excluded from version control via `.gitignore`.

### Backend Setup

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

The backend server starts on `http://0.0.0.0:5000`.

### Frontend Setup

```bash
cd frontend
pnpm install
pnpm run dev
```

The frontend development server starts on `http://localhost:5173`.

### Quick Start (Both Servers)

```bash
./start_dev.sh
```

This script automatically starts both the backend and frontend servers.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and service status |
| `/api/tokens` | GET | Get all tracked tokens |
| `/api/tokens/<address>` | GET | Get token details by address |
| `/api/ai/analyze` | POST | Request AI analysis for a token |
| `/api/ai/signals` | GET | Get current trading signals |
| `/api/scanner/scan` | POST | Trigger a token scan |
| `/api/mempool/status` | GET | Get mempool monitor status |
| `/api/trading/buy` | POST | Execute a manual buy order |
| `/api/trading/sell` | POST | Execute a manual sell order |
| `/api/wallet/balance` | GET | Get wallet SOL & token balances |
| `/api/auto-trader/start` | POST | Start automated trading |
| `/api/auto-trader/stop` | POST | Stop automated trading |
| `/api/auto-trader/config` | GET/PUT | Get or update auto-trader configuration |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `new_token` | Server → Client | New token detected in mempool |
| `price_update` | Server → Client | Real-time price change |
| `trade_executed` | Server → Client | Trade confirmation |
| `rugpull_alert` | Server → Client | Rugpull warning for a token |
| `auto_trade_event` | Server → Client | Auto-trader action notification |
| `trading_status` | Server → Client | Auto-trader status change |

## Auto-Trader Configuration

The auto-trader can be configured through the Settings page or by modifying `auto_trader_config.json`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `min_liquidity` | 10000 | Minimum liquidity (USD) for token consideration |
| `max_age_hours` | 24 | Maximum token age (hours) for consideration |
| `min_volume_24h` | 50000 | Minimum 24h volume (USD) |
| `min_ai_probability_score` | 70 | Minimum AI probability score to buy (0-100) |
| `buy_amount_sol` | 0.01 | SOL amount per buy order |
| `slippage` | 1.0 | Default slippage tolerance (%) |
| `profit_target_x` | 2.0 | Profit target multiplier (2x = 100% gain) |
| `stop_loss_percentage` | 0.20 | Stop-loss threshold (20% = sell at 80% of buy price) |
| `max_risk_score` | 30 | Maximum AI risk score to consider buying |

## Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed system architecture and component interactions
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute to SolSniperX
- [Changelog](./CHANGELOG.md) - Release history and notable changes
- [Blueprint](./blueprint.md) - Project blueprint and transformation notes
- [TODO](./TODO.md) - Development roadmap and future enhancements

## Related Projects

- [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) - The broader AI-native financial intelligence ecosystem
- [Misi-Screener](https://github.com/mulkymalikuldhrs/Misi-Screener) - AI-driven hedge fund platform for traditional markets

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Author

**Mulky Malikul Dhaher**

- Email: mulkymalikuldhaher@email.com
- GitHub: [@mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

## Disclaimer

This software is provided for educational and research purposes only. Trading cryptocurrencies, especially memecoins, involves significant risk and can result in substantial financial losses. The authors are not responsible for any financial decisions made using this tool. Always do your own research and never invest more than you can afford to lose.

<p align="center">
  <img src="https://img.shields.io/github/stars/mulkymalikuldhrs/SolSniperX?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/mulkymalikuldhrs/SolSniperX?style=social" alt="Forks">
  <img src="https://img.shields.io/github/watchers/mulkymalikuldhrs/SolSniperX?style=social" alt="Watchers">
</p>
---

## 🤝 Contributing

Contributions are welcome! We encourage the community to help improve this project.

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

Please make sure to update tests as appropriate and follow the existing code style.

---

## 📬 Contact

**Mulky Malikul Dhaher** — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)

GitHub: [https://github.com/mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

---

## ⚠️ Disclaimer

**This project is for Education Purpose only.**

All content, code, and documentation provided in this repository are intended solely for educational and research purposes. Nothing in this repository constitutes financial, investment, legal, or professional advice.

**Risiko apapun tidak kita tanggung.** (We are not responsible for any risks or damages.)

Use at your own risk. The authors and contributors assume no liability for any losses, damages, or consequences arising from the use of this software or information provided herein.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright © Mulky Malikul Dhaher. All rights reserved.

