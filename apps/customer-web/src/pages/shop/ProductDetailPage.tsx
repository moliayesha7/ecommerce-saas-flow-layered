import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Heart, Star, Plus, Minus } from 'lucide-react';
import { Button, Card, CardContent } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { productsApi } from '../../api/products.api';
import { reviewsApi } from '../../api/reviews.api';
import { useCartStore } from '../../stores/cart.store';
import { useWishlistStore } from '../../stores/wishlist.store';
import { useAuthStore } from '../../stores/auth.store';
import { ProductCard } from '../../components/ProductCard';
import { cn } from '@saas-commerce/ui';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.get(slug!),
    enabled: !!slug,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', slug],
    queryFn: () => productsApi.related(slug!),
    enabled: !!slug,
  });

  const { data: reviews } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => reviewsApi.list(product!.id),
    enabled: !!product?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create(product!.id, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
      setReview({ rating: 5, comment: '' });
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-secondary-100" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-secondary-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="py-20 text-center text-secondary-500">Product not found</div>;

  const isWishlisted = has(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.images?.[0],
      slug: product.slug,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-secondary-500">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary-600">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/shop?categoryId=${product.category.id}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-secondary-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl bg-secondary-100">
            {product.images?.length > 0 ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="h-24 w-24 text-secondary-200" />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                    activeImage === i ? 'border-primary-500' : 'border-secondary-200',
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <Link
              to={`/shop?categoryId=${product.category.id}`}
              className="inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold text-secondary-900">{product.name}</h1>

          {product.averageRating !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < Math.round(product.averageRating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-secondary-300',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-secondary-500">
                {product.averageRating?.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-600">{formatCurrency(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-secondary-400 line-through">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>

          {product.description && (
            <p className="text-secondary-600 leading-relaxed">{product.description}</p>
          )}

          {/* Stock */}
          {product.stock > 0 ? (
            <p className="text-sm font-medium text-green-600">{product.stock} in stock</p>
          ) : (
            <p className="text-sm font-medium text-red-600">Out of stock</p>
          )}

          {/* Qty + Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-secondary-300">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="flex h-10 w-10 items-center justify-center hover:bg-secondary-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="flex h-10 w-10 items-center justify-center hover:bg-secondary-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <button
              onClick={() => toggle({ productId: product.id, name: product.name, price: product.price, image: product.images?.[0], slug: product.slug })}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-secondary-300 hover:bg-secondary-50"
            >
              <Heart className={cn('h-5 w-5', isWishlisted ? 'fill-red-500 text-red-500' : 'text-secondary-500')} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="mb-6 text-2xl font-bold text-secondary-900">Reviews</h2>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {reviews?.data?.length > 0 ? (
              reviews.data.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-secondary-900">
                          {r.customer?.firstName} {r.customer?.lastName}
                        </p>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn('h-4 w-4', i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-300')} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-secondary-600">{r.comment}</p>}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-secondary-400">No reviews yet. Be the first!</p>
            )}
          </div>

          {user && (
            <div>
              <h3 className="mb-4 font-semibold text-secondary-900">Write a Review</h3>
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-secondary-700">Rating</label>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} onClick={() => setReview((r) => ({ ...r, rating: i + 1 }))}>
                          <Star className={cn('h-6 w-6', i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-300')} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-secondary-700">Comment</label>
                    <textarea
                      rows={4}
                      value={review.comment}
                      onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                      className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <Button
                    className="w-full"
                    loading={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate()}
                  >
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      {relatedProducts?.data?.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-secondary-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.data.slice(0, 4).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
