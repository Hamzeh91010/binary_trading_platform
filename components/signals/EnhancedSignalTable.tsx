'use client';

import { useState } from 'react';
import { Signal } from '@/lib/types';
import { formatCurrency, formatTime, getStatusColor, getResultColor, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Save, 
  X, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  Clock,
  Lock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
  Calendar,
  Hash,
  Radio,
  Timer,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedSignalTableProps {
  signals: Signal[];
  onUpdateSignal: (messageId: number, data: Partial<Signal>) => void;
  onDeleteSignal: (messageId: number) => void;
  onViewDetails: (signal: Signal) => void;
}

export default function EnhancedSignalTable({ 
  signals, 
  onUpdateSignal, 
  onDeleteSignal, 
  onViewDetails 
}: EnhancedSignalTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Signal>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleEdit = (signal: Signal) => {
    setSelectedSignal(signal);
    setEditData({
      pair: signal.pair,
      base_amount: signal.base_amount,
      entry_time: signal.entry_time,
      direction: signal.direction,
      trade_duration: signal.trade_duration,
      martingale_amounts: signal.martingale_amounts,
      is_available_martingale_level: signal.is_available_martingale_level,
    });
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = (signal: Signal) => {
    setSelectedSignal(signal);
    setIsDetailsDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedSignal && editData) {
      onUpdateSignal(selectedSignal.message_id, editData);
      setIsEditDialogOpen(false);
      setSelectedSignal(null);
      setEditData({});
      toast.success('Signal updated successfully');
    }
  };

  const handleCancel = () => {
    setIsEditDialogOpen(false);
    setSelectedSignal(null);
    setEditData({});
  };

  // Helper function to check if a time has passed (with 10-second buffer)
  const isTimePassed = (timeStr: string, bufferSeconds: number = 10): boolean => {
    if (!timeStr) return false;
    
    const now = currentTime;
    const today = now.toISOString().split('T')[0];
    const targetTime = new Date(`${today}T${timeStr}:00`);
    const bufferTime = new Date(targetTime.getTime() - bufferSeconds * 1000);
    
    return now >= bufferTime;
  };

  // Helper function to get martingale times array
  const getMartingaleTimes = (signal: Signal): string[] => {
    if (typeof signal.martingale_times === 'string') {
      return signal.martingale_times.split(',').map(t => t.trim());
    }
    return Array.isArray(signal.martingale_times) ? signal.martingale_times : [];
  };

  // Helper function to get martingale amounts array
  const getMartingaleAmounts = (signal: Signal): number[] => {
    if (typeof signal.martingale_amounts === 'string') {
      try {
        return JSON.parse(signal.martingale_amounts);
      } catch {
        return [];
      }
    }
    return Array.isArray(signal.martingale_amounts) ? signal.martingale_amounts : [];
  };

  // Check which fields can be edited based on current time
  const getEditableFields = (signal: Signal) => {
    const entryTimePassed = isTimePassed(signal.entry_time);
    const martingaleTimes = getMartingaleTimes(signal);
    
    return {
      canEditBasic: !entryTimePassed, // Can edit basic info if entry time hasn't passed
      canEditMartingale1: !isTimePassed(martingaleTimes[0]),
      canEditMartingale2: !isTimePassed(martingaleTimes[1]),
      canEditMartingale3: !isTimePassed(martingaleTimes[2]),
    };
  };

  return (
    <>
      <div className="space-y-6">
        {/* Enhanced Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Trading Signals</span>
            </CardTitle>
            <CardDescription>
              Manage and monitor your trading signals with real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Signal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Entry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {signals.map((signal) => (
                    <tr key={signal.message_id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                            <Clock className="h-4 w-4 text-gray-400" />
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(signal)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEdit(signal)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Signal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Edit Signal #{selectedSignal?.message_id}</DialogTitle>
                <DialogDescription>
                  Modify signal parameters before execution
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-mono">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </DialogHeader>
          
          {selectedSignal && (
            <div className="space-y-6">
              {/* Editing Rules Info */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Editing Rules:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Fields lock 10 seconds before execution time</li>
                      <li>Past entry times and martingale levels cannot be edited</li>
                      <li>Payout percentage is fixed and cannot be changed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {(() => {
                const editableFields = getEditableFields(selectedSignal);
                const martingaleTimes = getMartingaleTimes(selectedSignal);
                const martingaleAmounts = getMartingaleAmounts(selectedSignal);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Signal Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="pair">Currency Pair</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="pair"
                              value={editData.pair || ''}
                              onChange={(e) => setEditData({ ...editData, pair: e.target.value })}
                              disabled={!editableFields.canEditBasic}
                              className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            />
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {!editableFields.canEditBasic && (
                            <p className="text-xs text-red-500 mt-1">Entry time has passed</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="direction">Direction</Label>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={editData.direction || ''} 
                              onValueChange={(value: 'BUY' | 'SELL') => setEditData({ ...editData, direction: value })}
                              disabled={!editableFields.canEditBasic}
                            >
                              <SelectTrigger className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BUY">BUY</SelectItem>
                                <SelectItem value="SELL">SELL</SelectItem>
                              </SelectContent>
                            </Select>
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="entry_time">Entry Time</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="entry_time"
                              type="time"
                              value={editData.entry_time || ''}
                              onChange={(e) => setEditData({ ...editData, entry_time: e.target.value })}
                              disabled={!editableFields.canEditBasic}
                              className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            />
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="trade_duration">Trade Duration</Label>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={editData.trade_duration || ''} 
                              onValueChange={(value) => setEditData({ ...editData, trade_duration: value })}
                              disabled={!editableFields.canEditBasic}
                            >
                              <SelectTrigger className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30 seconds">30 seconds</SelectItem>
                                <SelectItem value="1 minutes">1 minute</SelectItem>
                                <SelectItem value="3 minutes">3 minutes</SelectItem>
                                <SelectItem value="5 minutes">5 minutes</SelectItem>
                                <SelectItem value="15 minutes">15 minutes</SelectItem>
                                <SelectItem value="30 minutes">30 minutes</SelectItem>
                                <SelectItem value="1 hour">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="payout_percent">Payout Percentage</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="payout_percent"
                              type="number"
                              value={selectedSignal.payout_percent}
                              disabled
                              className="bg-gray-100 dark:bg-gray-800"
                            />
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Payout percentage cannot be edited</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Martingale Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Martingale Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="martingale_levels">Available Martingale Levels</Label>
                          <Select 
                            value={editData.is_available_martingale_level?.toString() || ''} 
                            onValueChange={(value) => setEditData({ ...editData, is_available_martingale_level: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Level</SelectItem>
                              <SelectItem value="2">2 Levels</SelectItem>
                              <SelectItem value="3">3 Levels</SelectItem>
                              <SelectItem value="4">4 Levels</SelectItem>
                              <SelectItem value="5">5 Levels</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Martingale Times Display */}
                        <div>
                          <Label>Martingale Execution Times</Label>
                          <div className="space-y-2 mt-2">
                            {martingaleTimes.map((time, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="text-sm">Level {index + 1}: {time}</span>
                                {isTimePassed(time) ? (
                                  <Lock className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Base Amount */}
                        <div>
                          <Label htmlFor="base_amount">Base Amount</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="base_amount"
                              type="number"
                              step="0.01"
                              value={editData.base_amount || ''}
                              onChange={(e) => setEditData({ ...editData, base_amount: parseFloat(e.target.value) })}
                              disabled={!editableFields.canEditBasic}
                              className={!editableFields.canEditBasic ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            />
                            {!editableFields.canEditBasic && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        {/* Martingale Amounts */}
                        <div className="space-y-3">
                          <Label>Martingale Amounts</Label>
                          
                          {/* Martingale 1 */}
                          <div>
                            <Label htmlFor="mg1" className="text-sm text-gray-600 dark:text-gray-400">Martingale Level 1</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="mg1"
                                type="number"
                                step="0.01"
                                value={martingaleAmounts[1] || ''}
                                onChange={(e) => {
                                  const newAmounts = [...martingaleAmounts];
                                  newAmounts[1] = parseFloat(e.target.value);
                                  setEditData({ ...editData, martingale_amounts: newAmounts });
                                }}
                                disabled={!editableFields.canEditMartingale1}
                                className={!editableFields.canEditMartingale1 ? 'bg-gray-100 dark:bg-gray-800' : ''}
                              />
                              {!editableFields.canEditMartingale1 && (
                                <Lock className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            {!editableFields.canEditMartingale1 && (
                              <p className="text-xs text-red-500 mt-1">Martingale 1 time has passed</p>
                            )}
                          </div>

                          {/* Martingale 2 */}
                          <div>
                            <Label htmlFor="mg2" className="text-sm text-gray-600 dark:text-gray-400">Martingale Level 2</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="mg2"
                                type="number"
                                step="0.01"
                                value={martingaleAmounts[2] || ''}
                                onChange={(e) => {
                                  const newAmounts = [...martingaleAmounts];
                                  newAmounts[2] = parseFloat(e.target.value);
                                  setEditData({ ...editData, martingale_amounts: newAmounts });
                                }}
                                disabled={!editableFields.canEditMartingale2}
                                className={!editableFields.canEditMartingale2 ? 'bg-gray-100 dark:bg-gray-800' : ''}
                              />
                              {!editableFields.canEditMartingale2 && (
                                <Lock className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            {!editableFields.canEditMartingale2 && (
                              <p className="text-xs text-red-500 mt-1">Martingale 2 time has passed</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Signal Details #{selectedSignal?.message_id}</DialogTitle>
                <DialogDescription>
                  Complete information for this trading signal
                </DialogDescription>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span className="font-mono">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </DialogHeader>
          
          {selectedSignal && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Hash className="h-5 w-5 text-blue-500" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Message ID:</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400">#{selectedSignal.message_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Channel Type:</span>
                      <Badge variant="outline">{selectedSignal.channel_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Received At:</span>
                      <span className="text-sm font-mono">{selectedSignal.received_at}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Currency Pair:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{selectedSignal.pair}</span>
                        {selectedSignal.is_otc && <Badge variant="secondary">OTC</Badge>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Direction:</span>
                      <div className="flex items-center space-x-2">
                        {selectedSignal.direction === 'BUY' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={selectedSignal.direction === 'BUY' ? 'default' : 'destructive'}>
                          {selectedSignal.direction}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trade Duration:</span>
                      <span className="text-sm">{selectedSignal.trade_duration}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Trading Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span>Trading Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Base Amount:</span>
                      <span className="font-medium text-green-600">{formatCurrency(selectedSignal.base_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Entry Time:</span>
                      <span className="text-lg font-mono font-bold">{selectedSignal.entry_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">End Time:</span>
                      <span className="text-sm font-mono">{selectedSignal.end_time || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Payout Percentage:</span>
                      <span className="font-medium text-purple-600">{selectedSignal.payout_percent}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Martingale Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-500" />
                      <span>Martingale Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Available Levels:</span>
                      <Badge variant="outline">{selectedSignal.is_available_martingale_level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Trade Level:</span>
                      <Badge variant="outline">{selectedSignal.trade_level}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Martingale Times:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getMartingaleTimes(selectedSignal).map((time, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Martingale Amounts:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getMartingaleAmounts(selectedSignal).map((amount, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {formatCurrency(amount)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status & Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <span>Status & Results</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Status:</span>
                      <Badge className={getStatusColor(selectedSignal.is_status)}>
                        {selectedSignal.is_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trading Result:</span>
                      {selectedSignal.trading_result ? (
                        <Badge variant={selectedSignal.trading_result === 'win' ? 'default' : 'destructive'}>
                          {selectedSignal.trading_result.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Executed:</span>
                      <Badge variant={selectedSignal.is_executed ? 'default' : 'secondary'}>
                        {selectedSignal.is_executed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">OTC Asset:</span>
                      <Badge variant={selectedSignal.is_otc ? 'default' : 'secondary'}>
                        {selectedSignal.is_otc ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-emerald-500" />
                      <span>Financial Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${selectedSignal.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(selectedSignal.total_profit)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Profit</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(selectedSignal.total_staked)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Staked</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`text-2xl font-bold ${
                          selectedSignal.total_staked > 0 
                            ? (selectedSignal.total_profit / selectedSignal.total_staked) >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                            : 'text-gray-600'
                        }`}>
                          {selectedSignal.total_staked > 0 
                            ? `${((selectedSignal.total_profit / selectedSignal.total_staked) * 100).toFixed(1)}%`
                            : 'N/A'
                          }
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Raw Signal Text */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Radio className="h-5 w-5 text-gray-500" />
                      <span>Raw Signal Text</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 dark:bg-gray-800 text-green-400 dark:text-green-300 p-4 rounded-lg font-mono text-sm max-h-32 overflow-y-auto">
                      {selectedSignal.raw_text || 'No raw text available'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}