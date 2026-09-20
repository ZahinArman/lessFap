import { create } from 'zustand';
import { LogEntry } from '../types';
import { storage } from '../utils/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface LogState {
  logs: LogEntry[];
  isLoading: boolean;
  loadLogs: () => Promise<void>;
  addLog: (entry: Omit<LogEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateLog: (id: string, updates: Partial<Omit<LogEntry, 'id' | 'createdAt'>>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  clearAllLogs: () => Promise<void>;
}

const LOGS_STORAGE_KEY = 'lessFap_logs';

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  isLoading: true,

  loadLogs: async () => {
    try {
      const data = await storage.getItem(LOGS_STORAGE_KEY);
      if (data) {
        set({ logs: JSON.parse(data), isLoading: false });
      } else {
        set({ logs: [], isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      set({ logs: [], isLoading: false });
    }
  },

  addLog: async (entry) => {
    const newLog: LogEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...get().logs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    set({ logs: updatedLogs });

    try {
      await storage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to add log:', error);
    }
  },

  updateLog: async (id, updates) => {
    const updatedLogs = get().logs.map(log => 
      log.id === id ? { ...log, ...updates, updatedAt: new Date().toISOString() } : log
    ).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    set({ logs: updatedLogs });

    try {
      await storage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to update log:', error);
    }
  },

  deleteLog: async (id) => {
    const updatedLogs = get().logs.filter(log => log.id !== id);
    
    set({ logs: updatedLogs });

    try {
      await storage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to delete log:', error);
    }
  },

  clearAllLogs: async () => {
    set({ logs: [] });
    try {
      await storage.removeItem(LOGS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  },
}));
