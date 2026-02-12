import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Eye,
  Zap,
  BarChart3,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Brain,
  AreaChart as AreaChartIcon
} from 'lucide-react'
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel'
import TradingSignalsPanel from '../components/ai/TradingSignalsPanel'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function TokenScannerPage() {
  const [tokens, setTokens] = useState([])
  const [filteredTokens, setFilteredTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    minLiquidity: 10000,
    maxAge: 24,
    minVolume: 50000,
    sortBy: 'volume_24h'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [autoScan, setAutoScan] = useState(false)
  const [tokenHistory, setTokenHistory] = useState([])

  const { scanTokens: apiScanTokens, getTokenHistory } = useApi()
  const { lastMessage, priceUpdates, newTokens, rugpullAlerts } = useWebSocket()

  const fetchTokens = async () => {
    setIsLoading(true)
    try {
      const result = await apiScanTokens(filters)
      if (result.success) {
        setTokens(result.tokens || [])
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTokenHistory = async (tokenAddress) => {
    try {
      const result = await getTokenHistory(tokenAddress)
      if (result.success) {
        setTokenHistory(result.data)
      }
    } catch (error) {
      console.error('Error fetching token history:', error)
      setTokenHistory([])
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  useEffect(() => {
    setTokens(prevTokens => {
      return prevTokens.map(token => {
        if (priceUpdates[token.address]) {
          return {
            ...token,
            ...priceUpdates[token.address]
          }
        }
        return token
      })
    })
  }, [priceUpdates])

  useEffect(() => {
    let interval
    if (autoScan) {
      interval = setInterval(fetchTokens, 60000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoScan, filters])

  useEffect(() => {
    let filtered = [...tokens, ...newTokens].filter((token, index, self) =>
      index === self.findIndex((t) => t.address === token.address)
    )

    filtered = filtered.filter(token => {
      const matchesSearch = token.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.address?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilters = (token.liquidity || 0) >= filters.minLiquidity &&
                            (token.age_hours || 0) <= filters.maxAge &&
                            (token.volume_24h || 0) >= filters.minVolume
      
      return matchesSearch && matchesFilters
    })

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'volume_24h': return (b.volume_24h || 0) - (a.volume_24h || 0)
        case 'market_cap': return (b.market_cap || 0) - (a.market_cap || 0)
        case 'price_change_24h': return (b.price_change_24h || 0) - (a.price_change_24h || 0)
        case 'age_hours': return (a.age_hours || 0) - (b.age_hours || 0)
        default: return 0
      }
    })

    setFilteredTokens(filtered)
  }, [tokens, newTokens, searchTerm, filters])

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const formatPrice = (price) => {
    if (!price) return '0.00'
    if (price < 0.000001) return price.toExponential(2)
    if (price < 0.01) return price.toFixed(8)
    return price.toFixed(4)
  }

  useEffect(() => {
    if (selectedToken) {
      fetchTokenHistory(selectedToken.address)
    } else {
      setTokenHistory([])
    }
  }, [selectedToken])

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center text-white">
          <div>
            <h1 className="text-3xl font-bold mb-2">Token Scanner</h1>
            <p className="text-gray-400">Real-time token detection</p>
          </div>
          <div className="flex space-x-3">
             <button
              onClick={() => setAutoScan(!autoScan)}
              className={`px-4 py-2 rounded-lg ${autoScan ? 'bg-green-600' : 'bg-gray-800'}`}
            >
              Auto Scan: {autoScan ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={fetchTokens}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold"
            >
              Scan Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {newTokens.length > 0 && (
            <div className="bg-blue-900/30 border border-blue-700 p-4 rounded-xl">
               <h3 className="font-bold text-blue-200 mb-2 flex items-center"><Zap size={18} className="mr-2"/> New Tokens Detected</h3>
               <div className="max-h-32 overflow-y-auto">
                 {newTokens.map((t, i) => (
                   <p key={i} className="text-sm text-blue-300">{t.symbol} - {formatPrice(t.price)}</p>
                 ))}
               </div>
            </div>
           )}
           {rugpullAlerts.length > 0 && (
            <div className="bg-red-900/30 border border-red-700 p-4 rounded-xl">
               <h3 className="font-bold text-red-200 mb-2 flex items-center"><AlertTriangle size={18} className="mr-2"/> Rugpull Alerts</h3>
               <div className="max-h-32 overflow-y-auto">
                 {rugpullAlerts.map((a, i) => (
                   <p key={i} className="text-sm text-red-300">{a.reasons?.join(', ') || a.reason} - {a.signature?.slice(0,8)}</p>
                 ))}
               </div>
            </div>
           )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
             <div className="bg-gray-800 p-4 rounded-xl flex space-x-4">
                <input
                  type="text"
                  placeholder="Search tokens..."
                  className="bg-gray-700 border-none rounded-lg px-4 py-2 flex-1 text-white"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="bg-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-gray-700 text-gray-400 text-sm">
                      <tr>
                        <th className="p-4">Token</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">24h Change</th>
                        <th className="p-4">Liquidity</th>
                        <th className="p-4">Age</th>
                      </tr>
                   </thead>
                   <tbody className="text-white">
                      {filteredTokens.map(token => (
                        <tr
                          key={token.address}
                          className={`border-t border-gray-700 hover:bg-gray-700 cursor-pointer ${selectedToken?.address === token.address ? 'bg-purple-900/20' : ''}`}
                          onClick={() => setSelectedToken(token)}
                        >
                          <td className="p-4">
                            <div className="font-bold">{token.symbol}</div>
                            <div className="text-xs text-gray-400">{token.name}</div>
                          </td>
                          <td className="p-4 font-mono">${formatPrice(token.price)}</td>
                          <td className={`p-4 ${getChangeColor(token.price_change_24h)}`}>
                            {token.price_change_24h?.toFixed(2)}%
                          </td>
                          <td className="p-4">${formatNumber(token.liquidity)}</td>
                          <td className="p-4 text-gray-400">{token.age_hours?.toFixed(1)}h</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="space-y-6">
             {selectedToken ? (
               <>
                 <div className="card-modern p-6 bg-gray-800 text-white rounded-xl">
                    <h2 className="text-xl font-bold mb-4">{selectedToken.symbol} Analysis</h2>
                    <AIAnalysisPanel tokenAddress={selectedToken.address} tokenData={selectedToken} />
                    <TradingSignalsPanel tokenAddress={selectedToken.address} />
                 </div>

                 <div className="card-modern p-6 bg-gray-800 text-white rounded-xl">
                    <h2 className="text-xl font-bold mb-4">Price History</h2>
                    <div className="h-64">
                       {tokenHistory.length > 0 ? (
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={tokenHistory}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                             <XAxis dataKey="time" hide />
                             <YAxis hide domain={['auto', 'auto']} />
                             <Tooltip />
                             <Area type="monotone" dataKey="price" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                           </AreaChart>
                         </ResponsiveContainer>
                       ) : <p className="text-center text-gray-500 py-20">No data available</p>}
                    </div>
                 </div>
               </>
             ) : (
               <div className="card-modern p-10 text-center text-gray-400 bg-gray-800 rounded-xl">
                  <Brain size={48} className="mx-auto mb-4 opacity-20" />
                  Select a token to see AI analysis
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
