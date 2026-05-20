import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Zap, 
  Wallet,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Loader2
} from 'lucide-react'
import { useApi } from '../contexts/ApiContext'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('trading')
  const [loading, setLoading] = useState(false)
  const { getAutoTraderConfig, updateAutoTraderConfig } = useApi()

  const [settings, setSettings] = useState({
    // Trading Settings (Synced with backend)
    buy_amount_sol: 0.05,
    slippage: 1.0,
    min_liquidity: 5000,
    max_liquidity: 50000,
    max_age_hours: 12,
    min_ai_probability_score: 75,
    stop_loss_percentage: 0.15,
    trailing_stop_loss_percentage: 0.10,
    max_risk_score: 30,
    rugcheck_max_score: 5000,
    use_vwap_filter: true,

    // General Settings (Local/UI)
    username: 'Trader',
    email: 'trader@solana.com',
    theme: 'dark',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    priceAlerts: true,
    tradeAlerts: true,
    rugAlerts: true,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await getAutoTraderConfig()
      if (response.success) {
        setSettings(prev => ({
          ...prev,
          ...response.data
        }))
      }
    } catch (error) {
      console.error('Error loading config:', error)
      toast.error('Failed to load trading configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    try {
      setLoading(true)
      // Extract only the trading settings that backend expects
      const tradingConfig = {
        min_liquidity: settings.min_liquidity,
        max_liquidity: settings.max_liquidity,
        max_age_hours: settings.max_age_hours,
        min_ai_probability_score: settings.min_ai_probability_score,
        buy_amount_sol: settings.buy_amount_sol,
        slippage: settings.slippage,
        stop_loss_percentage: settings.stop_loss_percentage,
        trailing_stop_loss_percentage: settings.trailing_stop_loss_percentage,
        max_risk_score: settings.max_risk_score,
        rugcheck_max_score: settings.rugcheck_max_score,
        use_vwap_filter: settings.use_vwap_filter,
        take_profit_tiers: settings.take_profit_tiers // Keep existing tiers if they exist
      }

      const response = await updateAutoTraderConfig(tradingConfig)
      if (response.success) {
        toast.success('Settings saved successfully')
      } else {
        toast.error(response.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('An error occurred while saving settings')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'trading', label: 'Trading Bot', icon: Zap },
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'wallet', label: 'Wallet', icon: Wallet }
  ]

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
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your SolSniperX experience and preferences
          </p>
        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="btn-gradient flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-modern p-6 h-fit"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 card-modern p-6"
        >
          {/* Trading Settings */}
          {activeTab === 'trading' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Trading Configuration</h2>
                <button
                  onClick={loadConfig}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  title="Refresh configuration"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Default Buy Amount (SOL)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.buy_amount_sol}
                      onChange={(e) => handleSettingChange('buy_amount_sol', parseFloat(e.target.value))}
                      className="input-modern w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Slippage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.slippage}
                      onChange={(e) => handleSettingChange('slippage', parseFloat(e.target.value))}
                      className="input-modern w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Min Liquidity (USD)</label>
                    <input
                      type="number"
                      value={settings.min_liquidity}
                      onChange={(e) => handleSettingChange('min_liquidity', parseInt(e.target.value))}
                      className="input-modern w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Liquidity (USD)</label>
                    <input
                      type="number"
                      value={settings.max_liquidity}
                      onChange={(e) => handleSettingChange('max_liquidity', parseInt(e.target.value))}
                      className="input-modern w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Token Age (Hours)</label>
                    <input
                      type="number"
                      value={settings.max_age_hours}
                      onChange={(e) => handleSettingChange('max_age_hours', parseInt(e.target.value))}
                      className="input-modern w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Min AI Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.min_ai_probability_score}
                      onChange={(e) => handleSettingChange('min_ai_probability_score', parseInt(e.target.value))}
                      className="input-modern w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Stop Loss (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.stop_loss_percentage}
                      onChange={(e) => handleSettingChange('stop_loss_percentage', parseFloat(e.target.value))}
                      className="input-modern w-full"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Decimal value (e.g., 0.15 for 15%)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Trailing Stop Loss (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.trailing_stop_loss_percentage}
                      onChange={(e) => handleSettingChange('trailing_stop_loss_percentage', parseFloat(e.target.value))}
                      className="input-modern w-full"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Decimal value (e.g., 0.1 for 10%)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max RugCheck Score</label>
                    <input
                      type="number"
                      value={settings.rugcheck_max_score}
                      onChange={(e) => handleSettingChange('rugcheck_max_score', parseInt(e.target.value))}
                      className="input-modern w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold text-sm">VWAP Filter</p>
                      <p className="text-xs text-muted-foreground">Only buy if price is near VWAP</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.use_vwap_filter}
                        onChange={(e) => handleSettingChange('use_vwap_filter', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={settings.username}
                    onChange={(e) => handleSettingChange('username', e.target.value)}
                    className="input-modern w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    className="input-modern w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="input-modern w-full"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="input-modern w-full"
                  >
                    <option value="en">English</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'priceAlerts', label: 'Price Alerts', desc: 'Notify when price targets are hit' },
                  { key: 'tradeAlerts', label: 'Trade Alerts', desc: 'Notify on trade execution' },
                  { key: 'rugAlerts', label: 'Rug Pull Alerts', desc: 'Immediate alerts for potential rugs' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
