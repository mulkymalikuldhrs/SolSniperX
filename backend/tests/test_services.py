import unittest
from unittest.mock import MagicMock, patch
import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from services.auto_trader import AutoTraderService

class TestAutoTraderService(unittest.TestCase):
    def setUp(self):
        self.mock_socketio = MagicMock()
        self.mock_data_fetcher = MagicMock()
        self.mock_ai_analysis = MagicMock()
        self.mock_trading_service = MagicMock()
        self.mock_wallet_service = MagicMock()

        # Ensure config file doesn't interfere
        if os.path.exists('auto_trader_config.json'):
            os.rename('auto_trader_config.json', 'auto_trader_config.json.bak')

        self.service = AutoTraderService(
            socketio=self.mock_socketio,
            data_fetcher_service=self.mock_data_fetcher,
            ai_analysis_service=self.mock_ai_analysis,
            trading_service=self.mock_trading_service,
            wallet_service=self.mock_wallet_service
        )

    def tearDown(self):
        if os.path.exists('auto_trader_config.json.bak'):
            if os.path.exists('auto_trader_config.json'):
                os.remove('auto_trader_config.json')
            os.rename('auto_trader_config.json.bak', 'auto_trader_config.json')

    def test_load_config_default(self):
        config = self.service.get_config()
        self.assertEqual(config['min_liquidity'], 10000)
        self.assertEqual(config['buy_amount_sol'], 0.01)

    def test_update_config(self):
        self.service.update_config({'min_liquidity': 20000})
        self.assertEqual(self.service.get_config()['min_liquidity'], 20000)

    @patch('asyncio.create_task')
    def test_start_stop_trading(self, mock_create_task):
        self.service.start_trading()
        self.assertTrue(self.service.trading_enabled)
        self.mock_socketio.emit.assert_called_with('trading_status', {'enabled': True, 'message': 'Automated trading started.'})

        self.service.stop_trading()
        self.assertFalse(self.service.trading_enabled)
        self.mock_socketio.emit.assert_called_with('trading_status', {'enabled': False, 'message': 'Automated trading stopped.'})

if __name__ == '__main__':
    unittest.main()
