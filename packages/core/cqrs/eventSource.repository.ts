import { injectable, unmanaged } from 'inversify';

import AggregateRoot from './aggregateRoot.class';
import { EventStoreInterface } from './interfaces/eventStore.interface';
import { RepositoryInterface } from './interfaces/repository.interface';

@injectable()
export default class EventSourcedRepository<T extends AggregateRoot>
  implements RepositoryInterface<T>
{
  constructor(
    @unmanaged() private readonly eventStore: EventStoreInterface,
    @unmanaged() private readonly Type: { new (): T },
  ) {}

  async save(aggregateRoot: T, expectedVersion: number) {
    this.eventStore.saveEvents(
      aggregateRoot.id,
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
