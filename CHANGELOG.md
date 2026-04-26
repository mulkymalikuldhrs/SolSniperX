# Changelog

All notable changes to this project will be documented in this file.

## [2.1.2] - 2026-04-26

### Added
- **System Verification:** Added `verify_consolidated.py` for comprehensive E2E system integrity checks using Playwright.
- **Mempool Buffer:** Implemented a thread-safe token buffer in `MempoolMonitorService` for robust real-time polling.
- **Branch Consolidation:** Unified `main` and `master` branches into a single production-ready state.

### Changed
- **Hardened AI Parsing:** Enhanced `AIAnalysisService` with structured JSON enforcement and regex fallbacks for robust LLM response parsing.
- **Real Solana Integration:** Verified and hardened Jupiter V6, Birdeye, and Dexscreener API integrations, ensuring no mock data is used in production.
- **Persistent State:** Finalized SQLite-backed state management for trades, positions, and analytics.
- **Async Safety:** Ensured all services are loop-safe using lazy-initialized async clients.
- **UI Synchronized:** Updated all frontend pages to consume real-time metrics and WebSocket events.

## [2.1.1] - 2026-04-14

### Added
- **Persistent Rugpull Tracking:** Added `system_stats` table to track avoided rugpulls persistently.
- **Limit Order Functionality:** Implemented buy/sell limit orders in backend and frontend.

### Changed
- **Service Hardening:** Finalized lazy-initialization pattern for all async clients.
- **Async Concurrency:** Added `eventlet` monkey patching for Flask-SocketIO compatibility.

## [2.1.0] - 2026-04-01

### Added
- **Real-time Token Security:** Integrated Birdeye `/token_security` and `/token_overview`.
- **Jupiter V6 Integration:** Switched to Jupiter V6 for optimal swap routing.
- **Autonomous Mode:** Added `AutoTraderService` for fully autonomous scanning and trading.

## [2.0.0] - 2024-05-15
- Initial public release of SolSniperX.
