import { useColorScheme } from 'react-native';

/** Stitch / Pocket Master — light palette (Pokédex export) */
const stitchLight = {
  background: '#f7f9fc',
  surface: '#ffffff',
  surfaceContainer: '#eceef1',
  surfaceContainerHigh: '#e6e8eb',
  surfaceContainerLow: '#f2f4f7',
  surfaceDim: '#d8dadd',
  text: '#191c1e',
  textMuted: '#5f3f3a',
  outline: '#946e69',
  outlineVariant: '#eabcb6',
  primary: '#bc000a',
  primaryContainer: '#ea000f',
  primaryFixed: '#ffdad5',
  secondary: '#3c4dcb',
  secondaryFixed: '#dfe0ff',
  tertiaryFixed: '#ffe24a',
  tertiaryFixedDim: '#e3c600',
  onPrimary: '#ffffff',
  tabInactive: '#9ca3af',
  headerTint: '#bc000a',
  headerBorder: '#f3f4f6',
  dangerSoft: '#ffdad5',
  shadow: 'rgba(0,0,0,0.08)',
} as const;

/** Dark mode — alinhado ao inverse-surface do Stitch, legível em OLED */
const stitchDark = {
  background: '#2d3133',
  surface: '#252a2d',
  surfaceContainer: '#32383b',
  surfaceContainerHigh: '#3d4448',
  surfaceContainerLow: '#2a2f32',
  surfaceDim: '#1a1d1f',
  text: '#eff1f4',
  textMuted: '#94a3b8',
  outline: '#64748b',
  outlineVariant: '#475569',
  primary: '#ff8a84',
  primaryContainer: '#bc000a',
  primaryFixed: '#5c1a16',
  secondary: '#9ca8ff',
  secondaryFixed: '#2a3166',
  tertiaryFixed: '#ffe24a',
  tertiaryFixedDim: '#b89a00',
  onPrimary: '#1a0504',
  tabInactive: '#64748b',
  headerTint: '#ff8a84',
  headerBorder: '#3d4448',
  dangerSoft: '#5c1a16',
  shadow: 'rgba(0,0,0,0.35)',
} as const;

export type AppThemeColors = typeof stitchLight | typeof stitchDark;

export const appColors: Record<'light' | 'dark', AppThemeColors> = {
  light: stitchLight,
  dark: stitchDark,
};

export type AppTheme = keyof typeof appColors;

export function useAppColors(): AppThemeColors {
  const scheme = useColorScheme();
  return appColors[scheme === 'dark' ? 'dark' : 'light'];
}

/** Gradiente do bloco de imagem do card (Stitch: from-*-fixed → branco) */
export function cardGradientForPrimaryType(type: string): readonly [string, string] {
  const t = type.toLowerCase();
  const map: Record<string, readonly [string, string]> = {
    fire: ['#ffdad5', '#ffffff'],
    water: ['#dfe0ff', '#ffffff'],
    grass: ['#ffe24a', '#ffffff'],
    electric: ['#e3c600', '#ffffff'],
    ice: ['#dfe0ff', '#ffffff'],
    psychic: ['#ffdad5', '#ffffff'],
    fighting: ['#ffdad5', '#ffffff'],
    poison: ['#e0e3e6', '#ffffff'],
    ground: ['#ffe24a', '#ffffff'],
    flying: ['#dfe0ff', '#ffffff'],
    bug: ['#ffe24a', '#ffffff'],
    rock: ['#e0e3e6', '#ffffff'],
    ghost: ['#dfe0ff', '#ffffff'],
    dragon: ['#dfe0ff', '#ffffff'],
    dark: ['#e0e3e6', '#ffffff'],
    steel: ['#e0e3e6', '#ffffff'],
    fairy: ['#ffdad5', '#ffffff'],
    normal: ['#eceef1', '#ffffff'],
  };
  return map[t] ?? (['#eceef1', '#ffffff'] as const);
}
