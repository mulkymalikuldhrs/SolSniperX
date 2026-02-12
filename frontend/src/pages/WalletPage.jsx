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
  RefreshCw,
  Clock,
  DollarSign
} from 'lucide-react'

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [tokenBalances, setTokenBalances] = useState([])

  const { getWalletBalance, getTransactions } = useApi()
  const { lastMessage } = useWebSocket()

  const refreshBalance = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getWalletBalance()
      if (result.success) {
        setWalletBalance(result.data)
        setTokenBalances(result.data.tokens || [])
      }

      const txs = await getTransactions(10)
      setTransactions(txs || [])
    } catch (error) {
      console.error('Error fetching wallet data:', error)
    } finally {
      setLoading(false)
    }
  }, [getWalletBalance, getTransactions])

  useEffect(() => {
    refreshBalance()
  }, [])

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'trade_executed' || lastMessage.type === 'wallet_update')) {
      refreshBalance()
    }
  }, [lastMessage])

  const copyToClipboard = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient-primary">Wallet</h1>
        <button
          onClick={refreshBalance}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-accent rounded-lg"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Wallet className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${walletBalance?.total_value_usd?.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-muted-foreground">Portfolio Value</p>
            </div>
          </div>
        </div>

        <div className="card-modern p-6 col-span-2">
           <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
           <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <code className="text-sm truncate mr-2">{walletBalance?.address || 'Loading...'}</code>
              <button onClick={() => copyToClipboard(walletBalance?.address)} className="text-gray-400 hover:text-white">
                 <Copy size={18} />
              </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <h2 className="text-xl font-bold mb-4">Token Balances</h2>
          <div className="space-y-3">
             {tokenBalances.map((token, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center font-bold text-xs text-white">
                        {token.symbol?.slice(0,2)}
                     </div>
                     <div>
                        <p className="font-bold">{token.symbol}</p>
                        <p className="text-xs text-gray-400">{token.balance?.toLocaleString()}</p>
                     </div>
                  </div>
                  <p className="font-bold">${token.value?.toFixed(2)}</p>
               </div>
             ))}
             {tokenBalances.length === 0 && <p className="text-center text-gray-500 py-10">No tokens found</p>}
          </div>
        </div>

        <div className="card-modern p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
             {transactions.map((tx, i) => (
               <div key={i} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg text-sm">
                  <div className="flex items-center space-x-3">
                     <div className={`p-2 rounded-full ${tx.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {tx.type === 'buy' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                     </div>
                     <div>
                        <p className="font-bold uppercase">{tx.type} {tx.token_symbol || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="font-bold">{tx.amount_sol || tx.amount_tokens?.toFixed(2)} {tx.type === 'buy' ? 'SOL' : ''}</p>
                     <a href={`https://solscan.io/tx/${tx.transaction_id}`} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center justify-end">
                        View <ExternalLink size={10} className="ml-1" />
                     </a>
                  </div>
               </div>
             ))}
             {transactions.length === 0 && <p className="text-center text-gray-500 py-10">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
