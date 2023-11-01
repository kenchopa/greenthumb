import HttpStatusCode from './httpStatusCode.enum';

export class ApiProblem {
  public title: string;

  public detail: string;

  public status: HttpStatusCode;

  public type: string;

  public instance: string;

  public meta: Array<any>;

  constructor(
    title: string,
    status: HttpStatusCode,
    detail: string,
    type: string = 'about:blank',
    instance: string = '',
    meta: Array<any> = [],
  ) {
    this.title = title;
    this.status = status;
    this.detail = detail;
    this.type = type;
    this.instance = instance;
    this.meta = meta;
  }

  public human() {
    return {
      detail: this.detail,
      instance: this.instance,
      meta: !this.meta || this.meta.length === 0 ? undefined : this.meta,
      status: this.status,
      title: this.title,
      type: this.type,
    };
  }
}

export interface CastToApiProblem {
  toApiProblem(): ApiProblem;
}
