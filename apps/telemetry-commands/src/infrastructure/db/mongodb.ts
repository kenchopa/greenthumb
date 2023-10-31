import { Db, MongoClient, MongoClientOptions } from 'mongodb';

import config from '../../config';

const createMongodbConnection = async (
  host: string,
  options: MongoClientOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
): Promise<Db> => {
  // TODO: Add retry logic
  // TODO: Add logging
  // TODO: Add error handling
  return new Promise((resolve, reject) => {
    MongoClient.connect(host, options, (error: any, client: any) => {
      if (error) reject(error);
      resolve(client.db(config.DB_NAME));
    });
  });
};

export default createMongodbConnection;
