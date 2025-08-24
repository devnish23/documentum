import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '@types/index';
import { SCREEN_NAMES } from '@constants/index';

// Import screens
import AuthScreen from '@screens/AuthScreen';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <Stack.Screen
          name={SCREEN_NAMES.AUTH}
          component={AuthScreen}
          options={{
            headerShown: false,
          }}
        />
      ) : (
        // Main App Stack
        <Stack.Screen
          name={SCREEN_NAMES.MAIN}
          component={MainNavigator}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator; 