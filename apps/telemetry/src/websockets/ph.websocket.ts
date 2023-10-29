import logger from '@greenthumb/logger';

import config from '../config';
import MetricFactory from '../factories/metric.factory';
import { MetricType } from '../models/metric.model';
import metricService from '../services/metric.service';
import WebSocketClient from './client.class';

export default function collectPhMetrics() {
  const websocketName = 'PH';
  const phWs = new WebSocketClient(websocketName, config.SERVICES.PH);

  phWs.onMessage(async ({ data }) => {
    const message = data.toString();

    try {
      const metric = MetricFactory.create(MetricType.PH, message);
      await metricService.saveMetric(metric);
    } catch (error) {
      logger.error(
        `Failed to create the metric for "${websocketName}" error: ${
          (error as Error).message
        }`,
      );
    }
  });
}
