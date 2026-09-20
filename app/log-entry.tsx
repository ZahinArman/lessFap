import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { useLogStore } from '../src/store/useLogStore';
import { useProfileStore } from '../src/store/useProfileStore';
import { colors, spacing, typography, radii } from '../src/theme';
import { TriggerType } from '../src/types';
import { X, Check } from 'phosphor-react-native';

const TRIGGERS: { id: TriggerType; label: string }[] = [
  { id: 'boredom', label: 'Boredom' },
  { id: 'stress', label: 'Stress' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'habit', label: 'Habit / Automatic' },
  { id: 'sexual_content', label: 'Sexual Content' },
  { id: 'sleep_difficulty', label: 'Sleep Difficulty' },
  { id: 'emotional_discomfort', label: 'Emotional Discomfort' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function LogEntryScreen() {
  const router = useRouter();
  const { addLog } = useLogStore();
  const { profile } = useProfileStore();
  
  const [trigger, setTrigger] = useState<TriggerType | undefined>();
  const [reflection, setReflection] = useState('');
  const [includedPornography, setIncludedPornography] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    await addLog({
      timestamp: new Date().toISOString(),
      trigger,
      reflection: reflection.trim() || undefined,
      includedPornography: profile?.trackPornography ? includedPornography : undefined,
    });
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Auto-close after showing success briefly
    setTimeout(() => {
      router.back();
    }, 1200);
  };

  if (showSuccess) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <View style={styles.successCircle}>
          <Check size={40} color={colors.surface} weight="bold" />
        </View>
        <Text style={styles.successTitle}>Logged.</Text>
        <Text style={styles.successSubtitle}>Take a moment and keep going.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Log</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateText}>Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What was happening before this?</Text>
          <Text style={styles.sectionSubtitle}>Optional trigger</Text>
          <View style={styles.chipContainer}>
            {TRIGGERS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.chip, trigger === t.id && styles.chipSelected]}
                onPress={() => setTrigger(trigger === t.id ? undefined : t.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, trigger === t.id && styles.chipTextSelected]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {profile?.trackPornography && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={[styles.toggleButton, includedPornography && styles.toggleButtonActive]}
              onPress={() => setIncludedPornography(!includedPornography)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, includedPornography && styles.checkboxActive]}>
                {includedPornography && <Check size={14} color={colors.surface} weight="bold" />}
              </View>
              <Text style={[styles.toggleText, includedPornography && styles.toggleTextActive]}>
                Included pornography
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Short reflection (Optional)</Text>
          <Text style={styles.sectionSubtitle}>How were you feeling? Was this intentional?</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Write a few words..."
            placeholderTextColor={colors.textTertiary}
            value={reflection}
            onChangeText={setReflection}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Save Log" 
          onPress={handleSave} 
          isLoading={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
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
    padding: spacing.lg,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  chipSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  toggleButtonActive: {
    backgroundColor: '#FFF0ED', // Soft red/rose tint
    borderColor: colors.accentRose,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxActive: {
    backgroundColor: colors.accentRose,
    borderColor: colors.accentRose,
  },
  toggleText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  toggleTextActive: {
    color: colors.accentRose,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
