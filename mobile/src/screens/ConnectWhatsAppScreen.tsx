import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { Button } from '../components';
import { linkWhatsAppPhone } from '../lib/auth';
import { useSession } from '../store/SessionContext';

export function ConnectWhatsAppScreen({ navigation }: any) {
  const { session, markOnboarded } = useSession();
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  // Normalize: keep only digits, prepend country code if missing.
  const normalized = (() => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (phone.startsWith('+')) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`; // default India
    return `+${digits}`;
  })();

  const valid = /^\+\d{10,15}$/.test(normalized);

  const onContinue = async () => {
    if (!session) return;
    setBusy(true);
    try {
      await linkWhatsAppPhone(session, normalized);
      await markOnboarded();
      navigation.replace('Main');
    } catch (e: any) {
      Alert.alert(
        'Could not link your number',
        e.message + '\n\nThis number may already be linked to another account.',
      );
    } finally {
      setBusy(false);
    }
  };

  const onSkip = async () => {
    await markOnboarded();
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.icon}>
            <Ionicons name="logo-whatsapp" size={28} color="#FFF" />
          </View>

          <Text style={styles.title}>What's your{'\n'}WhatsApp number?</Text>
          <Text style={styles.sub}>
            We'll link it so the messages you send us land in your account.
          </Text>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              autoFocus
              style={styles.input}
            />
            {normalized && !valid && (
              <Text style={styles.hint}>Looks short — include the country code.</Text>
            )}
          </View>

          <View style={{ flex: 1 }} />

          <Button
            label={busy ? 'Linking…' : 'Continue'}
            onPress={onContinue}
            disabled={!valid || busy}
            loading={busy}
          />
          <TouchableOpacity onPress={onSkip} style={styles.skip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  icon: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: '#25D366',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  title: { fontSize: 30, fontWeight: '700', color: '#000', letterSpacing: -0.8, lineHeight: 36 },
  sub: { fontSize: 16, lineHeight: 22, color: colors.textSecondary },
  inputWrap: { marginTop: spacing.lg, gap: spacing.xs },
  inputLabel: { fontSize: 12, fontWeight: '500', color: colors.textMuted, letterSpacing: 0.3 },
  input: {
    height: 52, backgroundColor: colors.surface2, borderRadius: radius.sm,
    paddingHorizontal: spacing.base, fontSize: 18, fontWeight: '500', color: '#000',
    fontVariant: ['tabular-nums'],
  },
  hint: { fontSize: 12, color: colors.warning, marginTop: 2 },
  skip: { alignItems: 'center', paddingVertical: spacing.base },
  skipText: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
});
