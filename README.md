
<!-- CAPSULE-RENDER HEADER -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:1a0033,50:2d0066,100:400099&fontColor=a78bfa&descColor=fbbf24&height=220&section=header&text=SolSniperX&fontSize=70&desc=Solana%20Memecoin%20Sniper%20Bot&animation=fadeIn" />

<!-- TYPING SVG -->
<div align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=A78BFA&center=true&vCenter=true&width=600&lines=Lightning-Fast+Solana+Execution;Anti-Rug+Protection+System;Automated+Token+Sniping;High+Risk+%7C+Research+%26+Education+Only" alt="Typing SVG" />
  </a>
</div>

<br/>

<!-- BADGES -->
<div align="center">

[![Solana](https://img.shields.io/badge/Solana-Web3.js-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com/)
[![Flask](https://img.shields.io/badge/Flask-3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

<p align="center">
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README.md">English</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_id.md">Bahasa Indonesia</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_zh.md">中文</a>
</p>

---

## Overview

**SolSniperX** is a Solana memecoin sniper bot built with JavaScript and the Solana Web3.js SDK, featuring a **Flask backend** and **React/Vite dashboard** for real-time monitoring. Engineered for speed on the Solana blockchain, it monitors new token launches, evaluates them against configurable criteria, and executes trades in milliseconds. The bot includes anti-rug pull detection mechanisms and customizable sniping strategies for the fast-paced world of Solana memecoins.

> **⚠️ Extreme Risk Warning:** Memecoin trading involves extraordinary financial risk. This tool is built for educational and research purposes. You can lose your entire investment.

---

## Features

### Token Sniping Engine
- Real-time monitoring of new Solana token launches via Raydium, Pump.fun, and other DEXs
- Sub-second trade execution on the Solana blockchain
- Configurable buy/sell parameters (amount, slippage, gas priority)
- Multi-token concurrent sniping support

### Anti-Rug Pull Protection
- Liquidity lock verification
- Mint authority renunciation checks
- Holder distribution analysis (whale detection)
- Contract source code scanning for suspicious patterns
- Dev wallet tracking and abnormal activity alerts

### Smart Filtering
- Customizable token filters (name, symbol, metadata patterns)
- Social signal integration (Twitter mentions, Telegram activity)
- Liquidity pool minimum thresholds
- Age-based filtering to avoid stale tokens

### Trade Management
- Automatic take-profit and stop-loss execution
- Trailing stop functionality
- DCA (Dollar Cost Averaging) strategies
- Portfolio tracking with P&L calculations
- Real-time transaction logging

### Dashboard and Monitoring
- Live wallet balance and position tracking
- Transaction history with detailed analytics
- Performance metrics and win/loss ratios
- Alert system for notable events

---

## Visual Architecture

> Interactive diagrams showing sniping flow, anti-rug detection, trade management, and real-time dashboard architecture.

### Sniper Event Loop

```mermaid
flowchart LR
    subgraph MEMPOOL["🔍 Mempool Monitor"]
        WS_CONN["Solana WebSocket<br/>Connection"]
        TX_STREAM["Transaction<br/>Stream"]
        NEW_TOKEN["New Token<br/>Detection"]
    end

    subgraph SCAN["🔎 Token Scanner"]
        PARSE["Parse Token<br/>Metadata"]
        FILTER["Apply Custom<br/>Filters"]
        SCORE["Quick Score<br/>Assessment"]
    end

    subgraph SAFETY["🛡️ Safety Checks"]
        RUG_CHECK["Anti-Rug<br/>Detection"]
        LIQ_CHECK["Liquidity<br/>Verification"]
        HOLD_CHECK["Holder<br/>Analysis"]
    end

    subgraph EXEC["⚡ Execution"]
        BUILD["Build<br/>Transaction"]
        SIGN["Sign &<br/>Simulate"]
        SEND["Send to<br/>Solana"]
        CONFIRM["Confirm<br/>on-chain"]
    end

    subgraph TRACK["📊 Track"]
        MONITOR["Monitor<br/>Position"]
        TP_SL["TP/SL<br/>Manager"]
        LOG2["Log &<br/>Notify"]
    end

    MEMPOOL --> SCAN --> SAFETY --> EXEC --> TRACK
    WS_CONN --> TX_STREAM --> NEW_TOKEN
    NEW_TOKEN --> PARSE --> FILTER --> SCORE
    SCORE --> RUG_CHECK
    SCORE --> LIQ_CHECK
    SCORE --> HOLD_CHECK
    RUG_CHECK -->|"PASS"| BUILD
    LIQ_CHECK -->|"PASS"| BUILD
    HOLD_CHECK -->|"PASS"| BUILD
    RUG_CHECK -->|"FAIL"| REJECT["❌ Reject<br/>Token"]
    LIQ_CHECK -->|"FAIL"| REJECT
    HOLD_CHECK -->|"FAIL"| REJECT
    BUILD --> SIGN --> SEND --> CONFIRM --> MONITOR
    MONITOR --> TP_SL --> LOG2

    style MEMPOOL fill:#1a0033,stroke:#a78bfa,color:#fff
    style SCAN fill:#0d2137,stroke:#22d3ee,color:#fff
    style SAFETY fill:#3d1a0f,stroke:#f97316,color:#fff
    style EXEC fill:#0a2a0a,stroke:#4ade80,color:#fff
    style TRACK fill:#1a1a2a,stroke:#8b5cf6,color:#fff
    style REJECT fill:#3a0a0a,stroke:#f87171,color:#fff
```

### Anti-Rug Detection Flow

```mermaid
flowchart TD
    START["🪙 New Token<br/>Detected"] --> CHECKS{"Run Safety<br/>Checks"}

    CHECKS --> MINT{"Mint Authority<br/>Renounced?"}
    CHECKS --> FREEZE{"Freeze Authority<br/>Revoked?"}
    CHECKS --> LIQUIDITY{"Liquidity<br/>Locked?"}
    CHECKS --> HOLDERS{"Holder<br/>Distribution OK?"}
    CHECKS --> DEV{"Dev Wallet<br/>Clean?"}
    CHECKS --> CODE{"Contract Code<br/>Clean?"}

    MINT -->|"No ❌"| FAIL["🔴 RUG FLAG"]
    FREEZE -->|"No ❌"| FAIL
    LIQUIDITY -->|"No ❌"| FAIL
    HOLDERS -->|"Whale Dump ❌"| FAIL
    DEV -->|"Suspicious ❌"| FAIL
    CODE -->|"Honeypot ❌"| FAIL

    MINT -->|"Yes ✅"| SCORE2["Safety Score<br/>+20"]
    FREEZE -->|"Yes ✅"| SCORE2
    LIQUIDITY -->|"Yes ✅"| SCORE2
    HOLDERS -->|"Distributed ✅"| SCORE2
    DEV -->|"Clean ✅"| SCORE2
    CODE -->|"Safe ✅"| SCORE2

    SCORE2 --> THRESHOLD{"Score ≥<br/>Threshold?"}
    THRESHOLD -->|"Yes ✅"| APPROVED["🟢 Token<br/>Approved"]
    THRESHOLD -->|"No ⚠️"| CAUTION["🟡 High Risk<br/>Proceed with Caution"]

    FAIL --> BLOCKED["⛔ Trade<br/>Blocked"]

    style START fill:#1a0033,stroke:#a78bfa,color:#fff
    style FAIL fill:#3a0a0a,stroke:#f87171,color:#fff
    style BLOCKED fill:#3a0a0a,stroke:#f87171,color:#fff
    style SCORE2 fill:#0d2137,stroke:#22d3ee,color:#fff
    style APPROVED fill:#0a2a0a,stroke:#4ade80,color:#fff
    style CAUTION fill:#2a2a0a,stroke:#facc15,color:#fff
```

### Trade Management — Entry to Exit

```mermaid
stateDiagram-v2
    [*] --> Monitoring: Bot Started
    Monitoring --> Entry: Signal Detected and Safety Passed
    Entry --> PositionOpen: Buy Order Confirmed
    PositionOpen --> TrailingTP: Price Rising
    PositionOpen --> StopLoss: Price Dropping
    PositionOpen --> DCA: DCA Strategy Triggered
    DCA --> PositionOpen: Position Averaged
    TrailingTP --> TakeProfit: TP Target Hit
    StopLoss --> Exited: SL Triggered
    TakeProfit --> Exited: Position Closed
    TrailingTP --> PartialExit: Partial TP Hit
    PartialExit --> TrailingTP: Remaining Position
    PartialExit --> TakeProfit: Final TP Hit
    Exited --> Monitoring: Ready for Next Signal
    Monitoring --> [*]: Bot Stopped

    state PositionOpen {
        [*] --> TrackingPnL
        TrackingPnL --> AdjustingTPSL
        AdjustingTPSL --> TrackingPnL
    }
```

### Real-Time Dashboard Architecture

```mermaid
graph TB
    subgraph SOLANA["🌐 Solana Blockchain"]
        RPC["RPC Node<br/>Helius/QuickNode"]
        GSRPC["gRPC / WS<br/>Streaming"]
    end

    subgraph BACKEND["⚙️ Flask Backend"]
        SNIPER["Sniper<br/>Engine"]
        TRACKER["Position<br/>Tracker"]
        WALLET["Wallet<br/>Manager"]
        API["REST API<br/>Endpoints"]
    end

    subgraph WS_LAYER["🔄 WebSocket Layer"]
        WSS["WebSocket<br/>Server"]
        PUBSUB["Pub/Sub<br/>Event Bus"]
    end

    subgraph FRONTEND["🖥️ React/Vite Dashboard"]
        CHARTS["Live Charts<br/>& Price Feed"]
        POSITIONS["Position<br/>Tracker UI"]
        ALERTS2["Alert<br/>Panel"]
        SETTINGS["Strategy<br/>Config"]
    end

    subgraph STORE2["💾 Storage"]
        DB2[("SQLite<br/>Trade History")]
        LOGS["Transaction<br/>Logs"]
    end

    SOLANA --> BACKEND
    BACKEND --> WS_LAYER
    WS_LAYER --> FRONTEND
    BACKEND --> STORE2

    RPC --> SNIPER
    RPC --> TRACKER
    GSRPC --> SNIPER
    SNIPER --> API
    TRACKER --> API
    WALLET --> API
    API --> WSS --> PUBSUB
    PUBSUB --> CHARTS
    PUBSUB --> POSITIONS
    PUBSUB --> ALERTS2
    FRONTEND -->|"User Actions"| API
    API --> SETTINGS

    style SOLANA fill:#1a0033,stroke:#9945FF,color:#fff
    style BACKEND fill:#0d2137,stroke:#22d3ee,color:#fff
    style WS_LAYER fill:#1a3d0f,stroke:#4ade80,color:#fff
    style FRONTEND fill:#1a0f3d,stroke:#818cf8,color:#fff
    style STORE2 fill:#1a1a2a,stroke:#8b5cf6,color:#fff
```

---

## Honest Notes

> **Please read carefully before using this software:**

- **Extreme Financial Risk** — Memecoin trading can result in the loss of your entire investment. This is not a guaranteed profit system. Most memecoins go to zero.
- **Anti-Rug ≠ Rug-Proof** — The anti-rug pull detection significantly reduces risk but **cannot eliminate it**. Sophisticated rug pulls may bypass detection. Always assume risk.
- **Educational/Research Only** — This bot is developed as an educational tool to study Solana DeFi mechanics, MEV strategies, and automated trading systems. It is not financial advice.
- **Network Dependency** — Performance depends on Solana network conditions, RPC node speed, and regional latency. Results vary significantly based on infrastructure.
- **Smart Contract Risk** — Interacting with unaudited smart contracts (which memecoins are) always carries risk of exploits and bugs.
- **No Refunds, No Guarantees** — This is open-source software provided as-is. The authors are not responsible for any financial losses.

---

## Quick Start

### Prerequisites
- Node.js 20+
- A Solana wallet with SOL for trading
- A dedicated RPC endpoint (Helius, QuickNode, or Triton recommended)
- Basic understanding of Solana DeFi and memecoin markets

### Installation

```bash
# Clone the repository
git clone https://github.com/mulkymalikuldhrs/SolSniperX.git
cd SolSniperX

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
```

### Configuration

Edit `.env` with your settings:
```env
# Wallet
PRIVATE_KEY=your_base58_private_key

# RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WS_URL=wss://api.mainnet-beta.solana.com

# Trading
BUY_AMOUNT_SOL=0.01
SLIPPAGE_BPS=500
PRIORITY_FEE_LAMPORTS=100000

# Anti-Rug
MIN_LIQUIDITY_SOL=5
CHECK_MINT_RENOUNCED=true
MAX_HOLDER_PERCENT=10

# Strategy
TAKE_PROFIT_PERCENT=100
STOP_LOSS_PERCENT=30
```

### Running

```bash
# Start the sniper bot
npm run start

# Start with dashboard
npm run start:dashboard

# Dry-run mode (no real trades)
npm run start:dry
```

---

## Project Structure

```
SolSniperX/
├── backend/
│   ├── src/             # Python Flask backend
│   │   ├── services/    # Trading, Monitoring, AI, Watchdog
│   │   ├── routes/      # REST API & WebSocket endpoints
│   │   ├── database/    # SQLite persistence
│   │   └── utils/       # DB and response helpers
│   ├── tests/           # Backend test suite
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/             # React/Vite dashboard
│   │   ├── components/  # UI, Layout, AI components
│   │   ├── contexts/    # API, WebSocket, Theme contexts
│   │   └── pages/       # Dashboard, Trading, Scanner pages
│   ├── package.json     # Frontend dependencies
│   └── vite.config.js   # Vite configuration
├── auto_trader_config.json # Strategy configuration
├── start_dev.sh         # Integrated startup script
└── verify_v3_3_0.py     # E2E system verification
```

---

## Contributing

1. **Fork** the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

> **Note:** PRs that add features for market manipulation, front-running retail users, or exploit-specific vulnerability targeting will not be accepted.

---

## Disclaimer

**THIS SOFTWARE IS PROVIDED FOR EDUCATIONAL AND RESEARCH PURPOSES ONLY.** It is not financial advice, investment advice, or trading advice. Cryptocurrency trading, particularly memecoin trading, carries extreme risk including total loss of capital. The authors and contributors assume **no liability** for any financial losses, damages, or legal consequences arising from the use of this software. Use at your own risk. Always comply with your local laws and regulations regarding cryptocurrency trading.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## Author

<div align="center">

**Mulky Malikul Dhaher**

[![GitHub](https://img.shields.io/badge/GitHub-mulkymalikuldhrs-181717?style=flat-square&logo=github)](https://github.com/mulkymalikuldhrs)
[![Email](https://img.shields.io/badge/Email-mulkymalikudhr@mail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:mulkymalikudhr@mail.com)

</div>

---

<!-- FOOTER BANNER -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:1a0033,50:2d0066,100:400099&fontColor=a78bfa&descColor=fbbf24&height=120&section=footer&text=&fontSize=0" />
