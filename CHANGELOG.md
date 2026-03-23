# Changelog

## [2.1.0] - 2026-03-22 - SolSniperX Consolidation & Upgrade

### Consolidated Backend Features:
- **Full Asynchronous RPC Integration:** Migrated all Solana RPC calls to `solana.rpc.async_api.AsyncClient` for high-performance non-blocking operations.
- **Enhanced Mempool Monitoring:** Implemented real-time transaction parsing for Pump.fun and Raydium launches with robust reconnection and exponential backoff.
- **Real-World Trading (Jupiter V6):** Integrated with Jupiter Aggregator API for optimal routing and minimal slippage in on-chain swaps.
- **Persistent State Management:** Added SQLite database (`backend/src/database/app.db`) to track active positions and trade history across bot restarts.
- **Autonomous Trading Logic:** Implemented `AutoTraderService` with dynamic trailing stop-loss, profit targets, and automated anti-rug protective sells.
- **Real-time PnL Tracking:** Added backend analytics endpoints to calculate and return real-time performance metrics based on DB and live market data.

### Frontend Enhancements:
- **Single-Wallet Model:** Fully transitioned to a private-key based access model, removing all mock authentication and simulated data login/registration flows.
- **Real-time Data Visualization:** Updated Dashboard, Trading, and Token Scanner pages to be entirely data-driven, using live backend API and Socket.IO events.
- **Portfolio Management:** Simplified Wallet page to focus on single-wallet SOL and SPL token balances with real-time updates.
- **Anti-Rug UI:** Integrated rugpull alerts and automatic bot reaction feedback into the live scanner and trading views.

### System Infrastructure:
- **Portable Dev Launcher:** Updated `start_dev.sh` to use relative paths and support multiple environment configurations.
- **Automated Validation Suite:** Added `verify_consolidated.py` for full system validation using Playwright and comprehensive backend unit tests.
- **Codebase Cleanup:** Removed legacy mock services, build artifacts, and binary DB files from version control.

## [2.0.0] - 2025-07-22 - Automated Trading Bot Transformation

### Backend Changes:
- Authentication system removal (Login/Register removed).
- Configuration loading from environment variables.
- Wallet Service reworked for single private-key access.
- Data Fetcher integrated with real Dexscreener and Birdeye APIs.
- Mempool Monitor updated for real-time Solana WebSocket connectivity.
- Trading Service updated for Jupiter swap integration.
- `AutoTraderService` created for autonomous trading strategy execution.

### Frontend Changes:
- Authentication UI and Context removed.
- API Context adapted for single-wallet and auto-trader control.
- WebSocket Context enhanced for real-time price and trade events.
- Wallet, Dashboard, and Scanner pages updated for real API data.
- Settings page added for bot configuration.

## [1.0.0] - 2025-07-22 - Initial Setup & Refactoring

### General:
- Initial project setup with basic Flask and React architecture.
- Centralized data fetching and basic AI analysis simulation.
- Created `start_dev.sh` launcher script.
