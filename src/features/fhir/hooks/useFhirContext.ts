'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FhirPatient, SmartTokenResponse, SmartAuthConfig } from '../types';
import {
  initiateSmartLaunch,
  handleSmartCallback,
  isSmartCallback,
  getSmartCallbackParams,
  FhirClient,
} from '../utils';

export type FhirStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface UseFhirContextReturn {
  status: FhirStatus;
  patient: FhirPatient | null;
  client: FhirClient | null;
  error: string | null;
  isEhrLaunch: boolean;
  launchSmart: (config: SmartAuthConfig) => Promise<void>;
  disconnect: () => void;
}

const DEFAULT_SCOPE = 'openid fhirUser launch patient/*.read';

export function useFhirContext(): UseFhirContextReturn {
  const [status, setStatus] = useState<FhirStatus>('idle');
  const [patient, setPatient] = useState<FhirPatient | null>(null);
  const [client, setClient] = useState<FhirClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEhrLaunch, setIsEhrLaunch] = useState(false);

  // Handle SMART callback on mount
  useEffect(() => {
    const handleCallback = async () => {
      if (!isSmartCallback()) return;

      const params = getSmartCallbackParams();
      if (!params) return;

      setStatus('connecting');
      setIsEhrLaunch(true);

      try {
        const tokenResponse = await handleSmartCallback(params.code, params.state);
        
        // Get stored config for base URL
        const storedData = sessionStorage.getItem('medvis3d_smart_config');
        const config = storedData ? JSON.parse(storedData) : null;
        
        if (config?.iss) {
          const fhirClient = new FhirClient(config.iss, tokenResponse);
          setClient(fhirClient);

          // Load patient if available
          if (tokenResponse.patient) {
            const patientData = await fhirClient.getPatient(tokenResponse.patient);
            setPatient(patientData);
          }

          setStatus('connected');
        } else {
          throw new Error('Missing FHIR server configuration');
        }

        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (err) {
        console.error('[FHIR] Callback handling failed:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, []);

  const launchSmart = useCallback(async (config: SmartAuthConfig) => {
    setStatus('connecting');
    setError(null);

    try {
      // Store config for callback
      sessionStorage.setItem('medvis3d_smart_config', JSON.stringify(config));

      await initiateSmartLaunch({
        ...config,
        scope: config.scope || DEFAULT_SCOPE,
      });
    } catch (err) {
      console.error('[FHIR] Launch failed:', err);
      setError(err instanceof Error ? err.message : 'Launch failed');
      setStatus('error');
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus('idle');
    setPatient(null);
    setClient(null);
    setError(null);
    setIsEhrLaunch(false);
    sessionStorage.removeItem('medvis3d_smart_config');
    sessionStorage.removeItem('medvis3d_smart_state');
  }, []);

  return {
    status,
    patient,
    client,
    error,
    isEhrLaunch,
    launchSmart,
    disconnect,
  };
}
