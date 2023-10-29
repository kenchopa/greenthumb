import Joi, { ObjectSchema } from 'joi';

import { MetricAttributes, MetricType } from '../models/metric.model';
import parseJson from '../util/parser.util';

const moistureAttributesSchema = Joi.object({
  percentage: Joi.number().required(),
  raw: Joi.number().required(),
  voltage: Joi.number().required(),
  volumeWaterContent: Joi.number().required(),
});

const airTemperatureAttributesSchema = Joi.object({
  heatIndexInCelsius: Joi.number().required(),
  heatIndexInFahrenheit: Joi.number().required(),
  temperatureInCelsius: Joi.number().required(),
  temperatureInFahrenheit: Joi.number().required(),
});

const groundTemperatureAttributesSchema = Joi.object({
  heatIndexInCelsius: Joi.number().required(),
  heatIndexInFahrenheit: Joi.number().required(),
  temperatureInCelsius: Joi.number().required(),
  temperatureInFahrenheit: Joi.number().required(),
});

const waterTemperatureAttributesSchema = Joi.object({
  heatIndexInCelsius: Joi.number().required(),
  heatIndexInFahrenheit: Joi.number().required(),
  temperatureInCelsius: Joi.number().required(),
  temperatureInFahrenheit: Joi.number().required(),
});

const phAttributesSchema = Joi.object({
  value: Joi.number().min(0).max(14).required(),
  voltage: Joi.number().required(),
});

const humidityAttributesSchema = Joi.object({
  humidity: Joi.number().required(),
});

const lightAttributesSchema = Joi.object({
  value: Joi.number().min(0).max(14).required(),
  voltage: Joi.number().required(),
});

const metricValidationSchema = new Map<MetricType, ObjectSchema>([
  [MetricType.MOISTURE, moistureAttributesSchema],
  [MetricType.GROUND_TEMPERATURE, groundTemperatureAttributesSchema],
  [MetricType.WATER_TEMPERATURE, waterTemperatureAttributesSchema],
  [MetricType.AIR_TEMPERATURE, airTemperatureAttributesSchema],
  [MetricType.PH, phAttributesSchema],
  [MetricType.HUMIDITY, humidityAttributesSchema],
  [MetricType.LIGHT, lightAttributesSchema],
]);

export default function mapMetricAttributes(
  metricType: MetricType,
  jsonString: string,
): MetricAttributes {
  const metricAttributes = parseJson(jsonString);

  const schema = metricValidationSchema.get(metricType);
  if (!schema) {
    throw new Error(
      `Runtime error: no schema found for metric "${metricType}"`,
    );
  }

  const { error, value } = schema.validate(metricAttributes, {
    allowUnknown: true,
    stripUnknown: true,
  });
  if (error) {
    throw new Error(`Validation error(s) in metric "${metricType}": ${error}`);
  }

  return value;
}
