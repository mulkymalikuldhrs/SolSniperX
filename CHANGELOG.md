# Changelog

## 3.1.0 - Advanced Filtering Upgrade (2026-05-18)

### Features:
- **Advanced Mempool Filtering:** Introduced `mempool_min_sol_threshold` and `mempool_min_liquidity` parameters to reduce noise and target high-value tokens.
- **Dynamic Filter Synchronization:** Mempool filters are now dynamically updated when the AutoTrader configuration is modified.
- **Frontend Configuration Sync:** The Settings page is now fully integrated with the backend configuration API, removing all local state placeholders.
- **Production Baseline established on `main` branch:** Unified all advanced features into a single, clean production branch.

### Backend:
- Enhanced `MempoolMonitorService` with SOL transfer pre-filtering.
- Implemented `AutoTraderService._sync_mempool_filters` for real-time parameter propagation.
- Verified 100% mock-free status across all core services.

### Frontend:
- Refactored `SettingsPage` to use `ApiContext` for configuration management.
- Removed all `mockStats` and `mockRecentTrades` from `DashboardPage`.
- Updated UI version labels to v3.1.0.

## 3.0.0 - Grand Consolidation (2026-05-17)

### General:
- Established a unified, mock-free production baseline.
- Audited all services for real-world API integration.
- Consolidated repository into a single production branch.
