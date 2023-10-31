import winston from 'winston';

import getAdditionalFormat, {
  AdditionalProperties,
} from './util/getAdditionalFormat';
import getLogLevel from './util/getLogLevel';
import getOutputFormat from './util/getOutputFormat';
import getSilent from './util/getSilent';

const {
  format: { combine, errors },
  transports,
} = winston;

type Options = {
  additionalProperties?: AdditionalProperties;
};

type NpmCliLevel =
  | 'warn'
  | 'help'
  | 'data'
  | 'prompt'
  | 'http'
  | 'verbose'
  | 'input'
  | 'silly';

export type LoggerInterface = Omit<winston.Logger, NpmCliLevel>;

const DEFAULT_LEVEL = 'debug';

/**
 * Initializes a logger instance. The log level is determined by the
 * "LOG_LEVEL" environment variable.
 * @param additionalProperties Object that contains additional
 * properties that should be set as keys with a getter function as a
 * value
 */
export function createLogger({
  additionalProperties,
}: Options = {}): LoggerInterface {
  const level = getLogLevel();
  const outputFormat = getOutputFormat();
  const silent = getSilent();

  const additionalFormat = getAdditionalFormat(additionalProperties ?? {});

  const logger = winston.createLogger({
    format: combine(
      errors({ stack: true }),
      combine(additionalFormat(), ...outputFormat),
    ),
    level: level ?? DEFAULT_LEVEL,
    levels: winston.config.syslog.levels,
    silent,
    transports: [new transports.Console()],
  });

  if (level === undefined) {
    logger.info(`No log level specified, falling back to ${DEFAULT_LEVEL}.`);
  }

  return logger;
}

export default createLogger();
