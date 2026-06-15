# Changelog

All notable changes to this project will be documented in this file.

## [3.3.0] - 2026-06-13

### 🎯 Ultimate Intelligence Upgrade & Consolidation

This release represents the definitive, consolidated production baseline for SolSniperX v3.3.0. All intelligence features, security hardening, and autonomous resilience components have been unified into a single, mock-free production branch.

### Added
- **Social Metadata Extraction:** Enhanced `DataFetcherService` to extract social signals and developer activity metrics from real-time feeds.
- **Service Watchdog:** Implemented a robust background monitor in `main.py` that automatically restarts failed mempool or auto-trader loops.
- **Enhanced AI Intelligence:** Upgraded `AIAnalysisService` with deeper contract scanning and risk scoring powered by LLM7.
- **Autonomous Resilience:** Improved error handling and state recovery in `AutoTraderService` to handle RPC instability and API rate limits.
- **Security Hardening:** Unified input validation and sanitization across all API routes.

### Fixed
- **Consolidation Conflicts:** Resolved all versioning and feature parity issues between production branches.
- **Profit Target Compatibility:** Restored `profit_target_x` compatibility in `AutoTraderService` to align with the frontend settings interface.
- **Async Safety:** Hardened lazy-initialization patterns for all async clients to prevent loop mismatch errors.

### Changed
- **Version:** Synchronized system version to v3.3.0 across all components.
- **Production Baseline:** Established the `main` branch as the definitive v3.3.0 production source.

---
> **Contact:** Mulky Malikul Dhaher — [mulkymalikudhr@mail.com](mailto:mulkymalikudhr@mail.com)
> **Disclaimer:** This project is for Education Purpose only. Risiko apapun tidak kita tanggung. (We are not responsible for any risks or damages.)
