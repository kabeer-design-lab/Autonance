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
const CARD_WIDTH = width - spacing.lg * 2;

const TRANSACTIONS = [
  { id: '1', title: 'Swiggy Instamart', subtitle: 'Bought groceries for the week', amount: 830, type: 'expense' as const, category: 'Food' as CategoryName, date: '2026-06-18' },
  { id: '2', title: 'Salary', subtitle: 'June payout from Razorpay', amount: 85000, type: 'income' as const, category: 'Business' as CategoryName, date: '2026-06-15' },
  { id: '3', title: 'Ola', subtitle: 'Ride to airport, Terminal 2', amount: 420, type: 'expense' as const, category: 'Transport' as CategoryName, date: '2026-06-14' },
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

        {/* ─── Onboarding / Mesh Gradient ─── */}
        <SectionLabel text="Onboarding screen" />
        <MeshGradient style={styles.meshPreview}>
          <View style={styles.meshContent}>
            <Text style={styles.meshEyebrow}>AUTONANCE</Text>
            <Text style={styles.meshHeadline}>Know where{'\n'}your money goes.</Text>
            <Text style={styles.meshSub}>
              Send a message on WhatsApp.{'\n'}We log it, sort it, and show you the full picture.
            </Text>
            <View style={styles.meshButtons}>
              <Button label="Create free account" onPress={() => {}} style={{ flex: 1 }} />
              <Button label="I have an account" onPress={() => {}} variant="secondary" style={{ flex: 1 }} />
            </View>
          </View>
        </MeshGradient>

        {/* ─── Balance card ─── */}
        <SectionLabel text="Balance card" />
        <SummaryCard balance={52600} income={85000} expense={32400} />

        {/* ─── Buttons ─── */}
        <SectionLabel text="Buttons — always black pill" />
        <Button label="Add an expense" onPress={() => setToastVisible(true)} />
        <Button label="View all transactions" onPress={() => {}} variant="secondary" />
        <Button label="Maybe later" onPress={() => {}} variant="ghost" />

        {/* ─── Input ─── */}
        <SectionLabel text="Input — blue focus is the only accent" />
        <Input
          label="What was it for?"
          placeholder="e.g. Lunch with Priya"
          value={inputValue}
          onChangeText={setInputValue}
        />

        {/* ─── Amount input ─── */}
        <SectionLabel text="Amount entry" />
        <View style={styles.card}>
          <Text style={styles.cardLabel}>How much did you spend?</Text>
          <AmountInput value={amount} onChange={setAmount} />
        </View>

        {/* ─── Category chips ─── */}
        <SectionLabel text="What was it?" />
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

        {/* ─── Transaction list ─── */}
        <SectionLabel text="Recent spending" />
        <View style={styles.card}>
          <DateSectionHeader label="Today" />
          {TRANSACTIONS.map((t, i) => (
            <TransactionRow key={t.id} transaction={t} isLast={i === TRANSACTIONS.length - 1} />
          ))}
        </View>

        {/* ─── Budget bars ─── */}
        <SectionLabel text="Are you on track?" />
        <View style={[styles.card, { gap: 22 }]}>
          <BudgetBar categoryName="Food" spent={12400} limit={15000} />
          <BudgetBar categoryName="Shopping" spent={9800} limit={10000} />
          <BudgetBar categoryName="Transport" spent={7200} limit={5000} />
        </View>

        {/* ─── Line chart ─── */}
        <SectionLabel text="Your spending over time" />
        <View style={styles.card}>
          <LineChart data={LINE_DATA} width={CARD_WIDTH - 32} height={120} />
        </View>

        {/* ─── Donut chart ─── */}
        <SectionLabel text="Where it all went" />
        <View style={styles.card}>
          <DonutChart data={DONUT_DATA} total={32500} size={Math.min(CARD_WIDTH - 40, 240)} />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <FAB onPress={() => setToastVisible(true)} style={styles.fab} />

      <Toast
        visible={toastVisible}
        title="Got it — ₹830 on Food"
        subtitle="Added to today · Swiggy Instamart"
        onHide={() => setToastVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <Text style={styles.sectionLabel}>{text}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 64,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: spacing.xl,
  },
  // Shared card shell — white, subtle shadow, thin border
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 4,
  },
  // Mesh gradient section
  meshPreview: {
    height: 420,
    borderRadius: 20,
    overflow: 'hidden',
  },
  meshContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 28,
    paddingBottom: 36,
    gap: 12,
  },
  meshEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textMuted,
  },
  meshHeadline: {
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1.2,
    color: '#000000',
    lineHeight: 44,
  },
  meshSub: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  meshButtons: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
  },
});
