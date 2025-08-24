import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RNCamera } from 'react-native-camera';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '@constants/index';
import { RootStackParamList, BarcodeResult, ProductInfo } from '@types/index';
import { addInventoryItem } from '@store/slices/inventorySlice';

type ScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Scanner'>;

const { width, height } = Dimensions.get('window');
const SCANNER_HEIGHT = height * 0.6;

const ScannerScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<ScannerScreenNavigationProp>();
  const cameraRef = useRef<RNCamera>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const { status } = await RNCamera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Camera permission error:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeRead = async (event: any) => {
    if (isScanning) return;
    
    setIsScanning(true);
    const { data, type } = event;
    
    console.log('Barcode detected:', { data, type });
    
    try {
      // Simulate product lookup API call
      const productInfo = await lookupProduct(data);
      
      if (productInfo) {
        // Navigate to AddItem screen with product info
        navigation.navigate('AddItem', {
          barcode: data,
          productInfo: productInfo
        });
      } else {
        // Product not found, show manual entry option
        Alert.alert(
          t('scanner.product_not_found_title'),
          t('scanner.product_not_found_message'),
          [
            {
              text: t('common.cancel'),
              style: 'cancel',
            },
            {
              text: t('scanner.manual_entry'),
              onPress: () => navigation.navigate('AddItem', { barcode: data }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Product lookup error:', error);
      Alert.alert(
        t('common.error'),
        t('scanner.lookup_error'),
        [
          {
            text: t('common.ok'),
            onPress: () => setIsScanning(false),
          },
        ]
      );
    }
  };

  const lookupProduct = async (barcode: string): Promise<ProductInfo | null> => {
    // Simulate API call to barcode database
    // In real implementation, this would call UPC Item DB or Open Food Facts API
    
    // Mock product database
    const mockProducts: Record<string, ProductInfo> = {
      '1234567890123': {
        name: 'Organic Milk',
        brand: 'Fresh Farms',
        category: 'dairy',
        defaultUnit: 'liters',
        imageUrl: 'https://example.com/milk.jpg',
      },
      '9876543210987': {
        name: 'Bananas',
        brand: 'Tropical Fruits',
        category: 'fruits',
        defaultUnit: 'pieces',
        imageUrl: 'https://example.com/bananas.jpg',
      },
      '4567891234567': {
        name: 'Whole Wheat Bread',
        brand: 'Bakery Fresh',
        category: 'bakery',
        defaultUnit: 'pieces',
        imageUrl: 'https://example.com/bread.jpg',
      },
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockProducts[barcode] || null;
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === RNCamera.Constants.FlashMode.off
        ? RNCamera.Constants.FlashMode.torch
        : RNCamera.Constants.FlashMode.off
    );
  };

  const switchCamera = () => {
    setCameraType(
      cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back
    );
  };

  const handleManualEntry = () => {
    navigation.navigate('AddItem');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>{t('scanner.checking_permission')}</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>{t('scanner.camera_permission_title')}</Text>
          <Text style={styles.permissionMessage}>{t('scanner.camera_permission_message')}</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={checkCameraPermission}>
            <Text style={styles.permissionButtonText}>{t('scanner.grant_permission')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualEntryButton} onPress={handleManualEntry}>
            <Text style={styles.manualEntryButtonText}>{t('scanner.manual_entry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        onBarCodeRead={handleBarCodeRead}
        barCodeTypes={[
          RNCamera.Constants.BarCodeType.ean13,
          RNCamera.Constants.BarCodeType.ean8,
          RNCamera.Constants.BarCodeType.upc_a,
          RNCamera.Constants.BarCodeType.upc_e,
          RNCamera.Constants.BarCodeType.code128,
          RNCamera.Constants.BarCodeType.code39,
        ]}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
              <Text style={styles.headerButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('scanner.title')}</Text>
            <TouchableOpacity style={styles.headerButton} onPress={handleManualEntry}>
              <Text style={styles.headerButtonText}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              {isScanning ? t('scanner.scanning') : t('scanner.instruction')}
            </Text>
            {isScanning && (
              <ActivityIndicator size="small" color="#fff" style={styles.scanningIndicator} />
            )}
          </View>

          {/* Bottom Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Text style={styles.controlButtonText}>
                {flashMode === RNCamera.Constants.FlashMode.off ? '⚡' : '💡'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
              <Text style={styles.controlButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: '#fff',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#fff',
  },
  scannerFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary[500],
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  instructionsText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#fff',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  scanningIndicator: {
    marginTop: SPACING.sm,
  },
  controls: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[900],
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: '#fff',
    marginTop: SPACING.md,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[900],
    padding: SPACING.xl,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#fff',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[300],
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.primary[500],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  manualEntryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary[500],
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  manualEntryButtonText: {
    color: COLORS.primary[500],
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default ScannerScreen; 