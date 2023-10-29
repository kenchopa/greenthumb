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
  JWT_ADMIN_PRIVATE_KEY: Buffer;
  JWT_ADMIN_PUBLIC_KEY: Buffer;
  JWT_ANONYMOUS_PRIVATE_KEY: Buffer;
  JWT_ANONYMOUS_PUBLIC_KEY: Buffer;
  JWT_SYSTEM_PRIVATE_KEY: Buffer;
  JWT_SYSTEM_PUBLIC_KEY: Buffer;
  JWT_OPERATOR_PRIVATE_KEY: Buffer;
  JWT_OPERATOR_PUBLIC_KEY: Buffer;
  JWT_REFRESH_PRIVATE_KEY: Buffer;
  JWT_REFRESH_PUBLIC_KEY: Buffer;
  JWT_USER_PRIVATE_KEY: Buffer;
  JWT_USER_PUBLIC_KEY: Buffer;
};

type TypeORM = {
  CONNECTION: string;
  DATABASE: string;
  DEBUG: boolean;
  ENTITIES: string;
  ENTITIES_DIR: string;
  HOST: string;
  LOGGING: boolean;
  MIGRATIONS: string;
  MIGRATIONS_DIR: string;
  MIGRATIONS_RUN: boolean;
  PASSWORD: string;
  PORT: number;
  SYNCHRONIZE: boolean;
  USERNAME: string;
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

type Config = {
  APP: App;
  AUTH: Auth;
  RABBITMQ: RabbitMQ;
  TYPEORM: TypeORM;
};

const configSchema = Joi.object({
  DOCS_URI: Joi.string().required(),
  JWT_ADMIN_PRIVATE_KEY_FILE: Joi.string().required(),
  JWT_ADMIN_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_ANONYMOUS_PRIVATE_KEY_FILE: Joi.string().required(),
  JWT_ANONYMOUS_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_OPERATOR_PRIVATE_KEY_FILE: Joi.string().required(),
  JWT_OPERATOR_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_REFRESH_PRIVATE_KEY_FILE: Joi.string().required(),
  JWT_REFRESH_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_SYSTEM_PRIVATE_KEY_FILE: Joi.string().required(),
  JWT_SYSTEM_PUBLIC_KEY_FILE: Joi.string().required(),
  JWT_USER_PRIVATE_KEY_FILE: Joi.string().required(),
  JWT_USER_PUBLIC_KEY_FILE: Joi.string().required(),
  LOG_LEVEL: Joi.string().required(),
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().default(3000),
  RABBITMQ_EXCHANGE: Joi.string().required(),
  RABBITMQ_HEARTBEAT_SEC: Joi.number().required(),
  RABBITMQ_HOST: Joi.string().required(),
  RABBITMQ_PASSWORD: Joi.string().required(),
  RABBITMQ_PORT: Joi.number().required(),
  RABBITMQ_USER: Joi.string().required(),
  RABBITMQ_VHOST: Joi.string().required(),
  SERVICE_NAME: Joi.string().required(),
  TYPEORM_CONNECTION: Joi.string().required(),
  TYPEORM_DATABASE: Joi.string().required(),
  TYPEORM_DEBUG: Joi.boolean().default(false),
  TYPEORM_ENTITIES: Joi.string().required(),
  TYPEORM_ENTITIES_DIR: Joi.string().required(),
  TYPEORM_HOST: Joi.string().required(),
  TYPEORM_LOGGING: Joi.boolean().default(false),
  TYPEORM_MIGRATIONS: Joi.string().required(),
  TYPEORM_MIGRATIONS_DIR: Joi.string().required(),
  TYPEORM_MIGRATIONS_RUN: Joi.boolean().default(true),
  TYPEORM_PASSWORD: Joi.string().required(),
  TYPEORM_PORT: Joi.number().required(),
  TYPEORM_SYNCHRONIZE: Joi.when('TYPEORM_MIGRATIONS_RUN', {
    is: Joi.boolean().valid(true),
    // eslint-disable-next-line sort-keys
    otherwise: Joi.boolean()
      .valid(true)
      .error((message) => {
        return new Error(
          `${message}: Basically TYPEORM_SYNCHRONIZE should be true and TYPEORM_MIGRATIONS_RUN should be false or vice versa.`,
        );
      }),

    then: Joi.boolean()
      .valid(false)
      .error((message) => {
        return new Error(
          `${message}: Basically TYPEORM_MIGRATIONS_RUN should be true and TYPEORM_SYNCHRONIZE should be false or vice versa.`,
        );
      }),
  }),
  TYPEORM_USERNAME: Joi.string().required(),
});

const {
  error,
  value: {
    DOCS_URI,
    JWT_ADMIN_PRIVATE_KEY_FILE,
    JWT_ADMIN_PUBLIC_KEY_FILE,
    JWT_ANONYMOUS_PRIVATE_KEY_FILE,
    JWT_ANONYMOUS_PUBLIC_KEY_FILE,
    JWT_OPERATOR_PRIVATE_KEY_FILE,
    JWT_OPERATOR_PUBLIC_KEY_FILE,
    JWT_REFRESH_PRIVATE_KEY_FILE,
    JWT_REFRESH_PUBLIC_KEY_FILE,
    JWT_SYSTEM_PRIVATE_KEY_FILE,
    JWT_SYSTEM_PUBLIC_KEY_FILE,
    JWT_USER_PRIVATE_KEY_FILE,
    JWT_USER_PUBLIC_KEY_FILE,
    LOG_LEVEL,
    NODE_ENV,
    PORT,
    RABBITMQ_HOST,
    RABBITMQ_PORT,
    RABBITMQ_PASSWORD,
    RABBITMQ_USER,
    RABBITMQ_VHOST,
    RABBITMQ_EXCHANGE,
    RABBITMQ_HEARTBEAT_SEC,
    SERVICE_NAME,
    TYPEORM_CONNECTION,
    TYPEORM_DATABASE,
    TYPEORM_DEBUG,
    TYPEORM_ENTITIES,
    TYPEORM_ENTITIES_DIR,
    TYPEORM_HOST,
    TYPEORM_LOGGING,
    TYPEORM_MIGRATIONS,
    TYPEORM_MIGRATIONS_DIR,
    TYPEORM_MIGRATIONS_RUN,
    TYPEORM_PASSWORD,
    TYPEORM_PORT,
    TYPEORM_SYNCHRONIZE,
    TYPEORM_USERNAME,
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
    JWT_ADMIN_PRIVATE_KEY: fs.readFileSync(JWT_ADMIN_PRIVATE_KEY_FILE),
    JWT_ADMIN_PUBLIC_KEY: fs.readFileSync(JWT_ADMIN_PUBLIC_KEY_FILE),
    JWT_ANONYMOUS_PRIVATE_KEY: fs.readFileSync(JWT_ANONYMOUS_PRIVATE_KEY_FILE),
    JWT_ANONYMOUS_PUBLIC_KEY: fs.readFileSync(JWT_ANONYMOUS_PUBLIC_KEY_FILE),
    JWT_OPERATOR_PRIVATE_KEY: fs.readFileSync(JWT_OPERATOR_PRIVATE_KEY_FILE),
    JWT_OPERATOR_PUBLIC_KEY: fs.readFileSync(JWT_OPERATOR_PUBLIC_KEY_FILE),
    JWT_REFRESH_PRIVATE_KEY: fs.readFileSync(JWT_REFRESH_PRIVATE_KEY_FILE),
    JWT_REFRESH_PUBLIC_KEY: fs.readFileSync(JWT_REFRESH_PUBLIC_KEY_FILE),
    JWT_SYSTEM_PRIVATE_KEY: fs.readFileSync(JWT_SYSTEM_PRIVATE_KEY_FILE),
    JWT_SYSTEM_PUBLIC_KEY: fs.readFileSync(JWT_SYSTEM_PUBLIC_KEY_FILE),
    JWT_USER_PRIVATE_KEY: fs.readFileSync(JWT_USER_PRIVATE_KEY_FILE),
    JWT_USER_PUBLIC_KEY: fs.readFileSync(JWT_USER_PUBLIC_KEY_FILE),
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
  TYPEORM: {
    CONNECTION: TYPEORM_CONNECTION,
    DATABASE: TYPEORM_DATABASE,
    DEBUG: TYPEORM_DEBUG,
    ENTITIES: TYPEORM_ENTITIES,
    ENTITIES_DIR: TYPEORM_ENTITIES_DIR,
    HOST: TYPEORM_HOST,
    LOGGING: TYPEORM_LOGGING,
    MIGRATIONS: TYPEORM_MIGRATIONS,
    MIGRATIONS_DIR: TYPEORM_MIGRATIONS_DIR,
    MIGRATIONS_RUN: TYPEORM_MIGRATIONS_RUN,
    PASSWORD: TYPEORM_PASSWORD,
    PORT: TYPEORM_PORT,
    SYNCHRONIZE: TYPEORM_SYNCHRONIZE,
    USERNAME: TYPEORM_USERNAME,
  },
};

export default config;
