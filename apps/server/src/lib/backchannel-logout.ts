import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from 'better-auth/api';
import type { BetterAuthPlugin } from 'better-auth';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import * as z from 'zod';

const BACKCHANNEL_LOGOUT_EVENT =
  'http://schemas.openid.net/event/backchannel-logout';

/**
 * ⚠️ ctx.json(body, { status: 400 }) 은 먹지 않는다. better-call 이 두 번째
 *    인자를 버려서 200 이 나가고, IdP 는 통지가 성공한 줄 안다. APIError 필수.
 */
function reject(): APIError {
  return new APIError('BAD_REQUEST', { error: 'invalid_request' });
}

interface BackchannelLogoutOptions {
  issuer: string;
  /** 이 RP 의 client_id. logout_token 의 aud 가 이것과 일치해야 한다. */
  clientId: string;
  /** IdP 에 등록된 provider id */
  providerId: string;
  postLogoutRedirectUri: string;
}

export const backchannelLogout = (
  options: BackchannelLogoutOptions,
): BetterAuthPlugin => {
  const jwks = createRemoteJWKSet(new URL(`${options.issuer}/jwks`));

  return {
    id: 'backchannel-logout',
    endpoints: {
      backchannelLogout: createAuthEndpoint(
        '/backchannel-logout',
        {
          method: 'POST',
          // IdP 는 스펙대로 form-urlencoded 로 보낸다.
          metadata: {
            allowedMediaTypes: [
              'application/x-www-form-urlencoded',
              'application/json',
            ],
          },
          body: z.object({ logout_token: z.string() }),
        },
        async (ctx) => {
          let payload: JWTPayload;
          try {
            const verified = await jwtVerify(ctx.body.logout_token, jwks, {
              issuer: options.issuer,
              audience: options.clientId,
            });
            payload = verified.payload;
          } catch (error) {
            ctx.context.logger.warn(
              '[backchannel-logout] logout_token 검증 실패',
              error,
            );
            throw reject();
          }

          // 스펙 필수. 없으면 같은 키로 서명된 id_token 을 들이밀어
          // 임의 유저를 로그아웃시킬 수 있다.
          const events = payload.events as Record<string, unknown> | undefined;
          if (!events || !(BACKCHANNEL_LOGOUT_EVENT in events)) {
            throw reject();
          }
          // nonce 가 있으면 logout_token 이 아니라 id_token 이다.
          if ('nonce' in payload) {
            throw reject();
          }

          const subject = payload.sub;
          if (!subject) {
            throw reject();
          }

          const linked = await ctx.context.adapter.findOne<{ userId: string }>({
            model: 'account',
            where: [
              { field: 'providerId', value: options.providerId },
              { field: 'accountId', value: subject },
            ],
          });

          // 모르는 유저여도 성공으로 답한다. 존재 여부를 흘리지 않기 위해.
          if (linked) {
            await ctx.context.internalAdapter.deleteUserSessions(linked.userId);
          }

          ctx.setHeader('Cache-Control', 'no-store');
          return ctx.json({ ok: true });
        },
      ),

      idpLogoutLink: createAuthEndpoint(
        '/idp-logout-link',
        { method: 'GET', use: [sessionMiddleware] },
        async (ctx) => {
          const userId = ctx.context.session.user.id;

          const linked = await ctx.context.adapter.findOne<{
            idToken: string | null;
          }>({
            model: 'account',
            where: [
              { field: 'providerId', value: options.providerId },
              { field: 'userId', value: userId },
            ],
          });

          // id_token_hint 가 필수라 없으면 end_session 을 못 부른다.
          // 로컬 로그아웃만 진행되게 null 을 준다.
          if (!linked?.idToken) {
            return ctx.json({ url: null });
          }

          const url = new URL(`${options.issuer}/oauth2/end-session`);
          url.searchParams.set('id_token_hint', linked.idToken);
          url.searchParams.set('client_id', options.clientId);
          url.searchParams.set(
            'post_logout_redirect_uri',
            options.postLogoutRedirectUri,
          );

          return ctx.json({ url: url.toString() });
        },
      ),
    },
  };
};
