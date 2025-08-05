'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PremiumSignalsTable from '@/components/signals/PremiumSignalsTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Radio } from 'lucide-react';
import { Signal } from '@/lib/types';
import { signalsApi } from '@/lib/api';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { 
  Plus, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Clock,
  AlertCircle,
  BarChart3,
  Zap,
  RefreshCw,
  Database,
  Eye,
  Save,
  X,
  Lock,
  Hash,
  Timer,
  Calendar,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';

export default function SignalsPage() {
  const { theme, setTheme } = useTheme();
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [allSignals, setAllSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New signal received: EUR/USD BUY', time: '2 min ago', unread: true },
    { id: 2, message: 'Trade completed: GBP/USD WIN +$21.25', time: '5 min ago', unread: true },
    { id: 3, message: 'Signal expired: USD/JPY', time: '10 min ago', unread: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editData, setEditData] = useState<Partial<Signal>>({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newSignal, setNewSignal] = useState({
    pair: '',
    base_amount: 25,
    entry_time: '',
    direction: 'BUY' as 'BUY' | 'SELL',
    trade_duration: '5 minutes',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSignals, setModalSignals] = useState<Signal[]>([]);
  const [modalType, setModalType] = useState<'winners' | 'losses' | 'pending'>('winners');

  useEffect(() => {
    fetchSignals();
    // Update current time every second for edit restrictions
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSignals = async () => {
    setIsLoading(true);
    try {
      // For now, use mock data. Replace with actual API call when backend is ready
      const response_today = await signalsApi.getTodaySignals();
      const response_all = await signalsApi.getAllSignals();
      setLiveSignals(response_today.data.filter(s => ['pending', 'processing'].includes(s.is_status)));
      setAllSignals(response_all.data);
      // setLiveSignals(mockLiveSignals);
      // setAllSignals(mockAllSignals);
      toast.success('Signals loaded successfully');
    } catch (error) {
      console.error('Failed to fetch signals:', error);
      toast.error('Failed to fetch signals, showing demo data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSignal = async (messageId: number, data: Partial<Signal>) => {
    try {
      // await signalsApi.updateSignal(messageId, data);
      
      // Update both live and all signals
      setLiveSignals(prev => prev.map(signal => 
        signal.message_id === messageId ? { ...signal, ...data } : signal
      ));
      setAllSignals(prev => prev.map(signal => 
        signal.message_id === messageId ? { ...signal, ...data } : signal
      ));
      toast.success('Signal updated successfully');
    } catch (error) {
      console.error('Failed to update signal:', error);
      toast.error('Failed to update signal');
    }
  };

  const handleDeleteSignal = async (messageId: number) => {
    try {
      // await signalsApi.deleteSignal(messageId);
      setLiveSignals(prev => prev.filter(signal => signal.message_id !== messageId));
      setAllSignals(prev => prev.filter(signal => signal.message_id !== messageId));
      toast.success('Signal deleted successfully');
    } catch (error) {
      console.error('Failed to delete signal:', error);
      toast.error('Failed to delete signal');
    }
  };

  const handleViewWinners = () => {
    const winnerSignals = allSignals.filter(signal => signal.trading_result === 'win');
    setModalSignals(winnerSignals);
    setModalTitle('Winning Signals');
    setModalType('winners');
    setIsModalOpen(true);
  };

  const handleViewLosses = () => {
    const lossSignals = allSignals.filter(signal => signal.trading_result === 'loss');
    setModalSignals(lossSignals);
    setModalTitle('Losing Signals');
    setModalType('losses');
    setIsModalOpen(true);
  };

  const handleViewPending = () => {
    const pendingSignals = allSignals.filter(signal => 
      signal.is_status === 'pending' || signal.is_status === 'processing'
    );
    setModalSignals(pendingSignals);
    setModalTitle('Pending Signals');
    setModalType('pending');
    setIsModalOpen(true);
  };

  const handleViewDetails = (signal: Signal) => {
    setSelectedSignal(signal);
    setIsDetailsDialogOpen(true);
  };

  const handleEdit = (signal: Signal) => {
    setSelectedSignal(signal);
    setEditData({
      pair: signal.pair,
      base_amount: signal.base_amount,
      entry_time: signal.entry_time,
      direction: signal.direction,
      trade_duration: signal.trade_duration,
      martingale_amounts: signal.martingale_amounts,
      is_available_martingale_level: signal.is_available_martingale_level,
    });
    setIsEditDialogOpen(true);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleSaveEdit = async () => {
    if (selectedSignal && editData) {
      await handleUpdateSignal(selectedSignal.message_id, editData);
      setIsEditDialogOpen(false);
      setSelectedSignal(null);
      setEditData({});
      toast.success('Signal updated successfully');
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedSignal(null);
    setEditData({});
  };

  const handleAddSignal = async () => {
    try {
      const signal: Signal = {
        message_id: Date.now(),
        channel_type: 'manual',
        received_at: new Date().toISOString(),
        ...newSignal,
        end_time: '',
        martingale_times: [],
        martingale_amounts: [],
        is_available_martingale_level: 3,
        is_otc: newSignal.pair.toLowerCase().includes('otc'),
        is_status: 'pending',
        trading_result: undefined,
        payout_percent: 80,
        trade_level: 0,
        total_profit: 0,
        total_staked: 0,
        raw_text: `${newSignal.pair} ${newSignal.direction} ${newSignal.entry_time}`,
        is_executed: false,
      };

      // await signalsApi.addSignal(signal);
      setLiveSignals(prev => [signal, ...prev]);
      setAllSignals(prev => [signal, ...prev]);
      setIsAddDialogOpen(false);
      setNewSignal({
        pair: '',
        base_amount: 25,
        entry_time: '',
        direction: 'BUY',
        trade_duration: '5 minutes',
      });
      toast.success('Signal added successfully');
    } catch (error) {
      console.error('Failed to add signal:', error);
      toast.error('Failed to add signal');
    }
  };

  // Helper function to check if a time has passed (with 10-second buffer)
  const isTimePassed = (timeStr: string, bufferSeconds: number = 10): boolean => {
    if (!timeStr) return false;
    
    const now = currentTime;
    const today = now.toISOString().split('T')[0];
    const targetTime = new Date(`${today}T${timeStr}:00`);
    const bufferTime = new Date(targetTime.getTime() - bufferSeconds * 1000);
    
    return now >= bufferTime;
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

  // Check which fields can be edited based on current time
  const getEditableFields = (signal: Signal) => {
    const entryTimePassed = isTimePassed(signal.entry_time);
    const martingaleTimes = getMartingaleTimes(signal);
    
    return {
      canEditBasic: !entryTimePassed, // Can edit basic info if entry time hasn't passed
      canEditMartingale1: !isTimePassed(martingaleTimes[0]),
      canEditMartingale2: !isTimePassed(martingaleTimes[1]),
      canEditMartingale3: !isTimePassed(martingaleTimes[2]),
    };
  };

  // Calculate statistics for all signals
  const allStats = {
    total: allSignals.length,
    pending: allSignals.filter(s => s.is_status === 'pending').length,
    processing: allSignals.filter(s => s.is_status === 'processing').length,
    completed: allSignals.filter(s => s.is_status === 'completed').length,
    wins: allSignals.filter(s => s.trading_result === 'win').length,
    losses: allSignals.filter(s => s.trading_result === 'loss').length,
    totalProfit: allSignals.reduce((sum, s) => sum + (s.total_profit || 0), 0),
    winRate: allSignals.filter(s => s.trading_result).length > 0 
      ? (allSignals.filter(s => s.trading_result === 'win').length / allSignals.filter(s => s.trading_result).length) * 100 
      : 0,
  };

  // Calculate statistics for live signals only
  const liveStats = {
    total: liveSignals.length,
    pending: liveSignals.filter(s => s.is_status === 'pending').length,
    processing: liveSignals.filter(s => s.is_status === 'processing').length,
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Trading Signals" 
          subtitle="Monitor and manage your trading signals with real-time updates"
          onRefresh={fetchSignals}
          isLoading={isLoading}
        />

        {/* Header Section */}
        <div className="space-y-4">
          {showNotifications && (
            <div className="relative">
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 backdrop-blur-md">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={fetchSignals}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-gray-200 dark:border-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Signal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Signal</DialogTitle>
                  <DialogDescription>
                    Create a manual trading signal
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pair">Currency Pair</Label>
                    <Input
                      id="pair"
                      value={newSignal.pair}
                      onChange={(e) => setNewSignal({ ...newSignal, pair: e.target.value })}
                      placeholder="EUR/USD"
                    />
                  </div>
                  <div>
                    <Label htmlFor="direction">Direction</Label>
                    <Select value={newSignal.direction} onValueChange={(value: 'BUY' | 'SELL') => setNewSignal({ ...newSignal, direction: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="base_amount">Base Amount</Label>
                    <Input
                      id="base_amount"
                      type="number"
                      value={newSignal.base_amount}
                      onChange={(e) => setNewSignal({ ...newSignal, base_amount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="entry_time">Entry Time</Label>
                    <Input
                      id="entry_time"
                      type="time"
                      value={newSignal.entry_time}
                      onChange={(e) => setNewSignal({ ...newSignal, entry_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trade_duration">Trade Duration</Label>
                    <Select value={newSignal.trade_duration} onValueChange={(value) => setNewSignal({ ...newSignal, trade_duration: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 seconds">30 seconds</SelectItem>
                        <SelectItem value="1 minutes">1 minute</SelectItem>
                        <SelectItem value="3 minutes">3 minutes</SelectItem>
                        <SelectItem value="5 minutes">5 minutes</SelectItem>
                        <SelectItem value="15 minutes">15 minutes</SelectItem>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddSignal} className="w-full">
                    Add Signal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alert Section */}
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Radio className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Live Signal Processing:</strong> Real-time signal monitoring and execution
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Signals</CardTitle>
              <Activity className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{allStats.total}</div>
              <p className="text-xs opacity-80 mt-1">
                {allStats.pending} pending • {allStats.processing} processing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Win Rate</CardTitle>
              <Target className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPercent(allStats.winRate)}</div>
              <p className="text-xs opacity-80 mt-1">
                {allStats.wins} wins • {allStats.losses} losses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Profit</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(allStats.totalProfit)}</div>
              <p className="text-xs opacity-80 mt-1">
                From {allStats.completed} completed trades
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Live Signals</CardTitle>
              <Zap className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{liveStats.total}</div>
              <p className="text-xs opacity-80 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Manage your trading signals efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={handleViewWinners}
              >
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm">View Winners</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleViewLosses}
              >
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm">View Losses</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col space-y-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                onClick={handleViewPending}
              >
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">Pending Signals</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Trading Signals Table */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                  <span>Live Trading Signals</span>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Real-time signal monitoring with advanced editing capabilities
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                Live Updates
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <PremiumSignalsTable 
              signals={liveSignals}
              onUpdateSignal={handleUpdateSignal}
              onDeleteSignal={handleDeleteSignal}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
            />
          </CardContent>
        </Card>

        {/* All Trading Signals Table */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Database className="h-6 w-6 text-purple-600" />
                  <span>Trading Signals</span>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Manage and monitor your trading signals with real-time updates
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1">
                  <Eye className="w-3 h-3 mr-1" />
                  All Signals
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1">
                  {allStats.total} Total
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <PremiumSignalsTable 
              signals={allSignals}
              onUpdateSignal={handleUpdateSignal}
              onDeleteSignal={handleDeleteSignal}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
            />
          </CardContent>
        </Card>

        {/* Signal Filter Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center space-x-2">
                    {modalType === 'winners' && <TrendingUp className="h-5 w-5 text-green-500" />}
                    {modalType === 'losses' && <TrendingDown className="h-5 w-5 text-red-500" />}
                    {modalType === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                    <span>{modalTitle}</span>
                  </DialogTitle>
                  <DialogDescription>
                    {modalType === 'winners' && 'All signals that resulted in profitable trades'}
                    {modalType === 'losses' && 'All signals that resulted in losing trades'}
                    {modalType === 'pending' && 'All signals that are currently pending or being processed'}
                  </DialogDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${
                    modalType === 'winners' ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' :
                    modalType === 'losses' ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' :
                    'border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                  }`}
                >
                  {modalSignals.length} signals
                </Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Summary Stats for Modal */}
              {modalType === 'winners' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(modalSignals.reduce((sum, signal) => sum + (signal.total_profit || 0), 0))}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Total Profit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {modalSignals.length > 0 ? (modalSignals.reduce((sum, signal) => sum + (signal.total_profit || 0), 0) / modalSignals.length).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Avg Profit per Trade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {modalSignals.length > 0 ? Math.max(...modalSignals.map(s => s.total_profit || 0)).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Best Trade</div>
                  </div>
                </div>
              )}
              
              {modalType === 'losses' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(modalSignals.reduce((sum, signal) => sum + (signal.total_profit || 0), 0))}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">Total Loss</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {modalSignals.length > 0 ? (modalSignals.reduce((sum, signal) => sum + (signal.total_profit || 0), 0) / modalSignals.length).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">Avg Loss per Trade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {modalSignals.length > 0 ? Math.min(...modalSignals.map(s => s.total_profit || 0)).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">Worst Trade</div>
                  </div>
                </div>
              )}
              
              {modalType === 'pending' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {modalSignals.filter(s => s.is_status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {modalSignals.filter(s => s.is_status === 'processing').length}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(modalSignals.reduce((sum, signal) => sum + (signal.base_amount || 0), 0))}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Total Amount at Risk</div>
                  </div>
                </div>
              )}

              {/* Enhanced Signal Table for Modal */}
              {modalSignals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-500/10 rounded-full blur-xl"></div>
                    {modalType === 'winners' && <TrendingUp className="relative h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />}
                    {modalType === 'losses' && <TrendingDown className="relative h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />}
                    {modalType === 'pending' && <Clock className="relative h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No {modalType} signals found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {modalType === 'winners' && 'No winning trades to display'}
                    {modalType === 'losses' && 'No losing trades to display'}
                    {modalType === 'pending' && 'No pending or processing signals'}
                  </p>
                </div>
              ) : (
                <PremiumSignalsTable 
                  signals={modalSignals}
                  onUpdateSignal={handleUpdateSignal}
                  onDeleteSignal={handleDeleteSignal}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEdit}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Signal Details #{selectedSignal?.message_id}</DialogTitle>
                <DialogDescription>
                  Complete information for this trading signal
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
                        selectedSignal.is_status === 'completed' ? 'bg-green-600 text-white' :
                        selectedSignal.is_status === 'processing' ? 'bg-blue-600 text-white' :
                        selectedSignal.is_status === 'pending' ? 'bg-yellow-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {selectedSignal.is_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trading Result:</span>
                      {selectedSignal.trading_result ? (
                        <Badge variant={selectedSignal.trading_result === 'win' ? 'default' : 'destructive'}>
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

                {/* Financial Summary */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-emerald-500" />
                      <span>Financial Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </div>
                  </CardContent>
                </Card>

                {/* Raw Signal Text */}
                <Card className="md:col-span-2">
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Signal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Edit Signal #{selectedSignal?.message_id}</DialogTitle>
                <DialogDescription>
                  Modify signal parameters before execution
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
              {/* Editing Rules Info */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Editing Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Fields lock 10 seconds before execution time</li>
                      <li>Past entry times and martingale levels cannot be edited</li>
                      <li>Payout percentage is fixed and cannot be changed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {(() => {
                const editableFields = getEditableFields(selectedSignal);
                const martingaleTimes = getMartingaleTimes(selectedSignal);
                const martingaleAmounts = getMartingaleAmounts(selectedSignal);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Signal Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="pair">Currency Pair</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="pair"
                              value={editData.pair || ''}
                              onChange={(e) => setEditData({ ...editData, pair: e.target.value })}
                              disabled={!editableFields.canEditBasic}
                              className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            />
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {!editableFields.canEditBasic && (
                            <p className="text-xs text-red-500 mt-1">Entry time has passed</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="direction">Direction</Label>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={editData.direction || ''} 
                              onValueChange={(value: 'BUY' | 'SELL') => setEditData({ ...editData, direction: value })}
                              disabled={!editableFields.canEditBasic}
                            >
                              <SelectTrigger className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BUY">BUY</SelectItem>
                                <SelectItem value="SELL">SELL</SelectItem>
                              </SelectContent>
                            </Select>
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="entry_time">Entry Time</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="entry_time"
                              type="time"
                              value={editData.entry_time || ''}
                              onChange={(e) => setEditData({ ...editData, entry_time: e.target.value })}
                              disabled={!editableFields.canEditBasic}
                              className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            />
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="trade_duration">Trade Duration</Label>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={editData.trade_duration || ''} 
                              onValueChange={(value) => setEditData({ ...editData, trade_duration: value })}
                              disabled={!editableFields.canEditBasic}
                            >
                              <SelectTrigger className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30 seconds">30 seconds</SelectItem>
                                <SelectItem value="1 minutes">1 minute</SelectItem>
                                <SelectItem value="3 minutes">3 minutes</SelectItem>
                                <SelectItem value="5 minutes">5 minutes</SelectItem>
                                <SelectItem value="15 minutes">15 minutes</SelectItem>
                                <SelectItem value="30 minutes">30 minutes</SelectItem>
                                <SelectItem value="1 hour">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="payout_percent">Payout Percentage</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="payout_percent"
                              type="number"
                              value={selectedSignal.payout_percent}
                              disabled
                              className="bg-gray-100 dark:bg-gray-800"
                            />
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Payout percentage cannot be edited</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Martingale Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Martingale Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="martingale_levels">Available Martingale Levels</Label>
                          <Select 
                            value={editData.is_available_martingale_level?.toString() || ''} 
                            onValueChange={(value) => setEditData({ ...editData, is_available_martingale_level: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Level</SelectItem>
                              <SelectItem value="2">2 Levels</SelectItem>
                              <SelectItem value="3">3 Levels</SelectItem>
                              <SelectItem value="4">4 Levels</SelectItem>
                              <SelectItem value="5">5 Levels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Martingale Times Display */}
                        <div>
                          <Label>Martingale Execution Times</Label>
                          <div className="space-y-2 mt-2">
                            {martingaleTimes.map((time, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm">Level {index + 1}: {time}</span>
                                {isTimePassed(time) ? (
                                  <Lock className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Base Amount */}
                        <div>
                          <Label htmlFor="base_amount">Base Amount</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="base_amount"
                              type="number"
                              step="0.01"
                              value={editData.base_amount || ''}
                              onChange={(e) => setEditData({ ...editData, base_amount: parseFloat(e.target.value) })}
                              disabled={!editableFields.canEditBasic}
                              className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            />
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        {/* Martingale Amounts */}
                        <div className="space-y-3">
                          <Label>Martingale Amounts</Label>
                          
                          {/* Martingale 1 */}
                          <div>
                            <Label htmlFor="mg1" className="text-sm text-gray-600 dark:text-gray-400">Martingale Level 1</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="mg1"
                                type="number"
                                step="0.01"
                                value={martingaleAmounts[1] || ''}
                                onChange={(e) => {
                                  const newAmounts = [...martingaleAmounts];
                                  newAmounts[1] = parseFloat(e.target.value);
                                  setEditData({ ...editData, martingale_amounts: newAmounts });
                                }}
                                disabled={!editableFields.canEditMartingale1}
                                className={!editableFields.canEditMartingale1 ? 'bg-gray-100 dark:bg-gray-800' : ''}
                              />
                              {!editableFields.canEditMartingale1 && (
                                <Lock className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            {!editableFields.canEditMartingale1 && (
                              <p className="text-xs text-red-500 mt-1">Martingale 1 time has passed</p>
                            )}
                          </div>

                          {/* Martingale 2 */}
                          <div>
                            <Label htmlFor="mg2" className="text-sm text-gray-600 dark:text-gray-400">Martingale Level 2</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="mg2"
                                type="number"
                                step="0.01"
                                value={martingaleAmounts[2] || ''}
                                onChange={(e) => {
                                  const newAmounts = [...martingaleAmounts];
                                  newAmounts[2] = parseFloat(e.target.value);
                                  setEditData({ ...editData, martingale_amounts: newAmounts });
                                }}
                                disabled={!editableFields.canEditMartingale2}
                                className={!editableFields.canEditMartingale2 ? 'bg-gray-100 dark:bg-gray-800' : ''}
                              />
                              {!editableFields.canEditMartingale2 && (
                                <Lock className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            {!editableFields.canEditMartingale2 && (
                              <p className="text-xs text-red-500 mt-1">Martingale 2 time has passed</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}