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
  Settings,
  Shield,
  Clock,
  DollarSign
} from 'lucide-react'

export default function WalletPage() {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [walletBalance, setWalletBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [tokenBalances, setTokenBalances] = useState([])

  const { getWalletBalance } = useApi()
  const { lastMessage } = useWebSocket()

  const refreshBalance = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getWalletBalance()
      if (result.success) {
        setWalletBalance(result.data)
        setTokenBalances(result.data.tokens || [])
      }
    } catch (error) {
      console.error('Error refreshing balance:', error)
    } finally {
      setLoading(false)
    }
  }, [getWalletBalance])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Address copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err))
  }

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'trade_executed' || lastMessage.type === 'auto_trade_event')) {
      const data = lastMessage.data
      const newTrade = {
        id: data.transaction_id || Math.random(),
        type: data.type || 'trade',
        token: data.token || data.token_address?.substring(0, 4) + '...' + data.token_address?.substring(data.token_address.length - 4),
        amount: data.amount_sol || data.amount_tokens || 0,
        hash: data.transaction_id || '',
        time: 'just now',
        status: data.status || 'confirmed'
      }
      setTransactions(prev => [newTrade, ...prev].slice(0, 10))
      refreshBalance()
    }
  }, [lastMessage, refreshBalance])

  if (loading && !walletBalance) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Wallet Portfolio
          </h1>
          <p className="text-muted-foreground">
            Monitor your balance and token holdings
          </p>
        </div>

        <button
          onClick={refreshBalance}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-accent/50 border border-border/50 rounded-xl hover:bg-accent transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Balance</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Portfolio"
          value={`$${walletBalance?.total_value_usd?.toFixed(2) || '0.00'}`}
          subValue="Calculated from real-time prices"
          icon={<DollarSign className="w-6 h-6 text-white" />}
          gradient="bg-gradient-primary"
        />
        <StatsCard
          title="SOL Balance"
          value={`${walletBalance?.sol_balance?.toFixed(4) || '0.0000'} SOL`}
          subValue={`$${walletBalance?.usd_value?.toFixed(2) || '0.00'}`}
          icon={<Wallet className="w-6 h-6 text-white" />}
          gradient="bg-gradient-success"
        />
        <StatsCard
          title="Security"
          value="ENCRYPTED"
          subValue="Private key isolated"
          icon={<Shield className="w-6 h-6 text-white" />}
          gradient="bg-gradient-warning"
        />
      </div>

      <div className="bg-accent/30 border border-border/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
          <button
            onClick={() => copyToClipboard(walletBalance?.address)}
            className="text-primary hover:underline text-sm flex items-center space-x-1"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Address</span>
          </button>
        </div>
        <p className="font-mono text-xl break-all">{walletBalance?.address}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <h2 className="text-xl font-bold mb-6">Token Balances</h2>
          <div className="space-y-4">
            {tokenBalances.length > 0 ? tokenBalances.map((token, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-accent/50 rounded-xl border border-border/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {token.symbol?.slice(0, 2) || 'T'}
                  </div>
                  <div>
                    <p className="font-bold">{token.symbol || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{token.mint_address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{token.balance_raw}</p>
                  <p className="text-xs text-muted-foreground">Raw Balance</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">No SPL tokens found in this wallet.</div>
            )}
          </div>
        </div>

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {transactions.length > 0 ? transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-accent/50 rounded-xl border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.type === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm capitalize">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.token} • {tx.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    {tx.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{tx.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-muted-foreground">No recent transactions detected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, subValue, icon, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-modern p-6 hover-lift shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{subValue}</p>
    </motion.div>
  )
}
