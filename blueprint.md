# SolSniperX - Production Architecture Blueprint

## 1. Vision
SolSniperX is a fully autonomous, high-probability memecoin trading bot for Solana. It eliminates the need for manual sniping by combining real-time mempool monitoring with AI-driven risk assessment and automated execution.

## 2. Core Architecture

### Backend (Python 3.11+ / Flask-SocketIO)
The backend uses a dual-layer execution model:
- **Synchronous Layer**: Flask handles HTTP routes and SocketIO events for the frontend.
- **Asynchronous Layer**: A dedicated `asyncio` event loop runs in a background thread, managing long-running services:
    - **`MempoolMonitorService`**: Subscribes to transaction logs via RPC WebSocket. Filters for Pump.fun and Raydium program IDs.
    - **`AutoTraderService`**: Periodically scans market data, triggers AI analysis, and manages open positions with balance-based exit logic.
    - **`TradingService`**: Interfaces with Jupiter V6 API for transaction building and signing.

### Frontend (React / Vite)
- **Real-time Data Layer**: Uses `socket.io-client` to receive `new_token`, `rugpull_alert`, and `trade_executed` events.
- **State Management**: React Contexts (`WebSocketContext`, `ApiContext`) manage global application state and connectivity.

## 3. Key Upgrades (v2.1)
- **Asynchronous Solana Client**: Migrated from `solana.rpc.api.Client` to `solana.rpc.async_api.AsyncClient` for non-blocking I/O.
- **Jupiter V6 Integration**: Full support for Versioned Transactions and optimal routing.
- **Robust Mempool Parsing**: Manual parsing of `initializeMint` and `create` instructions for early detection.
- **Enhanced Rugpull Detection**: Monitoring logs for liquidity withdrawal, burns, and account closures in real-time.
- **Secure Key Management**: Single-wallet model using `SOLANA_PRIVATE_KEY` environment variable.

## 4. Security
- Private keys are never stored on disk or sent to the frontend.
- Environment variables are used for all sensitive configuration.
- `AutoTrader` configuration is localized to `auto_trader_config.json`.

## 5. Setup for Production
- Use a high-quality RPC provider (e.g., Helius, Triton) for optimal mempool performance.
- Ensure the backend has enough compute for the background analysis tasks.
- Monitor `auto_trader_config.json` for optimal slippage and profit target settings.

---
> **Contact:** Mulky Malikul Dhaher — [mulkymalikuldhaher@email.com](mailto:mulkymalikuldhaher@email.com)
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
