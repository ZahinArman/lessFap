import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { colors, spacing, typography, radii } from '../../src/theme';
import { useProfileStore } from '../../src/store/useProfileStore';

const OPTIONS = [
  { id: 'reduce', title: 'Reduce masturbation frequency', description: 'I want to gradually decrease how often this happens.' },
  { id: 'pornography', title: 'Reduce pornography use', description: 'I want to focus specifically on consuming less adult content.' },
  { id: 'triggers', title: 'Understand my patterns', description: 'I want to learn what causes me to act automatically.' },
  { id: 'awareness', title: 'Build more mindful habits', description: 'I want to become more intentional about my decisions.' },
  { id: 'track_only', title: 'Track without a numerical goal', description: 'I just want to observe without a specific reduction target.' },
];

export default function FocusScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleOption = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (selectedIds.size === 0) return;

    updateProfile({
      trackPornography: selectedIds.has('pornography'),
    });

    router.push('/onboarding/progress');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.stepLabel}>Step 2 of 4</Text>
        <Text style={styles.title}>What would you like to focus on?</Text>
        <Text style={styles.subtitle}>Choose all that apply. You can always change this later.</Text>

        <View style={styles.optionsList}>
          {OPTIONS.map((opt) => {
            const isSelected = selectedIds.has(opt.id);
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => toggleOption(opt.id)}
                activeOpacity={0.7}
              >
                <View style={styles.optionRow}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                      {opt.title}
                    </Text>
                    <Text style={[styles.optionDesc, isSelected && styles.optionDescSelected]}>
                      {opt.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={selectedIds.size === 0}
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
    backgroundColor: '#F0EEFD',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextContainer: {
    flex: 1,
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
