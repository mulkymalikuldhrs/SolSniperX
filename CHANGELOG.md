# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2024-05-20

### Added
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
- Fixed `RuntimeError: Install Flask with the 'async' extra` when using asynchronous routes.
- Resolved WebSocket connection stability issues by implementing non-recursive reconnection logic with exponential backoff.
- Fixed incorrect decimal parsing in SPL-Token account data by using manual byte slicing for consistent results across Solana versions.

## [2.0.0] - 2024-05-15
- Initial public release of SolSniperX.
- Basic mempool monitoring and automated trading.
- React-based dashboard with simulated data.
