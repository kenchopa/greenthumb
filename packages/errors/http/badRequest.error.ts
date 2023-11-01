import HttpError from '../http.error';
import HttpStatusCode from '../httpStatusCode.enum';

export default class BadRequestError extends HttpError {
  violations: any;

  constructor(message: string, violations: any = []) {
    super(message, 'BAD_REQUEST_ERROR', HttpStatusCode.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    if (violations.length !== 0) {
      this.violations = violations;
      this.interogate(violations);
    }
  }

  static forHeader(header: string): BadRequestError {
    return new this(`Header "${header}" is not valid.`);
  }

  static forViolations(violations: any[]): BadRequestError {
    return new this('Unable to process the request', violations);
  }
}
