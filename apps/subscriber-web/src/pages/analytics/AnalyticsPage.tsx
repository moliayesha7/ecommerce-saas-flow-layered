import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Stat } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { TrendingUp, ShoppingCart, Users, Package } from 'lucide-react';
import { apiClient } from '../../api/client';

function fetchAnalytics(period: string) {
  return apiClient.get('/subscriber/analytics', { params: { period } }).then((r) => r.data.data);
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['subscriber-analytics', period],
    queryFn: () => fetchAnalytics(period),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Revenue" value={formatCurrency(data?.revenue ?? 0)} icon={<TrendingUp className="h-5 w-5" />} change={data?.revenueGrowth} />
            <Stat label="Orders" value={data?.orders ?? 0} icon={<ShoppingCart className="h-5 w-5" />} change={data?.ordersGrowth} />
            <Stat label="New Customers" value={data?.newCustomers ?? 0} icon={<Users className="h-5 w-5" />} />
            <Stat label="Avg Order Value" value={formatCurrency(data?.avgOrderValue ?? 0)} icon={<Package className="h-5 w-5" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Sales by Category</CardTitle></CardHeader>
              <CardContent>
                {data?.salesByCategory?.length > 0 ? (
                  <div className="space-y-3">
                    {data.salesByCategory.map((item: any) => (
                      <div key={item.category} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-medium text-secondary-700">{item.category}</span>
                            <span className="text-secondary-500">{formatCurrency(item.revenue)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary-100">
                            <div
                              className="h-2 rounded-full bg-primary-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary-400">No data yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
              <CardContent>
                {data?.topProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {data.topProducts.map((product: any, idx: number) => (
                      <div key={product.id} className="flex items-center gap-3 text-sm">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {idx + 1}
                        </span>
                        <span className="flex-1 font-medium text-secondary-700">{product.name}</span>
                        <span className="text-secondary-500">{product.soldCount} sold</span>
                        <span className="font-medium">{formatCurrency(product.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary-400">No data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
