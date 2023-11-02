import { CommandHandlerInterface } from '@greenthumb/cqrs';
import { Metric, MetricRepositoryInterface } from '@greenthumb/domain';
import { inject, injectable } from 'inversify';

import TYPES from '../../../types';
import CreateMetricCommand from '../definitions/createMetric.definition';

@injectable()
export default class CreateMetricCommandHandler
  implements CommandHandlerInterface<CreateMetricCommand>
{
  commandToHandle: string = CreateMetricCommand.name;

  constructor(
    @inject(TYPES.MetricRepository)
    private readonly _repository: MetricRepositoryInterface,
  ) {}

  async handle(command: CreateMetricCommand): Promise<{ id: string }> {
    const metric: Metric = new Metric(
      command.id,
      command.getType(),
      command.getAttributes(),
    );

    this._repository.save(metric, -1);

    return { id: command.id };
  }
}
