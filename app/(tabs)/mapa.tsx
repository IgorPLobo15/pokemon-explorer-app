import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Callout, Marker, Region } from 'react-native-maps';

import { useAppColors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type WildPokemonPin = {
  id: string;
  title: string;
  description: string;
  coordinate: Coordinate;
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};
const PINS_COUNT = 10;
const RADIUS_KM = 5;
/** Espaço para tab bar flutuante + safe area inferior */
const TAB_BAR_EXTRA = 100;

const generateRandomPins = (
  center: Coordinate,
  count: number,
  radiusKm: number
): WildPokemonPin[] => {
  const earthRadiusKm = 6371;
  const latRad = (center.latitude * Math.PI) / 180;

  return Array.from({ length: count }, (_, index) => {
    const distance = Math.random() * radiusKm;
    const angle = Math.random() * 2 * Math.PI;
    const angularDistance = distance / earthRadiusKm;

    const dLat = angularDistance * Math.cos(angle);
    const dLng = angularDistance * Math.sin(angle) / Math.cos(latRad);

    const latitude = center.latitude + (dLat * 180) / Math.PI;
    const longitude = center.longitude + (dLng * 180) / Math.PI;
    const pinNumber = index + 1;

    return {
      id: `wild-${pinNumber}`,
      title: `Pokémon selvagem #${pinNumber}`,
      description: 'Um Pokémon apareceu por perto. Toque para investigar.',
      coordinate: { latitude, longitude },
    };
  });
};

export default function MapaScreen() {
  const colors = useAppColors();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const pinsRef = useRef<WildPokemonPin[]>([]);
  const lastFocusedPinIndexRef = useRef<number | null>(null);
  const isFocusedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [pins, setPins] = useState<WildPokemonPin[]>([]);

  const zoomToRandomPin = useCallback(() => {
    if (!mapRef.current || pinsRef.current.length === 0) {
      return;
    }

    let randomIndex = Math.floor(Math.random() * pinsRef.current.length);
    if (pinsRef.current.length > 1 && randomIndex === lastFocusedPinIndexRef.current) {
      randomIndex = (randomIndex + 1) % pinsRef.current.length;
    }
    lastFocusedPinIndexRef.current = randomIndex;

    const targetPin = pinsRef.current[randomIndex];
    mapRef.current.animateToRegion(
      {
        ...targetPin.coordinate,
        latitudeDelta: DEFAULT_DELTA.latitudeDelta / 1.5,
        longitudeDelta: DEFAULT_DELTA.longitudeDelta / 1.5,
      },
      800
    );
  }, []);

  const loadLocationAndPins = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Permissão de localização negada. Ative nas configurações do app.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const center = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      const initialRegion: Region = {
        ...center,
        ...DEFAULT_DELTA,
      };
      setRegion(initialRegion);

      if (pinsRef.current.length === 0) {
        pinsRef.current = generateRandomPins(center, PINS_COUNT, RADIUS_KM);
      }
      setPins(pinsRef.current);

      if (isFocusedRef.current) {
        requestAnimationFrame(() => zoomToRandomPin());
      }
    } catch {
      setError('Não foi possível carregar sua localização no momento.');
    } finally {
      setLoading(false);
    }
  }, [zoomToRandomPin]);

  useEffect(() => {
    void loadLocationAndPins();
  }, [loadLocationAndPins]);

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      zoomToRandomPin();

      return () => {
        isFocusedRef.current = false;
      };
    }, [zoomToRandomPin])
  );

  const mapEdgePadding = {
    top: headerHeight,
    right: 12,
    bottom: Math.max(insets.bottom, 12) + TAB_BAR_EXTRA,
    left: 12,
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: headerHeight },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Obtendo sua localização...
        </Text>
      </View>
    );
  }

  if (error || !region) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: headerHeight },
        ]}
      >
        <Text style={[styles.errorTitle, { color: colors.text, fontFamily: fonts.title }]}>
          Não foi possível abrir o mapa
        </Text>
        <Text style={[styles.errorText, { color: colors.textMuted, fontFamily: fonts.body }]}>
          {error ?? 'Erro desconhecido de localização.'}
        </Text>

        <View style={styles.buttonsRow}>
          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.surfaceContainer }]}
            onPress={() => void Linking.openSettings()}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text, fontFamily: fonts.bodyMedium }]}>
              Abrir configurações
            </Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => void loadLocationAndPins()}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: fonts.labelCaps }]}>Tentar novamente</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        mapPadding={mapEdgePadding}
        showsUserLocation
        showsMyLocationButton
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={pin.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            calloutAnchor={{ x: 0.5, y: 0 }}
          >
            <View
              style={[
                styles.customMarker,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="flash" size={18} color={colors.primary} />
            </View>
            <Callout tooltip>
              <View style={styles.calloutWrapper}>
                <View style={[styles.calloutContent, { backgroundColor: colors.surface }]}>
                  <Text
                    numberOfLines={1}
                    style={[styles.calloutTitle, { color: colors.text, fontFamily: fonts.title }]}
                  >
                    {pin.title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.calloutDescription,
                      { color: colors.textMuted, fontFamily: fonts.body },
                    ]}
                  >
                    {pin.description}
                  </Text>
                </View>
                <View style={[styles.calloutArrow, { borderTopColor: colors.surface }]} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  infoText: {
    marginTop: 10,
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  calloutWrapper: {
    alignItems: 'center',
    width: 240,
  },
  calloutContent: {
    width: 240,
    padding: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  calloutTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  calloutArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderLeftWidth: 8,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
    marginTop: -1,
  },
});
