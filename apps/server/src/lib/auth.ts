import 'dotenv/config';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins/generic-oauth';

import { db } from '../db';
import { account, session, users, verification } from '../db/schema';
import { backchannelLogout } from './backchannel-logout';

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
export const oauthCallbackUrl = `${rpBaseUrl}/api/auth/callback/${providerId}`;

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
    // 쿠키는 포트를 구분하지 않아 로컬에서 IdP 쿠키와 덮어쓴다.
    // web 의 RP_COOKIE_PREFIX 와 같아야 한다.
    cookiePrefix: 'nookbox',
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
  session: {
    additionalFields: {
      // backchannel-logout 플러그인이 쓴다. 외부 입력으로는 못 채운다.
      idpSid: { type: 'string', required: false, input: false },
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId,
          clientId,
          clientSecret,
          discoveryUrl,
          // account.issuer 네임스페이스를 env 값으로 못박는다. discovery 가
          // 보고하는 issuer 를 그대로 쓰면 IdP 설정이 바뀔 때 계정이 갈라진다.
          // backchannel-logout 플러그인도 이 값으로 account 를 찾는다.
          accountIssuer: oidcIssuer,
          // discovery 가 issuer + jwks_uri 를 안 주면 부팅을 막는다.
          // 1.6 의 requireIssuerValidation 대체.
          requireIdTokenVerification: true,
          scopes: ['openid', 'email', 'profile', 'offline_access'],
          pkce: true,
          overrideUserInfo: true,
          postLogoutRedirectURI: new URL(frontendUrl).toString(),
        },
      ],
    }),
    // IdP 로그아웃 통지를 받아 nookbox 세션도 끊는다.
    // (수신은 1.7 코어에도 없어서 계속 직접 구현한다. 발신은 IdP 쪽 몫.)
    backchannelLogout({
      issuer: oidcIssuer,
      clientId,
      providerId,
    }),
  ],
});
