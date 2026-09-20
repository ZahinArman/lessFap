import { create } from 'zustand';
import { UserProfile } from '../types';
import { prefsStorage } from '../utils/storage';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const PROFILE_STORAGE_KEY = 'lessFap_profile';

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: true,

  loadProfile: async () => {
    try {
      const data = await prefsStorage.getItem(PROFILE_STORAGE_KEY);
      if (data) {
        set({ profile: JSON.parse(data), isLoading: false });
      } else {
        set({ profile: null, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      set({ profile: null, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    
    // Default base profile if it doesn't exist
    const baseProfile: UserProfile = current || {
      name: '',
      createdAt: new Date().toISOString(),
      goalType: 'awareness',
      trackPornography: false,
      weekStartDay: 'monday',
      notificationsEnabled: false,
      notificationPreferences: {
        dailyReflection: false,
        weeklyReview: false,
        mindfulnessReminder: false,
      },
      hasCompletedOnboarding: false,
    };

    const updatedProfile = { ...baseProfile, ...updates };
    
    // Optimistic update
    set({ profile: updatedProfile });

    try {
      await prefsStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  },

  clearProfile: async () => {
    try {
      await prefsStorage.removeItem(PROFILE_STORAGE_KEY);
      set({ profile: null });
    } catch (error) {
      console.error('Failed to clear profile:', error);
    }
  },
}));
