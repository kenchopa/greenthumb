export type DataErrorCode =
  | 'CONFLICTED_ENTITY'
  | 'BAD_REQUEST'
  | 'UNABLE_TO_PARSE_AMQP_MESSAGE'
  | 'NOT_FOUND';

export default class DataError extends Error {
  readonly code: DataErrorCode;

  readonly previous?: Error;

  constructor(code: DataErrorCode, message: string, previous?: Error) {
    super(message);
    this.code = code;
    this.previous = previous;
  }
}
