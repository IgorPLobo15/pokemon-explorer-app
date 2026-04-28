import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { TypeBadge } from '@/components/TypeBadge';
import type { Pokemon } from '@/types';

interface PokemonCardProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  onToggleFavorite: (pokemon: Pokemon) => void;
}

const capitalize = (value: string) =>
  value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

export function PokemonCard({
  pokemon,
  isFavorite,
  onToggleFavorite,
}: PokemonCardProps) {
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(pokemon)}
        hitSlop={10}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? '#E63946' : '#7D8597'}
        />
      </Pressable>

      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: pokemon.image }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => {
            setLoadingImage(true);
            setImageError(false);
          }}
          onLoadEnd={() => setLoadingImage(false)}
          onError={() => {
            setLoadingImage(false);
            setImageError(true);
          }}
        />
        {loadingImage && (
          <View style={styles.imageOverlay}>
            <Text style={styles.imagePlaceholder}>Carregando...</Text>
          </View>
        )}
        {imageError && (
          <View style={styles.imageOverlay}>
            <Text style={styles.imageFallback}>🖼️</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{capitalize(pokemon.name)}</Text>

      <View style={styles.typesRow}>
        {pokemon.types.map((item) => (
          <TypeBadge key={`${pokemon.id}-${item.type.name}`} type={item.type.name} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    minHeight: 190,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 90,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243,244,246,0.95)',
  },
  imagePlaceholder: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  imageFallback: {
    fontSize: 22,
  },
});
