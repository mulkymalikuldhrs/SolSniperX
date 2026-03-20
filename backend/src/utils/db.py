import sqlite3
import os
import json
from datetime import datetime

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
    finally:
        conn.close()

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

    # Simple stats
    cursor.execute('SELECT COUNT(*) FROM trades WHERE type = "buy"')
    total_buys = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM trades WHERE type = "sell"')
    total_sells = cursor.fetchone()[0]

    # Calculate profit (simplified: sum of sell values - sum of buy values for closed positions)
    # In a real app, this would be more complex (per-token PnL)

    conn.close()
    return {
        "totalTrades": total_buys + total_sells,
        "totalBuys": total_buys,
        "totalSells": total_sells
    }
