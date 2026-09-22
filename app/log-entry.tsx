import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, isToday } from 'date-fns';
import { Button } from '../src/components/Button';
import { useLogStore } from '../src/store/useLogStore';
import { useProfileStore } from '../src/store/useProfileStore';
import { colors, spacing, typography, radii } from '../src/theme';
import { TriggerType, MoodType } from '../src/types';
import { X, Check, CalendarBlank } from 'phosphor-react-native';

const TRIGGERS: { id: TriggerType; label: string }[] = [
  { id: 'boredom', label: 'Boredom' },
  { id: 'stress', label: 'Stress' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'habit', label: 'Habit / Automatic' },
  { id: 'sexual_content', label: 'Sexual Content' },
  { id: 'sleep_difficulty', label: 'Sleep Difficulty' },
  { id: 'emotional_discomfort', label: 'Emotional Discomfort' },
  { id: 'other', label: 'Other' },
  { id: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const MOODS: { id: MoodType; label: string }[] = [
  { id: 'good', label: 'Good' },
  { id: 'okay', label: 'Okay' },
  { id: 'difficult', label: 'Difficult' },
  { id: 'mixed', label: 'Mixed' },
];

const REFLECTION_PROMPTS = [
  'What was happening before this?',
  'How were you feeling?',
  'Was this intentional or automatic?',
  'What might help me next time?',
];

const formatDisplayDate = (date: Date): string => {
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'EEE, MMM d, h:mm a');
};

export default function LogEntryScreen() {
  const router = useRouter();
  const { editId, date: paramDate } = useLocalSearchParams<{ editId?: string; date?: string }>();
  const { logs, addLog, updateLog, loadLogs } = useLogStore();
  const { profile } = useProfileStore();

  const isEditing = Boolean(editId);

  // Date/Time state
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (paramDate) {
      const parsed = new Date(paramDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date>(selectedDate);

  // Form fields state
  const [trigger, setTrigger] = useState<TriggerType | undefined>();
  const [mood, setMood] = useState<MoodType | undefined>();
  const [reflection, setReflection] = useState('');
  const [includedPornography, setIncludedPornography] = useState(false);

  // Submitting and feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Random reflection prompt on mount
  const [reflectionPrompt] = useState(
    () => REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)]
  );

  const isPreFilledRef = useRef(false);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Load existing log for edit mode or initial date param
  useEffect(() => {
    if (isPreFilledRef.current) return;

    if (editId) {
      const existingLog = logs.find((l) => l.id === editId);
      if (existingLog) {
        const parsedDate = new Date(existingLog.timestamp);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          setTempDate(parsedDate);
        }
        setTrigger(existingLog.trigger);
        setMood(existingLog.mood);
        setReflection(existingLog.reflection || '');
        setIncludedPornography(Boolean(existingLog.includedPornography));
        isPreFilledRef.current = true;
      }
    } else if (paramDate) {
      const parsed = new Date(paramDate);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setTempDate(parsed);
        isPreFilledRef.current = true;
      }
    }
  }, [editId, paramDate, logs]);

  const openPicker = () => {
    setTempDate(new Date(selectedDate));
    setPickerMode('date');
    setShowPicker(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      setPickerMode('date');
      return;
    }

    if (date) {
      if (pickerMode === 'date') {
        const updated = new Date(selectedDate);
        updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        setSelectedDate(updated);
        // Briefly close before opening time picker on Android to prevent dialog clash
        setShowPicker(false);
        setTimeout(() => {
          setPickerMode('time');
          setShowPicker(true);
        }, 100);
      } else {
        const updated = new Date(selectedDate);
        updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
        setSelectedDate(updated);
        setShowPicker(false);
        setPickerMode('date');
      }
    }
  };

  const handleIOSChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      if (pickerMode === 'date') {
        const updated = new Date(tempDate);
        updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        setTempDate(updated);
      } else {
        const updated = new Date(tempDate);
        updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
        setTempDate(updated);
      }
    }
  };

  const handleIOSNextOrDone = () => {
    if (pickerMode === 'date') {
      setPickerMode('time');
    } else {
      setSelectedDate(tempDate);
      setShowPicker(false);
      setPickerMode('date');
    }
  };

  const handleIOSCancel = () => {
    setShowPicker(false);
    setPickerMode('date');
  };

  const performSave = async () => {
    setIsSubmitting(true);
    try {
      const entryData = {
        timestamp: selectedDate.toISOString(),
        trigger,
        mood,
        reflection: reflection.trim() || undefined,
        includedPornography: profile?.trackPornography ? includedPornography : undefined,
      };

      if (editId) {
        await updateLog(editId, entryData);
      } else {
        await addLog(entryData);
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      // Auto-close after showing success briefly
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      console.error('Failed to save log:', error);
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    // Duplicate prevention: check for log within 2 minutes of selectedDate
    const targetMs = selectedDate.getTime();
    const twoMinutesMs = 2 * 60 * 1000;

    const duplicate = logs.find((l) => {
      if (editId && l.id === editId) return false;
      const logMs = new Date(l.timestamp).getTime();
      return Math.abs(logMs - targetMs) <= twoMinutesMs;
    });

    if (duplicate) {
      Alert.alert(
        'Duplicate Log',
        'A log entry already exists within 2 minutes of this time. Do you want to save anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: isEditing ? 'Update Anyway' : 'Save Anyway',
            onPress: () => performSave(),
          },
        ]
      );
      return;
    }

    await performSave();
  };

  if (showSuccess) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <View style={styles.successCircle}>
          <Check size={40} color={colors.surface} weight="bold" />
        </View>
        <Text style={styles.successTitle}>Logged.</Text>
        <Text style={styles.successSubtitle}>Keep going.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Log' : 'Add Log'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date and Time touchable element */}
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={openPicker}
          activeOpacity={0.7}
        >
          <View style={styles.dateSelectorLeft}>
            <CalendarBlank size={18} color={colors.accentPrimary} weight="bold" />
            <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
          </View>
          <Text style={styles.dateEditHint}>Change</Text>
        </TouchableOpacity>

        {/* Triggers section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What triggered this?</Text>
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

        {/* Mood selector section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <Text style={styles.sectionSubtitle}>Optional mood check-in</Text>
          <View style={styles.chipContainer}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.chip, mood === m.id && styles.chipSelected]}
                onPress={() => setMood(mood === m.id ? undefined : m.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, mood === m.id && styles.chipTextSelected]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pornography checkbox */}
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

        {/* Short reflection with randomized prompt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Short reflection (Optional)</Text>
          <Text style={styles.sectionSubtitle}>{reflectionPrompt}</Text>
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

      {/* Date Time Picker for Android */}
      {Platform.OS !== 'ios' && showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* Date Time Picker for iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handleIOSCancel}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={handleIOSCancel}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleIOSCancel} style={styles.modalButton}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {pickerMode === 'date' ? 'Select Date' : 'Select Time'}
                </Text>
                <TouchableOpacity onPress={handleIOSNextOrDone} style={styles.modalButton}>
                  <Text style={styles.modalDoneText}>
                    {pickerMode === 'date' ? 'Next' : 'Done'}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display="spinner"
                onChange={handleIOSChange}
                textColor={colors.textPrimary}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          title={isEditing ? 'Update Log' : 'Save Log'}
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
    color: colors.textPrimary,
  },
  dateEditHint: {
    ...typography.caption,
    color: colors.accentPrimary,
    fontFamily: 'Inter_500Medium',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingBottom: spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  modalCancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  modalDoneText: {
    ...typography.headline,
    color: colors.accentPrimary,
  },
});
