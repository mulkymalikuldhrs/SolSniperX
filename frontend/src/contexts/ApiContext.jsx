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
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
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
  const analyzeToken = useCallback(async (tokenAddress) => {
    return makeRequest(`/api/ai/analyze/${tokenAddress}`, {
      method: 'POST',
    })
  }, [makeRequest])

  const getTradingSignals = useCallback(async (tokenAddress) => {
    return makeRequest(`/api/ai/trading-signals/${tokenAddress}`, {
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

  const placeLimitOrder = useCallback(async (tokenAddress, targetPrice, amountSol, side = 'buy', tokenSymbol = null) => {
    return makeRequest('/api/trading/limit-order', {
      method: 'POST',
      body: JSON.stringify({
        token_address: tokenAddress,
        target_price: targetPrice,
        amount_sol: amountSol,
        side,
        token_symbol: tokenSymbol
      }),
    })
  }, [makeRequest])

  // Auto Trader
  const startAutoTrader = useCallback(async () => {
    return makeRequest('/api/auto-trader/start', {
      method: 'POST',
    })
  }, [makeRequest])

  const stopAutoTrader = useCallback(async () => {
    return makeRequest('/api/auto-trader/stop', {
      method: 'POST',
    })
  }, [makeRequest])

  // Analytics
  const getDashboardData = useCallback(async () => {
    return makeRequest('/api/analytics/dashboard')
  }, [makeRequest])

  const getTransactions = useCallback(async (limit = 50) => {
    return makeRequest(`/api/analytics/transactions?limit=${limit}`)
  }, [makeRequest])

  const getPerformanceMetrics = useCallback(async () => {
    return makeRequest('/api/analytics/performance')
  }, [makeRequest])

  // Token History
  const getTokenHistory = useCallback(async (tokenAddress, interval = '1h', limit = 24) => {
    return makeRequest(`/api/tokens/${tokenAddress}/history?interval=${interval}&limit=${limit}`)
  }, [makeRequest])

  // Wallet
  const getWalletBalance = useCallback(async () => {
    return makeRequest('/api/wallet/balance')
  }, [makeRequest])

  const value = {
    loading,
    error,
    makeRequest,
    scanTokens,
    analyzeToken,
    getTradingSignals,
    monitorMempool,
    buyToken,
    sellToken,
    startAutoTrader,
    stopAutoTrader,
    getDashboardData,
    getTransactions,
    getPerformanceMetrics,
    getTokenHistory,
    getWalletBalance,
    placeLimitOrder,
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}
