import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Badge, Skeleton, Pagination, EmptyState } from '@saas-commerce/ui';
import { formatDate } from '@saas-commerce/utils';
import { UserRole } from '@saas-commerce/types';

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => apiClient.get('/users', { params: { page, limit: 20, search: search || undefined } }),
    select: (res) => res.data.data,
  });

  const ROLE_MAP: Record<string, { label: string; variant: 'primary' | 'success' | 'default' | 'warning' }> = {
    [UserRole.SUPER_ADMIN]: { label: 'Super Admin', variant: 'primary' },
    [UserRole.TENANT_OWNER]: { label: 'Shop Owner', variant: 'success' },
    [UserRole.TENANT_STAFF]: { label: 'Staff', variant: 'default' },
    [UserRole.CUSTOMER]: { label: 'Customer', variant: 'warning' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Users</h1>
        <p className="text-sm text-secondary-500">All registered platform users</p>
      </div>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />

      <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-card">
        {isLoading ? (
          <div className="space-y-4 p-6">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : !data?.data?.length ? (
          <EmptyState title="No users found" />
        ) : (
          <table className="w-full">
            <thead className="border-b border-secondary-200 bg-secondary-50">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {data.data.map((user: Record<string, string>) => {
                const role = ROLE_MAP[user.role] || { label: user.role, variant: 'default' as const };
                return (
                  <tr key={user.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{user.email}</td>
                    <td className="px-6 py-4"><Badge variant={role.variant}>{role.label}</Badge></td>
                    <td className="px-6 py-4">
                      <Badge variant={user.isActive === 'true' || user.isActive ? 'success' : 'danger'} dot>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{formatDate(user.createdAt)}</td>
                  </tr>
                );
              })}
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
