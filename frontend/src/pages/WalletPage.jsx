import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../contexts/ApiContext'
import { useWebSocket } from '../contexts/WebSocketContext'
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Download,
  RefreshCw,
  Shield,
  Clock,
  DollarSign
} from 'lucide-react'

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [tokenBalances, setTokenBalances] = useState([])

  const { getWalletBalance, getTransactions } = useApi()
  const { lastMessage, walletUpdates } = useWebSocket()

  const refreshBalance = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getWalletBalance()
      if (result.success) {
        setWalletBalance(result.data)
        setTokenBalances(result.data.tokens || [])
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    } finally {
      setLoading(false)
    }
  }, [getWalletBalance])

  const fetchTransactions = useCallback(async () => {
    try {
      const result = await getTransactions(20)
      if (result.success) {
        setTransactions(result.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }, [getTransactions])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Address copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err))
  }

  useEffect(() => {
    refreshBalance()
    fetchTransactions()
  }, [refreshBalance, fetchTransactions])

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'trade_executed' || lastMessage.type === 'auto_trade_event')) {
      refreshBalance()
      fetchTransactions()
    }
  }, [lastMessage, refreshBalance, fetchTransactions])

  useEffect(() => {
    if (walletUpdates && walletUpdates.address === walletBalance?.address) {
      setWalletBalance(prev => ({
        ...prev,
        sol_balance: walletUpdates.sol_balance,
        usd_value: walletUpdates.usd_value,
        tokens: walletUpdates.tokens,
        total_value_usd: walletUpdates.total_value_usd,
        last_updated: walletUpdates.last_updated
      }))
      setTokenBalances(walletUpdates.tokens || [])
    }
  }, [walletUpdates, walletBalance?.address])

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
            Wallet
          </h1>
          <p className="text-muted-foreground">
            Manage your Solana wallet and track your portfolio
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={refreshBalance}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-accent border border-border rounded-lg hover:bg-accent/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${walletBalance?.total_value_usd?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Total Portfolio</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground truncate">
            <span>{walletBalance?.address}</span>
            <button onClick={() => copyToClipboard(walletBalance?.address)} className="hover:text-primary">
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{walletBalance?.sol_balance?.toFixed(4) || '0.0000'} SOL</p>
              <p className="text-sm text-muted-foreground">Available SOL</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Mainnet Beta</span>
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
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{tokenBalances.length}</p>
              <p className="text-sm text-muted-foreground">Tokens Owned</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Last updated {walletBalance?.last_updated ? new Date(walletBalance.last_updated).toLocaleTimeString() : 'N/A'}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Balances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Token Balances</h2>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {tokenBalances.length > 0 ? tokenBalances.map((token, index) => (
              <motion.div
                key={token.mint_address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {(token.symbol || '??').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{token.symbol || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate w-32">{token.mint_address}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {token.balance?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${token.usd_value?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </motion.div>
            )) : (
              <p className="text-center text-muted-foreground py-10">No tokens found.</p>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-modern p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Trades</h2>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {transactions.length > 0 ? transactions.map((tx, index) => (
              <motion.div
                key={tx.transaction_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.type === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm capitalize">{tx.type} {tx.token_symbol || 'Token'}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.amount_sol ? `${tx.amount_sol.toFixed(3)} SOL` : `${tx.amount_tokens.toLocaleString()} tokens`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-2 justify-end">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      tx.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tx.status}
                    </span>
                    <button
                      onClick={() => window.open(`https://solscan.io/tx/${tx.transaction_id}`, '_blank')}
                      className="p-1 hover:bg-accent rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            )) : (
              <p className="text-center text-muted-foreground py-10">No recent transactions.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
