import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Fallback for web if ever needed, though SecureStore isn't supported on web
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error saving secure data for key ${key}:`, error);
      // Fallback to AsyncStorage if SecureStore fails (e.g., missing permissions or web)
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        const result = await SecureStore.getItemAsync(key);
        if (result) return result;
        // Check AsyncStorage as fallback in case it was saved there previously
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error retrieving secure data for key ${key}:`, error);
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing secure data for key ${key}:`, error);
    }
  },
};

export const prefsStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving preference data for key ${key}:`, error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving preference data for key ${key}:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing preference data for key ${key}:`, error);
    }
  },
};
