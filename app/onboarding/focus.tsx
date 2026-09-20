import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useProfileStore } from '../../src/store/useProfileStore';

const OPTIONS = [
  { id: 'reduce', title: 'Reduce frequency', description: 'I want to gradually decrease how often I do this.' },
  { id: 'pornography', title: 'Reduce pornography use', description: 'I want to focus specifically on consuming less adult content.' },
  { id: 'triggers', title: 'Understand my triggers', description: 'I want to learn what causes me to act automatically.' },
  { id: 'awareness', title: 'Build more mindful habits', description: 'I just want to track my behavior without a strict goal.' },
];

export default function FocusScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedId) return;
    
    updateProfile({
      trackPornography: selectedId === 'pornography',
    });
    
    router.push('/onboarding/progress');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What would you like to focus on?</Text>
        <Text style={styles.subtitle}>You can always change this later.</Text>
        
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
