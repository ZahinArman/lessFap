import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { colors, spacing, typography } from '../../src/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Welcome to Less</Text>
        </View>
        
        <Text style={styles.title}>
          Build awareness.{'\n'}Make intentional choices.
        </Text>
        
        <Text style={styles.subtitle}>
          Less is not about perfection or unbroken streaks. It's about gradually reducing unwanted habits and finding healthier ways to redirect your attention.
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Continue" 
          onPress={() => router.push('/onboarding/focus')} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  badgeText: {
    ...typography.label,
    color: colors.accentPrimary,
    textTransform: 'uppercase',
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
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
