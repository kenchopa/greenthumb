import { DataSourceOptions } from 'typeorm';

import config from '../config';
import Session from '../models/session.model';
import User from '../models/user.model';

export default function getConfig() {
  return {
    database: config.TYPEORM.DATABASE,
    entities: [User, Session],
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
