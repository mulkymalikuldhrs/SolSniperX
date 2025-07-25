# Changelog

## 2025-07-22 - Initial Setup & Core Refactoring

### Backend Changes:
- Cloned the repository and installed initial dependencies.
- Created `backend/src/services/data_fetcher.py` to centralize token data fetching.
- Updated `backend/src/main.py` to use `data_fetcher_service`.
- Enhanced simulated data in `backend/src/services/data_fetcher.py` to be dynamic.
- Created `backend/src/config.py` for API keys and base URLs.
- Integrated `config.py` into `backend/src/services/data_fetcher.py` and `backend/src/services/ai_analysis.py`.
- Enhanced simulated AI analysis and trading signals logic in `backend/src/services/ai_analysis.py`.
- Created `backend/src/services/mempool_monitor.py` for simulated new token detection.
- Integrated `mempool_monitor.py` into `backend/src/main.py`.
- Created `backend/src/services/trading_service.py` for simulated buy/sell operations.
- Integrated `trading_service.py` into `backend/src/main.py`.
- Created `backend/src/services/wallet_service.py` for simulated wallet management.
- Integrated `wallet_service.py` into `backend/src/main.py`.
- Added Flask-SocketIO and Eventlet to `requirements.txt`.
- Modified `main.py` to initialize Flask-SocketIO and pass `socketio` object to `mempool_monitor_service`.

### Frontend Changes:
- Updated `frontend/src/contexts/ApiContext.jsx` to use new backend endpoints and added wallet management functions.
- Updated `frontend/src/pages/TokenScannerPage.jsx` to use `ApiContext` for token scanning.
- Updated `frontend/src/components/ai/AIAnalysisPanel.jsx` to use `ApiContext` for AI analysis.
- Updated `frontend/src/components/ai/TradingSignalsPanel.jsx` to use `ApiContext` for trading signals.
- Updated `frontend/src/pages/TradingPage.jsx` for manual buy/sell operations using `ApiContext`.
- Updated `frontend/src/pages/WalletPage.jsx` to use `ApiContext` for wallet management (fetching, adding, deleting wallets).

### General:
- Created `start_dev.sh` launcher script to automatically start both backend and frontend servers.

## 2025-07-22 - Automated Trading Bot Transformation

### Backend Changes:
- **Authentication System Removed:**
  - Deleted `backend/src/routes/user.py` and `backend/src/models/user.py`.
  - Removed user-related routes and logic from `backend/src/main.py`.
- **Configuration Updated:**
  - Modified `backend/src/config.py` to load API keys (Dexscreener, Birdeye, LLM7) and `SOLANA_PRIVATE_KEY` from environment variables.
  - Added `SOLANA_RPC_URL` and `SOLANA_WS_URL` to `config.py`.
- **Wallet Service Reworked:**
  - Transformed `backend/src/services/wallet_service.py` to manage a single Solana wallet using the provided private key.
  - Integrated with Solana RPC for real balance checks and token account fetching.
  - Removed simulated wallet management (add, update, delete).
- **Data Fetcher Integrated with Real APIs:**
  - Updated `backend/src/services/data_fetcher.py` to make actual `aiohttp` calls to Dexscreener and Birdeye APIs.
  - Implemented basic processing of Dexscreener and Birdeye responses.
  - Removed simulated token data generation.
- **Mempool Monitor for Real-time Detection & Rugpulls:**
  - Updated `backend/src/services/mempool_monitor.py` to connect to Solana WebSocket for real-time transaction monitoring.
  - Added logic to detect potential new token creation transactions (`initializeMint`).
  - Implemented basic rugpull detection by analyzing transaction logs for keywords and token program instructions (large transfers, burns, account closures).
- **Trading Service for Real Transactions (Jupiter Aggregator):**
  - Updated `backend/src/services/trading_service.py` to integrate with Jupiter Aggregator API for real buy and sell swaps.
  - Implemented fetching swap instructions from Jupiter, signing with wallet private key, and sending raw transactions.
  - Added dynamic fetching of token decimals for sell orders.
- **Automated Trading Logic (`AutoTraderService`):**
  - Created `backend/src/services/auto_trader.py` to encapsulate automated trading logic.
  - Implemented periodic scanning for tokens, AI analysis, and automated buy/sell based on configurable parameters (min liquidity, max age, min volume, AI probability score, buy amount, slippage, profit target, stop loss).
  - Integrated `auto_trader.py` with `main.py` with start/stop API endpoints.
  - Implemented `auto_trader.py` to listen for `rugpull_alert` WebSocket events and trigger emergency sell orders for affected owned tokens.
  - Added configuration loading and saving for `auto_trader.py` to `auto_trader_config.json`.
- **Dependencies Updated:**
  - Updated `MarkupSafe` version to `>=2.1.0` for broader compatibility.
  - Updated `solders` version to `0.14.0` to resolve dependency conflicts with `solana`.
  - Added `solana`, `solders`, `base58`, and `requests` to `backend/requirements.txt`.

### Frontend Changes:
- **Authentication UI Removed:**
  - Deleted `frontend/src/pages/auth/LoginPage.jsx` and `frontend/src/pages/auth/RegisterPage.jsx`.
  - Deleted `frontend/src/components/auth/LoginModal.jsx` and `frontend/src/components/auth/RegisterModal.jsx`.
  - Removed `AuthContext` from `frontend/src/contexts/`.
  - Updated `frontend/src/App.jsx` to remove authentication-related imports, state, and UI elements.
  - Updated `frontend/src/components/layout/Navbar.jsx` to remove login/register buttons and associated logic.
- **API Context Adapted:**
  - Modified `frontend/src/contexts/ApiContext.jsx` to remove functions for adding, updating, and deleting wallets, aligning with the single-wallet approach.
  - Added `startAutoTrader` and `stopAutoTrader` functions to `ApiContext`.
- **WebSocket Context Enhanced:**
  - Updated `frontend/src/contexts/WebSocketContext.jsx` to handle new WebSocket events: `new_token`, `price_update`, `trade_executed`, `rugpull_alert`, `auto_trade_event`, and `trading_status`.
- **Wallet Page Simplified:**
  - Updated `frontend/src/pages/WalletPage.jsx` to reflect the single, private-key-derived wallet, removing UI elements for multiple wallet management (selection, add, delete).
  - Updated to display real-time wallet balance and token holdings via WebSocket.
- **Dashboard Page Updated:**
  - Updated `frontend/src/pages/DashboardPage.jsx` to display auto-trader status and provide start/stop controls.
- **Token Scanner Page Updated:**
  - Updated `frontend/src/pages/TokenScannerPage.jsx` to display real-time new token and rugpull alerts.
- **Trading Page Updated:**
  - Updated `frontend/src/pages/TradingPage.jsx` to display real-time trade executions.
- **Settings Page Updated:**
  - Updated `frontend/src/pages/SettingsPage.jsx` to include automated trading configuration UI, allowing users to adjust parameters for the `AutoTraderService`.
