import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { 
  Star, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Trash2,
  Bell,
  BellOff,
  Target,
  AlertTriangle,
  Shield,
  Zap,
  Loader2
} from 'lucide-react'

const WATCHLIST_STORAGE_KEY = 'solsniperx_watchlist'

function loadWatchlist() {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveWatchlist(list) {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(list))
}

export default function WatchlistPage() {
  const { scanTokens } = useApi()
  const [watchlist, setWatchlist] = useState(loadWatchlist)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTokenAddress, setNewTokenAddress] = useState('')
  const [addingToken, setAddingToken] = useState(false)
  const [addError, setAddError] = useState(null)

  useEffect(() => {
    saveWatchlist(watchlist)
  }, [watchlist])

  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter(token => token.id !== id))
  }

  const toggleAlert = (id) => {
    setWatchlist(watchlist.map(token => 
      token.id === id 
        ? { ...token, alertEnabled: !token.alertEnabled }
        : token
    ))
  }

  const handleAddToken = async () => {
    if (!newTokenAddress.trim()) return
    setAddingToken(true)
    setAddError(null)
    try {
      const result = await scanTokens({ minLiquidity: 0, maxAge: 999999, minVolume: 0 })
      // Try to find the token in scan results, or create a minimal entry
      const found = result?.data?.tokens?.find(t => 
        t.address?.toLowerCase() === newTokenAddress.trim().toLowerCase()
      )
      
      const newToken = found || {
        address: newTokenAddress.trim(),
        symbol: newTokenAddress.trim().slice(0, 6),
        name: 'Unknown Token',
        price: 0,
        price_change_24h: 0,
        volume_24h: 0,
        market_cap: 0,
        liquidity: 0,
        age_hours: 0
      }

      const watchlistEntry = {
        id: Date.now(),
        symbol: newToken.symbol,
        name: newToken.name,
        address: newToken.address,
        price: newToken.price || 0,
        priceChange24h: newToken.price_change_24h || 0,
        volume24h: newToken.volume_24h || 0,
        marketCap: newToken.market_cap || 0,
        alertPrice: (newToken.price || 0) * 1.5,
        alertEnabled: true,
        addedAt: new Date().toISOString().split('T')[0],
        riskScore: newToken.top_holder_percentage > 50 ? 70 : newToken.top_holder_percentage > 30 ? 40 : 15,
        isVerified: false
      }

      setWatchlist(prev => [watchlistEntry, ...prev])
      setShowAddModal(false)
      setNewTokenAddress('')
    } catch (error) {
      console.error('Error adding token:', error)
      setAddError('Failed to add token. Please check the address.')
    } finally {
      setAddingToken(false)
    }
  }

  const filteredWatchlist = watchlist.filter(token =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price) => {
    if (!price || price === 0) return '$0.00000000'
    if (price < 0.000001) return `$${price.toExponential(2)}`
    if (price < 0.01) return `$${price.toFixed(8)}`
    return `$${price.toFixed(4)}`
  }

  const formatLargeNumber = (num) => {
    if (!num || num === 0) return '$0'
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
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
            Watchlist
          </h1>
          <p className="text-muted-foreground">
            Monitor your favorite tokens and set price alerts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gradient flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Token</span>
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-modern p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Watched</p>
              <p className="text-2xl font-bold">{watchlist.length}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-modern p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold text-green-400">
                {watchlist.filter(t => t.alertEnabled).length}
              </p>
            </div>
            <Bell className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gainers</p>
              <p className="text-2xl font-bold text-green-400">
                {watchlist.filter(t => t.priceChange24h > 0).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-modern p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Losers</p>
              <p className="text-2xl font-bold text-red-400">
                {watchlist.filter(t => t.priceChange24h < 0).length}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-modern p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search watchlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Watchlist Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-modern overflow-hidden"
      >
        {filteredWatchlist.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tokens in watchlist</h3>
            <p className="text-muted-foreground mb-4">
              Add tokens to your watchlist to monitor their performance
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-gradient"
            >
              Add Your First Token
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="text-left p-4 font-semibold">Token</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold">24h Change</th>
                  <th className="text-left p-4 font-semibold">Volume</th>
                  <th className="text-left p-4 font-semibold">Market Cap</th>
                  <th className="text-left p-4 font-semibold">Alert Price</th>
                  <th className="text-left p-4 font-semibold">Risk</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWatchlist.map((token, index) => (
                  <motion.tr
                    key={token.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-accent/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {token.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{token.symbol}</p>
                            {token.isVerified && (
                              <Shield className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-mono">{formatPrice(token.price)}</p>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center space-x-1 ${
                        token.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {token.priceChange24h > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-semibold">
                          {token.priceChange24h > 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p>{formatLargeNumber(token.volume24h)}</p>
                    </td>
                    <td className="p-4">
                      <p>{formatLargeNumber(token.marketCap)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm">{formatPrice(token.alertPrice)}</p>
                        {token.price >= token.alertPrice && token.alertEnabled && (
                          <Target className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        token.riskScore < 30 ? 'bg-green-500/20 text-green-400' :
                        token.riskScore < 70 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {token.riskScore}%
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAlert(token.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            token.alertEnabled
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-muted text-muted-foreground hover:bg-accent'
                          }`}
                        >
                          {token.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </button>
                        <button className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                          <Zap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(token.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Token Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Add Token to Watchlist</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Token Address
                </label>
                <input
                  type="text"
                  value={newTokenAddress}
                  onChange={(e) => setNewTokenAddress(e.target.value)}
                  placeholder="Enter Solana token address..."
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {addError && (
                <p className="text-red-400 text-sm">{addError}</p>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setNewTokenAddress('')
                    setAddError(null)
                  }}
                  className="flex-1 px-4 py-2 bg-accent border border-border rounded-lg hover:bg-accent/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToken}
                  disabled={addingToken}
                  className="flex-1 btn-gradient flex items-center justify-center space-x-2"
                >
                  {addingToken ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Token</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
