import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '@types/index';

// Initial state
const initialState: UIState = {
  isLoading: false,
  currentScreen: '',
  theme: 'light',
  language: 'en',
  showScanner: false,
  showAddItem: false,
  showFamilySettings: false,
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set current screen
    setCurrentScreen: (state, action: PayloadAction<string>) => {
      state.currentScreen = action.payload;
    },

    // Set theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    // Set language
    setLanguage: (state, action: PayloadAction<'en' | 'ta'>) => {
      state.language = action.payload;
    },

    // Show scanner
    showScanner: (state) => {
      state.showScanner = true;
    },

    // Hide scanner
    hideScanner: (state) => {
      state.showScanner = false;
    },

    // Show add item modal
    showAddItem: (state) => {
      state.showAddItem = true;
    },

    // Hide add item modal
    hideAddItem: (state) => {
      state.showAddItem = false;
    },

    // Show family settings
    showFamilySettings: (state) => {
      state.showFamilySettings = true;
    },

    // Hide family settings
    hideFamilySettings: (state) => {
      state.showFamilySettings = false;
    },

    // Toggle theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Reset UI state
    resetUI: (state) => {
      state.isLoading = false;
      state.showScanner = false;
      state.showAddItem = false;
      state.showFamilySettings = false;
    },
  },
});

// Export actions
export const {
  setLoading,
  setCurrentScreen,
  setTheme,
  setLanguage,
  showScanner,
  hideScanner,
  showAddItem,
  hideAddItem,
  showFamilySettings,
  hideFamilySettings,
  toggleTheme,
  resetUI,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer; 