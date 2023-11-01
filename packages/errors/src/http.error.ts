import { ApiProblem, CastToApiProblem } from './apiProblem.class';
import BaseError from './base.error';
import HttpStatusCode from './httpStatusCode.enum';

export default class HttpError extends BaseError implements CastToApiProblem {
  readonly httpStatusCode: HttpStatusCode;

  protected apiProblem: ApiProblem;

  constructor(
    message: string,
    code: string,
    httpStatusCode: HttpStatusCode,
    previous?: Error,
  ) {
    super(message, code, previous);
    this.httpStatusCode = httpStatusCode;
    this.apiProblem = new ApiProblem(
      this.code,
      this.httpStatusCode,
      this.message,
    );
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  public toApiProblem(): ApiProblem {
    return this.apiProblem;
  }

  [index: string]:
    | string
    | HttpStatusCode
    | Error
    | Function
    | ApiProblem
    | undefined;

  public interogate(meta: Array<any>) {
    this.apiProblem.meta = meta;
    return this;
  }
}
