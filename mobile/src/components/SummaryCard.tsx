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
          <View style={[styles.statIcon, { backgroundColor: 'rgba(52,199,89,0.15)' }]}>
            <Ionicons name="arrow-down-circle-outline" size={15} color={colors.income} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>{currency}{income.toLocaleString('en-IN')}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(255,59,48,0.15)' }]}>
            <Ionicons name="arrow-up-circle-outline" size={15} color={colors.expense} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>{currency}{expense.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000000',
    borderRadius: radius.md,
    padding: cardPadding + 4,
    gap: spacing.xs,
  },
  periodLabel: {
    ...(typography.caption as object),
    color: 'rgba(255,255,255,0.45)',
  },
  balance: {
    ...(typography.display as object),
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    ...(typography.caption as object),
    color: 'rgba(255,255,255,0.45)',
  },
  statAmount: {
    ...(typography.label as object),
    color: '#FFFFFF',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
