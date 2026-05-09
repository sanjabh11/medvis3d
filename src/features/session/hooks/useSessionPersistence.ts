'use client';

import { useState, useCallback } from 'react';
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

function getInitialSessionState(): Pick<UseSessionPersistenceReturn, 'hasSession' | 'sessionAge'> {
  const exists = hasStoredSession();
  const age = exists ? getSessionAge() : null;

  return {
    hasSession: exists,
    sessionAge: age === null ? null : formatSessionAge(age),
  };
}

export function useSessionPersistence(): UseSessionPersistenceReturn {
  const [sessionState, setSessionState] = useState(getInitialSessionState);
  const [savedSession, setSavedSession] = useState<StoredSession | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const save = useCallback((session: Omit<StoredSession, 'version' | 'timestamp'>): boolean => {
    const success = saveSession(session);
    if (success) {
      setSessionState({ hasSession: true, sessionAge: 'Just now' });
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
    setSessionState({ hasSession: false, sessionAge: null });
    setSavedSession(null);
  }, []);

  return {
    hasSession: sessionState.hasSession,
    sessionAge: sessionState.sessionAge,
    savedSession,
    save,
    restore,
    clear,
    autoSaveEnabled,
    setAutoSaveEnabled,
  };
}
