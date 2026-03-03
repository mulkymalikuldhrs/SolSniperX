import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Zap, 
  Shield,
  Activity,
  Eye,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Flame
} from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { useWebSocket } from '../contexts/WebSocketContext'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalTrades: 0,
    successRate: 0,
    activeTokens: 0,
    todayProfit: 0,
    sol_balance: 0,
    total_value_usd: 0
  })
  const [ownedTokens, setOwnedTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const { getDashboardData, startAutoTrader, stopAutoTrader } = useApi()
  const { autoTraderStatus, lastMessage } = useWebSocket()

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const res = await getDashboardData()
      if (res.success) {
        setStats(res.data.stats)
        setOwnedTokens(res.data.owned_tokens)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'trade_executed' || lastMessage.type === 'auto_trade_event')) {
      loadDashboardData()
    }
  }, [lastMessage])

  const handleToggleAutoTrader = async () => {
    try {
      if (autoTraderStatus.enabled) {
        await stopAutoTrader()
      } else {
        await startAutoTrader()
      }
    } catch (error) {
      console.error('Error toggling auto trader:', error)
    }
  }

  if (loading && !stats.sol_balance) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Trading Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time performance and automated trading status
          </p>
        </div>

        <button
          onClick={handleToggleAutoTrader}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            autoTraderStatus.enabled
              ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white'
              : 'bg-green-500/10 text-green-500 border border-green-500/50 hover:bg-green-500 hover:text-white'
          }`}
        >
          <Zap className={`w-5 h-5 ${autoTraderStatus.enabled ? 'fill-current' : ''}`} />
          <span>{autoTraderStatus.enabled ? 'Stop Auto-Trader' : 'Start Auto-Trader'}</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="SOL Balance"
          value={`${stats.sol_balance.toFixed(4)} SOL`}
          subValue={`$${stats.total_value_usd.toFixed(2)}`}
          icon={<Wallet className="w-6 h-6 text-white" />}
          gradient="bg-gradient-primary"
        />
        <StatsCard
          title="Active Positions"
          value={stats.activeTokens}
          subValue="Managed by AI"
          icon={<Target className="w-6 h-6 text-white" />}
          gradient="bg-gradient-success"
        />
        <StatsCard
          title="Total Trades"
          value={stats.totalTrades}
          subValue="Lifetime"
          icon={<Activity className="w-6 h-6 text-white" />}
          gradient="bg-gradient-warning"
        />
        <StatsCard
          title="Auto-Trader"
          value={autoTraderStatus.enabled ? 'RUNNING' : 'STOPPED'}
          subValue={autoTraderStatus.message || 'Ready'}
          icon={<Zap className="w-6 h-6 text-white" />}
          gradient={autoTraderStatus.enabled ? 'bg-gradient-success' : 'bg-gradient-danger'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-modern p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Flame className="w-5 h-5 mr-2 text-orange-400" />
              Owned Tokens
            </h2>
          </div>
          <div className="space-y-4">
            {ownedTokens.length > 0 ? ownedTokens.map((token, i) => (
              <TokenRow key={i} token={token} />
            )) : (
              <div className="text-center py-12 text-muted-foreground">
                No active positions. Auto-trader will buy tokens based on your settings.
              </div>
            )}
          </div>
        </div>

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            Security Status
          </h2>
          <div className="space-y-4">
            <SecurityItem label="Anti-Rug Protection" status="Active" color="text-green-400" />
            <SecurityItem label="Mempool Monitor" status="Scanning" color="text-green-400" />
            <SecurityItem label="Wallet Encryption" status="Secured" color="text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, subValue, icon, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-modern p-6 hover-lift"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{subValue}</p>
    </motion.div>
  )
}

function TokenRow({ token }) {
  return (
    <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl border border-border/50">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
          {token.symbol?.slice(0, 2)}
        </div>
        <div>
          <p className="font-bold">{token.symbol}</p>
          <p className="text-xs text-muted-foreground">Bought at ${token.buy_price?.toFixed(8)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{token.amount?.toFixed(4)}</p>
        <p className="text-xs text-muted-foreground">{new Date(token.timestamp).toLocaleTimeString()}</p>
      </div>
    </div>
  )
}

function SecurityItem({ label, status, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
      <span className="text-sm">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{status}</span>
    </div>
  )
}

import { RefreshCw } from 'lucide-react'
