import { create } from 'zustand';
import { JournalEntry } from '../types';
import { storage } from '../utils/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearAllEntries: () => Promise<void>;
}

const JOURNAL_STORAGE_KEY = 'lessFap_journal';

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  isLoading: true,

  loadEntries: async () => {
    try {
      const data = await storage.getItem(JOURNAL_STORAGE_KEY);
      if (data) {
        set({ entries: JSON.parse(data), isLoading: false });
      } else {
        set({ entries: [], isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load journal entries:', error);
      set({ entries: [], isLoading: false });
    }
  },

  addEntry: async (entry) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const updatedEntries = [newEntry, ...get().entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    try {
      await storage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updatedEntries));
      set({ entries: updatedEntries });
    } catch (error) {
      console.error('Failed to add journal entry:', error);
    }
  },

  updateEntry: async (id, updates) => {
    const updatedEntries = get().entries.map(entry => 
      entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
    ).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    try {
      await storage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updatedEntries));
      set({ entries: updatedEntries });
    } catch (error) {
      console.error('Failed to update journal entry:', error);
    }
  },

  deleteEntry: async (id) => {
    const updatedEntries = get().entries.filter(entry => entry.id !== id);

    try {
      await storage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(updatedEntries));
      set({ entries: updatedEntries });
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
    }
  },

  clearAllEntries: async () => {
    try {
      await storage.removeItem(JOURNAL_STORAGE_KEY);
      set({ entries: [] });
    } catch (error) {
      console.error('Failed to clear journal entries:', error);
    }
  },
}));
