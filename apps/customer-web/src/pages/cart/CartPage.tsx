import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { useCartStore } from '../../stores/cart.store';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-20 w-20 text-secondary-200" />
        <h1 className="mt-4 text-2xl font-bold text-secondary-900">Your cart is empty</h1>
        <p className="mt-2 text-secondary-500">Looks like you haven't added anything yet.</p>
        <Button as={Link} to="/shop" className="mt-6">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-secondary-900">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-xl border border-secondary-200 bg-white p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-secondary-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-medium text-secondary-900 hover:text-primary-600 line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="mt-1 font-semibold text-primary-600">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex items-center rounded-lg border border-secondary-300">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center hover:bg-secondary-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center hover:bg-secondary-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="w-20 text-right font-semibold text-secondary-900">
                {formatCurrency(item.price * item.quantity)}
              </span>

              <button
                onClick={() => removeItem(item.productId)}
                className="text-secondary-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-secondary-400 hover:text-red-500 transition-colors"
          >
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-secondary-200 bg-white p-6 h-fit space-y-4">
          <h2 className="text-lg font-semibold text-secondary-900">Order Summary</h2>

          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-secondary-600">
                <span className="truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-secondary-200 pt-4 flex justify-between font-semibold text-secondary-900">
            <span>Subtotal</span>
            <span>{formatCurrency(total())}</span>
          </div>

          <p className="text-xs text-secondary-400">Shipping calculated at checkout</p>

          <Button as={Link} to="/checkout" className="w-full">
            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button as={Link} to="/shop" variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
