import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Shield, 
  Settings,
  Play,
  Pause,
  DollarSign,
  Percent,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react'

export default function TradingPage() {
  const [autoTrading, setAutoTrading] = useState(false)
  const [tradingSettings, setTradingSettings] = useState({
    buyAmount: 0.05,
    slippage: 1.0,
    takeProfit: 200,
    stopLoss: 20,
    maxRisk: 30
  })
  const [manualBuyTokenAddress, setManualBuyTokenAddress] = useState('')
  const [manualBuyAmount, setManualBuyAmount] = useState(0.01)
  const [recentTrades, setRecentTrades] = useState([
    { token: 'PEPE', type: 'sell', amount: 0.5, price: 0.00001789, pnl: 45.67, time: '2 min ago', status: 'completed' },
    { token: 'BONK', type: 'buy', amount: 1.2, price: 0.00000567, pnl: 0, time: '5 min ago', status: 'completed' },
    { token: 'WIF', type: 'sell', amount: 0.8, price: 0.00002056, pnl: -12.34, time: '8 min ago', status: 'completed' },
    { token: 'POPCAT', type: 'buy', amount: 2.1, price: 0.00001890, pnl: 0, time: '12 min ago', status: 'pending' }
  ])

  const { buyToken, sellToken } = useApi()
  const { lastMessage } = useWebSocket()

  const handleManualBuy = async () => {
    if (!manualBuyTokenAddress || manualBuyAmount <= 0) {
      alert('Please enter a valid token address and amount to buy.')
      return
    }
    try {
      const result = await buyToken(manualBuyTokenAddress, manualBuyAmount, tradingSettings.slippage)
      if (result.success) {
        alert('Buy order executed successfully!')
        // Optionally refresh recent trades or positions
      } else {
        alert(`Buy order failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error executing manual buy:', error)
      alert('Failed to execute buy order.')
    }
  }

  const handleManualSell = async (tokenAddress, amountTokens) => {
    if (!tokenAddress || amountTokens <= 0) {
      alert('Invalid token or amount for sell order.')
      return
    }
    try {
      const result = await sellToken(tokenAddress, amountTokens, tradingSettings.slippage)
      if (result.success) {
        alert('Sell order executed successfully!')
        // Optionally refresh recent trades or positions
      } else {
        alert(`Sell order failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error executing manual sell:', error)
      alert('Failed to execute sell order.')
    }
  }

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'trade_executed') {
      const newTrade = {
        id: lastMessage.transaction_id,
        token: lastMessage.token_address.substring(0, 4) + '...' + lastMessage.token_address.substring(lastMessage.token_address.length - 4),
        type: lastMessage.type,
        amount: lastMessage.type === 'buy' ? lastMessage.amount_sol : lastMessage.amount_tokens,
        price: 0, // Placeholder, actual price would come from trade data
        pnl: 0, // Placeholder
        time: 'just now',
        status: lastMessage.status
      }
      setRecentTrades(prevTrades => [newTrade, ...prevTrades].slice(0, 10)) // Keep last 10 trades
    }
  }, [lastMessage])

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
            Trading Dashboard
          </h1>
          <p className="text-muted-foreground">
            Automated and manual trading with AI-powered execution
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoTrading(!autoTrading)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              autoTrading 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-accent text-muted-foreground border border-border'
            }`}
          >
            {autoTrading ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>Auto Trading {autoTrading ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </motion.div>

      {/* Trading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-2xl font-bold text-green-400">$2,847</p>
              <p className="text-sm text-muted-foreground">Total Profit</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+$342 today</span>
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
              <p className="text-2xl font-bold">87.2%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">156 of 179 trades</span>
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
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-muted-foreground">Active Positions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400">5 pending orders</span>
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Rugs Avoided</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">100% protected</span>
          </div>
        </motion.div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary" />
              Trading Settings
            </h2>
          </div>

          <div className="space-y-6">
            {/* Buy Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Default Buy Amount (SOL)
              </label>
              <input
                type="number"
                step="0.01"
                value={tradingSettings.buyAmount}
                onChange={(e) => setTradingSettings({
                  ...tradingSettings,
                  buyAmount: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Slippage */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={tradingSettings.slippage}
                onChange={(e) => setTradingSettings({
                  ...tradingSettings,
                  slippage: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Take Profit */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Take Profit (%)
              </label>
              <input
                type="number"
                value={tradingSettings.takeProfit}
                onChange={(e) => setTradingSettings({
                  ...tradingSettings,
                  takeProfit: parseInt(e.target.value)
                })}
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Stop Loss */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Stop Loss (%)
              </label>
              <input
                type="number"
                value={tradingSettings.stopLoss}
                onChange={(e) => setTradingSettings({
                  ...tradingSettings,
                  stopLoss: parseInt(e.target.value)
                })}
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Max Risk */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Risk Score
              </label>
              <input
                type="number"
                value={tradingSettings.maxRisk}
                onChange={(e) => setTradingSettings({
                  ...tradingSettings,
                  maxRisk: parseInt(e.target.value)
                })}
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button className="w-full btn-gradient">
              Save Settings
            </button>
          </div> {/* Closes space-y-6 div */}

          {/* Manual Buy Section */}
          <div className="space-y-4 border-t border-border pt-6 mt-6">
            <h3 className="text-lg font-bold text-white">Manual Buy</h3>
            <div>
              <label className="block text-sm font-medium mb-2">
                Token Address
              </label>
              <input
                type="text"
                placeholder="e.g., 2FPyx1... (SOL address)"
                value={manualBuyTokenAddress}
                onChange={(e) => setManualBuyTokenAddress(e.target.value)}
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (SOL)
              </label>
              <input
                type="number"
                step="0.01"
                value={manualBuyAmount}
                onChange={(e) => setManualBuyAmount(parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={handleManualBuy}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Execute Manual Buy
            </button>
          </div>
        </motion.div>

        {/* Active Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              Active Positions
            </h2>
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {/* Position Item */}
            {[
              { token: 'PEPE', amount: 0.5, entry: 0.00001234, current: 0.00001789, pnl: 45.67, status: 'profit' },
              { token: 'BONK', amount: 1.2, entry: 0.00000567, current: 0.00000699, pnl: 23.45, status: 'profit' },
              { token: 'WIF', amount: 0.8, entry: 0.00002345, current: 0.00002056, pnl: -12.34, status: 'loss' }
            ].map((position, index) => (
              <motion.div
                key={position.token}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-accent rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {position.token.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{position.token}</p>
                    <p className="text-sm text-muted-foreground">
                      {position.amount} SOL
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Entry</p>
                  <p className="font-mono text-sm">${position.entry.toFixed(8)}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="font-mono text-sm">${position.current.toFixed(8)}</p>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${
                    position.status === 'profit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.pnl > 0 ? '+' : ''}{position.pnl.toFixed(2)}%
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <button 
                      onClick={() => handleManualSell(position.token, position.amount)}
                      className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                    >
                      Sell
                    </button>
                    <button className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Trades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-modern p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Trades
          </h2>
          <button className="text-sm text-primary hover:underline">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="text-left p-3 font-semibold">Token</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Amount</th>
                <th className="text-left p-3 font-semibold">Price</th>
                <th className="text-left p-3 font-semibold">P&L</th>
                <th className="text-left p-3 font-semibold">Time</th>
                <th className="text-left p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade, index) => (
                <tr key={index} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {trade.token.slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-semibold">{trade.token}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.type === 'buy' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">{trade.amount} SOL</td>
                  <td className="p-3 font-mono">${trade.price.toFixed(8)}</td>
                  <td className="p-3">
                    {trade.pnl !== 0 && (
                      <span className={`font-semibold ${
                        trade.pnl > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.pnl > 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{trade.time}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

