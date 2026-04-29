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
  onChangeFilters,
  onClear,
  onClose,
}: FilterModalProps) {
  const colors = useAppColors();

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
          selected && { color: colors.primary, fontFamily: fonts.labelCaps },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.title }]}>Filtros</Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
              Tipo
            </Text>
            <View style={styles.chipsContainer}>
              {renderChip('Todos', !filters.type, () => onChangeFilters({ ...filters, type: null }), 'type-all')}
              {types.map((type) =>
                renderChip(
                  formatFilterValue(type),
                  filters.type === type,
                  () => onChangeFilters({ ...filters, type }),
                  `type-${type}`
                )
              )}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
              Geração
            </Text>
            <View style={styles.chipsContainer}>
              {renderChip(
                'Todas',
                !filters.generation,
                () => onChangeFilters({ ...filters, generation: null }),
                'generation-all'
              )}
              {options.generations.map((generation) =>
                renderChip(
                  formatFilterValue(generation),
                  filters.generation === generation,
                  () => onChangeFilters({ ...filters, generation }),
                  `generation-${generation}`
                )
              )}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
              Habitat
            </Text>
            <View style={styles.chipsContainer}>
              {renderChip(
                'Todos',
                !filters.habitat,
                () => onChangeFilters({ ...filters, habitat: null }),
                'habitat-all'
              )}
              {options.habitats.map((habitat) =>
                renderChip(
                  formatFilterValue(habitat),
                  filters.habitat === habitat,
                  () => onChangeFilters({ ...filters, habitat }),
                  `habitat-${habitat}`
                )
              )}
            </View>

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
                  () => onChangeFilters({ ...filters, shape }),
                  `shape-${shape}`
                )
              )}
            </View>

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
                () => onChangeFilters({ ...filters, special: 'legendary' }),
                'special-legendary'
              )}
              {renderChip(
                'Mítico',
                filters.special === 'mythical',
                () => onChangeFilters({ ...filters, special: 'mythical' }),
                'special-mythical'
              )}
              {renderChip(
                'Bebê',
                filters.special === 'baby',
                () => onChangeFilters({ ...filters, special: 'baby' }),
                'special-baby'
              )}
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.surfaceContainer }]}
              onPress={onClear}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text, fontFamily: fonts.bodyMedium }]}>
                Limpar
              </Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={[styles.primaryButtonText, { fontFamily: fonts.labelCaps }]}>
                Fechar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 24,
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  scrollArea: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
