import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Button, Input, Card, CardContent, Modal, Badge } from '@saas-commerce/ui';
import { inventoryApi } from '../../api/inventory.api';

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int(),
  type: z.enum(['RESTOCK', 'ADJUSTMENT', 'DAMAGE']),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function InventoryListPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['subscriber-inventory', lowStockOnly],
    queryFn: () => inventoryApi.list({ lowStock: lowStockOnly || undefined }),
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'RESTOCK' },
  });

  const openAdjust = (productId: string) => {
    setValue('productId', productId);
    setSelectedProductId(productId);
    setModalOpen(true);
  };

  const adjustMutation = useMutation({
    mutationFn: (data: FormValues) => inventoryApi.adjust(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriber-inventory'] });
      setModalOpen(false);
      reset();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Inventory</h1>
        <label className="flex items-center gap-2 text-sm text-secondary-600 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-secondary-300 text-primary-600"
          />
          Low stock only
        </label>
      </div>

      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-secondary-100" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-200 text-left text-xs font-medium uppercase text-secondary-500">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">SKU</th>
                    <th className="pb-3 pr-4">Available</th>
                    <th className="pb-3 pr-4">Reserved</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {data?.data?.map((item: any) => {
                    const isLow = item.availableQuantity <= item.lowStockThreshold;
                    return (
                      <tr key={item.id} className="hover:bg-secondary-50">
                        <td className="py-3 pr-4 font-medium text-secondary-900">{item.product?.name}</td>
                        <td className="py-3 pr-4 text-secondary-500">{item.product?.sku}</td>
                        <td className="py-3 pr-4">
                          <span className={isLow ? 'text-red-600 font-semibold' : ''}>{item.availableQuantity}</span>
                        </td>
                        <td className="py-3 pr-4 text-secondary-500">{item.reservedQuantity}</td>
                        <td className="py-3 pr-4">
                          {isLow ? (
                            <Badge variant="danger" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" /> Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <Button variant="outline" size="xs" onClick={() => openAdjust(item.productId)}>
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {!data?.data?.length && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-secondary-400">No inventory data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Adjust Inventory">
        <form onSubmit={handleSubmit((d) => adjustMutation.mutate(d))} className="space-y-4">
          <input type="hidden" {...register('productId')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">Type</label>
            <select
              {...register('type')}
              className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm"
            >
              <option value="RESTOCK">Restock</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="DAMAGE">Damage/Loss</option>
            </select>
          </div>
          <Input
            label="Quantity (use negative to decrease)"
            type="number"
            {...register('quantity')}
            error={errors.quantity?.message}
          />
          <Input label="Note (optional)" {...register('note')} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={adjustMutation.isPending}>Save Adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
