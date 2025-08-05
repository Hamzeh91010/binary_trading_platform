'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Channel } from '@/lib/types';
import { Plus, Edit2, Trash2, Radio, Eye, BarChart3, TrendingUp, TrendingDown, Target, DollarSign, Activity, Hash, Calendar, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { signalsApi } from '@/lib/api';

interface ChannelAnalytics {
  totalSignals: number;
  completedSignals: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
  bestPair: string;
  worstPair: string;
  mostActivePair: string;
  pairDistribution: Array<{ pair: string; count: number; profit: number }>;
  resultDistribution: Array<{ name: string; value: number; color: string }>;
  dailyPerformance: Array<{ date: string; profit: number; signals: number }>;
  recentSignals: Array<any>;
}

interface PermissionChannel {
  id: number;
  channel_type: string;
  channel_name: string;
  chat_id: string;
  status: 'enabled' | 'disabled';
  created_at?: string;
  updated_at?: string;
}
export default function ChannelsPage() {
  const [channels, setChannels] = useState<PermissionChannel[]>([]);
  const [availableChannelTypes, setAvailableChannelTypes] = useState<string[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);

  const [channelSignalCounts, setChannelSignalCounts] = useState<Record<string, number>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<PermissionChannel | null>(null);
  const [channelAnalytics, setChannelAnalytics] = useState<ChannelAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [newChannel, setNewChannel] = useState({
    chat_id: '',
    channel_name: '',
    channel_type: 'telegram',
    status: 'enabled' as 'enabled' | 'disabled'
  });
  const [editingChannel, setEditingChannel] = useState<Partial<PermissionChannel>>({});

  // Fetch channels from permission_channel table
  const fetchChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const response = await channelsApi.getChannels();
      const channelsData = response.data || [];
      setChannels(channelsData);
      
      // Extract unique channel types for the dropdown
      const types = [...new Set(channelsData.map((ch: PermissionChannel) => ch.channel_type))];
      setAvailableChannelTypes(types.length > 0 ? types : ['telegram', 'whatsapp', 'discord']);
      
      toast.success('Channels loaded successfully');
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      // Fallback data
      const fallbackChannels = [
        {
          id: 1,
          chat_id: '-1002846030923',
          channel_name: 'Forex Legend VIP',
          channel_type: 'telegram',
          status: 'enabled' as 'enabled' | 'disabled'
        },
        {
          id: 2,
          chat_id: '-1002721262804',
          channel_name: 'Forex Legend Club 60',
          channel_type: 'telegram',
          status: 'enabled' as 'enabled' | 'disabled'
        },
        {
          id: 3,
          chat_id: '-1002723345001',
          channel_name: 'Premium Signals',
          channel_type: 'telegram',
          status: 'disabled' as 'enabled' | 'disabled'
        }
      ];
      setChannels(fallbackChannels);
      setAvailableChannelTypes(['telegram', 'whatsapp', 'discord']);
      toast.error('Using demo data - backend not connected');
    } finally {
      setIsLoadingChannels(false);
    }
  };
  // Fetch signal counts for each channel
  const fetchChannelSignalCounts = async () => {
    try {
      const response = await signalsApi.getAllSignals();
      const signals = response.data || [];
      
      // Count signals by channel_type
      const counts: Record<string, number> = {};
      signals.forEach((signal: any) => {
        const channelType = signal.channel_type || 'unknown';
        counts[channelType] = (counts[channelType] || 0) + 1;
      });
      
      setChannelSignalCounts(counts);
    } catch (error) {
      console.error('Failed to fetch signal counts:', error);
      // Mock data for demonstration
      setChannelSignalCounts({
        'telegram': 156,
        'whatsapp': 23,
        'discord': 8
      });
    }
  };

  // Fetch detailed analytics for a specific channel
  const fetchChannelAnalytics = async (channel: PermissionChannel) => {
    setIsLoadingAnalytics(true);
    try {
      const response = await signalsApi.getAllSignals();
      const allSignals = response.data || [];
      
      // Filter signals by channel type
      const channelSignals = allSignals.filter((signal: any) => 
        signal.channel_type === channel.channel_type
      );

      if (channelSignals.length === 0) {
        setChannelAnalytics({
          totalSignals: 0,
          completedSignals: 0,
          winRate: 0,
          totalProfit: 0,
          avgProfit: 0,
          bestPair: 'N/A',
          worstPair: 'N/A',
          mostActivePair: 'N/A',
          pairDistribution: [],
          resultDistribution: [],
          dailyPerformance: [],
          recentSignals: []
        });
        return;
      }

      // Calculate analytics
      const completedSignals = channelSignals.filter((s: any) => s.is_status === 'completed');
      const winningSignals = completedSignals.filter((s: any) => s.trading_result === 'win');
      const winRate = completedSignals.length > 0 ? (winningSignals.length / completedSignals.length) * 100 : 0;
      const totalProfit = channelSignals.reduce((sum: number, s: any) => sum + (s.total_profit || 0), 0);
      const avgProfit = channelSignals.length > 0 ? totalProfit / channelSignals.length : 0;

      // Pair analysis
      const pairStats: Record<string, { count: number; profit: number }> = {};
      channelSignals.forEach((signal: any) => {
        const pair = signal.pair;
        if (!pairStats[pair]) {
          pairStats[pair] = { count: 0, profit: 0 };
        }
        pairStats[pair].count++;
        pairStats[pair].profit += signal.total_profit || 0;
      });

      const pairDistribution = Object.entries(pairStats)
        .map(([pair, stats]) => ({ pair, count: stats.count, profit: stats.profit }))
        .sort((a, b) => b.count - a.count);

      const mostActivePair = pairDistribution[0]?.pair || 'N/A';
      const bestPair = pairDistribution.sort((a, b) => b.profit - a.profit)[0]?.pair || 'N/A';
      const worstPair = pairDistribution.sort((a, b) => a.profit - b.profit)[0]?.pair || 'N/A';

      // Result distribution
      const wins = completedSignals.filter((s: any) => s.trading_result === 'win').length;
      const losses = completedSignals.filter((s: any) => s.trading_result === 'loss').length;
      const draws = completedSignals.filter((s: any) => s.trading_result === 'draw').length;
      const pending = channelSignals.filter((s: any) => s.is_status === 'pending').length;

      const resultDistribution = [
        { name: 'Wins', value: wins, color: '#10b981' },
        { name: 'Losses', value: losses, color: '#ef4444' },
        { name: 'Draws', value: draws, color: '#f59e0b' },
        { name: 'Pending', value: pending, color: '#6b7280' },
      ].filter(item => item.value > 0);

      // Daily performance (last 7 days)
      const dailyStats: Record<string, { profit: number; signals: number }> = {};
      channelSignals.forEach((signal: any) => {
        const date = signal.received_at.split(' ')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { profit: 0, signals: 0 };
        }
        dailyStats[date].profit += signal.total_profit || 0;
        dailyStats[date].signals++;
      });

      const dailyPerformance = Object.entries(dailyStats)
        .map(([date, stats]) => ({ date, profit: stats.profit, signals: stats.signals }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7); // Last 7 days

      // Recent signals (last 10)
      const recentSignals = channelSignals
        .sort((a: any, b: any) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())
        .slice(0, 10);

      setChannelAnalytics({
        totalSignals: channelSignals.length,
        completedSignals: completedSignals.length,
        winRate,
        totalProfit,
        avgProfit,
        bestPair,
        worstPair,
        mostActivePair,
        pairDistribution: pairDistribution.slice(0, 10), // Top 10 pairs
        resultDistribution,
        dailyPerformance,
        recentSignals
      });

    } catch (error) {
      console.error('Failed to fetch channel analytics:', error);
      // Mock analytics data
      setChannelAnalytics({
        totalSignals: 156,
        completedSignals: 142,
        winRate: 78.5,
        totalProfit: 2450.75,
        avgProfit: 15.71,
        bestPair: 'EUR/USD',
        worstPair: 'GBP/JPY',
        mostActivePair: 'EUR/USD',
        pairDistribution: [
          { pair: 'EUR/USD', count: 45, profit: 890.25 },
          { pair: 'GBP/USD', count: 32, profit: 567.80 },
          { pair: 'USD/JPY', count: 28, profit: 445.30 },
          { pair: 'AUD/USD', count: 22, profit: 334.50 },
          { pair: 'USD/CAD', count: 15, profit: 212.90 }
        ],
        resultDistribution: [
          { name: 'Wins', value: 111, color: '#10b981' },
          { name: 'Losses', value: 31, color: '#ef4444' },
          { name: 'Pending', value: 14, color: '#6b7280' }
        ],
        dailyPerformance: [
          { date: '2024-01-09', profit: 125.50, signals: 18 },
          { date: '2024-01-10', profit: 234.75, signals: 22 },
          { date: '2024-01-11', profit: 189.25, signals: 20 },
          { date: '2024-01-12', profit: 345.80, signals: 25 },
          { date: '2024-01-13', profit: 278.90, signals: 19 },
          { date: '2024-01-14', profit: 456.25, signals: 28 },
          { date: '2024-01-15', profit: 820.30, signals: 24 }
        ],
        recentSignals: []
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchChannelSignalCounts();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      const channel = channels.find(ch => ch.id === id);
      if (!channel) return;

      const newStatus = channel.status === 'enabled' ? 'disabled' : 'enabled';
      await channelsApi.updateChannel(id, { status: newStatus });
      
      setChannels(prev => prev.map(channel => 
        channel.id === id 
          ? { ...channel, status: newStatus }
          : channel
      ));
      toast.success('Channel status updated');
    } catch (error) {
      toast.error('Failed to update channel status');
    }
  };

  const handleDeleteChannel = async (id: number) => {
    try {
      await channelsApi.deleteChannel(id);
      setChannels(prev => prev.filter(channel => channel.id !== id));
      toast.success('Channel deleted successfully');
    } catch (error) {
      toast.error('Failed to delete channel');
    }
  };

  const handleAddChannel = async () => {
    try {
      const response = await channelsApi.addChannel(newChannel);
      const addedChannel = response.data;
      
      setChannels(prev => [addedChannel, ...prev]);
      setIsAddDialogOpen(false);
      setNewChannel({
        chat_id: '',
        channel_name: '',
        channel_type: availableChannelTypes[0] || 'telegram',
        status: 'enabled'
      });
      toast.success('Channel added successfully');
    } catch (error) {
      toast.error('Failed to add channel');
    }
  };

  const handleEditChannel = (channel: PermissionChannel) => {
    setSelectedChannel(channel);
    setEditingChannel({
      id: channel.id,
      channel_name: channel.channel_name,
      chat_id: channel.chat_id,
      channel_type: channel.channel_type,
      status: channel.status
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEditChannel = async () => {
    try {
      if (!selectedChannel || !editingChannel.id) return;
      
      await channelsApi.updateChannel(editingChannel.id, editingChannel);
      
      setChannels(prev => prev.map(channel => 
        channel.id === editingChannel.id 
          ? { ...channel, ...editingChannel }
          : channel
      ));
      
      setIsEditDialogOpen(false);
      setSelectedChannel(null);
      setEditingChannel({});
      toast.success('Channel updated successfully');
    } catch (error) {
      toast.error('Failed to update channel');
    }
  };

  const handleViewAnalytics = async (channel: PermissionChannel) => {
    setSelectedChannel(channel);
    setIsAnalyticsDialogOpen(true);
    await fetchChannelAnalytics(channel);
  };

  const getChannelSignalCount = (channelType: string): number => {
    return channelSignalCounts[channelType] || 0;
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Channel Management" 
          subtitle="Manage signal sources and channels with real-time monitoring and analytics"
          onRefresh={fetchChannels}
          isLoading={isLoadingChannels}
        />

        {/* Header Section */}
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Radio className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Multi-Channel Analytics:</strong> Monitor signals from Telegram, WhatsApp, and Discord with detailed performance metrics
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Live Monitoring</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Channels</CardTitle>
              <Radio className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{channels.length}</div>
              <p className="text-xs opacity-80 mt-1">
                Across all platforms
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Active Channels</CardTitle>
              <Zap className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {channels.filter(c => c.status === 'enabled').length}
              </div>
              <p className="text-xs opacity-80 mt-1">
                Currently monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Signals</CardTitle>
              <Activity className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Object.values(channelSignalCounts).reduce((sum, count) => sum + count, 0)}
              </div>
              <p className="text-xs opacity-80 mt-1">
                All time signals
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Signal Sources</CardTitle>
              <Hash className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(channels.map(c => c.channel_type)).size}
              </div>
              <p className="text-xs opacity-80 mt-1">
                Different platforms
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Channel Management */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Radio className="h-5 w-5 text-blue-600" />
                  <span>Signal Channels</span>
                </CardTitle>
                <CardDescription>Configure and manage your signal sources with detailed analytics</CardDescription>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Channel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Channel</DialogTitle>
                    <DialogDescription>Configure a new signal source</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="channel_name">Channel Name</Label>
                      <Input
                        id="channel_name"
                        value={newChannel.channel_name}
                        onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })}
                        placeholder="My Trading Channel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="chat_id">Chat ID</Label>
                      <Input
                        id="chat_id"
                        value={newChannel.chat_id}
                        onChange={(e) => setNewChannel({ ...newChannel, chat_id: e.target.value })}
                        placeholder="-1002846030923"
                      />
                    </div>
                    <div>
                      <Label htmlFor="channel_type">Channel Type</Label>
                      <Select value={newChannel.channel_type} onValueChange={(value) => setNewChannel({ ...newChannel, channel_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="telegram">Telegram</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="discord">Discord</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="status"
                        checked={newChannel.status === 'enabled'}
                        onCheckedChange={(checked) => setNewChannel({ ...newChannel, status: checked ? 'enabled' : 'disabled' })}
                      />
                      <Label htmlFor="status">Enable channel</Label>
                    </div>
                    <Button onClick={handleAddChannel} className="w-full">
                      Add Channel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingChannels ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Radio className={`h-5 w-5 ${channel.status === 'enabled' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{channel.channel_name}</h3>
                        <Badge variant={channel.channel_type === 'telegram' ? 'default' : 'secondary'}>
                          {channel.channel_type}
                        </Badge>
                        <Badge variant={channel.status === 'enabled' ? 'default' : 'secondary'}>
                          {channel.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-mono">{channel.chat_id}</span>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {getChannelSignalCount(channel.channel_type)} signals
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAnalytics(channel)}
                      className="flex items-center space-x-1"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Analytics</span>
                    </Button>
                    <Switch
                      checked={channel.status === 'enabled'}
                      onCheckedChange={() => handleToggleStatus(channel.id)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditChannel(channel)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteChannel(channel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Channel Modal */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Channel</DialogTitle>
              <DialogDescription>
                Update channel information from permission_channel table
              </DialogDescription>
            </DialogHeader>
            {selectedChannel && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_channel_name">Channel Name</Label>
                  <Input
                    id="edit_channel_name"
                    value={editingChannel.channel_name || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, channel_name: e.target.value })}
                    placeholder="Channel name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_chat_id">Chat ID</Label>
                  <Input
                    id="edit_chat_id"
                    value={editingChannel.chat_id || ''}
                    onChange={(e) => setEditingChannel({ ...editingChannel, chat_id: e.target.value })}
                    placeholder="Chat ID"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_channel_type">Channel Type</Label>
                  <Select 
                    value={editingChannel.channel_type || ''} 
                    onValueChange={(value) => setEditingChannel({ ...editingChannel, channel_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableChannelTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Available types from permission_channel table
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_status"
                    checked={editingChannel.status === 'enabled'}
                    onCheckedChange={(checked) => setEditingChannel({ ...editingChannel, status: checked ? 'enabled' : 'disabled' })}
                  />
                  <Label htmlFor="edit_status">Enable channel</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEditChannel}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Channel Configuration Help */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>Configuration Help</span>
            </CardTitle>
            <CardDescription>How to set up different channel types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Telegram Channels</h4>
                <p className="text-sm text-gray-600 mb-2">
                  To get the Chat ID for a Telegram channel:
                </p>
                <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                  <li>Add your bot to the channel as an administrator</li>
                  <li>Send a message to the channel</li>
                  <li>Visit: https://api.telegram.org/bot[BOT_TOKEN]/getUpdates</li>
                  <li>Look for the "chat" object and copy the "id" value</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-2">WhatsApp Groups</h4>
                <p className="text-sm text-gray-600">
                  WhatsApp integration requires additional setup with WhatsApp Business API.
                  Contact support for configuration assistance.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Database Integration</h4>
                <p className="text-sm text-gray-600">
                  All channels are stored in the <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">permission_channel</code> table.
                  Channel types are dynamically loaded from existing database entries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Analytics Modal */}
        <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Channel Analytics</span>
                    {selectedChannel && (
                      <Badge variant="outline">{selectedChannel.channel_name}</Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Comprehensive trading performance analysis for this channel
                  </DialogDescription>
                </div>
                <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium">Live Data</span>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {isLoadingAnalytics ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : channelAnalytics ? (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-90">Total Signals</p>
                            <p className="text-2xl font-bold">{channelAnalytics.totalSignals}</p>
                          </div>
                          <Hash className="h-8 w-8 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-90">Win Rate</p>
                            <p className="text-2xl font-bold">{formatPercent(channelAnalytics.winRate)}</p>
                          </div>
                          <Target className="h-8 w-8 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-90">Total Profit</p>
                            <p className="text-2xl font-bold">{formatCurrency(channelAnalytics.totalProfit)}</p>
                          </div>
                          <DollarSign className="h-8 w-8 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-90">Avg Profit</p>
                            <p className="text-2xl font-bold">{formatCurrency(channelAnalytics.avgProfit)}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Key Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {channelAnalytics.mostActivePair}
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">Most Active Pair</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {channelAnalytics.bestPair}
                          </div>
                          <div className="text-sm text-green-700 dark:text-green-300">Best Performing Pair</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            {channelAnalytics.worstPair}
                          </div>
                          <div className="text-sm text-red-700 dark:text-red-300">Worst Performing Pair</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Performance Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span>Daily Performance</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={channelAnalytics.dailyPerformance}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                              />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip 
                                formatter={(value: number) => [formatCurrency(value), 'Profit']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="profit" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Result Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          <span>Result Distribution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={channelAnalytics.resultDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {channelAnalytics.resultDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Currency Pair Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        <span>Currency Pair Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={channelAnalytics.pairDistribution}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="pair" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                            <Tooltip 
                              formatter={(value: number, name: string) => [
                                name === 'count' ? value : formatCurrency(value), 
                                name === 'count' ? 'Signals' : 'Profit'
                              ]}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="count" fill="#8b5cf6" name="Signal Count" />
                            <Bar yAxisId="right" dataKey="profit" fill="#10b981" name="Total Profit" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Pair Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Pair Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Currency Pair
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Signal Count
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Total Profit
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Avg Profit
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {channelAnalytics.pairDistribution.map((pair, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {pair.pair}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {pair.count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={pair.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(pair.profit)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={pair.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(pair.profit / pair.count)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}