'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Bot,
  Settings,
  TrendingUp,
  Radio,
  FileText,
  Home,
  Activity,
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

  return (
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
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">User</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Trading Session</p>
          </div>
        </div>
      </div>
    </div>
  );
}