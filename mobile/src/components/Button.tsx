import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'pill' | 'pillGhost';

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
      activeOpacity={0.75}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'pillGhost' ? colors.textPrimary : '#FFFFFF'} />
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
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pill: {
    height: 36,
    backgroundColor: '#000000',
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
  },
  pillGhost: {
    height: 36,
    backgroundColor: colors.surface2,
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...(typography.label as object),
    letterSpacing: -0.1,
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
  pillLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  pillGhostLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});
