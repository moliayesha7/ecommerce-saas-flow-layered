import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Card, CardContent, Badge, Skeleton } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { CheckCircle } from 'lucide-react';

export default function PlansListPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get('/admin/plans', { params: { includeInactive: true } }),
    select: (res) => res.data.data,
  });

  if (isLoading) return <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Subscription Plans</h1>
        <p className="text-sm text-secondary-500">Manage platform subscription tiers</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {(plans || []).map((plan: Record<string, unknown>) => (
          <Card key={plan.id as string} className={plan.isPopular ? 'border-primary-500 ring-1 ring-primary-500' : ''}>
            <CardContent className="p-6">
              {plan.isPopular && <Badge variant="primary" className="mb-3">Most Popular</Badge>}
              <h3 className="text-xl font-bold text-secondary-900">{plan.name as string}</h3>
              <div className="mt-2 text-3xl font-extrabold text-primary-700">
                {formatCurrency(plan.price as number)}
                <span className="text-sm font-normal text-secondary-500">/{plan.interval as string}</span>
              </div>
              {plan.trialDays ? (
                <p className="mt-1 text-xs text-secondary-500">{plan.trialDays as number}-day free trial</p>
              ) : null}
              <ul className="mt-4 space-y-2">
                {((plan.features as string[]) || []).map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary-700">
                    <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-secondary-200 text-xs text-secondary-500 space-y-1">
                {plan.maxProducts ? <div>Max products: {plan.maxProducts as number}</div> : <div>Unlimited products</div>}
                {plan.maxStaff ? <div>Max staff: {plan.maxStaff as number}</div> : <div>Unlimited staff</div>}
                <div>Commission: {plan.commissionRate as number}%</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
