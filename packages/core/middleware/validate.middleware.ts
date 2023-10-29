import { ObjectSchema, ValidationErrorItem, ValidationOptions } from 'joi';
import { Context, Next } from 'koa';

import BadRequestError from '../errors/http/badRequest.error';
import HttpStatusCode from '../errors/httpStatusCode.enum';

enum RequestProperty {
  PARAMS = 'params',
  BODY = 'body',
  QUERY = 'query',
}

export type RequestRules = Partial<Record<RequestProperty, ObjectSchema>>;

// Custom type so we have index access, as the Koa types for Request seem to not
// allow this. Avoid Record as this does not overlap enough with the Koa Request
// type.
type RequestWithIndex = {
  [key in RequestProperty]?: unknown;
};

type ConvertedJoiErrors = Record<
  string,
  Pick<ValidationErrorItem, 'message' | 'type'>
>;

type RequestValidationResult = {
  convertedParams?: string;
  convertedBody?: string;
  convertedQuery?: string;
  paramErrors?: ConvertedJoiErrors[];
  bodyErrors?: ConvertedJoiErrors[];
  queryErrors?: ConvertedJoiErrors[];
};

export default function makeValidateMiddleware() {
  return async (ctx: Context, next: Next) => {
    /**
     * Validates a request against given Joi rules. Note that Joi's `convert` option is
     * enabled but it's `optional` option is disabled. Both preferences can be overridden
     * for specific fields if necessary.
     *
     * @param rules - Schema to validate request properties with, this can be an
     * empty object (which would mean no validation is required).
     *
     * @returns A promise on the Koa context to support chaining-like behavior.
     * @throws HttpError in case of validation error, an HTTP error is thrown with all
     * validation details.
     */
    ctx.validate = (rules: RequestRules) => {
      // Utility to convert array of Joi errors
      const convertError = (joiDetails: ValidationErrorItem[]) =>
        joiDetails.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.path.join(',')]: { message: curr.message, type: curr.type },
          }),
          {} as ConvertedJoiErrors,
        );

      // Validation options. Return all errors (abortEarly) and don't autocast
      // values to the required types! Consider everything required by default.
      const validationOptions: ValidationOptions = {
        abortEarly: false,
        convert: true,
        presence: 'required',
      };

      const {
        convertedParams = {},
        convertedBody = {},
        convertedQuery = {},
        ...errorData
      } = Object.values(RequestProperty)
        .map((prop) => {
          const { value, error } =
            rules[prop]?.validate(
              (ctx.request as RequestWithIndex)?.[prop] ?? {},
              validationOptions,
            ) ?? {};
          const capitalizedProp = prop[0].toUpperCase() + prop.slice(1);
          return {
            [`converted${capitalizedProp}`]: value,
            ...(error && { [`${prop}Errors`]: convertError(error.details) }),
          };
        })
        .reduce(
          (accumulatedResult, propResult) => ({
            ...accumulatedResult,
            ...propResult,
          }),
          {} as RequestValidationResult,
        );

      // If there was an error, throw an HTTP Bad Request Error
      if (Object.keys(errorData).length > 0) {
        const violations: any = errorData;
        throw BadRequestError.forViolations(violations);
      }

      ctx.status = HttpStatusCode.BAD_REQUEST;

      // Patch ctx with converted values
      ctx.state.params = convertedParams;
      ctx.state.body = convertedBody;
      ctx.state.query = convertedQuery;

      // Otherwise, we're done.
      return ctx;
    };

    await next();
  };
}
