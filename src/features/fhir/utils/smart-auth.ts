import type { SmartAuthConfig, SmartTokenResponse, FhirServerConfig } from '../types';

const SMART_STORAGE_KEY = 'medvis3d_smart_state';

interface StoredState {
  codeVerifier: string;
  state: string;
  config: SmartAuthConfig;
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function discoverSmartConfig(issUrl: string): Promise<FhirServerConfig> {
  try {
    // Try .well-known/smart-configuration first
    const smartConfigUrl = `${issUrl}/.well-known/smart-configuration`;
    const response = await fetch(smartConfigUrl);
    
    if (response.ok) {
      const config = await response.json();
      return {
        baseUrl: issUrl,
        authorizationEndpoint: config.authorization_endpoint,
        tokenEndpoint: config.token_endpoint,
      };
    }

    // Fallback to metadata endpoint
    const metadataUrl = `${issUrl}/metadata`;
    const metaResponse = await fetch(metadataUrl);
    const metadata = await metaResponse.json();

    const security = metadata.rest?.[0]?.security;
    const oauthExtension = security?.extension?.find(
      (ext: any) => ext.url === 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris'
    );

    const getExtValue = (url: string) =>
      oauthExtension?.extension?.find((e: any) => e.url === url)?.valueUri;

    return {
      baseUrl: issUrl,
      authorizationEndpoint: getExtValue('authorize') || '',
      tokenEndpoint: getExtValue('token') || '',
    };
  } catch (error) {
    console.error('[SMART] Failed to discover config:', error);
    throw new Error('Failed to discover SMART configuration');
  }
}

export async function initiateSmartLaunch(config: SmartAuthConfig): Promise<void> {
  const serverConfig = await discoverSmartConfig(config.iss);

  const state = generateRandomString(32);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store state for callback
  const storedState: StoredState = {
    codeVerifier,
    state,
    config,
  };
  sessionStorage.setItem(SMART_STORAGE_KEY, JSON.stringify(storedState));

  // Build authorization URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state,
    aud: config.iss,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  if (config.launch) {
    params.append('launch', config.launch);
  }

  const authUrl = `${serverConfig.authorizationEndpoint}?${params.toString()}`;
  window.location.href = authUrl;
}

export async function handleSmartCallback(
  code: string,
  state: string
): Promise<SmartTokenResponse> {
  const storedData = sessionStorage.getItem(SMART_STORAGE_KEY);
  if (!storedData) {
    throw new Error('No stored SMART state found');
  }

  const stored: StoredState = JSON.parse(storedData);

  if (stored.state !== state) {
    throw new Error('State mismatch - possible CSRF attack');
  }

  const serverConfig = await discoverSmartConfig(stored.config.iss);

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: stored.config.redirectUri,
    client_id: stored.config.clientId,
    code_verifier: stored.codeVerifier,
  });

  const response = await fetch(serverConfig.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  const tokenResponse: SmartTokenResponse = await response.json();

  // Clean up stored state
  sessionStorage.removeItem(SMART_STORAGE_KEY);

  return tokenResponse;
}

export function isSmartCallback(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') && params.has('state');
}

export function getSmartCallbackParams(): { code: string; state: string } | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  if (code && state) {
    return { code, state };
  }
  return null;
}
