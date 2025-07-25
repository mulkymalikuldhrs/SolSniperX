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
  AreaChart
} from 'lucide-react'
import AIAnalysisPanel from '../components/ai/AIAnalysisPanel'
import TradingSignalsPanel from '../components/ai/TradingSignalsPanel'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

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
  const { lastMessage, priceUpdates } = useWebSocket()

  const fetchTokens = async () => {
    setIsLoading(true)
    try {
      const result = await apiScanTokens(filters)
      
      if (result.success) {
        setTokens(result.data.tokens)
        setFilteredTokens(result.data.tokens)
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

  const scanTokens = async () => {
    setIsLoading(true)
    try {
      const result = await apiScanTokens(filters)
      
      if (result.success) {
        setTokens(result.data.tokens)
        setFilteredTokens(result.data.tokens)
      }
    } catch (error) {
      console.error('Error scanning tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [])

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_token') {
      setTokens(prevTokens => {
        const newToken = lastMessage.data
        // Check if token already exists to avoid duplicates
        if (!prevTokens.some(token => token.address === newToken.address)) {
          return [newToken, ...prevTokens]
        }
        return prevTokens
      })
    }
  }, [lastMessage])

  useEffect(() => {
    // Apply real-time price updates to tokens
    setFilteredTokens(prevFilteredTokens => {
      return prevFilteredTokens.map(token => {
        if (priceUpdates[token.address]) {
          const updatedToken = {
            ...token,
            price: priceUpdates[token.address].price,
            price_change_24h: priceUpdates[token.address].price_change_24h,
            volume_24h: priceUpdates[token.address].volume_24h,
            liquidity: priceUpdates[token.address].liquidity,
          }
          // If the updated token is the selected token, update its history as well
          if (selectedToken && selectedToken.address === updatedToken.address) {
            setTokenHistory(prevHistory => {
              const newHistory = [...prevHistory]
              // Add new price point, or update the last one if it's very recent
              const lastEntry = newHistory[newHistory.length - 1]
              const currentTime = new Date().toISOString()
              if (lastEntry && (new Date(currentTime).getTime() - new Date(lastEntry.time).getTime() < 60 * 1000)) { // If last update was less than a minute ago
                lastEntry.price = updatedToken.price
                lastEntry.volume = updatedToken.volume_24h // Assuming volume_24h is current volume
              } else {
                newHistory.push({
                  time: currentTime,
                  price: updatedToken.price,
                  volume: updatedToken.volume_24h
                })
                // Keep history limited, e.g., to 24 entries
                if (newHistory.length > 24) {
                  newHistory.shift()
                }
              }
              return newHistory
            })
          }
          return updatedToken
        }
        return token
      })
    })
  }, [priceUpdates, selectedToken]) // Add selectedToken to dependencies

  useEffect(() => {
    let interval
    if (autoScan) {
      interval = setInterval(scanTokens, 60000) // Scan every minute
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoScan, filters])

  useEffect(() => {
    // Filter and search tokens
    let filtered = tokens.filter(token => {
      const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilters = token.liquidity >= filters.minLiquidity &&
                            token.age_hours <= filters.maxAge &&
                            token.volume_24h >= filters.minVolume
      
      return matchesSearch && matchesFilters
    })

    // Sort tokens
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'volume_24h':
          return b.volume_24h - a.volume_24h
        case 'market_cap':
          return b.market_cap - a.market_cap
        case 'price_change_24h':
          return b.price_change_24h - a.price_change_24h
        case 'age_hours':
          return a.age_hours - b.age_hours
        default:
          return 0
      }
    })

    setFilteredTokens(filtered)
  }, [tokens, searchTerm, filters])

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const formatPrice = (price) => {
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

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
    volume: {
      label: "Volume",
      color: "hsl(var(--chart-2))",
    },
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getRiskBadge = (token) => {
    let riskLevel = 'LOW'
    let colorClass = 'bg-green-500/20 text-green-400'
    
    if (token.age_hours < 1 || token.top_holder_percentage > 50) {
      riskLevel = 'HIGH'
      colorClass = 'bg-red-500/20 text-red-400'
    } else if (token.age_hours < 6 || token.top_holder_percentage > 30) {
      riskLevel = 'MEDIUM'
      colorClass = 'bg-yellow-500/20 text-yellow-400'
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
        {riskLevel}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Token Scanner</h1>
            <p className="text-gray-400">
              AI-powered real-time token detection and analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoScan(!autoScan)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                autoScan 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${autoScan ? 'animate-spin' : ''}`} />
              Auto Scan
            </button>
            
            <button
              onClick={scanTokens}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
            >
              <Search className="w-4 h-4 inline mr-2" />
              {isLoading ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
        </div>

        {/* New Token Alerts */}
        {newTokens.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 flex items-center space-x-3"
          >
            <Zap className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-200">New Token Detected!</h3>
              {newTokens.map((token, index) => (
                <p key={index} className="text-sm text-blue-300">
                  <span className="font-medium">{token.symbol} ({token.name}):</span> Liquidity: ${formatNumber(token.liquidity)}, Age: {token.age_hours.toFixed(2)}h
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rugpull Alerts */}
        {rugpullAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-center space-x-3"
          >
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-200">Potential Rugpull Alert!</h3>
              {rugpullAlerts.map((alert, index) => (
                <p key={index} className="text-sm text-red-300">
                  <span className="font-medium">Reason: {alert.reason}</span> - Signature: {alert.signature.substring(0, 8)}...
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, symbol, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Min Liquidity</label>
                  <input
                    type="number"
                    value={filters.minLiquidity}
                    onChange={(e) => setFilters({...filters, minLiquidity: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Age (hours)</label>
                  <input
                    type="number"
                    value={filters.maxAge}
                    onChange={(e) => setFilters({...filters, maxAge: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Min Volume</label>
                  <input
                    type="number"
                    value={filters.minVolume}
                    onChange={(e) => setFilters({...filters, minVolume: Number(e.target.value)})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    <option value="volume_24h">Volume</option>
                    <option value="market_cap">Market Cap</option>
                    <option value="price_change_24h">Price Change</option>
                    <option value="age_hours">Age</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Token List */}
          <div className="xl:col-span-2">
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">
                  Detected Tokens ({filteredTokens.length})
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Token</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">24h Change</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Volume</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Liquidity</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Age</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Risk</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredTokens.map((token) => (
                      <motion.tr
                        key={token.address}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          selectedToken?.address === token.address ? 'bg-purple-500/10' : ''
                        }`}
                        onClick={() => setSelectedToken(token)}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{token.symbol}</div>
                            <div className="text-sm text-gray-400 truncate max-w-32">{token.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-white">${formatPrice(token.price)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${getChangeColor(token.price_change_24h)}`}>
                            {token.price_change_24h > 0 ? '+' : ''}{token.price_change_24h.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">${formatNumber(token.volume_24h)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white">${formatNumber(token.liquidity)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400">{token.age_hours}h</span>
                        </td>
                        <td className="px-6 py-4">
                          {getRiskBadge(token)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedToken(token)
                              }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                // Add to watchlist logic
                              }}
                              className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded transition-colors"
                              title="Add to Watchlist"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredTokens.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No tokens found matching your criteria</p>
                  </div>
                )}
                
                {isLoading && (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Scanning for tokens...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            {selectedToken ? (
              <>
                {/* Token Details */}
                <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Token Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Symbol:</span>
                      <span className="text-white font-medium">{selectedToken.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Market Cap:</span>
                      <span className="text-white">${formatNumber(selectedToken.market_cap)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Holders:</span>
                      <span className="text-white">{formatNumber(selectedToken.holder_count)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dev Active:</span>
                      <span className={selectedToken.dev_wallet_active ? 'text-red-400' : 'text-green-400'}>
                        {selectedToken.dev_wallet_active ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Chart */}
                <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Price Chart (24h)</h3>
                  {tokenHistory.length > 0 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                      <AreaChart
                        accessibilityLayer
                        data={tokenHistory}
                        margin={{
                          left: 12,
                          right: 12,
                        }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="time"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          tickLine={false}
                          axisLine={false}
                          className="text-xs"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          dataKey="price"
                          tickLine={false}
                          axisLine={false}
                          domain={['auto', 'auto']}
                          tickFormatter={(value) => `$${formatPrice(value)}`}
                          className="text-xs"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Area
                          dataKey="price"
                          type="monotone"
                          fill="url(#fillPrice)"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <AreaChart className="w-12 h-12 mx-auto mb-3" />
                      No historical data available for this token.
                    </div>
                  )}
                </div>

                {/* AI Analysis */}
                <AIAnalysisPanel 
                  tokenAddress={selectedToken.address} 
                  tokenData={selectedToken}
                />

                {/* Trading Signals */}
                <TradingSignalsPanel tokenAddress={selectedToken.address} />
              </>
            ) : (
              <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
                <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Select a Token</h3>
                <p className="text-gray-400">
                  Click on any token from the list to view detailed AI analysis and trading signals
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

