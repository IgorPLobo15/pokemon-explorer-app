import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { appColors } from '@/constants/colors';
import { useFavoritesStore } from '@/store/useFavoritesStore';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = appColors[scheme === 'dark' ? 'dark' : 'light'];
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lista',
          headerTitle: 'Lista de Pokémons',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'list' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          headerTitle: 'Mapa de Pokémons',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'map' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          headerTitle: 'Pokémons Favoritos',
          tabBarBadge: favoritesCount > 0 ? favoritesCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: '#FFFFFF',
          },
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'heart' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
