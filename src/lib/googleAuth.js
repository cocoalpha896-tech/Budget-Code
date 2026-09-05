// Thin wrapper around Google Identity Services (GIS) token client.
// Uses the drive.file scope only: the app can only see files IT creates,
// which keeps this out of Google's sensitive-scope verification process.

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

let tokenClient = null;

function loadGisScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export async function initAuth() {
  if (!CLIENT_ID) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable');
  }
  await loadGisScript();
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: () => {}, // replaced per-call in requestToken
  });
}

// silent=true tries to renew without a visible prompt (works most of the time,
// but iOS Safari's tracking prevention can occasionally block this — the caller
// should fall back to silent:false, i.e. a visible tap-to-sign-in, on failure).
export function requestToken({ silent = false } = {}) {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Call initAuth() first'));
    tokenClient.callback = (resp) => {
      if (resp.error) return reject(resp);
      persistToken(resp.access_token, resp.expires_in);
      resolve(resp.access_token);
    };
    tokenClient.error_callback = (err) => reject(err);
    tokenClient.requestAccessToken({ prompt: silent ? '' : 'consent' });
  });
}

function persistToken(token, expiresInSeconds) {
  sessionStorage.setItem('gd_token', token);
  sessionStorage.setItem('gd_token_exp', String(Date.now() + expiresInSeconds * 1000));
}

export function getValidStoredToken() {
  const token = sessionStorage.getItem('gd_token');
  const exp = Number(sessionStorage.getItem('gd_token_exp') || 0);
  // 60s safety margin before actual expiry
  if (token && Date.now() < exp - 60000) return token;
  return null;
}

export function signOut() {
  const token = getValidStoredToken();
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
  sessionStorage.removeItem('gd_token');
  sessionStorage.removeItem('gd_token_exp');
}
