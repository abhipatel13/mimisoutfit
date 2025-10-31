import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';
import { trackFavoriteAdd, trackFavoriteRemove } from '@/services/analytics.service';

interface FavoritesState {
  favorites: Product[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addToFavorites: (product: Product) => {
        const { favorites, isFavorite } = get();
        
        if (!isFavorite(product.id)) {
          set({
            favorites: [...favorites, product],
          });
          
          // Track analytics event
          trackFavoriteAdd(product.id, product.name);
        }
      },
      
      removeFromFavorites: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.filter(
            (favorite) => favorite.id !== productId
          ),
        }));
        
        // Track analytics event
        trackFavoriteRemove(productId);
      },
      
      isFavorite: (productId: string) => {
        return get().favorites.some(
          (favorite) => favorite.id === productId
        );
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'lookbook-favorites',
    }
  )
);