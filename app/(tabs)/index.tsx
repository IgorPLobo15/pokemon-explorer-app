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
import type { PokemonFilters } from '@/components/FilterModal';
import { useAppColors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { usePokemonList } from '@/hooks/usePokemonList';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import type { Pokemon } from '@/types';

const TAB_BAR_OFFSET = 100;
const isNonEmptyString = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.length > 0;

const INITIAL_FILTERS: PokemonFilters = {
  type: null,
  generation: null,
  habitat: null,
  shape: null,
  special: null,
};

export default function PokemonListScreen() {
  const colors = useAppColors();
  const { pokemons, loading, loadingMore, error, hasMore, loadMore, retry, search } =
    usePokemonList();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PokemonFilters>(INITIAL_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const displayedPokemons = useMemo(() => {
    return pokemons.filter((pokemon) => {
      const matchesType = !filters.type || pokemon.types.some((item) => item.type.name === filters.type);
      const matchesGeneration = !filters.generation || pokemon.generation === filters.generation;
      const matchesHabitat = !filters.habitat || pokemon.habitat === filters.habitat;
      const matchesShape = !filters.shape || pokemon.shape === filters.shape;
      const matchesSpecial =
        !filters.special ||
        (filters.special === 'legendary' && pokemon.isLegendary) ||
        (filters.special === 'mythical' && pokemon.isMythical) ||
        (filters.special === 'baby' && pokemon.isBaby);

      return (
        matchesType &&
        matchesGeneration &&
        matchesHabitat &&
        matchesShape &&
        matchesSpecial
      );
    });
  }, [filters, pokemons]);

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.type ? 1 : 0) +
      (filters.generation ? 1 : 0) +
      (filters.habitat ? 1 : 0) +
      (filters.shape ? 1 : 0) +
      (filters.special ? 1 : 0)
    );
  }, [filters]);

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.type) {
      labels.push(`Tipo: ${filters.type}`);
    }
    if (filters.generation) {
      labels.push(`Geração: ${filters.generation.replace(/-/g, ' ')}`);
    }
    if (filters.habitat) {
      labels.push(`Habitat: ${filters.habitat.replace(/-/g, ' ')}`);
    }
    if (filters.shape) {
      labels.push(`Forma: ${filters.shape.replace(/-/g, ' ')}`);
    }
    if (filters.special) {
      const specialLabel =
        filters.special === 'legendary'
          ? 'Lendário'
          : filters.special === 'mythical'
            ? 'Mítico'
            : 'Bebê';
      labels.push(`Especial: ${specialLabel}`);
    }
    return labels;
  }, [filters]);

  const availableFilterOptions = useMemo(
    () => ({
      generations: Array.from(
        new Set(pokemons.map((pokemon) => pokemon.generation).filter(isNonEmptyString))
      ).sort(),
      habitats: Array.from(
        new Set(pokemons.map((pokemon) => pokemon.habitat).filter(isNonEmptyString))
      ).sort(),
      shapes: Array.from(
        new Set(pokemons.map((pokemon) => pokemon.shape).filter(isNonEmptyString))
      ).sort(),
    }),
    [pokemons]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    void search(value);
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
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && pokemons.length === 0) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text, fontFamily: fonts.title }]}>
          Ocorreu um erro
        </Text>
        <Text style={[styles.errorMessage, { color: colors.textMuted, fontFamily: fonts.body }]}>
          {error}
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => void retry()}
        >
          <Text style={[styles.retryButtonText, { fontFamily: fonts.labelCaps }]}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <SearchBar value={searchQuery} onChangeText={handleSearchChange} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir filtros"
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFiltersCount > 0 ? colors.primary : colors.surface,
              borderColor: activeFiltersCount > 0 ? colors.primary : colors.outlineVariant,
              shadowColor: colors.primary,
            },
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="funnel"
            size={20}
            color={activeFiltersCount > 0 ? '#FFFFFF' : colors.text}
          />
          {activeFiltersCount > 0 ? (
            <View style={[styles.filterBadge, { backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.filterBadgeText, { color: colors.primary, fontFamily: fonts.labelCaps }]}>
                {activeFiltersCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>
      <View style={styles.filtersInfoRow}>
        <Pressable
          style={[styles.filtersCta, { backgroundColor: colors.primaryContainer }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={[styles.filtersCtaText, { fontFamily: fonts.labelCaps }]}>Filtros</Text>
        </Pressable>
        <Text
          numberOfLines={2}
          style={[styles.filtersInfoText, { color: colors.textMuted, fontFamily: fonts.body }]}
        >
          {activeFiltersCount > 0
            ? `${activeFiltersCount} ativo(s): ${activeFilterLabels.join(' • ')}`
            : 'Nenhum filtro ativo'}
        </Text>
      </View>

      <FlatList
        data={displayedPokemons}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: TAB_BAR_OFFSET, paddingHorizontal: 20 },
        ]}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fonts.body }]}>
              Nenhum pokémon encontrado
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {error && pokemons.length > 0 ? (
              <View style={[styles.inlineErrorContainer, { borderColor: colors.outlineVariant }]}>
                <Text style={[styles.inlineErrorText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                  {error}
                </Text>
                <Pressable style={[styles.inlineRetryButton, { backgroundColor: colors.primary }]} onPress={() => void retry()}>
                  <Text style={[styles.inlineRetryButtonText, { fontFamily: fonts.labelCaps }]}>Tentar de novo</Text>
                </Pressable>
              </View>
            ) : null}

            {hasMore ? (
              <Pressable
                style={[
                  styles.loadMoreButton,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                  loadingMore && styles.loadMoreButtonDisabled,
                ]}
                onPress={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={[styles.loadMoreText, { fontFamily: fonts.labelCaps }]}>Carregar mais</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        }
      />

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        types={ALL_POKEMON_TYPES}
        options={availableFilterOptions}
        onChangeFilters={setFilters}
        onClear={() => setFilters(INITIAL_FILTERS)}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 4,
    flexGrow: 1,
  },
  filtersInfoRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filtersCta: {
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersCtaText: {
    color: '#FFFFFF',
    fontSize: 11,
    letterSpacing: 1.1,
  },
  filtersInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  loadMoreButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    marginTop: 12,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  footerContainer: {
    marginTop: 12,
  },
  inlineErrorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  inlineErrorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  inlineRetryButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineRetryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  loadMoreButtonDisabled: {
    opacity: 0.75,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  errorTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
  },
  retryButton: {
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
