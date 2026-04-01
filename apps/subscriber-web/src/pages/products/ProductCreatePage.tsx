import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@saas-commerce/ui';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  comparePrice: z.coerce.number().optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoriesApi.list({ limit: 100 }),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, isFeatured: false, stock: 0 },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-products'] });
      navigate('/products');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-secondary-500 hover:text-secondary-700">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-secondary-900">Add Product</h1>
      </div>

      {mutation.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {(mutation.error as any)?.response?.data?.message || 'Failed to create product'}
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Input label="Name" {...register('name')} error={errors.name?.message} />
                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary-700">Description</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pricing & Inventory</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Price (BDT)" type="number" step="0.01" {...register('price')} error={errors.price?.message} />
                  <Input label="Compare Price" type="number" step="0.01" {...register('comparePrice')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU" {...register('sku')} error={errors.sku?.message} />
                  <Input label="Stock Quantity" type="number" {...register('stock')} error={errors.stock?.message} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary-700">Category</label>
                  <select
                    {...register('categoryId')}
                    className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">No category</option>
                    {categoriesData?.data?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-secondary-300 text-primary-600" />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-secondary-300 text-primary-600" />
                  <span>Featured</span>
                </label>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" loading={mutation.isPending}>
              Create Product
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
