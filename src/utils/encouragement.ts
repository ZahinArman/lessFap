import { WeeklySummary } from '../types';

export const getEncouragementMessage = (summary: WeeklySummary): string => {
  if (summary.totalLogs === 0 && summary.daysElapsed === 1) {
    return "A fresh week. Let's make intentional choices.";
  }

  if (summary.totalLogs === 0 && summary.daysElapsed > 1) {
    return "You're building a strong foundation this week.";
  }

  if (summary.totalLogs < summary.previousWeekTotal) {
    return "You're making progress compared to last week. One decision at a time.";
  }

  if (summary.totalLogs === summary.previousWeekTotal) {
    return "You're holding steady. What patterns do you notice?";
  }

  // If current total is > previous week total
  if (summary.daysRemaining > 0) {
    return "Your progress is bigger than one day. Take a breath and keep going.";
  } else {
    return "This week was more difficult. That's okay. Awareness is the first step.";
  }
};
