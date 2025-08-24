import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TAB_NAMES } from '@constants/index';

interface TabBarIconProps {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ routeName, focused, color, size }) => {
  const getIconName = (routeName: string): string => {
    switch (routeName) {
      case TAB_NAMES.HOME:
        return 'home';
      case TAB_NAMES.SCANNER:
        return 'qrcode-scan';
      case TAB_NAMES.INVENTORY:
        return 'package-variant';
      case TAB_NAMES.FAMILY:
        return 'account-group';
      case TAB_NAMES.ORDERS:
        return 'shopping';
      default:
        return 'circle';
    }
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon
        name={getIconName(routeName)}
        size={size}
        color={color}
      />
    </View>
  );
};

export default TabBarIcon; 