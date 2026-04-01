import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Modal, Input } from '@saas-commerce/ui';
import { formatCurrency, formatDate } from '@saas-commerce/utils';
import { ordersApi } from '../../api/orders.api';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fulfillModal, setFulfillModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['subscriber-order', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => ordersApi.updateStatus(id!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriber-order', id] }),
  });

  const fulfillMutation = useMutation({
    mutationFn: () => ordersApi.fulfill(id!, trackingNumber, carrier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-order', id] });
      setFulfillModal(false);
    },
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-white" />;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-secondary-500 hover:text-secondary-700">← Back</button>
        <h1 className="text-2xl font-bold text-secondary-900">Order {order.orderNumber}</h1>
        <Badge variant="primary">{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-secondary-900">{item.productName}</span>
                      <span className="ml-2 text-secondary-500">× {item.quantity}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 border-t border-secondary-100 pt-4 text-sm">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span><span>{formatCurrency(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-secondary-900">
                  <span>Total</span><span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
            <CardContent className="text-sm text-secondary-600">
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="text-sm text-secondary-600">
              <p className="font-medium text-secondary-900">
                {order.customer?.firstName} {order.customer?.lastName}
              </p>
              <p>{order.customer?.email}</p>
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

          <Card>
            <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {ORDER_STATUSES.map((s) => (
                <Button
                  key={s}
                  variant={order.status === s ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full"
                  disabled={order.status === s}
                  loading={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(s)}
                >
                  {s}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-2"
                onClick={() => setFulfillModal(true)}
              >
                Add Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal open={fulfillModal} onClose={() => setFulfillModal(false)} title="Add Tracking Info">
        <div className="space-y-4">
          <Input
            label="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <Input
            label="Carrier"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="e.g. Pathao, Steadfast"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setFulfillModal(false)}>Cancel</Button>
            <Button onClick={() => fulfillMutation.mutate()} loading={fulfillMutation.isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
