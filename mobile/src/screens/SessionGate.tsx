import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useSession } from '../store/SessionContext';
import { colors, spacing } from '../theme';

/**
 * Blocks render until Supabase auth is ready. Shows a spinner while signing in,
 * a recoverable error if the network or RLS setup is wrong.
 */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const { loading, error, session, retry } = useSession();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Couldn't connect</Text>
        <Text style={styles.body}>{error ?? 'Unable to start a session.'}</Text>
        <TouchableOpacity onPress={retry} style={styles.btn}>
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', padding: spacing.xl, gap: spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#000' },
  body: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  btn: {
    marginTop: spacing.base, backgroundColor: '#000',
    paddingHorizontal: spacing.xl, height: 48, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
