'use client';

import { User, Calendar, Hash } from 'lucide-react';
import type { FhirPatient } from '../types';
import { FhirClient } from '../utils';

interface PatientBannerProps {
  patient: FhirPatient;
  client: FhirClient;
}

export function PatientBanner({ patient, client }: PatientBannerProps) {
  const name = client.getPatientDisplayName(patient);
  const age = client.getPatientAge(patient);
  const gender = patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : null;
  const mrn = patient.identifier?.find(id => id.system?.includes('MRN'))?.value || patient.id;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-[--color-medical-primary] rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-[--color-medical-text-primary] text-lg">
            {name}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-[--color-medical-text-secondary]">
            {age !== null && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {age} years
              </span>
            )}
            {gender && (
              <span>{gender}</span>
            )}
            <span className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              MRN: {mrn}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
