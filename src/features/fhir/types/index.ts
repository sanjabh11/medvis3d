export interface FhirPatient {
  resourceType: 'Patient';
  id: string;
  name?: Array<{
    given?: string[];
    family?: string;
    text?: string;
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;
}

export interface FhirImagingStudy {
  resourceType: 'ImagingStudy';
  id: string;
  status: 'registered' | 'available' | 'cancelled' | 'entered-in-error' | 'unknown';
  subject: {
    reference: string;
  };
  started?: string;
  numberOfSeries?: number;
  numberOfInstances?: number;
  modality?: Array<{
    system?: string;
    code?: string;
    display?: string;
  }>;
  description?: string;
}

export interface SmartLaunchContext {
  patient?: string;
  encounter?: string;
  imagingStudy?: string;
  need_patient_banner?: boolean;
  smart_style_url?: string;
}

export interface SmartAuthConfig {
  clientId: string;
  scope: string;
  redirectUri: string;
  iss: string;
  launch?: string;
}

export interface SmartTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  patient?: string;
  encounter?: string;
  id_token?: string;
  refresh_token?: string;
}

export interface FhirServerConfig {
  baseUrl: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
}
