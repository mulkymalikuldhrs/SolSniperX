import sqlite3
import os
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'app.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create trades table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_address TEXT NOT NULL,
        token_symbol TEXT,
        type TEXT NOT NULL, -- 'buy' or 'sell'
        amount_sol REAL,
        amount_tokens REAL,
        price_usd REAL,
        transaction_id TEXT UNIQUE,
        status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create active positions table for AutoTrader
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS positions (
        token_address TEXT PRIMARY KEY,
        token_symbol TEXT,
        buy_price REAL NOT NULL,
        highest_price REAL,
        amount_tokens REAL NOT NULL,
        buy_amount_sol REAL,
        purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Create system_stats table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS system_stats (
        key TEXT PRIMARY KEY,
        value INTEGER DEFAULT 0
    )
    ''')

    # Initialize rugs_avoided if not exists
    cursor.execute('INSERT OR IGNORE INTO system_stats (key, value) VALUES ("rugs_avoided", 0)')

    conn.commit()
    conn.close()

def record_trade(trade_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
        INSERT INTO trades (token_address, token_symbol, type, amount_sol, amount_tokens, price_usd, transaction_id, status, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            trade_data.get('token_address'),
            trade_data.get('token_symbol'),
            trade_data.get('type'),
            trade_data.get('amount_sol'),
            trade_data.get('amount_tokens'),
            trade_data.get('price_usd'),
            trade_data.get('transaction_id'),
            trade_data.get('status'),
            trade_data.get('timestamp', datetime.now().isoformat())
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        pass # Already exists
    except Exception as e:
        logger.error(f"Error recording trade: {e}")
    finally:
        conn.close()

def save_position(position_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
        INSERT OR REPLACE INTO positions (token_address, token_symbol, buy_price, highest_price, amount_tokens, buy_amount_sol, purchase_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            position_data['token_address'],
            position_data.get('token_symbol'),
            position_data['buy_price'],
            position_data.get('highest_price', position_data['buy_price']),
            position_data['amount_tokens'],
            position_data.get('buy_amount_sol'),
            position_data.get('purchase_time', datetime.now().isoformat())
        ))
        conn.commit()
    except Exception as e:
        logger.error(f"Error saving position: {e}")
    finally:
        conn.close()

def remove_position(token_address):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('DELETE FROM positions WHERE token_address = ?', (token_address,))
        conn.commit()
    except Exception as e:
        logger.error(f"Error removing position: {e}")
    finally:
        conn.close()

def get_active_positions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM positions')
    positions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return positions

def get_recent_trades(limit=50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM trades ORDER BY timestamp DESC LIMIT ?', (limit,))
    trades = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return trades

def get_trade_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT COUNT(*) FROM trades WHERE type = "buy"')
        total_buys = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM trades WHERE type = "sell"')
        total_sells = cursor.fetchone()[0]

        # Calculate total profit and success rate from completed trade pairs
        # We look for sell trades and find their corresponding buy trades (same token_address)
        cursor.execute('''
            SELECT
                t_sell.token_address,
                t_sell.amount_sol as sell_value,
                t_buy.amount_sol as buy_value
            FROM trades t_sell
            JOIN trades t_buy ON t_sell.token_address = t_buy.token_address
            WHERE t_sell.type = 'sell' AND t_buy.type = 'buy'
            AND t_sell.status = 'confirmed' AND t_buy.status = 'confirmed'
        ''')

        completed_trades = cursor.fetchall()
        total_profit_sol = 0.0
        profitable_trades_count = 0

        for trade in completed_trades:
            profit = trade['sell_value'] - trade['buy_value']
            total_profit_sol += profit
            if profit > 0:
                profitable_trades_count += 1

        success_rate = 0.0
        if total_sells > 0:
            success_rate = (profitable_trades_count / total_sells) * 100

        # Get rugs avoided
        rugs_avoided = get_rugs_avoided()

        return {
            "totalProfit": round(total_profit_sol, 4),
            "totalTrades": total_buys + total_sells,
            "totalBuys": total_buys,
            "totalSells": total_sells,
            "successRate": round(success_rate, 2),
            "rugsAvoided": rugs_avoided
        }
    except Exception as e:
        logger.error(f"Error getting trade stats: {e}")
        return {"totalProfit": 0, "totalTrades": 0, "successRate": 0, "rugsAvoided": 0}
    finally:
        conn.close()

def increment_rugs_avoided():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE system_stats SET value = value + 1 WHERE key = "rugs_avoided"')
        conn.commit()
    except Exception as e:
        logger.error(f"Error incrementing rugs avoided: {e}")
    finally:
        conn.close()

def get_rugs_avoided():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT value FROM system_stats WHERE key = "rugs_avoided"')
        row = cursor.fetchone()
        return row[0] if row else 0
    except Exception as e:
        logger.error(f"Error getting rugs avoided: {e}")
        return 0
    finally:
        conn.close()
