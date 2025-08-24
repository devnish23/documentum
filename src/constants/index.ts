import { Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@types/index';

// Color Palette
export const COLORS: Colors = {
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    500: '#2196F3', // Primary brand color
    600: '#1976D2',
    900: '#0D47A1'
  },
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    500: '#FF9800', // Secondary accent
    600: '#F57C00'
  },
  success: {
    50: '#E8F5E8',
    500: '#4CAF50', // Fresh items
    600: '#388E3C'
  },
  warning: {
    50: '#FFF8E1',
    500: '#FFC107', // Expiring soon
    600: '#FFA000'
  },
  error: {
    50: '#FFEBEE',
    500: '#F44336', // Expired items
    600: '#D32F2F'
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
};

// Typography
export const TYPOGRAPHY: Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  families: {
    primary: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    secondary: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto'
  }
};

// Spacing
export const SPACING: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48
};

// Border Radius
export const BORDER_RADIUS: BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999
};

// App Configuration
export const APP_CONFIG = {
  name: 'Smart Grocery',
  version: '1.0.0',
  buildNumber: '1',
  bundleId: {
    ios: 'com.smartgrocery.app',
    android: 'com.smartgrocery.app'
  }
};

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Barcode Configuration
export const BARCODE_CONFIG = {
  supportedFormats: [
    'UPC_A',
    'UPC_E', 
    'EAN_13',
    'EAN_8',
    'CODE_128',
    'CODE_39'
  ],
  scanTimeout: 3000,
  retryAttempts: 3
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  lowStockThreshold: 1,
  expiryWarningDays: 2,
  batchSize: 10,
  retryAttempts: 3
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  FAMILY_DATA: 'family_data',
  LANGUAGE_PREFERENCE: 'language_preference',
  THEME_PREFERENCE: 'theme_preference',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  NOTIFICATION_SETTINGS: 'notification_settings'
};

// Database Configuration
export const DATABASE_CONFIG = {
  name: 'SmartGrocery.db',
  version: 1,
  description: 'Smart Grocery local database'
};

// Image Configuration
export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  quality: 0.8,
  formats: ['jpg', 'jpeg', 'png', 'webp'],
  maxWidth: 1024,
  maxHeight: 1024
};

// Validation Rules
export const VALIDATION_RULES = {
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: 'Please enter a valid phone number'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
  },
  barcode: {
    pattern: /^[0-9]{8,13}$/,
    message: 'Please enter a valid barcode'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  PERMISSION_ERROR: 'Permission denied. Please grant the required permissions.',
  CAMERA_ERROR: 'Camera access error. Please check camera permissions.',
  STORAGE_ERROR: 'Storage error. Please check available space.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  BARCODE_NOT_FOUND: 'Product not found. Please add manually.',
  FAMILY_NOT_FOUND: 'Family not found. Please check the invite code.',
  ITEM_NOT_FOUND: 'Item not found.',
  MERCHANT_NOT_FOUND: 'Merchant not found.',
  ORDER_NOT_FOUND: 'Order not found.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ITEM_ADDED: 'Item added successfully',
  ITEM_UPDATED: 'Item updated successfully',
  ITEM_DELETED: 'Item deleted successfully',
  FAMILY_CREATED: 'Family created successfully',
  MEMBER_ADDED: 'Member added successfully',
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

// Loading Messages
export const LOADING_MESSAGES = {
  SCANNING: 'Scanning barcode...',
  LOADING_ITEMS: 'Loading items...',
  SAVING: 'Saving...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  SYNCING: 'Syncing data...',
  SENDING: 'Sending...'
};

// Animation Configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// Screen Names
export const SCREEN_NAMES = {
  AUTH: 'Auth',
  MAIN: 'Main',
  HOME: 'Home',
  SCANNER: 'Scanner',
  INVENTORY: 'Inventory',
  FAMILY: 'Family',
  ORDERS: 'Orders',
  SETTINGS: 'Settings',
  ADD_ITEM: 'AddItem',
  EDIT_ITEM: 'EditItem',
  ITEM_DETAILS: 'ItemDetails',
  FAMILY_SETTINGS: 'FamilySettings',
  ADD_MEMBER: 'AddMember',
  MERCHANT_LIST: 'MerchantList',
  ADD_MERCHANT: 'AddMerchant',
  ORDER_DETAILS: 'OrderDetails',
  CREATE_ORDER: 'CreateOrder',
  NOTIFICATIONS: 'Notifications'
};

// Tab Names
export const TAB_NAMES = {
  HOME: 'Home',
  SCANNER: 'Scanner',
  INVENTORY: 'Inventory',
  FAMILY: 'Family',
  ORDERS: 'Orders'
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  DAIRY: 'dairy',
  FRUITS: 'fruits',
  VEGETABLES: 'vegetables',
  BAKERY: 'bakery',
  MEAT: 'meat',
  SNACKS: 'snacks',
  BEVERAGES: 'beverages',
  CANNED: 'canned',
  FROZEN: 'frozen',
  HOUSEHOLD: 'household',
  PERSONAL_CARE: 'personal_care',
  OTHER: 'other'
} as const;

// Merchant Types
export const MERCHANT_TYPES = {
  GROCERY: 'grocery',
  SUPERMARKET: 'supermarket',
  WHOLESALE: 'wholesale',
  SPECIALTY: 'specialty'
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'low_stock',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
  NEW_ITEM: 'new_item',
  ORDER_CREATED: 'order_created',
  ORDER_COMPLETED: 'order_completed',
  MEMBER_JOINED: 'member_joined',
  CUSTOM: 'custom'
} as const;

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
} as const;

// Languages
export const LANGUAGES = {
  ENGLISH: 'en',
  TAMIL: 'ta'
} as const;

// Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

// Units
export const UNITS = {
  PIECES: 'pieces',
  KILOGRAMS: 'kg',
  GRAMS: 'g',
  LITERS: 'l',
  MILLILITERS: 'ml',
  PACKS: 'packs',
  BOTTLES: 'bottles',
  CANS: 'cans',
  BAGS: 'bags',
  BOXES: 'boxes'
} as const;

// Sort Options
export const SORT_OPTIONS = {
  NAME: 'name',
  QUANTITY: 'quantity',
  EXPIRY_DATE: 'expiryDate',
  DATE_ADDED: 'dateAdded'
} as const;

// Sort Orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_SIZE: 100,
  CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 minutes
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  BARCODE_SCANNING: true,
  FAMILY_COLLABORATION: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: true,
  MULTILINGUAL: true,
  DARK_THEME: true,
  ANALYTICS: true,
  CRASH_REPORTING: true
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  APP_OPEN: 'app_open',
  ITEM_ADDED: 'item_added',
  ITEM_SCANNED: 'item_scanned',
  FAMILY_CREATED: 'family_created',
  MEMBER_ADDED: 'member_added',
  ORDER_CREATED: 'order_created',
  NOTIFICATION_RECEIVED: 'notification_received',
  LANGUAGE_CHANGED: 'language_changed',
  THEME_CHANGED: 'theme_changed'
} as const;

// Performance Metrics
export const PERFORMANCE_METRICS = {
  APP_LAUNCH_TIME: 3000, // 3 seconds
  SCAN_RECOGNITION_TIME: 3000, // 3 seconds
  API_RESPONSE_TIME: 2000, // 2 seconds
  MEMORY_USAGE_LIMIT: 150 * 1024 * 1024, // 150MB
  APP_SIZE_LIMIT: 100 * 1024 * 1024 // 100MB
} as const; 