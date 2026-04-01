import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { formatCurrency } from '@saas-commerce/utils';
import { Button } from '@saas-commerce/ui';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={closeCart} />}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-secondary-200 px-4">
          <h2 className="text-lg font-semibold text-secondary-900">
            Cart ({items.length})
          </h2>
          <button onClick={closeCart} className="rounded-md p-2 text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingBag className="h-16 w-16 text-secondary-200" />
            <p className="text-secondary-500">Your cart is empty</p>
            <Button variant="outline" size="sm" onClick={closeCart} as={Link} to="/shop">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 rounded-lg bg-secondary-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-secondary-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-secondary-900 hover:text-primary-600 line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-sm font-semibold text-primary-600">{formatCurrency(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-secondary-300 hover:bg-secondary-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-secondary-300 hover:bg-secondary-100"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-secondary-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-secondary-200 p-4 space-y-3">
              <div className="flex justify-between font-semibold text-secondary-900">
                <span>Total</span>
                <span>{formatCurrency(total())}</span>
              </div>
              <Button
                className="w-full"
                as={Link}
                to="/checkout"
                onClick={closeCart}
              >
                Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={closeCart}>
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
