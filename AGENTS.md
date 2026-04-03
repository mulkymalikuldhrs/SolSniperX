# SolSniperX Agent Guide

This document provides instructions and tips for AI agents (like Jules) working on the SolSniperX codebase.

## Project Philosophy
SolSniperX is a **production-ready**, autonomous Solana trading bot. We prioritize **real data** over mocks, **reliability** over speed, and **transparency** in automated actions.

## Key Technical Decisions
- **Async Backend:** Uses `asyncio` loop in a background thread within a Flask-SocketIO app. Access it via `main.background_loop`.
- **Solana Integration:** Uses `solana.rpc.async_api.AsyncClient` and `solders` for transaction management.
- **Trading:** Integrated with Jupiter V6. All trades are recorded in a local SQLite database (`backend/src/database/app.db`).
- **AI Analysis:** LLM7 integration is the primary decision-maker for autonomous trades.
- **Robust Error Handling:** Core trading services use exhaustive exception handling to ensure continuous operation under network instability.

## Verification Checklist
When making changes, always perform the following:
1. **Branch Integrity:** Ensure you are working on the `main` branch (consolidated production state).
2. **Backend Tests:** Run `PYTHONPATH=backend/src backend/venv/bin/pytest backend/tests/`.
3. **System Verification:** Execute `PYTHONPATH=backend/src backend/venv/bin/python verify_consolidated.py` (requires backend and frontend servers running).
4. **Mock Check:** Ensure no new `mock`, `dummy`, or `simulated` logic is introduced.

## Directory Structure
- `backend/src/services/`: Core business logic (trading, monitoring, AI).
- `backend/src/routes/`: Flask API endpoints.
- `backend/src/utils/`: Database and response helpers.
- `frontend/src/`: React frontend with Tailwind CSS and Radix UI.
- `verify_consolidated.py`: Playwright-based E2E verification script.
