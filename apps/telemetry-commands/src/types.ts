const TYPES = {
  CommandBus: Symbol('CommandBus'),
  CommandHandler: Symbol('CommandHandler'),
  Event: Symbol('Event'),
  EventBus: Symbol('EventBus'),
  EventHandler: Symbol('EventHandler'),
  EventStore: Symbol('EventStore'),
  JobEventStore: Symbol('JobEventStore'),
  JobRepository: Symbol('JobRepository'),
  QueryBus: Symbol('QueryBus'),
  QueryHandler: Symbol('QueryHandler'),
};

export default TYPES;
