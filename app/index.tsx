import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useProfileStore } from '../src/store/useProfileStore';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme';

export default function Index() {
  const { profile, isLoading, loadProfile } = useProfileStore();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!isLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      if (profile?.hasCompletedOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.accentPrimary} />
    </View>
  );
}
