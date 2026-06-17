import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { DonutChart, BudgetBar } from '../components';
import { useTransactions } from '../store/TransactionsContext';
import { summarize, thisMonth, formatMoney, MONTH_LABEL } from '../lib/format';

const { width } = Dimensions.get('window');

// Soft monthly budgets per category (rupees). Tune later in Settings.
const BUDGETS: Record<string, number> = {
  Food: 15000, Transport: 8000, Shopping: 10000, Bills: 6000,
  Entertainment: 4000, Health: 3000, Business: 50000, Education: 5000, Other: 5000,
};

export function AnalyticsScreen() {
  const { transactions } = useTransactions();
  const monthTx = useMemo(() => thisMonth(transactions), [transactions]);
  const summary = useMemo(() => summarize(monthTx), [monthTx]);
  const [tab, setTab] = useState<'breakdown' | 'budgets'>('breakdown');

  const hasExpenses = summary.byCategory.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>{MONTH_LABEL}</Text>

        {/* Total spent headline */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>You've spent</Text>
          <Text style={styles.totalAmount}>{formatMoney(summary.expense)}</Text>
          <Text style={styles.totalSub}>across {summary.byCategory.length} categories this month</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Tab label="Breakdown" active={tab === 'breakdown'} onPress={() => setTab('breakdown')} />
          <Tab label="Budgets" active={tab === 'budgets'} onPress={() => setTab('budgets')} />
        </View>

        {!hasExpenses ? (
          <View style={styles.empty}>
            <Ionicons name="pie-chart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No spending yet</Text>
            <Text style={styles.emptyText}>Once you log expenses, your breakdown shows up here.</Text>
          </View>
        ) : tab === 'breakdown' ? (
          <View style={styles.card}>
            <DonutChart
              data={summary.byCategory}
              total={summary.expense}
              size={Math.min(width - 80, 240)}
            />
          </View>
        ) : (
          <View style={[styles.card, { gap: 22 }]}>
            {summary.byCategory.map((c) => (
              <BudgetBar
                key={c.categoryName}
                categoryName={c.categoryName}
                spent={c.amount}
                limit={BUDGETS[c.categoryName] ?? 5000}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: spacing.lg },
  title: { fontSize: 28, fontWeight: '700', color: '#000', letterSpacing: -0.6, marginTop: spacing.sm },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  totalCard: {
    backgroundColor: '#000', borderRadius: 16, padding: 20, marginTop: spacing.base, gap: 4,
  },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  totalAmount: { fontSize: 40, fontWeight: '700', color: '#FFF', letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  totalSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  tabs: {
    flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.full,
    padding: 3, marginTop: spacing.base,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: radius.full, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
  tabTextActive: { color: '#000', fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: spacing.base, marginTop: spacing.base,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#000', marginTop: spacing.xs },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
