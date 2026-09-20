import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useLogStore } from '../../src/store/useLogStore';
import { useJournalStore } from '../../src/store/useJournalStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, clearProfile } = useProfileStore();
  const { clearAllLogs } = useLogStore();
  const { clearAllEntries } = useJournalStore();

  if (!profile) return null;

  const togglePornographyTracking = () => {
    updateProfile({ trackPornography: !profile.trackPornography });
  };

  const handleReset = () => {
    Alert.alert(
      "Delete all data",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await clearAllLogs();
            await clearAllEntries();
            await clearProfile();
            router.replace('/onboarding');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        <Card style={styles.section} padding="md">
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Name</Text>
              <Text style={styles.rowSubtitle}>{profile.name}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/goal-editor')}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Current Goal</Text>
              <Text style={[styles.rowSubtitle, {textTransform: 'capitalize'}]}>{profile.goalType}</Text>
            </View>
            <Text style={{color: colors.textTertiary, ...typography.caption}}>Edit →</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionHeading}>Preferences</Text>
        <Card style={styles.section} padding="md">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Track pornography</Text>
              <Text style={styles.rowSubtitle}>Show option when logging</Text>
            </View>
            <Switch 
              value={profile.trackPornography} 
              onValueChange={togglePornographyTracking}
              trackColor={{ false: colors.divider, true: colors.accentPrimary }}
            />
          </View>
        </Card>

        <Text style={styles.sectionHeading}>Data & Privacy</Text>
        <Card style={styles.section} padding="md">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Local Storage Only</Text>
              <Text style={styles.rowSubtitle}>Your data never leaves this device.</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleReset}>
            <Text style={[styles.rowTitle, { color: colors.accentRose }]}>Delete all data</Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  headerTitle: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  sectionHeading: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowTitle: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  rowSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
});
