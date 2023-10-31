# Greenthumb

## PNPM commands

install a dependency via pnpm global

```bash
    pnpm add amqplib
```

install a dev dependency via pnpm global

```bash
    pnpm add -D @types/amqplib
```

install a dependency on a filtered app

```bash
    pnpm --filter @greenthumb/telemetry add amqplib
```

install a dev dependency on a filtered app

```bash
    pnpm --filter @greenthumb/telemetry add -D @types/amqplib
```

link a package to an app

```bash
    pnpm --filter @greenthumb/telemetry "add" "@greenthumb/delayer@workspace:*"
```

## Technologies

- Technologies
- Node.js
- TypeScript
- MongoDB with MongoDB native driver as an event store - (mongodb package on NPM)
- InversifyJS as an IoC container
- Express (via Inversify Express Utils) as an API - framework
- Redis as a read store for application microservice
- Apache Cassandra as a read store for job microservice
- Apache Kafka as a message broker / event bus
