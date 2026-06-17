import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useTransactions } from '../store/TransactionsContext';
import { useSession } from '../store/SessionContext';
import { getLinkedPhone } from '../lib/auth';

// The WhatsApp number users message to log expenses (replace with your business number).
const BUSINESS_WA = '15551234567';
const WA_LINK = `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent('Spent ₹250 on lunch')}`;

export function SettingsScreen({ navigation }: any) {
  const { transactions, syncing } = useTransactions();
  const { session } = useSession();
  const [linkedPhone, setLinkedPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getLinkedPhone(session).then(setLinkedPhone);
  }, [session]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
          <View>
            <Text style={styles.profileName}>You</Text>
            <Text style={styles.profileSub}>
              {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
              {syncing ? ' · syncing…' : ''}
            </Text>
          </View>
        </View>

        {/* WhatsApp connection card */}
        <TouchableOpacity
          style={styles.waCard}
          activeOpacity={0.85}
          onPress={() => linkedPhone ? Linking.openURL(WA_LINK) : navigation.navigate('ConnectWhatsApp')}
        >
          <View style={styles.waIcon}>
            <Ionicons name="logo-whatsapp" size={24} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.waTitle}>
              {linkedPhone ? 'WhatsApp connected' : 'Log expenses on WhatsApp'}
            </Text>
            <Text style={styles.waSub}>
              {linkedPhone
                ? `Linked to ${linkedPhone} · Tap to chat`
                : "Text us what you spent. We'll do the rest."}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <Section title="Preferences">
          <Row icon="cash-outline" label="Currency" value="₹ INR" />
          <Row icon="pricetags-outline" label="Categories" value="9 active" />
          <Row icon="notifications-outline" label="Notifications" value="On" last />
        </Section>

        <Section title="Account">
          <Row icon="person-outline" label="Profile" />
          <Row icon="shield-checkmark-outline" label="Privacy & data" />
          <Row icon="help-circle-outline" label="Help & support" last />
        </Section>

        <TouchableOpacity
          style={styles.signOut}
          onPress={() => Alert.alert(
            'Sign out',
            'Signing out will reset this device. Your data stays linked to your WhatsApp number.',
          )}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Autonance · v0.1.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, last }: { icon: any; label: string; value?: string; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.row, !last && styles.rowBorder]} activeOpacity={0.6}>
      <Ionicons name={icon} size={20} color="#000" />
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: spacing.lg },
  title: { fontSize: 28, fontWeight: '700', color: '#000', letterSpacing: -0.6, marginTop: spacing.sm },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: '600' },
  profileName: { fontSize: 18, fontWeight: '600', color: '#000' },
  profileSub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  waCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFF', borderRadius: 16, padding: spacing.base, marginTop: spacing.lg,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  waIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' },
  waTitle: { fontSize: 15, fontWeight: '600', color: '#000' },
  waSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.base, height: 52 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowLabel: { flex: 1, fontSize: 15, color: '#000' },
  rowValue: { fontSize: 14, color: colors.textMuted },
  signOut: { marginTop: spacing.lg, height: 52, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontSize: 15, fontWeight: '500', color: colors.expense },
  version: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
