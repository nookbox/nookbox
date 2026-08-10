/**
 * Silent SSO 공용 상수.
 *
 * IdP 와 nookbox 는 오리진이 달라 세션이 분리돼 있다. IdP 세션 쿠키는
 * id.nook-box.com 에 host-only 로 묶여 있어서, IdP 에 로그인해도 nookbox 는
 * 그걸 알 수 없다. silent SSO 는 세션 없는 방문자를 prompt=none 으로 IdP
 * authorize 에 한 번 태워보며 그 간극을 메운다.
 *
 * ⚠️ iframe 이 아니라 top-level 리다이렉트로 한다. iframe 은 Safari ITP 나
 *    서드파티 쿠키 차단에 걸려 조용히 실패한다.
 */

/**
 * silent SSO 시도 여부. 무한 리다이렉트 방지용이며 IdP 로 보내기 전에 심는다.
 *
 * httpOnly 가 아닌 이유: 로그아웃 시 클라이언트에서도 심어야 한다
 * (로컬 로그아웃만 된 경우 silent SSO 가 즉시 다시 로그인시키는 걸 막는다).
 */
export const SSO_TRIED_COOKIE = 'nook_sso_tried';

/**
 * 루프 가드 수명(초).
 *
 * 짧으면 IdP 왕복이 잦고, 길면 다른 탭에서 IdP 에 로그인한 뒤에도 자동
 * 로그인이 안 된다. 1시간이 절충점. 로그인에 성공하면 미들웨어가 지운다.
 */
export const SSO_TRIED_MAX_AGE_SECONDS = 60 * 60;

/**
 * 서버 auth.ts 의 `advanced.cookiePrefix` 와 같아야 한다.
 * 안 맞으면 미들웨어가 세션을 못 찾아 로그인한 사람에게도 silent SSO 를 돌린다.
 */
export const RP_COOKIE_PREFIX = 'nookbox';

/**
 * prompt=none 실패 시 IdP 가 주는 코드들. 오류가 아니라 "로그인 안 됨"이라는
 * 뜻이라 사용자에게 보여주지 않고 조용히 원래 페이지로 돌려보낸다.
 */
export const SILENT_SSO_ERRORS = new Set([
  'login_required',
  'consent_required',
  'interaction_required',
  'account_selection_required',
]);
