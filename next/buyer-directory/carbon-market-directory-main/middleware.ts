import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

// Make sure environment variables are available to middleware
export const config = {
  matcher: ['/directory/:path*', '/buyer-directory/:path*', '/buyer-directory'],
  env: [
    'AUTH0_SECRET', 
    'AUTH0_BASE_URL', 
    'AUTH0_ISSUER_BASE_URL', 
    'AUTH0_CLIENT_ID', 
    'AUTH0_CLIENT_SECRET',
    'AUTH0_AUDIENCE',
    'AUTH0_SCOPE'
  ],
};
