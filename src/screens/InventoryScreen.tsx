import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@constants/index';
import { RootState, RootStackParamList, ProductCategory, InventoryItem } from '@types/index';
import { fetchInventory, updateInventoryItem, deleteInventoryItem } from '@store/slices/inventorySlice';

type InventoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Inventory'>;

const InventoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<InventoryScreenNavigationProp>();
  
  const { currentFamily } = useSelector((state: RootState) => state.family);
  const { items, isLoading, searchTerm, selectedCategory, sortBy, sortOrder } = useSelector(
    (state: RootState) => state.inventory
  );

  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    if (currentFamily) {
      dispatch(fetchInventory(currentFamily.id));
    }
  }, [dispatch, currentFamily]);

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchTerm, selectedCategory, sortBy, sortOrder]);

  const filterAndSortItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'expiryDate':
          if (!a.expiryDate && !b.expiryDate) comparison = 0;
          else if (!a.expiryDate) comparison = 1;
          else if (!b.expiryDate) comparison = -1;
          else comparison = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
          break;
        case 'dateAdded':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(filtered);
  };

  const handleRefresh = () => {
    if (currentFamily) {
      dispatch(fetchInventory(currentFamily.id));
    }
  };

  const handleSearch = (text: string) => {
    // This would dispatch a search action to Redux
    console.log('Search:', text);
  };

  const handleCategoryFilter = (category: ProductCategory | null) => {
    // This would dispatch a category filter action to Redux
    console.log('Category filter:', category);
  };

  const handleSort = (sortBy: 'name' | 'quantity' | 'expiryDate' | 'dateAdded') => {
    // This would dispatch a sort action to Redux
    console.log('Sort by:', sortBy);
  };

  const handleQuantityChange = async (item: InventoryItem, change: number) => {
    const newQuantity = item.quantity + change;
    
    if (newQuantity < 0) {
      Alert.alert(t('common.error'), t('inventory.quantity_cannot_be_negative'));
      return;
    }

    try {
      await dispatch(updateInventoryItem({
        id: item.id,
        quantity: newQuantity,
      }));
    } catch (error) {
      console.error('Update quantity error:', error);
      Alert.alert(t('common.error'), t('inventory.update_failed'));
    }
  };

  const handleDeleteItem = (item: InventoryItem) => {
    Alert.alert(
      t('common.confirm'),
      t('inventory.delete_confirm', { name: item.name }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteInventoryItem(item.id));
            } catch (error) {
              console.error('Delete item error:', error);
              Alert.alert(t('common.error'), t('inventory.delete_failed'));
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (item: InventoryItem) => {
    navigation.navigate('ItemDetails', { item });
  };

  const getExpiryStatus = (item: InventoryItem): 'fresh' | 'expiring' | 'expired' => {
    if (!item.expiryDate) return 'fresh';
    
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 2) return 'expiring';
    return 'fresh';
  };

  const getExpiryColor = (status: 'fresh' | 'expiring' | 'expired') => {
    switch (status) {
      case 'fresh':
        return COLORS.success[500];
      case 'expiring':
        return COLORS.warning[500];
      case 'expired':
        return COLORS.error[500];
      default:
        return COLORS.gray[500];
    }
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

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('inventory.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddItem')}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('inventory.search_placeholder')}
            placeholderTextColor={COLORS.gray[400]}
            value={searchTerm}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filterOptions}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedCategory && styles.filterChipActive
              ]}
              onPress={() => handleCategoryFilter(null)}
            >
              <Text style={[
                styles.filterChipText,
                !selectedCategory && styles.filterChipTextActive
              ]}>
                {t('common.all')}
              </Text>
            </TouchableOpacity>
            {Object.values(ProductCategory).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <View style={[
                  styles.categoryDot,
                  { backgroundColor: getCategoryColor(category) }
                ]} />
                <Text style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive
                ]}>
                  {t(`categories.${category}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>{t('inventory.sort_by')}:</Text>
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <Text style={styles.sortButtonText}>
            {t(`inventory.sort_${sortBy}`)} {sortOrder === 'asc' ? '↑' : '↓'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📦</Text>
            <Text style={styles.emptyStateTitle}>
              {searchTerm || selectedCategory 
                ? t('inventory.no_results')
                : t('inventory.empty_title')
              }
            </Text>
            <Text style={styles.emptyStateMessage}>
              {searchTerm || selectedCategory 
                ? t('inventory.no_results_message')
                : t('inventory.empty_message')
              }
            </Text>
            {!searchTerm && !selectedCategory && (
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('AddItem')}
              >
                <Text style={styles.emptyStateButtonText}>
                  {t('inventory.add_first_item')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredItems.map((item) => {
            const expiryStatus = getExpiryStatus(item);
            const expiryColor = getExpiryColor(expiryStatus);
            
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(item.category) }
                    ]}>
                      <Text style={styles.categoryBadgeText}>
                        {t(`categories.${item.category}`)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                    {item.expiryDate && (
                      <View style={styles.expiryContainer}>
                        <View style={[styles.expiryDot, { backgroundColor: expiryColor }]} />
                        <Text style={[styles.expiryText, { color: expiryColor }]}>
                          {formatDate(item.expiryDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item, -1)}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.quantityDisplay}>{item.quantity}</Text>
                  
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  searchIcon: {
    fontSize: TYPOGRAPHY.sizes.md,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[800],
    paddingVertical: SPACING.md,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  filterOptions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#fff',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  filterChipActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  filterChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  filterChipTextActive: {
    color: '#fff',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sortLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    marginRight: SPACING.sm,
  },
  sortButton: {
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[800],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  itemName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[800],
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  itemQuantity: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.xs,
  },
  expiryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: '#fff',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  quantityDisplay: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[800],
    minWidth: 30,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING['2xl'],
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary[500],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default InventoryScreen; 