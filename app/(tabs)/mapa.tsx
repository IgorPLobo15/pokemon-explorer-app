import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';

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
  const mapRef = useRef<MapView | null>(null);
  const pinsRef = useRef<WildPokemonPin[]>([]);
  const lastFocusedPinIndexRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [pins, setPins] = useState<WildPokemonPin[]>([]);

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
    } catch {
      setError('Não foi possível carregar sua localização no momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLocationAndPins();
  }, [loadLocationAndPins]);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E63946" />
        <Text style={styles.infoText}>Obtendo sua localização...</Text>
      </View>
    );
  }

  if (error || !region) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Não foi possível abrir o mapa</Text>
        <Text style={styles.errorText}>{error ?? 'Erro desconhecido de localização.'}</Text>

        <View style={styles.buttonsRow}>
          <Pressable style={styles.secondaryButton} onPress={() => void Linking.openSettings()}>
            <Text style={styles.secondaryButtonText}>Abrir configurações</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => void loadLocationAndPins()}>
            <Text style={styles.primaryButtonText}>Tentar novamente</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {pins.map((pin) => (
          <Marker key={pin.id} coordinate={pin.coordinate}>
            <View style={styles.customMarker}>
              <Text style={styles.markerIcon}>⚡</Text>
            </View>
            <Callout>
              <View style={styles.calloutContent}>
                <Text style={styles.calloutTitle}>{pin.title}</Text>
                <Text style={styles.calloutDescription}>{pin.description}</Text>
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
    backgroundColor: '#F3F4F6',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
  },
  infoText: {
    marginTop: 10,
    fontSize: 15,
    color: '#4B5563',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#E63946',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  customMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E63946',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    fontSize: 16,
  },
  calloutContent: {
    maxWidth: 180,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#4B5563',
  },
});
