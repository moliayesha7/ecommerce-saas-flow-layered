import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { Button, Input, Card, CardContent, Modal, ConfirmDialog } from '@saas-commerce/ui';
import { apiClient } from '../../api/client';

const schema = z.object({
  label: z.string().min(1, 'Label required').default('Home'),
  street: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  country: z.string().default('Bangladesh'),
  postalCode: z.string().min(1, 'Required'),
  isDefault: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

function fetchAddresses() {
  return apiClient.get('/customer/addresses').then((r) => r.data.data);
}

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['customer-addresses'],
    queryFn: fetchAddresses,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'Bangladesh', label: 'Home', isDefault: false },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiClient.post('/customer/addresses', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      setModalOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/customer/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-secondary-900">Saved Addresses</h2>
        <Button size="sm" onClick={() => { reset(); setModalOpen(true); }}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : addresses?.data?.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.data.map((addr: any) => (
            <Card key={addr.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                    <div>
                      <p className="font-medium text-secondary-900">{addr.label}</p>
                      {addr.isDefault && (
                        <span className="text-xs font-medium text-primary-600">Default</span>
                      )}
                      <p className="mt-1 text-sm text-secondary-600">{addr.street}</p>
                      <p className="text-sm text-secondary-600">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-sm text-secondary-600">{addr.country}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(addr.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary-300 py-12 text-center">
          <MapPin className="h-12 w-12 text-secondary-200" />
          <p className="mt-3 text-secondary-500">No saved addresses</p>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Address">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <Input label="Label" {...register('label')} error={errors.label?.message} placeholder="Home, Work, etc." />
          <Input label="Street Address" {...register('street')} error={errors.street?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" {...register('city')} error={errors.city?.message} />
            <Input label="State / Division" {...register('state')} error={errors.state?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Postal Code" {...register('postalCode')} error={errors.postalCode?.message} />
            <Input label="Country" {...register('country')} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isDefault')} className="h-4 w-4 rounded border-secondary-300 text-primary-600" />
            <span>Set as default address</span>
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Save Address</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Remove Address"
        description="This will permanently remove this address."
        confirmLabel="Remove"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
