export default class BaseError extends Error {
  readonly code: string;

  previous?: Error;

  constructor(message: string, code: string, previous?: Error) {
    super(message);
    this.code = code;
    this.previous = previous;
  }

  public wrap(previous: Error) {
    this.previous = previous;
    return this;
  }
}
