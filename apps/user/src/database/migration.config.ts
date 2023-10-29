import { DataSource } from 'typeorm';

import getConfig from './database.config';

const datasource = new DataSource(getConfig());

// eslint-disable-next-line @typescript-eslint/no-floating-promises
datasource.initialize();

export default datasource;
