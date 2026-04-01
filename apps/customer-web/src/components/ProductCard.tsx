import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency } from '@saas-commerce/utils';
import { useCartStore } from '../stores/cart.store';
import { useWishlistStore } from '../stores/wishlist.store';
import type { Product } from '../api/products.api';
import { cn } from '@saas-commerce/ui';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const isWishlisted = has(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
      slug: product.slug,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      slug: product.slug,
    });
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-secondary-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-secondary-300" />
            </div>
          )}
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute left-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              SALE
            </div>
          )}
          <button
            onClick={handleWishlist}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-red-50"
          >
            <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-red-500 text-red-500' : 'text-secondary-400')} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.category && (
            <p className="mb-1 text-xs text-secondary-400">{product.category.name}</p>
          )}
          <h3 className="line-clamp-2 text-sm font-medium text-secondary-900 group-hover:text-primary-600">
            {product.name}
          </h3>

          {product.averageRating !== undefined && product.reviewCount !== undefined && (
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-secondary-500">
                {product.averageRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="font-semibold text-primary-600">{formatCurrency(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="ml-2 text-xs text-secondary-400 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-secondary-300"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>

          {product.stock === 0 && (
            <p className="mt-1 text-xs text-red-500">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
