import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Badge, Skeleton, Pagination, EmptyState } from '@saas-commerce/ui';
import { formatCurrency, formatDateTime } from '@saas-commerce/utils';
import { PaymentStatus } from '@saas-commerce/types';

const STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  [PaymentStatus.COMPLETED]: 'success',
  [PaymentStatus.FAILED]: 'danger',
  [PaymentStatus.PENDING]: 'warning',
  [PaymentStatus.REFUNDED]: 'default',
};

export default function PaymentsListPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: () => apiClient.get('/admin/payments', { params: { page, limit: 20 } }),
    select: (res) => res.data.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Payments</h1>
        <p className="text-sm text-secondary-500">All platform payment transactions</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-card">
        {isLoading ? (
          <div className="space-y-4 p-6">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !data?.data?.length ? (
          <EmptyState title="No payments found" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-secondary-200 bg-secondary-50">
              <tr>
                {['Order ID', 'Amount', 'Provider', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {data.data.map((payment: Record<string, unknown>) => (
                <tr key={payment.id as string} className="hover:bg-secondary-50">
                  <td className="px-6 py-4 font-mono text-xs text-secondary-600">{(payment.orderId as string)?.slice(0, 8)}...</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(payment.amount as number)}</td>
                  <td className="px-6 py-4 text-sm capitalize">{payment.provider as string}</td>
                  <td className="px-6 py-4">
                    <Badge variant={STATUS_VARIANT[payment.status as string] || 'default'} dot>
                      {payment.status as string}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary-600">{formatDateTime(payment.createdAt as string)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data?.meta?.totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
