const logLevels = [
  'emerg',
  'alert',
  'crit',
  'error',
  'warning',
  'notice',
  'info',
  'debug',
];

export default function getLogLevel() {
  const logLevel = process.env.LOG_LEVEL;

  if (logLevel === undefined) {
    return logLevel;
  }

  const isValidLogLevel = logLevels.includes(logLevel);

  if (!isValidLogLevel) {
    throw new Error(
      `LOG_LEVEL environment variable incorrectly set, should be one of: "${logLevels.join(
        '", "',
      )}"`,
    );
  }

  return logLevel;
}
