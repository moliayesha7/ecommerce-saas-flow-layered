import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Store, CreditCard, TrendingUp, ShoppingBag, Clock, UserCheck } from 'lucide-react';
import { Stat, Skeleton, Card, CardHeader, CardTitle, CardContent } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { dashboardApi } from '../../api/dashboard.api';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardApi.getAdminStats(),
    select: (res) => res.data.data,
  });

  const stats = [
    {
      title: 'Total Tenants',
      value: data?.totalTenants ?? 0,
      icon: <Store className="h-5 w-5" />,
      iconColor: 'bg-primary-100 text-primary-700',
    },
    {
      title: 'Active Subscribers',
      value: data?.activeTenants ?? 0,
      icon: <UserCheck className="h-5 w-5" />,
      iconColor: 'bg-success-50 text-success-700',
    },
    {
      title: 'Pending Approvals',
      value: data?.pendingTenants ?? 0,
      icon: <Clock className="h-5 w-5" />,
      iconColor: 'bg-warning-50 text-warning-700',
    },
    {
      title: 'Platform Revenue',
      value: formatCurrency(data?.totalRevenue ?? 0),
      icon: <CreditCard className="h-5 w-5" />,
      iconColor: 'bg-primary-100 text-primary-700',
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders ?? 0,
      icon: <ShoppingBag className="h-5 w-5" />,
      iconColor: 'bg-secondary-100 text-secondary-700',
    },
    {
      title: 'Pending Orders',
      value: data?.pendingOrders ?? 0,
      icon: <Clock className="h-5 w-5" />,
      iconColor: 'bg-warning-50 text-warning-700',
    },
    {
      title: 'Active Customers',
      value: data?.activeCustomers ?? 0,
      icon: <Users className="h-5 w-5" />,
      iconColor: 'bg-primary-100 text-primary-700',
    },
    {
      title: 'Growth',
      value: '+12.4%',
      change: 12.4,
      changeLabel: 'vs last month',
      icon: <TrendingUp className="h-5 w-5" />,
      iconColor: 'bg-success-50 text-success-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-sm text-secondary-500">Platform overview and key metrics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : stats.map((stat) => (
              <Stat
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeLabel={stat.changeLabel}
                icon={stat.icon}
                iconColor={stat.iconColor}
              />
            ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tenant Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary-500">
              View and manage recently registered tenants from the Tenants page.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['API Server', 'Database', 'Redis Cache', 'Mail Service'].map((service) => (
                <div key={service} className="flex items-center justify-between text-sm">
                  <span className="text-secondary-700">{service}</span>
                  <span className="flex items-center gap-1.5 text-success-700">
                    <span className="h-2 w-2 rounded-full bg-success-500" />
                    Operational
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
