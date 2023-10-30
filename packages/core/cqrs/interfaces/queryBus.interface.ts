import { IQuery } from './query.interface';
import { IQueryHandler } from './queryHandler.interface';

export interface IQueryBus<BaseQuery extends IQuery = IQuery> {
  registerHandler(queryHandler: IQueryHandler<BaseQuery>): void;
  execute<T extends BaseQuery = BaseQuery, R = any>(query: T): Promise<R>;
}
