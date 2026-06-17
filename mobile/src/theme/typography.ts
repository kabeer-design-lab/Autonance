import { TextStyle } from 'react-native';

export const fontFamily = {
  regular:   'DMSans_400Regular',
  medium:    'DMSans_500Medium',
  bold:      'DMSans_700Bold',
  monoMedium: 'DMMono_500Medium',
} as const;

export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h3: {
    fontFamily: fontFamily.medium,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  amountLg: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  amountMd: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 20,
    lineHeight: 24,
  },
  amountSm: {
    fontFamily: fontFamily.monoMedium,
    fontSize: 16,
    lineHeight: 20,
  },
};
