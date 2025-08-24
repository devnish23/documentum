import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MerchantState, Merchant } from '@types/index';
import { merchantService } from '@services/merchantService';

// Initial state
const initialState: MerchantState = {
  merchants: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMerchants = createAsyncThunk(
  'merchants/fetchMerchants',
  async (familyId: string, { rejectWithValue }) => {
    try {
      const response = await merchantService.getMerchants(familyId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch merchants');
    }
  }
);

export const addMerchant = createAsyncThunk(
  'merchants/addMerchant',
  async (merchantData: Partial<Merchant>, { rejectWithValue }) => {
    try {
      const response = await merchantService.addMerchant(merchantData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add merchant');
    }
  }
);

export const updateMerchant = createAsyncThunk(
  'merchants/updateMerchant',
  async ({ id, updates }: { id: string; updates: Partial<Merchant> }, { rejectWithValue }) => {
    try {
      const response = await merchantService.updateMerchant(id, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update merchant');
    }
  }
);

export const deleteMerchant = createAsyncThunk(
  'merchants/deleteMerchant',
  async (id: string, { rejectWithValue }) => {
    try {
      await merchantService.deleteMerchant(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete merchant');
    }
  }
);

// Merchants slice
const merchantsSlice = createSlice({
  name: 'merchants',
  initialState,
  reducers: {
    // Add merchant locally (optimistic update)
    addMerchantLocally: (state, action: PayloadAction<Merchant>) => {
      state.merchants.push(action.payload);
    },

    // Update merchant locally (optimistic update)
    updateMerchantLocally: (state, action: PayloadAction<{ id: string; updates: Partial<Merchant> }>) => {
      const { id, updates } = action.payload;
      const merchantIndex = state.merchants.findIndex(merchant => merchant.id === id);
      if (merchantIndex !== -1) {
        state.merchants[merchantIndex] = { ...state.merchants[merchantIndex], ...updates };
      }
    },

    // Remove merchant locally (optimistic update)
    removeMerchantLocally: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.merchants = state.merchants.filter(merchant => merchant.id !== id);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch merchants
    builder
      .addCase(fetchMerchants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMerchants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.merchants = action.payload;
        state.error = null;
      })
      .addCase(fetchMerchants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add merchant
    builder
      .addCase(addMerchant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMerchant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.merchants.push(action.payload);
        state.error = null;
      })
      .addCase(addMerchant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update merchant
    builder
      .addCase(updateMerchant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMerchant.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.merchants.findIndex(merchant => merchant.id === action.payload.id);
        if (index !== -1) {
          state.merchants[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMerchant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete merchant
    builder
      .addCase(deleteMerchant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMerchant.fulfilled, (state, action) => {
        state.isLoading = false;
        const id = action.payload;
        state.merchants = state.merchants.filter(merchant => merchant.id !== id);
        state.error = null;
      })
      .addCase(deleteMerchant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  addMerchantLocally,
  updateMerchantLocally,
  removeMerchantLocally,
  clearError,
  setLoading,
} = merchantsSlice.actions;

// Export reducer
export default merchantsSlice.reducer; 