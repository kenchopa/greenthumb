import { HttpError, HttpStatusCode } from '@greenthumb/errors';
import { createServiceSpan } from '@greenthumb/tracer';
import { Span } from 'opentracing';

import { dataSource } from '../database';
import MetricNotFoundError from '../errors/metric/metricNotFound.error';
import Metric from '../models/metric.model';

const SERVICE = 'MetricService';

export class MetricService {
  private readonly metricRepository;

  public constructor() {
    this.metricRepository = dataSource.manager.getRepository(Metric);
  }

  public async getById(id: string, span: Span): Promise<Metric> {
    const serviceSpan = createServiceSpan(SERVICE, 'getById', span);
    const metric = await this.metricRepository.findOne({ where: { id } });

    if (!metric) {
      throw MetricNotFoundError.forId(id);
    }

    serviceSpan.finish();
    return metric;
  }

  public async getAll(span: Span): Promise<Metric[]> {
    const serviceSpan = createServiceSpan(SERVICE, 'findAll', span);
    const users = await this.metricRepository.find();
    serviceSpan.finish();
    return users;
  }

  async saveMetric(metric: Metric): Promise<Metric> {
    try {
      return await this.metricRepository.save(metric);
    } catch (error) {
      const previousError = error as Error;
      throw new HttpError(
        `Error while saving metric: ${previousError.message}`,
        'METRIC_SAVE_ERROR',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      ).wrap(previousError);
    }
  }

  async deleteMetric(id: string): Promise<void> {
    try {
      await this.metricRepository.delete(id);
    } catch (error) {
      const previousError = error as Error;
      throw new HttpError(
        `Error while deleting metric: ${previousError.message}`,
        'METRIC_DELETE_ERROR',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      ).wrap(previousError);
    }
  }
}

const metricService = new MetricService();

export default metricService;
