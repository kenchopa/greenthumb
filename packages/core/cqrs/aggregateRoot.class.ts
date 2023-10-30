import { v4 as uuidV4 } from 'uuid';

import { IEvent } from './interfaces/event.interface';

export default abstract class AggregateRoot {
  [x: string]: any;

  public guid: string;

  private __version = -1;

  private __changes: any[] = [];

  get version() {
    return this.__version;
  }

  constructor(guid?: string) {
    this.guid = guid || uuidV4();
  }

  public getUncommittedEvents(): IEvent[] {
    return this.__changes;
  }

  public markChangesAsCommitted(): void {
    this.__changes = [];
  }

  protected applyChange(event: IEvent) {
    this.applyEvent(event, true);
  }

  private applyEvent(event: IEvent, isNew = false) {
    this[`apply${event.eventName}`](event);
    if (isNew) this.__changes.push(event);
  }

  public loadFromHistory(events: IEvent[]) {
    for (const event of events) {
      this.applyEvent(event);
      this.__version += 1;
    }
  }
}
