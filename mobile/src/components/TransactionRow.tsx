import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { category, CategoryName, colors, typography, spacing, rowHeight } from '../theme';

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

export interface Transaction {
  id: string;
  title: string;
  subtitle?: string;
  amount: number;
  type: 'income' | 'expense';
  category: CategoryName;
  date: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  isLast?: boolean;
}

export function TransactionRow({ transaction, onPress, isLast }: TransactionRowProps) {
  const cat = category[transaction.category];
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.income : colors.expense;
  const sign = isIncome ? '+' : '-';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} style={styles.row}>
      {/* iOS app-icon style: square with rounded corners */}
      <View style={[styles.icon, { backgroundColor: cat.bg }]}>
        <Ionicons name={ICONS[transaction.category]} size={18} color={cat.color} />
      </View>
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>{transaction.title}</Text>
        {transaction.subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>{transaction.subtitle}</Text>
        )}
      </View>
      <Text style={[styles.amount, { color: amountColor }]}>
        {sign}₹{transaction.amount.toLocaleString('en-IN')}
      </Text>
      {!isLast && <View style={styles.divider} />}
    </TouchableOpacity>
  );
}

export function DateSectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: rowHeight,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  // Square icon with rounded corners — iOS app icon style
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...(typography.bodyMedium as object),
    color: colors.textPrimary,
  },
  subtitle: {
    ...(typography.caption as object),
    color: colors.textMuted,
  },
  amount: {
    ...(typography.amountSm as object),
    flexShrink: 0,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 70,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  header: {
    height: 28,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    paddingHorizontal: spacing.base,
  },
  headerText: {
    ...(typography.caption as object),
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
