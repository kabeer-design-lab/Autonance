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
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: cat.bg, borderColor: cat.color }
          : { backgroundColor: colors.surfaceOffset, borderColor: 'transparent' },
        style,
      ]}
    >
      <Ionicons
        name={ICONS[name]}
        size={16}
        color={selected ? cat.color : colors.textSecondary}
      />
      <Text style={[styles.label, { color: selected ? cat.color : colors.textSecondary }]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: radius.xs,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  label: {
    ...(typography.label as object),
  },
});
