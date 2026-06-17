import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.78}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.textPrimary} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles] as object]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,          // full pill — always
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: '#000000',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
    ...(typography.label as object),
    fontSize: 15,
    letterSpacing: -0.1,
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryLabel: {
    color: '#000000',
    fontWeight: '600',
  },
  ghostLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
