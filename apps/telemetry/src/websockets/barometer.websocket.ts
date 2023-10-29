import logger from '@greenthumb/logger';

import config from '../config';
import { dataSource } from '../database';
import MetricFactory from '../factories/metric.factory';
import { MetricType } from '../models/metric.model';
import WebSocketClient from './client.class';

export default function collectSoilMetrics() {
  const websocketName = 'BAROMETER';
  const barometerWs = new WebSocketClient(
    websocketName,
    config.SERVICES.BAROMETER,
  );

  barometerWs.onMessage(async ({ data }) => {
    const message = data.toString();

    try {
      await dataSource.transaction(async (transactionalEntityManager) => {
        // execute queries using transactionalEntityManager
        const humidityMetric = MetricFactory.create(
          MetricType.HUMIDITY,
          message,
        );
        await transactionalEntityManager.save(humidityMetric);

        const temperatureMetric = MetricFactory.create(
          MetricType.AIR_TEMPERATURE,
          message,
        );
        await transactionalEntityManager.save(temperatureMetric);
      });
    } catch (error) {
      logger.error(
        `Failed to create the metric for "${websocketName}" error: ${
          (error as Error).message
        }`,
      );
    }
  });
}
