import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
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
  Users,
  Flame,
  Star
} from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { useWebSocket } from '../contexts/WebSocketContext'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { getDashboardData, startAutoTrader, stopAutoTrader } = useApi()
  const { autoTraderStatus, lastMessage } = useWebSocket()
  const [isAutoTraderRunning, setIsAutoTraderRunning] = useState(false)

  useEffect(() => {
    setIsAutoTraderRunning(autoTraderStatus.enabled)
  }, [autoTraderStatus])

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    // Reload dashboard data on certain events
    if (lastMessage && (lastMessage.type === 'trade_executed' || lastMessage.type === 'auto_trade_event')) {
      loadDashboardData()
    }
  }, [lastMessage])

  const handleStartAutoTrader = async () => {
    try {
      const result = await startAutoTrader()
      if (result.success) {
        setIsAutoTraderRunning(true)
      }
    } catch (error) {
      console.error('Error starting auto trader:', error)
    }
  }

  const handleStopAutoTrader = async () => {
    try {
      const result = await stopAutoTrader()
      if (result.success) {
        setIsAutoTraderRunning(false)
      }
    } catch (error) {
      console.error('Error stopping auto trader:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const result = await getDashboardData()
      if (result.success) {
        setDashboardData(result.data)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-modern p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            SolSniperX Dashboard 👋
          </h1>
          <p className="text-muted-foreground">
            Real-time trading performance and market overview
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-full border ${
            isAutoTraderRunning
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            Bot: {isAutoTraderRunning ? 'ACTIVE' : 'INACTIVE'}
          </div>
          <button
            onClick={isAutoTraderRunning ? handleStopAutoTrader : handleStartAutoTrader}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              isAutoTraderRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isAutoTraderRunning ? 'STOP BOT' : 'START BOT'}
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-modern p-6 hover-lift"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                {dashboardData?.stats.totalProfit.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">Total Profit (SOL)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Realized Profit</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-modern p-6 hover-lift"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{dashboardData?.stats.successRate}%</p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Closed Trades</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-6 hover-lift"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{dashboardData?.stats.totalTrades}</p>
              <p className="text-sm text-muted-foreground">Total Trades</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">Total executions</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-modern p-6 hover-lift"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-danger rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{dashboardData?.stats.solBalance.toFixed(3)}</p>
              <p className="text-sm text-muted-foreground">SOL Balance</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Wallet safe</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Flame className="w-5 h-5 mr-2 text-orange-400" />
              Trending Tokens
            </h2>
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {dashboardData?.topTokens.length > 0 ? (
              dashboardData?.topTokens.map((token, index) => (
                <motion.div
                  key={token.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{token.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate w-32 lg:w-48">
                        {token.address}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`flex items-center justify-end space-x-1 ${
                      token.price_change_24h > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.price_change_24h > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="font-semibold text-sm">
                        {token.price_change_24h > 0 ? '+' : ''}{token.price_change_24h.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Liq: ${(token.liquidity / 1000).toFixed(1)}K
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">No trending tokens found.</p>
            )}
          </div>
        </motion.div>

        {/* Recent Trades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Recent Trades
            </h2>
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {dashboardData?.recentTrades.length > 0 ? (
              dashboardData?.recentTrades.map((trade, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-accent rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type === 'buy' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{trade.token_symbol || trade.token_address.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {trade.amount_sol ? trade.amount_sol.toFixed(2) : trade.amount_tokens.toFixed(0)} {trade.amount_sol ? 'SOL' : 'Tokens'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs font-semibold ${
                      trade.status === 'confirmed' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {trade.status.toUpperCase()}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-end">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">No recent trades.</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Active Positions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-modern p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-400" />
            Active Positions
          </h2>
          <div className="text-sm font-semibold">
            PnL (SOL): <span className={dashboardData?.stats.currentActivePnL >= 0 ? 'text-green-400' : 'text-red-400'}>
              {dashboardData?.stats.currentActivePnL >= 0 ? '+' : ''}{dashboardData?.stats.currentActivePnL.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {dashboardData?.activePositions.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="pb-3 px-2">Token</th>
                  <th className="pb-3 px-2">Buy Price</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Highest</th>
                  <th className="pb-3 px-2">Purchase Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dashboardData?.activePositions.map((pos) => (
                  <tr key={pos.token_address} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-2 font-semibold">{pos.token_symbol || pos.token_address.slice(0, 8)}</td>
                    <td className="py-3 px-2 text-muted-foreground">${pos.buy_price.toFixed(8)}</td>
                    <td className="py-3 px-2">{pos.amount_tokens.toLocaleString()}</td>
                    <td className="py-3 px-2 text-green-400">${pos.highest_price?.toFixed(8)}</td>
                    <td className="py-3 px-2 text-xs text-muted-foreground">{new Date(pos.purchase_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted-foreground py-10">No active positions.</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
