// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = '376155289432-sibodjmekgb7373d0gnk1esnqmrq4btm.apps.googleusercontent.com';

// Get current origin for development/production
export const getCurrentOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000'; // Default for development
};

// Configuration guide for Google Cloud Console
export const GOOGLE_OAUTH_CONFIG_GUIDE = `
To fix "The given origin is not allowed for the given client ID" error:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID (Web application)
5. Click on it to edit
6. Under "Authorized JavaScript origins", add:
   - http://localhost:3000 (for development)
   - http://localhost:5173 (if using Vite)
   - http://localhost:8080 (if using different port)
   - https://yourdomain.com (for production)
7. Click "Save"
8. Wait a few minutes for changes to propagate

Current origin: ${getCurrentOrigin()}
`;

export const validateGoogleOAuthConfig = () => {
  const origin = getCurrentOrigin();
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:8080',
    'https://yourdomain.com' // Replace with your production domain
  ];
  
  if (!allowedOrigins.includes(origin)) {
    console.warn(`Current origin "${origin}" may not be authorized in Google Cloud Console`);
    console.warn(GOOGLE_OAUTH_CONFIG_GUIDE);
    return false;
  }
  
  return true;
};
