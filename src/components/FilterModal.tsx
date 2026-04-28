import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  selectedType: string | null;
  types: string[];
  onSelectType: (type: string | null) => void;
  onClear: () => void;
  onClose: () => void;
}

export function FilterModal({
  visible,
  selectedType,
  types,
  onSelectType,
  onClear,
  onClose,
}: FilterModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Filtrar por tipo</Text>

          <View style={styles.chipsContainer}>
            <Pressable
              onPress={() => onSelectType(null)}
              style={[styles.chip, !selectedType && styles.chipSelected]}
            >
              <Text style={[styles.chipText, !selectedType && styles.chipTextSelected]}>
                Todos
              </Text>
            </Pressable>

            {types.slice(0, 18).map((type) => {
              const selected = selectedType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => onSelectType(type)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.secondaryButton} onPress={onClear}>
              <Text style={styles.secondaryButtonText}>Limpar</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Fechar</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    borderColor: '#E63946',
    backgroundColor: '#FDECEC',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#E63946',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  primaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#E63946',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
