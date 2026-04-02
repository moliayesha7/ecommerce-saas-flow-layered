import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { useWishlistStore } from '../../stores/wishlist.store';
import { useCartStore } from '../../stores/cart.store';

export default function WishlistPage() {
  const { items, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary-300 py-20 text-center">
        <Heart className="h-16 w-16 text-secondary-200" />
        <p className="mt-4 font-medium text-secondary-600">Your wishlist is empty</p>
        <Button as={Link} to="/shop" variant="outline" size="sm" className="mt-4">
          Discover Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-secondary-900">Wishlist ({items.length})</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-xl border border-secondary-200 bg-white p-4"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary-100">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Heart className="h-6 w-6 text-secondary-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to={`/product/${item.slug}`}
                className="line-clamp-2 text-sm font-medium text-secondary-900 hover:text-primary-600"
              >
                {item.name}
              </Link>
              <p className="mt-1 font-semibold text-primary-600">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  addItem({ ...item, quantity: 1 });
                  remove(item.productId);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                title="Move to cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(item.productId)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
