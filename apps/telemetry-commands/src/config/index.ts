import 'dotenv/config';

import logger from '@greenthumb/logger';
import fs from 'fs';
import Joi from 'joi';

type App = {
  DOCS_URI: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  SERVICE_NAME: string;
  LOG_LEVEL:
    | 'emerg'
    | 'alert'
    | 'crit'
    | 'error'
    | 'warning'
    | 'notice'
    | 'info'
    | 'debug';
};

type Auth = {
  JWT_ADMIN_PUBLIC_KEY: Buffer;
  JWT_ANONYMOUS_PUBLIC_KEY: Buffer;
  JWT_SYSTEM_PUBLIC_KEY: Buffer;
  JWT_OPERATOR_PUBLIC_KEY: Buffer;
  JWT_USER_PUBLIC_KEY: Buffer;
};

type Cassandra = {
  DC: string;
  HOSTS: string[];
  KEYSPACE: string;
};

type RabbitMQ = {
  HOST: string;
  PORT: number;
  USER: string;
  PASSWORD: string;
  VHOST: string;
  EXCHANGE: string;
  HEARTBEAT: number;
};

type REDIS = {
  URI: string;
};

type Kafka = {
  BROKER_LIST: string;
  CONSUMER_GROUP_ID: string;
  TOPICS_TO_SUBSCRIBE: string;
};

type MongoDb = {
  URI: string;
  DB_NAME: string;
};

type Services = {
  SOIL: string;
  BAROMETER: string;
  PH: string;
  LIGHT: string;
};

type Config = {
  APP: App;
  AUTH: Auth;
  CASSANDRA: Cassandra;
  KAFKA: Kafka;
  MONGODB: MongoDb;
  RABBITMQ: RabbitMQ;
  REDIS: REDIS;
  SERVICES: Services;
};

const configSchema = Joi.object({
  CASSANDRA_DC: Joi.string().required(),
  CASSANDRA_HOSTS: Joi.string().required(),
  CASSANDRA_KEYSPACE: Joi.string().required(),
  DOCS_URI: Joi.string().required(),
  JWT_ADMIN_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_ANONYMOUS_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_OPERATOR_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_SYSTEM_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_USER_PUBLIC_KEY_FILE: Joi.string().required(),
  KAFKA_BROKER_LIST: Joi.string().required(),
  KAFKA_CONSUMER_GROUP_ID: Joi.string().required(),
  KAFKA_TOPICS_TO_SUBSCRIBE: Joi.string().required(),
  LOG_LEVEL: Joi.string().required(),
  MONGODB_DB_NAME: Joi.string().required(),
  MONGODB_URI: Joi.string().required(),
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().default(3000),
  RABBITMQ_EXCHANGE: Joi.string().required(),
  RABBITMQ_HEARTBEAT_SEC: Joi.number().required(),
  RABBITMQ_HOST: Joi.string().required(),
  RABBITMQ_PASSWORD: Joi.string().required(),
  RABBITMQ_PORT: Joi.number().required(),
  RABBITMQ_USER: Joi.string().required(),
  RABBITMQ_VHOST: Joi.string().required(),
  REDIS_URI: Joi.string().required(),
  SERVICE_NAME: Joi.string().required(),
  SERVICE_URI_BAROMETER: Joi.string().required(),
  SERVICE_URI_LIGHT: Joi.string().required(),
  SERVICE_URI_PH: Joi.string().required(),
  SERVICE_URI_SOIL: Joi.string().required(),
});

const {
  error,
  value: {
    CASSANDRA_DC,
    CASSANDRA_HOSTS,
    CASSANDRA_KEYSPACE,
    DOCS_URI,
    JWT_ADMIN_PUBLIC_KEY_FILE,
    JWT_ANONYMOUS_PUBLIC_KEY_FILE,
    JWT_OPERATOR_PUBLIC_KEY_FILE,
    JWT_SYSTEM_PUBLIC_KEY_FILE,
    JWT_USER_PUBLIC_KEY_FILE,
    LOG_LEVEL,
    KAFKA_BROKER_LIST,
    KAFKA_CONSUMER_GROUP_ID,
    KAFKA_TOPICS_TO_SUBSCRIBE,
    MONGODB_DB_NAME,
    MONGODB_URI,
    NODE_ENV,
    PORT,
    RABBITMQ_HOST,
    RABBITMQ_PORT,
    RABBITMQ_PASSWORD,
    RABBITMQ_USER,
    RABBITMQ_VHOST,
    RABBITMQ_EXCHANGE,
    RABBITMQ_HEARTBEAT_SEC,
    REDIS_URI,
    SERVICE_NAME,
    SERVICE_URI_BAROMETER,
    SERVICE_URI_SOIL,
    SERVICE_URI_PH,
    SERVICE_URI_LIGHT,
  },
} = configSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  logger.error('Something went wrong with the provided environment variables.');
  logger.error(error.message);
  process.exit(1);
}

const config: Config = {
  APP: {
    DOCS_URI,
    LOG_LEVEL,
    NODE_ENV,
    PORT,
    SERVICE_NAME,
  },
  AUTH: {
    JWT_ADMIN_PUBLIC_KEY: fs.readFileSync(JWT_ADMIN_PUBLIC_KEY_FILE),
    JWT_ANONYMOUS_PUBLIC_KEY: fs.readFileSync(JWT_ANONYMOUS_PUBLIC_KEY_FILE),
    JWT_OPERATOR_PUBLIC_KEY: fs.readFileSync(JWT_OPERATOR_PUBLIC_KEY_FILE),
    JWT_SYSTEM_PUBLIC_KEY: fs.readFileSync(JWT_SYSTEM_PUBLIC_KEY_FILE),
    JWT_USER_PUBLIC_KEY: fs.readFileSync(JWT_USER_PUBLIC_KEY_FILE),
  },
  CASSANDRA: {
    DC: CASSANDRA_DC,
    HOSTS: CASSANDRA_HOSTS.split(','),
    KEYSPACE: CASSANDRA_KEYSPACE,
  },
  KAFKA: {
    BROKER_LIST: KAFKA_BROKER_LIST,
    CONSUMER_GROUP_ID: KAFKA_CONSUMER_GROUP_ID,
    TOPICS_TO_SUBSCRIBE: KAFKA_TOPICS_TO_SUBSCRIBE,
  },
  MONGODB: {
    DB_NAME: MONGODB_DB_NAME,
    URI: MONGODB_URI,
  },
  RABBITMQ: {
    EXCHANGE: RABBITMQ_EXCHANGE,
    HEARTBEAT: RABBITMQ_HEARTBEAT_SEC,
    HOST: RABBITMQ_HOST,
    PASSWORD: RABBITMQ_PASSWORD,
    PORT: RABBITMQ_PORT,
    USER: RABBITMQ_USER,
    VHOST: RABBITMQ_VHOST,
  },
  REDIS: {
    URI: REDIS_URI,
  },
  SERVICES: {
    BAROMETER: SERVICE_URI_BAROMETER,
    LIGHT: SERVICE_URI_LIGHT,
    PH: SERVICE_URI_PH,
    SOIL: SERVICE_URI_SOIL,
  },
};

export default config;
