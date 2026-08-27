'use client';

import { useSyncExternalStore } from 'react';
import { Session, SessionSchema } from '@/types/schemas';

const STORAGE_KEY = 'prompt_generator_sessions_v1';
const MAX_SESSIONS = 50;

interface StoragePayload {
  version: number;
  sessions: Session[];
}

let memorySessions: Session[] = [];
let isInitialized = false;

// Custom event for cross-component sync in same tab
const LISTENERS = new Set<() => void>();

function notifyListeners() {
  LISTENERS.forEach((listener) => listener());
}

function getStoredPayload(): StoragePayload {
  if (typeof window === 'undefined') {
    return { version: 1, sessions: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, sessions: [] };

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.sessions)) {
      const validSessions: Session[] = [];
      for (const item of parsed.sessions) {
        const validated = SessionSchema.safeParse(item);
        if (validated.success) {
          validSessions.push(validated.data);
        }
      }
      return { version: parsed.version || 1, sessions: validSessions };
    }
    return { version: 1, sessions: [] };
  } catch (err) {
    console.error('Failed to read sessions from localStorage:', err);
    return { version: 1, sessions: [] };
  }
}

function writeStoredPayload(sessions: Session[]): void {
  if (typeof window === 'undefined') return;

  // LRU: Sort by updatedAt descending and prune to MAX_SESSIONS
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  const pruned = sorted.slice(0, MAX_SESSIONS);

  memorySessions = pruned;

  try {
    const payload: StoragePayload = {
      version: 1,
      sessions: pruned,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to write sessions to localStorage (quota exceeded?):', err);
    // If quota exceeded, prune more aggressively
    try {
      const halfPruned = pruned.slice(0, Math.floor(MAX_SESSIONS / 2));
      memorySessions = halfPruned;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, sessions: halfPruned })
      );
    } catch (innerErr) {
      console.error('Severe storage quota error:', innerErr);
    }
  }

  notifyListeners();
}

function initMemory() {
  if (!isInitialized && typeof window !== 'undefined') {
    memorySessions = getStoredPayload().sessions;
    isInitialized = true;

    // Handle cross-tab storage changes
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        memorySessions = getStoredPayload().sessions;
        notifyListeners();
      }
    });
  }
}

export const sessionStore = {
  getSessions(): Session[] {
    initMemory();
    return memorySessions;
  },

  getSession(id: string): Session | undefined {
    initMemory();
    return memorySessions.find((s) => s.id === id);
  },

  saveSession(session: Session): void {
    initMemory();
    const existingIndex = memorySessions.findIndex((s) => s.id === session.id);
    const updated: Session = {
      ...session,
      updatedAt: Date.now(),
    };

    let newSessions: Session[];
    if (existingIndex >= 0) {
      newSessions = [...memorySessions];
      newSessions[existingIndex] = updated;
    } else {
      newSessions = [updated, ...memorySessions];
    }

    writeStoredPayload(newSessions);
  },

  deleteSession(id: string): void {
    initMemory();
    const filtered = memorySessions.filter((s) => s.id !== id);
    writeStoredPayload(filtered);
  },

  clearSessions(): void {
    initMemory();
    writeStoredPayload([]);
  },

  subscribe(listener: () => void): () => void {
    initMemory();
    LISTENERS.add(listener);
    return () => {
      LISTENERS.delete(listener);
    };
  },
};

const EMPTY_SESSIONS: Session[] = [];

export function useSessions(): Session[] {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSessions,
    () => EMPTY_SESSIONS
  );
}
