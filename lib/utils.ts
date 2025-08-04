import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatTime(timeString: string): string {
  try {
    return format(parseISO(timeString), 'HH:mm');
  } catch {
    return timeString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM dd, HH:mm');
  } catch {
    return dateString;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'processing': return 'text-blue-600 bg-blue-100';
    case 'completed': return 'text-green-600 bg-green-100';
    case 'expired': return 'text-gray-600 bg-gray-100';
    case 'failed': return 'text-red-600 bg-red-100';
    case 'limited': return 'text-orange-600 bg-orange-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

export function getResultColor(result?: string): string {
  switch (result) {
    case 'win': return 'text-green-600';
    case 'loss': return 'text-red-600';
    case 'draw': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
}
