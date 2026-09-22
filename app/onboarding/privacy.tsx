import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useProfileStore } from '../../src/store/useProfileStore';
import { LockKey } from 'phosphor-react-native';

export default function PrivacyScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [name, setName] = useState('');

  const handleFinish = () => {
    updateProfile({
      name: name.trim() || 'Friend',
      hasCompletedOnboarding: true,
    });
    
    // Use replace to prevent going back to onboarding
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LockKey size={48} color={colors.accentPrimary} weight="duotone" />
          </View>
          
          <Text style={styles.stepLabel}>Step 4 of 4</Text>
          
          <Text style={styles.title}>Your data stays on your device.</Text>
          <Text style={styles.subtitle}>
            All your data is stored locally on this device. We don't send your logs or reflections to external services. While local storage provides strong protection, we cannot make absolute security guarantees.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name (optional)"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />
          </View>
        </View>
        
        <View style={styles.footer}>
          <Button 
            title="Start my journey" 
            onPress={handleFinish} 
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0EEFD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  stepLabel: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    ...typography.caption,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...typography.body,
    color: colors.textPrimary,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
