'use client';

import { useState } from 'react';
import { Stethoscope, Loader2, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFhirContext } from '../hooks/useFhirContext';
import type { SmartAuthConfig } from '../types';

interface FhirLauncherProps {
  clientId?: string;
  onPatientLoaded?: (patientId: string) => void;
}

// Demo/sandbox FHIR servers
const DEMO_SERVERS = [
  {
    name: 'SMART Health IT Sandbox',
    iss: 'https://launch.smarthealthit.org/v/r4/sim/WzMsIiIsIiIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMF0/fhir',
    clientId: 'medvis3d_demo',
  },
  {
    name: 'Logica Health Sandbox',
    iss: 'https://api.logicahealth.org/MedVis3D/open',
    clientId: 'medvis3d_logica',
  },
];

export function FhirLauncher({ clientId, onPatientLoaded }: FhirLauncherProps) {
  const { status, patient, client, error, isEhrLaunch, launchSmart, disconnect } = useFhirContext();
  const [selectedServer, setSelectedServer] = useState(0);

  const handleLaunch = async () => {
    const server = DEMO_SERVERS[selectedServer];
    
    const config: SmartAuthConfig = {
      clientId: clientId || server.clientId,
      scope: 'openid fhirUser launch/patient patient/*.read',
      redirectUri: window.location.origin + window.location.pathname,
      iss: server.iss,
    };

    await launchSmart(config);
  };

  // Connected state
  if (status === 'connected' && patient) {
    const patientName = client?.getPatientDisplayName(patient) || 'Unknown';
    const patientAge = client?.getPatientAge(patient);

    return (
      <Card className="p-4 border-[--color-medical-success] bg-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-[--color-medical-success]" />
            <div>
              <p className="font-medium text-[--color-medical-text-primary]">
                EHR Connected
              </p>
              <p className="text-sm text-[--color-medical-text-secondary]">
                Patient: {patientName}
                {patientAge !== null && ` (${patientAge} years)`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={disconnect}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  // Connecting state
  if (status === 'connecting') {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[--color-medical-primary]" />
          <div>
            <p className="font-medium text-[--color-medical-text-primary]">
              Connecting to EHR...
            </p>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Please complete authentication in the popup
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Card className="p-4 border-red-300 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Connection Failed</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLaunch}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // Idle state - show launcher
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Stethoscope className="h-5 w-5 text-[--color-medical-primary]" />
          </div>
          <div>
            <p className="font-medium text-[--color-medical-text-primary]">
              Connect to EHR
            </p>
            <p className="text-sm text-[--color-medical-text-secondary]">
              Launch from Epic, Cerner, or SMART sandbox
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5"
          >
            {DEMO_SERVERS.map((server, idx) => (
              <option key={idx} value={idx}>
                {server.name}
              </option>
            ))}
          </select>
          
          <Button onClick={handleLaunch} className="bg-[--color-medical-primary]">
            <Stethoscope className="h-4 w-4 mr-2" />
            Launch SMART
          </Button>
        </div>
      </div>
    </Card>
  );
}
