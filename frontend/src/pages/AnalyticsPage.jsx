import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity,
  Calendar,
  Filter,
  Download
} from 'lucide-react'

export default function AnalyticsPage() {
  const { getPerformanceMetrics, getTransactions } = useApi()
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('profit')
  const [performanceData, setPerformanceData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const [perfResult, transResult] = await Promise.all([
        getPerformanceMetrics(),
        getTransactions()
      ])

      if (perfResult.success) {
        setPerformanceData(perfResult.data)
      }
      if (transResult.success) {
        setTransactions(transResult.data)
      }
    } catch (error) {
      console.error('Error loading analytics data:', error)
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive trading performance analysis and insights
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-accent border border-border rounded-lg hover:bg-accent/80 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                ${performanceData?.totalProfit?.toLocaleString() || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">Total Profit (SOL)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Lifetime profit</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{performanceData?.successRate || 0}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Based on closed trades</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{performanceData?.totalTrades || 0}</p>
              <p className="text-sm text-muted-foreground">Total Trades</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">{performanceData?.totalBuys || 0} Buys / {performanceData?.totalSells || 0} Sells</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-danger rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${(performanceData?.totalProfit / (performanceData?.totalTrades || 1)).toFixed(4)}</p>
              <p className="text-sm text-muted-foreground">Avg Profit (SOL)</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Profit per trade</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Profit Over Time</h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 bg-accent border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="profit">Profit</option>
              <option value="trades">Trades</option>
              <option value="volume">Volume</option>
            </select>
          </div>
          
          {/* Real Chart Data integration would use Recharts here */}
          <div className="h-64 bg-accent rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-white font-medium">Profit Performance ({timeRange})</p>
              <p className="text-sm text-muted-foreground mt-2">
                Showing {selectedMetric.toUpperCase()} trends from database.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs text-muted-foreground">Real-time PnL</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-modern p-6"
        >
          <h2 className="text-xl font-bold mb-6">Trade History</h2>
          
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="font-semibold">{tx.token_symbol || tx.token_address.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type.toUpperCase()} {tx.amount_sol ? `${tx.amount_sol.toFixed(3)} SOL` : `${tx.amount_tokens.toFixed(2)} tokens`}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No trade history found.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
