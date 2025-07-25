import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './contexts/ThemeContext'
import { ApiProvider } from './contexts/ApiContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import LoadingScreen from './components/ui/LoadingScreen'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import DashboardPage from './pages/DashboardPage'
import TokenScannerPage from './pages/TokenScannerPage'
import TradingPage from './pages/TradingPage'
import WalletPage from './pages/WalletPage'
import WatchlistPage from './pages/WatchlistPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import './App.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <ThemeProvider>
      <ApiProvider>
          <WebSocketProvider>
            <Router>
              <div className="min-h-screen bg-gray-900 text-white">
                {/* Navigation */}
                <Navbar 
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
                
                <div className="flex">
                  {/* Sidebar */}
                  <Sidebar 
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />
                  
                  {/* Main Content */}
                  <main className={`flex-1 transition-all duration-300 ${
                    sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
                  }`}>
                    <div className="pt-16">
                      <AnimatePresence mode="wait">
                        <Routes>
                          <Route 
                            path="/" 
                            element={
                              <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <DashboardPage />
                              </motion.div>
                            } 
                          />
                          <Route 
                            path="/scanner" 
                            element={
                              <motion.div
                                key="scanner"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <TokenScannerPage />
                              </motion.div>
                            } 
                          />
                          <Route 
                            path="/trading" 
                            element={
                              <motion.div
                                key="trading"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <TradingPage />
                              </motion.div>
                            } 
                          />
                          <Route 
                            path="/wallet" 
                            element={
                              <motion.div
                                key="wallet"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <WalletPage />
                              </motion.div>
                            } 
                          />
                          <Route 
                            path="/watchlist" 
                            element={
                              <motion.div
                                key="watchlist"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <WatchlistPage />
                              </motion.div>
                            } 
                          />
                          <Route 
                            path="/analytics" 
                            element={
                              <motion.div
                                key="analytics"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <AnalyticsPage />
                              </motion.div>
                            } 
                          />
                          <Route 
                            path="/settings" 
                            element={
                              <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                              >
                                <SettingsPage />
                              </motion.div>
                            } 
                          />
                          <Route path="/terms" element={<TermsPage />} />
                          <Route path="/privacy" element={<PrivacyPage />} />
                        </Routes>
                      </AnimatePresence>
                    </div>
                  </main>
                </div>
              </div>
            </Router>
          </WebSocketProvider>
        </ApiProvider>
      
    </ThemeProvider>
  )
}

export default App

