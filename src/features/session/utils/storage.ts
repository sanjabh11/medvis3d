const STORAGE_KEY = 'medvis3d_session';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

export interface StoredSession {
  version: number;
  timestamp: number;
  imageDataUrl: string | null;
  depthIntensity: number;
  annotations: string | null;
  notes: string | null;
}

const SESSION_VERSION = 1;

export function saveSession(session: Omit<StoredSession, 'version' | 'timestamp'>): boolean {
  try {
    const fullSession: StoredSession = {
      version: SESSION_VERSION,
      timestamp: Date.now(),
      ...session,
    };

    const json = JSON.stringify(fullSession);
    
    // Check size
    if (json.length > MAX_STORAGE_SIZE) {
      console.warn('[Session] Session too large to save');
      return false;
    }

    localStorage.setItem(STORAGE_KEY, json);
    console.log('[Session] Saved successfully');
    return true;
  } catch (error) {
    console.error('[Session] Save failed:', error);
    return false;
  }
}

export function loadSession(): StoredSession | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    const session = JSON.parse(json) as StoredSession;

    // Version check
    if (session.version !== SESSION_VERSION) {
      console.warn('[Session] Version mismatch, clearing');
      clearSession();
      return null;
    }

    // Check if session is too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > maxAge) {
      console.log('[Session] Session expired, clearing');
      clearSession();
      return null;
    }

    console.log('[Session] Loaded successfully');
    return session;
  } catch (error) {
    console.error('[Session] Load failed:', error);
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Session] Cleared');
  } catch (error) {
    console.error('[Session] Clear failed:', error);
  }
}

export function hasStoredSession(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function getSessionAge(): number | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    const session = JSON.parse(json) as StoredSession;
    return Date.now() - session.timestamp;
  } catch {
    return null;
  }
}

export function formatSessionAge(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ago`;
  }
  return `${minutes}m ago`;
}
