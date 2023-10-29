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
