import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  fetchPokemonDetail,
  fetchPokemonList,
  type PokemonListItem,
} from '@/services/pokeapi';
import type { Pokemon } from '@/types';

const PAGE_SIZE = 20;

interface UsePokemonListResult {
  pokemons: Pokemon[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  retry: () => Promise<void>;
  search: (query: string) => Promise<void>;
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
  const pokemonIndexRef = useRef<PokemonListItem[] | null>(null);
  const searchRequestIdRef = useRef(0);

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

  const getPokemonIndex = useCallback(async (): Promise<PokemonListItem[]> => {
    if (pokemonIndexRef.current) {
      return pokemonIndexRef.current;
    }

    const indexResponse = await fetchPokemonList(0, 2000);
    pokemonIndexRef.current = indexResponse.results;
    return indexResponse.results;
  }, []);

  const retry = useCallback(async () => {
    if (allPokemons.length > 0) {
      await loadPage(offset, true, allPokemons);
      return;
    }
    await loadPage(0, false, []);
  }, [allPokemons, loadPage, offset]);

  const search = useCallback(
    async (value: string) => {
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      queryRef.current = value;

      const normalized = value.trim().toLowerCase();
      if (!normalized) {
        setError(null);
        setVisiblePokemons(allPokemons);
        return;
      }

      const localMatches = applySearch(allPokemons, value);
      setVisiblePokemons(localMatches);

      try {
        const pokemonIndex = await getPokemonIndex();
        if (searchRequestIdRef.current !== requestId) {
          return;
        }

        const matchingNames = pokemonIndex
          .map((item) => item.name)
          .filter((name) => name.includes(normalized))
          .slice(0, PAGE_SIZE);

        if (matchingNames.length === 0) {
          setVisiblePokemons([]);
          setError(null);
          return;
        }

        const existingByName = new Map(allPokemons.map((pokemon) => [pokemon.name, pokemon]));
        const missingNames = matchingNames.filter((name) => !existingByName.has(name));

        if (missingNames.length > 0) {
          const fetchedDetails = await Promise.allSettled(
            missingNames.map((name) => fetchPokemonDetail(name))
          );
          if (searchRequestIdRef.current !== requestId) {
            return;
          }

          const successfulDetails = fetchedDetails.flatMap((result) =>
            result.status === 'fulfilled' ? [result.value] : []
          );
          const mergedById = new Map<number, Pokemon>();
          [...allPokemons, ...successfulDetails].forEach((pokemon) => {
            mergedById.set(pokemon.id, pokemon);
          });

          const mergedList = Array.from(mergedById.values());
          setAllPokemons(mergedList);

          const mergedByName = new Map(mergedList.map((pokemon) => [pokemon.name, pokemon]));
          const searchedList = matchingNames
            .map((name) => mergedByName.get(name))
            .filter((pokemon): pokemon is Pokemon => Boolean(pokemon));
          setVisiblePokemons(searchedList);
          setError(null);
          return;
        }

        const searchedList = matchingNames
          .map((name) => existingByName.get(name))
          .filter((pokemon): pokemon is Pokemon => Boolean(pokemon));
        setVisiblePokemons(searchedList);
        setError(null);
      } catch {
        if (searchRequestIdRef.current !== requestId) {
          return;
        }
        setError('Não foi possível concluir a busca global agora.');
      }
    },
    [allPokemons, applySearch, getPokemonIndex]
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
      retry,
      search,
    }),
    [error, hasMore, loadMore, loading, loadingMore, retry, search, visiblePokemons]
  );
};
