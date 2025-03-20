import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0'

export default handleAuth({
  login: handleLogin({
    returnTo: '/buyer-directory'
  }),
  callback: handleCallback({
    afterCallback: (req, res, session) => {
      return session
    }
  }),
  auth0Params: {
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    baseURL: process.env.AUTH0_BASE_URL,
    secret: process.env.AUTH0_SECRET,
    routes: {
      callback: '/api/auth/callback',
      login: '/api/auth/login'
    }
  }
})
