import { Event } from '@greenthumb/event-worker';
import { DataSourceOptions } from 'typeorm';

import config from '../config';
import Metric from '../models/metric.model';

export default function getConfig() {
  return {
    database: config.TYPEORM.DATABASE,
    entities: [Metric, Event],
    host: config.TYPEORM.HOST,
    logging: config.APP.LOG_LEVEL === 'debug',
    migrations: [config.TYPEORM.MIGRATIONS],
    migrationsTableName: 'migrations',
    password: config.TYPEORM.PASSWORD,
    port: config.TYPEORM.PORT,
    synchronize: false,
    type: 'postgres',
    username: config.TYPEORM.USERNAME,
  } as DataSourceOptions;
}
