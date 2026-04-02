import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-secondary-100 text-secondary-800',
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-success-50 text-success-700',
        warning: 'bg-warning-50 text-warning-700',
        danger: 'bg-danger-50 text-danger-700',
        outline: 'border border-secondary-300 text-secondary-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-secondary-600': variant === 'default',
            'bg-primary-600': variant === 'primary',
            'bg-success-500': variant === 'success',
            'bg-warning-500': variant === 'warning',
            'bg-danger-500': variant === 'danger',
          })}
        />
      )}
      {children}
    </span>
  );
}
