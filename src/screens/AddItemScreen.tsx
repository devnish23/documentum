import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@constants/index';
import { RootState, RootStackParamList, ProductCategory, ProductInfo } from '@types/index';
import { addInventoryItem } from '@store/slices/inventorySlice';

type AddItemScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddItem'>;
type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItem'>;

const AddItemScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<AddItemScreenNavigationProp>();
  const route = useRoute<AddItemScreenRouteProp>();
  
  const { currentFamily } = useSelector((state: RootState) => state.family);
  const { isLoading } = useSelector((state: RootState) => state.inventory);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    quantity: '1',
    unit: 'pieces',
    category: ProductCategory.OTHER,
    expiryDate: null as Date | null,
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Predefined units and categories
  const units = ['pieces', 'kg', 'grams', 'liters', 'ml', 'packets', 'bottles', 'cans'];
  const categories = Object.values(ProductCategory);

  useEffect(() => {
    // Pre-fill form if barcode and product info are provided
    if (route.params?.barcode) {
      setFormData(prev => ({
        ...prev,
        barcode: route.params.barcode!,
      }));
    }

    if (route.params?.productInfo) {
      const productInfo = route.params.productInfo;
      setFormData(prev => ({
        ...prev,
        name: productInfo.name,
        category: productInfo.category,
        unit: productInfo.defaultUnit,
      }));
    }
  }, [route.params]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuantityChange = (value: string) => {
    // Only allow positive numbers
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      quantity: value,
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        expiryDate: selectedDate,
      }));
    }
  };

  const handleCategorySelect = (category: ProductCategory) => {
    setFormData(prev => ({
      ...prev,
      category,
    }));
    setShowCategoryPicker(false);
  };

  const handleUnitSelect = (unit: string) => {
    setFormData(prev => ({
      ...prev,
      unit,
    }));
    setShowUnitPicker(false);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('add_item.name_required'));
      return false;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      Alert.alert(t('common.error'), t('add_item.quantity_required'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!currentFamily) {
      Alert.alert(t('common.error'), t('add_item.no_family'));
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        familyId: currentFamily.id,
        name: formData.name.trim(),
        barcode: formData.barcode || undefined,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        expiryDate: formData.expiryDate,
        notes: formData.notes.trim() || undefined,
      };

      await dispatch(addInventoryItem(itemData));
      
      Alert.alert(
        t('common.success'),
        t('add_item.item_added'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Add item error:', error);
      Alert.alert(t('common.error'), t('add_item.add_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: ProductCategory): string => {
    const colors = {
      [ProductCategory.DAIRY]: COLORS.primary[500],
      [ProductCategory.FRUITS]: COLORS.success[500],
      [ProductCategory.VEGETABLES]: COLORS.success[500],
      [ProductCategory.BAKERY]: COLORS.secondary[500],
      [ProductCategory.MEAT]: COLORS.error[500],
      [ProductCategory.SNACKS]: COLORS.warning[500],
      [ProductCategory.BEVERAGES]: COLORS.primary[500],
      [ProductCategory.CANNED]: COLORS.gray[500],
      [ProductCategory.FROZEN]: COLORS.primary[500],
      [ProductCategory.HOUSEHOLD]: COLORS.gray[500],
      [ProductCategory.PERSONAL_CARE]: COLORS.secondary[500],
      [ProductCategory.OTHER]: COLORS.gray[500],
    };
    return colors[category] || COLORS.gray[500];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('add_item.title')}</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Product Image (if available) */}
        {route.params?.productInfo?.imageUrl && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: route.params.productInfo.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Item Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_item.name')} *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder={t('add_item.name_placeholder')}
            placeholderTextColor={COLORS.gray[400]}
          />
        </View>

        {/* Barcode */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_item.barcode')}</Text>
          <TextInput
            style={styles.textInput}
            value={formData.barcode}
            onChangeText={(value) => handleInputChange('barcode', value)}
            placeholder={t('add_item.barcode_placeholder')}
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="numeric"
          />
        </View>

        {/* Quantity and Unit */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('add_item.quantity')} *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.quantity}
              onChangeText={handleQuantityChange}
              placeholder="1"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('add_item.unit')}</Text>
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => setShowUnitPicker(true)}
            >
              <Text style={styles.pickerButtonText}>{formData.unit}</Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_item.category')}</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowCategoryPicker(true)}
          >
            <View style={styles.categoryDisplay}>
              <View 
                style={[
                  styles.categoryColor, 
                  { backgroundColor: getCategoryColor(formData.category) }
                ]} 
              />
              <Text style={styles.pickerButtonText}>
                {t(`categories.${formData.category}`)}
              </Text>
            </View>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Expiry Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_item.expiry_date')}</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerButtonText}>
              {formData.expiryDate 
                ? formatDate(formData.expiryDate)
                : t('add_item.no_expiry')
              }
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('add_item.notes')}</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder={t('add_item.notes_placeholder')}
            placeholderTextColor={COLORS.gray[400]}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('add_item.select_category')}</Text>
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryItem}
                  onPress={() => handleCategorySelect(category)}
                >
                  <View 
                    style={[
                      styles.categoryColor, 
                      { backgroundColor: getCategoryColor(category) }
                    ]} 
                  />
                  <Text style={styles.categoryItemText}>
                    {t(`categories.${category}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Unit Picker Modal */}
      {showUnitPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('add_item.select_unit')}</Text>
            <ScrollView style={styles.unitList}>
              {units.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={styles.unitItem}
                  onPress={() => handleUnitSelect(unit)}
                >
                  <Text style={styles.unitItemText}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowUnitPicker(false)}
            >
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.expiryDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.gray[800],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
  },
  saveButton: {
    backgroundColor: COLORS.primary[500],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
  saveButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  form: {
    padding: SPACING.lg,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[800],
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[800],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[800],
  },
  pickerArrow: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  categoryItemText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[800],
  },
  unitList: {
    maxHeight: 300,
  },
  unitItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  unitItemText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[800],
  },
  modalCancelButton: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default AddItemScreen; 