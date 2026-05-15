# SolSniperX Agent Guide

This document provides instructions and tips for AI agents working on the SolSniperX codebase.

## Project Philosophy
SolSniperX is a **production-ready**, autonomous Solana trading bot. We prioritize **real data** over mocks, **reliability** over speed, and **transparency** in automated actions.

## Key Technical Decisions
- **Async Backend:** Uses `asyncio` loop in a background thread within a Flask-SocketIO app. Access it via `main.background_loop`.
- **Async Safety:** Services use lazy-initialized async clients (via `@property`) to ensure they are created within the context of the background event loop, avoiding `RuntimeError: Loop mismatch`.
- **Service Initialization:** Services follow a singleton pattern (exported as `service_instance`). In `main.py`, these instances are configured with `socketio` and cross-linked before the background loop starts.
- **Solana Integration:** Uses `solana.rpc.async_api.AsyncClient` and `solders` for transaction management.
- **Trading:** Integrated with Jupiter V6. All trades are recorded in a local SQLite database (`backend/src/database/app.db`).
- **Persistence:** All stats (profit, success rate, rugs avoided) are derived from real trade records in SQLite.
- **Limit Orders:** Background `limit_order_loop` in `main.py` polls pending orders from SQLite and executes them via `TradingService`.

## Verification Checklist
When making changes, always perform the following:
1. **Backend Tests:** Run `PYTHONPATH=backend/src pytest backend/tests/`.
2. **System Verification:** Execute `python3 verify_consolidated.py` (requires backend and frontend servers running).
3. **Audit Status:** As of 2026-05-07, a full system audit confirmed that all core services (Trading, Wallet, Mempool, AI) are 100% mock-free and use real Solana/Jupiter/Birdeye APIs.
4. **Mock Check:** Ensure no new `mock`, `placeholder`, `dummy`, or `simulated` logic is introduced.
4. **Data Integrity:** Verify that UI components consume data from `/api/analytics/dashboard` rather than using local state placeholders.

## Directory Structure
- `backend/src/services/`: Core business logic (trading, monitoring, AI).
- `backend/src/routes/`: Flask API endpoints.
- `backend/src/utils/`: Database and response helpers.
- `frontend/src/`: React frontend with Tailwind CSS and Radix UI.
- `verify_consolidated.py`: Playwright-based E2E verification script.
