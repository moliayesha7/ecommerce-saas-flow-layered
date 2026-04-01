import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/cn';

interface StatProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function Stat({ title, value, change, changeLabel, icon, iconColor = 'bg-primary-100 text-primary-700', className }: StatProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={cn('rounded-xl border border-secondary-200 bg-white p-6 shadow-card', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-secondary-500">{title}</p>
        {icon && (
          <div className={cn('rounded-lg p-2', iconColor)}>{icon}</div>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-success-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger-500" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-success-700' : 'text-danger-700',
            )}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-sm text-secondary-500">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
