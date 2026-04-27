import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type { Pokemon } from '@/types';

const FAVORITES_STORAGE_KEY = 'pokemon_favorites';

interface FavoritesState {
  favorites: Pokemon[];
  addFavorite: (pokemon: Pokemon) => Promise<void>;
  removeFavorite: (pokemonId: number) => Promise<void>;
  isFavorite: (pokemonId: number) => boolean;
  loadFavorites: () => Promise<void>;
}

const persistFavorites = async (favorites: Pokemon[]) => {
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

const parseFavorites = (value: string | null): Pokemon[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as Pokemon[];
    }
  } catch {
    return [];
  }

  return [];
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  addFavorite: async (pokemon) => {
    const current = get().favorites;
    if (current.some((favorite) => favorite.id === pokemon.id)) {
      return;
    }

    const nextFavorites = [...current, pokemon];
    set({ favorites: nextFavorites });
    await persistFavorites(nextFavorites);
  },
  removeFavorite: async (pokemonId) => {
    const nextFavorites = get().favorites.filter(
      (favorite) => favorite.id !== pokemonId
    );
    set({ favorites: nextFavorites });
    await persistFavorites(nextFavorites);
  },
  isFavorite: (pokemonId) =>
    get().favorites.some((favorite) => favorite.id === pokemonId),
  loadFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      const favorites = parseFavorites(stored);
      set({ favorites });
    } catch {
      set({ favorites: [] });
    }
  },
}));

void useFavoritesStore.getState().loadFavorites();
