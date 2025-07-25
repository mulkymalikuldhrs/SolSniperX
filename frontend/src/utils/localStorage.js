// Local Storage Utilities for SolSniperX
// Handles secure data storage and encryption

class LocalStorageManager {
  constructor() {
    this.prefix = 'solsniperx_'
    this.encryptionKey = this.getOrCreateEncryptionKey()
  }

  // Generate or retrieve encryption key
  getOrCreateEncryptionKey() {
    const keyName = `${this.prefix}encryption_key`
    let key = localStorage.getItem(keyName)
    
    if (!key) {
      // Generate a new encryption key
      key = this.generateRandomKey()
      localStorage.setItem(keyName, key)
    }
    
    return key
  }

  // Generate random encryption key
  generateRandomKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Simple encryption (for demo purposes - in production use proper encryption)
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data)
      const encrypted = btoa(jsonString + this.encryptionKey)
      return encrypted
    } catch (error) {
      console.error('Encryption error:', error)
      return null
    }
  }

  // Simple decryption
  decrypt(encryptedData) {
    try {
      const decrypted = atob(encryptedData)
      const jsonString = decrypted.replace(this.encryptionKey, '')
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Decryption error:', error)
      return null
    }
  }

  // Store data securely
  setSecureItem(key, data) {
    try {
      const encrypted = this.encrypt(data)
      if (encrypted) {
        localStorage.setItem(`${this.prefix}${key}`, encrypted)
        return true
      }
      return false
    } catch (error) {
      console.error('Error storing secure item:', error)
      return false
    }
  }

  // Retrieve data securely
  getSecureItem(key) {
    try {
      const encrypted = localStorage.getItem(`${this.prefix}${key}`)
      if (encrypted) {
        return this.decrypt(encrypted)
      }
      return null
    } catch (error) {
      console.error('Error retrieving secure item:', error)
      return null
    }
  }

  // Store regular data
  setItem(key, data) {
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error storing item:', error)
      return false
    }
  }

  // Retrieve regular data
  getItem(key) {
    try {
      const data = localStorage.getItem(`${this.prefix}${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error retrieving item:', error)
      return null
    }
  }

  // Remove item
  removeItem(key) {
    try {
      localStorage.removeItem(`${this.prefix}${key}`)
      return true
    } catch (error) {
      console.error('Error removing item:', error)
      return false
    }
  }

  // Clear all SolSniperX data
  clearAll() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Error clearing data:', error)
      return false
    }
  }

  // Get all stored keys
  getAllKeys() {
    try {
      const keys = Object.keys(localStorage)
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''))
    } catch (error) {
      console.error('Error getting keys:', error)
      return []
    }
  }

  // Export data for backup
  exportData() {
    try {
      const data = {}
      const keys = this.getAllKeys()
      
      keys.forEach(key => {
        if (key !== 'encryption_key') {
          data[key] = this.getItem(key)
        }
      })
      
      return data
    } catch (error) {
      console.error('Error exporting data:', error)
      return null
    }
  }

  // Import data from backup
  importData(data) {
    try {
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key])
      })
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

// User data management
export class UserDataManager extends LocalStorageManager {
  constructor() {
    super()
  }

  // Save user profile
  saveUser(userData) {
    return this.setSecureItem('user', userData)
  }

  // Get user profile
  getUser() {
    return this.getSecureItem('user')
  }

  // Save private key
  savePrivateKey(privateKey) {
    return this.setSecureItem('private_key', privateKey)
  }

  // Get private key
  getPrivateKey() {
    return this.getSecureItem('private_key')
  }

  // Save wallet data
  saveWallet(walletData) {
    return this.setSecureItem('wallet', walletData)
  }

  // Get wallet data
  getWallet() {
    return this.getSecureItem('wallet')
  }

  // Save watchlist
  saveWatchlist(watchlist) {
    return this.setItem('watchlist', watchlist)
  }

  // Get watchlist
  getWatchlist() {
    return this.getItem('watchlist') || []
  }

  // Save settings
  saveSettings(settings) {
    return this.setItem('settings', settings)
  }

  // Get settings
  getSettings() {
    return this.getItem('settings') || {}
  }

  // Save trading history
  saveTradingHistory(history) {
    return this.setItem('trading_history', history)
  }

  // Get trading history
  getTradingHistory() {
    return this.getItem('trading_history') || []
  }

  // Save analytics data
  saveAnalytics(analytics) {
    return this.setItem('analytics', analytics)
  }

  // Get analytics data
  getAnalytics() {
    return this.getItem('analytics') || {}
  }

  // Check if user is logged in
  isLoggedIn() {
    const user = this.getUser()
    const privateKey = this.getPrivateKey()
    return !!(user && privateKey)
  }

  // Logout user
  logout() {
    this.removeItem('user')
    this.removeItem('private_key')
    this.removeItem('wallet')
    return true
  }

  // Get session data
  getSession() {
    return {
      user: this.getUser(),
      isLoggedIn: this.isLoggedIn(),
      wallet: this.getWallet(),
      settings: this.getSettings()
    }
  }
}

// Create singleton instance
export const userDataManager = new UserDataManager()

// Utility functions
export const storage = {
  // User management
  saveUser: (userData) => userDataManager.saveUser(userData),
  getUser: () => userDataManager.getUser(),
  isLoggedIn: () => userDataManager.isLoggedIn(),
  logout: () => userDataManager.logout(),
  
  // Wallet management
  saveWallet: (walletData) => userDataManager.saveWallet(walletData),
  getWallet: () => userDataManager.getWallet(),
  savePrivateKey: (privateKey) => userDataManager.savePrivateKey(privateKey),
  getPrivateKey: () => userDataManager.getPrivateKey(),
  
  // App data
  saveWatchlist: (watchlist) => userDataManager.saveWatchlist(watchlist),
  getWatchlist: () => userDataManager.getWatchlist(),
  saveSettings: (settings) => userDataManager.saveSettings(settings),
  getSettings: () => userDataManager.getSettings(),
  saveTradingHistory: (history) => userDataManager.saveTradingHistory(history),
  getTradingHistory: () => userDataManager.getTradingHistory(),
  saveAnalytics: (analytics) => userDataManager.saveAnalytics(analytics),
  getAnalytics: () => userDataManager.getAnalytics(),
  
  // Session
  getSession: () => userDataManager.getSession(),
  
  // Data management
  exportData: () => userDataManager.exportData(),
  importData: (data) => userDataManager.importData(data),
  clearAll: () => userDataManager.clearAll()
}

export default storage

