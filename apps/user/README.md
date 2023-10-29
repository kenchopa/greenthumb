# User Service

The user microservice has `Node.js 18 lts` and uses `TypeScript` to compile.
This microservice handles operations users, sessions and is used as the authentication server.

## Environment variables

| Since   | Variable                         | Description                                                                                                                                  | Example                               |
| ------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `0.0.1` | `SERVICE_NAME`                   | The service name of the application                                                                                                          | `user`                                |
| `0.0.1` | `NODE_ENV`                       | The application environment to use                                                                                                           | `'production'`, `'development'`       |
| `0.0.1` | `PORT`                           | The port the application will run on                                                                                                         | `3000`                                |
| `0.0.1` | `LOG_LEVEL`                      | The log level the logger will work on specified exactly in RFC5424 ('emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug') | `info`                                |
| `0.0.1` | `DOCS_URI`                       | The uri where the docs are located                                                                                                           | `http://docs-template.com`            |
| `0.0.1` | `METRICS_PATH`                   | The path for fetching the raw metrics                                                                                                        | `/private/metrics`                    |
| `0.0.1` | `JWT_ADMIN_PUBLIC_KEY_FILE`      | Path to admin public key file                                                                                                                | `./docker/keys/admin_public.pem`      |
| `0.0.1` | `JWT_ADMIN_PRIVATE_KEY_FILE`     | Path to admin private key file                                                                                                               | `./docker/keys/admin_private.pem`     |
| `0.0.1` | `JWT_ANONYMOUS_PUBLIC_KEY_FILE`  | Path to anonymous public key file                                                                                                            | `./docker/keys/anonymous_public.pem`  |
| `0.0.1` | `JWT_ANONYMOUS_PRIVATE_KEY_FILE` | Path to anonymous private key file                                                                                                           | `./docker/keys/anonymous_private.pem` |
| `0.0.1` | `JWT_OPERATOR_PUBLIC_KEY_FILE`   | Path to operator public key file                                                                                                             | `./docker/keys/operator_public.pem`   |
| `0.0.1` | `JWT_OPERATOR_PRIVATE_KEY_FILE`  | Path to operator private key file                                                                                                            | `./docker/keys/operator_private.pem`  |
| `0.0.1` | `JWT_SYSTEM_PUBLIC_KEY_FILE`     | Path to system public key file                                                                                                               | `./docker/keys/system_public.pem`     |
| `0.0.1` | `JWT_SYSTEM_PRIVATE_KEY_FILE`    | Path to system private key file                                                                                                              | `./docker/keys/system_private.pem`    |
| `0.0.1` | `JWT_USER_PUBLIC_KEY_FILE`       | Path to user public key file                                                                                                                 | `./docker/keys/user_public.pem`       |
| `0.0.1` | `JWT_USER_PRIVATE_KEY_FILE`      | Path to user private key file                                                                                                                | `./docker/keys/user_private.pem`      |
| `0.0.1` | `JWT_REFRESH_PUBLIC_KEY_FILE`    | Path to refresh token public key file                                                                                                        | `./docker/keys/refresh_public.pem`    |
| `0.0.1` | `JWT_REFRESH_PRIVATE_KEY_FILE`   | Path to refresh token private key file                                                                                                       | `./docker/keys/refresh_private.pem`   |
| `0.0.1` | `POSTGRES_DATABASE`              | Postgres database                                                                                                                            | `database`                            |
| `0.0.1` | `POSTGRES_HOST`                  | Postgres host                                                                                                                                | `127.0.0.1`                           |
| `0.0.1` | `POSTGRES_PORT`                  | Postgres port                                                                                                                                | `5432`                                |
| `0.0.1` | `POSTGRES_USER`                  | Postgres user                                                                                                                                | `guest`                               |
| `0.0.1` | `POSTGRES_PASSWORD`              | Postgres password                                                                                                                            | `guest`                               |
| `0.0.1` | `RABBITMQ_HOST`                  | RabbitMQ host                                                                                                                                | `127.0.0.1`                           |
| `0.0.1` | `RABBITMQ_PORT`                  | RabbitMQ port                                                                                                                                | `5672`                                |
| `0.0.1` | `RABBITMQ_USER`                  | RabbitMQ user                                                                                                                                | `guest`                               |
| `0.0.1` | `RABBITMQ_PASSWORD`              | RabbitMQ password                                                                                                                            | `guest`                               |
| `0.0.1` | `RABBITMQ_VHOST`                 | RabbitMQ vhost                                                                                                                               | ``                                    |
| `0.0.1` | `RABBITMQ_EXCHANGE`              | RabbitMQ exchange                                                                                                                            | `global`                              |
| `0.0.1` | `RABBITMQ_HEARTBEAT_SEC`         | RabbitMQ heatbeat in seconds                                                                                                                 | `15`                                  |
| `0.0.1` | `TYPEORM_CONNECTION`             | Typeorm type of connection database                                                                                                          | `postgres`                            |
| `0.0.1` | `TYPEORM_HOST`                   | Typeorm database host                                                                                                                        | `127.0.0.1`                           |
| `0.0.1` | `TYPEORM_DATABASE`               | Typeorm database name                                                                                                                        | `database_name`                       |
| `0.0.1` | `TYPEORM_PORT`                   | Typeorm database port                                                                                                                        | `5432`                                |
| `0.0.1` | `TYPEORM_USER`                   | Typeorm database user                                                                                                                        | `guest`                               |
| `0.0.1` | `TYPEORM_PASSWORD`               | Typeorm database password                                                                                                                    |                                       |
| `0.0.1` | `TYPEORM_DEBUG`                  | Typeorm enable or disable debugging (pro tip don't use on production)                                                                        | `false`                               |
| `0.0.1` | `TYPEORM_SYNCHRONIZE`            | Typeorm enable or disable synchronize (pro tip don't use on production). If TYPEORM_MIGRATIONS_RUN is true this should be false              | `false`                               |
| `0.0.1` | `TYPEORM_LOGGING`                | Typeorm enable or disable logging (pro tip don't use on production)                                                                          | `false`                               |
| `0.0.1` | `TYPEORM_ENTITIES`               | Typeorm path to the entities (comma separated is possible)                                                                                   | `src/database/entity/*.ts`            |
| `0.0.1` | `TYPEORM_ENTITIES_DIR`           | Typeorm folder where the entities will be created                                                                                            | `src/database/entity`                 |
| `0.0.1` | `TYPEORM_MIGRATIONS`             | Typeorm path to the migration (comma separated is possible)                                                                                  | `src/database/migrations/*.ts`        |
| `0.0.1` | `TYPEORM_MIGRATIONS_DIR`         | Typeorm path to the migration (comma separated is possible). If TYPEORM_SYNCHRONIZE is true this should be false                             | `src/database/migrations`             |
| `0.0.1` | `TYPEORM_MIGRATIONS_RUN`         | Typeorm run migrations on application start                                                                                                  | `true`                                |

## Getting started

### Production build

Configure environment variables, there is a default configuration:

```
cp .env.dist .env
```

Compile TypeScript:

```
npm run build
```

Then start with node:

```
npm run start
```

### Development setup

Configure environment variables, there is a default configuration:

```
cp .env.dev .env
```

For a development setup with ts-node:

```
npm run dev
```

### Scripts

Building for production with clean-up before hand

```bash
npm run build
```

Clean up dist and coverage

```bash
npm run clean
```

Run in debug mode

```bash
npm run debug
```

Run in dev mode

```bash
npm run dev
```

Run in production mode

```bash
npm start
```

Run functional tests

```bash
npm run test
```

Run functional tests with coverage

```bash
npm run test:coverage
```

Run end to end tests

```bash
npm run test:e2e
```

Run lint in dry run mode

```bash
npm run lint
```

Run lint fix mode

```bash
npm run lint:fix
```

# Create a migration

$ npm run migration:create --name=foo

# Generate a migration from schema changes

$ npm run migration:generate --name=bar

# Run migrations and checks for schema changes

$ npm run migration:run

# Revert migrations

$ npm run migration:revert
