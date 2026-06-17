import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Button, MeshGradient } from '../components';

export function OnboardingScreen({ navigation }: any) {
  return (
    <MeshGradient style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.eyebrow}>AUTONANCE</Text>

          <View style={{ flex: 1 }} />

          <Text style={styles.headline}>Know where{'\n'}your money goes.</Text>
          <Text style={styles.sub}>
            Send a message on WhatsApp. We log it, sort it,{'\n'}and show you the full picture — instantly.
          </Text>

          <View style={styles.buttons}>
            <Button label="Get started" onPress={() => navigation.replace('Main')} />
            <Button label="I already have an account" onPress={() => navigation.replace('Main')} variant="secondary" />
          </View>

          <Text style={styles.legal}>By continuing you agree to our Terms & Privacy Policy.</Text>
        </View>
      </SafeAreaView>
    </MeshGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2.5, color: colors.textSecondary, marginTop: spacing.base },
  headline: { fontSize: 40, fontWeight: '700', letterSpacing: -1.4, color: '#000', lineHeight: 46 },
  sub: { fontSize: 16, lineHeight: 23, color: colors.textSecondary, marginTop: spacing.md },
  buttons: { gap: spacing.sm, marginTop: spacing.xl },
  legal: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.base },
});
