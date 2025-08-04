'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Channel } from '@/lib/types';
import { Plus, Edit2, Trash2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText } from 'lucide-react';

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 1,
      chat_id: '-1002846030923',
      channel_name: 'Forex Legend VIP',
      channel_type: 'telegram',
      status: 'enabled'
    },
    {
      id: 2,
      chat_id: '-1002721262804',
      channel_name: 'Forex Legend Club 60',
      channel_type: 'telegram',
      status: 'enabled'
    },
    {
      id: 3,
      chat_id: '-1002723345001',
      channel_name: 'Premium Signals',
      channel_type: 'telegram',
      status: 'disabled'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({
    chat_id: '',
    channel_name: '',
    channel_type: 'telegram',
    status: 'enabled' as 'enabled' | 'disabled'
  });

  const handleToggleStatus = (id: number) => {
    setChannels(prev => prev.map(channel => 
      channel.id === id 
        ? { ...channel, status: channel.status === 'enabled' ? 'disabled' : 'enabled' }
        : channel
    ));
    toast.success('Channel status updated');
  };

  const handleDeleteChannel = (id: number) => {
    setChannels(prev => prev.filter(channel => channel.id !== id));
    toast.success('Channel deleted successfully');
  };

  const handleAddChannel = () => {
    const channel: Channel = {
      id: Date.now(),
      ...newChannel
    };

    setChannels(prev => [channel, ...prev]);
    setIsAddDialogOpen(false);
    setNewChannel({
      chat_id: '',
      channel_name: '',
      channel_type: 'telegram',
      status: 'enabled'
    });
    toast.success('Channel added successfully');
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Channel Management" 
          subtitle="Manage signal sources and channels with real-time monitoring"
        />

        {/* Header Section */}
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Radio className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Multi-Channel Input:</strong> Monitoring signals from Telegram, WhatsApp, and Discord
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Radio className="h-5 w-5 opacity-80" />
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
              <CardTitle className="text-sm font-medium opacity-90">Signal Sources</CardTitle>
              <Radio className="h-5 w-5 opacity-80" />
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
                <CardDescription>Configure and manage your signal sources</CardDescription>
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
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Radio className={`h-5 w-5 ${channel.status === 'enabled' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{channel.channel_name}</h3>
                        <Badge variant={channel.channel_type === 'telegram' ? 'default' : 'secondary'}>
                          {channel.channel_type}
                        </Badge>
                        <Badge variant={channel.status === 'enabled' ? 'default' : 'secondary'}>
                          {channel.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{channel.chat_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={channel.status === 'enabled'}
                      onCheckedChange={() => handleToggleStatus(channel.id)}
                    />
                    <Button variant="ghost" size="sm">
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
          </CardContent>
        </Card>

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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}