import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
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

const formatFilterValue = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export default function PokemonListScreen() {
  const colors = useAppColors();
  const headerHeight = useHeaderHeight();
  const { pokemons, loading, loadingMore, error, hasMore, loadMore, retry, search } =
    usePokemonList();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PokemonFilters>(INITIAL_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const displayedPokemons = useMemo(() => {
    return pokemons.filter((pokemon) => {
      if (filters.type && !pokemon.types.some((item) => item.type.name === filters.type)) return false;
      if (filters.generation && pokemon.generation !== filters.generation) return false;
      if (filters.habitat && pokemon.habitat !== filters.habitat) return false;
      if (filters.shape && pokemon.shape !== filters.shape) return false;
      if (filters.special === 'legendary' && !pokemon.isLegendary) return false;
      if (filters.special === 'mythical' && !pokemon.isMythical) return false;
      if (filters.special === 'baby' && !pokemon.isBaby) return false;
      return true;
    });
  }, [filters, pokemons]);

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof PokemonFilters; label: string }[] = [];
    if (filters.type) chips.push({ key: 'type', label: formatFilterValue(filters.type) });
    if (filters.generation) chips.push({ key: 'generation', label: formatFilterValue(filters.generation) });
    if (filters.habitat) chips.push({ key: 'habitat', label: formatFilterValue(filters.habitat) });
    if (filters.shape) chips.push({ key: 'shape', label: formatFilterValue(filters.shape) });
    if (filters.special) {
      const specialLabels = { legendary: 'Lendário', mythical: 'Mítico', baby: 'Bebê' } as const;
      chips.push({ key: 'special', label: specialLabels[filters.special] });
    }
    return chips;
  }, [filters]);

  const removeFilter = useCallback(
    (key: keyof PokemonFilters) => {
      setFilters((prev) => ({ ...prev, [key]: null }));
    },
    []
  );

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
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background, paddingTop: headerHeight },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Carregando Pokémons...
        </Text>
      </View>
    );
  }

  if (error && pokemons.length === 0) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: colors.background, paddingTop: headerHeight },
        ]}
      >
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
          <Text style={[styles.retryButtonText, { fontFamily: fonts.labelCaps }]}>
            Tentar novamente
          </Text>
        </Pressable>
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
      <View style={styles.headerRow}>
        <SearchBar value={searchQuery} onChangeText={handleSearchChange} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir filtros"
          style={[
            styles.filterButton,
            {
              backgroundColor: activeFilterChips.length > 0 ? colors.primary : colors.surface,
              borderColor: activeFilterChips.length > 0 ? colors.primary : colors.outlineVariant,
              shadowColor: colors.primary,
            },
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="funnel"
            size={20}
            color={activeFilterChips.length > 0 ? '#FFFFFF' : colors.text}
          />
          {activeFilterChips.length > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.filterBadgeText, { color: colors.primary }]}>
                {activeFilterChips.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {activeFilterChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersRow}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {activeFilterChips.map((chip) => (
            <Pressable
              key={chip.key}
              style={[styles.activeChip, { backgroundColor: colors.primaryFixed }]}
              onPress={() => removeFilter(chip.key)}
            >
              <Text style={[styles.activeChipText, { color: colors.primary, fontFamily: fonts.bodyMedium }]}>
                {chip.label}
              </Text>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
            </Pressable>
          ))}
          <Pressable
            style={[styles.clearAllChip, { borderColor: colors.outlineVariant }]}
            onPress={() => setFilters(INITIAL_FILTERS)}
          >
            <Text style={[styles.clearAllText, { color: colors.textMuted, fontFamily: fonts.bodyMedium }]}>
              Limpar
            </Text>
          </Pressable>
        </ScrollView>
      )}

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
            <Ionicons name="search-outline" size={40} color={colors.outlineVariant} />
            <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: fonts.body }]}>
              {activeFilterChips.length > 0
                ? 'Nenhum resultado para esses filtros'
                : 'Nenhum pokémon encontrado'}
            </Text>
            {activeFilterChips.length > 0 && (
              <Pressable
                style={[styles.clearFiltersBtn, { borderColor: colors.outlineVariant }]}
                onPress={() => setFilters(INITIAL_FILTERS)}
              >
                <Text style={[styles.clearFiltersBtnText, { color: colors.primary, fontFamily: fonts.bodyMedium }]}>
                  Limpar filtros
                </Text>
              </Pressable>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {error && pokemons.length > 0 && (
              <View style={[styles.inlineErrorContainer, { borderColor: colors.outlineVariant }]}>
                <Text style={[styles.inlineErrorText, { color: colors.textMuted, fontFamily: fonts.body }]}>
                  {error}
                </Text>
                <Pressable
                  style={[styles.inlineRetryButton, { backgroundColor: colors.primary }]}
                  onPress={() => void retry()}
                >
                  <Text style={[styles.inlineRetryButtonText, { fontFamily: fonts.labelCaps }]}>
                    Tentar de novo
                  </Text>
                </Pressable>
              </View>
            )}
            {hasMore && (
              <Pressable
                style={[
                  styles.loadMoreButton,
                  { backgroundColor: colors.primary, shadowColor: colors.primary },
                  loadingMore && styles.loadMoreButtonDisabled,
                ]}
                onPress={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={[styles.loadMoreText, { fontFamily: fonts.labelCaps }]}>
                    Carregar mais
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        }
      />

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        types={ALL_POKEMON_TYPES}
        options={availableFilterOptions}
        resultCount={displayedPokemons.length}
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
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
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
  activeFiltersRow: {
    maxHeight: 44,
    marginBottom: 4,
  },
  activeFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeChipText: {
    fontSize: 13,
  },
  clearAllChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 13,
  },
  listContent: {
    paddingTop: 8,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  loadMoreButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  loadMoreButtonDisabled: {
    opacity: 0.7,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  footerContainer: {
    marginTop: 8,
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
  errorTitle: {
    fontSize: 20,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 15,
  },
  retryButton: {
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
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
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  clearFiltersBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearFiltersBtnText: {
    fontSize: 13,
  },
});
