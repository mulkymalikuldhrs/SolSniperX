<p align="center">
  <img src="https://img.shields.io/badge/SolSniperX-Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="SolSniperX">
  <img src="https://img.shields.io/badge/版本-2.0-14F195?style=for-the-badge" alt="版本">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/许可证-MIT-green?style=for-the-badge" alt="许可证">
</p>

<p align="center">
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README.md">English</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_id.md">Bahasa Indonesia</a> |
  <a href="https://github.com/mulkymalikuldhrs/SolSniperX/blob/master/README_zh.md">中文</a>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=14F195&center=true&vCenter=true&width=600&lines=AI驱动的Solana迷因币狙击机器人;自动交易+%2B+防 rug 保护;Jupiter+聚合器集成;实时内存池监控" alt="Typing SVG" />
</p>

---

## 概述

SolSniperX 是一个先进的 AI 驱动机器人，旨在自动检测、分析并执行 Solana 区块链上新迷因币的交易。它提供实时洞察、防 rug 保护和自动交易功能，所有这些都可通过现代直观的 Web 界面访问。该平台结合了链上监控与 LLM 驱动的分析，以在高概率交易机会进入主流视野之前识别它们。

本项目是 [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) 生态系统的一部分，该生态系统是跨传统和去中心化市场构建主权级 AI 原生金融智能系统的更广泛倡议。

## 核心特性

### 实时代币检测
监控 Pump.fun、Birdeye、Dexscreener 和 Solana 内存池，发现新代币上线和早期发布。内存池监控器直接连接到 Solana WebSocket 端点，实时解析传入交易并识别新代币铸造，为您提供关键的速享优势。

### AI 驱动分析
利用 AI（LLM7 Pi）从多个维度评估代币潜力，包括流动性深度、市值轨迹、持有者分布模式、开发者钱包活动以及合约危险信号（蜜罐检测、最大交易限制、黑名单功能）。LLM 生成带有概率分数的结构化买入/卖出建议，为自动交易决策提供信息。

### 自动交易执行
根据预设参数（金额、滑点）自动执行买入订单，并集成 Jupiter 聚合器 v6 进行真实的链上交换。自动交易员可以在目标利润（2倍、3倍、追踪止损）处执行卖出订单，并具有可配置的止损百分比以保护资金。

### 防 Rug 保护
实施由链上 rug 指标触发的自动止损机制：开发者钱包卖出、流动性池移除和大幅价格下跌。内存池监控器实时分析交易日志和代币程序指令，当检测到 rug 活动时，自动交易员以最大滑点执行紧急卖出订单，以最快速度退出仓位。

### 安全钱包管理
使用通过环境变量提供的私钥直接连接到 Solana 钱包。无需传统登录或注册。私钥仅在启动时加载到内存中，从不持久化到磁盘。前端从不直接处理私钥；所有钱包操作都通过后端代理。

### 直观的 Web 仪表板
使用 React、Tailwind CSS 和 shadcn/ui 组件构建的时尚、响应式和交互式用户界面，具有：
- **实时关注列表**，通过 WebSocket 实时更新价格
- **代币详情视图**，包含全面的链上指标
- **钱包绩效与盈亏**追踪
- **手动狙击模式**，用于自主交易
- **AI 分析面板**，包含 LLM 生成的洞察
- **交易信号面板**，包含概率分数
- **自动交易员控制**，包含可配置参数
- **设置**，用于自定义交易策略

### 通知
关键事件的 Telegram 提醒，包括新代币检测、已执行交易、rugpull 警告和自动交易员状态变化。

### 高级分析
追踪全面的交易绩效指标，包括胜率、每笔交易的平均盈亏、累计回报和历史绩效图表。

## 项目结构

```
SolSniperX/
├── backend/                      # Python Flask API
│   ├── src/
│   │   ├── main.py               # Flask 入口点和服务编排
│   │   ├── config.py             # API 密钥、RPC URL、环境配置
│   │   ├── routes/               # API 路由蓝图
│   │   ├── services/             # 核心业务逻辑
│   │   │   ├── ai_analysis.py          # LLM7 集成代币分析
│   │   │   ├── data_fetcher.py         # Dexscreener & Birdeye API 集成
│   │   │   ├── mempool_monitor.py      # Solana 内存池 WebSocket 监控
│   │   │   ├── trading_service.py      # Jupiter 聚合器交换执行
│   │   │   ├── wallet_service.py       # Solana 钱包管理
│   │   │   └── auto_trader.py          # 自动交易策略引擎
│   │   ├── utils/                # 共享工具
│   │   └── database/             # SQLite 数据库存储
│   └── requirements.txt          # Python 依赖
├── frontend/                     # React Web 应用
│   ├── src/
│   │   ├── App.jsx               # 主应用组件和路由
│   │   ├── pages/                # 应用页面
│   │   ├── components/           # 可复用 UI 组件
│   │   ├── contexts/             # React 上下文
│   │   ├── hooks/                # 自定义 React Hooks
│   │   └── utils/                # 本地存储和辅助工具
│   ├── package.json              # Node.js 依赖
│   └── vite.config.js            # Vite 构建配置
├── start_dev.sh                  # 开发启动脚本
├── blueprint.md                  # 项目蓝图和架构说明
└── TODO.md                       # 开发路线图
```

## 安装与设置

### 前提条件

- Python 3.11+
- Node.js 18+（用于 pnpm）
- pnpm 10+

### 环境变量

在 `backend` 目录中创建 `.env` 文件（或直接在 shell 中设置）：

```env
DEXSCREENER_API_KEY="YOUR_DEXSCREENER_API_KEY"
BIRDEYE_API_KEY="YOUR_BIRDEYE_API_KEY"
LLM7_API_KEY="YOUR_LLM7_API_KEY"
SOLANA_PRIVATE_KEY="YOUR_SOLANA_WALLET_PRIVATE_KEY_BASE58_ENCODED"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
SOLANA_WS_URL="wss://api.mainnet-beta.solana.com/"
```

**警告：** 切勿将您的私钥或 API 密钥提交到版本控制。使用环境变量或安全的密钥管理系统。

### 后端设置

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

后端服务器在 `http://0.0.0.0:5000` 启动。

### 前端设置

```bash
cd frontend
pnpm install
pnpm run dev
```

前端开发服务器在 `http://localhost:5173` 启动。

### 快速启动（双服务器）

```bash
./start_dev.sh
```

## 自动交易员配置

自动交易员可以通过设置页面配置或修改 `auto_trader_config.json`：

| 参数 | 默认值 | 描述 |
|------|--------|------|
| `min_liquidity` | 10000 | 代币考虑的最低流动性（USD） |
| `max_age_hours` | 24 | 代币考虑的最大年龄（小时） |
| `min_volume_24h` | 50000 | 最低 24 小时交易量（USD） |
| `min_ai_probability_score` | 70 | 买入的最低 AI 概率分数（0-100） |
| `buy_amount_sol` | 0.01 | 每笔买入订单的 SOL 金额 |
| `slippage` | 1.0 | 默认滑点容忍度（%） |
| `profit_target_x` | 2.0 | 利润目标倍数（2x = 100% 收益） |
| `stop_loss_percentage` | 0.20 | 止损阈值（20% = 在买入价的 80% 卖出） |
| `max_risk_score` | 30 | 考虑买入的最大 AI 风险分数 |

## 文档

- [架构指南](./ARCHITECTURE.md) - 详细的系统架构和组件交互
- [贡献指南](./CONTRIBUTING.md) - 如何为 SolSniperX 做贡献
- [更新日志](./CHANGELOG.md) - 发布历史和重要变更
- [蓝图](./blueprint.md) - 项目蓝图和转型说明
- [待办事项](./TODO.md) - 开发路线图和未来增强

## 相关项目

- [HermesQuantOS](https://github.com/mulkymalikuldhrs/HermesQuantOS) - 更广泛的 AI 原生金融智能生态系统
- [Misi-Screener](https://github.com/mulkymalikuldhrs/Misi-Screener) - 面向传统市场的 AI 驱动对冲基金平台

## 许可证

本项目根据 MIT 许可证授权。详见 [LICENSE](./LICENSE)。

## 作者

**Mulky Malikul Dhaher**

- 电子邮件：mulkymalikuldhaher@email.com
- GitHub：[@mulkymalikuldhrs](https://github.com/mulkymalikuldhrs)

## 免责声明

本软件仅供教育和研究目的。交易加密货币，特别是迷因币，涉及重大风险，可能导致巨额财务损失。作者对使用本工具做出的任何财务决策不承担责任。请始终自行研究，切勿投资超过您能承受损失的金额。

<p align="center">
  <img src="https://img.shields.io/github/stars/mulkymalikuldhrs/SolSniperX?style=social" alt="Stars">
  <img src="https://img.shields.io/github/forks/mulkymalikuldhrs/SolSniperX?style=social" alt="Forks">
  <img src="https://img.shields.io/github/watchers/mulkymalikuldhrs/SolSniperX?style=social" alt="Watchers">
</p>
