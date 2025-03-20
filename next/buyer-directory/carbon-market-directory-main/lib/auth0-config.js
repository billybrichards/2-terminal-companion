export const auth0Config = {
  authorizationParams: {
    redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
    // ...existing code...
  },
  // ...existing code...
};
