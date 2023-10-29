import winston from 'winston';

export type AdditionalProperties = Record<string, () => string>;

export default function getAdditionalFormat(
  additionalProperties: AdditionalProperties,
) {
  return winston.format((info) => {
    Object.entries(additionalProperties).forEach(([property, getter]) => {
      // eslint-disable-next-line no-param-reassign
      info[property] = getter();
    });
    return info;
  });
}
