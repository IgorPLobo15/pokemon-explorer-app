import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { TypeBadge } from '@/components';
import { appColors } from '@/constants/colors';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { Pokemon } from '@/types';

const capitalize = (value: string) =>
  value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

export default function FavoritosScreen() {
  const scheme = useColorScheme();
  const colors = appColors[scheme === 'dark' ? 'dark' : 'light'];
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const loadFavorites = useFavoritesStore((state) => state.loadFavorites);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites])
  );

  const sortedFavorites = useMemo(
    () => [...favorites].sort((a, b) => a.name.localeCompare(b.name)),
    [favorites]
  );

  const handleRemoveFavorite = (pokemon: Pokemon) => {
    Alert.alert(
      'Remover dos favoritos',
      `Deseja remover ${capitalize(pokemon.name)} dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            void removeFavorite(pokemon.id);
          },
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: Pokemon }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <PokemonFavoriteImage imageUrl={item.image} />

      <View style={styles.infoWrapper}>
        <Text style={styles.name}>{capitalize(item.name)}</Text>
        <View style={styles.typesRow}>
          {item.types.map((pokemonType) => (
            <TypeBadge key={`${item.id}-${pokemonType.type.name}`} type={pokemonType.type.name} />
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.removeButton, { backgroundColor: colors.dangerSoft }]}
        onPress={() => handleRemoveFavorite(item)}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );

  if (sortedFavorites.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyEmoji}>💛</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum favorito ainda</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Marque pokémons como favoritos na tela de Lista para vê-los aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favoritos</Text>
        <Text style={[styles.headerCount, { color: colors.textMuted }]}>
          {sortedFavorites.length} favoritos
        </Text>
      </View>

      <FlatList
        data={sortedFavorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function PokemonFavoriteImage({ imageUrl }: { imageUrl: string }) {
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.imageWrapper}>
      <Image
        source={{ uri: imageUrl }}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerCount: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  infoWrapper: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#F3F4F6',
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: 11,
    fontWeight: '600',
  },
  imageFallback: {
    fontSize: 22,
  },
});
