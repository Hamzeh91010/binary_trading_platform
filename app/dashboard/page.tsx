'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Play, Square, Activity, Target, DollarSign, Zap, BarChart3, Clock, Users, Award, RefreshCw } from 'lucide-react';
import { botApi, signalsApi, settingsApi } from '@/lib/api';
import { TradingStatus } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTradingNotifications } from '@/hooks/useNotifications';

// Mock data for charts
const mockProfitData = [
  { time: '09:00', profit: 0, trades: 0 },
  { time: '10:00', profit: 125, trades: 3 },
  { time: '11:00', profit: 280, trades: 7 },
  { time: '12:00', profit: 450, trades: 12 },
  { time: '13:00', profit: 380, trades: 15 },
  { time: '14:00', profit: 620, trades: 18 },
  { time: '15:00', profit: 750, trades: 22 },
];

const mockResultData = [
  { name: 'Wins', value: 68, color: '#10b981' },
  { name: 'Losses', value: 25, color: '#ef4444' },
  { name: 'Pending', value: 7, color: '#f59e0b' },
];

export default function DashboardPage() {
  const [tradingStatus, setTradingStatus] = useState<TradingStatus | null>(null);
  const [todaySignals, setTodaySignals] = useState<any[]>([]);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { notifyTradeSuccess, notifyNewSignal, notifyTargetReached } = useTradingNotifications();

  const fetchData = async () => {
    try {
      const [statusRes, signalsRes, botRes] = await Promise.all([
        settingsApi.getTradingStatus(),
        signalsApi.getTodaySignals(),
        botApi.getStatus()
      ]);
      
      setTradingStatus(statusRes.data);
      setTodaySignals(signalsRes.data || []);
      setBotStatus(botRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Use mock data for demo
      setTradingStatus({
        current_profit: 750,
        daily_profit_target: 1000,
        max_loss_percent: 10,
        balance_reference: 5000,
        current_balance: 5750,
        current_loss_percent: 0,
        should_stop_trading: false,
        profit_target_reached: false,
        loss_limit_reached: false,
        trading_allowed: true,
      });
      setTodaySignals([
        { symbol: 'EUR/USD', direction: 'BUY', result: 'WIN', total_profit: 125, created_at: new Date().toISOString() },
        { symbol: 'GBP/USD', direction: 'SELL', result: 'WIN', total_profit: 95, created_at: new Date().toISOString() },
        { symbol: 'USD/JPY', direction: 'BUY', result: 'LOSS', total_profit: -50, created_at: new Date().toISOString() },
      ]);
      setBotStatus({
        telegram_listener: { running: true },
        trade_signal_runner: { running: true },
        api_bot_manager: { running: true }
      });
      
      // Simulate some notifications for demo
      setTimeout(() => {
        notifyNewSignal('EUR/USD', 'BUY', '14:30');
      }, 2000);
      
      setTimeout(() => {
        notifyTradeSuccess('GBP/USD', 'SELL', 95.50);
      }, 5000);
      
      toast.error('Using demo data - backend not connected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStopTrading = async () => {
    try {
      await settingsApi.stopTradingBots();
      toast.success('Trading bots stopped successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to stop trading:', error);
      toast.error('Failed to stop trading bots');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalProfit = todaySignals.reduce((sum, signal) => sum + (signal.total_profit || 0), 0);
  const winRate = todaySignals.length > 0 
    ? (todaySignals.filter(s => s.result === 'WIN').length / todaySignals.length) * 100 
    : 0;

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Trading Dashboard" 
          subtitle="Real-time overview of your trading performance and system status"
          onRefresh={fetchData}
          isLoading={loading}
        />

        {/* Header Section */}
        <div className="space-y-4">
          {tradingStatus?.should_stop_trading ? (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Trading Stopped:</strong> Daily limits reached
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <Activity className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>Trading Active:</strong> All systems operational and monitoring signals
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Live</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Today's Profit</CardTitle>
              {totalProfit >= 0 ? (
                <TrendingUp className="h-5 w-5 opacity-80" />
              ) : (
                <TrendingDown className="h-5 w-5 opacity-80" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(totalProfit)}
              </div>
              {tradingStatus && (
                <p className="text-xs opacity-80 mt-1">
                  Target: {formatCurrency(tradingStatus.daily_profit_target)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Win Rate</CardTitle>
              <Target className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPercent(winRate)}</div>
              <p className="text-xs opacity-80 mt-1">
                {todaySignals.length} total signals today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Current Balance</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {tradingStatus ? formatCurrency(tradingStatus.current_balance) : 'Loading...'}
              </div>
              {tradingStatus && (
                <p className="text-xs opacity-80 mt-1">
                  Reference: {formatCurrency(tradingStatus.balance_reference)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Bots</CardTitle>
              <Zap className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {botStatus ? Object.values(botStatus).filter((bot: any) => bot.running).length : 0}
              </div>
              <p className="text-xs opacity-80 mt-1">
                {botStatus ? Object.keys(botStatus).length : 0} total bots
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Today's Profit Curve</span>
              </CardTitle>
              <CardDescription>
                Real-time profit tracking throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockProfitData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Profit']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Signal Results</span>
              </CardTitle>
              <CardDescription>
                Win/Loss distribution for today's trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockResultData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockResultData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Signals */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Recent Signals</span>
                </CardTitle>
                <CardDescription>Latest trading signals from today</CardDescription>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                {todaySignals.length} signals
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todaySignals.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
                  <Activity className="relative h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No signals today</h3>
                <p className="text-gray-500 dark:text-gray-400">Waiting for new trading opportunities...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySignals.slice(0, 5).map((signal, index) => (
                  <div key={index} className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 p-4 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 relative">
                          <div className={`absolute inset-0 rounded-full blur-sm ${
                            signal.direction === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}></div>
                          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                            signal.direction === 'BUY' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {signal.direction === 'BUY' ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {signal.symbol}
                            </span>
                            <Badge 
                              variant={signal.direction === 'BUY' ? 'default' : 'destructive'} 
                              className="text-xs font-medium"
                            >
                              {signal.direction}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-mono">
                                {new Date(signal.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>Entry amount</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {signal.result && (
                          <div className="text-center">
                            <Badge 
                              className={`mb-1 ${
                                signal.result === 'WIN' 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {signal.result}
                            </Badge>
                          </div>
                        )}
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            signal.total_profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(signal.total_profit || 0)}
                          </div>
                          {signal.total_profit !== 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {signal.total_profit >= 0 ? '+' : ''}{((signal.total_profit || 0) * 100 / 25).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {todaySignals.length > 5 && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      className="w-full group hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-800"
                      onClick={() => window.location.href = '/signals'}
                    >
                      <Activity className="h-4 w-4 mr-2 group-hover:text-blue-600" />
                      View All {todaySignals.length} Signals
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
@@ .. @@
import { ArrowRight, Play, Square, Activity, Target, DollarSign, Zap, BarChart3, Clock, Users, Award, RefreshCw } from 'lucide-react';
                        {signal.direction === 'BUY' ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                        <Badge variant={signal.direction === 'BUY' ? 'default' : 'destructive'}>
                          {signal.direction}
                        </Badge>
                      </div>
                      <span className="font-medium">{signal.symbol}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(signal.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {signal.result && (
                        <Badge variant={signal.result === 'WIN' ? 'default' : 'destructive'}>
                          {signal.result}
                        </Badge>
                      )}
                      <span className={`font-medium ${signal.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(signal.total_profit || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bot Status */}
        {botStatus && (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span>Bot Status</span>
              </CardTitle>
              <CardDescription>Current status of trading bots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(botStatus).map(([botId, status]: [string, any]) => (
                  <div key={botId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${status.running ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="font-medium">{botId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <Badge variant={status.running ? 'default' : 'secondary'}>
                      {status.running ? 'Running' : 'Stopped'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}