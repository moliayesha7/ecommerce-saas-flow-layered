import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Badge, Card, CardContent, Modal, ConfirmDialog } from '@saas-commerce/ui';
import { formatCurrency } from '@saas-commerce/utils';
import { discountsApi } from '../../api/discounts.api';

const schema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().positive('Value must be positive'),
  minOrderAmount: z.coerce.number().optional(),
  maxUses: z.coerce.number().int().optional(),
  expiresAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function DiscountsListPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriber-coupons'],
    queryFn: () => discountsApi.list({ limit: 100 }),
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PERCENTAGE' },
  });
  const type = watch('type');

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => discountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-coupons'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-coupons'] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Discounts & Coupons</h1>
        <Button size="sm" onClick={() => { reset(); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary-100" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-200 text-left text-xs font-medium uppercase text-secondary-500">
                    <th className="pb-3 pr-4">Code</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Value</th>
                    <th className="pb-3 pr-4">Uses</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {data?.data?.map((coupon: any) => (
                    <tr key={coupon.id} className="hover:bg-secondary-50">
                      <td className="py-3 pr-4 font-mono font-semibold text-secondary-900">{coupon.code}</td>
                      <td className="py-3 pr-4 text-secondary-600">{coupon.type}</td>
                      <td className="py-3 pr-4 font-medium">
                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                      </td>
                      <td className="py-3 pr-4 text-secondary-600">
                        {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={coupon.isActive ? 'success' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(coupon.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!data?.data?.length && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-secondary-400">No coupons yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Coupon">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input label="Code" {...register('code')} error={errors.code?.message} placeholder="SAVE20" />
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">Type</label>
            <select {...register('type')} className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>
          <Input
            label={type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount Amount (BDT)'}
            type="number"
            step="0.01"
            {...register('value')}
            error={errors.value?.message}
          />
          <Input label="Min Order Amount (optional)" type="number" {...register('minOrderAmount')} />
          <Input label="Max Uses (optional)" type="number" {...register('maxUses')} />
          <Input label="Expires At (optional)" type="datetime-local" {...register('expiresAt')} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Coupon"
        description="This will permanently delete the coupon."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
