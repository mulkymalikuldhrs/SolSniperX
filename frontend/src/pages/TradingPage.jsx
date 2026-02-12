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
    buy_amount_sol: 0.05,
    slippage: 1.0,
    profit_target_x: 2.0,
    stop_loss_percentage: 0.20,
    max_risk_score: 30
  })
  const [manualBuyTokenAddress, setManualBuyTokenAddress] = useState('')
  const [manualBuyAmount, setManualBuyAmount] = useState(0.01)
  const [recentTrades, setRecentTrades] = useState([])
  const [positions, setPositions] = useState({})
  const [stats, setStats] = useState({})

  const {
    buyToken,
    sellToken,
    getDashboardData,
    getPositions,
    getAutoTraderConfig,
    updateAutoTraderConfig,
    startAutoTrader,
    stopAutoTrader
  } = useApi()
  const { lastMessage, autoTraderStatus } = useWebSocket()

  const loadData = async () => {
    try {
      const dashboard = await getDashboardData()
      setRecentTrades(dashboard.recentTrades || [])
      setStats(dashboard.stats || {})

      const pos = await getPositions()
      setPositions(pos || {})

      const config = await getAutoTraderConfig()
      setTradingSettings(config)

    } catch (error) {
      console.error('Error loading trading data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (autoTraderStatus) {
      setAutoTrading(autoTraderStatus.enabled)
    }
  }, [autoTraderStatus])

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'trade_executed' || lastMessage.type === 'auto_trade_event')) {
      loadData()
    }
  }, [lastMessage])

  const handleManualBuy = async () => {
    if (!manualBuyTokenAddress || manualBuyAmount <= 0) return
    try {
      const result = await buyToken(manualBuyTokenAddress, manualBuyAmount, tradingSettings.slippage)
      if (result.success) {
        alert('Order Confirmed!')
        loadData()
      } else {
        alert(`Failed: ${result.message}`)
      }
    } catch (error) {
      alert('Error executing trade')
    }
  }

  const handleToggleAutoTrader = async () => {
    try {
      if (autoTrading) {
        await stopAutoTrader()
      } else {
        await startAutoTrader()
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const handleSaveConfig = async () => {
    try {
      await updateAutoTraderConfig(tradingSettings)
      alert('Config Saved')
    } catch (error) {
      alert('Save failed')
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient-primary">Trading Terminal</h1>
        <button
          onClick={handleToggleAutoTrader}
          className={`flex items-center space-x-2 px-6 py-2 rounded-lg ${autoTrading ? 'bg-green-600' : 'bg-gray-800'}`}
        >
          {autoTrading ? <Pause /> : <Play />}
          <span>Auto Trading: {autoTrading ? 'ACTIVE' : 'INACTIVE'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-modern p-6">
          <p className="text-sm text-gray-400">Total Profit</p>
          <p className="text-2xl font-bold text-green-400">${stats.totalProfit?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="card-modern p-6">
          <p className="text-sm text-gray-400">Success Rate</p>
          <p className="text-2xl font-bold">{stats.successRate?.toFixed(1) || '0'}%</p>
        </div>
        <div className="card-modern p-6">
          <p className="text-sm text-gray-400">Total Trades</p>
          <p className="text-2xl font-bold">{stats.totalTrades || '0'}</p>
        </div>
        <div className="card-modern p-6">
          <p className="text-sm text-gray-400">Active Positions</p>
          <p className="text-2xl font-bold">{Object.keys(positions).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-modern p-6 space-y-4">
           <h2 className="text-xl font-bold">Bot Configuration</h2>
           <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Buy Amount (SOL)</label>
                <input type="number" step="0.01" value={tradingSettings.buy_amount_sol} onChange={e=>setTradingSettings({...tradingSettings, buy_amount_sol: parseFloat(e.target.value)})} className="w-full bg-gray-800 border-none rounded p-2" />
              </div>
              <div>
                <label className="text-xs text-gray-400">Slippage (%)</label>
                <input type="number" step="0.1" value={tradingSettings.slippage} onChange={e=>setTradingSettings({...tradingSettings, slippage: parseFloat(e.target.value)})} className="w-full bg-gray-800 border-none rounded p-2" />
              </div>
              <button onClick={handleSaveConfig} className="w-full btn-gradient py-2">Save Config</button>
           </div>

           <h2 className="text-xl font-bold pt-6 border-t border-gray-700">Manual Trade</h2>
           <div className="space-y-3">
              <input type="text" placeholder="Token Address" value={manualBuyTokenAddress} onChange={e=>setManualBuyTokenAddress(e.target.value)} className="w-full bg-gray-800 border-none rounded p-2" />
              <input type="number" step="0.01" value={manualBuyAmount} onChange={e=>setManualBuyAmount(parseFloat(e.target.value))} className="w-full bg-gray-800 border-none rounded p-2" />
              <button onClick={handleManualBuy} className="w-full bg-blue-600 py-2 rounded font-bold">Buy Now</button>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="card-modern p-6">
              <h2 className="text-xl font-bold mb-4">Open Positions</h2>
              <div className="space-y-3">
                 {Object.entries(positions).map(([addr, pos]) => (
                   <div key={addr} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{pos.symbol || addr.slice(0,8)}</p>
                        <p className="text-xs text-gray-400">{pos.current_amount_tokens?.toFixed(4)} tokens</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Buy: ${pos.buy_price?.toFixed(8)}</p>
                        <button
                          onClick={() => sellToken(addr, pos.current_amount_tokens, tradingSettings.slippage)}
                          className="bg-red-600/20 text-red-400 px-3 py-1 rounded text-xs mt-1"
                        >
                          Sell All
                        </button>
                      </div>
                   </div>
                 ))}
                 {Object.keys(positions).length === 0 && <p className="text-center text-gray-500 py-10">No open positions</p>}
              </div>
           </div>

           <div className="card-modern p-6">
              <h2 className="text-xl font-bold mb-4">Recent Trade History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead className="text-gray-400 border-b border-gray-700">
                      <tr>
                        <th className="pb-2">Token</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Time</th>
                      </tr>
                   </thead>
                   <tbody>
                      {recentTrades.map((t, i) => (
                        <tr key={i} className="border-b border-gray-800/50">
                           <td className="py-2">{t.token_symbol || t.token_address?.slice(0,8)}</td>
                           <td className={`py-2 ${t.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>{t.type?.toUpperCase()}</td>
                           <td className="py-2">{t.amount_sol || t.amount_tokens?.toFixed(2)}</td>
                           <td className="py-2">{t.status}</td>
                           <td className="py-2 text-right text-gray-400">{new Date(t.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
