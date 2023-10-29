import logger from '@greenthumb/logger';

import config from '../config';
import MetricFactory from '../factories/metric.factory';
import { MetricType } from '../models/metric.model';
import metricService from '../services/metric.service';
import WebSocketClient from './client.class';

export default function collectLightMetrics() {
  const websocketName = 'LIGHT';
  const phWs = new WebSocketClient(websocketName, config.SERVICES.LIGHT);

  phWs.onMessage(async ({ data }) => {
    const message = data.toString();

    try {
      const metric = MetricFactory.create(MetricType.LIGHT, message);
      await metricService.saveMetric(metric);
    } catch (error) {
      logger.error(
        `Failed to Create the metric for "${websocketName}" error: ${
          (error as Error).message
        }`,
      );
    }
  });
}
