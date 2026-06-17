export const light = {
  background: '#F7F7F5',
  surface: '#FFFFFF',
  surface2: '#F2F2F0',
  surfaceOffset: '#E8E8E5',
  border: '#E0DED8',

  primary: '#01696F',
  primaryLight: '#E6F3F3',
  primaryDark: '#0C4E54',

  income: '#2D7A3A',
  incomeLight: '#E8F5EA',
  expense: '#C0392B',
  expenseLight: '#FDECEA',
  warning: '#D4811A',
  warningLight: '#FEF3E2',

  textPrimary: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textMuted: '#9A9A9A',
  textInverse: '#FFFFFF',
} as const;

export const dark = {
  background: '#111110',
  surface: '#1C1C1A',
  surface2: '#242422',
  surfaceOffset: '#2C2C2A',
  border: '#383836',

  primary: '#4FA8B0',
  primaryLight: '#1A3335',
  primaryDark: '#6EC0C8',

  income: '#5CB870',
  incomeLight: '#1A3320',
  expense: '#E05C4B',
  expenseLight: '#3D1A18',
  warning: '#D4811A',
  warningLight: '#2A2010',

  textPrimary: '#F0EFEC',
  textSecondary: '#A8A8A5',
  textMuted: '#6A6A68',
  textInverse: '#FFFFFF',
} as const;

export const category = {
  Food:          { color: '#E8622A', bg: '#FEF0EA' },
  Transport:     { color: '#2D7DC8', bg: '#EAF3FC' },
  Shopping:      { color: '#9B59B6', bg: '#F5EEF8' },
  Bills:         { color: '#01696F', bg: '#E6F3F3' },
  Entertainment: { color: '#E91E8C', bg: '#FCE8F3' },
  Health:        { color: '#27AE60', bg: '#E8F8EF' },
  Business:      { color: '#2C3E6B', bg: '#E8EAF0' },
  Education:     { color: '#F39C12', bg: '#FEF6E6' },
  Other:         { color: '#7F8C8D', bg: '#F0F2F2' },
} as const;

export type CategoryName = keyof typeof category;
export type Colors = typeof light;
