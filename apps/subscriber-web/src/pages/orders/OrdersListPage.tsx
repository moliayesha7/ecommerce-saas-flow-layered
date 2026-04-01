import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { Button, Badge, Card, CardContent, Pagination } from '@saas-commerce/ui';
import { formatCurrency, formatDate } from '@saas-commerce/utils';
import { ordersApi } from '../../api/orders.api';
import { useDebounce } from '@saas-commerce/hooks';

const STATUS_COLORS: Record<string, any> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export default function OrdersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriber-orders', page, debouncedSearch, status],
    queryFn: () => ordersApi.list({ page, limit: 20, search: debouncedSearch || undefined, status: status || undefined }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Orders</h1>

      <Card>
        <CardContent className="pt-4">
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
              <input
                className="w-full rounded-lg border border-secondary-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="Search order number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_COLORS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary-100" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-200 text-left text-xs font-medium uppercase text-secondary-500">
                      <th className="pb-3 pr-4">Order</th>
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {data?.data?.map((order: any) => (
                      <tr key={order.id} className="hover:bg-secondary-50">
                        <td className="py-3 pr-4 font-medium text-secondary-900">{order.orderNumber}</td>
                        <td className="py-3 pr-4 text-secondary-600">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </td>
                        <td className="py-3 pr-4 text-secondary-500">{formatDate(order.createdAt)}</td>
                        <td className="py-3 pr-4 font-medium">{formatCurrency(order.total)}</td>
                        <td className="py-3 pr-4">
                          <Badge variant={STATUS_COLORS[order.status] ?? 'secondary'}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button as={Link} to={`/orders/${order.id}`} variant="ghost" size="icon-sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!data?.data?.length && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-sm text-secondary-400">No orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {data?.meta && (
                <div className="mt-4">
                  <Pagination
                    currentPage={data.meta.page}
                    totalPages={data.meta.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
