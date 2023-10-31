import { Client } from 'cassandra-driver';

const createCassandraClient = (
  hosts: string[],
  dc: string,
  keyspace: string,
): Client => {
  // TODO: Add retry logic
  // TODO: Add logging
  // TODO: Add error handlings
  const client: Client = new Client({
    contactPoints: hosts,
    keyspace,
    localDataCenter: dc,
  });

  return client;
};

export default createCassandraClient;
