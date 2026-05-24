<div align="center">

<a href="https://github.com/mulkymalikuldhrs/SolSniperX">
<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=14F195&center=true&vCenter=true&multiline=false&repeat=true&width=500&height=50&lines=SolSniperX;AI-Powered+Solana+Memecoin+Sniper;Trade+%E2%80%A2+Analyze+%E2%80%A2+Protect" alt="Typing SVG" />
</a>

<br/>

[![Version](https://img.shields.io/badge/version-1.0.0-14F195?style=for-the-badge&logo=semver)](https://github.com/mulkymalikuldhrs/SolSniperX)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/mulkymalikuldhrs/SolSniperX?style=for-the-badge&logo=github&color=yellow)](https://github.com/mulkymalikuldhrs/SolSniperX/stargazers)
[![GitHub](https://img.shields.io/badge/GitHub-mulkymalikuldhrs-181717?style=for-the-badge&logo=github)](https://github.com/mulkymalikuldhrs/SolSniperX)

<br/>

**AI-powered Solana memecoin sniper bot with automated trading, anti-rug protection, and real-time mempool monitoring.**

[🐛 Report Bug](https://github.com/mulkymalikuldhrs/SolSniperX/issues) &bull; [✨ Request Feature](https://github.com/mulkymalikuldhrs/SolSniperX/issues)

</div>

---

## 🇬🇧 English

### ✨ Overview

SolSniperX is an advanced, AI-powered bot designed to automatically detect, analyze, and execute trades on new memecoins on the Solana blockchain. It provides real-time insights, anti-rug protection, and automated trading capabilities, all accessible through a modern and intuitive web interface. The platform combines on-chain monitoring with LLM-driven analysis to identify high-probability trading opportunities before they reach mainstream attention.

> **⚠️ For Education Purpose Only** — This software is for educational and research purposes only. Trading cryptocurrencies involves significant risk.

### 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   SolSniperX Architecture                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐ │
│  │  React   │    │   Flask      │    │   Solana         │ │
│  │  Frontend│───▶│   Backend    │───▶│   Blockchain     │ │
│  │  (Vite)  │    │  (Python)    │    │  (WebSocket)     │ │
│  └──────────┘    └──────────────┘    └──────────────────┘ │
│       │                  │                    │            │
│       ▼                  ▼                    ▼            │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐ │
│  │  Dashboard│   │  AI Analysis │    │  Jupiter Aggr.   │ │
│  │  + Charts │    │  (LLM7 Pi)  │    │  (Swap Engine)   │ │
│  └──────────┘    └──────────────┘    └──────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 🎯 Features

| Feature | Description |
|---------|-------------|
| 🎯 **Real-Time Token Detection** | Monitor Pump.fun, Birdeye, Dexscreener, and Solana Mempool |
| 🤖 **AI-Powered Analysis** | LLM7 Pi assesses token potential across multiple dimensions |
| ⚡ **Automated Trading** | Auto-execute buy/sell based on predefined parameters |
| 🛡️ **Anti-Rug Protection** | Auto cut-loss triggered by on-chain rug indicators |
| 💰 **Jupiter Aggregator** | Real on-chain swaps via Jupiter Aggregator v6 |
| 📡 **Mempool Monitoring** | Real-time Solana WebSocket mempool monitoring |
| 📊 **Analytics Dashboard** | Win rates, PnL tracking, and performance charts |
| 📱 **Telegram Alerts** | Notifications for trades, rugs, and status changes |
| 🔐 **Secure Wallet** | Private key loaded in memory only, never persisted |

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/mulkymalikuldhrs/SolSniperX.git

# Backend setup
cd SolSniperX/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py

# Frontend setup (new terminal)
cd SolSniperX/frontend
pnpm install
pnpm run dev

# Or use quick start script
./start_dev.sh
```

---

## 🇮🇩 Bahasa Indonesia

### ✨ Gambaran Umum

SolSniperX adalah bot canggih berbasis AI yang dirancang untuk secara otomatis mendeteksi, menganalisis, dan mengeksekusi perdagangan pada memecoin baru di blockchain Solana. Platform ini menyediakan wawasan real-time, perlindungan anti-rug, dan kemampuan perdagangan otomatis, semuanya dapat diakses melalui antarmuka web yang modern dan intuitif.

> **⚠️ Hanya untuk Tujuan Pendidikan** — Perangkat lunak ini hanya untuk tujuan pendidikan dan penelitian. Perdagangan cryptocurrency melibatkan risiko signifikan.

### 🎯 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🎯 **Deteksi Token Real-Time** | Pantau Pump.fun, Birdeye, Dexscreener, dan Mempool Solana |
| 🤖 **Analisis Berbasis AI** | LLM7 Pi menilai potensi token di berbagai dimensi |
| ⚡ **Perdagangan Otomatis** | Eksekusi otomatis beli/jual berdasarkan parameter |
| 🛡️ **Perlindungan Anti-Rug** | Cut-loss otomatis dipicu oleh indikator rug on-chain |
| 💰 **Jupiter Aggregator** | Swap on-chain nyata melalui Jupiter Aggregator v6 |
| 📡 **Pemantauan Mempool** | Pemantauan mempool Solana WebSocket real-time |
| 📊 **Dashboard Analitik** | Tingkat kemenangan, pelacakan PnL, dan grafik performa |

### 🚀 Mulai Cepat

```bash
git clone https://github.com/mulkymalikuldhrs/SolSniperX.git
cd SolSniperX/backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python src/main.py
```

---

## 🇨🇳 中文

### ✨ 概述

SolSniperX 是一款先进的 AI 驱动机器人，旨在自动检测、分析和执行 Solana 区块链上新模因币的交易。它提供实时洞察、防跑路保护和自动交易功能，所有功能均可通过现代直观的 Web 界面访问。

> **⚠️ 仅供教育目的** — 本软件仅用于教育和研究目的。交易加密货币涉及重大风险。

### 🎯 主要功能

| 功能 | 描述 |
|------|------|
| 🎯 **实时代币检测** | 监控 Pump.fun、Birdeye、Dexscreener 和 Solana 内存池 |
| 🤖 **AI驱动分析** | LLM7 Pi 从多个维度评估代币潜力 |
| ⚡ **自动交易** | 根据预设参数自动执行买入/卖出 |
| 🛡️ **防跑路保护** | 链上跑路指标触发的自动止损 |
| 💰 **Jupiter 聚合器** | 通过 Jupiter 聚合器 v6 进行真实链上交换 |
| 📡 **内存池监控** | 实时 Solana WebSocket 内存池监控 |
| 📊 **分析仪表板** | 胜率、盈亏追踪和性能图表 |

### 🚀 快速开始

```bash
git clone https://github.com/mulkymalikuldhrs/SolSniperX.git
cd SolSniperX/backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python src/main.py
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| ![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white) | Backend |
| ![Flask](https://img.shields.io/badge/Flask-3-000000?logo=flask) | API Framework |
| ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) | Frontend |
| ![Solana](https://img.shields.io/badge/Solana-Web3.js-9945FF?logo=solana&logoColor=white) | Blockchain |
| ![Jupiter](https://img.shields.io/badge/Jupiter-Aggregator_v6-14F195) | Swap Engine |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white) | Styling |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Mulky Malikul Dhaher**

[![GitHub](https://img.shields.io/badge/GitHub-mulkymalikuldhrs-181717?style=flat&logo=github)](https://github.com/mulkymalikuldhrs)
[![Email](https://img.shields.io/badge/Email-mulkymalikuldhaher@email.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:mulkymalikuldhaher@email.com)

---

## ⚠️ Disclaimer

### 🇬🇧 English

> **⚠️ For Education Purpose Only**
> This project is provided strictly for educational and research purposes. The authors and contributors assume **no responsibility or liability** for any damages, losses, or risks arising from the use of this software. **We do not bear any responsibility or risk** for how this software is used.
> **Contact:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

### 🇮🇩 Bahasa Indonesia

> **⚠️ Hanya untuk Tujuan Pendidikan**
> Proyek ini disediakan secara ketat untuk tujuan pendidikan dan penelitian. Penulis dan kontributor **tidak bertanggung jawab atau berkewajiban** atas kerusakan, kerugian, atau risiko yang timbul dari penggunaan perangkat lunak ini. **Kami tidak menanggung tanggung jawab atau risiko** apa pun untuk penggunaan perangkat lunak ini.
> **Kontak:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

### 🇨🇳 中文

> **⚠️ 仅供教育目的**
> 本项目严格仅供教育和研究目的提供。作者和贡献者对因使用本软件而产生的任何损害、损失或风险**不承担任何责任或义务**。**我们不承担任何责任或风险**对于本软件的使用方式。
> **联系方式:** Mulky Malikul Dhaher | mulkymalikuldhaher@email.com

---

<div align="center">

Made with ❤️ by Mulky Malikul Dhaher

**For Education Purpose Only**

</div>
