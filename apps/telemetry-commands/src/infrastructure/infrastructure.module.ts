import { CommandBusInterface, EventBusInterface } from '@greenthumb/cqrs';
import {
  MetricEventStoreInterface,
  MetricRepositoryInterface,
} from '@greenthumb/domain';
import { Client } from 'cassandra-driver';
import { AsyncContainerModule, interfaces } from 'inversify';
import RedisClient, { Redis } from 'ioredis';
import { Consumer, Kafka, Partitioners, Producer } from 'kafkajs';
import { Db } from 'mongodb';

import config from '../config';
import TYPES from '../types';
import CommandBus from './commandBus';
import createCassandraClient from './db/cassandra';
import createMongodbConnection from './db/mongodb';
import KafkaEventBus from './eventbus/kafka.eventBus';
import MetricEventStore from './eventStore/metric.eventstore';
import MetricRepository from './repositories/metric.repository';

const infrastructureModule = new AsyncContainerModule(
  async (bind: interfaces.Bind) => {
    const db: Db = await createMongodbConnection(config.MONGODB.URI);
    const cassandra: Client = createCassandraClient(
      config.CASSANDRA.HOSTS,
      config.CASSANDRA.DC,
      config.CASSANDRA.KEYSPACE,
    );

    const kafka = new Kafka({ brokers: config.KAFKA.BROKER_LIST.split(',') });
    const kafkaProducer = kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
    const kafkaConsumer = kafka.consumer({
      groupId: config.KAFKA.CONSUMER_GROUP_ID,
    });
    await kafkaProducer.connect();

    bind<Db>(TYPES.Db).toConstantValue(db);
    bind<Client>(TYPES.CassandraDb).toConstantValue(cassandra);
    bind<Producer>(TYPES.KafkaProducer).toConstantValue(kafkaProducer);
    bind<Consumer>(TYPES.KafkaConsumer).toConstantValue(kafkaConsumer);
    bind<Redis>(TYPES.Redis).toConstantValue(new RedisClient(config.REDIS.URI));
    bind<EventBusInterface>(TYPES.EventBus).to(KafkaEventBus);
    bind<MetricEventStoreInterface>(TYPES.MetricEventStore)
      .to(MetricEventStore)
      .inSingletonScope();
    bind<MetricRepositoryInterface>(TYPES.MetricRepository)
      .to(MetricRepository)
      .inSingletonScope();
    bind<CommandBusInterface>(TYPES.CommandBus).toConstantValue(
      new CommandBus(),
    );
  },
);

export default infrastructureModule;
