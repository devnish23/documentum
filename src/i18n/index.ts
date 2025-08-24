import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, STORAGE_KEYS } from '@constants/index';
import { TranslationKeys } from '@types/index';

// English translations
const en: TranslationKeys = {
  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    search: 'Search'
  },
  categories: {
    dairy: 'Dairy',
    fruits: 'Fruits',
    vegetables: 'Vegetables',
    bakery: 'Bakery',
    meat: 'Meat',
    snacks: 'Snacks',
    beverages: 'Beverages',
    canned: 'Canned',
    frozen: 'Frozen',
    household: 'Household',
    personal_care: 'Personal Care',
    other: 'Other'
  },
  inventory: {
    title: 'Inventory',
    add_item: 'Add Item',
    search_items: 'Search items...',
    quantity: 'Quantity',
    expiry_date: 'Expiry Date',
    fresh: 'Fresh',
    expiring_soon: 'Expiring Soon',
    expired: 'Expired'
  },
  scanner: {
    title: 'Scanner',
    instruction: 'Point camera at barcode to scan',
    manual_entry: 'Manual Entry',
    scanning: 'Scanning...',
    not_found: 'Product not found'
  },
  family: {
    title: 'Family',
    add_member: 'Add Member',
    member_name: 'Member Name',
    phone_number: 'Phone Number',
    role: 'Role',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member'
  },
  orders: {
    title: 'Orders',
    new_order: 'New Order',
    merchant: 'Merchant',
    status: 'Status',
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed'
  },
  notifications: {
    low_stock: 'Low Stock',
    expiring_soon: 'Expiring Soon',
    expired: 'Expired',
    new_item: 'New Item'
  }
};

// Tamil translations
const ta: TranslationKeys = {
  common: {
    add: 'சேர்க்கவும்',
    edit: 'திருத்து',
    delete: 'நீக்கு',
    save: 'சேமி',
    cancel: 'ரத்து செய்',
    confirm: 'உறுதி செய்',
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    search: 'தேடு'
  },
  categories: {
    dairy: 'பால் பொருட்கள்',
    fruits: 'பழங்கள்',
    vegetables: 'காய்கறிகள்',
    bakery: 'பேக்கரி',
    meat: 'இறைச்சி',
    snacks: 'தின்பண்டங்கள்',
    beverages: 'பானங்கள்',
    canned: 'கேன் பொருட்கள்',
    frozen: 'உறைந்த உணவுகள்',
    household: 'வீட்டுப் பொருட்கள்',
    personal_care: 'தனிப்பட்ட பராமரிப்பு',
    other: 'மற்றவை'
  },
  inventory: {
    title: 'பொருட்கள் பட்டியல்',
    add_item: 'பொருள் சேர்க்கவும்',
    search_items: 'பொருட்களைத் தேடுங்கள்...',
    quantity: 'அளவு',
    expiry_date: 'காலாவதி தேதி',
    fresh: 'புதிய',
    expiring_soon: 'விரைவில் காலாவதியாகும்',
    expired: 'காலாவதியான'
  },
  scanner: {
    title: 'ஸ்கேனர்',
    instruction: 'பார்கோடை ஸ்கேன் செய்ய கேமராவை சுட்டிக்காட்டவும்',
    manual_entry: 'கைமுறையாக நுழைக்கவும்',
    scanning: 'ஸ்கேன் செயலாக்கத்தில்',
    not_found: 'தயாரிப்பு கண்டுபிடிக்கப்படவில்லை'
  },
  family: {
    title: 'குடும்பம்',
    add_member: 'உறுப்பினரைச் சேர்க்கவும்',
    member_name: 'உறுப்பினரின் பெயர்',
    phone_number: 'தொலைபேசி எண்',
    role: 'பங்கு',
    owner: 'உரிமையாளர்',
    admin: 'நிர்வாகி',
    member: 'உறுப்பினர்'
  },
  orders: {
    title: 'ஆர்டர்கள்',
    new_order: 'புதிய ஆர்டர்',
    merchant: 'வணிகர்',
    status: 'நிலை',
    pending: 'நிலுவையில்',
    processing: 'செயலாக்கத்தில்',
    completed: 'முடிந்தது'
  },
  notifications: {
    low_stock: 'குறைந்த சரக்கு',
    expiring_soon: 'விரைவில் காலாவதியாகும்',
    expired: 'காலாவதியான',
    new_item: 'புதிய பொருள்'
  }
};

const resources = {
  en: {
    translation: en
  },
  ta: {
    translation: ta
  }
};

// Language detection
const getDefaultLanguage = (): string => {
  const locales = getLocales();
  const deviceLanguage = locales[0]?.languageCode || 'en';
  
  // Check if device language is Tamil
  if (deviceLanguage === 'ta') {
    return LANGUAGES.TAMIL;
  }
  
  return LANGUAGES.ENGLISH;
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: LANGUAGES.ENGLISH,
    debug: __DEV__,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false,
    },
  });

// Language management
export const setLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

export const getLanguage = async (): Promise<string> => {
  try {
    const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE);
    return language || getDefaultLanguage();
  } catch (error) {
    console.error('Error getting language:', error);
    return getDefaultLanguage();
  }
};

export const initializeLanguage = async (): Promise<void> => {
  try {
    const savedLanguage = await getLanguage();
    await i18n.changeLanguage(savedLanguage);
  } catch (error) {
    console.error('Error initializing language:', error);
  }
};

// Translation helper functions
export const t = (key: string, options?: any): string => {
  return i18n.t(key, options);
};

export const tWithFallback = (key: string, fallback: string, options?: any): string => {
  const translation = i18n.t(key, options);
  return translation === key ? fallback : translation;
};

// Category translation helper
export const getCategoryName = (category: string): string => {
  return t(`categories.${category}`, { defaultValue: category });
};

// Status translation helper
export const getStatusName = (status: string): string => {
  return t(`orders.${status}`, { defaultValue: status });
};

// Notification translation helper
export const getNotificationTitle = (type: string): string => {
  return t(`notifications.${type}`, { defaultValue: type });
};

export default i18n; 