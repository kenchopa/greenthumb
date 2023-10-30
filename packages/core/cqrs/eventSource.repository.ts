import { injectable, unmanaged } from 'inversify';

import AggregateRoot from './aggregateRoot.class';
import { IEventStore } from './interfaces/eventStore.interface';
import { IRepository } from './interfaces/repository.interface';

@injectable()
export default class EventSourcedRepository<T extends AggregateRoot>
  implements IRepository<T>
{
  constructor(
    @unmanaged() private readonly eventStore: IEventStore,
    @unmanaged() private readonly Type: { new (): T },
  ) {}

  async save(aggregateRoot: T, expectedVersion: number) {
    this.eventStore.saveEvents(
      aggregateRoot.guid,
      aggregateRoot.getUncommittedEvents(),
      expectedVersion,
    );
    aggregateRoot.markChangesAsCommitted();
  }

  async getById(guid: string) {
    const aggregateRoot = new this.Type() as T;
    const history = await this.eventStore.getEventsForAggregate(guid);

    aggregateRoot.loadFromHistory(history);

    return aggregateRoot;
  }
}
