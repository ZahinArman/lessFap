import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { colors, spacing, typography, radii } from '../src/theme';
import { useProfileStore } from '../src/store/useProfileStore';
import { UserProfile } from '../src/types';
import { X } from 'phosphor-react-native';

type GoalType = UserProfile['goalType'];

const OPTIONS: { id: GoalType; title: string; description: string }[] = [
  { id: 'reduce', title: 'Gradual reduction', description: 'I want to log fewer times this week than I did last week.' },
  { id: 'target', title: 'Personal weekly target', description: 'I want to stay under a specific number of times per week.' },
  { id: 'awareness', title: 'Awareness and reflection', description: 'I just want to observe my patterns without a strict numerical goal.' },
];

export default function GoalEditorScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfileStore();
  
  const [selectedId, setSelectedId] = useState<GoalType | null>(profile?.goalType || null);

  const handleSave = () => {
    if (!selectedId) return;
    
    updateProfile({
      goalType: selectedId,
      weeklyTarget: selectedId === 'target' ? 3 : undefined, // Default for now
    });
    
    router.back();
  };

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
          title="Save Goal" 
          onPress={handleSave} 
          disabled={!selectedId || selectedId === profile?.goalType}
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
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
