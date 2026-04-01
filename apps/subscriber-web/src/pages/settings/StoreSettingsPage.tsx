import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@saas-commerce/ui';
import { apiClient } from '../../api/client';

const schema = z.object({
  storeName: z.string().min(2, 'Store name required'),
  storeEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  storePhone: z.string().optional(),
  storeAddress: z.string().optional(),
  currency: z.string().default('BDT'),
  timezone: z.string().default('Asia/Dhaka'),
});
type FormValues = z.infer<typeof schema>;

function fetchSettings() {
  return apiClient.get('/subscriber/settings').then((r) => r.data.data);
}

export default function StoreSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['subscriber-settings'],
    queryFn: fetchSettings,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiClient.patch('/subscriber/settings', data).then((r) => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriber-settings'] }),
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Store Settings</h1>

      {mutation.isSuccess && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Store Name" {...register('storeName')} error={errors.storeName?.message} />
              <Input label="Store Email" type="email" {...register('storeEmail')} error={errors.storeEmail?.message} />
              <Input label="Store Phone" {...register('storePhone')} />
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary-700">Store Address</label>
                <textarea
                  {...register('storeAddress')}
                  rows={3}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Regional Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary-700">Currency</label>
                <select
                  {...register('currency')}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="BDT">BDT - Bangladeshi Taka</option>
                  <option value="USD">USD - US Dollar</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary-700">Timezone</label>
                <select
                  {...register('timezone')}
                  className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={mutation.isPending}>Save Settings</Button>
        </div>
      </form>
    </div>
  );
}
