'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot } from '@/lib/types';
import { Play, Square, RefreshCw, FileText, AlertCircle, Download, Eye, Filter, Calendar, Activity, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: string;
  botId: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([
    {
      id: 'telegram_listener',
      status: 'running',
      pid: 12345,
      log: '/path/to/telegram_listener_output.log'
    },
    {
      id: 'trade_signal_runner',
      status: 'running',
      pid: 12346,
      log: '/path/to/trade_signal_runner_output.log'
    },
    {
      id: 'api_bot_manager',
      status: 'stopped',
      log: '/path/to/api_bot_manager_output.log'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mock detailed log entries
  const [detailedLogs, setDetailedLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:15',
      botId: 'telegram_listener',
      level: 'success',
      message: 'Signal saved: EUR/USD | Entry: 14:35',
      details: 'Signal ID: 12345, Channel: -1002846030923, Direction: BUY, Amount: $25'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:30:20',
      botId: 'trade_signal_runner',
      level: 'info',
      message: 'Starting trade process for signal 12345',
      details: 'Entry time: 14:35, Pair: EUR/USD, Direction: BUY, Base amount: $25'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:30:25',
      botId: 'telegram_listener',
      level: 'info',
      message: 'New message received from -1002846030923',
      details: 'Channel: Forex Legend VIP, Message length: 156 chars'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:30:30',
      botId: 'trade_signal_runner',
      level: 'success',
      message: 'Trade executed successfully',
      details: 'Result: WIN, Profit: +$21.25, Execution time: 2.3s'
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:30:35',
      botId: 'api_bot_manager',
      level: 'info',
      message: 'Bot status updated',
      details: 'Updated bots: telegram_listener, trade_signal_runner'
    },
    {
      id: '6',
      timestamp: '2024-01-15 14:29:45',
      botId: 'trade_signal_runner',
      level: 'warning',
      message: 'Low payout detected: 72%',
      details: 'Signal: GBP/USD, Payout: 72%, Threshold: 75%, Action: Skipped'
    },
    {
      id: '7',
      timestamp: '2024-01-15 14:29:30',
      botId: 'telegram_listener',
      level: 'error',
      message: 'Connection timeout to Telegram API',
      details: 'Timeout after 30s, Retrying in 5s, Attempt: 2/3'
    },
    {
      id: '8',
      timestamp: '2024-01-15 14:29:35',
      botId: 'telegram_listener',
      level: 'success',
      message: 'Connection restored to Telegram API',
      details: 'Reconnected successfully, Latency: 120ms'
    }
  ]);

  const handleStartBot = async (botId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBots(prev => prev.map(bot => 
        bot.id === botId 
          ? { ...bot, status: 'running', pid: Math.floor(Math.random() * 90000) + 10000 }
          : bot
      ));
      toast.success(`Bot ${botId} started successfully`);
    } catch (error) {
      toast.error(`Failed to start bot ${botId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopBot = async (botId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBots(prev => prev.map(bot => 
        bot.id === botId 
          ? { ...bot, status: 'stopped', pid: undefined }
          : bot
      ));
      toast.success(`Bot ${botId} stopped successfully`);
    } catch (error) {
      toast.error(`Failed to stop bot ${botId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to get bot status
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Bot status refreshed');
    } catch (error) {
      toast.error('Failed to refresh bot status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLogs = (botId: string) => {
    setSelectedBot(botId);
    setIsLogsDialogOpen(true);
  };

  const getFilteredLogs = () => {
    let filtered = detailedLogs;

    // Filter by bot
    if (selectedBot && selectedBot !== 'all') {
      filtered = filtered.filter(log => log.botId === selectedBot);
    }

    // Filter by level
    if (logFilter !== 'all') {
      filtered = filtered.filter(log => log.level === logFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date (mock implementation)
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(log => log.timestamp.startsWith(today));
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📊';
    }
  };

  const handleDownloadCSV = () => {
    const filteredLogs = getFilteredLogs();
    const csvContent = [
      ['Timestamp', 'Bot ID', 'Level', 'Message', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.botId,
        log.level,
        log.message,
        log.details || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded successfully');
  };

  const handleDownloadPDF = () => {
    // Mock PDF generation - in real implementation, you'd use a library like jsPDF
    const filteredLogs = getFilteredLogs();
    const pdfContent = `
Bot Logs Report
Generated: ${new Date().toLocaleString()}
Total Entries: ${filteredLogs.length}

${filteredLogs.map(log => `
[${log.timestamp}] ${log.botId.toUpperCase()} - ${log.level.toUpperCase()}
${log.message}
${log.details ? `Details: ${log.details}` : ''}
${'='.repeat(80)}
`).join('\n')}
    `;

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Log report downloaded successfully');
  };

  const getBotDescription = (botId: string) => {
    switch (botId) {
      case 'telegram_listener':
        return 'Monitors Telegram channels for trading signals';
      case 'trade_signal_runner':
        return 'Executes trades based on received signals';
      case 'api_bot_manager':
        return 'Manages bot lifecycle and API endpoints';
      default:
        return 'Trading bot component';
    }
  };

  const getBotScript = (botId: string) => {
    switch (botId) {
      case 'telegram_listener':
        return 'telegram_listener_client.py';
      case 'trade_signal_runner':
        return 'trade_signal_runner.py';
      case 'api_bot_manager':
        return 'api_bot_manager.py';
      default:
        return 'unknown.py';
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Bot Management" 
          subtitle="Control and monitor your trading bots with real-time status updates"
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Header Section */}
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <Zap className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Bot Control Center:</strong> Real-time bot monitoring and management
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      
        {/* System Status */}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 opacity-90">
              <Activity className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{bots.filter(b => b.status === 'running').length}</div>
                <div className="text-sm opacity-80">Running Bots</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm opacity-80">Active Channels</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm opacity-80">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{bot.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                  <Badge 
                    variant={bot.status === 'running' ? 'default' : 'secondary'}
                    className={bot.status === 'running' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-700'}
                  >
                    {bot.status === 'running' ? '🟢 Running' : '🔴 Stopped'}
                  </Badge>
                </div>
                <CardDescription>{getBotDescription(bot.id)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Script:</span>
                    <span className="font-mono">{getBotScript(bot.id)}</span>
                  </div>
                  {bot.pid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">PID:</span>
                      <span className="font-mono">{bot.pid}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Log:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto p-0"
                      onClick={() => handleViewLogs(bot.id)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {bot.status === 'running' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleStopBot(bot.id)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartBot(bot.id)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bot Logs */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Recent Bot Activity</span>
                </CardTitle>
                <CardDescription>Latest log entries from running bots</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedBot('all');
                  setIsLogsDialogOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-lg max-h-64 overflow-y-auto">
              <div>[2024-01-15 14:30:15] telegram_listener: ✅ Signal saved: EUR/USD | Entry: 14:35</div>
              <div>[2024-01-15 14:30:20] trade_signal_runner: 🚀 Starting trade process for signal 12345</div>
              <div>[2024-01-15 14:30:25] telegram_listener: 📥 New message received from -1002846030923</div>
              <div>[2024-01-15 14:30:30] trade_signal_runner: ✅ Trade executed successfully</div>
              <div>[2024-01-15 14:30:35] api_bot_manager: 📊 Bot status updated</div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Logs Dialog */}
        <Dialog open={isLogsDialogOpen} onOpenChange={setIsLogsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Detailed Bot Logs</span>
                {selectedBot !== 'all' && (
                  <Badge variant="outline">{selectedBot}</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                View, filter, and download comprehensive bot activity logs
              </DialogDescription>
            </DialogHeader>

            {/* Filters and Controls */}
            <div className="space-y-4 border-b pb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bot-filter">Bot</Label>
                  <Select value={selectedBot} onValueChange={setSelectedBot}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bots</SelectItem>
                      <SelectItem value="telegram_listener">Telegram Listener</SelectItem>
                      <SelectItem value="trade_signal_runner">Trade Signal Runner</SelectItem>
                      <SelectItem value="api_bot_manager">API Bot Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level-filter">Log Level</Label>
                  <Select value={logFilter} onValueChange={setLogFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-filter">Date Range</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Filter className="h-4 w-4" />
                  <span>Showing {getFilteredLogs().length} entries</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Logs Display */}
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {getFilteredLogs().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No logs found matching your filters</p>
                  </div>
                ) : (
                  getFilteredLogs().map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="text-lg">{getLevelIcon(log.level)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs text-gray-500 font-mono">
                                {log.timestamp}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {log.botId}
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getLevelColor(log.level)}`}
                              >
                                {log.level.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium mb-1">{log.message}</p>
                            {log.details && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                {log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}