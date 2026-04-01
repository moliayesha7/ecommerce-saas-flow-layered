import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button, Badge, Skeleton, Pagination, EmptyState, ConfirmDialog } from '@saas-commerce/ui';
import { formatDate } from '@saas-commerce/utils';
import { TenantStatus } from '@saas-commerce/types';
import { tenantsApi } from '../../api/tenants.api';

const STATUS_MAP: Record<TenantStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'primary' }> = {
  [TenantStatus.ACTIVE]: { label: 'Active', variant: 'success' },
  [TenantStatus.PENDING]: { label: 'Pending', variant: 'warning' },
  [TenantStatus.SUSPENDED]: { label: 'Suspended', variant: 'danger' },
  [TenantStatus.CANCELLED]: { label: 'Cancelled', variant: 'default' },
  [TenantStatus.TRIAL]: { label: 'Trial', variant: 'primary' },
};

export default function TenantsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'suspend' | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', page, search],
    queryFn: () => tenantsApi.findAll({ page, limit: 20, search: search || undefined }),
    select: (res) => res.data.data,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.approve(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.suspend(id, 'Admin suspended'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
  });

  const handleConfirm = () => {
    if (!confirmId) return;
    if (confirmAction === 'approve') approveMutation.mutate(confirmId);
    if (confirmAction === 'suspend') suspendMutation.mutate(confirmId);
    setConfirmId(null);
    setConfirmAction(null);
  };

  const tenants = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Tenants</h1>
          <p className="text-sm text-secondary-500">Manage all registered shop owners</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search tenants..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-card">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <EmptyState title="No tenants found" description="No tenants match your search." />
        ) : (
          <table className="w-full">
            <thead className="border-b border-secondary-200 bg-secondary-50">
              <tr>
                {['Store', 'Email', 'Status', 'Registered', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {tenants.map((tenant: Record<string, string & TenantStatus>) => {
                const statusInfo = STATUS_MAP[tenant.status] || STATUS_MAP[TenantStatus.PENDING];
                return (
                  <tr key={tenant.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary-900">{tenant.name}</div>
                      <div className="text-xs text-secondary-500">/{tenant.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{tenant.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusInfo.variant} dot>{statusInfo.label}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">
                      {formatDate(tenant.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/tenants/${tenant.id}`}>
                          <Button variant="ghost" size="icon-sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {tenant.status === TenantStatus.PENDING && (
                          <Button
                            variant="success"
                            size="xs"
                            onClick={() => { setConfirmId(tenant.id); setConfirmAction('approve'); }}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                        {tenant.status === TenantStatus.ACTIVE && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => { setConfirmId(tenant.id); setConfirmAction('suspend'); }}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        )}
                        {tenant.status === TenantStatus.SUSPENDED && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => tenantsApi.activate(tenant.id).then(() => qc.invalidateQueries({ queryKey: ['tenants'] }))}
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title={confirmAction === 'approve' ? 'Approve Tenant?' : 'Suspend Tenant?'}
        description={confirmAction === 'approve'
          ? 'This tenant will be activated and can start using the platform.'
          : 'This tenant will be suspended and lose access to the platform.'}
        confirmLabel={confirmAction === 'approve' ? 'Approve' : 'Suspend'}
        variant={confirmAction === 'approve' ? 'primary' : 'danger'}
        onConfirm={handleConfirm}
        loading={approveMutation.isPending || suspendMutation.isPending}
      />
    </div>
  );
}
