# SolSniperX Agent Guide (v3.3.0)

This document provides instructions and tips for AI agents working on the SolSniperX codebase.

## Project Philosophy
SolSniperX is a **production-ready**, autonomous Solana trading bot. We prioritize **real data** over mocks, **reliability** over speed, and **transparency** in automated actions.

## Key Technical Decisions (v3.3.0)
- **Async Backend:** Uses `asyncio` loop in a background thread within a Flask-SocketIO app. Access it via `main.background_loop`.
- **Async Safety:** Services use lazy-initialized async clients (via `@property`) to ensure they are created within the context of the background event loop, avoiding `RuntimeError: Loop mismatch`.
- **Service Initialization:** Services follow a singleton pattern. In `main.py`, these instances are configured with `socketio` and cross-linked before the background loop starts.
- **Service Watchdog:** `main.py` implements a `monitor_services_loop` that automatically restarts `mempool_monitor_service` and `auto_trader_service` if their background tasks exit unexpectedly.
- **Solana Integration:** Uses `solana.rpc.async_api.AsyncClient` and `solders` for transaction management.
- **Trading:** Integrated with Jupiter V6. All trades are recorded in a local SQLite database (`backend/src/database/app.db`).
- **Intelligence:** `DataFetcherService` extracts social metadata (X, Telegram, websites) from Dexscreener, which is then used by `AIAnalysisService` to enhance LLM7 prompts.
- **Dynamic JITO Tip:** `TradingService` fetches the 50th percentile tip from the Block Engine API to ensure competitive execution.

## Verification Checklist
When making changes, always perform the following:
1. **Backend Tests:** Run `PYTHONPATH=backend/src python3 -m pytest backend/tests/`.
2. **System Verification:** Execute `python3 verify_v3_3_0.py` (requires backend and frontend servers running).
3. **Audit Status:** As of 2026-05-24, a full system audit confirmed that all core services are 100% mock-free and use real Solana/Jupiter/Birdeye/Dexscreener/RugCheck APIs.
4. **Mock Check:** Ensure no new `mock`, `placeholder`, `dummy`, or `simulated` logic is introduced in production paths.
5. **Data Integrity:** Verify that UI components consume data from API endpoints rather than using local state placeholders.

## Directory Structure
- `backend/src/services/`: Core business logic (trading, monitoring, AI).
- `backend/src/routes/`: Flask API endpoints.
- `backend/src/utils/`: Database and response helpers.
- `frontend/src/`: React frontend with Tailwind CSS and Radix UI.
- `verify_v3_3_0.py`: Playwright-based E2E verification script for v3.3.0.
