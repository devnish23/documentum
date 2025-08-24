// Core App Types
export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  profileImage?: string;
  preferredLanguage: 'en' | 'ta';
  createdAt: Date;
  lastActiveAt: Date;
  isVerified: boolean;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  settings: FamilySettings;
  memberCount: number;
}

export interface FamilySettings {
  notifications: {
    lowStock: boolean;
    expiringSoon: boolean;
    expired: boolean;
    newItems: boolean;
  };
  lowStockThreshold: number; // default: 1
  expiryWarningDays: number; // default: 2
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  familyId: string;
  name: string;
  barcode?: string;
  quantity: number;
  unit: string;
  category: ProductCategory;
  expiryDate?: Date;
  imageUrl?: string;
  addedBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  notes?: string;
}

export enum ProductCategory {
  DAIRY = 'dairy',
  FRUITS = 'fruits',
  VEGETABLES = 'vegetables',
  BAKERY = 'bakery',
  MEAT = 'meat',
  SNACKS = 'snacks',
  BEVERAGES = 'beverages',
  CANNED = 'canned',
  FROZEN = 'frozen',
  HOUSEHOLD = 'household',
  PERSONAL_CARE = 'personal_care',
  OTHER = 'other'
}

// Merchant Types
export interface Merchant {
  id: string;
  familyId: string;
  name: string;
  type: MerchantType;
  phone: string;
  email?: string;
  address?: Address;
  categories: ProductCategory[];
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MerchantType {
  GROCERY = 'grocery',
  SUPERMARKET = 'supermarket',
  WHOLESALE = 'wholesale',
  SPECIALTY = 'specialty'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Order Types
export interface Order {
  id: string;
  familyId: string;
  merchantId: string;
  status: OrderStatus;
  items: OrderItem[];
  notes?: string;
  estimatedTotal?: number;
  actualTotal?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  inventoryItemId: string;
  name: string; // snapshot of item name
  quantity: number;
  unit: string;
  notes?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Notification Types
export interface Notification {
  id: string;
  familyId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  recipients: string[]; // user IDs
  sentAt: Date;
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
}

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  NEW_ITEM = 'new_item',
  ORDER_CREATED = 'order_created',
  ORDER_COMPLETED = 'order_completed',
  MEMBER_JOINED = 'member_joined',
  CUSTOM = 'custom'
}

// Barcode Types
export interface BarcodeResult {
  barcode: string;
  format: BarcodeFormat;
  productInfo?: ProductInfo;
}

export interface ProductInfo {
  name: string;
  brand?: string;
  category: ProductCategory;
  imageUrl?: string;
  defaultUnit: string;
  nutrition?: NutritionInfo;
}

export interface NutritionInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

export enum BarcodeFormat {
  UPC_A = 'UPC_A',
  UPC_E = 'UPC_E',
  EAN_13 = 'EAN_13',
  EAN_8 = 'EAN_8',
  CODE_128 = 'CODE_128',
  CODE_39 = 'CODE_39',
  QR_CODE = 'QR_CODE'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Redux State Types
export interface RootState {
  auth: AuthState;
  family: FamilyState;
  inventory: InventoryState;
  merchants: MerchantState;
  orders: OrderState;
  notifications: NotificationState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface FamilyState {
  currentFamily: Family | null;
  members: FamilyMember[];
  isLoading: boolean;
  error: string | null;
}

export interface InventoryState {
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  categories: ProductCategory[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: ProductCategory | null;
  sortBy: 'name' | 'quantity' | 'expiryDate' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
}

export interface MerchantState {
  merchants: Merchant[];
  isLoading: boolean;
  error: string | null;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isLoading: boolean;
  currentScreen: string;
  theme: 'light' | 'dark';
  language: 'en' | 'ta';
  showScanner: boolean;
  showAddItem: boolean;
  showFamilySettings: boolean;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Scanner: undefined;
  AddItem: { barcode?: string; productInfo?: ProductInfo };
  EditItem: { item: InventoryItem };
  ItemDetails: { item: InventoryItem };
  FamilySettings: undefined;
  AddMember: undefined;
  MerchantList: undefined;
  AddMerchant: undefined;
  OrderDetails: { order: Order };
  CreateOrder: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scanner: undefined;
  Inventory: undefined;
  Family: undefined;
  Orders: undefined;
};

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: string;
  rightIcon?: string;
  secureTextEntry?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  shadow?: boolean;
}

export interface ExpiryIndicatorProps {
  expiryDate?: Date;
  showIcon?: boolean;
}

export interface QuantityControlProps {
  quantity: number;
  onQuantityChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export interface CategoryChipProps {
  category: ProductCategory;
  selected?: boolean;
  onPress?: (category: ProductCategory) => void;
}

// Utility Types
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Theme Types
export interface Colors {
  primary: {
    50: string;
    100: string;
    500: string;
    600: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    500: string;
    600: string;
  };
  success: {
    50: string;
    500: string;
    600: string;
  };
  warning: {
    50: string;
    500: string;
    600: string;
  };
  error: {
    50: string;
    500: string;
    600: string;
  };
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export interface Typography {
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  weights: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  families: {
    primary: string;
    secondary: string;
  };
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface BorderRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

// Translation Types
export interface TranslationKeys {
  common: {
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    search: string;
  };
  categories: Record<ProductCategory, string>;
  inventory: {
    title: string;
    add_item: string;
    search_items: string;
    quantity: string;
    expiry_date: string;
    fresh: string;
    expiring_soon: string;
    expired: string;
  };
  scanner: {
    title: string;
    instruction: string;
    manual_entry: string;
    scanning: string;
    not_found: string;
  };
  family: {
    title: string;
    add_member: string;
    member_name: string;
    phone_number: string;
    role: string;
    owner: string;
    admin: string;
    member: string;
  };
  orders: {
    title: string;
    new_order: string;
    merchant: string;
    status: string;
    pending: string;
    processing: string;
    completed: string;
  };
  notifications: {
    low_stock: string;
    expiring_soon: string;
    expired: string;
    new_item: string;
  };
} 