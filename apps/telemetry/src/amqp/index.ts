import sleep from '@greenthumb/delayer';
import logger from '@greenthumb/logger';
import { Channel, connect, Connection } from 'amqplib';
import type { JsonObject } from 'type-fest';
import uuid from 'uuid';

import config from '../config';

let channel: Channel;
let connection: Connection;
let connectionRetries = 1;

const initialize = async () => {
  try {
    connection = await connect({
      heartbeat: config.RABBITMQ.HEARTBEAT,
      hostname: config.RABBITMQ.HOST,
      password: config.RABBITMQ.PASSWORD,
      username: config.RABBITMQ.USER,
      vhost: config.RABBITMQ.VHOST,
    });

    channel = await connection.createChannel();
  } catch (error) {
    logger.error(`Failed to set up RabbitMQ. Re-trying in ${connectionRetries} seconds...`, {
      errorMessage: (error as Error).message,
    });

    await sleep(connectionRetries * 1000);
    connectionRetries += 1;
    await initialize();

    return channel;
  }

  return channel;
};

export const getChannel = () => channel;

export const publishMessage = async (
  key: string,
  payload: JsonObject,
  properties: JsonObject = {},
  headers: JsonObject = {},
) => {
  if (!channel) {
    throw new Error('No RabbitMQ channel found.');
  }

  channel.publish(config.RABBITMQ.EXCHANGE, key, Buffer.from(JSON.stringify(payload), 'utf8'), {
    contentType: 'application/json',
    headers: {
      app_id: config.APP.SERVICE_NAME,
      version: 1,
      ...headers,
    },
    messageId: uuid.v4(),
    timestamp: Math.floor(new Date().valueOf() / 1000),
    ...properties,
  });
};

export const checkHealth = async () => {
  try {
    if (channel == null) {
      throw new Error('AMQP server is disconnected.');
    }

    await channel.checkExchange(config.RABBITMQ.EXCHANGE);
  } catch (error) {
    throw new Error((error as Error).message ?? 'Unknown error in RabbitMQ health check');
  }
};

export default async function initializeRabbitMQConnection() {
  logger.info('Setting up RabbitMQ...');

  await initialize();

  connection.on('close', async () => {
    logger.error(`RabbitMQ connection closed. Re-trying in ${connectionRetries} seconds...`);

    await sleep(connectionRetries * 1000);
    connectionRetries += 1;
    await initializeRabbitMQConnection();
  });

  connectionRetries = 1;
  logger.info('RabbitMQ setup completed!');
}
