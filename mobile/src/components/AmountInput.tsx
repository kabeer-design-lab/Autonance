import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface AmountInputProps {
  value: string;
  onChange: (val: string) => void;
  currency?: string;
  style?: ViewStyle;
}

export function AmountInput({ value, onChange, currency = '₹', style }: AmountInputProps) {
  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    onChange(cleaned);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.currency}>{currency}</Text>
      <TextInput
        value={value}
        onChangeText={handleChange}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        style={styles.input}
        maxLength={12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  currency: {
    ...(typography.amountLg as object),
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  input: {
    ...(typography.amountLg as object),
    color: colors.textPrimary,
    minWidth: 60,
    padding: 0,
  },
});
