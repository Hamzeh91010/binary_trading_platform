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
import { signalsApi, botApi, settingsApi } from '@/lib/api';
import { Signal, TradingStatus, BaseSettings } from '@/lib/types';
import { toast } from 'sonner';

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
  const [botStatuses, setBotStatuses] = useState<any[]>([]);
  const [tradingStats, setTradingStats] = useState<TradingStats | null>(null);
  const [tradingStatus, setTradingStatus] = useState<TradingStatus | null>(null);
  const [baseSettings, setBaseSettings] = useState<BaseSettings | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch today's signals
      const todayResponse = await signalsApi.getTodaySignals();
      const todayData = todayResponse.data || [];
      setTodaySignals(todayData);

      // Filter live signals (pending or processing)
      const liveData = todayData.filter((signal: Signal) => 
        signal.is_status === 'pending' || signal.is_status === 'processing'
      );
      setLiveSignals(liveData);

      // Fetch bot statuses
      try {
        const botResponse = await botApi.getStatus();
        setBotStatuses(botResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch bot status:', error);
        setBotStatuses([]);
      }

      // Fetch trading status
      try {
        const statusResponse = await settingsApi.getTradingStatus();
        setTradingStatus(statusResponse.data);
      } catch (error) {
        console.error('Failed to fetch trading status:', error);
      }

      // Fetch base settings
      try {
        const settingsResponse = await settingsApi.getBaseSettings();
        setBaseSettings(settingsResponse.data);
      } catch (error) {
        console.error('Failed to fetch base settings:', error);
      }

      // Calculate trading statistics from today's signals
      const completedSignals = todayData.filter((s: Signal) => s.is_status === 'completed');
      const winningSignals = completedSignals.filter((s: Signal) => s.trading_result === 'win');
      const totalProfit = todayData.reduce((sum: number, signal: Signal) => sum + (signal.total_profit || 0), 0);
      
      // Calculate weekly and monthly profits (simplified - using today's data as example)
      const weeklyProfit = totalProfit * 5; // Rough estimate
      const monthlyProfit = totalProfit * 22; // Rough estimate

      // Find most traded pair
      const pairCounts = todayData.reduce((acc: Record<string, number>, signal: Signal) => {
        acc[signal.pair] = (acc[signal.pair] || 0) + 1;
        return acc;
      }, {});
      const bestPair = Object.entries(pairCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'EUR/USD';

      const stats: TradingStats = {
        daily_profit: totalProfit,
        weekly_profit: weeklyProfit,
        monthly_profit: monthlyProfit,
        total_trades: todayData.length,
        win_rate: completedSignals.length > 0 ? (winningSignals.length / completedSignals.length) * 100 : 0,
        avg_profit_per_trade: todayData.length > 0 ? totalProfit / todayData.length : 0,
        best_pair: bestPair,
        active_signals: liveData.length
      };

      setTradingStats(stats);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate chart data from real signals
  const profitChartData = React.useMemo(() => {
    if (!todaySignals.length) return [];

    // Group signals by hour and calculate cumulative profit
    const hourlyData: Record<string, number> = {};
    let cumulativeProfit = 0;

    todaySignals
      .sort((a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime())
      .forEach(signal => {
        const hour = new Date(signal.received_at).getHours();
        const timeKey = `${hour.toString().padStart(2, '0')}:00`;
        
        cumulativeProfit += signal.total_profit || 0;
        hourlyData[timeKey] = cumulativeProfit;
      });

    return Object.entries(hourlyData).map(([time, profit]) => ({
      time,
      profit
    }));
  }, [todaySignals]);

  // Generate pie chart data from real signals
  const winLossData = React.useMemo(() => {
    if (!todaySignals.length) return [];

    const completedSignals = todaySignals.filter(s => s.is_status === 'completed');
    const wins = completedSignals.filter(s => s.trading_result === 'win').length;
    const losses = completedSignals.filter(s => s.trading_result === 'loss').length;
    const draws = completedSignals.filter(s => s.trading_result === 'draw').length;

    const data = [];
    if (wins > 0) data.push({ name: 'Wins', value: wins, color: '#10b981' });
    if (losses > 0) data.push({ name: 'Losses', value: losses, color: '#ef4444' });
    if (draws > 0) data.push({ name: 'Draws', value: draws, color: '#f59e0b' });

    return data;
  }, [todaySignals]);

  // Generate pair performance data
  const pairPerformanceData = React.useMemo(() => {
    if (!todaySignals.length) return [];

    const pairStats: Record<string, { trades: number; profit: number }> = {};
    
    todaySignals.forEach(signal => {
      if (!pairStats[signal.pair]) {
        pairStats[signal.pair] = { trades: 0, profit: 0 };
      }
      pairStats[signal.pair].trades++;
      pairStats[signal.pair].profit += signal.total_profit || 0;
    });

    return Object.entries(pairStats)
      .map(([pair, stats]) => ({ pair, ...stats }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [todaySignals]);

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
          onRefresh={fetchDashboardData}
          isLoading={isLoading}
        />

        {/* Live Status Alert */}
        <Alert className={`${
          tradingStatus?.should_stop_trading 
            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
            : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
        }`}>
          {tradingStatus?.should_stop_trading ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={`${
            tradingStatus?.should_stop_trading 
              ? 'text-red-800 dark:text-red-200' 
              : 'text-green-800 dark:text-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>
                <strong>System Status:</strong> {
                  tradingStatus?.should_stop_trading 
                    ? `Trading stopped - ${tradingStatus.stop_reason}` 
                    : 'All trading bots are operational and processing signals'
                }
              </span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  tradingStatus?.should_stop_trading ? 'bg-red-400' : 'bg-green-400'
                }`} />
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
              <div className="text-2xl font-bold">{tradingStats?.total_trades || 0}</div>
              <p className="text-xs text-muted-foreground">Today's signals</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercent(tradingStats?.win_rate || 0)}</div>
              <p className="text-xs text-muted-foreground">Completed trades</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (tradingStats?.daily_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(tradingStats?.daily_profit || 0)}
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="text-xs text-muted-foreground">
                  Target: {formatCurrency(tradingStatus?.daily_profit_target || 0)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Balance: {formatCurrency(tradingStatus?.current_balance || 0)}
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
                {botStatuses.filter(b => b.status === 'running').length} running
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
                          signal.is_status === 'processing' ? 'bg-purple-500 animate-pulse' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-lg font-semibold">{signal.pair}</span>
                        <Badge variant={signal.direction === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                          {signal.direction}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Entry: {signal.entry_time} | Payout: {signal.payout_percent}% | Amount: {formatCurrency(signal.base_amount)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(signal.is_status)}>
                        {signal.is_status.toUpperCase()}
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
                {profitChartData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No profit data available yet</p>
                    </div>
                  </div>
                )}
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
                {winLossData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No completed trades yet</p>
                    </div>
                  </div>
                )}
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
                {botStatuses.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400">No bot status available</p>
                  </div>
                ) : (
                  botStatuses.map((bot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          bot.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="font-medium">{bot.id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                          <div className="text-sm text-gray-500">
                            PID: {bot.pid || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(bot.status)}>
                          {bot.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
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
                {pairPerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pairPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="pair" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Profit']} />
                      <Bar dataKey="profit" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pair performance data yet</p>
                    </div>
                  </div>
                )}
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
                {todaySignals.filter(s => s.is_status === 'completed').slice(0, 5).map((signal, index) => (
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
                              {signal.pair}
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
                                {new Date(signal.received_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="h-3 w-3" />
                              <span>{signal.payout_percent}% payout</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{formatCurrency(signal.base_amount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {signal.trading_result && (
                          <div className="text-center">
                            <Badge 
                              className={`mb-1 ${
                                signal.trading_result === 'win' 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {signal.trading_result.toUpperCase()}
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
                              {(signal.total_profit || 0) >= 0 ? '+' : ''}{(((signal.total_profit || 0) / signal.base_amount) * 100).toFixed(1)}%
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