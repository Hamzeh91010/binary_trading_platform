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