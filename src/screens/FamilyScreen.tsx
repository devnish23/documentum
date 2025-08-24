import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@constants/index';

const FamilyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Family</Text>
      <Text style={styles.subtitle}>Manage family members</Text>
      <Text style={styles.description}>
        Add family members and collaborate on grocery management.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.gray[600],
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default FamilyScreen; 