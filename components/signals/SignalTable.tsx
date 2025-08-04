'use client';

import { useState } from 'react';
import { Signal } from '@/lib/types';
import { formatCurrency, formatTime, getStatusColor, getResultColor, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X, Trash2 } from 'lucide-react';

interface SignalTableProps {
  signals: Signal[];
  onUpdateSignal: (messageId: number, data: Partial<Signal>) => void;
  onDeleteSignal: (messageId: number) => void;
}

export default function SignalTable({ signals, onUpdateSignal, onDeleteSignal }: SignalTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Signal>>({});

  const handleEdit = (signal: Signal) => {
    setEditingId(signal.message_id);
    setEditData({
      base_amount: signal.base_amount,
      entry_time: signal.entry_time,
      direction: signal.direction,
    });
  };

  const handleSave = () => {
    if (editingId && editData) {
      onUpdateSignal(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pair
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entry Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Direction
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Result
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {signals.map((signal) => (
            <tr key={signal.message_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {signal.pair}
                {signal.is_otc && (
                  <Badge variant="secondary" className="ml-2 text-xs">OTC</Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editingId === signal.message_id ? (
                  <Input
                    type="number"
                    value={editData.base_amount || ''}
                    onChange={(e) => setEditData({ ...editData, base_amount: parseFloat(e.target.value) })}
                    className="w-20"
                  />
                ) : (
                  formatCurrency(signal.base_amount)
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editingId === signal.message_id ? (
                  <Input
                    type="time"
                    value={editData.entry_time || ''}
                    onChange={(e) => setEditData({ ...editData, entry_time: e.target.value })}
                    className="w-24"
                  />
                ) : (
                  formatTime(signal.entry_time)
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editingId === signal.message_id ? (
                  <select
                    value={editData.direction || ''}
                    onChange={(e) => setEditData({ ...editData, direction: e.target.value as 'BUY' | 'SELL' })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                ) : (
                  <Badge variant={signal.direction === 'BUY' ? 'default' : 'destructive'}>
                    {signal.direction}
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={cn('text-xs', getStatusColor(signal.is_status))}>
                  {signal.is_status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {signal.trading_result && (
                  <span className={getResultColor(signal.trading_result)}>
                    {signal.trading_result.toUpperCase()}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={signal.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatCurrency(signal.total_profit)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {editingId === signal.message_id ? (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(signal)}
                      disabled={signal.is_status === 'completed'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteSignal(signal.message_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}