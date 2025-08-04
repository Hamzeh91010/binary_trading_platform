'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/layout/Header';
import PremiumSignalsTable from '@/components/signals/PremiumSignalsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import ProfitLineChart from '@/components/charts/ProfitLineChart';
import TradePieChart from '@/components/charts/TradePieChart';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Download, TrendingUp, Target, DollarSign, Activity, Database, BarChart3, Hash, Radio, Timer, Clock, TrendingDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Signal } from '@/lib/types';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Filter } from 'lucide-react';
import { signalsApi } from '@/lib/api';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedPair, setSelectedPair] = useState('all');
  const [selectedResult, setSelectedResult] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [allSignals, setAllSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all signals from the database
  const fetchAllSignals = async () => {
    setIsLoading(true);
    try {
      const response = await signalsApi.getAllSignals();
      const signals = response.data || [];
      setAllSignals(signals);
      
      // If no date range is selected, show all signals
      if (!dateRange?.from && !dateRange?.to) {
        setFilteredSignals(signals);
      }
      
      toast.success('Signals data loaded successfully');
    } catch (error) {
      console.error('Failed to fetch signals:', error);
      // Use mock data as fallback
      const mockSignals = [
        {
          message_id: 1001,
          channel_type: 'telegram',
          received_at: '2024-01-15 13:45:00',
          pair: 'EUR/USD',
          base_amount: 25,
          entry_time: '14:30',
          end_time: '14:35',
          martingale_times: ['14:35', '14:40', '14:45'],
          martingale_amounts: [25, 50, 100],
          is_available_martingale_level: 3,
          direction: 'BUY',
          trade_duration: '5 minutes',
          is_otc: false,
          is_status: 'completed',
          trading_result: 'win',
          payout_percent: 85,
          trade_level: 0,
          total_profit: 21.25,
          total_staked: 25,
          raw_text: 'EUR/USD BUY 14:30',
          is_executed: true,
        },
        {
          message_id: 1002,
          channel_type: 'telegram',
          received_at: '2024-01-15 12:30:00',
          pair: 'GBP/USD',
          base_amount: 30,
          entry_time: '13:00',
          end_time: '13:05',
          martingale_times: ['13:05', '13:10', '13:15'],
          martingale_amounts: [30, 60, 120],
          is_available_martingale_level: 3,
          direction: 'SELL',
          trade_duration: '5 minutes',
          is_otc: false,
          is_status: 'completed',
          trading_result: 'loss',
          payout_percent: 80,
          trade_level: 1,
          total_profit: -30,
          total_staked: 30,
          raw_text: 'GBP/USD SELL 13:00',
          is_executed: true,
        },
        {
          message_id: 1003,
          channel_type: 'telegram',
          received_at: '2024-01-15 11:15:00',
          pair: 'USD/JPY',
          base_amount: 20,
          entry_time: '11:45',
          end_time: '11:50',
          martingale_times: ['11:50', '11:55', '12:00'],
          martingale_amounts: [20, 40, 80],
          is_available_martingale_level: 3,
          direction: 'BUY',
          trade_duration: '5 minutes',
          is_otc: false,
          is_status: 'completed',
          trading_result: 'win',
          payout_percent: 82,
          trade_level: 0,
          total_profit: 16.40,
          total_staked: 20,
          raw_text: 'USD/JPY BUY 11:45',
          is_executed: true,
        },
        {
          message_id: 1004,
          channel_type: 'telegram',
          received_at: '2024-01-14 15:20:00',
          pair: 'Apple OTC',
          base_amount: 35,
          entry_time: '15:30',
          end_time: '15:35',
          martingale_times: ['15:35', '15:40', '15:45'],
          martingale_amounts: [35, 70, 140],
          is_available_martingale_level: 3,
          direction: 'BUY',
          trade_duration: '5 minutes',
          is_otc: true,
          is_status: 'completed',
          trading_result: 'win',
          payout_percent: 78,
          trade_level: 0,
          total_profit: 27.30,
          total_staked: 35,
          raw_text: 'Apple OTC BUY 15:30',
          is_executed: true,
        },
        {
          message_id: 1005,
          channel_type: 'telegram',
          received_at: '2024-01-14 14:10:00',
          pair: 'EUR/USD',
          base_amount: 25,
          entry_time: '14:25',
          end_time: '14:30',
          martingale_times: ['14:30', '14:35', '14:40'],
          martingale_amounts: [25, 50, 100],
          is_available_martingale_level: 3,
          direction: 'SELL',
          trade_duration: '5 minutes',
          is_otc: false,
          is_status: 'completed',
          trading_result: 'loss',
          payout_percent: 85,
          trade_level: 0,
          total_profit: -25,
          total_staked: 25,
          raw_text: 'EUR/USD SELL 14:25',
          is_executed: true,
        },
      ];
      setAllSignals(mockSignals);
      setFilteredSignals(mockSignals);
      toast.error('Using demo data - backend not connected');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter signals based on date range and other filters
  useEffect(() => {
    let filtered = [...allSignals];

    // Apply date range filter
    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(signal => {
        const signalDate = new Date(signal.received_at);
        const fromDate = dateRange?.from ? new Date(dateRange.from) : null;
        const toDate = dateRange?.to ? new Date(dateRange.to) : null;

        // Set time to start/end of day for proper comparison
        if (fromDate) {
          fromDate.setHours(0, 0, 0, 0);
        }
        if (toDate) {
          toDate.setHours(23, 59, 59, 999);
        }

        if (fromDate && toDate) {
          return signalDate >= fromDate && signalDate <= toDate;
        } else if (fromDate) {
          return signalDate >= fromDate;
        } else if (toDate) {
          return signalDate <= toDate;
        }
        return true;
      });
    }

    // Apply pair filter
    if (selectedPair !== 'all') {
      filtered = filtered.filter(signal => signal.pair === selectedPair);
    }

    // Apply result filter
    if (selectedResult !== 'all') {
      filtered = filtered.filter(signal => signal.trading_result === selectedResult);
    }

    setFilteredSignals(filtered);
  }, [allSignals, dateRange, selectedPair, selectedResult]);

  // Calculate statistics from filtered signals
  const stats = useMemo(() => {
    const totalTrades = filteredSignals.length;
    const completedTrades = filteredSignals.filter(s => s.is_status === 'completed');
    const winningTrades = completedTrades.filter(s => s.trading_result === 'win');
    const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0;
    const totalProfit = filteredSignals.reduce((sum, signal) => sum + (signal.total_profit || 0), 0);
    const avgPayout = filteredSignals.length > 0 
      ? filteredSignals.reduce((sum, signal) => sum + (signal.payout_percent || 0), 0) / filteredSignals.length 
      : 0;
    
    // Find most traded pair
    const pairCounts = filteredSignals.reduce((acc, signal) => {
      acc[signal.pair] = (acc[signal.pair] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostTradedPair = Object.entries(pairCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    // Find biggest win
    const biggestWin = Math.max(...filteredSignals.map(s => s.total_profit || 0), 0);

    return {
      totalTrades,
      winRate,
      totalProfit,
      avgPayout,
      mostTradedPair,
      biggestWin
    };
  }, [filteredSignals]);

  // Generate chart data from filtered signals
  const chartData = useMemo(() => {
    const dailyData = filteredSignals.reduce((acc, signal) => {
      const date = signal.received_at.split(' ')[0]; // Get date part
      if (!acc[date]) {
        acc[date] = { date, profit: 0, trades: 0 };
      }
      acc[date].profit += signal.total_profit || 0;
      acc[date].trades += 1;
      return acc;
    }, {} as Record<string, { date: string; profit: number; trades: number }>);

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSignals]);

  // Generate pie chart data from filtered signals
  const pieData = useMemo(() => {
    const completedTrades = filteredSignals.filter(s => s.is_status === 'completed');
    const wins = completedTrades.filter(s => s.trading_result === 'win').length;
    const losses = completedTrades.filter(s => s.trading_result === 'loss').length;
    const draws = completedTrades.filter(s => s.trading_result === 'draw').length;
    const pending = filteredSignals.filter(s => s.is_status === 'pending').length;

    return [
      { name: 'Wins', value: wins, color: '#10b981' },
      { name: 'Losses', value: losses, color: '#ef4444' },
      { name: 'Draws', value: draws, color: '#f59e0b' },
      { name: 'Pending', value: pending, color: '#6b7280' },
    ].filter(item => item.value > 0); // Only show categories with data
  }, [filteredSignals]);

  // Load data on component mount
  useEffect(() => {
    fetchAllSignals();
  }, []);

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    
    if (newDateRange?.from || newDateRange?.to) {
      const fromStr = newDateRange?.from?.toLocaleDateString() || 'start';
      const toStr = newDateRange?.to?.toLocaleDateString() || 'end';
      toast.success(`Date range updated: ${fromStr} to ${toStr}`);
    } else {
      toast.info('Date range cleared - showing all data');
    }
  };

  const handleUpdateSignal = (messageId: number, data: Partial<Signal>) => {
    setFilteredSignals(prev => 
      prev.map(signal => 
        signal.message_id === messageId ? { ...signal, ...data } : signal
      )
    );
    setAllSignals(prev => 
      prev.map(signal => 
        signal.message_id === messageId ? { ...signal, ...data } : signal
      )
    );
    toast.success('Signal updated successfully');
  };

  const handleDeleteSignal = (messageId: number) => {
    setFilteredSignals(prev => prev.filter(signal => signal.message_id !== messageId));
    setAllSignals(prev => prev.filter(signal => signal.message_id !== messageId));
    toast.success('Signal deleted successfully');
  };

  const handleViewDetails = (signal: Signal) => {
    setSelectedSignal(signal);
    setIsDetailsDialogOpen(true);
  };

  const handleEdit = (signal: Signal) => {
    // For reports page, we can redirect to signals page for editing
    // or implement inline editing here
    toast.info('Edit functionality would redirect to signals page');
  };

  // Helper function to get martingale times array
  const getMartingaleTimes = (signal: Signal): string[] => {
    if (typeof signal.martingale_times === 'string') {
      return signal.martingale_times.split(',').map(t => t.trim());
    }
    return Array.isArray(signal.martingale_times) ? signal.martingale_times : [];
  };

  // Helper function to get martingale amounts array
  const getMartingaleAmounts = (signal: Signal): number[] => {
    if (typeof signal.martingale_amounts === 'string') {
      try {
        return JSON.parse(signal.martingale_amounts);
      } catch {
        return [];
      }
    }
    return Array.isArray(signal.martingale_amounts) ? signal.martingale_amounts : [];
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    const dateRangeStr = dateRange?.from && dateRange?.to 
      ? `_${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
      : '';
    const filename = `trading_report${dateRangeStr}_${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (format === 'csv') {
      const headers = ['ID', 'Date', 'Pair', 'Direction', 'Amount', 'Result', 'Profit', 'Status'];
      const csvData = [
        headers,
        ...filteredSignals.map(signal => [
          signal.message_id.toString(),
          signal.received_at,
          signal.pair,
          signal.direction,
          signal.base_amount.toString(),
          signal.trading_result || '',
          signal.total_profit.toString(),
          signal.is_status
        ])
      ];
      
      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } else {
      toast.info('PDF export functionality would be implemented here');
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Reports & Analytics" 
          subtitle="Comprehensive trading performance analysis with advanced insights"
          onRefresh={fetchAllSignals}
          isLoading={isLoading}
        />

        {/* Header Section */}
        <div className="space-y-4">
          <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 dark:text-purple-200">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Advanced Analytics:</strong> Real-time performance tracking and detailed reporting
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Live Data</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      
        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              <span>Filters</span>
            </CardTitle>
            <CardDescription>Customize your report view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange date={dateRange} setDate={handleDateRangeChange} />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Currency Pair</label>
                <Select value={selectedPair} onValueChange={setSelectedPair}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pairs</SelectItem>
                    {[...new Set(allSignals.map(s => s.pair))].map(pair => (
                      <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Result</label>
                <Select value={selectedResult} onValueChange={setSelectedResult}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="win">Wins</SelectItem>
                    <SelectItem value="loss">Losses</SelectItem>
                    <SelectItem value="draw">Draws</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-end space-y-2">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" onClick={() => handleExport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Trades</CardTitle>
              <Activity className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTrades}</div>
              <p className="text-xs opacity-80 mt-1">
                {dateRange?.from && dateRange?.to 
                  ? `From ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`
                  : 'All time data'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Win Rate</CardTitle>
              <Target className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPercent(stats.winRate)}</div>
              <p className="text-xs opacity-80 mt-1">
                {filteredSignals.filter(s => s.is_status === 'completed').length} completed trades
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Profit</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.totalProfit)}</div>
              <p className="text-xs opacity-80 mt-1">
                Biggest win: {formatCurrency(stats.biggestWin)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Avg Payout</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPercent(stats.avgPayout)}</div>
              <p className="text-xs opacity-80 mt-1">
                Most traded: {stats.mostTradedPair}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Profit Over Time</span>
              </CardTitle>
              <CardDescription>
                Daily profit/loss trend 
                {dateRange?.from && dateRange?.to && (
                  <span className="text-blue-600 dark:text-blue-400 ml-2">
                    ({dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ProfitLineChart data={chartData} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for selected date range</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Win/Loss Distribution</span>
              </CardTitle>
              <CardDescription>
                Trade outcome breakdown
                {dateRange?.from && dateRange?.to && (
                  <span className="text-blue-600 dark:text-blue-400 ml-2">
                    ({dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()})
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <TradePieChart data={pieData} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for selected date range</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Premium Trading Results Table */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-500" />
              <span>All Signals Database</span>
            </CardTitle>
            <CardDescription>
              Complete trading history from all_signals table with advanced filtering and analysis
              {dateRange?.from && dateRange?.to && (
                <span className="text-blue-600 dark:text-blue-400 ml-2">
                  - Filtered: {dateRange.from.toLocaleDateString()} to {dateRange.to.toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">Data Source: all_signals table</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Showing {filteredSignals.length} signals with comprehensive filtering, sorting, and export capabilities
                {dateRange?.from && dateRange?.to && (
                  <span className="block mt-1">
                    Date range: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            
            <PremiumSignalsTable 
              signals={filteredSignals}
              onUpdateSignal={handleUpdateSignal}
              onDeleteSignal={handleDeleteSignal}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
            />
          </CardContent>
        </Card>

        {/* View Details Modal */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center space-x-2">
                    <Hash className="h-5 w-5 text-blue-500" />
                    <span>Signal Details #{selectedSignal?.message_id}</span>
                  </DialogTitle>
                  <DialogDescription>
                    Complete trading signal information and performance metrics
                  </DialogDescription>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </DialogHeader>
            
            {selectedSignal && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Hash className="h-5 w-5 text-blue-500" />
                        <span>Basic Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Message ID:</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">#{selectedSignal.message_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Channel Type:</span>
                        <Badge variant="outline">{selectedSignal.channel_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Received At:</span>
                        <span className="text-sm font-mono">{selectedSignal.received_at}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Currency Pair:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{selectedSignal.pair}</span>
                          {selectedSignal.is_otc && <Badge variant="secondary">OTC</Badge>}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Direction:</span>
                        <div className="flex items-center space-x-2">
                          {selectedSignal.direction === 'BUY' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={selectedSignal.direction === 'BUY' ? 'default' : 'destructive'}>
                            {selectedSignal.direction}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Trade Duration:</span>
                        <span className="text-sm">{selectedSignal.trade_duration}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trading Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span>Trading Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Base Amount:</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedSignal.base_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Entry Time:</span>
                        <span className="text-lg font-mono font-bold">{selectedSignal.entry_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">End Time:</span>
                        <span className="text-sm font-mono">{selectedSignal.end_time || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Payout Percentage:</span>
                        <span className="font-medium text-purple-600">{selectedSignal.payout_percent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Staked:</span>
                  {/* Martingale Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span>Martingale Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Available Levels:</span>
                        <Badge variant="outline">{selectedSignal.is_available_martingale_level}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Trade Level:</span>
                        <Badge variant="outline">{selectedSignal.trade_level}</Badge>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Martingale Times:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getMartingaleTimes(selectedSignal).map((time, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Martingale Amounts:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getMartingaleAmounts(selectedSignal).map((amount, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {formatCurrency(amount)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                        <span className="font-medium text-blue-600">{formatCurrency(selectedSignal.total_staked)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Martingale Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        <span>Martingale Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Available Levels:</span>
                        <Badge variant="outline">{selectedSignal.is_available_martingale_level}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Trade Level:</span>
                        <Badge variant="outline">{selectedSignal.trade_level}</Badge>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Martingale Times:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getMartingaleTimes(selectedSignal).map((time, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Martingale Amounts:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getMartingaleAmounts(selectedSignal).map((amount, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {formatCurrency(amount)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status & Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        <span>Status & Results</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Status:</span>
                        <Badge className={`${
                          selectedSignal.is_status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' :
                          selectedSignal.is_status === 'pending' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                          selectedSignal.is_status === 'processing' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                          'bg-gray-600 text-white hover:bg-gray-700'
                        }`}>
                          {selectedSignal.is_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Trading Result:</span>
                        {selectedSignal.trading_result ? (
                          <Badge className={`${
                            selectedSignal.trading_result === 'win' 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : selectedSignal.trading_result === 'loss'
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-yellow-600 text-white hover:bg-yellow-700'
                          }`}>
                            {selectedSignal.trading_result.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Executed:</span>
                        <Badge variant={selectedSignal.is_executed ? 'default' : 'secondary'}>
                          {selectedSignal.is_executed ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">OTC Asset:</span>
                        <Badge variant={selectedSignal.is_otc ? 'default' : 'secondary'}>
                          {selectedSignal.is_otc ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-emerald-500" />
                      <span>Financial Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${selectedSignal.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(selectedSignal.total_profit)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Profit</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedSignal.total_staked)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Staked</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${
                          selectedSignal.total_staked > 0 
                            ? (selectedSignal.total_profit / selectedSignal.total_staked) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {selectedSignal.total_staked > 0 
                            ? `${((selectedSignal.total_profit / selectedSignal.total_staked) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedSignal.payout_percent}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Payout Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Raw Signal Text */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Radio className="h-5 w-5 text-gray-500" />
                      <span>Raw Signal Text</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 dark:bg-gray-800 text-green-400 dark:text-green-300 p-4 rounded-lg font-mono text-sm max-h-32 overflow-y-auto">
                      {selectedSignal.raw_text || 'No raw text available'}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Timer className="h-5 w-5 text-indigo-500" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Timing Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Signal Received:</span>
                            <span className="font-mono">{new Date(selectedSignal.received_at).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Entry Time:</span>
                            <span className="font-mono font-bold">{selectedSignal.entry_time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">End Time:</span>
                            <span className="font-mono">{selectedSignal.end_time || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                            <span>{selectedSignal.trade_duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Trade Execution</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Execution Status:</span>
                            <Badge variant={selectedSignal.is_executed ? 'default' : 'secondary'}>
                              {selectedSignal.is_executed ? 'Executed' : 'Not Executed'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Trade Level:</span>
                            <span>Level {selectedSignal.trade_level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Max Martingale:</span>
                            <span>{selectedSignal.is_available_martingale_level} levels</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Asset Type:</span>
                            <Badge variant={selectedSignal.is_otc ? 'default' : 'outline'}>
                              {selectedSignal.is_otc ? 'OTC' : 'Regular'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}