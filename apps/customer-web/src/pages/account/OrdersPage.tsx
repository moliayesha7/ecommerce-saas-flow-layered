import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, ShoppingBag } from 'lucide-react';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Pagination } from '@saas-commerce/ui';
import { formatCurrency, formatDate } from '@saas-commerce/utils';
import { ordersApi } from '../../api/orders.api';

const STATUS_COLORS: Record<string, any> = {
  PENDING: 'warning',
  CONFIRMED: 'primary',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['customer-orders', page],
    queryFn: () => ordersApi.list({ page, limit: 10 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary-300 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-secondary-200" />
        <p className="mt-4 font-medium text-secondary-600">No orders yet</p>
        <Button as={Link} to="/shop" variant="outline" size="sm" className="mt-4">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-secondary-900">My Orders</h2>
      {data.data.map((order: any) => (
        <Card key={order.id}>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-secondary-900">{order.orderNumber}</p>
                <p className="text-sm text-secondary-500">{formatDate(order.createdAt)}</p>
                <p className="text-sm text-secondary-500">{order.items?.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{formatCurrency(order.total)}</p>
                <Badge variant={STATUS_COLORS[order.status] ?? 'secondary'} className="mt-1">
                  {order.status}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button as={Link} to={`/orders/${order.id}`} variant="outline" size="sm">
                <Eye className="mr-1.5 h-3.5 w-3.5" /> View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {data.meta && (
        <Pagination
          currentPage={data.meta.page}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
