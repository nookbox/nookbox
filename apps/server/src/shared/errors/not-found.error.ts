// 도메인 계층에서 던지는 프레임워크 비의존 에러.
// HTTP 매핑은 AllExceptionsFilter가 404로 변환한다.
export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}
