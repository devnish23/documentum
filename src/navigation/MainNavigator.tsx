import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { SCREEN_NAMES, TAB_NAMES, COLORS } from '@constants/index';

// Import screens
import HomeScreen from '@screens/HomeScreen';
import ScannerScreen from '@screens/ScannerScreen';
import InventoryScreen from '@screens/InventoryScreen';
import FamilyScreen from '@screens/FamilyScreen';
import OrdersScreen from '@screens/OrdersScreen';
import AddItemScreen from '@screens/AddItemScreen';
import EditItemScreen from '@screens/EditItemScreen';
import ItemDetailsScreen from '@screens/ItemDetailsScreen';
import FamilySettingsScreen from '@screens/FamilySettingsScreen';
import AddMemberScreen from '@screens/AddMemberScreen';
import MerchantListScreen from '@screens/MerchantListScreen';
import AddMerchantScreen from '@screens/AddMerchantScreen';
import OrderDetailsScreen from '@screens/OrderDetailsScreen';
import CreateOrderScreen from '@screens/CreateOrderScreen';
import NotificationsScreen from '@screens/NotificationsScreen';
import SettingsScreen from '@screens/SettingsScreen';

// Import components
import TabBarIcon from '@components/TabBarIcon';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
const TabNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon routeName={route.name} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.gray[50],
          borderTopColor: COLORS.gray[200],
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name={TAB_NAMES.HOME}
        component={HomeScreen}
        options={{
          title: t('navigation.home'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={TAB_NAMES.SCANNER}
        component={ScannerScreen}
        options={{
          title: t('navigation.scanner'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={TAB_NAMES.INVENTORY}
        component={InventoryScreen}
        options={{
          title: t('navigation.inventory'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={TAB_NAMES.FAMILY}
        component={FamilyScreen}
        options={{
          title: t('navigation.family'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={TAB_NAMES.ORDERS}
        component={OrdersScreen}
        options={{
          title: t('navigation.orders'),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary[500],
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Inventory Stack */}
      <Stack.Screen
        name={SCREEN_NAMES.ADD_ITEM}
        component={AddItemScreen}
        options={{
          title: t('screens.add_item'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.EDIT_ITEM}
        component={EditItemScreen}
        options={{
          title: t('screens.edit_item'),
        }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ITEM_DETAILS}
        component={ItemDetailsScreen}
        options={{
          title: t('screens.item_details'),
        }}
      />

      {/* Family Stack */}
      <Stack.Screen
        name={SCREEN_NAMES.FAMILY_SETTINGS}
        component={FamilySettingsScreen}
        options={{
          title: t('screens.family_settings'),
        }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ADD_MEMBER}
        component={AddMemberScreen}
        options={{
          title: t('screens.add_member'),
        }}
      />

      {/* Merchants Stack */}
      <Stack.Screen
        name={SCREEN_NAMES.MERCHANT_LIST}
        component={MerchantListScreen}
        options={{
          title: t('screens.merchant_list'),
        }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.ADD_MERCHANT}
        component={AddMerchantScreen}
        options={{
          title: t('screens.add_merchant'),
        }}
      />

      {/* Orders Stack */}
      <Stack.Screen
        name={SCREEN_NAMES.ORDER_DETAILS}
        component={OrderDetailsScreen}
        options={{
          title: t('screens.order_details'),
        }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.CREATE_ORDER}
        component={CreateOrderScreen}
        options={{
          title: t('screens.create_order'),
        }}
      />

      {/* Other Screens */}
      <Stack.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          title: t('screens.notifications'),
        }}
      />
      <Stack.Screen
        name={SCREEN_NAMES.SETTINGS}
        component={SettingsScreen}
        options={{
          title: t('screens.settings'),
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator; 