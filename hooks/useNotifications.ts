'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/components/notifications/NotificationProvider';

// Custom hook for trading-specific notifications
export function useTradingNotifications() {
  const { addNotification } = useNotifications();

  const notifyTradeSuccess = (pair: string, direction: string, profit: number) => {
    addNotification({
      type: 'success',
      title: 'Trade Executed Successfully',
      message: `${pair} ${direction} - Profit: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`,
      read: false,
      data: { pair, direction, profit }
    });
  };

  const notifyNewSignal = (pair: string, direction: string, time: string) => {
    addNotification({
      type: 'info',
      title: 'New Signal Received',
      message: `${pair} ${direction} at ${time}`,
      read: false,
      data: { pair, direction, time }
    });
  };

  const notifyLowPayout = (pair: string, payout: number, threshold: number = 75) => {
    addNotification({
      type: 'warning',
      title: 'Low Payout Detected',
      message: `${pair} payout: ${payout}% (below ${threshold}% threshold)`,
      read: false,
      data: { pair, payout, threshold }
    });
  };

  const notifyTargetReached = (profit: number, target: number) => {
    addNotification({
      type: 'success',
      title: 'Daily Target Reached',
      message: `Profit: $${profit} / $${target} target achieved`,
      read: false,
      data: { profit, target }
    });
  };

  const notifyConnectionIssue = (service: string, message: string) => {
    addNotification({
      type: 'error',
      title: 'Connection Issue',
      message: `${service}: ${message}`,
      read: false,
      data: { service }
    });
  };

  const notifyTradingStopped = (reason: string) => {
    addNotification({
      type: 'warning',
      title: 'Trading Stopped',
      message: reason,
      read: false,
      data: { reason }
    });
  };

  return {
    notifyTradeSuccess,
    notifyNewSignal,
    notifyLowPayout,
    notifyTargetReached,
    notifyConnectionIssue,
    notifyTradingStopped,
  };
}

// Custom hook for system notifications
export function useSystemNotifications() {
  const { addNotification } = useNotifications();

  const notifySystemUpdate = (message: string) => {
    addNotification({
      type: 'info',
      title: 'System Update',
      message,
      read: false,
    });
  };

  const notifyError = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      read: false,
    });
  };

  const notifySuccess = (title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      read: false,
    });
  };

  const notifyWarning = (title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      read: false,
    });
  };

  return {
    notifySystemUpdate,
    notifyError,
    notifySuccess,
    notifyWarning,
  };
}