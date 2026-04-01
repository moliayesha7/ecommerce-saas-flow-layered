import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Button } from '@saas-commerce/ui';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { ProductCard } from '../../components/ProductCard';

export default function HomePage() {
  const { data: featuredProducts } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.list({ featured: true, limit: 8 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['storefront-categories'],
    queryFn: categoriesApi.list,
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Shop the Best
          </h1>
          <p className="mt-4 text-lg text-primary-100 sm:text-xl">
            Discover thousands of products from verified merchants
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button as={Link} to="/shop" variant="secondary" size="lg">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories?.data?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-6 text-2xl font-bold text-secondary-900">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.data.slice(0, 6).map((cat: any) => (
              <Link
                key={cat.id}
                to={`/shop?categoryId=${cat.id}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-secondary-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl">🛍️</span>
                </div>
                <span className="text-sm font-medium text-secondary-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary-900">Featured Products</h2>
          <Link
            to="/shop?featured=true"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProducts?.data?.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.data.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-secondary-100" />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-secondary-50 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-bold text-secondary-900">Start Your Own Store</h2>
          <p className="mt-4 text-secondary-600">
            Join thousands of merchants selling on SaaS Commerce
          </p>
          <Button as="a" href="http://localhost:5174/register" variant="primary" size="lg" className="mt-6">
            Become a Merchant
          </Button>
        </div>
      </section>
    </div>
  );
}
