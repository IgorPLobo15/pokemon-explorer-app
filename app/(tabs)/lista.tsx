import { StyleSheet, Text, View } from 'react-native';

export default function ListaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Pokémon</Text>
      <Text style={styles.subtitle}>Em breve: listagem da PokéAPI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
});
