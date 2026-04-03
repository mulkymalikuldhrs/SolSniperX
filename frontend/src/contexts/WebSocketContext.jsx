import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

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
  const [walletUpdates, setWalletUpdates] = useState({})
  const [newTokens, setNewTokens] = useState([])
  const [rugpullAlerts, setRugpullAlerts] = useState([])
  const [autoTraderStatus, setAutoTraderStatus] = useState({ enabled: false })

  const socketRef = useRef(null)

  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const socket = io(baseURL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket.IO connected')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected')
      setConnected(false)
    })

    socket.on('price_update', (data) => {
      setPriceUpdates(prev => ({
        ...prev,
        [data.address]: {
          price: data.price,
          price_change_24h: data.price_change_24h,
          volume_24h: data.volume_24h,
          liquidity: data.liquidity
        }
      }))
    })

    socket.on('new_token', (data) => {
      setNewTokens(prev => [data, ...prev].slice(0, 50))
      setLastMessage({ type: 'new_token', data })
    })

    socket.on('trade_executed', (data) => {
      setLastMessage({ type: 'trade_executed', ...data })
    })

    socket.on('wallet_update', (data) => {
      setWalletUpdates(data)
    })

    socket.on('rugpull_alert', (data) => {
      setRugpullAlerts(prev => [data, ...prev].slice(0, 20))
      setLastMessage({ type: 'rugpull_alert', data })
    })

    socket.on('trading_status', (data) => {
      setAutoTraderStatus(data)
    })

    socket.on('auto_trade_event', (data) => {
      setLastMessage({ type: 'auto_trade_event', ...data })
    })

    return () => {
      socket.disconnect()
    }
  }, [baseURL])

  const sendMessage = (event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data)
    }
  }

  const value = {
    connected,
    lastMessage,
    priceUpdates,
    walletUpdates,
    newTokens,
    rugpullAlerts,
    autoTraderStatus,
    sendMessage,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
