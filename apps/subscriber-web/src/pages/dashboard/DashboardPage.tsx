import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import { Stat, Card, CardHeader, CardTitle, CardContent } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { apiClient } from '../../api/client';

function fetchDashboard() {
  return apiClient.get('/subscriber/dashboard').then((r) => r.data.data);
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['subscriber-dashboard'], queryFn: fetchDashboard });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Today's Revenue",
      value: formatCurrency(data?.todayRevenue ?? 0),
      icon: <DollarSign className="h-5 w-5" />,
      change: data?.revenueGrowth,
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(data?.monthRevenue ?? 0),
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: 'Pending Orders',
      value: data?.pendingOrders ?? 0,
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      label: 'Low Stock Items',
      value: data?.lowStockCount ?? 0,
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: "Today's Orders",
      value: data?.todayOrders ?? 0,
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      label: 'Total Customers',
      value: data?.totalCustomers ?? 0,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: 'Total Products',
      value: data?.totalProducts ?? 0,
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: 'Total Orders',
      value: data?.totalOrders ?? 0,
      icon: <ShoppingCart className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Stat
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            change={s.change}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentOrders?.length > 0 ? (
              <div className="space-y-3">
                {data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-secondary-700">{order.orderNumber}</span>
                    <span className="text-secondary-500">{formatCurrency(order.total)}</span>
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary-400">No recent orders</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {data.topProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-secondary-700">{product.name}</span>
                    <span className="text-secondary-500">{product.soldCount} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary-400">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
