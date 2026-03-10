# Changelog

All notable changes to SolSniperX will be documented in this file.

## [2.1.0] - 2025-07-25
### Added
- **Production-Ready Autonomous Upgrades:**
    - Efficient filtering for Pump.fun and Raydium using `RpcTransactionLogsFilterMentions` in `MempoolMonitorService`.
    - Integrated `socket.io-client` on the frontend for robust, event-driven WebSocket communication.
    - Full Jupiter V6 API integration for optimized trade routing and execution.
    - Transaction finality checks using signature status polling for reliable trade lifecycle management.
    - Real-time balance tracking for owned tokens using `get_token_accounts_by_owner`.
    - Implemented fixed Take-Profit, Stop-Loss, and dynamic Trailing Stop-Loss logic in `AutoTraderService`.
    - Enhanced `AIAnalysisService` with structured JSON output and robust parsing for AI signals.
    - Added dictionary-based caching for token metadata in `DataFetcherService` to respect API rate limits.
    - Integrated `python-dotenv` for consistent environment variable management in the backend.

### Fixed
- **WebSocket Compatibility:** Resolved incompatibility between `Flask-SocketIO` backend and native `WebSocket` frontend by migrating to `socket.io-client`.
- **Placeholder Logic:** Replaced multiple `TODO`s and placeholder values in `AutoTraderService` and `TradingService` with real on-chain interactions.
- **Frontend State:** Fixed missing state variables in `WebSocketContext.jsx` that caused UI inconsistencies.

### Improved
- **Service Initialization:** Standardized service instantiation and background task management in `main.py`.
- **Documentation:** Updated `README.md` to reflect the transition from prototype to professional-grade autonomous bot.

## [2.0.0] - Initial Release
- Basic AI-powered Solana sniper bot functionality.
- Flask backend and React/Vite frontend.
- Dexscreener and Birdeye data fetching.
- Manual and automated trading prototype.
