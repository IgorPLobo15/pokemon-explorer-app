import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TypeBadge } from '@/components';
import { useAppColors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { Pokemon } from '@/types';

const TAB_BAR_OFFSET = 100;

const capitalize = (value: string) =>
  value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

export default function FavoritosScreen() {
  const colors = useAppColors();
  const headerHeight = useHeaderHeight();
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
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <PokemonFavoriteImage imageUrl={item.image} />

      <View style={styles.infoWrapper}>
        <Text style={[styles.name, { color: colors.text, fontFamily: fonts.title }]}>
          {capitalize(item.name)}
        </Text>
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
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.background,
            paddingBottom: TAB_BAR_OFFSET,
            paddingTop: headerHeight,
          },
        ]}
      >
        <Text style={styles.emptyEmoji}>💛</Text>
        <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.title }]}>
          Nenhum favorito ainda
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Marque pokémons como favoritos na tela de Lista para vê-los aqui.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: headerHeight },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.headline }]}>
          Meus Favoritos
        </Text>
        <Text style={[styles.headerCount, { color: colors.textMuted, fontFamily: fonts.body }]}>
          {sortedFavorites.length}{' '}
          {sortedFavorites.length === 1 ? 'Pokémon' : 'Pokémons'}
        </Text>
      </View>

      <FlatList
        data={sortedFavorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: TAB_BAR_OFFSET }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function PokemonFavoriteImage({ imageUrl }: { imageUrl: string }) {
  const colors = useAppColors();
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <View style={[styles.imageWrapper, { backgroundColor: colors.surfaceContainer }]}>
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
          <Text style={[styles.imagePlaceholder, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
            Carregando...
          </Text>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerCount: {
    marginTop: 4,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    marginTop: 12,
    padding: 12,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 3,
  },
  image: {
    width: 72,
    height: 72,
  },
  imageWrapper: {
    width: 72,
    height: 72,
    marginRight: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  infoWrapper: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  imagePlaceholder: {
    fontSize: 11,
  },
  imageFallback: {
    fontSize: 22,
  },
});
