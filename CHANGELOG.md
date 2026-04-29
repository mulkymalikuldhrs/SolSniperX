# Changelog

All notable changes to this project will be documented in this file.

## [2.1.2] - 2026-04-29

### Added
- **System Verification:** Added `verify_consolidated.py` for comprehensive E2E system integrity checks.
- **Mempool Buffer:** Implemented a real token buffer in `MempoolMonitorService` for the `monitor_new_tokens` polling endpoint.

### Changed
- **Consolidated Production State:** Merged and hardened all features from v2.1.1 development branches into a unified production-ready state.
- **Service Refinement:** Finalized singleton service initialization pattern in `main.py` with explicit dependency injection.
- **Limit Order Loop:** Integrated background polling for persistent limit orders (buy/sell) with 30-second intervals.
- **Persistent Analytics:** Fully integrated SQLite-backed analytics for tracking total buys, sells, and rugs avoided.
- **Real-time Monitoring:** Enhanced mempool monitoring and autonomous trade handlers (`handle_new_token`, `handle_rugpull_alert`).
- **Data resilience:** Improved Dexscreener processing to handle both standard pairs and boost-list formats.
- **UI Synchronized:** Updated `TradingPage.jsx` to support real-time settings persistence via backend `/api/auto-trader/config` endpoint.
- **Analytics Visualization:** Integrated dynamic performance charts using `recharts` in the Analytics page.
- **UX Improvements:** Removed artificial loading delays and placeholders, replaced with live data from WebSocket and REST APIs.

## [2.1.1] - 2026-04-14

### Added
- **Persistent Rugpull Tracking:** Added `system_stats` table to track avoided rugpulls persistently across restarts.
- **Improved Analytics API:** Enhanced `/api/analytics/dashboard` to include `totalBuys`, `totalSells`, and `rugsAvoided` metrics.
- **Limit Order Functionality:** Implemented support for buy and sell limit orders in both backend (service and background loop) and frontend (TradingPage).

### Changed
- **Service Hardening:** Finalized the lazy-initialization pattern (`@property`) for all async clients in `WalletService` and `MempoolMonitorService` to ensure `asyncio` loop safety across all core services.
- **Async Concurrency:** Added `eventlet` monkey patching to ensure proper cooperative multitasking with Flask-SocketIO.
- **UI Performance:** Removed artificial initialization delay in `App.jsx` for faster dashboard access.
- **Dynamic Trading UI:** Refactored `TradingPage.jsx` to consume real backend metrics and real-time WebSocket trade events instead of placeholders.
- **Autonomous Strategy Hardening:** Integrated emergency sell result verification and rugpull counter incrementing in `AutoTraderService`.
- **Dependency Upgrades:** Upgraded `httpx` to `0.28.1` and ensured `solana` and `solders` are at their latest stable production versions.

## [2.1.0] - 2026-04-01

### Added
- **Real-time Token Security:** Integrated Birdeye `/token_security` and `/token_overview` for accurate holder percentage and dev activity detection.
- **Historical OHLCV Data:** Replaced price mocks with real Birdeye OHLCV API calls for accurate PnL tracking and technical analysis.
- **Persistent Storage:** Integrated SQLite database (`backend/src/utils/db.py`) to track trades, profit, and performance metrics across restarts.
- **Real-time Analytics:** Refactored `backend/src/routes/analytics.py` to use real data from the database instead of mock placeholders.
- **Asynchronous Service Layer:** Implemented a dedicated `asyncio` event loop running in a background thread to handle `MempoolMonitorService`, `TradingService`, and `AutoTraderService` concurrently with the Flask-SocketIO server.
- **Jupiter V6 Integration:** Upgraded trading logic to use the Jupiter V6 swap API for optimal routing and slippage management.
- **Enhanced AI Analysis:** Refactored `AIAnalysisService` with structured JSON output enforcement and robust error handling for LLM7 Pi integration.
- **Advanced Filtering:** Added 0.1 SOL minimum transfer filter and specific Program ID monitoring (Pump.fun/Raydium) to reduce noise in token detection.
- **Frontend Real-time Sync:** All dashboard components (Profit, Success Rate, Trade History) now consume real data via WebSockets and REST APIs.

### Changed
- **Dependency Update:** Upgraded `solana` to `0.36.11` and `solders` to `0.27.1`.
- **Flask Async Support:** Switched to `Flask[async]` with `asgiref` to support `async def` routes and background task scheduling safely.
- **Architecture:** Consolidated multiple development branches into a single, production-ready `main` branch.
- **Frontend Refactor:** Removed all legacy authentication logic to align with the private-key based access model.

### Fixed
- **Loop Mismatch Safety:** Implemented lazy-initialization pattern (`@property`) for all async clients (`AsyncClient`, `httpx.AsyncClient`) to ensure they are created within the correct event loop context.
- Fixed `RuntimeError: Install Flask with the 'async' extra` when using asynchronous routes.
- Resolved WebSocket connection stability issues by implementing non-recursive reconnection logic with exponential backoff.
- Fixed incorrect decimal parsing in SPL-Token account data by using manual byte slicing for consistent results across Solana versions.

## [2.0.0] - 2024-05-15
- Initial public release of SolSniperX.
- Basic mempool monitoring and automated trading.
- React-based dashboard with simulated data.
