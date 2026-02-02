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
  const [isAutoTraderRunning, setIsAutoTraderRunning] = useState(autoTraderStatus.enabled)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    setIsAutoTraderRunning(autoTraderStatus.enabled)
  }, [autoTraderStatus.enabled])

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'trade_executed' || lastMessage.type === 'auto_trade_event')) {
      loadDashboardData()
    }
  }, [lastMessage])

  const handleStartAutoTrader = async () => {
    try {
      const result = await startAutoTrader()
      if (result.success) {
        setIsAutoTraderRunning(true)
        alert(result.message)
      }
    } catch (error) {
      console.error('Error starting auto trader:', error)
      alert('Failed to start auto trader.')
    }
  }

  const handleStopAutoTrader = async () => {
    try {
      const result = await stopAutoTrader()
      if (result.success) {
        setIsAutoTraderRunning(false)
        alert(result.message)
      }
    } catch (error) {
      console.error('Error stopping auto trader:', error)
      alert('Failed to stop auto trader.')
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
        {/* Loading skeleton */}
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
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            SolSniperX Dashboard 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your trading performance and market overview
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={isAutoTraderRunning ? handleStopAutoTrader : handleStartAutoTrader}
            className={`btn-modern ${isAutoTraderRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all`}
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
                ${dashboardData?.stats.totalProfit.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Profit</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpRight className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+{dashboardData?.stats.todayProfit.toFixed(2)} today</span>
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
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+2.3% this week</span>
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
            <span className="text-sm text-yellow-400">12 today</span>
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
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{dashboardData?.stats.activeTokens}</p>
              <p className="text-sm text-muted-foreground">Watching</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">All protected</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Tokens */}
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

          <div className="space-y-4">
            {dashboardData?.activePositions.map((token, index) => (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {token.symbol?.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      Buy: ${token.buy_price?.toFixed(8)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">
                    Amount: {token.current_amount_tokens?.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Buy SOL: {token.buy_amount_sol}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    token.risk < 30 ? 'bg-green-400' : 
                    token.risk < 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    Risk: {token.risk}%
                  </span>
                </div>
              </motion.div>
            ))}
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

          <div className="space-y-4">
            {dashboardData?.recentTrades.map((trade, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-accent rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    trade.profit_usd > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.profit_usd > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{trade.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {trade.buy_amount_sol} SOL
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    trade.profit_usd > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.profit_usd > 0 ? '+' : ''}${trade.profit_usd.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(trade.sell_time).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card-modern p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Scan New Tokens</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Discover profitable opportunities with AI-powered detection
          </p>
          <button className="btn-gradient w-full">
            Start Scanning
          </button>
        </div>

        <div className="card-modern p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Auto Trading</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enable automated trading with smart risk management
          </p>
          <button className="btn-gradient w-full">
            Configure Bot
          </button>
        </div>

        <div className="card-modern p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-gradient-warning rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Manage Wallet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            View balances, transactions, and portfolio performance
          </p>
          <button className="btn-gradient w-full">
            Open Wallet
          </button>
        </div>
      </motion.div>
    </div>
  )
}

