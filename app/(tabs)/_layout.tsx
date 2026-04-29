import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokedexHeader } from '@/components';
import { appColors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useFavoritesStore } from '@/store/useFavoritesStore';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = appColors[scheme === 'dark' ? 'dark' : 'light'];
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12);

  const blurTint = scheme === 'dark' ? 'dark' : 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerBackground: () => (
          <BlurView
            tint={blurTint}
            intensity={Platform.OS === 'ios' ? 80 : 40}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerStyle: {
          backgroundColor: 'transparent',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.headerBorder,
        },
        headerTintColor: colors.primary,
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontFamily: fonts.title,
          fontWeight: '700',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: fonts.label,
          fontSize: 10,
          fontWeight: '500',
          marginBottom: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: bottomPad,
          height: 64,
          borderRadius: 24,
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: 4,
          backgroundColor: Platform.OS === 'android' ? colors.surface : 'transparent',
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint={blurTint}
              intensity={72}
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 24,
                overflow: 'hidden',
              }}
            />
          ) : (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 24,
                backgroundColor:
                  scheme === 'dark' ? 'rgba(37,42,45,0.94)' : 'rgba(255,255,255,0.94)',
              }}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lista',
          headerTitle: () => <PokedexHeader />,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'list' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          headerTitle: () => <PokedexHeader />,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'map' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          headerTitle: () => <PokedexHeader />,
          tabBarBadge: favoritesCount > 0 ? favoritesCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            fontFamily: fonts.labelCaps,
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name={'heart' as IoniconsName} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
