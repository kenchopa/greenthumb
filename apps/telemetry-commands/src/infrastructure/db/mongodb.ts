import logger from '@greenthumb/logger';
import { Db, MongoClient } from 'mongodb';

import config from '../../config';

export default async function createMongodbConnection(
  uri: string,
): Promise<Db> {
  const client = new MongoClient(uri);

  // Connect to the MongoDB server
  await client.connect();

  // Connect to the desired database (replace 'mydb' with your database name)
  const db = client.db(config.MONGODB.DB_NAME);
  logger.debug(`Connection to MongoDB server established on "${uri}".`);

  return db;
}
