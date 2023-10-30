import { QueryInterface } from './query.interface';

export interface QueryHandlerInterface<
  T extends QueryInterface = any,
  R = any,
> {
  queryToHandle: string;
  execute(query: T): Promise<R>;
}
