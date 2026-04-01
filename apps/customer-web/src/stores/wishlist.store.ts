import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const { items } = get();
        const exists = items.find((i) => i.productId === item.productId);
        set({ items: exists ? items.filter((i) => i.productId !== item.productId) : [...items, item] });
      },
      has: (productId) => get().items.some((i) => i.productId === productId),
      remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
    }),
    { name: 'customer-wishlist' },
  ),
);
