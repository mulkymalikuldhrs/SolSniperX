import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../../contexts/ApiContext'
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Clock,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'

export default function TradingSignalsPanel({ tokenAddress }) {
  const [signals, setSignals] = useState(null)
  const { getTradingSignals: apiGetTradingSignals } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchSignals = async () => {
    if (!tokenAddress) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiGetTradingSignals(tokenAddress)

      if (result.success) {
        setSignals(result.data)
      } else {
        setError(result.error || 'Failed to fetch signals')
      }
    } catch (err) {
      setError('Failed to connect to signal service')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tokenAddress) {
      fetchSignals()
    }
  }, [tokenAddress])

  useEffect(() => {
    let interval
    if (autoRefresh && tokenAddress) {
      interval = setInterval(fetchSignals, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, tokenAddress])

  const getSignalColor = (signalType) => {
    switch (signalType?.toLowerCase()) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      case 'hold': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getSignalBgColor = (signalType) => {
    switch (signalType?.toLowerCase()) {
      case 'buy': return 'bg-green-500/20 border-green-500/30'
      case 'sell': return 'bg-red-500/20 border-red-500/30'
      case 'hold': return 'bg-yellow-500/20 border-yellow-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const getSignalIcon = (signalType) => {
    switch (signalType?.toLowerCase()) {
      case 'buy': return <TrendingUp className="w-5 h-5" />
      case 'sell': return <TrendingDown className="w-5 h-5" />
      case 'hold': return <Target className="w-5 h-5" />
      default: return <BarChart3 className="w-5 h-5" />
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    if (confidence >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const calculateRiskReward = () => {
    if (!signals) return 0
    const entry = signals.entry_price || 0
    const stopLoss = signals.stop_loss || 0
    const takeProfit = signals.take_profit_1 || 0
    
    if (entry === 0 || stopLoss === 0 || takeProfit === 0) return 0
    
    const risk = Math.abs(entry - stopLoss)
    const reward = Math.abs(takeProfit - entry)
    
    return risk > 0 ? (reward / risk).toFixed(2) : 0
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-white font-medium">Generating Trading Signals...</span>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <span className="text-white font-medium">Signal Generation Failed</span>
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchSignals}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!signals) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <Zap className="w-6 h-6 text-blue-400" />
          <span className="text-white font-medium">Ready for Trading Signals</span>
        </div>
        <button
          onClick={fetchSignals}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          Generate Signals
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Trading Signals</h3>
            <p className="text-sm text-gray-400">
              Last updated: {new Date(signals.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="Auto-refresh signals"
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={fetchSignals}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Signal */}
      <div className={`border rounded-xl p-6 ${getSignalBgColor(signals.signal_type)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`${getSignalColor(signals.signal_type)}`}>
              {getSignalIcon(signals.signal_type)}
            </div>
            <div>
              <h4 className={`text-xl font-bold ${getSignalColor(signals.signal_type)}`}>
                {signals.signal_type?.toUpperCase()}
              </h4>
              <p className="text-sm text-gray-400">
                {signals.time_horizon} • R:R {calculateRiskReward()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Confidence</div>
            <div className={`text-2xl font-bold ${getConfidenceColor(signals.confidence)}`}>
              {signals.confidence}%
            </div>
          </div>
        </div>

        {/* Price Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Entry Price</span>
            </div>
            <span className="text-lg font-mono text-white">
              ${signals.entry_price?.toFixed(8)}
            </span>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-400">Stop Loss</span>
            </div>
            <span className="text-lg font-mono text-red-400">
              ${signals.stop_loss?.toFixed(8)}
            </span>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Take Profit</span>
            </div>
            <span className="text-lg font-mono text-green-400">
              ${signals.take_profit_1?.toFixed(8)}
            </span>
          </div>
        </div>

        {/* Additional Targets */}
        {signals.take_profit_2 && (
          <div className="mt-4 bg-gray-800/30 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Take Profit 2:</span>
              <span className="font-mono text-green-400">
                ${signals.take_profit_2?.toFixed(8)}
              </span>
            </div>
          </div>
        )}

        {/* Position Size */}
        <div className="mt-4 bg-gray-800/30 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Recommended Position Size:</span>
            <span className="font-bold text-white">
              {signals.position_size_recommendation}% of portfolio
            </span>
          </div>
        </div>
      </div>

      {/* Key Factors */}
      {signals.key_factors && signals.key_factors.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Key Factors</span>
          </h4>
          <ul className="space-y-2">
            {signals.key_factors.map((factor, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risk Factors */}
      {signals.risk_factors && signals.risk_factors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h4 className="text-red-400 font-semibold mb-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Risk Factors</span>
          </h4>
          <ul className="space-y-2">
            {signals.risk_factors.map((risk, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-300 text-sm">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium">
          Execute Trade
        </button>
        <button className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium">
          Add to Watchlist
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
        <p className="text-yellow-400 text-xs">
          ⚠️ Trading signals are AI-generated predictions and should not be considered as financial advice. 
          Always do your own research and trade responsibly.
        </p>
      </div>
    </motion.div>
  )
}

