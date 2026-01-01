// Google OAuth utility to prevent multiple initializations
import { GOOGLE_CLIENT_ID, validateGoogleOAuthConfig, GOOGLE_OAUTH_CONFIG_GUIDE } from './googleOAuthConfig';

let googleAuthInitialized = false;
let googleScriptLoaded = false;

export const initializeGoogleAuth = (clientId, callback) => {
  return new Promise((resolve, reject) => {
    // Validate configuration
    if (!validateGoogleOAuthConfig()) {
      console.warn('Google OAuth configuration may be invalid. See guide above.');
    }

    // If already initialized, just resolve
    if (googleAuthInitialized && window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callback,
        auto_select: false,
        cancel_on_tap_outside: false
      });
      resolve();
      return;
    }

    // Load Google script if not already loaded
    if (!googleScriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        googleScriptLoaded = true;
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: callback,
            auto_select: false,
            cancel_on_tap_outside: false
          });
          googleAuthInitialized = true;
          resolve();
        } else {
          reject(new Error('Google library failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google script'));
      };
      
      document.head.appendChild(script);
    } else {
      // Script loaded but not initialized
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: callback,
          auto_select: false,
          cancel_on_tap_outside: false
        });
        googleAuthInitialized = true;
        resolve();
      } else {
        reject(new Error('Google library not available'));
      }
    }
  });
};

export const renderGoogleButton = (elementId, options = {}) => {
  if (window.google && document.getElementById(elementId)) {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      { theme: 'outline', size: 'large', text: 'signin_with', ...options }
    );
  }
};

export const showGoogleOneTap = () => {
  if (window.google) {
    window.google.accounts.id.prompt();
  }
};

export { GOOGLE_CLIENT_ID, GOOGLE_OAUTH_CONFIG_GUIDE };
