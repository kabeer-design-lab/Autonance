import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors, spacing, typography } from './src/theme';
import {
  Button,
  FAB,
  Input,
  AmountInput,
  CategoryChip,
  TransactionRow,
  DateSectionHeader,
  SummaryCard,
  BudgetBar,
  DonutChart,
  LineChart,
  Toast,
} from './src/components';
import { CategoryName } from './src/theme';
import { useState } from 'react';

const MOCK_TRANSACTIONS = [
  { id: '1', title: 'Swiggy Instamart', subtitle: 'Groceries', amount: 830, type: 'expense' as const, category: 'Food' as CategoryName, date: '2026-06-17' },
  { id: '2', title: 'Salary Credit', subtitle: 'HDFC Bank', amount: 85000, type: 'income' as const, category: 'Business' as CategoryName, date: '2026-06-15' },
  { id: '3', title: 'Ola', subtitle: 'Airport ride', amount: 420, type: 'expense' as const, category: 'Transport' as CategoryName, date: '2026-06-14' },
];

const MOCK_DONUT = [
  { categoryName: 'Food' as CategoryName, amount: 12400 },
  { categoryName: 'Transport' as CategoryName, amount: 6200 },
  { categoryName: 'Shopping' as CategoryName, amount: 9800 },
  { categoryName: 'Bills' as CategoryName, amount: 4500 },
];

const MOCK_LINE = [4000, 5200, 4800, 6100, 5600, 7200, 6800, 8100, 7400, 9200, 8500, 10200];

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMMono_500Medium,
  });

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  if (!fontsLoaded) return null;

  const categories: CategoryName[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SummaryCard ── */}
        <Text style={styles.sectionTitle}>Summary Card</Text>
        <SummaryCard balance={52600} income={85000} expense={32400} />

        {/* ── Buttons ── */}
        <Text style={styles.sectionTitle}>Buttons</Text>
        <Button label="Save Transaction" onPress={() => setToastVisible(true)} />
        <Button label="Secondary Action" onPress={() => {}} variant="secondary" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label="+ Add" onPress={() => {}} variant="pill" />
          <Button label="↗ Send" onPress={() => {}} variant="pill" />
        </View>

        {/* ── Input ── */}
        <Text style={styles.sectionTitle}>Text Input</Text>
        <Input label="Note" placeholder="e.g. Lunch at office" value={inputValue} onChangeText={setInputValue} />

        {/* ── Amount Input ── */}
        <Text style={styles.sectionTitle}>Amount Input</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16 }}>
          <AmountInput value={amount} onChange={setAmount} />
        </View>

        {/* ── Category Chips ── */}
        <Text style={styles.sectionTitle}>Category Chips</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
            {categories.map((c) => (
              <CategoryChip
                key={c}
                name={c}
                selected={selectedCategory === c}
                onPress={() => setSelectedCategory(c === selectedCategory ? null : c)}
              />
            ))}
          </View>
        </ScrollView>

        {/* ── Transaction Rows ── */}
        <Text style={styles.sectionTitle}>Transaction List</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden' }}>
          <DateSectionHeader label="Today" />
          {MOCK_TRANSACTIONS.map((t, i) => (
            <TransactionRow
              key={t.id}
              transaction={t}
              isLast={i === MOCK_TRANSACTIONS.length - 1}
            />
          ))}
        </View>

        {/* ── Budget Bar ── */}
        <Text style={styles.sectionTitle}>Budget Bars</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 20 }}>
          <BudgetBar categoryName="Food" spent={12400} limit={15000} />
          <BudgetBar categoryName="Shopping" spent={9800} limit={10000} />
          <BudgetBar categoryName="Transport" spent={7200} limit={5000} />
        </View>

        {/* ── Line Chart ── */}
        <Text style={styles.sectionTitle}>Spend Trend</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16 }}>
          <LineChart data={MOCK_LINE} width={320} height={120} />
        </View>

        {/* ── Donut Chart ── */}
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 20 }}>
          <DonutChart data={MOCK_DONUT} total={32900} size={220} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* FAB */}
      <FAB onPress={() => setToastVisible(true)} style={styles.fab} />

      {/* Toast */}
      <Toast
        visible={toastVisible}
        title="Saved ₹830 · Food · Today"
        subtitle="Swiggy Instamart"
        onHide={() => setToastVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...(typography.label as object),
    color: colors.textMuted,
    marginTop: spacing.xl,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
});
