import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, radii } from '../theme';
import { LogEntry } from '../types';
import { format, parseISO } from 'date-fns';
import { Trash, PencilSimple, Plus, Eye, EyeSlash } from 'phosphor-react-native';

interface DayDetailProps {
  date: Date;
  logs: LogEntry[];
  onClose: () => void;
  onEdit: (log: LogEntry) => void;
  onDelete: (id: string) => void;
  onAddLog: (date: Date) => void;
}

export const DayDetail = ({
  date,
  logs,
  onClose,
  onEdit,
  onDelete,
  onAddLog,
}: DayDetailProps) => {
  const [revealedReflections, setRevealedReflections] = React.useState<Set<string>>(new Set());

  const toggleReflection = (id: string) => {
    setRevealedReflections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dateTitle}>{format(date, 'EEEE, MMMM d')}</Text>
          <Text style={styles.logCount}>
            {logs.length === 0
              ? 'No logged events'
              : `${logs.length} logged event${logs.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onAddLog(date)}
          style={styles.addButton}
          activeOpacity={0.7}
        >
          <Plus size={18} color={colors.surface} weight="bold" />
        </TouchableOpacity>
      </View>

      {/* Log list */}
      <ScrollView style={styles.logList} showsVerticalScrollIndicator={false}>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nothing logged on this day.</Text>
          </View>
        ) : (
          logs.map((log) => {
            const isRevealed = revealedReflections.has(log.id);

            return (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <View style={styles.timeContainer}>
                    <View style={styles.timeDot} />
                    <Text style={styles.timeText}>
                      {format(parseISO(log.timestamp), 'h:mm a')}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => onEdit(log)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <PencilSimple size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onDelete(log.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {log.trigger && (
                  <View style={styles.triggerTag}>
                    <Text style={styles.triggerText}>
                      {log.trigger.replace(/_/g, ' ')}
                    </Text>
                  </View>
                )}

                {log.mood && (
                  <View style={styles.moodTag}>
                    <Text style={styles.moodText}>
                      Feeling: {log.mood}
                    </Text>
                  </View>
                )}

                {log.reflection && (
                  <TouchableOpacity
                    onPress={() => toggleReflection(log.id)}
                    style={styles.reflectionToggle}
                    activeOpacity={0.7}
                  >
                    {isRevealed ? (
                      <>
                        <EyeSlash size={14} color={colors.textTertiary} />
                        <Text style={styles.reflectionText}>"{log.reflection}"</Text>
                      </>
                    ) : (
                      <>
                        <Eye size={14} color={colors.textTertiary} />
                        <Text style={styles.reflectionHidden}>Tap to show reflection</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {log.includedPornography && (
                  <Text style={styles.pornFlag}>Included pornography</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dateTitle: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  logCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logList: {
    maxHeight: 320,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  logItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentPrimary,
  },
  timeText: {
    ...typography.headline,
    color: colors.textPrimary,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  triggerTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  triggerText: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  moodTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0EEFD',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  moodText: {
    ...typography.label,
    color: colors.accentPrimary,
    textTransform: 'capitalize',
  },
  reflectionToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  reflectionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 18,
  },
  reflectionHidden: {
    ...typography.label,
    color: colors.textTertiary,
  },
  pornFlag: {
    ...typography.label,
    color: colors.accentRose,
    marginTop: spacing.xs,
  },
});
