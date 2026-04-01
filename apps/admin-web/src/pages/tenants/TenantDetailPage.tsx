import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building, Mail, Phone, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Button } from '@saas-commerce/ui';
import { formatDate } from '@saas-commerce/utils';
import { TenantStatus } from '@saas-commerce/types';
import { tenantsApi } from '../../api/tenants.api';

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenantsApi.findById(id!),
    select: (res) => res.data.data,
    enabled: !!id,
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-60" /></div>;
  if (!tenant) return <p>Tenant not found</p>;

  const statusVariant = tenant.status === TenantStatus.ACTIVE ? 'success'
    : tenant.status === TenantStatus.SUSPENDED ? 'danger'
    : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tenants">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{tenant.name}</h1>
          <p className="text-sm text-secondary-500">/{tenant.slug}</p>
        </div>
        <Badge variant={statusVariant} className="ml-auto">{tenant.status}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-secondary-400" />
              <span className="text-secondary-600">Store name:</span>
              <span className="font-medium">{tenant.name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-secondary-400" />
              <span className="text-secondary-600">Email:</span>
              <span className="font-medium">{tenant.email}</span>
            </div>
            {tenant.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-secondary-400" />
                <span className="text-secondary-600">Phone:</span>
                <span className="font-medium">{tenant.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-secondary-400" />
              <span className="text-secondary-600">Registered:</span>
              <span className="font-medium">{formatDate(tenant.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent>
            {tenant.settings ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-secondary-600">Currency</span><span>{tenant.settings.currency}</span></div>
                <div className="flex justify-between"><span className="text-secondary-600">Timezone</span><span>{tenant.settings.timezone}</span></div>
                <div className="flex justify-between"><span className="text-secondary-600">Tax Rate</span><span>{tenant.settings.taxRate}%</span></div>
                <div className="flex justify-between"><span className="text-secondary-600">Reviews</span><span>{tenant.settings.enableReviews ? 'Enabled' : 'Disabled'}</span></div>
              </div>
            ) : <p className="text-sm text-secondary-500">No settings configured</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
