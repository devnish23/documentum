import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@types/index';

// Import slices
import authReducer from './slices/authSlice';
import familyReducer from './slices/familySlice';
import inventoryReducer from './slices/inventorySlice';
import merchantsReducer from './slices/merchantsSlice';
import ordersReducer from './slices/ordersSlice';
import notificationsReducer from './slices/notificationsSlice';
import uiReducer from './slices/uiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui state
  blacklist: ['inventory', 'family', 'merchants', 'orders', 'notifications'] // Don't persist these
};

// Root reducer
const rootReducer = {
  auth: authReducer,
  family: familyReducer,
  inventory: inventoryReducer,
  merchants: merchantsReducer,
  orders: ordersReducer,
  notifications: notificationsReducer,
  ui: uiReducer,
};

// Create store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['auth.user.createdAt', 'auth.user.lastActiveAt'],
      },
    }),
  devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

// Export store and persistor
export default store; 