import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, Notification } from '@types/index';
import { notificationService } from '@services/notificationService';

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (familyId: string, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(familyId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async ({ notificationId, userId }: { notificationId: string; userId: string }, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId, userId);
      return { notificationId, userId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (userId: string, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead(userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

// Notifications slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add notification locally (for real-time updates)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },

    // Mark notification as read locally (optimistic update)
    markAsReadLocally: (state, action: PayloadAction<{ notificationId: string; userId: string }>) => {
      const { notificationId, userId } = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.readBy.some(read => read.userId === userId)) {
        notification.readBy.push({ userId, readAt: new Date() });
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read locally (optimistic update)
    markAllAsReadLocally: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.notifications.forEach(notification => {
        if (!notification.readBy.some(read => read.userId === userId)) {
          notification.readBy.push({ userId, readAt: new Date() });
        }
      });
      state.unreadCount = 0;
    },

    // Remove notification locally (optimistic update)
    removeNotificationLocally: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && notification.readBy.length === 0) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
    },

    // Clear notifications
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
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
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark notification as read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const { notificationId, userId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.readBy.some(read => read.userId === userId)) {
          notification.readBy.push({ userId, readAt: new Date() });
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const userId = action.payload;
        state.notifications.forEach(notification => {
          if (!notification.readBy.some(read => read.userId === userId)) {
            notification.readBy.push({ userId, readAt: new Date() });
          }
        });
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete notification
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && notification.readBy.length === 0) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== notificationId);
        state.error = null;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  addNotification,
  markAsReadLocally,
  markAllAsReadLocally,
  removeNotificationLocally,
  clearNotifications,
  clearError,
  setLoading,
} = notificationsSlice.actions;

// Export reducer
export default notificationsSlice.reducer; 