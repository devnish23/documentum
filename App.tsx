import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, persistor } from '@store/index';
import { initializeLanguage } from '@i18n/index';
import { COLORS } from '@constants/index';
import RootNavigator from '@navigation/RootNavigator';
import SplashScreen from '@screens/SplashScreen';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize language on app start
    initializeLanguage();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLORS.primary[500]}
              translucent={false}
            />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

export default App; 