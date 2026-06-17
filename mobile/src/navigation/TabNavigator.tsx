import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { active: any; inactive: any }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Transactions: { active: 'list', inactive: 'list-outline' },
  Insights: { active: 'pie-chart', inactive: 'pie-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || 12 }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icon = ICONS[route.name];

        // Insert the FAB between the 2nd and 3rd tab.
        const showFabBefore = index === 2;

        const onPress = () => {
          Haptics.selectionAsync();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <React.Fragment key={route.key}>
            {showFabBefore && (
              <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.getParent()?.navigate('AddTransaction');
                }}
              >
                <Ionicons name="add" size={30} color="#FFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
              <Ionicons
                name={focused ? icon.active : icon.inactive}
                size={24}
                color={focused ? '#000' : colors.textMuted}
              />
              <Text style={[styles.label, { color: focused ? '#000' : colors.textMuted }]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Insights" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10, fontWeight: '500' },
  fab: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 8, marginTop: -28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
  },
});
