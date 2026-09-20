import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useLogStore } from '../../src/store/useLogStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { getGreeting } from '../../src/utils/greetings';
import { computeWeeklySummary } from '../../src/utils/weekHelpers';
import { getEncouragementMessage } from '../../src/utils/encouragement';
import { format } from 'date-fns';
import { UserCircle, Wind } from 'phosphor-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useProfileStore();
  const { logs, loadLogs } = useLogStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadLogs();
    
    // Update greeting/date periodically
    const interval = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!profile) return null;

  const summary = computeWeeklySummary(
    logs,
    currentDate,
    profile.weekStartDay === 'monday' ? 1 : 0,
    profile.goalType,
    profile.weeklyTarget
  );

  const greeting = getGreeting(profile.name);
  const formattedDate = format(currentDate, 'dd MMMM yyyy');
  const encouragement = getEncouragementMessage(summary);

  const isPositiveTrend = summary.totalLogs <= summary.previousWeekTotal;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/profile')} activeOpacity={0.7}>
            <UserCircle size={40} color={colors.textSecondary} weight="duotone" />
          </TouchableOpacity>
        </View>

        {/* Main Weekly Card */}
        <Card style={styles.heroCard} padding="xl">
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>This week</Text>
            <View style={[styles.trendBadge, isPositiveTrend ? styles.trendPositive : styles.trendNeutral]}>
              <Text style={[styles.trendText, isPositiveTrend ? styles.trendTextPositive : styles.trendTextNeutral]}>
                {summary.totalLogs < summary.previousWeekTotal ? 'Reducing' : 'Tracking'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{summary.totalLogs}</Text>
              <Text style={styles.statLabel}>Logs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumberSmall}>{summary.previousWeekTotal}</Text>
              <Text style={styles.statLabel}>Last week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumberSmall}>{summary.daysRemaining}</Text>
              <Text style={styles.statLabel}>Days left</Text>
            </View>
          </View>
          
          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>{encouragement}</Text>
          </View>
        </Card>

        {/* Pause / Mindfulness Card */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => router.push('/mindfulness')}
        >
          <Card style={styles.pauseCard} padding="lg">
            <View style={styles.pauseIconContainer}>
              <Wind size={28} color={colors.surface} weight="fill" />
            </View>
            <View style={styles.pauseTextContainer}>
              <Text style={styles.pauseTitle}>Pause for a moment</Text>
              <Text style={styles.pauseSubtitle}>Take a breath before you act.</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Recent Reflections */}
        {logs.filter(l => l.reflection).length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent reflections</Text>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)/log')}>
                <Text style={styles.sectionLink}>View all →</Text>
              </TouchableOpacity>
            </View>
            
            {logs.filter(l => l.reflection).slice(0, 2).map(log => (
              <Card key={log.id} style={styles.reflectionCard} padding="lg">
                <Text style={styles.reflectionDate}>{format(new Date(log.timestamp), 'MMM d, h:mm a')}</Text>
                {log.trigger && (
                  <View style={styles.triggerTag}>
                    <Text style={styles.triggerTagText}>{log.trigger.replace(/_/g, ' ')}</Text>
                  </View>
                )}
                <Text style={styles.reflectionText} numberOfLines={3}>"{log.reflection}"</Text>
              </Card>
            ))}
          </View>
        )}
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
    paddingBottom: 100, // Space for bottom tab + floating button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  heroCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  trendBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  trendPositive: {
    backgroundColor: '#E6F4EA', // Light green
  },
  trendNeutral: {
    backgroundColor: '#F0EEFD', // Light purple
  },
  trendText: {
    ...typography.label,
  },
  trendTextPositive: {
    color: colors.accentGreen,
  },
  trendTextNeutral: {
    color: colors.accentPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  statNumber: {
    ...typography.display,
    fontSize: 42,
    color: colors.accentPrimary,
    marginBottom: spacing.xs,
  },
  statNumberSmall: {
    ...typography.display,
    fontSize: 24,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  encouragementBox: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  encouragementText: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  pauseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentBlue, // Soft blue from reference
    marginBottom: spacing.xxl,
  },
  pauseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  pauseTextContainer: {
    flex: 1,
  },
  pauseTitle: {
    ...typography.headline,
    color: colors.surface,
    marginBottom: 2,
  },
  pauseSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  sectionLink: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reflectionCard: {
    marginBottom: spacing.md,
  },
  reflectionDate: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  triggerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: spacing.sm,
  },
  triggerTagText: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  reflectionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
});
