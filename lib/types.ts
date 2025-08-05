export interface TradingStatus {
  today_profit: number;
  daily_profit_target: number;
  max_loss_percent: number;
  balance_reference: number;
  current_balance: number;
  current_loss_percent: number;
  should_stop_trading: boolean;
  profit_target_reached: boolean;
  loss_limit_reached: boolean;
  trading_allowed: boolean;
  stop_reason?: string;
}

export interface Signal {
  message_id: number;
  channel_type: 'telegram' | 'whatsapp' | 'primary'; // Extend if needed
  received_at: string; // ISO string format (e.g., '2024-01-15T13:45:00')
  pair: string; // Example: 'EUR/USD'
  base_amount: number;
  entry_time: string; // HH:mm
  end_time: string;   // HH:mm
  martingale_times: string[]; // Array of HH:mm strings
  martingale_amounts: number[]; // Corresponding martingale bet amounts
  is_available_martingale_level: number; // How many martingales available
  direction: 'BUY' | 'SELL';
  trade_duration: string; // e.g., '5 minutes'
  is_otc: boolean;
  is_status: 'pending' | 'expired' | 'processing' | 'failed' | 'completed'; // Add more if needed
  trading_result: 'win' | 'loss' | false; // Add more if needed
  payout_percent: number; // e.g., 85
  trade_level: number; // 0 = initial, 1/2/3 = martingale level
  total_profit: number;
  total_staked: number;
  raw_text: string; // The original signal string
  is_executed: boolean;
}

export interface BaseSettings {
  base_amount: number;
  daily_profit_target: number;
  max_loss_percent: number;
  balance_reference: number;
  current_balance: number;
}

export interface Bot {
  id: string;
  status: 'running' | 'stopped';
  pid?: number;
  log: string;
}