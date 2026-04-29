export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export interface PokemonStat {
  name: string;
  base_stat: number;
}

export interface PokemonType {
  slot: number;
  type: {
    name: PokemonTypeName;
    url: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  url: string;
  image: string;
  types: PokemonType[];
  stats: PokemonStat[];
  generation?: string;
  habitat?: string | null;
  shape?: string | null;
  isLegendary?: boolean;
  isMythical?: boolean;
  isBaby?: boolean;
}

export interface FavoritePokemon extends Pokemon {
  savedAt: string;
}
