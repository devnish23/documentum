import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OrderState, Order } from '@types/index';
import { orderService } from '@services/orderService';

// Initial state
const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (familyId: string, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(familyId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: { merchantId: string; items: Array<{ inventoryItemId: string; quantity: number; notes?: string }>; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create order');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, updates }: { id: string; updates: Partial<Order> }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateOrder(id, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update order');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await orderService.deleteOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete order');
    }
  }
);

// Orders slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Set current order
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },

    // Add order locally (optimistic update)
    addOrderLocally: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },

    // Update order locally (optimistic update)
    updateOrderLocally: (state, action: PayloadAction<{ id: string; updates: Partial<Order> }>) => {
      const { id, updates } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === id);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = { ...state.orders[orderIndex], ...updates };
      }
      if (state.currentOrder?.id === id) {
        state.currentOrder = { ...state.currentOrder, ...updates };
      }
    },

    // Remove order locally (optimistic update)
    removeOrderLocally: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.orders = state.orders.filter(order => order.id !== id);
      if (state.currentOrder?.id === id) {
        state.currentOrder = null;
      }
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
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.push(action.payload);
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update order
    builder
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        const id = action.payload;
        state.orders = state.orders.filter(order => order.id !== id);
        if (state.currentOrder?.id === id) {
          state.currentOrder = null;
        }
        state.error = null;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setCurrentOrder,
  addOrderLocally,
  updateOrderLocally,
  removeOrderLocally,
  clearError,
  setLoading,
} = ordersSlice.actions;

// Export reducer
export default ordersSlice.reducer; 