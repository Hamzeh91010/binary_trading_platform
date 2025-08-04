from playwright.sync_api import sync_playwright, Page
from datetime import datetime, timedelta
from multiprocessing import Process
import sqlite3
import json
import time
import csv
import os
import re
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BUFFER_MINUTES = 1
# PERSISTENT_PROFILE = "playwright_config/profile"
PROFILE_POOL = [
    "playwright_config/profile_0",
    "playwright_config/profile_1",
    "playwright_config/profile_2",
    "playwright_config/profile_3",
    "playwright_config/profile_4",
    "playwright_config/profile_5",
]
MAX_PROCESSES = len(PROFILE_POOL)

def is_within_buffer(now_str, target_str, buffer_min=1):
    now = datetime.strptime(now_str, "%H:%M")
    target = datetime.strptime(target_str, "%H:%M")
    diff = (target - now).total_seconds() / 60
    return 0 <= diff <= buffer_min

def map_duration_label(duration_text: str) -> str:
    duration_map = {
        "5 minutes": "M5",
        "1 minutes": "M1",
        "3 minutes": "M3",
        "30 seconds": "S30",
        "5 seconds": "S5",
        "15 minutes": "M15",
        "30 minutes": "M30",
        "1 hour": "H1",
        "4 hour": "H4",
    }
    return duration_map.get(duration_text)

def wait_for_login(page: Page, timeout_sec=600) -> bool:
    print("🔐 Checking login status...", flush=True)

    for i in range(timeout_sec):
        if page.url.startswith("https://pocketoption.com/en/cabinet/demo-quick-high-low/"):
            return True
        time.sleep(1)

    print("⏳ Waiting for login timeout exceeded.", flush=True)
    return False

def wait_until_exact_time(target_time_str: str):
    print(f"⏳ Waiting for {target_time_str} to place trade...", flush=True)

    target = datetime.strptime(target_time_str, "%H:%M")
    now = datetime.now()
    # Replace date on target to match today
    target = target.replace(year=now.year, month=now.month, day=now.day)

    while True:
        now = datetime.now()
        delta = (target - now).total_seconds()

        if delta <= 0:
            print(f"🕰️ Time reached: {now.strftime('%H:%M:%S')} — placing trade.", flush=True)
            break
        elif delta > 1.1:
            time.sleep(1)
        else:
            time.sleep(0.01)  # ⏱ High precision as we get close
    
def wait_until_site_time(page, target_time_str: str):
    # If target_time_str is "20:05", convert to "20:05:00"
    if len(target_time_str) == 5:
        target_time_str_full = target_time_str + ":00"
    else:
        target_time_str_full = target_time_str
    print(f"⏳ Waiting for {target_time_str_full} (site time) to place trade...", flush=True)

    # Parse target as today, with 00 seconds
    now_dt = datetime.now()
    target_dt = datetime.strptime(target_time_str_full, "%H:%M:%S")
    target_dt = target_dt.replace(year=now_dt.year, month=now_dt.month, day=now_dt.day)

    while True:
        site_time_str = page.locator('div.current-time__time').inner_text()
        try:
            # Parse site time as "HH:MM:SS"
            site_time = datetime.strptime(site_time_str, "%H:%M:%S")
            site_time = site_time.replace(year=target_dt.year, month=target_dt.month, day=target_dt.day)
        except Exception as e:
            print(f"❌ Error parsing site time: {site_time_str}, {e}", flush=True)
            time.sleep(0.5)
            continue

        delta = (target_dt - site_time).total_seconds()

        if delta <= 0:
            print(f"🕰️ Time reached: {site_time.strftime('%H:%M:%S')} — placing trade.", flush=True)
            break
        elif delta > 1.1:
            time.sleep(1)
        else:
            time.sleep(0.01)  # High precision

def set_trade_options(page: Page, signal_pair: str, signal_duration: str, signal_amount: str):
    try:
       

        print("🔍 Opening asset selection...", flush=True)
        page.click("a.pair-number-wrap")
        page.wait_for_timeout(1000)

        is_otc = "otc" in signal_pair.lower()
        found_asset = False
        payout_pair = "0"

        search_pair_word = signal_pair.replace("/", "").lower()
        first_word = search_pair_word.split()[0]
        print(f"🔍 Searching for asset: {first_word} (OTC: {is_otc})", flush=True)

        input_box = page.locator("input.search__field")
        input_box.click()
        input_box.fill(first_word)
        page.wait_for_timeout(500)

        print("🖱 Searching for OTC asset...", flush=True)
        asset_links = page.locator("ul.assets-block__alist a.alist__link")
        num_assets = asset_links.count()
        print(f"🖱 num_assets {num_assets}", flush=True)

        for i in range(num_assets):
            asset = asset_links.nth(i)
            try:
                # Wait for the alist_label to be attached & visible relative to asset link
                label_elem = asset.locator("span.alist__label")
                label_elem.wait_for(state="visible", timeout=2000)
                label = label_elem.inner_text().strip()

                # Get the schedule info text (e.g., N/A)
                schedule_info_elem = asset.locator("span.alist__schedule-info-text")
                schedule_info = schedule_info_elem.inner_text().strip() if schedule_info_elem.count() else ""

                # Extract payout value
                # payout_pair = "0"
                payout_elem = asset.locator("span.alist__payout span")
                payout_text = " ".join(payout_elem.all_inner_texts()).replace("+", "").replace("%", "").strip()
                payout_text = re.sub(r"[^\d.]", "", payout_text)  # Keep only digits and dot
                if payout_text:
                    payout_pair = payout_text.strip()

                print(f"   → Found asset label: {label}, status: {schedule_info}, payout: {payout_pair}", flush=True)
                
            except Exception as e:
                print(f"⚠️ Could not get label for asset {i}: {e}", flush=True)
                continue
            
            if schedule_info.upper() == "N/A":
                print(f"⏸ Skipping asset '{label}' because status is N/A", flush=True)
                continue  # Do not trade this asset
            
            if is_otc:
                # Need OTC asset only
                if "otc" in label.lower():
                    asset.click()
                    found_asset = True
                    print(f"✅ Selected OTC asset: {label}", flush=True)
                    break
            else:
                # Need regular (non-OTC) asset only
                if "otc" not in label.lower():
                    asset.click()
                    found_asset = True
                    print(f"✅ Selected regular asset: {label}", flush=True)
                    break

        if not found_asset:
            if is_otc:
                print("❌ N/A or No OTC asset found for this pair. Trade will be skipped.", flush=True)
            else:
                print("❌ N/A or No regular asset found for this pair. Trade will be skipped.", flush=True)
            page.keyboard.press("Escape")
            return False, None

        page.keyboard.press("Escape")
        page.wait_for_timeout(500)

        print("⏱ Setting trade duration...", flush=True)
        time_dropdown = page.locator("div.block--expiration-inputs div.control__value.value--several-items")
        time_dropdown.click()
        page.wait_for_timeout(500)

        label = map_duration_label(signal_duration)
        if not label:
            print(f"❌ Unsupported trade_duration: {signal_duration}", flush=True)
            return False, None

        page.locator("div.dops__timeframes-item", has_text=label).click()
        page.wait_for_timeout(300)

        print(f"✅ Asset & duration set: {signal_pair} | {label}", flush=True)

        print(f"💰 Setting trade amount to {signal_amount}", flush=True)
        input_box = page.locator("div.block--bet-amount div.value__val input[type='text']").first
        input_box.click()
        page.keyboard.press("Control+A")   # Select all
        page.keyboard.press("Backspace")   # Clear it

        page.wait_for_timeout(300)         # Optional delay

        # Type value slowly to mimic human input
        input_box.type(str(signal_amount), delay=100)

        return True, payout_pair

    except Exception as e:
        print(f"❌ Error selecting asset or duration: {e}", flush=True)

def click_trade_button(page, direction):
    try:
        if direction.upper() == "BUY":
            print("🟢 Clicking BUY", flush=True)
            page.locator("div.action-high-low.button-call-wrap a.btn.btn-call").click()
        elif direction.upper() == "SELL":
            print("🔴 Clicking SELL", flush=True)
            page.locator("div.action-high-low.button-put-wrap a.btn.btn-put").click()
        else:
            print(f"❌ Invalid direction: {direction}", flush=True)
    except Exception as e:
        print(f"❌ Trade button click failed: {e}", flush=True)

def check_closed_trade_result(page, expected_pair, expected_amount=None, max_wait_sec=10):
    
    print("📋 Navigating to Closed Trades:::...", expected_pair, expected_amount, flush=True)

    today = datetime.now().strftime("%Y-%m-%d")
    found_trade = None

    for _ in range(int(max_wait_sec * 10)):
        page.wait_for_timeout(100)  # 0.1s

        label = page.locator("div.deals-list__group-label.flex-centered", has_text=today).first
        if label.count() == 0:
            time.sleep(0.1)
            continue

        # Get all trades immediately after today's label (limit to 2)
        trades = label.locator("xpath=following-sibling::div[contains(@class, 'deals-list__item')]")
        for trade_index in range(min(2, trades.count())):
            trade = trades.nth(trade_index)

            pair_list = trade.locator("div.item-row div a").all_inner_texts()
            pair = next((p.strip() for p in pair_list if p.strip()), "")
            item_row2 = trade.locator("div.item-row").nth(1)
            amount = item_row2.locator("div").nth(0).inner_text().strip()

            try:
                amount_val = float(amount.replace("$", "").replace(",", "").strip())
                expected_amount_val = float(expected_amount)
                if pair == expected_pair and abs(amount_val - expected_amount_val) < 0.05:
                    found_trade = trade
                    print("✅ Found matching trade:", pair, amount, flush=True)
                    break  # Found a match, exit loop
            except Exception as e:
                print(f"⚠️ Could not parse amount as float: {e}", flush=True)

        else:
            # No match in first two trades, keep polling
            time.sleep(0.1)
            continue

        break  # If a match was found, break outer polling loop

    if not found_trade:
        print("❌ No matching trade found after waiting.", flush=True)
        return None

    # Second row = amount & result
    item_row2 = found_trade.locator("div.item-row").nth(1)
    net_profit = item_row2.locator("div").nth(1).inner_text().strip()

    numeric = float(net_profit.replace('$', '').strip())
    result = "win" if numeric > 0 else "loss"

    print(f"""🎯 Trade Result: 📊 Net Result:  {result} """, flush=True)

    return {
        "net_profit": net_profit,           
        "trading_result": result
    }

def append_to_csv(signal):
    csv_file = "TradingResult.csv"
    fieldnames = [
        "message_id", "received_at", "pair", "base_amount", "direction",
        "trading_result", "entry_time", "end_time", "trade_duration", "payout_percent",
        "trade_level", "total_profit"
    ]

    row = {
        "message_id": signal.get("message_id"),
        "received_at": signal.get("received_at"),
        "pair": signal.get("pair"),
        "base_amount": signal.get("base_amount"),
        "direction": signal.get("direction"),
        "trading_result": signal.get("trading_result"),
        "total_profit": signal.get("total_profit"),
        "trade_level": signal.get("trade_level"),
        "entry_time": signal.get("entry_time"),
        "end_time": signal.get("end_time"),
        "trade_duration": signal.get("trade_duration"),
        "payout_percent": signal.get("payout_percent")
    }

    write_header = not os.path.exists(csv_file)

    with open(csv_file, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if write_header:
            writer.writeheader()
        writer.writerow(row)

def update_and_archive_entire_signal(signal, result_data, source_table="today_signals", result_table="forex_trading_result"):
    message_id = signal["message_id"]

    # 1. Build update SQL for result_data
    columns = []
    values = []
    for key, val in result_data.items():
        columns.append(f"{key} = ?")
        values.append(val)
    values.append(message_id)
    set_clause = ", ".join(columns)
    update_query = f"UPDATE {source_table} SET {set_clause} WHERE message_id = ?"
    update_query_all = f"UPDATE all_signals SET {set_clause} WHERE message_id = ?"

    try:
        conn = sqlite3.connect("ForexSignals.db")
        c = conn.cursor()

        # 1.1 Update signal in today_signals
        if columns:
            c.execute(update_query, values)
            conn.commit()

        # 1.2 Update signal in all_signals
        if columns:
            c.execute(update_query_all, values)
            conn.commit()

        # 2. Fetch updated signal
        c.execute(f"SELECT * FROM {source_table} WHERE message_id = ?", (message_id,))
        row = c.fetchone()
        if not row:
            print("❌ Signal not found in today_signals after update.", flush=True)
            conn.close()
            return
        col_names = [desc[0] for desc in c.description]
        updated_signal = dict(zip(col_names, row))

        # 3. Insert into forex_trading_result (using only matching columns)
        # If table doesn't exist, you'll get an error unless already created
        placeholders = ", ".join("?" * len(col_names))
        insert_query = f"INSERT INTO {result_table} ({', '.join(col_names)}) VALUES ({placeholders})"
        c.execute(insert_query, row)
        conn.commit()

        conn.close()
        
        # 4. Call append_to_csv with full record
        append_to_csv(updated_signal)

        print("✅ Signal updated in today_signals, archived in forex_trading_result, and added to TradingResult.csv", flush=True)
    except Exception as e:
        print("❌ Error in update_and_archive_signal:", e, flush=True)

def wait_for_trade_completion(duration_str: str, finish_early_sec=3):
    print(f"⏳ Waiting for trade to finish ({duration_str})...", flush=True)

    duration_map = {
        "5 seconds": 5,
        "15 seconds": 15,
        "30 seconds": 30,
        "1 minutes": 1 * 60,
        "3 minutes": 3 * 60,
        "5 minutes": 5 * 60,
        "30 minutes": 30 * 60,
        "1 hour": 60 * 60,
        "4 hour": 4 * 60 * 60,
    }

    wait_sec = duration_map.get(duration_str.lower())
    if not wait_sec:
        print("⚠️ Unknown trade duration. Defaulting to 5 minutes.", flush=True)
        wait_sec = 5 * 60

    wait_sec = max(0, wait_sec - finish_early_sec)
    time.sleep(wait_sec)  # Extra buffer to ensure trade result is closed

def calc_next_trade_amount(total_loss, target_profit, payout_percent):
    """
    total_loss: sum of previous losses in this series (float)
    target_profit: how much profit you want on this trade (float)
    payout_percent: e.g., 80 for 80%, 90 for 90%
    """
    if not payout_percent or payout_percent <= 0:
        raise ValueError(f"Invalid payout_percent: {payout_percent}. Must be > 0.")
    payout_decimal = payout_percent / 100.0
    amount = (total_loss + target_profit) / payout_decimal
    return round(amount, 2)

def get_trade_end_time(entry_time_str, duration_str, date_ref=None):
    # entry_time_str: "13:02" (can have quotes)
    # duration_str: "5 minutes" or "1 minutes"
    # date_ref: a date string like "2025-07-29" (optional)
    if date_ref is None:
        now = datetime.now()
        date_ref = now.strftime("%Y-%m-%d")
    # Clean up entry_time_str (remove any quotes and whitespace)
    entry_time_clean = entry_time_str.strip().replace('"', '').replace("'", "")
    dt = datetime.strptime(f"{date_ref} {entry_time_clean}", "%Y-%m-%d %H:%M")
    mins = int(duration_str.split()[0])  # e.g. "5" from "5 minutes"
    end_time = dt + timedelta(minutes=mins)
    return end_time.strftime("%H:%M")

def update_martingale_amounts(message_id, martingale_amounts, table="all_signals"):
    import sqlite3
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"""
        UPDATE {table}
        SET martingale_amounts = ?
        WHERE message_id = ?
    """, (json.dumps(martingale_amounts), message_id))
    conn.commit()
    conn.close()

def monitor_and_update_trade_amount(signal, page, mg_amount, table="today_signals"):
    """
    Monitor the signal's base_amount and entry_time in DB,
    and update amount input on the trading page,
    until 10 seconds before the latest scheduled entry_time.
    """
    message_id = signal["message_id"]
    entry_date = signal.get("received_at", "").split(" ")[0]  # e.g., "2025-07-25"

    while True:
        # Get latest base_amount and entry_time from DB
        conn = sqlite3.connect("ForexSignals.db")
        c = conn.cursor()
        c.execute(f"SELECT base_amount, entry_time FROM {table} WHERE message_id = ?", (message_id,))
        row = c.fetchone()
        conn.close()

        if not row or not row[1]:
            print("❌ Could not fetch base_amount or entry_time from DB. Stopping monitor.", flush=True)
            break

        latest_base_amount = float(row[0])
        latest_entry_time_str = row[1]
        # Always recompute the cutoff time based on the latest entry_time
        try:
            entry_dt = datetime.strptime(f"{entry_date} {latest_entry_time_str}", "%Y-%m-%d %H:%M")
            cutoff_dt = entry_dt - timedelta(seconds=10)
        except Exception as e:
            print(f"❌ Error parsing entry_time: {e}", flush=True)
            break

        now = datetime.now()
        if now >= cutoff_dt:
            print("⏰ Cutoff reached (10s before entry), stop monitoring for amount changes.", flush=True)
            break

        if latest_base_amount != mg_amount:
            mg_amount = latest_base_amount
            print(f"🔄 base_amount changed to {mg_amount}, updating input box...", flush=True)
            try:
                input_box = page.locator("div.block--bet-amount div.value__val input[type='text']", flush=True).first
                input_box.click()
                page.keyboard.press("Control+A")
                input_box.type(str(mg_amount), delay=100)
            except Exception as e:
                print("❌ Error updating input box:", e, flush=True)

        time.sleep(5)  # Check every 5 seconds

    return mg_amount, latest_entry_time_str  # Return both

def get_latest_entry_time(message_id, table="today_signals"):
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"SELECT entry_time FROM {table} WHERE message_id = ?", (message_id,))
    row = c.fetchone()
    conn.close()
    if row and row[0]:
        return row[0]
    else:
        return None  # Or handle fallback as needed

def get_latest_martingale_amounts(message_id, table="today_signals"):
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"SELECT martingale_amounts FROM {table} WHERE message_id = ?", (message_id,))
    row = c.fetchone()
    conn.close()
    if row and row[0]:
        try:
            return json.loads(row[0])
        except Exception:
            pass
    return []

def get_today_profit_and_loss():
    today = datetime.now().strftime("%Y-%m-%d")
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    # Sum up total_profit for today (where completed trades)
    c.execute("""
        SELECT COALESCE(SUM(total_profit), 0)
        FROM today_signals
        WHERE received_at LIKE ? AND is_status = 'completed'
    """, (today + "%",))
    total_profit = c.fetchone()[0] or 0

    conn.close()
    return total_profit

def get_base_setting():
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute("""
        SELECT base_amount, daily_profit_target, max_loss_percent,
               balance_reference, current_balance
        FROM base_setting
        ORDER BY id DESC LIMIT 1
    """)
    row = c.fetchone()
    conn.close()

    # Return defaults if not set yet
    if row:
        return {
            "base_amount": float(row[0]),
            "daily_profit_target": float(row[1]),
            "max_loss_percent": float(row[2]),
            "balance_reference": float(row[3]),
            "current_balance": float(row[4])
        }
    else:
        return {
            "base_amount": 10.0,
            "daily_profit_target": 10000.0,
            "max_loss_percent": 100.0,
            "balance_reference": 10000.0,
            "current_balance": 10000.0
        }
    
def update_balance_in_db(page, update_reference=False, db_path="ForexSignals.db"):
    balance_selector = "span.js-hd.js-balance-demo[data-hd-status='show']"
    balances = page.locator(balance_selector).all_inner_texts()
    for idx, text in enumerate(balances):
        print(f"Balance {idx}: {text}")

    # Use the first, or pick the one you need
    balance_text = balances[2].replace(',', '').strip()
    try:
        balance_value = float(balance_text)
    except Exception as e:
        print(f"❌ Error fetching or updating balance: {balance_text} | {e}")

    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    if update_reference:
        c.execute(
            "UPDATE base_setting SET balance_reference = ?, current_balance = ? WHERE id = 1",
            (balance_value, balance_value)
        )
        print(f"✅ Updated balance_reference and current_balance to {balance_value} in DB.")
    else:
        c.execute(
            "UPDATE base_setting SET current_balance = ? WHERE id = 1",
            (balance_value,)
        )
        print(f"✅ Updated current_balance to {balance_value} in DB.")
    conn.commit()
    conn.close()

def should_stop_trading():
    setting = get_base_setting()
    today_profit = get_today_profit_and_loss()
    print(f"<<<Today's profit>>>: {today_profit}", flush=True)

    if today_profit >= setting['daily_profit_target']:
        print("❌ Stopping: Daily profit target reached.", flush=True)
        return True
    if today_profit <= -(setting['max_loss_percent'] / 100) * setting['balance_reference']:
        print("❌ Stopping: Daily loss limit reached.", flush=True)
        return True

    if setting['current_balance'] <= 0:
        print("❌ Stopping: Current balance is zero or negative.", flush=True)
        return True
    
    print("✅ Continuing trading: No stop conditions met.", flush=True)
    return False

def is_first_trade_today():
    today = datetime.now().strftime("%Y-%m-%d")
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute("""
        SELECT COUNT(*) FROM today_signals WHERE received_at LIKE ?
    """, (today + "%",))
    count = c.fetchone()[0]
    conn.close()
    return count == 1  # True if no signal yet today (so this is the first)

def set_signal_status_limited(message_id, table="today_signals"):
    import sqlite3
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"""
        UPDATE {table}
        SET is_status = 'limited'
        WHERE message_id = ?
    """, (message_id,))
    conn.commit()
    conn.close()

def get_latest_is_available_mg_level(message_id, table="today_signals"):
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"SELECT is_available_martingale_level FROM {table} WHERE message_id = ?", (message_id,))
    row = c.fetchone()
    conn.close()
    return int(row[0]) if row and row[0] is not None else 3  # Default 3 levels

def get_latest_martingale_time_and_amount(message_id, trade_level, table="today_signals"):
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"SELECT martingale_times, martingale_amounts FROM {table} WHERE message_id = ?", (message_id,))
    row = c.fetchone()
    conn.close()
    if row and row[0] and row[1]:
        try:
            mg_times = json.loads(row[0])
            mg_amounts = json.loads(row[1])
            mg_time = mg_times[trade_level-1] if trade_level-1 < len(mg_times) else None
            mg_amount = mg_amounts[trade_level] if trade_level < len(mg_amounts) else None
            return mg_time, mg_amount
        except Exception:
            pass
    return None, None

def monitor_and_update_mg_amount_before_trade(signal, page, trade_level, table="today_signals"):
    """
    Monitors and updates the mg_amount in the input box until 10 seconds before the next martingale_time.
    """
    message_id = signal["message_id"]
    received_at = signal.get("received_at", "")
    entry_date = received_at.split(" ")[0] if received_at else datetime.now().strftime("%Y-%m-%d")

    mg_time_str, mg_amount = get_latest_martingale_time_and_amount(message_id, trade_level, table)
    if not mg_time_str:
        print(f"❌ Could not find martingale_time for trade_level {trade_level}", flush=True)
        return None, None

    # Build the full datetime for the martingale time
    try:
        mg_time_dt = datetime.strptime(f"{entry_date} {mg_time_str}", "%Y-%m-%d %H:%M")
    except Exception as e:
        print(f"❌ Error parsing martingale_time: {e}", flush=True)
        return None, None

    cutoff_dt = mg_time_dt - timedelta(seconds=10)
    last_mg_amount = mg_amount

    while True:
        now = datetime.now()
        if now >= cutoff_dt:
            print("⏰ 10s before martingale_time reached, finalizing input.", flush=True)
            break

        # Get latest mg_amount for this trade_level
        _, latest_mg_amount = get_latest_martingale_time_and_amount(message_id, trade_level, table)
        if latest_mg_amount != last_mg_amount and latest_mg_amount is not None:
            last_mg_amount = latest_mg_amount
            print(f"🔄 mg_amount changed to {last_mg_amount}, updating input box...", flush=True)
            try:
                input_box = page.locator("div.block--bet-amount div.value__val input[type='text']").first
                input_box.click()
                page.keyboard.press("Control+A")
                input_box.type(str(last_mg_amount), delay=100)
            except Exception as e:
                print("❌ Error updating input box:", e, flush=True)

        time.sleep(1)

    # Final input update (just before the trade)
    try:
        input_box = page.locator("div.block--bet-amount div.value__val input[type='text']").first
        input_box.click()
        page.keyboard.press("Control+A")
        input_box.type(str(last_mg_amount), delay=100)
    except Exception as e:
        print("❌ Error setting final mg_amount before trade:", e, flush=True)

    # Wait for the actual martingale trade time
    while datetime.now() < mg_time_dt:
        time.sleep(0.1)
    print("🕒 Martingale trade time reached.", flush=True)
    return mg_time_dt, last_mg_amount

def update_martingale_times(signal, latest_entry_time_str, entry_date, table="today_signals"):
    """
    Update martingale_times in signal dict and the database if entry_time has changed.
    Returns the new martingale_times list (and the DB is updated).
    """
    # Only update if entry_time actually changed
    if latest_entry_time_str != signal.get("entry_time"):
        print(f"🕒 Entry time changed from {signal.get('entry_time')} to {latest_entry_time_str}. Updating martingale times...", flush=True)
        signal["entry_time"] = latest_entry_time_str

        trade_duration = int(signal.get("trade_duration", 5))  # default 5 min
        mg_levels = 3    # default 3 levels

        try:
            entry_dt = datetime.strptime(f"{entry_date} {latest_entry_time_str}", "%Y-%m-%d %H:%M")
        except Exception as e:
            print(f"❌ Error parsing entry_time: {e}", flush=True)
            return []

        # Generate martingale times
        martingale_times = [
            (entry_dt + timedelta(minutes=trade_duration * (i + 1))).strftime("%H:%M")
            for i in range(mg_levels)
        ]
        signal["martingale_times"] = martingale_times

        # Convert to comma-separated string for DB
        martingale_times_str = ",".join(martingale_times)

        # Update in database
        try:
            conn = sqlite3.connect("ForexSignals.db")
            c = conn.cursor()
            c.execute(f"UPDATE {table} SET martingale_times = ? WHERE message_id = ?", (martingale_times_str, signal["message_id"]))
            conn.commit()
            conn.close()
            print(f"✅ Updated martingale_times in DB: {martingale_times_str}", flush=True)
        except Exception as e:
            print(f"❌ Error updating martingale_times in DB: {e}", flush=True)

        return martingale_times
    else:
        # No change needed, return the current value or empty if missing
        return signal.get("martingale_times", [])

def get_martingale_time_for_level(message_id, trade_level, table="today_signals"):
    """
    Returns the martingale time (as string, e.g. '14:40') for the given trade_level (1-based).
    If the trade_level is out of range, returns None.
    """
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"SELECT martingale_times FROM {table} WHERE message_id = ?", (message_id,))
    row = c.fetchone()
    conn.close()

    if not row or not row[0]:
        print("❌ martingale_times not found in DB.", flush=True)
        return None

    times_list = row[0].split(",")
    index = trade_level - 1  # trade_level 1 is the first item

    if 0 <= index < len(times_list):
        return times_list[index].strip()
    else:
        print(f"❌ trade_level {trade_level} is out of range.", flush=True)
        return None
  
def execute_trade(signal, profile_path):
    print("🚀 Launching browser...", flush=True)
    
    if should_stop_trading():
        print("🚫 Stopping trading due to daily limits.", flush=True)
        set_signal_status_limited(signal["message_id"], table="today_signals")
        set_signal_status_limited(signal["message_id"], table="all_signals")  # optional, if you want both tables updated
        print("✅ Signal marked as 'limited'.", flush=True)
        return
    
    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            user_data_dir=profile_path,
            headless=False,
        )

        page = browser.pages[0] if browser.pages else browser.new_page()
        # page.goto("https://pocketoption.com/en/cabinet")
        # page.goto("https://pocketoption.com/en/")
        # https://pocketoption.com/en/login
        page.goto("https://pocketoption.com/en/cabinet/demo-quick-high-low/")
        page.wait_for_load_state()

        if not wait_for_login(page):
            print("❌ Login failed. Trade skipped.", flush=True)
            browser.close()
            return

        page.wait_for_timeout(3000)
        page.keyboard.press("Escape")
        page.wait_for_timeout(500)

        if is_first_trade_today():
            update_balance_in_db(page, update_reference=True)
            print("🚦 This is the first trade of the day!", flush=True)
        else:
            update_balance_in_db(page, update_reference=False)
            print("⏩ Not the first trade today.", flush=True)

        print("✅ Logged in. Ready to process signals...", flush=True)

        is_initial_set_success = False
        base_amount = float(signal.get("base_amount", 1))
        max_levels = 1 + len(signal.get("martingale_times", []))  # 1 (entry) + 3 (mg) = 4
        total_staked = 0.0
        final_result = 0.0
        total_profit = 0.0
        payout_percent = 0.0
        trade_level = 0
        result_data = None
        trade_mg_amounts = []
        entry_time_this_level = ""

        while True:
            max_levels = 1 + get_latest_is_available_mg_level(signal["message_id"], table="today_signals")
            print(f"🔢 Max martingale levels available: {max_levels}", flush=True)

            if trade_level >= max_levels:
                break  # Stop if we've done all allowed levels

            if trade_level == 0:
                page.locator("a.flex-centered", has_text="Closed").click()
                
                entry_time_this_level = signal["entry_time"]
                
                # First trade: wait until the scheduled entry time
                is_initial_set_success, payout = set_trade_options(page, signal["pair"], signal["trade_duration"], str(base_amount))
                if is_initial_set_success == False:
                    break
                payout_percent = float(payout) if payout else 70  # Default to 80% if not set
                if payout_percent < 70:
                    print(f"⚠️ Payout too low ({payout_percent}%). Skipping trade.", flush=True)
                    break
                
                final_mg_amount, entry_time_this_level = monitor_and_update_trade_amount(signal, page, base_amount, table="today_signals")
                if final_mg_amount is None:
                    print("❌ Could not monitor and update trade amount. Skipping trade.", flush=True)
                    break
                print(f"🔄 Final trade amount set to {final_mg_amount} for entry time {entry_time_this_level}", flush=True)

                if entry_time_this_level is None:
                    print("❌ Could not get entry_time for this signal. Skipping trade.")
                    break

                # Update martingale times in the signal dict and DB
                update_martingale_times(signal, entry_time_this_level, signal.get("received_at", "").split(" ")[0], table="today_signals")
                update_martingale_times(signal, entry_time_this_level, signal.get("received_at", "").split(" ")[0], table="all_signals")
                
                base_amount = final_mg_amount  # Update base_amount to the final amount set

                total_loss = 0.0
                mg_amount = 0.0
                for i in range(max_levels):  # 0 = entry, 1.. = martingale
                    if i == 0:
                        mg_amount = base_amount  # First trade uses base amount
                    else:
                        mg_amount = calc_next_trade_amount(total_loss, base_amount, payout_percent)
                    trade_mg_amounts.append(mg_amount)
                    total_loss += mg_amount

                update_martingale_amounts(signal["message_id"], trade_mg_amounts, table="all_signals")
                update_martingale_amounts(signal["message_id"], trade_mg_amounts, table="today_signals")
                print(f"🔁 Martingale amounts for {signal['message_id']}: {trade_mg_amounts}", flush=True)
                
                entry_time_str = get_latest_entry_time(signal["message_id"], table="today_signals")
                if entry_time_str:
                    # wait_until_exact_time(entry_time_str)
                    wait_until_site_time(page, entry_time_str)
                    print(f"⏳ Waiting until entry time: {entry_time_str}", flush=True)
                else:
                    print("❌ No entry_time found for signal, skipping wait.", flush=True)
                    break
                
                click_trade_button(page, signal["direction"])
                print("!!!Click Trade Finish", datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3], flush=True)
                total_staked += base_amount
            else:
                click_trade_button(page, signal["direction"])
                print("!!!Click Trade Finish", datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3], flush=True)

                entry_time_this_level = get_martingale_time_for_level(signal["message_id"], trade_level + 1, table="today_signals")
                if not entry_time_this_level:
                    print("❌ Could not get entry_time for this signal, skipping martingale trade.", flush=True)
                    break
                print(f"🔁 Martingale trade at level {trade_level} with amount {mg_amount} at {entry_time_this_level}", flush=True)

                # Update the mg_amount based on the latest martingale amounts
                trade_mg_amounts = get_latest_martingale_amounts(signal["message_id"], table="today_signals")
                mg_amount = 0.0
                if trade_level < len(trade_mg_amounts):
                    mg_amount = trade_mg_amounts[trade_level]
                else:
                    # fallback or error handling
                    mg_amount = base_amount  # or whatever default logic you want
                # Martingale: only update amount and fire, no wait
                print(f"🔁 Martingale retry {trade_level} (Amount: {mg_amount})", flush=True)
                total_staked += mg_amount
            
            wait_for_trade_completion(signal["trade_duration"])

            trade_mg_amounts = get_latest_martingale_amounts(signal["message_id"], table="today_signals")
            if trade_level < len(trade_mg_amounts) and trade_level != 3:
                mg_amount = trade_mg_amounts[trade_level + 1]

                try:
                    input_box = page.locator("div.block--bet-amount div.value__val input[type='text']").first
                    input_box.click()
                    page.keyboard.press("Control+A")
                    input_box.type(str(mg_amount), delay=100)
                except Exception as e:
                    print("❌ Error updating input box:", e, flush=True)
            else:
                print(f"❌ No more martingale levels available for trade_level {trade_level}. Ending martingale.", flush=True)
                break   

            print("!!!ResultCheck Before", datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3], flush=True)
            expected_amount = str(trade_mg_amounts[trade_level])
            result_data = check_closed_trade_result(page,  expected_pair=signal["pair"], expected_amount=str(expected_amount))
            print("!!!ResultCheck Finished", datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3], flush=True)
            if result_data is None:
                print("❌ Could not get trade result. Skipping to next level.", flush=True)
                break

            if result_data.get("trading_result") == "win":
                print(f"🎉 Trade won at trade_level {trade_level}. Ending martingale.", flush=True)
                break
            else:
                print(f"🔁 Trade lost at trade_level {trade_level}. Retrying next trade_level...", flush=True)

            trade_level += 1

        if is_initial_set_success is False:
            result_data = {}
            result_data["is_status"] = "failed"
            result_data.pop("net_profit", None)
            print(f"⚠️ currency setting error: Cannot select this currency pair", flush=True)
        elif result_data is None:
            result_data = {}
            result_data["is_status"] = "failed"
            print("⚠️ Could not get trade result, treating as loss.", flush=True)
        elif result_data is not None:
            try:
                net_str = result_data.get("net_profit", "")
                if net_str:
                    net_str = net_str.replace("$", "").replace("+", "").strip()
                    final_result = float(net_str)                
                print(f" payout_percent={payout_percent}, final_result={final_result} ", flush=True)
            except Exception:
                final_result = 0.0
            print(f" total_staked={total_staked}, final_result={final_result} ", flush=True)

            end_time_str = get_trade_end_time(
                entry_time_this_level,
                signal["trade_duration"],
                signal.get("received_at", "").split(" ")[0]
            )
            # Save these in result_data after trade result is obtained:
            result_data["end_time"] = end_time_str

            total_profit = final_result - total_staked
            result_data["payout_percent"] = payout_percent
            result_data["total_profit"] = total_profit
            result_data["total_staked"] = total_staked
            result_data["base_amount"] = base_amount
            result_data["trade_level"] = trade_level
            result_data["is_status"] = "completed"
            
            print("✅ execute_trade() finished", flush=True)

        result_data.pop("net_profit", None)

        update_and_archive_entire_signal(signal, result_data, source_table="today_signals", result_table="forex_trading_result")
        
        time.sleep(3)  # Give some time to see the result before closing
        print("🔁 Updating balance in DB...", flush=True)
        update_balance_in_db(page, update_reference=False)

        time.sleep(5)  # Give some time to see the result before closing
        browser.close()

def update_all_and_today_signals():
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()

    # Fetch all signals
    c.execute("SELECT message_id, entry_time, received_at, is_status, is_executed FROM today_signals WHERE is_status = 'pending' OR is_status = 'processing' ")
    rows = c.fetchall()

    now = datetime.now()

    for row in rows:
        message_id, entry_time, received_at, is_status, is_executed = row

        if not entry_time or not received_at:
            continue

        # Parse datetime for signal entry
        try:
            date_part = received_at.split(" ")[0]
            signal_dt = datetime.strptime(f"{date_part} {entry_time}", "%Y-%m-%d %H:%M")
        except Exception as e:
            print(f"❌ Error parsing date/time for signal: {row}", flush=True)
            continue

        # Expired signals
        if signal_dt <= now:
            # Status-dependent update
            if is_status == "pending" and not is_executed:
                new_status = "expired"
            elif is_status == "processing" and is_executed:
                new_status = "failed"

            # Update the status in today_signals table
            c.execute("""
                UPDATE today_signals
                SET is_status = ?
                WHERE message_id = ?
            """, (new_status, message_id))
            # Also update in all_signals table
            c.execute("""
                UPDATE all_signals
                SET is_status = ?
                WHERE message_id = ?
            """, (new_status, message_id))

    conn.commit()
    conn.close()

    print(f"🔁 Updated is_expired status in today_signals table", flush=True)

def get_active_signals():
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute("""
        SELECT * FROM today_signals
        WHERE is_status = 'pending' AND (is_executed = 0 OR is_executed IS NULL)
    """)
    rows = c.fetchall()
    # If you want to return as list of dicts:
    columns = [col[0] for col in c.description]
    active_signals = [dict(zip(columns, row)) for row in rows]
    conn.close()
    return active_signals

def get_available_profile(active_processes):
    busy_profiles = [profile for (proc, _, profile) in active_processes if proc.is_alive()]
    for profile in PROFILE_POOL:
        if profile not in busy_profiles:
            return profile
    return None  # No free profile

def mark_signal_processing(message_id):
    conn = sqlite3.connect("ForexSignals.db")
    c = conn.cursor()
    c.execute(f"""
        UPDATE all_signals
        SET is_status = 'processing', is_executed = 1
        WHERE message_id = ?
    """, (message_id,))

    c.execute(f"""
        UPDATE today_signals
        SET is_status = 'processing', is_executed = 1
        WHERE message_id = ?
    """, (message_id,))

    conn.commit()
    conn.close()

def remove_today_signals_loop():
    try:
        # Get today's date as string, e.g., "2025-07-27"
        today_str = datetime.now().strftime("%Y-%m-%d")

        conn = sqlite3.connect("ForexSignals.db")
        c = conn.cursor()
        # Delete signals where received_at date is not today
        c.execute("""
            DELETE FROM today_signals 
            WHERE date(received_at) <> ?
        """, (today_str,))
        conn.commit()
        deleted = c.rowcount
        conn.close()

        print(f"🔁 Signal status updated in today_signals table", flush=True)
        if deleted > 0:
            print(f"🗑️ Deleted {deleted} old signal(s) from today_signals table", flush=True)
    except Exception as e:
        print(f"❌ Error updating signal status: {e}", flush=True)

def run_signal_loop():
    
    active_processes = []

    print("🔁 Starting Trade Signal Runner (multi-process)...", flush=True)
    
    while True:
        update_all_and_today_signals()
        remove_today_signals_loop()
        
        signals = get_active_signals()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] 🧹 Active signals: {len(signals)}", flush=True)

        if not signals:
            print("🔍 No active signals found. Waiting for new ones...", flush=True)
            time.sleep(20)
            continue

        now_str = time.strftime("%H:%M")
        entry_times = [s.get("entry_time", "??:??") for s in signals]
        print(f"\n🕒 Current Time: {now_str} | Todo signals: {len(signals)} | Entry times: {', '.join(entry_times)}", flush=True)

        for signal in signals[:]:
            if not signal.get("entry_time"):
                print(f"❌ Signal {signal.get('message_id')} has no entry time, skipping...", flush=True)
                continue

            entry_time = signal.get("entry_time")

            if is_within_buffer(now_str, entry_time, BUFFER_MINUTES):
                # Defensive: check if signal is already in any running process (use message_id or similar unique property)
                already_running = any(sig.get("message_id") == signal.get("message_id") for _, sig, _ in active_processes)
                if already_running:
                    continue
                
                # Run as a new process   
                if len(active_processes) >= MAX_PROCESSES:
                    print("⚠️ All browser profiles busy, waiting for a slot...", flush=True)
                    break  # Wait for a slot to free up

                profile_path = get_available_profile(active_processes)
                if not profile_path:
                    print("⚠️ No free browser profile, skipping for now...", flush=True)
                    continue  # All profiles busy, try next time

                try:
                    mark_signal_processing(signal.get("message_id"))
                    p = Process(target=execute_trade, args=(signal, profile_path))
                    p.start()
                    active_processes.append( (p, signal, profile_path) )
                    print(f"🚀 Started trade process for signal {signal.get('message_id')} using profile {profile_path}", flush=True)
                except Exception as e:
                    print("❌ Failed to start trade process:", e, flush=True)

        # Periodically clean up finished ones in your main loop:
        for proc, sig, profile in active_processes[:]:
            if not proc.is_alive():
                proc.join()
                active_processes.remove((proc, sig, profile))

        # To print status:
        for idx, (proc, sig, profile) in enumerate(active_processes):
            print(f"Process {idx}: PID={proc.pid}, Alive={proc.is_alive()}, Pair={sig.get('pair')}, Entry={sig.get('entry_time')}, Profile={profile}", flush=True)
        
        time.sleep(20)

if __name__ == "__main__":
    run_signal_loop()
