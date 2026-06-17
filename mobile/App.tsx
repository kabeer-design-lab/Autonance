import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Text, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState } from 'react';

import { colors, spacing, typography } from './src/theme';
import type { CategoryName } from './src/theme';
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
  MeshGradient,
} from './src/components';

const { width } = Dimensions.get('window');

const TRANSACTIONS = [
  { id: '1', title: 'Swiggy Instamart', subtitle: 'Groceries', amount: 830, type: 'expense' as const, category: 'Food' as CategoryName, date: '2026-06-18' },
  { id: '2', title: 'Salary Credit', subtitle: 'HDFC Bank', amount: 85000, type: 'income' as const, category: 'Business' as CategoryName, date: '2026-06-15' },
  { id: '3', title: 'Ola Ride', subtitle: 'Airport drop', amount: 420, type: 'expense' as const, category: 'Transport' as CategoryName, date: '2026-06-14' },
];

const DONUT_DATA = [
  { categoryName: 'Food' as CategoryName, amount: 12400 },
  { categoryName: 'Transport' as CategoryName, amount: 6200 },
  { categoryName: 'Shopping' as CategoryName, amount: 9800 },
  { categoryName: 'Entertainment' as CategoryName, amount: 4100 },
];

const LINE_DATA = [4000, 5200, 4800, 6100, 5600, 7200, 6800, 8100, 7400, 9200, 8500, 10200];

export default function App() {
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const CATEGORIES: CategoryName[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ─── Mesh Gradient (Onboarding preview) ─── */}
        <Label text="Mesh Gradient — Onboarding" />
        <MeshGradient style={styles.meshPreview}>
          <View style={styles.meshContent}>
            <Text style={styles.meshHeadline}>Track money.{'\n'}Effortlessly.</Text>
            <Text style={styles.meshSub}>Just send a WhatsApp message.</Text>
            <Button label="Get Started" onPress={() => {}} style={{ marginTop: 24 }} />
          </View>
        </MeshGradient>

        {/* ─── Summary Card ─── */}
        <Label text="Summary Card" />
        <SummaryCard balance={52600} income={85000} expense={32400} />

        {/* ─── Buttons ─── */}
        <Label text="Buttons" />
        <Button label="Save Transaction" onPress={() => setToastVisible(true)} />
        <Button label="Secondary" onPress={() => {}} variant="secondary" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label="+ Add" onPress={() => {}} variant="pill" />
          <Button label="Filter" onPress={() => {}} variant="pillGhost" />
        </View>

        {/* ─── Input ─── */}
        <Label text="Text Input" />
        <Input label="Note" placeholder="e.g. Lunch at office" value={inputValue} onChangeText={setInputValue} />

        {/* ─── Amount Input ─── */}
        <Label text="Amount Input (SF Pro, tabular)" />
        <View style={styles.card}>
          <AmountInput value={amount} onChange={setAmount} />
        </View>

        {/* ─── Category Chips ─── */}
        <Label text="Category Chips" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 2 }}>
            {CATEGORIES.map((c) => (
              <CategoryChip
                key={c}
                name={c}
                selected={selectedCategory === c}
                onPress={() => setSelectedCategory(c === selectedCategory ? null : c)}
              />
            ))}
          </View>
        </ScrollView>

        {/* ─── Transaction List ─── */}
        <Label text="Transaction Rows (iOS icon style)" />
        <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
          <DateSectionHeader label="Today" />
          {TRANSACTIONS.map((t, i) => (
            <TransactionRow key={t.id} transaction={t} isLast={i === TRANSACTIONS.length - 1} />
          ))}
        </View>

        {/* ─── Budget Bars ─── */}
        <Label text="Budget Progress" />
        <View style={[styles.card, { gap: 20 }]}>
          <BudgetBar categoryName="Food" spent={12400} limit={15000} />
          <BudgetBar categoryName="Shopping" spent={9800} limit={10000} />
          <BudgetBar categoryName="Transport" spent={7200} limit={5000} />
        </View>

        {/* ─── Line Chart ─── */}
        <Label text="Spend Trend" />
        <View style={styles.card}>
          <LineChart data={LINE_DATA} width={width - 80} height={110} />
        </View>

        {/* ─── Donut Chart ─── */}
        <Label text="Category Breakdown" />
        <View style={styles.card}>
          <DonutChart data={DONUT_DATA} total={32500} size={Math.min(width - 80, 240)} />
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      <FAB onPress={() => setToastVisible(true)} style={styles.fab} />

      <Toast
        visible={toastVisible}
        title="Saved ₹830 · Food · Today"
        subtitle="Swiggy Instamart"
        onHide={() => setToastVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text style={styles.label}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60,
    gap: spacing.sm,
  },
  label: {
    ...(typography.caption as object),
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.xl,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.base,
  },
  meshPreview: {
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
  },
  meshContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 28,
    paddingBottom: 32,
  },
  meshHeadline: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#000000',
    lineHeight: 42,
  },
  meshSub: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
  },
});
