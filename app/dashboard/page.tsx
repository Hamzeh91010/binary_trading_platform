'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { ArrowRight, Play, Square, Activity, Target, DollarSign, Zap, BarChart3, Clock, Users, Award, RefreshCw, TrendingUp, TrendingDown, Bot, Radio, AlertTriangle, CheckCircle, Pause, Settings, Globe, Wifi, WifiOff, Timer, Calendar, Hash, Signal } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Signal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  created_at: string;
  result?: 'WIN' | 'LOSS';
  total_profit?: number;
  status: 'pending' | 'processing' | 'completed' | 'expired';
  entry_time?: string;
  payout_percent?: number;
}

interface BotStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  uptime: string;
  processed_signals: number;
  success_rate: number;
}

interface TradingStats {
  daily_profit: number;
  weekly_profit: number;
  monthly_profit: number;
  total_trades: number;
  win_rate: number;
  avg_profit_per_trade: number;
  best_pair: string;
  active_signals: number;
}

export default function DashboardPage() {
  const [todaySignals, setTodaySignals] = useState<Signal[]>([]);
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [botStatuses, setBotStatuses] = useState<BotStatus[]>([]);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Mock data for comprehensive dashboard
    const mockSignals: Signal[] = [
      {
        id: '1',
        symbol: 'EURUSD',
        direction: 'BUY',
        created_at: new Date().toISOString(),
        result: 'WIN',
        total_profit: 25.50,
        status: 'completed',
        entry_time: '14:30',
        payout_percent: 85
      },
      {
        id: '2',
        symbol: 'GBPUSD',
        direction: 'SELL',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        result: 'LOSS',
        total_profit: -15.00,
        status: 'completed',
        entry_time: '13:45',
        payout_percent: 80
      },
      {
        id: '3',
        symbol: 'USDJPY',
        direction: 'BUY',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        status: 'processing',
        entry_time: '15:15',
        payout_percent: 82
      },
      {
        id: '4',
        symbol: 'AUDUSD',
        direction: 'SELL',
        created_at: new Date(Date.now() - 900000).toISOString(),
        status: 'pending',
        entry_time: '15:45',
        payout_percent: 78
      }
    ];
    
    const mockLiveSignals: Signal[] = mockSignals.filter(s => s.status === 'pending' || s.status === 'processing');
    
    const mockBots: BotStatus[] = [
      {
        id: 'telegram_listener',
        name: 'Telegram Listener',
        status: 'running',
        uptime: '2d 14h 32m',
        processed_signals: 156,
        success_rate: 78.5
      },
      {
        id: 'trade_executor',
        name: 'Trade Executor',
        status: 'running',
        uptime: '2d 14h 30m',
        processed_signals: 142,
        success_rate: 82.1
      },
      {
        id: 'risk_manager',
        name: 'Risk Manager',
        status: 'paused',
        uptime: '1d 8h 15m',
        processed_signals: 89,
        success_rate: 95.2
      }
    ];

    const mockStats: TradingStats = {
      daily_profit: 125.50,
      weekly_profit: 890.25,
      monthly_profit: 3245.80,
      total_trades: 24,
      win_rate: 78.5,
      avg_profit_per_trade: 15.25,
      best_pair: 'EUR/USD',
      active_signals: 2
    };

    setTodaySignals(mockSignals);
    setLiveSignals(mockLiveSignals);
    setBotStatuses(mockBots);
    setTradingStats(mockStats);
    setIsLoading(false);
  }, []);

  // Mock chart data
  const profitChartData = [
    { time: '09:00', profit: 0 },
    { time: '10:00', profit: 45.20 },
    { time: '11:00', profit: 78.50 },
    { time: '12:00', profit: 125.30 },
    { time: '13:00', profit: 98.75 },
    { time: '14:00', profit: 156.40 },
    { time: '15:00', profit: 125.50 },
  ];

  const winLossData = [
    { name: 'Wins', value: 18, color: '#10b981' },
    { name: 'Losses', value: 6, color: '#ef4444' },
  ];

  const pairPerformanceData = [
    { pair: 'EUR/USD', trades: 8, profit: 145.20 },
    { pair: 'GBP/USD', trades: 6, profit: 89.50 },
    { pair: 'USD/JPY', trades: 5, profit: 67.80 },
    { pair: 'AUD/USD', trades: 3, profit: 45.30 },
    { pair: 'USD/CAD', trades: 2, profit: 23.70 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'stopped': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'pending': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'processing': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'expired': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Trading Dashboard" 
          subtitle="Real-time trading overview and performance analytics"
          onRefresh={() => window.location.reload()}
        />

        {/* Live Status Alert */}
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="flex items-center justify-between">
              <span>
                <strong>System Status:</strong> All trading bots are operational and processing signals
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium font-mono">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tradingStats?.total_trades}</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(tradingStats?.win_rate || 0)}</div>
              <p className="text-xs text-muted-foreground">+5.2% from last week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(tradingStats?.daily_profit || 0)}</div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-xs text-muted-foreground">
                  Weekly: {formatCurrency(tradingStats?.weekly_profit || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly: {formatCurrency(tradingStats?.monthly_profit || 0)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{botStatuses.length}</div>
              <p className="text-xs text-muted-foreground">
                {botStatuses.filter(b => b.status === 'running').length} running, {botStatuses.filter(b => b.status === 'paused').length} paused
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Signals</CardTitle>
              <Signal className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveSignals.length}</div>
              <p className="text-xs text-muted-foreground">Active trading signals</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Signals Section */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Signal className="h-5 w-5 text-purple-600" />
                  <span>Live Trading Signals</span>
                </CardTitle>
                <CardDescription>Real-time signal processing and execution status</CardDescription>
              </div>
              <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 animate-pulse">
                {liveSignals.length} active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {liveSignals.length === 0 ? (
              <div className="text-center py-8">
                <Signal className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-500 dark:text-gray-400">No active signals at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {liveSignals.map((signal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          signal.status === 'processing' ? 'bg-purple-500 animate-pulse' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-lg font-semibold">{signal.symbol}</span>
                        <Badge variant={signal.direction === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                          {signal.direction}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Entry: {signal.entry_time} | Payout: {signal.payout_percent}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(signal.status)}>
                        {signal.status.toUpperCase()}
                      </Badge>
                      <Timer className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profit Chart */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Today's Profit Curve</span>
              </CardTitle>
              <CardDescription>Real-time profit tracking throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Profit']} />
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

          {/* Win/Loss Pie Chart */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Win/Loss Distribution</span>
              </CardTitle>
              <CardDescription>Trade outcome breakdown for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bot Status and Pair Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bot Status */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span>Bot Status</span>
              </CardTitle>
              <CardDescription>Real-time bot monitoring and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {botStatuses.map((bot, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        bot.status === 'running' ? 'bg-green-500 animate-pulse' : 
                        bot.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{bot.name}</div>
                        <div className="text-sm text-gray-500">
                          Uptime: {bot.uptime} | Processed: {bot.processed_signals}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status.toUpperCase()}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatPercent(bot.success_rate)} success
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pair Performance */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Currency Pair Performance</span>
              </CardTitle>
              <CardDescription>Top performing pairs today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pairPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="pair" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Profit']} />
                    <Bar dataKey="profit" fill="#8b5cf6" />
                  </BarChart>
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
                  <span>Recent Trading History</span>
                </CardTitle>
                <CardDescription>Completed trades and their results</CardDescription>
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
                {todaySignals.filter(s => s.status === 'completed').slice(0, 5).map((signal, index) => (
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
                              <Target className="h-3 w-3" />
                              <span>{signal.payout_percent}% payout</span>
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
                            (signal.total_profit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {formatCurrency(signal.total_profit || 0)}
                          </div>
                          {signal.total_profit !== 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {(signal.total_profit || 0) >= 0 ? '+' : ''}{(((signal.total_profit || 0) / 25) * 100).toFixed(1)}%
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

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Frequently used trading controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => window.location.href = '/signals'}>
                <Activity className="h-6 w-6" />
                <span className="text-sm">View Signals</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => window.location.href = '/bots'}>
                <Bot className="h-6 w-6" />
                <span className="text-sm">Manage Bots</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => window.location.href = '/reports'}>
                <BarChart3 className="h-6 w-6" />
                <span className="text-sm">View Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => window.location.href = '/settings'}>
                <Settings className="h-6 w-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}