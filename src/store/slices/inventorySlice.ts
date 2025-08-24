import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InventoryState, InventoryItem, ProductCategory } from '@types/index';
import { inventoryService } from '@services/inventoryService';

// Initial state
const initialState: InventoryState = {
  items: [],
  filteredItems: [],
  categories: Object.values(ProductCategory),
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedCategory: null,
  sortBy: 'name',
  sortOrder: 'asc',
};

// Async thunks
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (familyId: string, { rejectWithValue }) => {
    try {
      const response = await inventoryService.getInventory(familyId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch inventory');
    }
  }
);

export const addItem = createAsyncThunk(
  'inventory/addItem',
  async (itemData: Partial<InventoryItem>, { rejectWithValue }) => {
    try {
      const response = await inventoryService.addItem(itemData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add item');
    }
  }
);

export const updateItem = createAsyncThunk(
  'inventory/updateItem',
  async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateItem(id, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update item');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'inventory/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await inventoryService.deleteItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete item');
    }
  }
);

export const updateQuantity = createAsyncThunk(
  'inventory/updateQuantity',
  async ({ id, quantity }: { id: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.updateQuantity(id, quantity);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update quantity');
    }
  }
);

export const scanBarcode = createAsyncThunk(
  'inventory/scanBarcode',
  async (barcode: string, { rejectWithValue }) => {
    try {
      const response = await inventoryService.scanBarcode(barcode);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to scan barcode');
    }
  }
);

// Helper function to filter and sort items
const filterAndSortItems = (
  items: InventoryItem[],
  searchTerm: string,
  selectedCategory: ProductCategory | null,
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): InventoryItem[] => {
  let filtered = items;

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by category
  if (selectedCategory) {
    filtered = filtered.filter(item => item.category === selectedCategory);
  }

  // Sort items
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      case 'expiryDate':
        aValue = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
        bValue = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
        break;
      case 'dateAdded':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return filtered;
};

// Inventory slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Set search term
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredItems = filterAndSortItems(
        state.items,
        state.searchTerm,
        state.selectedCategory,
        state.sortBy,
        state.sortOrder
      );
    },

    // Set selected category
    setSelectedCategory: (state, action: PayloadAction<ProductCategory | null>) => {
      state.selectedCategory = action.payload;
      state.filteredItems = filterAndSortItems(
        state.items,
        state.searchTerm,
        state.selectedCategory,
        state.sortBy,
        state.sortOrder
      );
    },

    // Set sort options
    setSortOptions: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.filteredItems = filterAndSortItems(
        state.items,
        state.searchTerm,
        state.selectedCategory,
        state.sortBy,
        state.sortOrder
      );
    },

    // Clear filters
    clearFilters: (state) => {
      state.searchTerm = '';
      state.selectedCategory = null;
      state.sortBy = 'name';
      state.sortOrder = 'asc';
      state.filteredItems = filterAndSortItems(
        state.items,
        state.searchTerm,
        state.selectedCategory,
        state.sortBy,
        state.sortOrder
      );
    },

    // Add item locally (optimistic update)
    addItemLocally: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload);
      state.filteredItems = filterAndSortItems(
        state.items,
        state.searchTerm,
        state.selectedCategory,
        state.sortBy,
        state.sortOrder
      );
    },

    // Update item locally (optimistic update)
    updateItemLocally: (state, action: PayloadAction<{ id: string; updates: Partial<InventoryItem> }>) => {
      const { id, updates } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.items[itemIndex] = { ...state.items[itemIndex], ...updates };
        state.filteredItems = filterAndSortItems(
          state.items,
          state.searchTerm,
          state.selectedCategory,
          state.sortBy,
          state.sortOrder
        );
      }
    },

    // Remove item locally (optimistic update)
    removeItemLocally: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      state.filteredItems = filterAndSortItems(
        state.items,
        state.searchTerm,
        state.selectedCategory,
        state.sortBy,
        state.sortOrder
      );
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
    // Fetch inventory
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = filterAndSortItems(
          state.items,
          state.searchTerm,
          state.selectedCategory,
          state.sortBy,
          state.sortOrder
        );
        state.error = null;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add item
    builder
      .addCase(addItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
        state.filteredItems = filterAndSortItems(
          state.items,
          state.searchTerm,
          state.selectedCategory,
          state.sortBy,
          state.sortOrder
        );
        state.error = null;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update item
    builder
      .addCase(updateItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.filteredItems = filterAndSortItems(
            state.items,
            state.searchTerm,
            state.selectedCategory,
            state.sortBy,
            state.sortOrder
          );
        }
        state.error = null;
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete item
    builder
      .addCase(deleteItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.isLoading = false;
        const id = action.payload;
        state.items = state.items.filter(item => item.id !== id);
        state.filteredItems = filterAndSortItems(
          state.items,
          state.searchTerm,
          state.selectedCategory,
          state.sortBy,
          state.sortOrder
        );
        state.error = null;
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update quantity
    builder
      .addCase(updateQuantity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.filteredItems = filterAndSortItems(
            state.items,
            state.searchTerm,
            state.selectedCategory,
            state.sortBy,
            state.sortOrder
          );
        }
        state.error = null;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Scan barcode
    builder
      .addCase(scanBarcode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scanBarcode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(scanBarcode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSearchTerm,
  setSelectedCategory,
  setSortOptions,
  clearFilters,
  addItemLocally,
  updateItemLocally,
  removeItemLocally,
  clearError,
  setLoading,
} = inventorySlice.actions;

// Export reducer
export default inventorySlice.reducer; 