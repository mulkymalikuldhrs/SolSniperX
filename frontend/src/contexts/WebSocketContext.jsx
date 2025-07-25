import { createContext, useContext, useState, useEffect, useRef } from 'react'

const WebSocketContext = createContext()

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export function WebSocketProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [priceUpdates, setPriceUpdates] = useState({})
  const [walletUpdates, setWalletUpdates] = useState({}) // New state for wallet updates
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)

  const wsURL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000'

  const connect = () => {
    try {
      wsRef.current = new WebSocket(wsURL)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
        reconnectAttempts.current = 0
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)

          // Handle different message types
          switch (data.type) {
            case 'price_update':
              setPriceUpdates(prev => ({
                ...prev,
                [data.address]: {
                  price: data.price,
                  price_change_24h: data.price_change_24h,
                  volume_24h: data.volume_24h,
                  liquidity: data.liquidity
                }
              }))
              break
            case 'new_token':
              // Handle new token notifications
              break
            case 'trade_executed':
              setLastMessage(data) // Store the last trade executed message
              break
            case 'wallet_update': // Handle wallet updates
              setWalletUpdates(prev => ({
                ...prev,
                [data.wallet_id]: {
                  sol_balance: data.sol_balance,
                  usd_value: data.usd_value,
                  tokens: data.tokens,
                  total_value_usd: data.total_value_usd, // Assuming backend sends this
                  last_updated: new Date().toISOString()
                }
              }))
              break
            case 'wallet_deleted': // Handle wallet deletion
              setWalletUpdates(prev => {
                const newState = { ...prev }
                delete newState[data.wallet_id]
                return newState
              })
              break
            default:
              console.log('Unknown message type:', data.type)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < 5) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  const subscribeToToken = (tokenId) => {
    sendMessage({
      type: 'subscribe',
      token_id: tokenId
    })
  }

  const unsubscribeFromToken = (tokenId) => {
    sendMessage({
      type: 'unsubscribe',
      token_id: tokenId
    })
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [])

  const value = {
    connected,
    lastMessage,
    priceUpdates,
    walletUpdates,
    newTokens,
    rugpullAlerts,
    autoTraderStatus,
    connect,
    disconnect,
    sendMessage,
    subscribeToToken,
    unsubscribeFromToken,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

