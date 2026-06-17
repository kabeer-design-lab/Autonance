import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { category, CategoryName, colors, typography, radius, spacing } from '../theme';

const ICONS: Record<CategoryName, keyof typeof Ionicons.glyphMap> = {
  Food:          'restaurant-outline',
  Transport:     'car-outline',
  Shopping:      'bag-outline',
  Bills:         'receipt-outline',
  Entertainment: 'film-outline',
  Health:        'medkit-outline',
  Business:      'briefcase-outline',
  Education:     'school-outline',
  Other:         'ellipsis-horizontal-outline',
};

interface CategoryChipProps {
  name: CategoryName;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CategoryChip({ name, selected = false, onPress, style }: CategoryChipProps) {
  const cat = category[name];
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipDefault,
        style,
      ]}
    >
      <Ionicons
        name={ICONS[name]}
        size={14}
        color={selected ? cat.color : colors.textMuted}
      />
      <Text style={[styles.label, selected ? { color: cat.color } : { color: colors.textSecondary }]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    gap: 5,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
  },
  chipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 1.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
