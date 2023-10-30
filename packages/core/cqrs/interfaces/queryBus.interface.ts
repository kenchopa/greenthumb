import { QueryInterface } from './query.interface';
import { QueryHandlerInterface } from './queryHandler.interface';

export interface QueryBusInterface<
  BaseQuery extends QueryInterface = QueryInterface,
> {
  registerHandler(queryHandler: QueryHandlerInterface<BaseQuery>): void;
  execute<T extends BaseQuery = BaseQuery, R = any>(query: T): Promise<R>;
}
