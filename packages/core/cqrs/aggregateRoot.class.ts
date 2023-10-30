import { v4 as uuidV4 } from 'uuid';

import { EventInterface } from './interfaces/event.interface';

export default abstract class AggregateRoot {
  [x: string]: any;

  public id: string;

  private __version = -1;

  private __changes: EventInterface[] = [];

  constructor(id?: string) {
    this.id = id || uuidV4();
  }

  get version() {
    return this.__version;
  }

  public getUncommittedEvents(): EventInterface[] {
    return this.__changes;
  }

  public markChangesAsCommitted(): void {
    this.__changes = [];
  }

  protected applyChange(event: EventInterface) {
    this.applyEvent(event, true);
  }

  private applyEvent(event: EventInterface, isNew = false) {
    this[`apply${event.eventName}`](event);
    if (isNew) this.__changes.push(event);
  }

  public loadFromHistory(events: EventInterface[]) {
    for (const event of events) {
      this.applyEvent(event);
      this.__version += 1;
    }
  }
}
