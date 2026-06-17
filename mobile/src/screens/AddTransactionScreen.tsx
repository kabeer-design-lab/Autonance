import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';
import type { CategoryName } from '../theme';
import { Button, CategoryChip } from '../components';
import { useTransactions } from '../store/TransactionsContext';
import type { TransactionType } from '../types';

const ALL_CATEGORIES: CategoryName[] = [
  'Food', 'Transport', 'Shopping', 'Bills',
  'Entertainment', 'Health', 'Business', 'Education', 'Other',
];

export function AddTransactionScreen({ navigation }: any) {
  const { addTransaction } = useTransactions();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState<CategoryName>('Food');
  const [note, setNote] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const canSave = numericAmount > 0 && note.trim().length > 0;

  const press = (key: string) => {
    Haptics.selectionAsync();
    setAmount((prev) => {
      if (key === 'del') {
        const next = prev.slice(0, -1);
        return next.length === 0 ? '0' : next;
      }
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      // digit
      if (prev === '0') return key;
      if (prev.includes('.') && prev.split('.')[1].length >= 2) return prev;
      if (prev.replace('.', '').length >= 9) return prev;
      return prev + key;
    });
  };

  const save = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTransaction({
      amount: numericAmount,
      type,
      category,
      description: note.trim(),
      occurredAt: new Date().toISOString().slice(0, 10),
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.typeToggle}>
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => { Haptics.selectionAsync(); setType(t); }}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            >
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                {t === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Amount display */}
        <View style={styles.amountWrap}>
          <Text style={styles.amountLabel}>
            {type === 'expense' ? 'How much did you spend?' : 'How much did you receive?'}
          </Text>
          <Text style={[styles.amount, { color: numericAmount > 0 ? '#000' : colors.textMuted }]}>
            ₹{amount}
          </Text>
        </View>

        {/* Note */}
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="What was it for?"
          placeholderTextColor={colors.textMuted}
          style={styles.note}
        />

        {/* Categories */}
        <Text style={styles.catLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {ALL_CATEGORIES.map((c) => (
            <CategoryChip key={c} name={c} selected={category === c} onPress={() => { Haptics.selectionAsync(); setCategory(c); }} />
          ))}
        </ScrollView>
      </ScrollView>

      {/* Numpad */}
      <View style={styles.numpad}>
        {[['1','2','3'],['4','5','6'],['7','8','9'],['.','0','del']].map((row) => (
          <View key={row.join()} style={styles.numRow}>
            {row.map((key) => (
              <TouchableOpacity key={key} style={styles.numKey} onPress={() => press(key)} activeOpacity={0.6}>
                {key === 'del'
                  ? <Ionicons name="backspace-outline" size={24} color="#000" />
                  : <Text style={styles.numKeyText}>{key}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Save */}
      <View style={styles.footer}>
        <Button
          label={canSave ? `Add ${type === 'expense' ? 'expense' : 'income'}` : 'Enter an amount and note'}
          onPress={save}
          disabled={!canSave}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  typeToggle: {
    flexDirection: 'row', backgroundColor: colors.surface2,
    borderRadius: radius.full, padding: 3,
  },
  typeBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: radius.full },
  typeBtnActive: { backgroundColor: '#000' },
  typeBtnText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary },
  typeBtnTextActive: { color: '#FFF' },
  body: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  amountWrap: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  amountLabel: { fontSize: 14, color: colors.textMuted },
  amount: { fontSize: 52, fontWeight: '700', letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  note: {
    height: 52, backgroundColor: colors.surface2, borderRadius: radius.sm,
    paddingHorizontal: spacing.base, fontSize: 16, color: colors.textPrimary,
  },
  catLabel: { fontSize: 12, fontWeight: '500', color: colors.textMuted, letterSpacing: 0.3 },
  catRow: { gap: spacing.sm, paddingRight: spacing.lg },
  numpad: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: 4 },
  numRow: { flexDirection: 'row', justifyContent: 'space-between' },
  numKey: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center' },
  numKeyText: { fontSize: 26, fontWeight: '500', color: '#000' },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
});
