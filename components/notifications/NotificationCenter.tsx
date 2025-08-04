'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, X, Settings, BookMarked as MarkAsRead } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'trade';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Trade Executed Successfully',
      message: 'EUR/USD BUY - Profit: +$21.25',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
      data: { pair: 'EUR/USD', direction: 'BUY', profit: 21.25 }
    },
    {
      id: '2',
      type: 'info',
      title: 'New Signal Received',
      message: 'GBP/USD SELL at 14:30',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      data: { pair: 'GBP/USD', direction: 'SELL', time: '14:30' }
    },
    {
      id: '3',
      type: 'warning',
      title: 'Low Payout Detected',
      message: 'USD/JPY payout: 72% (below 75% threshold)',
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      read: false,
      data: { pair: 'USD/JPY', payout: 72 }
    },
    {
      id: '4',
      type: 'success',
      title: 'Daily Target Reached',
      message: 'Profit: $750 / $1000 target achieved',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true,
      data: { profit: 750, target: 1000 }
    },
    {
      id: '5',
      type: 'error',
      title: 'Connection Timeout',
      message: 'Telegram API connection lost - Reconnecting...',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: true,
      data: { service: 'telegram' }
    }
  ]);

  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications
      if (Math.random() > 0.7) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['success', 'info', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: 'Live Update',
          message: `System update at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date(),
          read: false,
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep max 20 notifications
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'trade':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'trade':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`relative ${className}`}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            </div>
          )}
          {unreadCount > 0 && (
            <span className="sr-only">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllNotifications}
              className="h-8 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 opacity-50 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium ${
                            !notification.read 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          !notification.read 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-500 dark:text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}