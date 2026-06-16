const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_STATE_KEY = "digital_rental_google_oauth_state";

const getGoogleRedirectUri = () => {
  if (process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  }
  return `${window.location.origin}/auth/google/callback`;
};

const createState = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
};

export function startGoogleOAuth() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Google Client ID chưa được cấu hình.");
  }

  const state = createState();
  sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function getGoogleRedirectUriForBackend() {
  return getGoogleRedirectUri();
}

export function consumeGoogleOAuthState(receivedState: string | null) {
  const expectedState = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
  sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
  return !!receivedState && !!expectedState && receivedState === expectedState;
}
