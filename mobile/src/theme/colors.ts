export const light = {
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  surface: '#FFFFFF',
  surface2: '#F2F2F7',
  surfaceOffset: '#E5E5EA',
  border: '#E5E5EA',
  borderStrong: '#C6C6C8',

  primary: '#007AFF',
  primaryLight: '#EBF4FF',
  primaryDark: '#0056CC',

  income: '#34C759',
  incomeLight: '#E8F9ED',
  expense: '#FF3B30',
  expenseLight: '#FFF0EF',
  warning: '#FF9500',
  warningLight: '#FFF4E0',

  textPrimary: '#000000',
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',
  textInverse: '#FFFFFF',

  black: '#000000',
  white: '#FFFFFF',
} as const;

export const dark = {
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  surface: '#1C1C1E',
  surface2: '#2C2C2E',
  surfaceOffset: '#3A3A3C',
  border: '#38383A',
  borderStrong: '#48484A',

  primary: '#0A84FF',
  primaryLight: '#001833',
  primaryDark: '#409CFF',

  income: '#30D158',
  incomeLight: '#0D2A14',
  expense: '#FF453A',
  expenseLight: '#2D0B09',
  warning: '#FF9F0A',
  warningLight: '#2A1A00',

  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textMuted: '#636366',
  textInverse: '#000000',

  black: '#000000',
  white: '#FFFFFF',
} as const;

export const category = {
  Food:          { color: '#FF6B00', bg: '#FFF3E8' },
  Transport:     { color: '#007AFF', bg: '#EBF4FF' },
  Shopping:      { color: '#AF52DE', bg: '#F5EAFD' },
  Bills:         { color: '#32ADE6', bg: '#E5F5FB' },
  Entertainment: { color: '#FF2D55', bg: '#FFE8ED' },
  Health:        { color: '#34C759', bg: '#E8F9ED' },
  Business:      { color: '#1C3F6E', bg: '#E3EBF5' },
  Education:     { color: '#FF9500', bg: '#FFF4E0' },
  Other:         { color: '#8E8E93', bg: '#F2F2F7' },
} as const;

export type CategoryName = keyof typeof category;
export type Colors = typeof light;
