import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button, Input, Badge, Card, CardContent, Modal, ConfirmDialog } from '@saas-commerce/ui';
import { categoriesApi } from '../../api/categories.api';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CategoriesListPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriber-categories'],
    queryFn: () => categoriesApi.list({ limit: 100 }),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => { reset({}); setEditItem(null); setModalOpen(true); };
  const openEdit = (item: any) => { reset(item); setEditItem(item); setModalOpen(true); };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      editItem ? categoriesApi.update(editItem.id, values) : categoriesApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-categories'] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-categories'] });
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Categories</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary-100" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-secondary-100">
              {data?.data?.map((cat: any) => (
                <div key={cat.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-medium text-secondary-900">{cat.name}</span>
                    {cat.description && (
                      <p className="text-xs text-secondary-500">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cat.isActive ? 'success' : 'secondary'}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(cat.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {!data?.data?.length && (
                <p className="py-8 text-center text-sm text-secondary-400">No categories yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {editItem ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Category"
        description="This will permanently delete the category."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
