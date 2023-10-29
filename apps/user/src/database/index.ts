import logger from '@greenthumb/logger';
import { DataSource } from 'typeorm';

import config from '../config';
import getConfig from './database.config';

export const dataSource = new DataSource(getConfig());

const initializeDbConnection = async (): Promise<DataSource> => {
  try {
    const connection = await dataSource.initialize();
    logger.info(
      `Database "${config.TYPEORM.DATABASE}" connection successful established.`,
    );
    return connection;
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    logger.error(`Database connection error: ${error.message}.`);

    throw error;
  }
};

export const checkDefaultDatabase = async () => {
  const errorMessage = 'Database is not connected.';

  if (!dataSource.isInitialized) {
    throw new Error(errorMessage);
  }

  try {
    await dataSource.query('SELECT 1');
  } catch (error) {
    logger.error(`${errorMessage}: ${(error as Error).message}`);
    throw new Error(errorMessage);
  }
};

export default initializeDbConnection;
