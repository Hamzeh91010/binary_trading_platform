from telethon.sync import TelegramClient, events
from datetime import datetime
import sqlite3
import time
import json
import re
import os
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

API_ID = 22650556
API_HASH = '0bd1d2937e3878fb8e0ce9a9a0560821'

VALID_OTC_STOCKS = [
    "Apple OTC", "American Express OTC", "Cisco OTC", "FACEBOOK INC OTC",
    "Intel OTC", "Microsoft OTC", "Tesla OTC", "Amazon OTC", "Alibaba OTC",
    "FedEx OTC", "Netflix OTC", "Palantir Technologies OTC", "VISA OTC",
    "Boeing Company OTC", "Citigroup Inc OTC", "Johnson & Johnson OTC",
    "GameStop Corp OTC", "Pfizer Inc OTC", "ExxonMobil OTC",
    "Advanced Micro Devices OTC", "Marathon Digital Holdings OTC",
    "McDonald's OTC", "VIX OTC", "Coinbase Global OTC"
]
VALID_OTC_STOCKS_LOWER  = [a.lower() for a in VALID_OTC_STOCKS]

client = TelegramClient("telegram_listener", API_ID, API_HASH)
parsed_message_ids = set()

def create_signals_tables():
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    # Table for all signals
    c.execute("""
        CREATE TABLE IF NOT EXISTS all_signals (
            message_id INTEGER PRIMARY KEY,
            channel_type TEXT,
            received_at TEXT,
            pair TEXT,
            base_amount REAL,
            entry_time TEXT,
            end_time TEXT,
            martingale_times TEXT,
            martingale_amounts REAL,
            is_available_martingale_level INTEGER DEFAULT 3,  -- Default to 3 levels
            direction TEXT,
            trade_duration TEXT,
            is_otc INTEGER,
            is_status TEXT,
            trading_result TEXT,
            payout_percent REAL,
            trade_level INTEGER,
            total_profit REAL,
            total_staked REAL,
            raw_text TEXT,
            is_executed INTEGER
        )
    """)
    # Table for today signals (structure can be identical)
    c.execute("""
        CREATE TABLE IF NOT EXISTS today_signals (
            message_id INTEGER PRIMARY KEY,
            channel_type TEXT,
            received_at TEXT,
            pair TEXT,
            base_amount REAL,
            entry_time TEXT,
            end_time TEXT,
            martingale_times TEXT,
            martingale_amounts REAL,
            is_available_martingale_level INTEGER DEFAULT 3,  -- Default to 3 levels
            direction TEXT,
            trade_duration TEXT,
            is_otc INTEGER,
            is_status TEXT,
            trading_result TEXT,
            payout_percent REAL,
            trade_level INTEGER,
            total_profit REAL,
            total_staked REAL,
            raw_text TEXT,
            is_executed INTEGER
        )
    """)
    # Table for forex trading results (structure can be identical)
    c.execute("""
        CREATE TABLE IF NOT EXISTS forex_trading_result (
            message_id INTEGER PRIMARY KEY,
            channel_type TEXT,
            received_at TEXT,
            pair TEXT,
            base_amount REAL,
            entry_time TEXT,
            end_time TEXT,
            martingale_times TEXT,
            martingale_amounts REAL,
            is_available_martingale_level INTEGER DEFAULT 3,  -- Default to 3 levels
            direction TEXT,
            trade_duration TEXT,
            is_otc INTEGER,
            is_status TEXT,
            trading_result TEXT,
            payout_percent REAL,
            trade_level INTEGER,
            total_profit REAL,
            total_staked REAL,
            raw_text TEXT,
            is_executed INTEGER
        )
    """)
    # Table for permission channels
    c.execute("""
        CREATE TABLE IF NOT EXISTS permission_channel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id TEXT UNIQUE,
            channel_name TEXT,
            channel_type TEXT,
            status TEXT DEFAULT 'enabled'   -- 'enabled', 'disabled', or 'removed'
        )
    """)
    # Table for base settings
    c.execute("""
        CREATE TABLE IF NOT EXISTS base_setting (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            base_amount REAL DEFAULT 10,
            daily_profit_target REAL DEFAULT 100,
            max_loss_percent REAL DEFAULT 10,
            balance_reference REAL DEFAULT 1000,  
            current_balance REAL DEFAULT 500
        )
    """)
    conn.commit()
    conn.close()

def insert_signal(signal, table="all_signals"):
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"""
        INSERT OR REPLACE INTO {table} (
            message_id, channel_type, received_at, pair, base_amount, entry_time, end_time, martingale_times, martingale_amounts,
            is_available_martingale_level, direction, trade_duration, is_otc, is_status, trading_result,
            payout_percent, trade_level, total_profit, total_staked,
            raw_text, is_executed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        signal.get("message_id"),
        signal.get("channel_type", "primary"),  # Default to "primary" if not set
        signal.get("received_at"),
        signal.get("pair"),
        float(signal.get("base_amount", 0.0)),
        signal.get("entry_time"),
        signal.get("end_time"),
        json.dumps(signal.get("martingale_times") or []),
        json.dumps(signal.get("martingale_amounts") or []),
        int(signal.get("is_available_martingale_level", 3)),  # Default to 3 levels if not set
        signal.get("direction"),
        signal.get("trade_duration"),
        int(bool(signal.get("is_otc"))),
        signal.get("is_status"),
        signal.get("trading_result"),   # Typo in your key! Should be "trading_result"
        float(signal.get("payout_percent", 0.0)),
        int(signal.get("trade_level", 0)),
        float(signal.get("total_profit", 0.0)),
        float(signal.get("total_staked", 0.0)),
        signal.get("raw_text"),
        int(bool(signal.get("is_executed", False))),
    ))
    conn.commit()
    conn.close()

def parse_signal(text):

    result = {
        "message_id": None,     # optional: helpful for tracking
        "channel_type": "",  # Replace with your real channel ID
        "received_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),    # e.g., "2025-07-25 23:05:29"
        "pair": None,           # e.g., "EUR/USD" or "AAPL OTC"
        "base_amount": 0.0,    # Default base amount, can be overridden
        "entry_time": None,     # e.g., "23:05"
        "end_time": None,       # e.g., "23:10"
        "martingale_times": None,   # List of times for martingale levels
        "martingale_amounts": None,  # List of amounts for martingale levels
        "is_available_martingale_level": 3,  # Default to 3 levels
        "direction": None,      # "BUY" or "SELL"
        "trade_duration": None, # e.g., "5 minutes"
        "is_otc": False,        # True if OTC asset
        "is_status": False,     # pending (/ expired) / processing / complete
        "trading_result": None, # "win" / "loss" / "draw" / None
        "payout_percent": 0.0, # e.g., 85.0 for 85% payout
        "trade_level": 0, 
        "total_profit": 0.0, 
        "total_staked": 0.0, 
        "raw_text": None ,      # optional: for debug/logging
        "is_executed": False    # True if the signal has been executed
    }

    pair = None
    is_otc = False

    # Find any Forex-style pair (OTC or not)
    for line in text.splitlines():
        forex_match = re.search(r'[A-Z]{3}/[A-Z]{3}', line)
        if forex_match:
            pair = forex_match.group().strip()
            # Determine OTC status by presence of "OTC" in the line or the whole text
            if 'OTC' in line.upper() or 'OTC' in text.upper():
                is_otc = True
            break
    else:
        # Fallback to approved stock assets
        for line in text.splitlines():
            # Remove emojis and punctuation, split into lowercase words
            words = set(re.findall(r'\b\w+\b', line.lower()))
            if "otc" in words:
                for stock in VALID_OTC_STOCKS:
                    stock_first_word = stock.split()[0].lower()
                    if stock_first_word in words:
                        pair = stock  # Use original-cased stock name
                        is_otc = True
                        break
            if pair:
                break

    if not pair:
        print("❌ Skipped: Unknown or unsupported asset.", flush=True)
        return None

    result["pair"] = pair
    print(f"✅ Found pair: {pair}", flush=True)
    result["is_otc"] = is_otc

    # Add "OTC" to pair if it's an OTC signal and not already present
    if result["is_otc"] and "OTC" not in result["pair"].upper():
        result["pair"] += " OTC"

    entry_keywords = ("כניסה", "מכירה", "קנייה")
    for line in text.splitlines():
        if any(keyword in line for keyword in entry_keywords):
            match = re.search(r'(\d{2}:\d{2})', line)
            if match:
                result["entry_time"] = match.group(1)
                break  # Stop after first found
    print(f"✅ Entry time found: {result['entry_time']}", flush=True)

    if 'קנייה' in text or '⬆️' in text or 'BUY' in text or 'למעלה' in text or '🟩' in text:
        result["direction"] = "BUY"
    elif 'מכירה' in text or '⬇️' in text or 'SELL' in text or '🟥' in text:
        result["direction"] = "SELL"

    mg_times = []

    for line in text.splitlines():
        if "רמה" in line:
            # Match any time in HH:MM format
            match = re.search(r'(\d{2}:\d{2})', line)
            if match:
                mg_times.append(match.group(1))

    print(mg_times)

    result["martingale_times"] = mg_times

    if result["entry_time"] and mg_times:
        try:
            t1 = datetime.strptime(result["entry_time"], "%H:%M")
            t2 = datetime.strptime(mg_times[0], "%H:%M")
            minutes = int((t2 - t1).total_seconds() / 60)
            delta_seconds = int((t2 - t1).total_seconds())
            if delta_seconds < 60:
                result["trade_duration"] = f"{delta_seconds} seconds"
            else:
                minutes = int(delta_seconds / 60)
                result["trade_duration"] = f"{minutes} minutes"
        except Exception as e:
            print("Failed to calculate trade_duration:", e, flush=True)
            result["trade_duration"] = "Unknown"

    return result

def normalize_words(line):
    # Remove emojis and punctuation, split into lowercase words
    return set(re.findall(r'\b\w+\b', line.lower()))

def is_valid_signal(text):
    text_lower = text.lower()

    # Currency pair + OTC check (in one line)
    has_pair = re.search(r'[A-Z]{3}/[A-Z]{3}', text)
    print("has_pair === ", has_pair, flush=True)

    # Known OTC stock check
    # has_stock = any(stock in text_lower for stock in VALID_OTC_STOCKS_LOWER)
    has_stock = False
    for line in text.splitlines():
        words = normalize_words(line)
        if "otc" in words:
            for stock in VALID_OTC_STOCKS:
                stock_word = stock.split()[0].lower()
                if stock_word in words:
                    has_stock = True
                    print(f"✅ Found stock: {stock}")
                    break
        if has_stock:
            break
    print("has_stock === ", has_stock, flush=True)

    # Entry time must exist
    # has_entry = re.search(r'(כניסה(?: בשעה)?|Entry)[\\s\\S]*?\\d{2}:\\d{2}', text)
    has_entry = any(
        re.search(r'\d{2}:\d{2}', line) and 'רמה' not in line
        for line in text.splitlines()
    )
    print("has_entry ===", has_entry, flush=True)

    # Exactly 3 'רמה' mentions
    rama_count = len(re.findall(r'רמה', text))
    has_three_rama = rama_count == 3
    print("has_three_rama === ", has_three_rama, flush=True)

    return (has_pair or has_stock) and has_entry and has_three_rama

def is_expired(signal):
    now = datetime.now().strftime("%H:%M")
    entry_time = signal.get("entry_time")
    return entry_time < now  # ✅ expired if now is after entry_time

def get_enabled_channel_ids():
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute("""
        SELECT chat_id FROM permission_channel WHERE status='enabled'
    """)
    rows = c.fetchall()
    conn.close()
    return set(row[0] for row in rows)

def get_channel_type(chat_id):
    import sqlite3
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute("SELECT channel_type FROM permission_channel WHERE chat_id=? AND status='enabled'", (str(chat_id),))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None

def get_base_setting():
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute("SELECT base_amount FROM base_setting LIMIT 1")
    row = c.fetchone()
    conn.close()
    if row:
        return {"base_amount": row[0], "is_available_martingale_level": 3}  # Default to 3 levels
    else:
        return {"base_amount": 10, "is_available_martingale_level": 3}  # Fallback

def get_enabled_chats():
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute("SELECT chat_id FROM permission_channel WHERE status = 'enabled'")
    chat_ids = [row[0] for row in c.fetchall()]
    conn.close()
    # Convert numeric IDs from string to int if possible, else leave as str
    processed_ids = []
    for cid in chat_ids:
        try:
            processed_ids.append(int(cid))
        except:
            processed_ids.append(cid)
    return processed_ids

# Initialize the database and create tables if they don't exist
allowed_chats = get_enabled_chats() 
# allowed_chats = ['forex_legend_vip', 'forex_legend_club_60', 'https://t.me/+63GPwYvjOw9mNmFi']  # Replace with your real channel ID
print(f"✅ Allowed chats loaded: {len(allowed_chats)}", flush=True)

@client.on(events.NewMessage(chats= allowed_chats))  # Replace with your real channel ID
async def handler(event):
    chat_id = str(event.chat_id)  # Always cast to str for database match
    print(f"\n📥 New message received from {chat_id}", flush=True)

    # Load allowed channels from db
    # allowed_channels = ['-1002846030923', '-1002721262804', '-1002723345001']
    allowed_channels = get_enabled_channel_ids()
    if chat_id not in allowed_channels:
        print(f"❌ Skipped: Channel {chat_id} is not allowed.", flush=True)
        return
    
    channel_type = get_channel_type(chat_id)
    if not channel_type:
        print(f"⛔ Skipped: Channel {chat_id} is not enabled or has no name.", flush=True)
        return
    
    # Check if the message is from a valid channel
    message = event.message.message or event.message.caption
    msg_id = event.id

    print(f"\n📥 New message received (ID={msg_id}) from {chat_id}", flush=True)

    if not message:
        print("❌ Skipped: Empty message.", flush=True)
        return

    if msg_id in parsed_message_ids:
        print("❌ Skipped: Duplicate message (already processed).", flush=True)
        return
    parsed_message_ids.add(msg_id)

    if not is_valid_signal(message):
        print("❌ Skipped: Not a valid signal format (missing pair or entry time).", flush=True)
        return

    parsed = parse_signal(message)
    if not parsed:
        print("❌ Skipped: Failed to parse signal fields.", flush=True)
        return

    parsed["channel_type"] = channel_type

    # 👉 Fetch and insert base settings
    base_setting = get_base_setting()
    parsed["base_amount"] = base_setting["base_amount"]
    parsed["is_available_martingale_level"] = base_setting["is_available_martingale_level"]

    if is_expired(parsed):
        parsed["is_status"] = "expired"
    else:
        parsed["is_status"] = "pending"
    parsed["message_id"] = msg_id
    parsed["raw_text"] = message

    insert_signal(parsed, table="all_signals")
    insert_signal(parsed, table="today_signals")

    print("✅ Signal saved:", parsed["pair"], "| Entry:", parsed["entry_time"], flush=True)

if __name__ == "__main__":
    create_signals_tables()
    print("📊 Signal tables created in signals.db", flush=True)

    client.start()
    print("📡 Listening for Forex Legend signals...", flush=True)
    client.run_until_disconnected()

