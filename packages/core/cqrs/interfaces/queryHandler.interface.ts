import { IQuery } from './query.interface';

export interface IQueryHandler<T extends IQuery = any, R = any> {
  queryToHandle: string;
  execute(query: T): Promise<R>;
}
