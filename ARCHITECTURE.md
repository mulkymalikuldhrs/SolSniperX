# Architecture Guide - SolSniperX

> A detailed breakdown of the SolSniperX system architecture, component interactions, data flow, and design decisions for the AI-powered Solana memecoin sniper bot.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Design Philosophy](#design-philosophy)
- [High-Level Architecture](#high-level-architecture)
- [Backend Architecture](#backend-architecture)
- [Service Layer](#service-layer)
- [Frontend Architecture](#frontend-architecture)
- [Real-Time Communication](#real-time-communication)
- [Trading Pipeline](#trading-pipeline)
- [Anti-Rug Protection System](#anti-rug-protection-system)
- [Security Architecture](#security-architecture)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Technology Stack](#technology-stack)
- [Deployment Considerations](#deployment-considerations)
- [Extensibility Guide](#extensibility-guide)

---

## Executive Summary

SolSniperX is an AI-powered Solana memecoin sniper bot that combines real-time on-chain monitoring with LLM-driven analysis to identify, evaluate, and automatically execute trades on newly launched tokens. The system operates on a client-server architecture with a Python Flask backend for blockchain interaction, data aggregation, and AI analysis, and a React frontend for visualization and user control.

The platform is designed around four core pillars: **Speed** (mempool-level token detection), **Intelligence** (LLM-powered risk assessment and trading signals), **Safety** (anti-rug mechanisms and emergency sell capabilities), and **Autonomy** (fully automated trading with configurable parameters). These pillars ensure that SolSniperX can operate effectively in the fast-moving memecoin market while protecting user capital.

This project is part of the [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) ecosystem, extending sovereign-grade AI intelligence into decentralized markets.

---

## Design Philosophy

1. **Speed First**: In the memecoin market, seconds matter. The architecture prioritizes low-latency data paths from mempool detection to trade execution, minimizing the time between opportunity identification and order placement.

2. **Defense in Depth**: Multiple layers of protection guard against rugpulls and malicious tokens. The system combines on-chain monitoring, LLM-based contract analysis, and automated emergency sell mechanisms to provide comprehensive protection.

3. **Separation of Concerns**: The backend handles all sensitive operations (private key management, transaction signing, blockchain interaction) while the frontend serves purely as a visualization and control layer. This architecture ensures that sensitive data never reaches the client.

4. **Event-Driven Architecture**: Real-time data flows through WebSocket connections using an event-driven model. This enables reactive UI updates and allows the auto-trader to respond immediately to market events without polling.

5. **Configurable Autonomy**: The auto-trader provides fully automated trading while remaining highly configurable. Every parameter (buy amount, slippage, profit targets, stop-loss) can be adjusted through the UI without code changes.

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        SolSniperX Platform                            │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    Frontend (React + Vite)                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │   │
│  │  │Dashboard │ │  Token   │ │ Trading  │ │   Wallet     │    │   │
│  │  │  Page    │ │ Scanner  │ │   Page   │ │    Page      │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │   │
│  │  │Watchlist │ │Analytics │ │ Settings │                     │   │
│  │  │  Page    │ │   Page   │ │   Page   │                     │   │
│  │  └──────────┘ └──────────┘ └──────────┘                     │   │
│  └───────────────────────────┬───────────────────────────────────┘   │
│                              │ REST API + WebSocket                   │
│  ┌───────────────────────────┴───────────────────────────────────┐   │
│  │                  Backend (Flask + SocketIO)                    │   │
│  │                                                               │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                │   │
│  │  │  Auto      │ │  Trading   │ │  AI        │                │   │
│  │  │  Trader    │ │  Service   │ │  Analysis  │                │   │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘                │   │
│  │        │              │              │                        │   │
│  │  ┌─────┴──────────────┴──────────────┴──────┐                │   │
│  │  │            Service Orchestration          │                │   │
│  │  └─────┬──────────────┬──────────────┬──────┘                │   │
│  │        │              │              │                        │   │
│  │  ┌─────┴──────┐ ┌────┴───────┐ ┌────┴───────┐               │   │
│  │  │  Data      │ │  Mempool   │ │  Wallet    │               │   │
│  │  │  Fetcher   │ │  Monitor   │ │  Service   │               │   │
│  │  └────────────┘ └────────────┘ └────────────┘               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────┴───────────────────────────────────┐   │
│  │                    External Services                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                │   │
│  │  │  Solana    │ │  Jupiter   │ │  LLM7 Pi   │                │   │
│  │  │  RPC/WS    │ │ Aggregator │ │  API       │                │   │
│  │  └────────────┘ └────────────┘ └────────────┘                │   │
│  │  ┌────────────┐ ┌────────────┐                                │   │
│  │  │Dexscreener │ │  Birdeye   │                                │   │
│  │  │   API      │ │   API      │                                │   │
│  │  └────────────┘ └────────────┘                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

The backend is built on Flask with Flask-SocketIO for real-time communication and Eventlet for async task management. All services are instantiated in `main.py` and registered in the Flask app context for easy access from route blueprints.

### Entry Point (`backend/src/main.py`)

The main entry point performs the following initialization steps:

1. Creates the Flask application with CORS enabled for all origins
2. Initializes Flask-SocketIO with eventlet async mode
3. Instantiates all services in the correct dependency order:
   - `WalletService` (no dependencies)
   - `TradingService` (depends on socketio)
   - `MempoolMonitorService` (depends on socketio)
   - `DataFetcherService` (depends on socketio)
   - `AIAnalysisService` (depends on socketio)
   - `AutoTraderService` (depends on all other services)
4. Registers all route blueprints
5. Starts the mempool monitor as a background task
6. Starts the SocketIO server on port 5000

### Configuration (`backend/src/config.py`)

Centralizes all configuration loaded from environment variables:
- `DEXSCREENER_API_KEY`: Dexscreener API authentication
- `BIRDEYE_API_KEY`: Birdeye API authentication
- `LLM7_API_KEY`: LLM7 Pi API authentication
- `SOLANA_PRIVATE_KEY`: Base58-encoded private key for wallet operations
- `SOLANA_RPC_URL`: Solana RPC endpoint URL
- `SOLANA_WS_URL`: Solana WebSocket endpoint URL

### Route Blueprints (`backend/src/routes/`)

API endpoints are organized into modular blueprints:

| Blueprint | Prefix | Purpose |
|-----------|--------|---------|
| `tokens_bp` | `/api/tokens` | Token data retrieval |
| `ai_bp` | `/api/ai` | AI analysis endpoints |
| `scanner_bp` | `/api/scanner` | Token scanning |
| `mempool_bp` | `/api/mempool` | Mempool monitor control |
| `trading_bp` | `/api/trading` | Manual trading operations |
| `wallet_bp` | `/api/wallet` | Wallet information |
| `auto_trader_bp` | `/api/auto-trader` | Auto-trader control and config |

---

## Service Layer

### DataFetcherService (`services/data_fetcher.py`)

Responsible for aggregating token data from multiple external APIs:

- **Dexscreener Integration**: Fetches real-time token prices, liquidity information, 24-hour volume, and market cap data via Dexscreener's REST API using `aiohttp` for async HTTP requests.
- **Birdeye Integration**: Provides supplementary market data including holder distribution, transaction history, and additional price feeds.
- **Data Normalization**: Normalizes data from different sources into a consistent internal format, handling differences in field names, data types, and response structures.

The service emits `price_update` WebSocket events when significant price changes are detected for tracked tokens.

### MempoolMonitorService (`services/mempool_monitor.py`)

Connects to the Solana blockchain via WebSocket to monitor real-time transactions:

- **New Token Detection**: Parses transaction instructions to identify `initializeMint` operations, which indicate new token creation. This provides the earliest possible detection of new tokens before they appear on aggregators.
- **Rugpull Detection**: Analyzes transaction logs and token program instructions for suspicious activity:
  - Large token transfers from dev wallets
  - Liquidity pool removal transactions
  - Token burns by the creator
  - Account closure instructions
- **Event Emission**: Emits `new_token` events for newly detected tokens and `rugpull_alert` events when suspicious activity is identified.

The monitor runs as a background task started via `socketio.start_background_task()` and operates continuously while the server is running.

### AIAnalysisService (`services/ai_analysis.py`)

Integrates with the LLM7 Pi API for intelligent token analysis:

- **Token Analysis**: Sends token data (price, liquidity, volume, holder count, contract details) to the LLM for comprehensive evaluation.
- **Risk Assessment**: The LLM evaluates contract-level risks including honeypot potential, max transaction limits, blacklist functionality, and mint authority.
- **Trading Signals**: Generates structured recommendations with probability scores (0-100) and risk levels (Low/Medium/High).
- **Decision Support**: The analysis output directly feeds into the auto-trader's buy/sell decision logic.

### TradingService (`services/trading_service.py`)

Executes real on-chain transactions via Jupiter Aggregator v6:

- **Buy Orders**: Swaps SOL for target tokens by:
  1. Converting SOL amount to lamports
  2. Fetching a swap quote from Jupiter's `/quote` endpoint
  3. Requesting swap instructions from Jupiter's `/swap` endpoint
  4. Deserializing the base64-encoded `VersionedTransaction`
  5. Signing with the wallet's keypair
  6. Sending the raw transaction to the Solana RPC
  7. Confirming the transaction on-chain

- **Sell Orders**: Swaps target tokens back to SOL following the same flow, with dynamic decimal fetching for accurate token amounts.

- **Emergency Sells**: Used during rugpull events with maximum slippage (100%) to ensure the fastest possible exit regardless of price impact.

### WalletService (`services/wallet_service.py`)

Manages the single Solana wallet derived from the environment-provided private key:

- **Key Management**: Loads the base58-encoded private key at startup and creates a `Keypair` object using the `solders` library.
- **Balance Checking**: Queries the Solana RPC for SOL balance and SPL token account balances.
- **Token Account Fetching**: Retrieves all token accounts owned by the wallet for portfolio tracking.

The wallet service is a singleton that provides the keypair and address to other services (primarily `TradingService`) for transaction signing.

### AutoTraderService (`services/auto_trader.py`)

The core automated trading engine that orchestrates the full scan-analyze-trade pipeline:

- **Scan Loop**: Periodically scans for new tokens via `DataFetcherService`, applying initial filters (minimum liquidity, maximum age, minimum volume).
- **AI Evaluation**: For tokens passing initial filters, requests AI analysis via `AIAnalysisService`. Only tokens with recommendation "Buy", probability score above the threshold, and risk assessment not "High" are considered for purchase.
- **Order Execution**: For approved tokens, executes buy orders via `TradingService` with the configured SOL amount and slippage.
- **Position Monitoring**: Tracks owned tokens and monitors for sell conditions:
  - **Profit Target**: Sells when price reaches the configured multiplier (e.g., 2x)
  - **Stop-Loss**: Sells when price drops below the configured percentage from buy price
  - **Rugpull Emergency**: Sells immediately with maximum slippage upon receiving a `rugpull_alert` event
- **Configuration Management**: Loads and saves trading parameters to `auto_trader_config.json`, allowing runtime configuration through the UI.

---

## Frontend Architecture

The frontend is built with React 19, using Vite as the build tool and a modern component architecture.

### Routing (`App.jsx`)

Uses React Router v7 with `BrowserRouter` for client-side routing. Each page is wrapped in a `framer-motion` transition for smooth navigation. The route structure includes:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `DashboardPage` | Main dashboard with auto-trader status |
| `/scanner` | `TokenScannerPage` | Token discovery and real-time alerts |
| `/trading` | `TradingPage` | Manual trading interface |
| `/wallet` | `WalletPage` | Wallet overview and token holdings |
| `/watchlist` | `WatchlistPage` | Watchlist management |
| `/analytics` | `AnalyticsPage` | Trading performance analytics |
| `/settings` | `SettingsPage` | Configuration including auto-trader params |
| `/terms` | `TermsPage` | Terms of service |
| `/privacy` | `PrivacyPage` | Privacy policy |

### State Management

State is managed through React Context providers:

- **ApiContext**: Provides HTTP API communication functions for all backend endpoints. Handles request formatting, error handling, and response parsing.
- **WebSocketContext**: Manages the SocketIO connection and provides real-time event handlers for `new_token`, `price_update`, `trade_executed`, `rugpull_alert`, `auto_trade_event`, and `trading_status` events.
- **ThemeContext**: Manages dark/light mode theming.

### Component Library

Uses shadcn/ui components built on Radix UI primitives for accessible, customizable UI elements. The component library includes 40+ components ranging from basic buttons and inputs to complex data tables, charts, and form controls.

---

## Real-Time Communication

### WebSocket Architecture

The platform uses Flask-SocketIO with eventlet for bidirectional real-time communication between the backend and frontend:

```
Backend Service                    Frontend
     │                                │
     ├── emit('new_token', data) ────►│  WebSocketContext
     │                                │  → TokenScannerPage
     │                                │
     ├── emit('price_update', data) ─►│  WebSocketContext
     │                                │  → WatchlistPage, TradingPage
     │                                │
     ├── emit('trade_executed') ─────►│  WebSocketContext
     │                                │  → TradingPage, DashboardPage
     │                                │
     ├── emit('rugpull_alert') ──────►│  WebSocketContext
     │                                │  → DashboardPage, TokenScannerPage
     │                                │
     ├── emit('auto_trade_event') ───►│  WebSocketContext
     │                                │  → DashboardPage, TradingPage
     │                                │
     └── emit('trading_status') ─────►│  WebSocketContext
                                      │  → DashboardPage, SettingsPage
```

---

## Trading Pipeline

### Automated Trade Lifecycle

```
1. Mempool Detection         2. Data Enrichment          3. AI Analysis
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│ Solana WebSocket │───►│ DataFetcherService   │───►│ AIAnalysisService│
│ new_token event  │    │ Dexscreener + Birdeye│    │ LLM7 Pi API      │
└──────────────────┘    └──────────────────────┘    └────────┬─────────┘
                                                             │
                        4. Filter & Decision                           │
                    ┌──────────────────────┐                       │
                    │  AutoTraderService   │◄──────────────────────┘
                    │  - Liquidity check   │
                    │  - Volume check      │
                    │  - AI score check    │
                    │  - Risk assessment   │
                    └──────────┬───────────┘
                               │ BUY approved
                               ▼
                    ┌──────────────────────┐
                    │  TradingService      │
                    │  Jupiter Aggregator  │───► Solana RPC
                    │  Swap + Sign + Send  │
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Position Monitoring │
                    │  - Profit target     │
                    │  - Stop-loss         │
                    │  - Rugpull alert     │
                    └──────────────────────┘
```

---

## Anti-Rug Protection System

The anti-rug system operates at three layers:

### Layer 1: Mempool Monitoring

The `MempoolMonitorService` continuously monitors Solana transactions for suspicious patterns:
- **Dev wallet sells**: Large token transfers from the creator's wallet shortly after launch
- **Liquidity removal**: Transactions that remove SOL from the liquidity pool
- **Token burns**: Creator burning their own tokens (often a precursor to abandonment)
- **Account closures**: Closing of token or pool accounts by the creator

### Layer 2: AI Contract Analysis

The `AIAnalysisService` evaluates contract-level risks:
- **Honeypot detection**: Contracts that prevent selling
- **Max transaction limits**: Restrictions on trade size
- **Blacklist functionality**: Ability to block specific wallets
- **Mint authority**: Whether new tokens can be minted, diluting value
- **Freeze authority**: Whether tokens can be frozen

### Layer 3: Emergency Sell Mechanism

When a rugpull alert is triggered:
1. The `MempoolMonitorService` emits a `rugpull_alert` event
2. The `AutoTraderService` receives the event and checks if the affected token is owned
3. If owned, an emergency sell is executed via `TradingService` with maximum slippage (100%)
4. The position is removed from the owned tokens tracker
5. An `auto_trade_event` is emitted to notify the frontend

---

## Security Architecture

### Private Key Handling

The private key follows a strict security protocol:
- Loaded from the `SOLANA_PRIVATE_KEY` environment variable at startup only
- Stored in memory as a `solders.Keypair` object; never written to disk
- Never exposed through API endpoints or WebSocket events
- The frontend never has access to the private key; all signing operations occur server-side

### API Key Management

- All API keys are loaded from environment variables via `config.py`
- Keys are never logged, printed, or included in error messages
- The `.gitignore` file excludes `.env` files from version control

### Input Validation

- All API endpoints validate input parameters before processing
- Token addresses are validated as valid Solana public keys
- Numeric parameters are range-checked to prevent invalid configurations

---

## Data Flow Diagrams

### Manual Trade Flow

```
User → Frontend (TradingPage)
     → ApiContext.executeBuy()
     → POST /api/trading/buy
     → TradingService.execute_buy_order()
     → Jupiter /quote → /swap
     → Sign transaction (WalletService.keypair)
     → Solana RPC send_raw_transaction
     → Confirm transaction
     → Emit 'trade_executed' event
     → Frontend WebSocketContext updates TradingPage
```

### Auto-Trade Flow

```
AutoTraderService._trade_loop()
     → _scan_and_buy()
       → DataFetcherService.get_all_tokens()
       → Filter by liquidity, volume, age
       → AIAnalysisService.analyze_token()
       → TradingService.execute_buy_order()
       → Emit 'auto_trade_event'
     → _monitor_and_sell()
       → DataFetcherService.get_token_by_address()
       → Check profit target / stop-loss
       → TradingService.execute_sell_order()
       → Emit 'auto_trade_event'
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Backend Framework | Flask | 3.1.1 | REST API server |
| Real-Time | Flask-SocketIO + Eventlet | 5.3.0 / 0.33.3 | WebSocket communication |
| Blockchain | solana-py | 0.29.1 | Solana RPC interaction |
| Crypto | solders | 0.14.0 | Keypair, transaction signing |
| HTTP Client | httpx | 0.27.0 | Async HTTP for external APIs |
| Frontend Framework | React | 19.1 | UI components |
| Routing | React Router | 7.6 | Client-side routing |
| Styling | Tailwind CSS | 4.1 | Utility-first CSS |
| UI Components | shadcn/ui + Radix | Latest | Accessible component library |
| Build Tool | Vite | 6.3 | Fast development builds |
| Animation | Framer Motion | 12.15 | Page transitions and UI animations |
| Charts | Recharts | 2.15 | Data visualization |
| Package Manager | pnpm | 10.4 | Frontend dependency management |

---

## Deployment Considerations

### Production Backend

For production deployment, consider the following:

- Replace Flask's development server with Gunicorn behind an Nginx reverse proxy
- Use a dedicated Solana RPC provider (e.g., Helius, QuickNode) for lower latency and higher rate limits
- Enable HTTPS for all API communication
- Use a process manager (systemd, PM2) for automatic restarts
- Implement proper logging with rotation and external aggregation
- Consider using Redis for session management and caching

### Production Frontend

- Build the frontend with `pnpm run build` and serve the static files via Nginx
- Enable gzip compression for static assets
- Configure proper caching headers for immutable assets
- Use CDN for static asset delivery

### Environment Security

- Never expose the backend server directly to the internet without authentication
- Use a reverse proxy with rate limiting
- Store the private key in a secure secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) instead of a `.env` file
- Regularly rotate API keys
- Monitor wallet activity for unauthorized transactions

---

## Extensibility Guide

### Adding a New External Data Source

1. Extend `DataFetcherService` with a new method for the external API
2. Create an `aiohttp` session for async HTTP requests
3. Implement data normalization to match the internal token data format
4. Add API key configuration to `config.py`
5. Emit `price_update` events for new data

### Adding a New Trading Strategy

1. Extend `AutoTraderService` with new filtering or decision logic
2. Add new configuration parameters to the default config dictionary
3. Update the frontend `SettingsPage` with controls for the new parameters
4. Test thoroughly with simulated data before enabling real trading

### Adding Telegram Notifications

1. Create a new `TelegramNotifierService` in `services/`
2. Use the `python-telegram-bot` library for bot communication
3. Register the service in `main.py`
4. Subscribe to relevant events (trade_executed, rugpull_alert, etc.)
5. Format and send notifications to the configured Telegram chat

### Adding Advanced Order Types

1. Extend `TradingService` with new order execution methods
2. Implement order tracking in a database (SQLite or PostgreSQL)
3. Create a background task for monitoring limit order conditions
4. Add API endpoints for order creation and management
5. Build corresponding frontend UI components

---

## Related Projects

- [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) - The broader AI-native financial intelligence ecosystem
- [Misi-Screener](https://github.com/mulkymalikuldhrs/Misi-Screener) - AI-driven hedge fund platform for traditional markets

## Author

**Mulky Malikul Dhaher**

- Email: mulkymalikuldhaher@email.com
- GitHub: [@mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)
