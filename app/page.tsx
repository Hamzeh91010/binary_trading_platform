'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  Activity, 
  Bot, 
  BarChart3, 
  Zap, 
  Shield, 
  Clock,
  Target,
  Radio,
  Settings,
  ArrowRight,
  Play,
  Moon,
  Sun,
  ChevronDown,
  Sparkles,
  Globe,
  Users,
  Award,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

// Mock data for real-time visualization
const mockSignalData = [
  { time: '09:00', profit: 0, signals: 0 },
  { time: '10:00', profit: 125, signals: 3 },
  { time: '11:00', profit: 280, signals: 7 },
  { time: '12:00', profit: 450, signals: 12 },
  { time: '13:00', profit: 380, signals: 15 },
  { time: '14:00', profit: 620, signals: 18 },
  { time: '15:00', profit: 750, signals: 22 },
];

const mockPieData = [
  { name: 'Wins', value: 68, color: '#10b981' },
  { name: 'Losses', value: 25, color: '#ef4444' },
  { name: 'Pending', value: 7, color: '#f59e0b' },
];

const stats = [
  { label: 'Active Signals', value: '22', icon: Activity, color: 'text-blue-600' },
  { label: 'Win Rate', value: '73%', icon: Target, color: 'text-green-600' },
  { label: 'Daily Profit', value: '$750', icon: DollarSign, color: 'text-emerald-600' },
  { label: 'Active Bots', value: '3', icon: Bot, color: 'text-purple-600' },
];

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Natural Light Spectrum Flow Animation */}
      {!isDark && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary spectrum wave */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 animate-spectrum-flow-1">
              <div className="w-full h-full bg-gradient-to-br from-violet-200/40 via-blue-200/60 via-cyan-200/50 via-green-200/40 via-yellow-200/30 via-orange-200/40 to-red-200/30 rounded-full blur-3xl"></div>
            </div>
          </div>
          
          {/* Secondary spectrum wave */}
          <div className="absolute inset-0 opacity-25">
            <div className="absolute w-[180%] h-[180%] -top-1/3 -right-1/3 animate-spectrum-flow-2">
              <div className="w-full h-full bg-gradient-to-tl from-blue-300/30 via-indigo-200/40 via-purple-200/35 via-pink-200/30 via-rose-200/25 to-orange-200/35 rounded-full blur-2xl"></div>
            </div>
          </div>
          
          {/* Tertiary spectrum wave */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-[160%] h-[160%] -bottom-1/4 -left-1/4 animate-spectrum-flow-3">
              <div className="w-full h-full bg-gradient-to-tr from-emerald-200/25 via-teal-200/30 via-sky-200/35 via-blue-200/30 via-indigo-200/25 to-violet-200/30 rounded-full blur-xl"></div>
            </div>
          </div>
          
          {/* Ambient light particles */}
          <div className="absolute inset-0 opacity-15">
            {[...Array(12)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className={`absolute w-32 h-32 rounded-full blur-lg animate-float-particle-${(i % 3) + 1}`}
                style={{
                  left: `${10 + (i * 7)}%`,
                  top: `${15 + Math.sin(i) * 25}%`,
                  background: `radial-gradient(circle, ${
                    ['rgba(139, 69, 255, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)', 
                     'rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.1)', 'rgba(168, 85, 247, 0.1)'][i % 6]
                  } 0%, transparent 70%)`,
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${12 + (i % 4) * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Subtle overlay for content readability */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[0.5px]"></div>
        </div>
      )}
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Space Environment with Cosmic Spectrum Waves */}
        {isDark && (
          <div className="absolute inset-0">
            {/* Deep Space Base Layer */}
            <div className="absolute inset-0 bg-gradient-radial from-gray-900 via-gray-800 to-black opacity-90"></div>
            
            {/* Primary Cosmic Wave - Purple to Blue Spectrum */}
            <div className="absolute inset-0 opacity-60">
              <div className="absolute w-[400%] h-[400%] -top-1/2 -left-1/2 animate-cosmic-wave-1">
                <div className="w-full h-full bg-gradient-conic from-purple-900/80 via-indigo-800/70 via-blue-700/60 via-cyan-600/50 via-teal-700/60 via-purple-800/70 to-purple-900/80 rounded-full blur-3xl"></div>
              </div>
            </div>
            
            {/* Secondary Nebula Wave - Pink to Purple Spectrum */}
            <div className="absolute inset-0 opacity-50">
              <div className="absolute w-[350%] h-[350%] -top-1/3 -right-1/3 animate-nebula-wave-1">
                <div className="w-full h-full bg-gradient-radial from-pink-900/60 via-purple-800/50 via-violet-700/40 via-indigo-800/50 to-transparent rounded-full blur-2xl"></div>
              </div>
            </div>
            
            {/* Tertiary Galaxy Wave - Blue to Green Spectrum */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute w-[320%] h-[320%] -bottom-1/4 -left-1/4 animate-galaxy-wave-1">
                <div className="w-full h-full bg-gradient-conic from-blue-900/50 via-cyan-800/40 via-teal-700/35 via-emerald-800/40 via-blue-800/45 to-blue-900/50 rounded-full blur-xl"></div>
              </div>
            </div>
            
            {/* Cosmic Energy Particles - Stars and Nebula Dust */}
            <div className="absolute inset-0 opacity-70">
              {[...Array(15)].map((_, i) => (
                <div
                  key={`cosmic-particle-${i}`}
                  className={`absolute w-16 h-16 rounded-full blur-md animate-cosmic-particle-${(i % 4) + 1}`}
                  style={{
                    left: `${5 + (i * 6)}%`,
                    top: `${10 + Math.sin(i * 0.7) * 40}%`,
                    background: `radial-gradient(circle, ${
                      ['rgba(147, 51, 234, 0.3)', 'rgba(79, 70, 229, 0.25)', 'rgba(59, 130, 246, 0.2)', 
                       'rgba(16, 185, 129, 0.25)', 'rgba(139, 92, 246, 0.3)', 'rgba(168, 85, 247, 0.2)'][i % 6]
                    } 0%, transparent 70%)`,
                    animationDelay: `${i * 0.8}s`,
                    animationDuration: `${15 + (i % 4) * 3}s`
                  }}
                />
              ))}
            </div>
            
            {/* Distant Stars - Small Twinkling Points */}
            <div className="absolute inset-0 opacity-80">
              {[...Array(20)].map((_, i) => (
                <div
                  key={`star-${i}`}
                  className={`absolute w-3 h-3 animate-rising-star-${(i % 3) + 1}`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: '-20px',
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${8 + (i % 4) * 2}s`
                  }}
                >
                  <div 
                    className="star-shape"
                    style={{
                      background: `${
                        ['#ffffff', '#e0e7ff', '#ddd6fe', '#c7d2fe', '#bfdbfe', '#a7f3d0'][i % 6]
                      }`,
                      filter: `drop-shadow(0 0 ${2 + (i % 3)}px ${
                        ['#ffffff', '#8b5cf6', '#3b82f6', '#10b981'][i % 4]
                      })`
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Cosmic Dust Clouds */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`dust-cloud-${i}`}
                  className={`absolute w-64 h-64 rounded-full blur-3xl animate-drift-${(i % 2) + 1}`}
                  style={{
                    left: `${10 + (i * 15)}%`,
                    top: `${20 + Math.sin(i * 1.2) * 30}%`,
                    background: `radial-gradient(circle, ${
                      ['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.08)', 'rgba(168, 85, 247, 0.1)', 
                       'rgba(147, 51, 234, 0.08)', 'rgba(79, 70, 229, 0.1)', 'rgba(59, 130, 246, 0.08)'][i % 6]
                    } 0%, transparent 60%)`,
                    animationDelay: `${i * 2}s`,
                    animationDuration: `${25 + (i % 3) * 5}s`
                  }}
                />
              ))}
            </div>
            
            {/* Space Depth Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 opacity-60"></div>
            
            {/* Subtle content readability overlay */}
            <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[0.5px]"></div>
          </div>
        )}
        
        {/* Light mode - Simplified natural spectrum */}
        {!isDark && (
          <div className="absolute inset-0 opacity-30">
            {/* Light mode particles */}
            {[...Array(6)].map((_, i) => (
              <div
                key={`light-particle-${i}`}
                className="absolute w-32 h-32 rounded-full blur-xl animate-float"
                style={{
                  left: `${20 + (i * 12)}%`,
                  top: `${30 + Math.sin(i) * 20}%`,
                  background: `radial-gradient(circle, ${
                    ['rgba(59, 130, 246, 0.1)', 'rgba(139, 69, 255, 0.1)', 'rgba(16, 185, 129, 0.1)'][i % 3]
                  } 0%, transparent 70%)`,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${15 + (i % 3) * 3}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`relative z-50 px-6 py-4 ${isDark ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <TrendingUp className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>TradingBot</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className={`hover:${isDark ? 'text-blue-400' : 'text-blue-600'} transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Dashboard
              </Link>
              <Link href="/signals" className={`hover:${isDark ? 'text-blue-400' : 'text-blue-600'} transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Signals
              </Link>
              <Link href="/bots" className={`hover:${isDark ? 'text-blue-400' : 'text-blue-600'} transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Bots
              </Link>
            </div>
            
            <div className="flex items-center space-x-2">
              <Sun className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-yellow-500'}`} />
              <Switch checked={isDark} onCheckedChange={setIsDark} />
              <Moon className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-xl ${isDark ? 'bg-blue-400/30' : 'bg-blue-600/30'} animate-pulse`} />
              <div className={`relative flex items-center space-x-3 px-6 py-3 rounded-full ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-md border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Live Trading Active
                  </span>
                </div>
                <Badge variant="secondary" className="animate-bounce">
                  {stats[currentStat].value}
                </Badge>
              </div>
            </div>
          </div>
          
          <h1 className={`text-6xl md:text-7xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="inline-block animate-fade-in-up">Automate Your</span>
            <br />
            <span className={`inline-block bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent animate-fade-in-up`} style={{ animationDelay: '0.2s' }}>
              Binary Trades
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'} animate-fade-in-up`} style={{ animationDelay: '0.4s' }}>
            Professional trading signal control center with{' '}
            <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>real-time execution</span>,{' '}
            <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>live editing</span>, and{' '}
            <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>comprehensive analytics</span>
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up`} style={{ animationDelay: '0.6s' }}>
            <Link href="/dashboard">
              <Button size="lg" className={`px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} group`}>
                <Play className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                Start Trading
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signals">
              <Button size="lg" variant="outline" className={`px-8 py-4 text-lg font-semibold rounded-full border-2 hover:shadow-lg transform hover:scale-105 transition-all duration-300 ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} group`}>
                <Activity className="h-5 w-5 mr-2" />
                View Signals
                <ChevronDown className="h-5 w-5 ml-2 group-hover:animate-bounce" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Stats Dashboard */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center mb-12 animate-fade-in-up`}>
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Live Trading Dashboard
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time signal processing from today's trading session
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className={`group hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'} backdrop-blur-md animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-bold ${stat.color} group-hover:scale-110 transition-transform`}>
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} group-hover:animate-pulse`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'} backdrop-blur-md animate-fade-in-up`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Today's Profit Curve</span>
              </CardTitle>
              <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Real-time profit tracking throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSignalData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Profit']}
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'} backdrop-blur-md animate-fade-in-up`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Target className="h-5 w-5 text-blue-500" />
                <span>Signal Results</span>
              </CardTitle>
              <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Win/Loss distribution for today's trades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className={`relative z-10 py-20 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50/50'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Professional Trading Arsenal
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Everything you need for successful automated trading
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: 'Real-time Signal Execution',
                description: 'Automated trade execution with precise timing and advanced martingale strategies',
                color: 'text-blue-500',
                bgColor: isDark ? 'bg-blue-500/10' : 'bg-blue-50'
              },
              {
                icon: Settings,
                title: 'Live Signal Editing',
                description: 'Edit signals before and during execution with instant updates and real-time sync',
                color: 'text-purple-500',
                bgColor: isDark ? 'bg-purple-500/10' : 'bg-purple-50'
              },
              {
                icon: Zap,
                title: 'Live Balance Sync',
                description: 'Real-time balance tracking and profit/loss monitoring with instant notifications',
                color: 'text-yellow-500',
                bgColor: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'
              },
              {
                icon: Target,
                title: 'Smart Martingale Control',
                description: 'Advanced martingale management with customizable levels and risk controls',
                color: 'text-green-500',
                bgColor: isDark ? 'bg-green-500/10' : 'bg-green-50'
              },
              {
                icon: Radio,
                title: 'Multi-Channel Input',
                description: 'Support for Telegram, WhatsApp, and Discord signal sources with filtering',
                color: 'text-indigo-500',
                bgColor: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'
              },
              {
                icon: Shield,
                title: 'Intelligent Risk Management',
                description: 'Automatic filtering based on payout percentages, risk levels, and market conditions',
                color: 'text-red-500',
                bgColor: isDark ? 'bg-red-500/10' : 'bg-red-50'
              }
            ].map((feature, index) => (
              <Card key={index} className={`group hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/70 border-gray-200'} backdrop-blur-md animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quick Access
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Jump directly to the tools you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Dashboard', href: '/dashboard', icon: BarChart3, description: 'Overview & Analytics' },
            { name: 'Signals', href: '/signals', icon: Activity, description: 'Manage Trading Signals' },
            { name: 'Bots', href: '/bots', icon: Bot, description: 'Bot Control Center' },
            { name: 'Reports', href: '/reports', icon: TrendingUp, description: 'Performance Reports' }
          ].map((item, index) => (
            <Link key={index} href={item.href}>
              <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isDark ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50' : 'bg-white/50 border-gray-200 hover:bg-white/80'} backdrop-blur-md animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <item.icon className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'} group-hover:scale-110 transition-transform`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                  <ArrowRight className={`h-4 w-4 mx-auto mt-3 ${isDark ? 'text-blue-400' : 'text-blue-600'} group-hover:translate-x-1 transition-transform`} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className={`relative z-10 py-20 ${isDark ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of traders using our platform to automate their success and maximize profits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                  <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                  Start Trading Now
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/signals">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Activity className="h-5 w-5 mr-2" />
                  View Live Signals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>TradingBot</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2024 TradingBot. Professional Trading Automation.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}