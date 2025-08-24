import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FamilyState, Family, FamilyMember } from '@types/index';
import { familyService } from '@services/familyService';

// Initial state
const initialState: FamilyState = {
  currentFamily: null,
  members: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const createFamily = createAsyncThunk(
  'family/createFamily',
  async (familyData: { name: string; owner: { name: string; phone: string; email?: string } }, { rejectWithValue }) => {
    try {
      const response = await familyService.createFamily(familyData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create family');
    }
  }
);

export const fetchFamily = createAsyncThunk(
  'family/fetchFamily',
  async (familyId: string, { rejectWithValue }) => {
    try {
      const response = await familyService.getFamily(familyId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch family');
    }
  }
);

export const fetchFamilyMembers = createAsyncThunk(
  'family/fetchFamilyMembers',
  async (familyId: string, { rejectWithValue }) => {
    try {
      const response = await familyService.getFamilyMembers(familyId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch family members');
    }
  }
);

export const addFamilyMember = createAsyncThunk(
  'family/addFamilyMember',
  async ({ familyId, memberData }: { familyId: string; memberData: { name: string; phone: string; email?: string; role: 'admin' | 'member' } }, { rejectWithValue }) => {
    try {
      const response = await familyService.addMember(familyId, memberData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add family member');
    }
  }
);

export const removeFamilyMember = createAsyncThunk(
  'family/removeFamilyMember',
  async ({ familyId, memberId }: { familyId: string; memberId: string }, { rejectWithValue }) => {
    try {
      await familyService.removeMember(familyId, memberId);
      return memberId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove family member');
    }
  }
);

export const updateFamilySettings = createAsyncThunk(
  'family/updateFamilySettings',
  async ({ familyId, settings }: { familyId: string; settings: any }, { rejectWithValue }) => {
    try {
      const response = await familyService.updateSettings(familyId, settings);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update family settings');
    }
  }
);

export const joinFamily = createAsyncThunk(
  'family/joinFamily',
  async (inviteCode: string, { rejectWithValue }) => {
    try {
      const response = await familyService.joinFamily(inviteCode);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join family');
    }
  }
);

export const leaveFamily = createAsyncThunk(
  'family/leaveFamily',
  async (familyId: string, { rejectWithValue }) => {
    try {
      await familyService.leaveFamily(familyId);
      return familyId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave family');
    }
  }
);

// Family slice
const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    // Set current family
    setCurrentFamily: (state, action: PayloadAction<Family>) => {
      state.currentFamily = action.payload;
    },

    // Add member locally (optimistic update)
    addMemberLocally: (state, action: PayloadAction<FamilyMember>) => {
      state.members.push(action.payload);
    },

    // Remove member locally (optimistic update)
    removeMemberLocally: (state, action: PayloadAction<string>) => {
      const memberId = action.payload;
      state.members = state.members.filter(member => member.id !== memberId);
    },

    // Update member locally (optimistic update)
    updateMemberLocally: (state, action: PayloadAction<{ id: string; updates: Partial<FamilyMember> }>) => {
      const { id, updates } = action.payload;
      const memberIndex = state.members.findIndex(member => member.id === id);
      if (memberIndex !== -1) {
        state.members[memberIndex] = { ...state.members[memberIndex], ...updates };
      }
    },

    // Clear family data
    clearFamily: (state) => {
      state.currentFamily = null;
      state.members = [];
      state.error = null;
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
    // Create family
    builder
      .addCase(createFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamily = action.payload;
        state.error = null;
      })
      .addCase(createFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch family
    builder
      .addCase(fetchFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamily = action.payload;
        state.error = null;
      })
      .addCase(fetchFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch family members
    builder
      .addCase(fetchFamilyMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFamilyMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload;
        state.error = null;
      })
      .addCase(fetchFamilyMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add family member
    builder
      .addCase(addFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members.push(action.payload);
        state.error = null;
      })
      .addCase(addFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove family member
    builder
      .addCase(removeFamilyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const memberId = action.payload;
        state.members = state.members.filter(member => member.id !== memberId);
        state.error = null;
      })
      .addCase(removeFamilyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update family settings
    builder
      .addCase(updateFamilySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFamilySettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamily = action.payload;
        state.error = null;
      })
      .addCase(updateFamilySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Join family
    builder
      .addCase(joinFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamily = action.payload.family;
        state.members = action.payload.members;
        state.error = null;
      })
      .addCase(joinFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Leave family
    builder
      .addCase(leaveFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveFamily.fulfilled, (state) => {
        state.isLoading = false;
        state.currentFamily = null;
        state.members = [];
        state.error = null;
      })
      .addCase(leaveFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setCurrentFamily,
  addMemberLocally,
  removeMemberLocally,
  updateMemberLocally,
  clearFamily,
  clearError,
  setLoading,
} = familySlice.actions;

// Export reducer
export default familySlice.reducer; 