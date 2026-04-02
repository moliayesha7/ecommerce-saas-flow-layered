import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, ConfirmDialog } from '@saas-commerce/ui';
import { formatCurrency, formatDate } from '@saas-commerce/utils';
import { ordersApi } from '../../api/orders.api';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['customer-order', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-order', id] });
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
      setCancelOpen(false);
    },
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-white" />;
  if (!order) return <p className="text-secondary-500">Order not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-secondary-500 hover:text-secondary-700">← Back</button>
        <h2 className="text-xl font-bold text-secondary-900">{order.orderNumber}</h2>
        <Badge variant="primary">{order.status}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-secondary-700">{item.productName} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-secondary-100 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-secondary-600">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-secondary-600">
              <span>Shipping</span><span>{formatCurrency(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-secondary-900">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
          <CardContent className="text-sm text-secondary-600">
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.country} {order.shippingAddress?.postalCode}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Order Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-500">Date</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-500">Payment</span>
              <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                {order.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {order.status === 'PENDING' && (
        <Button variant="danger" onClick={() => setCancelOpen(true)}>Cancel Order</Button>
      )}

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel Order"
        variant="danger"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}
