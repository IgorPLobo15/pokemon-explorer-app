import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { PokemonTypeName } from '@/types';

const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const FALLBACK_COLOR = '#9E9E9E';

export const ALL_POKEMON_TYPES = Object.keys(TYPE_COLORS) as PokemonTypeName[];

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const normalizedType = type.toLowerCase() as PokemonTypeName;
  const backgroundColor = TYPE_COLORS[normalizedType] ?? FALLBACK_COLOR;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.label}>{normalizedType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: fonts.labelCaps,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
