import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { radius, fabSize } from '../theme';

interface FABProps {
  onPress: () => void;
  style?: ViewStyle;
}

export function FAB({ onPress, style }: FABProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.fab, style]} activeOpacity={0.8}>
      <Ionicons name="add" size={30} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: fabSize,
    height: fabSize,
    borderRadius: radius.full,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
});
