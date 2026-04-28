import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  ALL_POKEMON_TYPES,
  FilterModal,
  PokemonCard,
  SearchBar,
} from '@/components';
import { usePokemonList } from '@/hooks/usePokemonList';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { Pokemon } from '@/types';

export default function PokemonListScreen() {
  const { pokemons, loading, loadingMore, error, hasMore, loadMore, search } =
    usePokemonList();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const displayedPokemons = useMemo(() => {
    if (!selectedType) {
      return pokemons;
    }
    return pokemons.filter((pokemon) =>
      pokemon.types.some((item) => item.type.name === selectedType)
    );
  }, [pokemons, selectedType]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    search(value);
  };

  const handleToggleFavorite = async (pokemon: Pokemon) => {
    if (isFavorite(pokemon.id)) {
      await removeFavorite(pokemon.id);
      return;
    }
    await addFavorite(pokemon);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#E63946" />
      </View>
    );
  }

  if (error && pokemons.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorTitle}>Ocorreu um erro</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadMore}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <SearchBar value={searchQuery} onChangeText={handleSearchChange} />
        <Pressable
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="funnel-outline" size={20} color="#E63946" />
        </Pressable>
      </View>

      <FlatList
        data={displayedPokemons}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum pokémon encontrado</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <Pressable
              style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]}
              onPress={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loadMoreText}>Carregar mais</Text>
              )}
            </Pressable>
          ) : null
        }
      />

      <FilterModal
        visible={filterModalVisible}
        selectedType={selectedType}
        types={ALL_POKEMON_TYPES}
        onSelectType={setSelectedType}
        onClear={() => setSelectedType(null)}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadMoreButton: {
    backgroundColor: '#E63946',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: 8,
  },
  loadMoreButtonDisabled: {
    opacity: 0.75,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
    color: '#4B5563',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
