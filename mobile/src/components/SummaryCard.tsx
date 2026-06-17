import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, cardPadding } from '../theme';

interface SummaryCardProps {
  balance: number;
  income: number;
  expense: number;
  currency?: string;
  period?: string;
}

export function SummaryCard({
  balance,
  income,
  expense,
  currency = '₹',
  period = 'This month',
}: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.periodLabel}>{period}</Text>
      <Text style={styles.balance}>
        {currency}{balance.toLocaleString('en-IN')}
      </Text>
      <View style={styles.row}>
        <View style={styles.stat}>
          <View style={styles.statIcon}>
            <Ionicons name="arrow-down-circle-outline" size={16} color="rgba(255,255,255,0.9)" />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>
              {currency}{income.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <View style={[styles.statIcon, styles.expenseIcon]}>
            <Ionicons name="arrow-up-circle-outline" size={16} color="rgba(255,255,255,0.9)" />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>
              {currency}{expense.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: cardPadding + 4,
    gap: spacing.xs,
  },
  periodLabel: {
    ...(typography.caption as object),
    color: 'rgba(255,255,255,0.65)',
  },
  balance: {
    ...(typography.display as object),
    color: colors.textInverse,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIcon: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statLabel: {
    ...(typography.caption as object),
    color: 'rgba(255,255,255,0.65)',
  },
  statAmount: {
    ...(typography.label as object),
    color: colors.textInverse,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
