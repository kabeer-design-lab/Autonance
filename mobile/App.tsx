import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from './src/store/SessionContext';
import { TransactionsProvider } from './src/store/TransactionsContext';
import { SessionGate } from './src/screens/SessionGate';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <SessionGate>
            <TransactionsProvider>
              <StatusBar style="dark" />
              <RootNavigator />
            </TransactionsProvider>
          </SessionGate>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
