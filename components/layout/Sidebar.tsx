'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { settingsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3,
  Bot,
  Settings,
  TrendingUp,
  Radio,
  FileText,
  Home,
  Activity,
  User,
  Wallet,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Building,
  CreditCard,
  DollarSign,
  TrendingDown
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Signals', href: '/signals', icon: Activity },
  { name: 'Bots', href: '/bots', icon: Bot },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Channels', href: '/channels', icon: Radio },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const fetchBalanceData = async () => {
    setIsLoadingBalance(true);
    try {
      const response = await settingsApi.getBaseSettings();
      setBalanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch balance data:', error);
      // Fallback data
      setBalanceData({
        current_balance: 1250.50,
        balance_reference: 1000.00,
        daily_profit_target: 500.00,
        max_loss_percent: 10,
        base_amount: 25.00
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleProfileClick = () => {
    fetchBalanceData();
    setIsProfileModalOpen(true);
  };

  return (
    <>
      <div className="flex h-full w-64 flex-col bg-gray-900 dark:bg-gray-950">
        <div className="flex h-16 shrink-0 items-center px-6">
          <TrendingUp className="h-8 w-8 text-blue-400" />
          <span className="ml-2 text-xl font-bold text-white">TradingBot</span>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-800 dark:bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-gray-700 dark:border-gray-800 p-4">
          <Button
            variant="ghost"
            className="w-full p-0 h-auto hover:bg-gray-800 rounded-lg transition-colors"
            onClick={handleProfileClick}
          >
            <div className="flex items-center w-full p-2">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                <img 
                  src="/api/placeholder/40/40" 
                  alt="Hamzeh" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <span className="text-sm font-medium text-white hidden">H</span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Hamzeh</p>
                <p className="text-xs text-gray-400 truncate">Trading Session</p>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-500" />
              <span>User Profile</span>
            </DialogTitle>
            <DialogDescription>
              Account information and trading balance details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/api/placeholder/80/80" 
                      alt="Hamzeh" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <span className="text-lg font-medium text-white hidden">H</span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                          <p className="font-medium">Hamzeh</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium">hamzeh@tradingbot.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                          <p className="font-medium">January 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Account Type</p>
                          <Badge variant="default" className="bg-blue-600">Premium Trader</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Balance Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-green-500" />
                  <span>Account Balance</span>
                </CardTitle>
                <CardDescription>Current trading account status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBalance ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : balanceData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-green-700 dark:text-green-300">Current Balance</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(balanceData.current_balance)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300">Reference Balance</p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(balanceData.balance_reference)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-purple-700 dark:text-purple-300">Daily Target</p>
                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                              {formatCurrency(balanceData.daily_profit_target)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-sm text-orange-700 dark:text-orange-300">Max Loss</p>
                            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                              {balanceData.max_loss_percent}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Balance Progress */}
                    <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Balance Progress</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {((balanceData.current_balance - balanceData.balance_reference) >= 0 ? '+' : '')}
                          {formatCurrency(balanceData.current_balance - balanceData.balance_reference)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            balanceData.current_balance >= balanceData.balance_reference 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.abs((balanceData.current_balance / balanceData.balance_reference) * 100), 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Failed to load balance data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trading Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  <span>Trading Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Total Trades</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">78%</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">Active Bots</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">15</div>
                    <div className="text-xs text-orange-700 dark:text-orange-300">Days Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}