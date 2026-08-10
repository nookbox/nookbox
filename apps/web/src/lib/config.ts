import 'server-only';

export const API_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

/**
 * 브라우저가 실제로 접속하는 공개 오리진(compose 의 PUBLIC_ORIGIN).
 *
 * NEXT_PUBLIC_API_URL 과 값은 같지만 그쪽은 빌드 시점에 번들로 박히는 값이라
 * 의미가 다르다. 이건 런타임 환경변수다.
 *
 * ⚠️ 요청 헤더로 복원하지 않고 설정값으로 못박는 이유: x-forwarded-host 는
 *    클라이언트가 위조할 수 있고 앞단 cloudflared 가 덮어쓰지 않는다.
 *    이 값은 callbackURL·Origin 헤더·쿠키 secure 플래그로 그대로 흘러간다.
 */
export const PUBLIC_ORIGIN = process.env.PUBLIC_ORIGIN;
