import { createContext, useContext, useState, useCallback } from 'react'

const ApiContext = createContext()

export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}

export function ApiProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('solsniperx_token')
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseURL])

  // Token scanning
  const scanTokens = useCallback(async (params = {}) => {
    return makeRequest('/api/scanner/scan', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }, [makeRequest])

  // Token analysis
  const analyzeToken = useCallback(async (tokenId) => {
    return makeRequest(`/api/ai/analyze/${tokenId}`, {
      method: 'POST',
    })
  }, [makeRequest])

  // Mempool monitoring
  const monitorMempool = useCallback(async () => {
    return makeRequest('/api/mempool/monitor')
  }, [makeRequest])

  // Trading operations
  const buyToken = useCallback(async (tokenAddress, amountSol, slippage = 1.0) => {
    return makeRequest('/api/trading/buy', {
      method: 'POST',
      body: JSON.stringify({ token_address: tokenAddress, amount_sol: amountSol, slippage }),
    })
  }, [makeRequest])

  const sellToken = useCallback(async (tokenAddress, amountTokens, slippage = 1.0) => {
    return makeRequest('/api/trading/sell', {
      method: 'POST',
      body: JSON.stringify({ token_address: tokenAddress, amount_tokens: amountTokens, slippage }),
    })
  }, [makeRequest])

  // Analytics
  const getDashboardData = useCallback(async () => {
    return makeRequest('/api/analytics/dashboard')
  }, [makeRequest])

  const getTransactions = useCallback(async (limit = 50) => {
    return makeRequest(`/api/analytics/transactions?limit=${limit}`)
  }, [makeRequest])

  // Token History
  const getTokenHistory = useCallback(async (tokenAddress, interval = '1h', limit = 24) => {
    return makeRequest(`/api/tokens/${tokenAddress}/history?interval=${interval}&limit=${limit}`)
  }, [makeRequest])

  // Wallet
  const getWalletBalance = useCallback(async () => {
    return makeRequest('/api/wallet/balance')
  }, [makeRequest])

  const getWallets = useCallback(async () => {
    return makeRequest('/api/wallets')
  }, [makeRequest])

  const addWallet = useCallback(async (name, privateKey) => {
    return makeRequest('/api/wallets', {
      method: 'POST',
      body: JSON.stringify({ name, private_key: privateKey }),
    })
  }, [makeRequest])

  const updateWallet = useCallback(async (walletId, updates) => {
    return makeRequest(`/api/wallets/${walletId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }, [makeRequest])

  const deleteWallet = useCallback(async (walletId) => {
    return makeRequest(`/api/wallets/${walletId}`, {
      method: 'DELETE',
    })
  }, [makeRequest])

  const value = {
    loading,
    error,
    makeRequest,
    scanTokens,
    analyzeToken,
    monitorMempool,
    buyToken,
    sellToken,
    getDashboardData,
    getTransactions,
    getTokenHistory, // Add new function
    getWalletBalance,
    getTradingSignals,
    startAutoTrader,
    stopAutoTrader,
    getWallets,
    addWallet,
    updateWallet,
    deleteWallet,
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}

