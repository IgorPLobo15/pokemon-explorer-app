import type { Pokemon, PokemonStat, PokemonType } from '@/types';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const OFFICIAL_ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

interface PokemonListItemResponse {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemResponse[];
}

interface PokemonDetailResponse {
  id: number;
  name: string;
  types: PokemonType[];
  stats: PokemonStat[];
}

export interface FetchPokemonListResult {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemResponse[];
}

const getOfficialArtworkUrl = (id: number): string =>
  `${OFFICIAL_ARTWORK_BASE_URL}/${id}.png`;

const mapPokemonDetailToPokemon = (detail: PokemonDetailResponse): Pokemon => {
  return {
    id: detail.id,
    name: detail.name,
    url: `${POKEAPI_BASE_URL}/${detail.id}`,
    image: getOfficialArtworkUrl(detail.id),
    types: detail.types,
    stats: detail.stats,
  };
};

const ensureResponseOk = (response: Response, context: string) => {
  if (!response.ok) {
    throw new Error(`Falha ao ${context}: ${response.status}`);
  }
};

export const fetchPokemonList = async (
  offset = 0,
  limit = 20
): Promise<FetchPokemonListResult> => {
  const response = await fetch(
    `${POKEAPI_BASE_URL}?offset=${offset}&limit=${limit}`
  );
  ensureResponseOk(response, 'buscar lista de pokemons');

  const data = (await response.json()) as PokemonListResponse;

  return {
    count: data.count,
    next: data.next,
    previous: data.previous,
    results: data.results,
  };
};

export const fetchPokemonDetail = async (
  nameOrId: string | number
): Promise<Pokemon> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/${nameOrId}`);
  ensureResponseOk(response, `buscar detalhes do pokemon ${nameOrId}`);

  const data = (await response.json()) as PokemonDetailResponse;

  return mapPokemonDetailToPokemon(data);
};
