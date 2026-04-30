import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TypeBadge } from '@/components/TypeBadge';
import { cardGradientForPrimaryType, useAppColors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Pokemon } from '@/types';

interface PokemonCardProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  onToggleFavorite: (pokemon: Pokemon) => void;
}

const capitalize = (value: string) =>
  value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

function ShimmerPlaceholder() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return (
    <View style={shimmerStyles.container}>
      <Animated.View
        style={[shimmerStyles.highlight, { transform: [{ translateX }] }]}
      />
    </View>
  );
}

const shimmerStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(236, 238, 241, 0.6)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlight: {
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
  },
});

export function PokemonCard({
  pokemon,
  isFavorite,
  onToggleFavorite,
}: PokemonCardProps) {
  const colors = useAppColors();
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const currentImageRef = useRef(pokemon.image);

  useEffect(() => {
    if (currentImageRef.current !== pokemon.image) {
      currentImageRef.current = pokemon.image;
      fadeAnim.setValue(0);
      setImageReady(false);
      setImageError(false);
    }
  }, [pokemon.image, fadeAnim]);

  const handleLoad = useCallback(() => {
    setImageReady(true);
    setImageError(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleError = useCallback(() => {
    setImageReady(false);
    setImageError(true);
  }, []);

  const primaryType = useMemo(() => {
    const sorted = [...pokemon.types].sort((a, b) => a.slot - b.slot);
    return sorted[0]?.type.name ?? 'normal';
  }, [pokemon.types]);

  const [gradientTop, gradientBottom] = cardGradientForPrimaryType(primaryType);
  const dexNumber = `#${String(pokemon.id).padStart(3, '0')}`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <Pressable
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(pokemon)}
        hitSlop={10}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={22}
          color={isFavorite ? colors.primary : colors.textMuted}
        />
      </Pressable>

      <LinearGradient
        colors={[gradientTop, gradientBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.imageGradient}
      >
        <View style={styles.imageInner}>
          {!imageReady && !imageError && <ShimmerPlaceholder />}
          {imageError && (
            <View style={styles.errorContainer}>
              <Ionicons name="image-outline" size={28} color={colors.textMuted} />
            </View>
          )}
          <Animated.View style={[styles.imageFade, { opacity: fadeAnim }]}>
            <Image
              key={pokemon.id}
              source={{ uri: pokemon.image }}
              style={styles.image}
              resizeMode="contain"
              onLoad={handleLoad}
              onError={handleError}
            />
          </Animated.View>
        </View>
      </LinearGradient>

      <Text style={[styles.dexId, { color: colors.textMuted, fontFamily: fonts.labelCaps }]}>
        {dexNumber}
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.name, { color: colors.text, fontFamily: fonts.title }]}
      >
        {capitalize(pokemon.name)}
      </Text>

      <View style={styles.typesRow}>
        {pokemon.types.map((item) => (
          <TypeBadge key={`${pokemon.id}-${item.type.name}`} type={item.type.name} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 24,
    padding: 12,
    minHeight: 210,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 6,
  },
  imageGradient: {
    width: '100%',
    height: 128,
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  imageInner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  imageFade: {
    ...StyleSheet.absoluteFillObject,
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dexId: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
});
