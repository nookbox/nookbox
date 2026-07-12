import 'dotenv/config';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins/generic-oauth';

import { db } from '../db';
import { account, session, users, verification } from '../db/schema';

const providerId = process.env.OIDC_PROVIDER_ID ?? 'nook-auth';
const port = process.env.PORT ?? '4000';
const rpBaseUrl = process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`;
const oidcIssuer = process.env.OIDC_ISSUER ?? 'http://localhost:3001/api/auth';
const discoveryUrl =
  process.env.OIDC_DISCOVERY_URL ??
  `${oidcIssuer}/.well-known/openid-configuration`;

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret) {
  throw new Error('BETTER_AUTH_SECRET is not set');
}

const clientId = process.env.OIDC_CLIENT_ID;
if (!clientId) {
  throw new Error('OIDC_CLIENT_ID is not set');
}

const clientSecret = process.env.OIDC_CLIENT_SECRET;
if (!clientSecret) {
  throw new Error('OIDC_CLIENT_SECRET is not set');
}

const frontendUrl = process.env.WEB_URL ?? 'http://localhost:3000';

const trustedOrigins = [
  ...new Set([
    rpBaseUrl,
    ...(process.env.CORS_ORIGIN ?? frontendUrl)
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
];

export const oauthProviderId = providerId;
export const oauthCallbackUrl = `${rpBaseUrl}/api/auth/oauth2/callback/${providerId}`;

export const auth = betterAuth({
  appName: 'Nookbox',
  baseURL: rpBaseUrl,
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session, account, verification },
  }),
  trustedOrigins,
  advanced: {
    cookies: {
      // OAuth state 쿠키 수명: 기본 300초(5분)는 로그인+회원가입 완주엔 짧음 → 15분.
      // 이 값을 넘겨 콜백이 오면 state 쿠키가 없어 state_mismatch가 난다.
      state: { attributes: { maxAge: 900 } },
    },
  },
  onAPIError: {
    errorURL: `${frontendUrl}/auth/error`,
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId,
          clientId,
          clientSecret,
          discoveryUrl,
          issuer: oidcIssuer,
          requireIssuerValidation: true,
          scopes: ['openid', 'email', 'profile', 'offline_access'],
          pkce: true,
          overrideUserInfo: true,
        },
      ],
    }),
  ],
});
