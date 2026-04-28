export const palette = {
  primary: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  dangerSoft: '#FEE2E2',
} as const;

export const appColors = {
  light: {
    background: palette.gray100,
    surface: palette.white,
    text: palette.gray900,
    textMuted: palette.gray500,
    border: palette.gray200,
    primary: palette.primary,
    tabInactive: palette.gray400,
    headerBackground: palette.primary,
    headerText: palette.white,
    dangerSoft: palette.dangerSoft,
  },
  dark: {
    background: '#0F172A',
    surface: '#111827',
    text: '#F9FAFB',
    textMuted: '#CBD5E1',
    border: '#334155',
    primary: palette.primary,
    tabInactive: '#94A3B8',
    headerBackground: '#1E293B',
    headerText: '#F9FAFB',
    dangerSoft: '#7F1D1D',
  },
} as const;

export type AppTheme = keyof typeof appColors;
