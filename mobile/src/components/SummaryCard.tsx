import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

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
  period = 'June 2026',
}: SummaryCardProps) {
  const savings = income - expense;

  return (
    <View style={styles.card}>
      {/* Period label */}
      <Text style={styles.period}>{period}</Text>

      {/* Balance — hero number in black */}
      <Text style={styles.balance}>
        {currency}{balance.toLocaleString('en-IN')}
      </Text>

      {/* Blue savings pill — the ONE place blue earns its spot */}
      {savings > 0 && (
        <View style={styles.savingsPill}>
          <Text style={styles.savingsText}>
            You saved {currency}{savings.toLocaleString('en-IN')} this month
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Income / Expense row */}
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Money in</Text>
          <Text style={[styles.metricAmount, { color: colors.income }]}>
            +{currency}{income.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Money out</Text>
          <Text style={[styles.metricAmount, { color: colors.expense }]}>
            -{currency}{expense.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    gap: spacing.sm,
  },
  period: {
    ...(typography.caption as object),
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balance: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1.5,
    lineHeight: 50,
  },
  // Blue used here only — because "you saved" is a milestone worth celebrating
  savingsPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    gap: 3,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  },
  metricAmount: {
    fontSize: 17,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: '#E5E5EA',
    marginHorizontal: spacing.base,
  },
});
