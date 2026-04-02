import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package } from 'lucide-react';
import { Button, Card, CardContent } from '@saas-commerce/ui';
import { formatCurrency, formatDate } from '@saas-commerce/utils';
import { ordersApi } from '../../api/orders.api';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-confirmation', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="h-20 w-20 text-green-500" />
      </div>
      <h1 className="text-3xl font-bold text-secondary-900">Order Placed!</h1>
      <p className="mt-2 text-secondary-600">
        Thank you for your order. We&apos;ll send you a confirmation soon.
      </p>

      {order && (
        <Card className="mt-8 text-left">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Order Number</p>
                <p className="font-semibold text-secondary-900">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-secondary-500">Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="border-t border-secondary-100 pt-4 space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-secondary-400" />
                    <span className="text-secondary-700">{item.productName} × {item.quantity}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-secondary-100 pt-4 flex justify-between font-semibold text-secondary-900">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>

            <div className="border-t border-secondary-100 pt-4">
              <p className="text-sm text-secondary-500 mb-1">Shipping to</p>
              <p className="text-sm text-secondary-700">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.country}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Button as={Link} to="/orders" variant="outline">View My Orders</Button>
        <Button as={Link} to="/shop">Continue Shopping</Button>
      </div>
    </div>
  );
}
