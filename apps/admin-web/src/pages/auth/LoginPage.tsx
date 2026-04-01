import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@saas-commerce/ui';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../stores/auth.store';
import { UserRole } from '@saas-commerce/types';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => authApi.login(data),
    onSuccess: (response) => {
      const { tokens, user } = response.data.data;
      if (user.role !== UserRole.SUPER_ADMIN) {
        setError('email', { message: 'Access denied. Admin credentials required.' });
        return;
      }
      setAuth(
        { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, role: user.role },
        tokens.accessToken,
        tokens.refreshToken,
      );
      navigate('/dashboard');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      setError('password', { message: error.response?.data?.message || 'Login failed' });
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900">Sign In</h2>
      <p className="mt-1 text-sm text-secondary-500">Admin access only</p>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="admin@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Sign In
        </Button>
      </form>
    </div>
  );
}
