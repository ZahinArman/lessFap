import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { colors, spacing, typography, radii } from '../src/theme';
import { useProfileStore } from '../src/store/useProfileStore';
import { UserProfile } from '../src/types';
import { X, Minus, Plus } from 'phosphor-react-native';

type GoalType = UserProfile['goalType'];

const OPTIONS: { id: GoalType; title: string; description: string }[] = [
  { id: 'reduce', title: 'Gradual reduction', description: 'I want to log fewer times this week than I did last week.' },
  { id: 'target', title: 'Personal weekly target', description: 'I want to stay under a specific number of times per week.' },
  { id: 'awareness', title: 'Awareness and reflection', description: 'I just want to observe my patterns without a strict numerical goal.' },
  { id: 'abstinence', title: 'Intentional abstinence', description: 'I choose to work toward abstaining for a period of time.' },
];

export default function GoalEditorScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfileStore();

  const [selectedId, setSelectedId] = useState<GoalType | null>(profile?.goalType || null);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(profile?.weeklyTarget ?? 5);

  const handleSave = () => {
    if (!selectedId) return;

    updateProfile({
      goalType: selectedId,
      weeklyTarget: selectedId === 'target' ? weeklyTarget : undefined,
    });

    router.back();
  };

  const incrementTarget = () => setWeeklyTarget((v) => Math.min(v + 1, 30));
  const decrementTarget = () => setWeeklyTarget((v) => Math.max(v - 1, 1));

  const hasChanged =
    selectedId !== profile?.goalType ||
    (selectedId === 'target' && weeklyTarget !== (profile?.weeklyTarget ?? 5));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Goal</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>How would you like to measure progress?</Text>
        <Text style={styles.subtitle}>
          Choose an approach that feels supportive, not punishing. Changing your goal will not erase any historical data.
        </Text>

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
                <View style={styles.radioRow}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
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

        {/* Weekly target stepper */}
        {selectedId === 'target' && (
          <View style={styles.stepperSection}>
            <Text style={styles.stepperLabel}>Weekly target</Text>
            <Text style={styles.stepperHint}>Maximum number of times per week</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={[styles.stepperButton, weeklyTarget <= 1 && styles.stepperButtonDisabled]}
                onPress={decrementTarget}
                disabled={weeklyTarget <= 1}
                activeOpacity={0.7}
              >
                <Minus size={20} color={weeklyTarget <= 1 ? colors.textTertiary : colors.textPrimary} weight="bold" />
              </TouchableOpacity>
              <View style={styles.stepperValueContainer}>
                <Text style={styles.stepperValue}>{weeklyTarget}</Text>
                <Text style={styles.stepperUnit}>per week</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepperButton, weeklyTarget >= 30 && styles.stepperButtonDisabled]}
                onPress={incrementTarget}
                disabled={weeklyTarget >= 30}
                activeOpacity={0.7}
              >
                <Plus size={20} color={weeklyTarget >= 30 ? colors.textTertiary : colors.textPrimary} weight="bold" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Goal"
          onPress={handleSave}
          disabled={!selectedId || !hasChanged}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radii.full,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  optionsList: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  optionCardSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: '#F0EEFD',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: colors.accentPrimary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentPrimary,
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

  // Stepper
  stepperSection: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  stepperLabel: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepperHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperValueContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  stepperValue: {
    ...typography.display,
    color: colors.accentPrimary,
    fontSize: 36,
  },
  stepperUnit: {
    ...typography.label,
    color: colors.textTertiary,
    marginTop: 2,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
