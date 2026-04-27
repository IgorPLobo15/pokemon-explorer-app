import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchPokemonDetail, fetchPokemonList } from '@/services/pokeapi';
import type { Pokemon } from '@/types';

const PAGE_SIZE = 20;

interface UsePokemonListResult {
  pokemons: Pokemon[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  search: (query: string) => void;
}

export const usePokemonList = (): UsePokemonListResult => {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [visiblePokemons, setVisiblePokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const queryRef = useRef('');

  const applySearch = useCallback((list: Pokemon[], value: string) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return list;
    }
    return list.filter((pokemon) => pokemon.name.toLowerCase().includes(normalized));
  }, []);

  const loadPage = useCallback(
    async (pageOffset: number, append: boolean, currentList: Pokemon[]) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const page = await fetchPokemonList(pageOffset, PAGE_SIZE);
        const details = await Promise.all(
          page.results.map((item) => fetchPokemonDetail(item.name))
        );

        const nextAllPokemons = append ? [...currentList, ...details] : details;
        setAllPokemons(nextAllPokemons);
        setVisiblePokemons(applySearch(nextAllPokemons, queryRef.current));
        setOffset(pageOffset + PAGE_SIZE);
        setHasMore(page.next !== null && details.length > 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar pokemons');
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [applySearch]
  );

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) {
      return;
    }
    await loadPage(offset, true, allPokemons);
  }, [allPokemons, hasMore, loadPage, loading, loadingMore, offset]);

  const search = useCallback(
    (value: string) => {
      queryRef.current = value;
      setVisiblePokemons(applySearch(allPokemons, value));
    },
    [allPokemons, applySearch]
  );

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) {
        return;
      }
      await loadPage(0, false, []);
    };

    void initialize();

    return () => {
      mounted = false;
    };
  }, [loadPage]);

  return useMemo(
    () => ({
      pokemons: visiblePokemons,
      loading,
      loadingMore,
      error,
      hasMore,
      loadMore,
      search,
    }),
    [error, hasMore, loadMore, loading, loadingMore, search, visiblePokemons]
  );
};
