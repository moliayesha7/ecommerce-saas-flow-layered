import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Card, CardContent, Modal, ConfirmDialog } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { apiClient } from '../../api/client';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  zone: z.string().min(1, 'Zone required'),
  rate: z.coerce.number().min(0, 'Rate must be 0 or greater'),
  minOrderFreeShipping: z.coerce.number().optional(),
  estimatedDays: z.coerce.number().int().min(1).optional(),
});
type FormValues = z.infer<typeof schema>;

function fetchShippingRates() {
  return apiClient.get('/subscriber/shipping-rates').then((r) => r.data.data);
}

export default function ShippingZonesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['shipping-rates'], queryFn: fetchShippingRates });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiClient.post('/subscriber/shipping-rates', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/subscriber/shipping-rates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Shipping Zones</h1>
        <Button size="sm" onClick={() => { reset(); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Zone
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary-100" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
              {data?.data?.map((rate: any) => (
                <div key={rate.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-secondary-900">{rate.name}</p>
                    <p className="text-xs text-secondary-500">Zone: {rate.zone}</p>
                    {rate.estimatedDays && (
                      <p className="text-xs text-secondary-400">{rate.estimatedDays} business days</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-secondary-900">{formatCurrency(rate.rate)}</p>
                      {rate.minOrderFreeShipping && (
                        <p className="text-xs text-green-600">Free over {formatCurrency(rate.minOrderFreeShipping)}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(rate.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <p className="py-8 text-center text-sm text-secondary-400">No shipping zones configured</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Shipping Zone">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input label="Zone Name" {...register('name')} error={errors.name?.message} placeholder="Inside Dhaka" />
          <Input label="Zone" {...register('zone')} error={errors.zone?.message} placeholder="Dhaka" />
          <Input label="Rate (BDT)" type="number" step="0.01" {...register('rate')} error={errors.rate?.message} />
          <Input label="Free Shipping Over (BDT, optional)" type="number" {...register('minOrderFreeShipping')} />
          <Input label="Estimated Days" type="number" {...register('estimatedDays')} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Shipping Zone"
        description="This will remove this shipping zone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
