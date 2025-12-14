'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface ContextRecoveryState {
  isContextLost: boolean;
  recoveryAttempts: number;
  lastError: string | null;
}

interface UseContextRecoveryReturn {
  state: ContextRecoveryState;
  handleContextLost: (event: Event) => void;
  handleContextRestored: () => void;
  attemptRecovery: () => void;
  resetState: () => void;
}

const MAX_RECOVERY_ATTEMPTS = 3;

export function useContextRecovery(
  onRecoveryNeeded?: () => void,
  onRecovered?: () => void
): UseContextRecoveryReturn {
  const [state, setState] = useState<ContextRecoveryState>({
    isContextLost: false,
    recoveryAttempts: 0,
    lastError: null,
  });
  
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    console.error('[WebGL] Context lost');
    
    setState(prev => ({
      ...prev,
      isContextLost: true,
      lastError: 'WebGL context lost. This may be due to memory pressure.',
    }));
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log('[WebGL] Context restored');
    
    setState(prev => ({
      ...prev,
      isContextLost: false,
      lastError: null,
    }));
    
    onRecovered?.();
  }, [onRecovered]);

  const attemptRecovery = useCallback(() => {
    setState(prev => {
      if (prev.recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
        return {
          ...prev,
          lastError: 'Maximum recovery attempts reached. Please refresh the page.',
        };
      }
      
      return {
        ...prev,
        recoveryAttempts: prev.recoveryAttempts + 1,
      };
    });
    
    onRecoveryNeeded?.();
  }, [onRecoveryNeeded]);

  const resetState = useCallback(() => {
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
    }
    
    setState({
      isContextLost: false,
      recoveryAttempts: 0,
      lastError: null,
    });
  }, []);

  // Auto-attempt recovery after context loss
  useEffect(() => {
    if (state.isContextLost && state.recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      recoveryTimeoutRef.current = setTimeout(() => {
        attemptRecovery();
      }, 1000 * (state.recoveryAttempts + 1)); // Exponential backoff
    }
    
    return () => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, [state.isContextLost, state.recoveryAttempts, attemptRecovery]);

  return {
    state,
    handleContextLost,
    handleContextRestored,
    attemptRecovery,
    resetState,
  };
}
