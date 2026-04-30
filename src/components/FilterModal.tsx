import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppColors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { PokemonTypeName } from '@/types';

export interface PokemonFilters {
  type: PokemonTypeName | null;
  generation: string | null;
  habitat: string | null;
  shape: string | null;
  special: 'legendary' | 'mythical' | 'baby' | null;
}

interface FilterModalOptions {
  generations: string[];
  habitats: string[];
  shapes: string[];
}

interface FilterModalProps {
  visible: boolean;
  filters: PokemonFilters;
  types: PokemonTypeName[];
  options: FilterModalOptions;
  resultCount: number;
  onChangeFilters: (filters: PokemonFilters) => void;
  onClear: () => void;
  onClose: () => void;
}

const formatFilterValue = (value: string) =>
  value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export function FilterModal({
  visible,
  filters,
  types,
  options,
  resultCount,
  onChangeFilters,
  onClear,
  onClose,
}: FilterModalProps) {
  const colors = useAppColors();

  const hasActiveFilters =
    filters.type || filters.generation || filters.habitat || filters.shape || filters.special;

  const renderChip = (
    label: string,
    selected: boolean,
    onPress: () => void,
    key: string
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: colors.outlineVariant, backgroundColor: colors.surface },
        selected && {
          borderColor: colors.primary,
          backgroundColor: colors.primaryFixed,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: colors.text, fontFamily: fonts.bodyMedium },
          selected && { color: colors.primary, fontWeight: '700' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayTapArea} onPress={onClose} />
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.title }]}>
              Filtros
            </Text>
            {hasActiveFilters ? (
              <Pressable onPress={onClear} hitSlop={8}>
                <Text style={[styles.clearText, { color: colors.primary, fontFamily: fonts.bodyMedium }]}>
                  Limpar tudo
                </Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
              Tipo
            </Text>
            <View style={styles.chipsContainer}>
              {renderChip('Todos', !filters.type, () => onChangeFilters({ ...filters, type: null }), 'type-all')}
              {types.map((type) =>
                renderChip(
                  formatFilterValue(type),
                  filters.type === type,
                  () => onChangeFilters({ ...filters, type: filters.type === type ? null : type }),
                  `type-${type}`
                )
              )}
            </View>

            {options.generations.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
                  Geração
                </Text>
                <View style={styles.chipsContainer}>
                  {renderChip(
                    'Todas',
                    !filters.generation,
                    () => onChangeFilters({ ...filters, generation: null }),
                    'gen-all'
                  )}
                  {options.generations.map((generation) =>
                    renderChip(
                      formatFilterValue(generation),
                      filters.generation === generation,
                      () =>
                        onChangeFilters({
                          ...filters,
                          generation: filters.generation === generation ? null : generation,
                        }),
                      `gen-${generation}`
                    )
                  )}
                </View>
              </>
            )}

            {options.habitats.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
                  Habitat
                </Text>
                <View style={styles.chipsContainer}>
                  {renderChip(
                    'Todos',
                    !filters.habitat,
                    () => onChangeFilters({ ...filters, habitat: null }),
                    'hab-all'
                  )}
                  {options.habitats.map((habitat) =>
                    renderChip(
                      formatFilterValue(habitat),
                      filters.habitat === habitat,
                      () =>
                        onChangeFilters({
                          ...filters,
                          habitat: filters.habitat === habitat ? null : habitat,
                        }),
                      `hab-${habitat}`
                    )
                  )}
                </View>
              </>
            )}

            {options.shapes.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
                  Forma
                </Text>
                <View style={styles.chipsContainer}>
                  {renderChip(
                    'Todas',
                    !filters.shape,
                    () => onChangeFilters({ ...filters, shape: null }),
                    'shape-all'
                  )}
                  {options.shapes.map((shape) =>
                    renderChip(
                      formatFilterValue(shape),
                      filters.shape === shape,
                      () =>
                        onChangeFilters({
                          ...filters,
                          shape: filters.shape === shape ? null : shape,
                        }),
                      `shape-${shape}`
                    )
                  )}
                </View>
              </>
            )}

            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
              Especial
            </Text>
            <View style={styles.chipsContainer}>
              {renderChip(
                'Nenhum',
                !filters.special,
                () => onChangeFilters({ ...filters, special: null }),
                'special-none'
              )}
              {renderChip(
                'Lendário',
                filters.special === 'legendary',
                () =>
                  onChangeFilters({
                    ...filters,
                    special: filters.special === 'legendary' ? null : 'legendary',
                  }),
                'special-legendary'
              )}
              {renderChip(
                'Mítico',
                filters.special === 'mythical',
                () =>
                  onChangeFilters({
                    ...filters,
                    special: filters.special === 'mythical' ? null : 'mythical',
                  }),
                'special-mythical'
              )}
              {renderChip(
                'Bebê',
                filters.special === 'baby',
                () =>
                  onChangeFilters({
                    ...filters,
                    special: filters.special === 'baby' ? null : 'baby',
                  }),
                'special-baby'
              )}
            </View>
          </ScrollView>

          <Pressable
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text style={[styles.applyButtonText, { fontFamily: fonts.labelCaps }]}>
              Mostrar {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTapArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
  },
  clearText: {
    fontSize: 14,
  },
  scrollArea: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    gap: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 0.8,
  },
});
