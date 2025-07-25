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
  Send,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Settings,
  Shield,
  Clock,
  DollarSign,
  Trash2
} from 'lucide-react'

export default function WalletPage() {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [walletBalance, setWalletBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([]) // Initialize as empty, will be populated by WebSocket or API
  const [tokenBalances, setTokenBalances] = useState([]) // New state for token balances

  const { getWallets, getWalletBalance, addWallet, deleteWallet } = useApi()
  const { lastMessage, walletUpdates } = useWebSocket() // Import walletUpdates

  const fetchWallets = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getWallets()
      if (result.success) {
        setWallets(result.data)
        // Select the first wallet by default if none is selected
        if (!selectedWallet && result.data.length > 0) {
          setSelectedWallet(result.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching wallets:', error)
    } finally {
      setLoading(false)
    }
  }, [getWallets, selectedWallet])

  const refreshBalance = useCallback(async () => {
    if (selectedWallet) {
      setLoading(true)
      try {
        const result = await getWalletBalance(selectedWallet.id)
        if (result.success) {
          setWalletBalance(result.data)
          setTokenBalances(result.data.tokens || [])
        }
      } catch (error) {
        console.error('Error refreshing balance:', error)
      } finally {
        setLoading(false)
      }
    } else {
      // If no wallet is selected, fetch overall balance
      setLoading(true)
      try {
        const result = await getWalletBalance()
        if (result.success) {
          setWalletBalance(result.data)
          setTokenBalances(result.data.tokens || [])
        }
      } catch (error) {
        console.error('Error fetching overall balance:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [selectedWallet, getWalletBalance])

  const handleAddWallet = useCallback(async (name, privateKey) => {
    setLoading(true)
    try {
      const result = await addWallet(name, privateKey)
      if (result.success) {
        setShowAddWalletModal(false)
        fetchWallets() // Re-fetch wallets to update the list
      }
    } catch (error) {
      console.error('Error adding wallet:', error)
    } finally {
      setLoading(false)
    }
  }, [addWallet, fetchWallets])

  const handleDeleteWallet = useCallback(async (walletId) => {
    setLoading(true)
    try {
      const result = await deleteWallet(walletId)
      if (result.success) {
        fetchWallets() // Re-fetch wallets to update the list
        if (selectedWallet?.id === walletId) {
          setSelectedWallet(null) // Deselect if the deleted wallet was selected
          setWalletBalance(null)
          setTokenBalances([])
        }
      }
    } catch (error) {
      console.error('Error deleting wallet:', error)
    } finally {
      setLoading(false)
    }
  }, [deleteWallet, fetchWallets, selectedWallet])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Address copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err))
  }

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'trade_executed') {
      const newTrade = {
        id: lastMessage.transaction_id,
        type: lastMessage.type,
        token: lastMessage.token_address.substring(0, 4) + '...' + lastMessage.token_address.substring(lastMessage.token_address.length - 4),
        amount: lastMessage.type === 'buy' ? lastMessage.amount_sol : lastMessage.amount_tokens,
        hash: lastMessage.transaction_id, // Using transaction_id as hash for now
        time: 'just now',
        status: lastMessage.status
      }
      setTransactions(prevTransactions => [newTrade, ...prevTransactions].slice(0, 10)) // Keep last 10 transactions
      refreshBalance() // Refresh balance after a trade
    }
  }, [lastMessage, refreshBalance])

  useEffect(() => {
    // Update wallets and balances based on WebSocket updates
    if (walletUpdates) {
      setWallets(prevWallets => {
        return prevWallets.map(wallet => {
          if (walletUpdates[wallet.id]) {
            return {
              ...wallet,
              sol_balance: walletUpdates[wallet.id].sol_balance,
              usd_value: walletUpdates[wallet.id].usd_value,
              tokens: walletUpdates[wallet.id].tokens,
            }
          }
          return wallet
        }).filter(wallet => walletUpdates[wallet.id] !== undefined) // Remove deleted wallets
      })

      if (selectedWallet && walletUpdates[selectedWallet.id]) {
        setWalletBalance(prevBalance => ({
          ...prevBalance,
          sol_balance: walletUpdates[selectedWallet.id].sol_balance,
          usd_value: walletUpdates[selectedWallet.id].usd_value,
          tokens: walletUpdates[selectedWallet.id].tokens,
          total_value_usd: walletUpdates[selectedWallet.id].total_value_usd || prevBalance?.total_value_usd,
        }))
        setTokenBalances(walletUpdates[selectedWallet.id].tokens || [])
      } else if (!selectedWallet && Object.keys(walletUpdates).length > 0) {
        // If no wallet is selected, aggregate total from all updated wallets
        const totalSol = Object.values(walletUpdates).reduce((sum, w) => sum + w.sol_balance, 0)
        const totalUsd = Object.values(walletUpdates).reduce((sum, w) => sum + w.usd_value, 0)
        const allTokens = Object.values(walletUpdates).flatMap(w => w.tokens)
        const totalValueUsd = totalUsd + allTokens.reduce((sum, t) => sum + t.usd_value, 0)

        setWalletBalance({
          sol_balance: totalSol,
          usd_value: totalUsd,
          tokens: allTokens,
          total_value_usd: totalValueUsd,
          last_updated: new Date().toISOString()
        })
        setTokenBalances(allTokens)
      }
    }
  }, [walletUpdates, selectedWallet])

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
            Wallet Management
          </h1>
          <p className="text-muted-foreground">
            Manage your Solana wallets and track your portfolio
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
          
          <button 
            onClick={() => setShowAddWalletModal(true)}
            className="btn-gradient flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Wallet</span>
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
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+0.00 (0.00%)</span>
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
              <p className="text-sm text-muted-foreground">Total SOL</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">+0.00 SOL today</span>
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Active Wallets</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">All secured</span>
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
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {tokenBalances.map((token, index) => (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">{token.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {token.symbol === 'SOL' 
                      ? token.balance.toFixed(4) 
                      : token.balance.toLocaleString()
                    } {token.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${token.value.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${
                    token.change > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {token.change > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">
                      {token.change > 0 ? '+' : ''}{token.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <h2 className="text-xl font-bold">Recent Transactions</h2>
            <button className="text-sm text-primary hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'receive' ? 'bg-green-500/20 text-green-400' :
                    tx.type === 'send' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {tx.type === 'receive' ? (
                      <Download className="w-4 h-4" />
                    ) : tx.type === 'send' ? (
                      <Send className="w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.token} • {typeof tx.amount === 'number' ? tx.amount.toLocaleString() : tx.amount}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tx.status}
                    </span>
                    <button
                      onClick={() => window.open(`https://solscan.io/tx/${tx.hash}`, '_blank')}
                      className="p-1 hover:bg-accent rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {tx.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Wallet Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="card-modern p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Send Tokens</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Transfer SOL or SPL tokens to another wallet
          </p>
          <button className="btn-gradient w-full">
            Send
          </button>
        </div>

        <div className="card-modern p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Receive Tokens</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get your wallet address to receive payments
          </p>
          <button className="btn-gradient w-full">
            Receive
          </button>
        </div>

        <div className="card-modern p-6 text-center hover-lift cursor-pointer">
          <div className="w-16 h-16 bg-gradient-warning rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Wallet Settings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Manage security and preferences
          </p>
          <button className="btn-gradient w-full">
            Settings
          </button>
        </div>
      </motion.div>

      
    </div>
  )
}

