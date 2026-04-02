import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@saas-commerce/ui';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth.api';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      if (accessToken && refreshToken) {
        setAuth(updatedUser, accessToken, refreshToken);
      }
    },
  });

  const { logout } = useAuthStore();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-secondary-900">Profile</h2>

      {mutation.isSuccess && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Profile updated successfully!</div>
      )}

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
              <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary-700">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-500"
              />
            </div>
            <Input label="Phone (optional)" {...register('phone')} />
            <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account Actions</CardTitle></CardHeader>
        <CardContent>
          <Button variant="danger" onClick={logout}>Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
