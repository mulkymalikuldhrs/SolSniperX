import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('profit')

  const performanceData = {
    totalProfit: 2847.32,
    totalTrades: 156,
    successRate: 87.2,
    avgProfit: 18.25,
    bestTrade: 234.56,
    worstTrade: -45.23,
    winStreak: 12,
    currentStreak: 8
  }

  const chartData = [
    { date: '2024-01-01', profit: 120.45, trades: 8, volume: 2400 },
    { date: '2024-01-02', profit: 234.67, trades: 12, volume: 3200 },
    { date: '2024-01-03', profit: -45.23, trades: 6, volume: 1800 },
    { date: '2024-01-04', profit: 189.34, trades: 15, volume: 4100 },
    { date: '2024-01-05', profit: 345.78, trades: 18, volume: 5200 },
    { date: '2024-01-06', profit: 156.89, trades: 10, volume: 2900 },
    { date: '2024-01-07', profit: 278.45, trades: 14, volume: 3800 }
  ]

  const topTokens = [
    { symbol: 'PEPE', profit: 456.78, trades: 23, winRate: 91.3 },
    { symbol: 'BONK', profit: 234.56, trades: 18, winRate: 88.9 },
    { symbol: 'WIF', profit: 189.34, trades: 15, winRate: 86.7 },
    { symbol: 'POPCAT', profit: 167.89, trades: 12, winRate: 83.3 },
    { symbol: 'MEW', profit: 123.45, trades: 9, winRate: 77.8 }
  ]

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
                ${performanceData.totalProfit.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Profit</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+15.3% this week</span>
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
              <p className="text-2xl font-bold">{performanceData.successRate}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+2.1% improvement</span>
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
              <p className="text-2xl font-bold">{performanceData.totalTrades}</p>
              <p className="text-sm text-muted-foreground">Total Trades</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">18 this week</span>
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
              <p className="text-2xl font-bold">${performanceData.avgProfit}</p>
              <p className="text-sm text-muted-foreground">Avg Profit</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+$3.45 per trade</span>
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
          
          {/* Simple Chart Placeholder */}
          <div className="h-64 bg-accent rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
              <p className="text-sm text-muted-foreground mt-2">
                Showing {selectedMetric} for {timeRange}
              </p>
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
          <h2 className="text-xl font-bold mb-6">Performance Metrics</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <p className="font-semibold">Best Trade</p>
                <p className="text-sm text-muted-foreground">Highest single profit</p>
              </div>
              <p className="text-lg font-bold text-green-400">
                +${performanceData.bestTrade}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <p className="font-semibold">Worst Trade</p>
                <p className="text-sm text-muted-foreground">Largest single loss</p>
              </div>
              <p className="text-lg font-bold text-red-400">
                ${performanceData.worstTrade}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <p className="font-semibold">Win Streak</p>
                <p className="text-sm text-muted-foreground">Best consecutive wins</p>
              </div>
              <p className="text-lg font-bold text-blue-400">
                {performanceData.winStreak} trades
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div>
                <p className="font-semibold">Current Streak</p>
                <p className="text-sm text-muted-foreground">Ongoing performance</p>
              </div>
              <p className="text-lg font-bold text-yellow-400">
                {performanceData.currentStreak} wins
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Performing Tokens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-modern p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Top Performing Tokens</h2>
          <button className="text-sm text-primary hover:underline">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="text-left p-4 font-semibold">Token</th>
                <th className="text-left p-4 font-semibold">Total Profit</th>
                <th className="text-left p-4 font-semibold">Trades</th>
                <th className="text-left p-4 font-semibold">Win Rate</th>
                <th className="text-left p-4 font-semibold">Avg Profit</th>
              </tr>
            </thead>
            <tbody>
              {topTokens.map((token, index) => (
                <motion.tr
                  key={token.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-semibold">{token.symbol}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-green-400">
                      +${token.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">{token.trades}</td>
                  <td className="p-4">
                    <span className="font-semibold">{token.winRate}%</span>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400">
                      +${(token.profit / token.trades).toFixed(2)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Trading Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card-modern p-6 text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Peak Performance</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your best trading day generated $345.78 profit with 18 successful trades
          </p>
          <div className="text-2xl font-bold text-green-400">Jan 5, 2024</div>
        </div>

        <div className="card-modern p-6 text-center">
          <div className="w-16 h-16 bg-gradient-warning rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Accuracy Trend</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your trading accuracy has improved by 12% over the last month
          </p>
          <div className="text-2xl font-bold text-blue-400">+12%</div>
        </div>

        <div className="card-modern p-6 text-center">
          <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Volume Growth</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your trading volume has increased by 45% compared to last period
          </p>
          <div className="text-2xl font-bold text-yellow-400">+45%</div>
        </div>
      </motion.div>
    </div>
  )
}

