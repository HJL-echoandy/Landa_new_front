/**
 * Landa 技师端 App 入口
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import RootNavigator from './src/navigation';
import { navigationRef } from './src/navigation/navigationRef';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useAuthCheck } from './src/hooks/useAuthCheck';

// App 内容组件（在 Redux 和持久化恢复之后）
function AppContent() {
  const { isChecking } = useAuthCheck();

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f9f506" />
        <Text style={styles.loadingText}>正在验证登录状态...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate
        loading={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f9f506" />
            <Text style={styles.loadingText}>正在加载...</Text>
          </View>
        }
        persistor={persistor}
      >
        <AppContent />
      </PersistGate>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#1c1c0d',
    fontWeight: '500',
  },
});
