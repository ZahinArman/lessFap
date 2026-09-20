import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radii } from '../src/theme';
import { X } from 'phosphor-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  withSequence,
  withDelay,
  cancelAnimation,
} from 'react-native-reanimated';

const PHASES = [
  { text: "Breathe in slowly...", duration: 4000 },
  { text: "Hold...", duration: 2000 },
  { text: "Breathe out gently...", duration: 6000 },
];

const TOTAL_CYCLES = 3;

export default function MindfulnessScreen() {
  const router = useRouter();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [cycles, setCycles] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exerciseCompleteRef = useRef(false);
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  // Keep ref in sync with state
  useEffect(() => {
    exerciseCompleteRef.current = exerciseComplete;
  }, [exerciseComplete]);

  const runPhase = useCallback((index: number, currentCycles: number) => {
    if (exerciseCompleteRef.current) return;

    setPhaseIndex(index);
    timeoutRef.current = setTimeout(() => {
      const nextIndex = (index + 1) % PHASES.length;
      let nextCycles = currentCycles;
      
      if (nextIndex === 0) {
        nextCycles = currentCycles + 1;
        setCycles(nextCycles);
        if (nextCycles >= TOTAL_CYCLES) {
          setExerciseComplete(true);
          return;
        }
      }
      runPhase(nextIndex, nextCycles);
    }, PHASES[index].duration);
  }, []);

  useEffect(() => {
    // Breathing animation loop
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withDelay(2000, withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }))
      ),
      -1,
      false
    );
    
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withDelay(2000, withTiming(0.7, { duration: 6000 }))
      ),
      -1,
      false
    );

    runPhase(0, 0);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (exerciseComplete) {
    return (
      <SafeAreaView style={[styles.container, styles.completeContainer]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButtonLight}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>You paused.</Text>
          <Text style={styles.subtitle}>
            That took strength. Now, what do you want to do?
          </Text>
          
          <View style={styles.optionsList}>
            <TouchableOpacity 
              style={[styles.optionCard, { borderColor: colors.accentGreen }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.optionTitle, { color: colors.accentGreen }]}>I will wait</Text>
              <Text style={styles.optionDesc}>I choose not to act right now.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, { borderColor: colors.accentBlue }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.optionTitle, { color: colors.accentBlue }]}>I will do something else</Text>
              <Text style={styles.optionDesc}>I will redirect my attention.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, { borderColor: colors.textSecondary }]}
              onPress={() => {
                router.back();
                setTimeout(() => router.push('/log-entry'), 300);
              }}
            >
              <Text style={[styles.optionTitle, { color: colors.textSecondary }]}>I choose to act</Text>
              <Text style={styles.optionDesc}>I will log it and reflect.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.breathingContainer}>
        <Animated.View style={[styles.breathingCircle, animatedStyle]} />
        <View style={styles.innerCircle} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.instructionText}>{PHASES[phaseIndex].text}</Text>
        <Text style={styles.cycleText}>Cycle {cycles + 1} of {TOTAL_CYCLES}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  completeContainer: {
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'flex-end',
    padding: spacing.lg,
  },
  closeButton: {
    padding: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.full,
  },
  closeButtonLight: {
    padding: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radii.full,
  },
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accentBlue,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    shadowColor: colors.accentBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  textContainer: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  instructionText: {
    ...typography.title,
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  cycleText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
  },
  optionsList: {
    gap: spacing.lg,
  },
  optionCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  optionTitle: {
    ...typography.headline,
    marginBottom: spacing.xs,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
