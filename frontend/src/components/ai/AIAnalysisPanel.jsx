import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../../contexts/ApiContext'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  Target,
  Shield,
  Activity,
  BarChart3,
  Loader2
} from 'lucide-react'

export default function AIAnalysisPanel({ tokenAddress, tokenData }) {
  const [analysis, setAnalysis] = useState(null)
  const { analyzeToken: apiAnalyzeToken } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const runAnalysis = async () => {
    if (!tokenAddress) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiAnalyzeToken(tokenAddress)

      if (result.success) {
        setAnalysis(result.data)
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Failed to connect to AI service')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (tokenAddress) {
      runAnalysis()
    }
  }, [tokenAddress])

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      case 'hold': return 'text-yellow-400'
      case 'avoid': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    if (confidence >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="text-white font-medium">AI Analysis in Progress...</span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <p className="text-sm text-gray-400 text-center">
            Analyzing token metrics, sentiment, and market conditions...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <XCircle className="w-6 h-6 text-red-400" />
          <span className="text-white font-medium">AI Analysis Failed</span>
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={runAnalysis}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          Retry Analysis
        </button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <span className="text-white font-medium">Ready for AI Analysis</span>
        </div>
        <button
          onClick={runAnalysis}
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          Start AI Analysis
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
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Analysis</h3>
            <p className="text-sm text-gray-400">
              Powered by {analysis.ai_provider} • {new Date(analysis.analysis_timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {/* Risk Assessment Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Risk Level</span>
          </div>
          <span className={`text-lg font-bold ${getRiskColor(analysis.risk_assessment)}`}>
            {analysis.risk_assessment}
          </span>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Sentiment</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-white">{analysis.sentiment_score}</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: `${analysis.sentiment_score}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Viral Potential</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-white">{analysis.viral_potential}</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${analysis.viral_potential}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Rug Risk</span>
          </div>
          <span className={`text-lg font-bold ${getRiskColor(analysis.rug_risk)}`}>
            {analysis.rug_risk}
          </span>
        </div>
      </div>

      {/* Trading Recommendation */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Trading Recommendation</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Action:</span>
              <span className={`font-bold ${getActionColor(analysis.trading_recommendation?.action)}`}>
                {analysis.trading_recommendation?.action}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Confidence:</span>
              <span className={`font-bold ${getConfidenceColor(analysis.trading_recommendation?.confidence)}`}>
                {analysis.trading_recommendation?.confidence}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Position Size:</span>
              <span className="text-white font-bold">
                {analysis.trading_recommendation?.position_size}%
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Entry:</span>
              <span className="text-green-400 font-mono">
                ${analysis.trading_recommendation?.entry_price?.toFixed(8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stop Loss:</span>
              <span className="text-red-400 font-mono">
                ${analysis.trading_recommendation?.stop_loss?.toFixed(8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Take Profit:</span>
              <span className="text-green-400 font-mono">
                ${analysis.trading_recommendation?.take_profit?.toFixed(8)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {analysis.key_insights && analysis.key_insights.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Key Insights</span>
          </h4>
          <ul className="space-y-2">
            {analysis.key_insights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alerts */}
      {analysis.alerts && analysis.alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <h4 className="text-red-400 font-semibold mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Risk Alerts</span>
          </h4>
          <ul className="space-y-2">
            {analysis.alerts.map((alert, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span className="text-red-300 text-sm">{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Analysis (Collapsible) */}
      <details className="bg-gray-800/30 rounded-lg">
        <summary className="p-4 cursor-pointer text-gray-400 hover:text-white transition-colors">
          View Full AI Analysis
        </summary>
        <div className="px-4 pb-4">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-3 rounded border overflow-x-auto">
            {analysis.raw_analysis}
          </pre>
        </div>
      </details>
    </motion.div>
  )
}

