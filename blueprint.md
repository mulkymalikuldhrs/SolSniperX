# SolSniperX - Automated Memecoin Trading Bot Blueprint

## 1. Vision & Core Functionality

SolSniperX has been transformed into a fully automated, high-probability memecoin trading bot, akin to "Trojan bot," "Flux bot," "GMGN," or "Hyperliquid." The bot now identifies promising memecoins, executes trades (buy/sell) automatically, and implements anti-rugpull measures, all powered by an LLM for advanced analysis and decision-making. The system operates without traditional user login/registration, relying on a securely provided private key for wallet access.

## 2. Key Features (Implemented)

*   **High-Probability Memecoin Identification:**
    *   Real-time monitoring of new token listings on platforms like Pump.fun (via mempool analysis), Dexscreener, and Birdeye.
    *   Mempool monitoring for early detection of new token launches on Solana, with improved transaction parsing.
    *   Liquidity filtering and analysis.
*   **LLM-Powered Analysis & Decision Making:**
    *   Integration with LLM7 Pi (or a specified LLM) for in-depth analysis of token potential, contract risks, community sentiment, and market dynamics.
    *   The LLM informs automated buy/sell decisions and anti-rugpull strategies.
*   **Automated Trading Execution:**
    *   Automatic buy orders based on predefined parameters (e.g., amount, slippage) and can auto-sell at target profits (2x, 3x, trailing stop).
    *   Integration with Jupiter Aggregator for real swaps.
*   **Anti-Rug Protection:**
    *   Basic implementation of real-time monitoring for liquidity pool changes (via transaction log analysis).
    *   Basic detection of suspicious token transfers and burns.
    *   Automated emergency sell (cut-loss) on rugpull alerts.
*   **Wallet Integration (Private Key Based):**
    *   Direct connection to a Solana wallet using a private key (provided securely via environment variable).
    *   No traditional login/registration system.
    *   Secure handling of the private key (loaded from environment variable, not persisted).
*   **Real API Integrations:**
    *   Dexscreener API for token data (prices, liquidity, volume).
    *   Birdeye API for additional market data.
    *   Solana RPC for mempool monitoring, transaction submission, and wallet balance checks.
*   **Intuitive Web Interface:**
    *   Display of identified high-probability tokens.
    *   Real-time trading activity and wallet performance.
    *   Configuration options for automated trading parameters.

## 3. Architecture Overview (Current State)

### Backend (Python Flask)

*   **`main.py`**: Main application entry point. Initializes services, manages API endpoints, and starts background tasks.
*   **`src/services/data_fetcher.py`**:
    *   Fetches real-time token data from Dexscreener and Birdeye APIs.
    *   Handles data processing and normalization.
*   **`src/services/mempool_monitor.py`**:
    *   Connects to Solana RPC WebSocket to monitor new transactions.
    *   Parses transaction instructions to identify new token mints.
    *   Implements basic rugpull detection by analyzing transaction logs and token program instructions.
*   **`src/services/ai_analysis.py`**:
    *   Integrates with LLM7 API for token analysis and trading signal generation.
*   **`src/services/trading_service.py`**:
    *   Executes real Solana blockchain transactions for buy/sell orders using Jupiter Aggregator.
    *   Handles transaction signing and submission.
    *   Dynamically fetches token decimals for accurate sell orders.
*   **`src/services/wallet_service.py`**:
    *   Manages a single Solana wallet derived from the `SOLANA_PRIVATE_KEY` environment variable.
    *   Interacts with Solana RPC for balance and token account information.
*   **`src/services/auto_trader.py`**:
    *   Implements the core automated trading strategy.
    *   Scans, analyzes, and executes trades based on configured parameters and AI signals.
    *   Handles emergency sells on rugpull alerts.
    *   Loads and saves its configuration to `auto_trader_config.json`.
*   **Authentication Removal**:
    *   `src/routes/user.py` and `src/models/user.py` have been removed.
    *   All user authentication/registration logic has been removed from `main.py`.

### Frontend (React)

*   **`App.jsx`**: Main application component and routing, with authentication UI removed.
*   **`src/pages/`**:
    *   `DashboardPage.jsx`: Displays auto-trader status and controls.
    *   `TokenScannerPage.jsx`: Displays real-time new token and rugpull alerts.
    *   `WalletPage.jsx`: Simplified to display single wallet balance and token holdings.
    *   `TradingPage.jsx`: Displays real-time trade executions.
    *   `SettingsPage.jsx`: Includes UI for configuring automated trading parameters.
*   **`src/components/`**: Reusable UI components, with authentication-related ones removed.
*   **`src/contexts/`**:
    *   `ApiContext.jsx`: Adapted for single-wallet and auto-trader control.
    *   `WebSocketContext.jsx`: Enhanced to handle all new WebSocket events.

## 4. Security & Private Key Handling (CRITICAL)

Given the "no login/register, only private key" requirement, secure handling of the private key is paramount.

*   **Private Key Storage:** The private key **MUST NOT** be hardcoded or stored in plain text files within the repository. It is now loaded from an environment variable (e.g., `SOLANA_PRIVATE_KEY`) when starting the backend application.
    *   **Recommendation:** Users should set this environment variable in their shell session or a `.env` file that is *not* committed to version control.
*   **API Key Storage:** Similarly, all API keys (Dexscreener, Birdeye, LLM) are loaded from environment variables (e.g., `DEXSCREENER_API_KEY`, `LLM_API_KEY`).
*   **No Persistent Storage of Private Key:** The backend loads the private key into memory only when the application starts and uses it for signing transactions. It does not persist the private key to disk.
*   **Frontend Interaction:** The frontend never directly handles the private key. All wallet operations are proxied through the backend.

## 5. Installation & Setup (Development)

Refer to `README.md` for the most up-to-date installation and setup instructions.

## 6. Future Enhancements

Refer to `TODO.md` for a detailed list of high, medium, and low priority future enhancements.
