import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radii, spacing, typography } from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button = ({ title, variant = 'primary', isLoading, style, disabled, onPress, ...props }: ButtonProps) => {
  const containerStyle = [
    styles.base,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.textBase,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
  ];

  const handlePress = (e: any) => {
    if (disabled || isLoading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onPress) {
      onPress(e);
    }
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      onPress={handlePress}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.accentPrimary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accentPrimary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    ...typography.headline,
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  ghostText: {
    color: colors.accentPrimary,
  },
  disabledText: {
    color: colors.textTertiary,
  },
});
