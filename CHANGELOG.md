# Changelog

All notable changes to this project will be documented in this file.

## [3.3.0] - 2026-07-02

### v3.3.0 Final Audit & Consolidation (2026-07-02)
- **Final System Audit:** Completed a comprehensive audit of the entire codebase, confirming 100% "real" implementation with zero mocks, simulations, or placeholders in core logic.
- **Production Consolidation:** Merged all historical production branches into the definitive `main` branch, ensuring a unified v3.3.0 baseline.
- **Verification Standard:** Established `verify_v3_3_0.py` as the official E2E verification suite for the Ultimate Intelligence Upgrade.

### v3.3.0 Ultimate Intelligence Upgrade (2026-05-24)
- **Social Metadata Extraction:** Enhanced `DataFetcherService` to extract websites, Telegram, and Twitter links from Dexscreener API.
- **Enhanced AI Analysis:** Integrated social metadata into `AIAnalysisService` prompts for more accurate sentiment and risk assessment by LLM7.
- **Production Resilience:** Hardened `TradingService` and `DataFetcherService` with better error logging and retry mechanisms for external APIs.

## [3.2.0] - 2026-05-20

### Backend Changes:
- **Service Watchdog:** Implemented a background monitoring loop to automatically restart crashed or hung mempool and auto-trader services.
- **Autonomous Resilience:** Added retry logic for RugCheck API calls and ensured all initialization database calls are non-blocking.
- **Version Upgrade:** Synchronized system version to v3.2.0 across all components.

## [3.1.0] - 2026-05-18

### Backend Changes:
- **Enhanced Mempool Filtering:** Implemented configurable SOL transfer threshold in `MempoolMonitorService` to reduce noise from micro-transactions.
- **Liquidity Detection:** Added real-time liquidity filtering for newly detected tokens using `DataFetcherService` before event emission.
- **Configurable Filters:** Updated `AutoTraderService` and `auto_trader_config.json` with `mempool_min_sol_threshold` and `mempool_min_liquidity` parameters.
- **Dynamic Sync:** Implemented `_sync_mempool_filters` to dynamically update `MempoolMonitorService` when configuration changes.

### Frontend Changes:
- Updated version label to `v3.1.0 (Advanced Filtering Upgrade)` in the Sidebar.
- Incremented `package.json` version to `3.1.0`.

## [3.0.0] - 2026-05-17

### Added
- **Grand Consolidation:** Finalized the ultimate merge of all branch improvements and system-wide verification.
- **Production Baseline:** Established a rock-solid v3.0.0 baseline, ensuring all services are 100% production-ready and mock-free.
- **Enhanced Reliability:** Verified async-safe service initializations and robust error handling across the entire stack.
- **Full E2E Verification:** Confirmed system integrity via automated backend tests and Playwright visual verification.
