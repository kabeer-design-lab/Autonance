import { Platform, TextStyle } from 'react-native';

// SF Pro is the iOS system font — no import needed, React Native uses it by default.
// SF Mono: use 'Menlo' (pre-installed on iOS, very close to SF Mono).
// fontVariant: ['tabular-nums'] gives aligned digit widths for amounts.

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const fontFamily = {
  regular: undefined,   // SF Pro Text / SF Pro Display (auto by size)
  medium: undefined,
  bold: undefined,
  mono,
} as const;

export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
  amountLg: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  amountMd: {
    fontFamily: mono,
    fontSize: 20,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  amountSm: {
    fontFamily: mono,
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
};
