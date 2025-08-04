'use client';

import { useState, useMemo } from 'react';
import { Signal } from '@/lib/types';
import { formatCurrency, formatTime, getStatusColor, getResultColor, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Edit2, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Hash,
  Target
} from 'lucide-react';

interface PremiumSignalsTableProps {
  signals: Signal[];
  onUpdateSignal: (messageId: number, data: Partial<Signal>) => void;
  onDeleteSignal: (messageId: number) => void;
  onViewDetails: (signal: Signal) => void;
  onEdit: (signal: Signal) => void;
}

type SortField = 'message_id' | 'pair' | 'base_amount' | 'entry_time' | 'direction' | 'is_status' | 'trading_result' | 'total_profit' | 'received_at';
type SortDirection = 'asc' | 'desc';

export default function PremiumSignalsTable({ 
  signals, 
  onUpdateSignal, 
  onDeleteSignal, 
  onViewDetails,
  onEdit 
}: PremiumSignalsTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('received_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [pairFilter, setPairFilter] = useState<string>('');

  // Filter and sort data
  const filteredAndSortedSignals = useMemo(() => {
    let filtered = signals.filter(signal => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          signal.pair.toLowerCase().includes(searchLower) ||
          signal.direction.toLowerCase().includes(searchLower) ||
          signal.is_status.toLowerCase().includes(searchLower) ||
          signal.message_id.toString().includes(searchLower) ||
          (signal.trading_result && signal.trading_result.toLowerCase().includes(searchLower)) ||
          (signal.raw_text && signal.raw_text.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && signal.is_status !== statusFilter) return false;
      
      // Direction filter
      if (directionFilter !== 'all' && signal.direction !== directionFilter) return false;
      
      // Result filter
      if (resultFilter !== 'all' && signal.trading_result !== resultFilter) return false;
      
      // Pair filter
      if (pairFilter && !signal.pair.toLowerCase().includes(pairFilter.toLowerCase())) return false;
      
      // Amount range filter
      if (minAmount && signal.base_amount < parseFloat(minAmount)) return false;
      if (maxAmount && signal.base_amount > parseFloat(maxAmount)) return false;
      
      // Date filter
      if (dateFilter !== 'all') {
        const signalDate = new Date(signal.received_at);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - signalDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            if (daysDiff > 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
        }
      }
      
      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Handle different data types
      if (sortField === 'received_at' || sortField === 'entry_time') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [signals, searchTerm, statusFilter, directionFilter, resultFilter, dateFilter, pairFilter, minAmount, maxAmount, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSignals.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = filteredAndSortedSignals.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useState(() => {
    setCurrentPage(1);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDirectionFilter('all');
    setResultFilter('all');
    setDateFilter('all');
    setPairFilter('');
    setMinAmount('');
    setMaxAmount('');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Pair', 'Direction', 'Amount', 'Entry Time', 'Status', 'Result', 'Profit', 'Received At'];
    const csvData = [
      headers,
      ...filteredAndSortedSignals.map(signal => [
        signal.message_id.toString(),
        signal.pair,
        signal.direction,
        signal.base_amount.toString(),
        signal.entry_time,
        signal.is_status,
        signal.trading_result || '',
        signal.total_profit.toString(),
        signal.received_at
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signals-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get unique values for filter dropdowns
  const uniquePairs = [...new Set(signals.map(s => s.pair))];
  const uniqueStatuses = [...new Set(signals.map(s => s.is_status))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Trading Signals</span>
            </CardTitle>
            <CardDescription>
              Advanced data table with filtering, sorting, and pagination
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Basic Filters */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={directionFilter} onValueChange={setDirectionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="BUY">BUY</SelectItem>
                <SelectItem value="SELL">SELL</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all' || directionFilter !== 'all' || resultFilter !== 'all' || dateFilter !== 'all' || pairFilter || minAmount || maxAmount) && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-1 block">Result</label>
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="draw">Draw</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Currency Pair</label>
                <Input
                  placeholder="e.g. EUR/USD"
                  value={pairFilter}
                  onChange={(e) => setPairFilter(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Amount</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Amount</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedSignals.length)} of {filteredAndSortedSignals.length} signals</span>
            {filteredAndSortedSignals.length !== signals.length && (
              <span className="text-blue-600 dark:text-blue-400">
                (filtered from {signals.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span>Show:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('message_id')}
                      className="h-auto p-0 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <Hash className="h-4 w-4 mr-1" />
                      ID
                      {getSortIcon('message_id')}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('pair')}
                      className="h-auto p-0 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Signal
                      {getSortIcon('pair')}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('entry_time')}
                      className="h-auto p-0 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Entry
                      {getSortIcon('entry_time')}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('is_status')}
                      className="h-auto p-0 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <Target className="h-4 w-4 mr-1" />
                      Status
                      {getSortIcon('is_status')}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('trading_result')}
                      className="h-auto p-0 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      Result
                      {getSortIcon('trading_result')}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total_profit')}
                      className="h-auto p-0 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Profit
                      {getSortIcon('total_profit')}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('received_at')}
                      className="h-auto p-0 font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Received
                      {getSortIcon('received_at')}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Activity className="h-12 w-12 text-gray-400 opacity-50" />
                        <p className="text-gray-500 dark:text-gray-400">No signals found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((signal) => (
                    <tr key={signal.message_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
                          #{signal.message_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {signal.direction === 'BUY' ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {signal.pair}
                              </span>
                              {signal.is_otc && (
                                <Badge variant="secondary" className="text-xs">OTC</Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={signal.direction === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                                {signal.direction}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatCurrency(signal.base_amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-1">
                            <span className="font-mono">{formatTime(signal.entry_time)}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {signal.trade_duration}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={cn('text-xs', getStatusColor(signal.is_status))}>
                          {signal.is_status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {signal.trading_result ? (
                          <Badge 
                            className={`${
                              signal.trading_result === 'win' 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {signal.trading_result.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={signal.total_profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {formatCurrency(signal.total_profit)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="font-mono">
                          {new Date(signal.received_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(signal.received_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewDetails(signal)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onEdit(signal)}
                              disabled={signal.is_status === 'completed'}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Signal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDeleteSignal(signal.message_id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}