import subprocess
import os
import sys
import sqlite3
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from pathlib import Path

app = FastAPI()

# Allow CORS for local frontend dev (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev. Restrict for prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Map of botId -> process and log
processes = {}

class StartBotRequest(BaseModel):
    botId: str
    script: str
    workingDir: str = "D:/Pavlo_works/telegram_signal_bot"

class TradingStatusResponse(BaseModel):
    today_profit: float
    daily_profit_target: float
    max_loss_percent: float
    balance_reference: float
    current_balance: float
    current_loss_percent: float
    should_stop_trading: bool
    profit_target_reached: bool
    loss_limit_reached: bool
    trading_allowed: bool
    stop_reason: str = ""

def get_db_connection():
    """Get database connection to ForexSignals.db"""
    db_path = Path("D:/Pavlo_works/telegram_signal_bot/ForexSignals.db")
    print("🔍 Using DB path:", db_path)  # DEBUG: Print path

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def calculate_trading_status():
    """Calculate current trading status from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get base settings
        cursor.execute("""
            SELECT balance_reference, max_loss_percent, daily_profit_target, current_balance,
                   COALESCE(is_trading_manually_stopped, 0) as is_manually_stopped
            FROM base_setting 
            LIMIT 1
        """)
        settings = cursor.fetchone()
        
        if not settings:
            return {
                "today_profit": 0.0,
                "daily_profit_target": 100.0,
                "max_loss_percent": 5.0,
                "balance_reference": 1000.0,
                "current_balance": 1000.0,
                "current_loss_percent": 0.0,
                "should_stop_trading": False,
                "profit_target_reached": False,
                "loss_limit_reached": False,
                "trading_allowed": True,
                "stop_reason": ""
            }
        
        balance_reference, max_loss_percent, daily_profit_target, current_balance, is_manually_stopped = settings
        
        # Get today's profit from today_signals table
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute("""
            SELECT COALESCE(SUM(total_profit), 0) as today_profit
            FROM today_signals 
            WHERE DATE(created_at) = ?
        """, (today,))
        
        today_profit_result = cursor.fetchone()
        today_profit = today_profit_result[0] if today_profit_result else 0.0
        
        # Calculate current loss percentage
        current_loss_percent = ((balance_reference - current_balance) / balance_reference * 100) if balance_reference > 0 else 0.0
        
        # Determine trading conditions
        profit_target_reached = today_profit >= daily_profit_target if today_profit > 0 else False
        loss_limit_reached = current_loss_percent >= max_loss_percent if today_profit < 0 else False
        
        # Determine if trading should stop
        should_stop_trading = False
        stop_reason = ""
        
        if is_manually_stopped:
            should_stop_trading = True
            stop_reason = "Manually stopped"
        elif profit_target_reached:
            should_stop_trading = True
            stop_reason = "Daily profit target reached"
        elif loss_limit_reached:
            should_stop_trading = True
            stop_reason = "Maximum loss limit reached"
        
        trading_allowed = not should_stop_trading
        
        conn.close()
        
        return {
            "today_profit": float(today_profit),
            "daily_profit_target": float(daily_profit_target),
            "max_loss_percent": float(max_loss_percent),
            "balance_reference": float(balance_reference),
            "current_balance": float(current_balance),
            "current_loss_percent": float(current_loss_percent),
            "should_stop_trading": should_stop_trading,
            "profit_target_reached": profit_target_reached,
            "loss_limit_reached": loss_limit_reached,
            "trading_allowed": trading_allowed,
            "stop_reason": stop_reason
        }
        
    except Exception as e:
        print(f"Error calculating trading status: {e}")
        return {
            "today_profit": 0.0,
            "daily_profit_target": 100.0,
            "max_loss_percent": 5.0,
            "balance_reference": 1000.0,
            "current_balance": 1000.0,
            "current_loss_percent": 0.0,
            "should_stop_trading": False,
            "profit_target_reached": False,
            "loss_limit_reached": False,
            "trading_allowed": True,
            "stop_reason": "Error calculating status"
        }

@app.get("/api/signals/today")
def get_today_signals():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM today_signals ORDER BY received_at DESC")
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        signals = [dict(zip(columns, row)) for row in rows]
        return JSONResponse(content=signals)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        conn.close()

@app.get("/api/signals/all")
def get_all_signals(status: Optional[str] = None, pair: Optional[str] = None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        base_query = "SELECT * FROM all_signals WHERE 1=1"
        params = []

        if status:
            base_query += " AND is_status = ?"
            params.append(status)

        if pair:
            base_query += " AND pair = ?"
            params.append(pair)

        base_query += " ORDER BY received_at DESC"

        cursor.execute(base_query, params)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        signals = [dict(zip(columns, row)) for row in rows]
        return JSONResponse(content=signals)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        conn.close()

@app.put("/api/signals/{message_id}")
async def update_signal(message_id: int, request: Request):
    try:
        data = await request.json()
        conn = get_db_connection()
        cursor = conn.cursor()

        # Build dynamic SET clause
        set_clause = ", ".join([f"{key} = ?" for key in data.keys()])
        values = list(data.values())
        values.append(message_id)

        cursor.execute(f"""
            UPDATE today_signals SET {set_clause} WHERE message_id = ?
        """, values)
        cursor.execute(f"""
            UPDATE all_signals SET {set_clause} WHERE message_id = ?
        """, values)

        conn.commit()
        return {"status": "success", "message": "Signal updated"}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        conn.close()

@app.post("/api/signals")
async def add_signal(request: Request):
    try:
        data = await request.json()
        conn = get_db_connection()
        cursor = conn.cursor()

        fields = list(data.keys())
        values = list(data.values())

        placeholders = ", ".join(["?"] * len(fields))
        columns = ", ".join(fields)

        # Insert into both tables
        cursor.execute(f"""
            INSERT INTO today_signals ({columns}) VALUES ({placeholders})
        """, values)
        cursor.execute(f"""
            INSERT INTO all_signals ({columns}) VALUES ({placeholders})
        """, values)

        conn.commit()
        return {"status": "success", "message": "Signal added"}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        conn.close()

@app.delete("/api/signals/{message_id}")
def delete_signal(message_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM today_signals WHERE message_id = ?", (message_id,))
        cursor.execute("DELETE FROM all_signals WHERE message_id = ?", (message_id,))
        conn.commit()

        return {"status": "success", "message": f"Signal {message_id} deleted"}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        conn.close()

@app.post("/api/bots/start")
def start_bot(req: StartBotRequest):
    if req.botId in processes and processes[req.botId]["proc"].poll() is None:
        return {
            "status": "already_running",
            "pid": processes[req.botId]["pid"],
            "log": processes[req.botId].get("log", None),
            "message": f"{req.botId} is already running"
        }

    abs_working_dir = os.path.abspath(req.workingDir)
    script_path = os.path.abspath(os.path.join(abs_working_dir, req.script))

    if not os.path.exists(script_path):
        return {
            "status": "error",
            "message": f"Script not found: {script_path}"
        }

    python_exec = sys.executable
    log_path = os.path.join(abs_working_dir, f"{req.botId}_output.log")
    log_file = open(log_path, "a")

    try:
        proc = subprocess.Popen(
            [python_exec, script_path],
            cwd=abs_working_dir,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            text=True
        )
        processes[req.botId] = {"proc": proc, "pid": proc.pid, "log": log_path}
        return {
            "status": "running",
            "pid": proc.pid,
            "log": log_path,
            "message": f"{req.botId} started with PID {proc.pid}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/bots/stop")
async def stop_bot(req: Request):
    data = await req.json()
    botId = data.get("botId")
    if botId in processes:
        proc = processes[botId]["proc"]
        pid = processes[botId]["pid"]
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
            return {"status": "stopped", "pid": pid}
        else:
            return {"status": "already_stopped", "pid": pid}
    return {"status": "not_found"}

@app.get("/api/bots/status")
def status():
    # Returns list of all managed bots and their status
    status_list = []
    for botId, entry in processes.items():
        proc = entry["proc"]
        running = proc.poll() is None
        status_list.append({
            "id": botId,
            "status": "running" if running else "stopped",
            "pid": entry["pid"],
            "log": entry.get("log", None)
        })
    return status_list

# (Optional) Health check endpoint
@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/settings/trading-status")
def get_trading_status():
    """Get current trading status with profit/loss calculations"""
    return calculate_trading_status()

@app.post("/api/settings/stop-trading")
async def stop_trading(req: Request):
    """Manually stop trading by setting flag in database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Add column if it doesn't exist
        cursor.execute("""
            PRAGMA table_info(base_setting)
        """)
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_trading_manually_stopped' not in columns:
            cursor.execute("""
                ALTER TABLE base_setting 
                ADD COLUMN is_trading_manually_stopped INTEGER DEFAULT 0
            """)
        
        # Set manual stop flag
        cursor.execute("""
            UPDATE base_setting 
            SET is_trading_manually_stopped = 1
        """)
        
        conn.commit()
        conn.close()
        
        return {"status": "success", "message": "Trading manually stopped"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/settings/resume-trading")
async def resume_trading(req: Request):
    """Resume trading by clearing manual stop flag"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Clear manual stop flag
        cursor.execute("""
            UPDATE base_setting 
            SET is_trading_manually_stopped = 0
        """)
        
        conn.commit()
        conn.close()
        
        return {"status": "success", "message": "Trading resumed"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
 