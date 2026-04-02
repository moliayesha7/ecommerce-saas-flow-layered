import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { ordersApi } from '../../api/orders.api';
import { apiClient } from '../../api/client';

const schema = z.object({
  street: z.string().min(1, 'Street address required'),
  city: z.string().min(1, 'City required'),
  state: z.string().min(1, 'State required'),
  country: z.string().default('Bangladesh'),
  postalCode: z.string().min(1, 'Postal code required'),
  paymentMethod: z.enum(['COD', 'BKASH']),
  couponCode: z.string().optional(),
  shippingRateId: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [couponApplied, setCouponApplied] = useState(false);

  const { data: shippingRates } = useQuery({
    queryKey: ['shipping-rates-checkout'],
    queryFn: () => apiClient.get('/storefront/shipping-rates').then((r) => r.data.data),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'COD', country: 'Bangladesh' },
  });

  const selectedRateId = watch('shippingRateId');
  const selectedRate = shippingRates?.data?.find((r: any) => r.id === selectedRateId);
  const shippingCost = selectedRate ? selectedRate.rate : 0;
  const subtotal = total();
  const grandTotal = subtotal + shippingCost;

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      ordersApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
        },
        paymentMethod: data.paymentMethod,
        couponCode: data.couponCode || undefined,
        shippingRateId: data.shippingRateId || undefined,
      }),
    onSuccess: (order) => {
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-secondary-900">Please sign in to checkout</h1>
        <Button as={Link} to="/login" className="mt-6">Sign In</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-secondary-900">Your cart is empty</h1>
        <Button as={Link} to="/shop" className="mt-6">Shop Now</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-secondary-900">Checkout</h1>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Shipping address */}
            <Card>
              <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input label="Street Address" {...register('street')} error={errors.street?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" {...register('city')} error={errors.city?.message} />
                  <Input label="State / Division" {...register('state')} error={errors.state?.message} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Postal Code" {...register('postalCode')} error={errors.postalCode?.message} />
                  <Input label="Country" {...register('country')} error={errors.country?.message} />
                </div>
              </CardContent>
            </Card>

            {/* Shipping method */}
            {shippingRates?.data?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Shipping Method</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {shippingRates.data.map((rate: any) => (
                    <label key={rate.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-secondary-200 p-3 hover:border-primary-300">
                      <input type="radio" {...register('shippingRateId')} value={rate.id} className="text-primary-600" />
                      <div className="flex-1">
                        <p className="font-medium text-secondary-900">{rate.name}</p>
                        {rate.estimatedDays && (
                          <p className="text-xs text-secondary-500">{rate.estimatedDays} business days</p>
                        )}
                      </div>
                      <span className="font-semibold">
                        {rate.rate === 0 ? 'Free' : formatCurrency(rate.rate)}
                      </span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Payment */}
            <Card>
              <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive the order' },
                  { value: 'BKASH', label: 'bKash', desc: 'Pay securely with bKash mobile banking' },
                ].map((method) => (
                  <label key={method.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-secondary-200 p-3 hover:border-primary-300">
                    <input type="radio" {...register('paymentMethod')} value={method.value} className="text-primary-600" />
                    <div>
                      <p className="font-medium text-secondary-900">{method.label}</p>
                      <p className="text-xs text-secondary-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div className="rounded-xl border border-secondary-200 bg-white p-6 h-fit space-y-4">
            <h2 className="text-lg font-semibold text-secondary-900">Order Summary</h2>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 text-sm">
                  <div className="h-10 w-10 shrink-0 rounded-md bg-secondary-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-secondary-300" />
                      </div>
                    )}
                  </div>
                  <span className="flex-1 truncate text-secondary-700">{item.name} × {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-secondary-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-secondary-600">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-semibold text-secondary-900 pt-2 border-t border-secondary-200">
                <span>Total</span><span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {mutation.error && (
              <p className="text-sm text-red-600">
                {(mutation.error as any)?.response?.data?.message || 'Failed to place order'}
              </p>
            )}

            <Button type="submit" className="w-full" loading={mutation.isPending}>
              Place Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
