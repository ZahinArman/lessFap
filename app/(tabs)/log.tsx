import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogStore } from '../../src/store/useLogStore';
import { colors, spacing, typography, radii } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { format } from 'date-fns';

export default function LogScreen() {
  const { logs } = useLogStore();

  const renderItem = ({ item }: { item: any }) => {
    return (
      <Card style={styles.logCard} padding="lg">
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>
            {format(new Date(item.timestamp), 'EEEE, MMM d')}
          </Text>
          <Text style={styles.timeText}>
            {format(new Date(item.timestamp), 'h:mm a')}
          </Text>
        </View>

        {item.trigger && (
          <View style={styles.triggerTag}>
            <Text style={styles.triggerTagText}>{item.trigger.replace(/_/g, ' ')}</Text>
          </View>
        )}

        {item.reflection && (
          <Text style={styles.reflectionText}>"{item.reflection}"</Text>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timeline</Text>
      </View>
      
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Your history</Text>
            <Text style={styles.emptySubtitle}>Logs will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.display,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  logCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dateText: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  timeText: {
    ...typography.caption,
    color: colors.textTertiary,
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
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
