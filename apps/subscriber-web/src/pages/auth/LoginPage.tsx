import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '@saas-commerce/ui';
import { useAuthStore } from '../../stores/auth.store';
import { apiClient } from '../../api/client';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => apiClient.post('/auth/login', data).then((r) => r.data.data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    },
  });

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-secondary-900">Merchant Login</h1>
      <p className="mb-6 text-sm text-secondary-500">Sign in to manage your store</p>

      {mutation.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {(mutation.error as any)?.response?.data?.message || 'Login failed'}
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="owner@mystore.com"
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          placeholder="••••••••"
        />
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Sign In
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-secondary-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Register your store
        </Link>
      </p>
    </div>
  );
}
