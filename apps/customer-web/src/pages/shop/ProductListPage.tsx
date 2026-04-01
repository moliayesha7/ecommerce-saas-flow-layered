import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { Pagination } from '@saas-commerce/ui';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { ProductCard } from '../../components/ProductCard';
import { useDebounce } from '@saas-commerce/hooks';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') === 'true';

  const debouncedSearch = useDebounce(search, 400);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['storefront-products', page, debouncedSearch, categoryId, minPrice, maxPrice, featured],
    queryFn: () =>
      productsApi.list({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        categoryId: categoryId || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        featured: featured || undefined,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ['storefront-categories'],
    queryFn: categoriesApi.list,
  });

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  const hasFilters = categoryId || minPrice || maxPrice || featured;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            {search ? `Results for "${search}"` : featured ? 'Featured Products' : 'All Products'}
          </h1>
          {productsData?.meta && (
            <p className="text-sm text-secondary-500">{productsData.meta.total} products found</p>
          )}
        </div>
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg border border-secondary-300 px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">!</span>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters sidebar */}
        <aside className={`space-y-6 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="rounded-xl border border-secondary-200 bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-secondary-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary-700">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => updateFilter('categoryId', e.target.value)}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories?.data?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary-700">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full rounded-lg border border-secondary-300 px-2 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full rounded-lg border border-secondary-300 px-2 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-secondary-100" />
              ))}
            </div>
          ) : productsData?.data?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {productsData.data.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {productsData.meta && (
                <div className="mt-8">
                  <Pagination
                    currentPage={productsData.meta.page}
                    totalPages={productsData.meta.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-secondary-300">
              <p className="text-secondary-400">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
