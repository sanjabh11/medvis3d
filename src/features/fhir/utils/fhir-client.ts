import type { FhirPatient, FhirImagingStudy, SmartTokenResponse } from '../types';

export class FhirClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(baseUrl: string, tokenResponse: SmartTokenResponse) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = tokenResponse.access_token;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/fhir+json',
      },
    });

    if (!response.ok) {
      throw new Error(`FHIR request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getPatient(patientId: string): Promise<FhirPatient> {
    return this.request<FhirPatient>(`Patient/${patientId}`);
  }

  async getImagingStudy(studyId: string): Promise<FhirImagingStudy> {
    return this.request<FhirImagingStudy>(`ImagingStudy/${studyId}`);
  }

  async searchImagingStudies(patientId: string): Promise<FhirImagingStudy[]> {
    const bundle = await this.request<any>(`ImagingStudy?patient=${patientId}`);
    return bundle.entry?.map((e: any) => e.resource) || [];
  }

  getPatientDisplayName(patient: FhirPatient): string {
    if (patient.name?.[0]) {
      const name = patient.name[0];
      if (name.text) return name.text;
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      return `${given} ${family}`.trim() || 'Unknown';
    }
    return 'Unknown Patient';
  }

  getPatientAge(patient: FhirPatient): number | null {
    if (!patient.birthDate) return null;
    const birth = new Date(patient.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}
