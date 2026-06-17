import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { TransactionRow, DateSectionHeader } from '../components';
import { useTransactions } from '../store/TransactionsContext';
import { groupByDate } from '../lib/format';

type Filter = 'all' | 'income' | 'expense';

export function TransactionsScreen() {
  const { transactions } = useTransactions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          (t.payee ?? '').toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, query, filter]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Transactions</Text>

        {/* Search */}
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or category"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textMuted}
              onPress={() => setQuery('')}
            />
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['all', 'expense', 'income'] as Filter[]).map((f) => (
            <FilterPill key={f} label={labelFor(f)} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {groups.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              {query ? 'No transactions match your search.' : 'Add your first expense to get started.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {groups.map((group) => (
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
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Text
      onPress={onPress}
      style={[styles.filterPill, active ? styles.filterPillActive : styles.filterPillIdle]}
    >
      {label}
    </Text>
  );
}

function labelFor(f: Filter): string {
  return f === 'all' ? 'All' : f === 'income' ? 'Money in' : 'Money out';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  headerWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: '#000', letterSpacing: -0.6, marginTop: spacing.sm },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface2, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterPill: {
    fontSize: 13, fontWeight: '500', overflow: 'hidden',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1,
  },
  filterPillActive: { backgroundColor: '#000', color: '#FFF', borderColor: '#000' },
  filterPillIdle: { backgroundColor: '#FFF', color: colors.textSecondary, borderColor: colors.border },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
  listCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#000', marginTop: spacing.xs },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },
});
