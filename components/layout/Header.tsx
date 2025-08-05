'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, Sun, Moon, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { settingsApi } from '@/lib/api';
import { TradingStatus } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { toast } from 'sonner';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function Header({ title, subtitle, onRefresh, isLoading }: HeaderProps) {
  const [tradingStatus, setTradingStatus] = useState<TradingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  const fetchTradingStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await settingsApi.getTradingStatus();
      const newStatus = response.data;
      
      // Check if status changed and show notifications
      if (tradingStatus && newStatus) {
        // Check if trading was stopped due to loss limit
        if (!tradingStatus.should_stop_trading && newStatus.should_stop_trading && newStatus.current_profit < 0) {
          toast.error(`Trading stopped! Loss limit reached: ${formatPercent(newStatus.current_loss_percent)}%`);
        }
        
        // Check if daily profit target was reached
        if (newStatus.current_profit > 0 && newStatus.current_profit >= newStatus.daily_profit_target) {
          toast.success(`Daily profit target reached: ${formatCurrency(newStatus.current_profit)}`);
        }
      }
      
      setTradingStatus(newStatus);
    } catch (error) {
      console.error('Failed to fetch trading status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTradingStatus();

    // Set up 30-second interval for status updates
    const statusInterval = setInterval(() => {
      fetchTradingStatus();
    }, 30000); // 30 seconds

    return () => clearInterval(statusInterval);
  }, []);

  const handleStopTrading = async () => {
    try {
      await settingsApi.stopTradingBots();
      toast.success('Trading bots stopped successfully');
      fetchTradingStatus(); // Refresh status
    } catch (error) {
      toast.error('Failed to stop trading bots');
    }
  };

  const getTradingStatusBadge = () => {
    if (!tradingStatus) return null;

    if (tradingStatus.should_stop_trading) {
      return (
        <Badge className="bg-red-600 text-white hover:bg-red-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Trading Stopped
        </Badge>
      );
    }

    if (tradingStatus.current_profit > 0) {
      return (
        <Badge className="bg-green-600 text-white hover:bg-green-700">
          <TrendingUp className="w-3 h-3 mr-1" />
          Profit: {formatCurrency(tradingStatus.current_profit)}
        </Badge>
      );
    } else if (tradingStatus.current_profit < 0) {
      return (
        <Badge className="bg-red-600 text-white hover:bg-red-700">
          <TrendingDown className="w-3 h-3 mr-1" />
          Loss: {formatCurrency(Math.abs(tradingStatus.current_profit))}
        </Badge>
      );
    }

    // return (
    //   <Badge className="bg-blue-600 text-white hover:bg-blue-700">
    //     Active Trading
    //   </Badge>
    // );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <div className="flex items-center space-x-2">
          <Sun className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-yellow-500'}`} />
          <Switch 
            checked={theme === 'dark'} 
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
          />
          <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
        </div>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Trading Status */}
        {tradingStatus && (
          <div className="flex items-center space-x-2">
            {tradingStatus.should_stop_trading ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Trading Stopped
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Active Trading
                </span>
              </div>
            )}
            {getTradingStatusBadge()}
          </div>
        )}

        {/* Emergency Stop Button */}
        {tradingStatus && !tradingStatus.should_stop_trading && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStopTrading}
            className="flex items-center space-x-1"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Stop Trading</span>
          </Button>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading || statusLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading || statusLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        )}
      </div>
    </div>
  );
}