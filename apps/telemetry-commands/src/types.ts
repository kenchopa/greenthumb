const TYPES = {
  ApiServer: Symbol('ApiServer'),
  CassandraDb: Symbol('CassandraDb'),
  CommandBus: Symbol('CommandBus'),
  CommandHandler: Symbol('CommandHandler'),
  Db: Symbol('Db'),
  Event: Symbol('Event'),
  EventBus: Symbol('EventBus'),
  EventHandler: Symbol('EventHandler'),
  EventStore: Symbol('EventStore'),
  KafkaConsumer: Symbol('KafkaConsumer'),
  KafkaProducer: Symbol('KafkaProducer'),
  Logger: Symbol('Logger'),
  MetricEventStore: Symbol('MetricEventStore'),
  MetricRepository: Symbol('MetricRepository'),
  QueryBus: Symbol('QueryBus'),
  QueryHandler: Symbol('QueryHandler'),
  Redis: Symbol('Redis'),
  RedisSubscriber: Symbol('RedisSubscriber'),
};

export default TYPES;
