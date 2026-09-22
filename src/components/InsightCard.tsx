import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography, radii } from '../theme';
import { Lightbulb, X, ArrowRight } from 'phosphor-react-native';
import { PatternSummary } from '../types';

interface InsightCardProps {
  summary: PatternSummary;
  onDismiss?: (id: string) => void;
  onViewDetails?: () => void;
}

export const InsightCard = ({ summary, onDismiss, onViewDetails }: InsightCardProps) => {
  const iconColor = getIconColor(summary.type);

  return (
    <Card style={styles.card} padding="lg">
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Lightbulb size={20} color={iconColor} weight="fill" />
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={() => onDismiss(summary.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.dismissButton}
          >
            <X size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>{summary.title}</Text>
      <Text style={styles.observation}>{summary.observation}</Text>

      <View style={styles.footer}>
        <Text style={styles.period}>{summary.period}</Text>
        {summary.confidence === 'tentative' && (
          <View style={styles.tentativeBadge}>
            <Text style={styles.tentativeText}>Based on limited data</Text>
          </View>
        )}
      </View>

      {onViewDetails && (
        <TouchableOpacity onPress={onViewDetails} style={styles.detailsButton} activeOpacity={0.7}>
          <Text style={styles.detailsText}>View details</Text>
          <ArrowRight size={14} color={colors.accentPrimary} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

function getIconColor(type: PatternSummary['type']): string {
  switch (type) {
    case 'time':
      return colors.accentPrimary;
    case 'day':
      return colors.accentBlue;
    case 'trigger':
      return colors.accentWarm;
    case 'trend':
      return colors.accentGreen;
    case 'weekend':
      return colors.accentBlue;
    default:
      return colors.accentPrimary;
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  observation: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  period: {
    ...typography.label,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  tentativeBadge: {
    backgroundColor: colors.accentWarm + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  tentativeText: {
    ...typography.label,
    color: colors.accentWarm,
    fontSize: 10,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  detailsText: {
    ...typography.caption,
    color: colors.accentPrimary,
  },
});
