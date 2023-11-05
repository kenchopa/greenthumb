import { CommandBusInterface } from '@greenthumb/cqrs';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpPost,
  request,
  response,
} from 'inversify-express-utils';
import { v4 as uuidv4 } from 'uuid';

import CreateMetricCommand from '../../../application/commands/definitions/createMetric.definition';
import TYPES from '../../../types';

@controller('/api/v1/metrics')
export default class CreateMetricController {
  constructor(
    @inject(TYPES.CommandBus) private readonly _commandBus: CommandBusInterface,
  ) {}

  @httpPost('')
  async invoke(@request() req: Request, @response() res: Response) {
    const { type, attributes } = req.body;
    const id = uuidv4();

    const metric = await this._commandBus.send(
      new CreateMetricCommand(id, type, attributes),
    );

    return res.json({
      message: 'Created application successfully',
      metric,
    });
  }
}
