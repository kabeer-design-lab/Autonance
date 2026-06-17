import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionsProvider } from './src/store/TransactionsContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TransactionsProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </TransactionsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
