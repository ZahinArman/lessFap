import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useProfileStore } from '../../src/store/useProfileStore';
import { UserProfile } from '../../src/types';

type GoalType = UserProfile['goalType'];

const OPTIONS: { id: GoalType; title: string; description: string }[] = [
  { id: 'reduce', title: 'Gradual reduction', description: 'I want to log fewer times this week than I did last week.' },
  { id: 'target', title: 'Personal weekly target', description: 'I want to stay under a specific number of times per week.' },
  { id: 'awareness', title: 'Awareness and reflection', description: 'I just want to observe my patterns without a strict numerical goal.' },
];

export default function ProgressScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [selectedId, setSelectedId] = useState<GoalType | null>(null);

  const handleNext = () => {
    if (!selectedId) return;
    
    updateProfile({
      goalType: selectedId,
      weeklyTarget: selectedId === 'target' ? 3 : undefined, // default target if they chose target
    });
    
    router.push('/onboarding/privacy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
        <Text style={styles.title}>How would you like to measure progress?</Text>
        <Text style={styles.subtitle}>Choose an approach that feels supportive, not punishing.</Text>
        
        <View style={styles.optionsList}>
          {OPTIONS.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => setSelectedId(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                  {opt.title}
                </Text>
                <Text style={[styles.optionDesc, isSelected && styles.optionDescSelected]}>
                  {opt.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          title="Continue" 
          onPress={handleNext} 
          disabled={!selectedId}
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
  scrollContent: {
    padding: spacing.xl,
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  optionCardSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: '#F0EEFD', // Very light tint of primary
  },
  optionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionTitleSelected: {
    color: colors.accentPrimary,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  optionDescSelected: {
    color: colors.accentPrimary,
    opacity: 0.8,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
