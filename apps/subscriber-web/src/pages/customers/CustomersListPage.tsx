import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Card, CardContent, Pagination } from '@saas-commerce/ui';
import { formatDate, formatCurrency } from '@saas-commerce/utils';
import { customersApi } from '../../api/customers.api';
import { useDebounce } from '@saas-commerce/hooks';

export default function CustomersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriber-customers', page, debouncedSearch],
    queryFn: () => customersApi.list({ page, limit: 20, search: debouncedSearch || undefined }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Customers</h1>

      <Card>
        <CardContent className="pt-4">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
            <input
              className="w-full rounded-lg border border-secondary-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary-100" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-200 text-left text-xs font-medium uppercase text-secondary-500">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Total Orders</th>
                      <th className="pb-3 pr-4">Total Spent</th>
                      <th className="pb-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {data?.data?.map((customer: any) => (
                      <tr key={customer.id} className="hover:bg-secondary-50">
                        <td className="py-3 pr-4 font-medium text-secondary-900">
                          {customer.firstName} {customer.lastName}
                        </td>
                        <td className="py-3 pr-4 text-secondary-600">{customer.email}</td>
                        <td className="py-3 pr-4 text-secondary-600">{customer.ordersCount ?? 0}</td>
                        <td className="py-3 pr-4 font-medium">{formatCurrency(customer.totalSpent ?? 0)}</td>
                        <td className="py-3 text-secondary-500">{formatDate(customer.createdAt)}</td>
                      </tr>
                    ))}
                    {!data?.data?.length && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-secondary-400">No customers yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {data?.meta && (
                <div className="mt-4">
                  <Pagination
                    currentPage={data.meta.page}
                    totalPages={data.meta.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
