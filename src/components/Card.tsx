import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, radii, spacing } from '../theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'flat' | 'outline';
  padding?: keyof typeof spacing;
}

export const Card = ({ children, style, variant = 'elevated', padding = 'lg', ...props }: CardProps) => {
  const containerStyle = [
    styles.base,
    styles[variant],
    { padding: spacing[padding] },
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  flat: {
    backgroundColor: colors.surface,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
