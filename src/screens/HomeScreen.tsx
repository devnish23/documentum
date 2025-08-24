import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@constants/index';
import { RootState, RootStackParamList } from '@types/index';
import { fetchInventory } from '@store/slices/inventorySlice';
import { fetchFamily } from '@store/slices/familySlice';
import { fetchNotifications } from '@store/slices/notificationsSlice';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentFamily } = useSelector((state: RootState) => state.family);
  const { items, isLoading } = useSelector((state: RootState) => state.inventory);
  const { unreadCount } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (currentFamily) {
      dispatch(fetchInventory(currentFamily.id));
      dispatch(fetchNotifications(currentFamily.id));
    }
  }, [dispatch, currentFamily]);

  const handleRefresh = () => {
    if (currentFamily) {
      dispatch(fetchInventory(currentFamily.id));
      dispatch(fetchFamily(currentFamily.id));
      dispatch(fetchNotifications(currentFamily.id));
    }
  };

  const getExpiringItems = () => {
    const today = new Date();
    const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    return items.filter(item => 
      item.expiryDate && new Date(item.expiryDate) <= twoDaysFromNow
    );
  };

  const getLowStockItems = () => {
    return items.filter(item => item.quantity <= 1);
  };

  const getExpiredItems = () => {
    const today = new Date();
    return items.filter(item => 
      item.expiryDate && new Date(item.expiryDate) < today
    );
  };

  const expiringItems = getExpiringItems();
  const lowStockItems = getLowStockItems();
  const expiredItems = getExpiredItems();

  const handleScanItem = () => {
    navigation.navigate('Scanner');
  };

  const handleAddItem = () => {
    navigation.navigate('AddItem');
  };

  const handleViewInventory = () => {
    navigation.navigate('Inventory');
  };

  const handleViewNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleCreateOrder = () => {
    if (lowStockItems.length === 0) {
      Alert.alert(
        t('orders.no_low_stock_title'),
        t('orders.no_low_stock_message')
      );
      return;
    }
    navigation.navigate('CreateOrder');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('common.good_morning');
    if (hour < 17) return t('common.good_afternoon');
    return t('common.good_evening');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name || t('common.user')}!
          </Text>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleViewNotifications}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.familyName}>
          {currentFamily?.name || t('family.no_family')}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{items.length}</Text>
          <Text style={styles.statLabel}>{t('inventory.total_items')}</Text>
        </View>
        <View style={[styles.statCard, lowStockItems.length > 0 && styles.statCardWarning]}>
          <Text style={[styles.statNumber, lowStockItems.length > 0 && styles.statNumberWarning]}>
            {lowStockItems.length}
          </Text>
          <Text style={styles.statLabel}>{t('inventory.low_stock')}</Text>
        </View>
        <View style={[styles.statCard, expiringItems.length > 0 && styles.statCardWarning]}>
          <Text style={[styles.statNumber, expiringItems.length > 0 && styles.statNumberWarning]}>
            {expiringItems.length}
          </Text>
          <Text style={styles.statLabel}>{t('inventory.expiring_soon')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.quick_actions')}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleScanItem}>
            <Text style={styles.actionButtonIcon}>📷</Text>
            <Text style={styles.actionButtonText}>{t('scanner.scan_item')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddItem}>
            <Text style={styles.actionButtonIcon}>➕</Text>
            <Text style={styles.actionButtonText}>{t('inventory.add_item')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewInventory}>
            <Text style={styles.actionButtonIcon}>📋</Text>
            <Text style={styles.actionButtonText}>{t('inventory.view_inventory')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {lowStockItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('inventory.low_stock_items')}</Text>
            <TouchableOpacity onPress={handleCreateOrder}>
              <Text style={styles.createOrderText}>{t('orders.create_order')}</Text>
            </TouchableOpacity>
          </View>
          {lowStockItems.slice(0, 3).map((item) => (
            <View key={item.id} style={[styles.itemCard, styles.lowStockCard]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {t(`categories.${item.category}`)}
                </Text>
              </View>
              <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
            </View>
          ))}
          {lowStockItems.length > 3 && (
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>
                {t('common.view_all')} ({lowStockItems.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {expiringItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('inventory.expiring_soon')}</Text>
          {expiringItems.slice(0, 3).map((item) => (
            <View key={item.id} style={[styles.itemCard, styles.expiringCard]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {t(`categories.${item.category}`)}
                </Text>
              </View>
              <View style={styles.itemExpiry}>
                <Text style={styles.expiryText}>
                  {t('inventory.expires')}: {new Date(item.expiryDate!).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
          {expiringItems.length > 3 && (
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>
                {t('common.view_all')} ({expiringItems.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {expiredItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('inventory.expired_items')}</Text>
          {expiredItems.slice(0, 3).map((item) => (
            <View key={item.id} style={[styles.itemCard, styles.expiredCard]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {t(`categories.${item.category}`)}
                </Text>
              </View>
              <View style={styles.itemExpiry}>
                <Text style={styles.expiredText}>
                  {t('inventory.expired')}: {new Date(item.expiryDate!).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
          {expiredItems.length > 3 && (
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>
                {t('common.view_all')} ({expiredItems.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🛒</Text>
          <Text style={styles.emptyStateTitle}>{t('inventory.empty_title')}</Text>
          <Text style={styles.emptyStateMessage}>{t('inventory.empty_message')}</Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={handleScanItem}>
            <Text style={styles.emptyStateButtonText}>{t('scanner.scan_first_item')}</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: COLORS.primary[500],
    padding: SPACING.xl,
    paddingTop: SPACING['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#fff',
    flex: 1,
  },
  familyName: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.primary[100],
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
  },
  notificationIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error[500],
    borderRadius: BORDER_RADIUS.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardWarning: {
    borderColor: COLORS.warning[500],
    borderWidth: 1,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary[500],
    marginBottom: SPACING.xs,
  },
  statNumberWarning: {
    color: COLORS.warning[600],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[800],
  },
  createOrderText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonIcon: {
    fontSize: TYPOGRAPHY.sizes.xl,
    marginBottom: SPACING.xs,
  },
  actionButtonText: {
    color: COLORS.gray[800],
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lowStockCard: {
    borderLeftColor: COLORS.warning[500],
    borderLeftWidth: 4,
  },
  expiringCard: {
    borderLeftColor: COLORS.warning[500],
    borderLeftWidth: 4,
  },
  expiredCard: {
    borderLeftColor: COLORS.error[500],
    borderLeftWidth: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[800],
    marginBottom: SPACING.xs,
  },
  itemCategory: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
  },
  itemQuantity: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.warning[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  itemExpiry: {
    alignItems: 'flex-end',
  },
  expiryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.warning[600],
  },
  expiredText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error[600],
  },
  viewMoreButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  viewMoreText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary[500],
    fontWeight: TYPOGRAPHY.weights.medium,
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

export default HomeScreen; 