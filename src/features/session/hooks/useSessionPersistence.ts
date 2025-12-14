'use client';

import { useState, useCallback, useEffect } from 'react';
import { saveSession, loadSession, clearSession, hasStoredSession, getSessionAge, formatSessionAge, type StoredSession } from '../utils';

interface UseSessionPersistenceReturn {
  hasSession: boolean;
  sessionAge: string | null;
  savedSession: StoredSession | null;
  save: (session: Omit<StoredSession, 'version' | 'timestamp'>) => boolean;
  restore: () => StoredSession | null;
  clear: () => void;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
}

export function useSessionPersistence(): UseSessionPersistenceReturn {
  const [hasSession, setHasSession] = useState(false);
  const [sessionAge, setSessionAge] = useState<string | null>(null);
  const [savedSession, setSavedSession] = useState<StoredSession | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const exists = hasStoredSession();
    setHasSession(exists);

    if (exists) {
      const age = getSessionAge();
      if (age !== null) {
        setSessionAge(formatSessionAge(age));
      }
    }
  }, []);

  const save = useCallback((session: Omit<StoredSession, 'version' | 'timestamp'>): boolean => {
    const success = saveSession(session);
    if (success) {
      setHasSession(true);
      setSessionAge('Just now');
    }
    return success;
  }, []);

  const restore = useCallback((): StoredSession | null => {
    const session = loadSession();
    setSavedSession(session);
    return session;
  }, []);

  const clear = useCallback(() => {
    clearSession();
    setHasSession(false);
    setSessionAge(null);
    setSavedSession(null);
  }, []);

  return {
    hasSession,
    sessionAge,
    savedSession,
    save,
    restore,
    clear,
    autoSaveEnabled,
    setAutoSaveEnabled,
  };
}
