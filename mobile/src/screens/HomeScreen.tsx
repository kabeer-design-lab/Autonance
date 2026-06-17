import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { SummaryCard, LineChart, TransactionRow, DateSectionHeader } from '../components';
import { useTransactions } from '../store/TransactionsContext';
import { summarize, thisMonth, groupByDate, MONTH_LABEL } from '../lib/format';

const { width } = Dimensions.get('window');
const CARD_W = width - spacing.lg * 2;

export function HomeScreen({ navigation }: any) {
  const { transactions } = useTransactions();

  const monthTx = useMemo(() => thisMonth(transactions), [transactions]);
  const summary = useMemo(() => summarize(monthTx), [monthTx]);
  const recent = useMemo(() => groupByDate(transactions.slice(0, 6)), [transactions]);

  // Build a simple cumulative-spend trend for the month.
  const trend = useMemo(() => {
    const expenses = monthTx
      .filter((t) => t.type === 'expense')
      .sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1));
    if (expenses.length === 0) return [0, 0];
    let running = 0;
    return expenses.map((t) => (running += t.amount));
  }, [monthTx]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good evening</Text>
            <Text style={styles.name}>Here's your money</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.avatarText}>A</Text>
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <SummaryCard
          balance={summary.balance}
          income={summary.income}
          expense={summary.expense}
          period={MONTH_LABEL}
        />

        {/* Trend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending this month</Text>
          <LineChart data={trend.length > 1 ? trend : [0, 0]} width={CARD_W - 32} height={110} />
        </View>

        {/* Recent */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {recent.map((group) => (
            <View key={group.date}>
              <DateSectionHeader label={group.label} />
              {group.items.map((t, i) => (
                <TransactionRow
                  key={t.id}
                  transaction={{
                    id: t.id,
                    title: t.description,
                    subtitle: t.payee ?? undefined,
                    amount: t.amount,
                    type: t.type,
                    category: t.category,
                    date: t.occurredAt,
                  }}
                  isLast={i === group.items.length - 1}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: spacing.lg, gap: spacing.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  greeting: { fontSize: 14, color: colors.textMuted, fontWeight: '400' },
  name: { fontSize: 24, fontWeight: '700', color: '#000', letterSpacing: -0.5, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#000', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: spacing.base,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '500', color: colors.textMuted, marginBottom: spacing.sm },
  recentHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#000', letterSpacing: -0.3 },
  seeAll: { fontSize: 14, fontWeight: '500', color: colors.primary },
  listCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
});
