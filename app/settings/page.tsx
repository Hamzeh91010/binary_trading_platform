'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BaseSettings } from '@/lib/types';
import { settingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Save, RefreshCw, DollarSign, Target, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const [settings, setSettings] = useState<BaseSettings>({
    base_amount: 0,
    daily_profit_target: 0,
    max_loss_percent: 0,
    balance_reference: 0,
    current_balance: 0,
    min_payout_percent: 0,
    trading_mode: '',
    max_martingale_level: 0,
  });
  const [tradingMode, setTradingMode] = useState<'demo' | 'live'>('demo');
  const [payoutThreshold, setPayoutThreshold] = useState(75);
  const [enablePayoutFilter, setEnablePayoutFilter] = useState(true);
  const [autoMartingale, setAutoMartingale] = useState(true);
  const [maxMartingaleLevels, setMaxMartingaleLevels] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await settingsApi.getBaseSettings();
      const data = res.data;
      setSettings({
        base_amount: data.base_amount,
        daily_profit_target: data.daily_profit_target,
        max_loss_percent: data.max_loss_percent,
        balance_reference: data.balance_reference,
        current_balance: data.current_balance,
        min_payout_percent: data.min_payout_percent,
        trading_mode: data.trading_mode,
        max_martingale_level: data.max_martingale_level,
      });
    } catch (error) {
      toast.error('Failed to load settings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await settingsApi.updateBaseSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    setSettings({
      base_amount: 10,
      daily_profit_target: 100,
      max_loss_percent: 10,
      balance_reference: 1000,
      current_balance: settings.current_balance, // Keep current balance
      min_payout_percent: 70,
      trading_mode: 'demo',
      max_martingale_level: 3,
    });
    setPayoutThreshold(80);
    setMaxMartingaleLevels(3);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        <Header 
          title="Settings" 
          subtitle="Configure trading parameters and system settings for optimal performance"
        />

        {/* Header Section */}
        <div className="space-y-4">
          <Alert className="border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20">
            <Settings className="h-4 w-4 text-indigo-600" />
            <AlertDescription className="text-indigo-800 dark:text-indigo-200">
              <div className="flex items-center justify-between">
                <span>
                  <strong>Configuration Center:</strong> Fine-tune your trading parameters and risk management
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Auto-Save</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button variant="success" onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      
        {/* Trading Settings */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Trading Settings</span>
            </CardTitle>
            <CardDescription>Configure base trading parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="base_amount">Base Trade Amount</Label>
                <Input
                  id="base_amount"
                  type="number"
                  value={settings.base_amount}
                  onChange={(e) => setSettings({ ...settings, base_amount: parseFloat(e.target.value) })}
                  min="1"
                  step="0.01"
                />
                <p className="text-xs text-gray-500">Amount for initial trades</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trading_mode">Trading Mode</Label>
                <Select value={settings.trading_mode} onValueChange={(value: 'demo' | 'live') => setTradingMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo">Demo Account</SelectItem>
                    <SelectItem value="live">Live Account</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Switch between demo and live trading</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="daily_profit_target">Daily Profit Target</Label>
                <Input
                  id="daily_profit_target"
                  type="number"
                  value={settings.daily_profit_target}
                  onChange={(e) => setSettings({ ...settings, daily_profit_target: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500">Stop trading when reached</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_loss_percent">Max Loss Percentage</Label>
                <Input
                  id="max_loss_percent"
                  type="number"
                  value={settings.max_loss_percent}
                  onChange={(e) => setSettings({ ...settings, max_loss_percent: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="text-xs text-gray-500">Stop trading when loss exceeds this %</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Information */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Balance Information</span>
            </CardTitle>
            <CardDescription>Current account balance and reference values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="current_balance">Current Balance</Label>
                <Input
                  id="current_balance"
                  type="number"
                  value={settings.current_balance}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Updated automatically from trading platform</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance_reference">Reference Balance</Label>
                <Input
                  id="balance_reference"
                  type="number"
                  value={settings.balance_reference}
                  onChange={(e) => setSettings({ ...settings, balance_reference: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500">Used for loss percentage calculations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Management */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Risk Management</span>
            </CardTitle>
            <CardDescription>Configure risk management and filtering options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Payout Filter</Label>
                <p className="text-xs text-gray-500">Skip trades with low payout percentages</p>
              </div>
              <Switch
                checked={enablePayoutFilter}
                onCheckedChange={setEnablePayoutFilter}
              />
            </div>

            {enablePayoutFilter && (
              <div className="space-y-2">
                <Label htmlFor="payout_threshold">Minimum Payout Percentage</Label>
                <Input
                  id="payout_threshold"
                  type="number"
                  value={settings.min_payout_percent}
                  onChange={(e) => setPayoutThreshold(parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="1"
                />
                <p className="text-xs text-gray-500">Skip trades with payout below this percentage</p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Martingale</Label>
                <p className="text-xs text-gray-500">Automatically execute martingale levels</p>
              </div>
              <Switch
                checked={autoMartingale}
                onCheckedChange={setAutoMartingale}
              />
            </div>

            {autoMartingale && (
              <div className="space-y-2">
                <Label htmlFor="max_martingale_levels">Max Martingale Levels</Label>
                <Select value={maxMartingaleLevels.toString()} onValueChange={(value) => setMaxMartingaleLevels(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Level</SelectItem>
                    <SelectItem value="2">2 Levels</SelectItem>
                    <SelectItem value="3">3 Levels</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Maximum number of martingale attempts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>Current system configuration and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Profit Progress:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(125.50)} / {formatCurrency(settings.daily_profit_target)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((125.50 / settings.daily_profit_target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Loss Limit:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency((settings.balance_reference * settings.max_loss_percent) / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Available Balance:</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(settings.current_balance)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}