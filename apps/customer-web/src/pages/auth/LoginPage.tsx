import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '@saas-commerce/ui';
import { useAuthStore } from '../../stores/auth.store';
import { authApi } from '../../api/auth.api';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const from = (location.state as any)?.from || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => authApi.login(data.email, data.password),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      navigate(from, { replace: true });
    },
  });

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-secondary-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-secondary-900">Welcome back</h1>
        <p className="mb-6 text-sm text-secondary-500">Sign in to your account</p>

        {mutation.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {(mutation.error as any)?.response?.data?.message || 'Invalid credentials'}
          </div>
        )}

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" className="w-full" loading={mutation.isPending}>Sign In</Button>
        </form>

        <p className="mt-4 text-center text-sm text-secondary-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
