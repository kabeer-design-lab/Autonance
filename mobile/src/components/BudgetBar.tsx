import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { category, CategoryName, colors, typography, spacing, radius } from '../theme';

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

interface BudgetBarProps {
  categoryName: CategoryName;
  spent: number;
  limit: number;
  currency?: string;
}

export function BudgetBar({ categoryName, spent, limit, currency = '₹' }: BudgetBarProps) {
  const ratio = Math.min(spent / limit, 1);
  const pct = Math.round(ratio * 100);
  const isOver = spent > limit;
  const isWarning = !isOver && ratio >= 0.8;

  const fillColor = isOver ? colors.expense : isWarning ? colors.warning : colors.primary;
  const cat = category[categoryName];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={[styles.icon, { backgroundColor: cat.bg }]}>
            <Ionicons name={ICONS[categoryName]} size={13} color={cat.color} />
          </View>
          <Text style={styles.name}>{categoryName}</Text>
        </View>
        <Text style={[styles.pct, { color: isOver ? colors.expense : colors.textMuted }]}>
          {isOver ? 'Over' : `${pct}%`}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fillColor }]} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.spent}>{currency}{spent.toLocaleString('en-IN')}</Text>
        <Text style={styles.limit}>of {currency}{limit.toLocaleString('en-IN')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...(typography.bodyMedium as object),
    fontSize: 15,
    color: colors.textPrimary,
  },
  pct: {
    ...(typography.caption as object),
    fontWeight: '500',
  },
  track: {
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceOffset,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spent: {
    ...(typography.caption as object),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  limit: {
    ...(typography.caption as object),
    color: colors.textMuted,
  },
});
