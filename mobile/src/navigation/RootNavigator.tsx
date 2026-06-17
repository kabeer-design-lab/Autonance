import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ConnectWhatsAppScreen } from '../screens/ConnectWhatsAppScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { TabNavigator } from './TabNavigator';
import { useSession } from '../store/SessionContext';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { onboarded } = useSession();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={onboarded ? 'Main' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ConnectWhatsApp" component={ConnectWhatsAppScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
