import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppColors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

export function PokedexHeader() {
  const colors = useAppColors();

  return (
    <View style={styles.row}>
      <Ionicons name="flash" size={26} color={colors.primary} />
      <Text style={[styles.title, { color: colors.primary }]}>Pokédex</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: 20,
    letterSpacing: -0.4,
  },
});
