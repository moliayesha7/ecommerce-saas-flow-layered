import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '@saas-commerce/ui';
import { apiClient } from '../../api/client';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiClient.post('/auth/register', data).then((r) => r.data),
    onSuccess: () => navigate('/login'),
  });

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-secondary-900">Create Your Store</h1>
      <p className="mb-6 text-sm text-secondary-500">Start selling on SaaS Commerce</p>

      {mutation.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {(mutation.error as any)?.response?.data?.message || 'Registration failed'}
        </div>
      )}

      {mutation.isSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Account created! Please log in.
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
        </div>
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <Input label="Store Name" {...register('storeName')} error={errors.storeName?.message} placeholder="My Awesome Store" />
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Create Account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-secondary-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
