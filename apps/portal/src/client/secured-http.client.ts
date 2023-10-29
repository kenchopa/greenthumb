import axios, { AxiosError, AxiosInstance } from 'axios';

import DataError from '../errors/DataError';
import { ApiProblem } from '../types/api-problem.type';

export default abstract class SecuredHttpClient {
  protected instance: AxiosInstance;

  protected authorizationToken: string;

  protected readonly baseUri: string;

  public constructor(baseUri: string, authorizationToken: string) {
    this.baseUri = baseUri;
    this.authorizationToken = authorizationToken;
    this.instance = axios.create({
      baseURL: baseUri,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${authorizationToken}`,
        'Content-Type': 'application/json',
      },
    });

    this.initializeResponseInterceptor();
  }

  private initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use((response) => {
      return response;
    }, this.handleError);
  };

  // eslint-disable-next-line class-methods-use-this
  private handleError = async (error: AxiosError) => {
    let errorMessage = error.message;
    const apiProblem = error?.response?.data as ApiProblem;

    if (apiProblem !== undefined) {
      errorMessage = apiProblem.detail;
    }

    const httpStatus = error.response?.status;
    if (httpStatus === 409) {
      throw new DataError('CONFLICTED_ENTITY', errorMessage);
    } else if (httpStatus === 404) {
      throw new DataError('NOT_FOUND', errorMessage);
    } else if (httpStatus === 400) {
      throw new DataError('BAD_REQUEST', errorMessage);
    }

    throw new Error(errorMessage);
  };
}
