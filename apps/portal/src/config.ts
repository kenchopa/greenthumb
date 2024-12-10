import Joi from 'joi';

type App = {
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: 'emerg' | 'alert' | 'crit' | 'error' | 'warning' | 'notice' | 'info' | 'debug';
};

type Auth = {
  JWT_ANONYMOUS: string;
};

type Services = {
  USER: string;
};

type Config = {
  APP: App;
  AUTH: Auth;
  SERVICES: Services;
};

const configSchema = Joi.object({
  JWT_ANONYMOUS: Joi.string().required(),
  LOG_LEVEL: Joi.string().required(),
  NODE_ENV: Joi.string().required(),
  USER_SERVICE_URI: Joi.string().required(),
});

const configToValidate = {
  JWT_ANONYMOUS: import.meta.env.VITE_JWT_ANONYMOUS,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
  NODE_ENV: import.meta.env.DEV ? 'development' : 'production',
  USER_SERVICE_URI: import.meta.env.VITE_SERVICE_USER_URI,
};

const {
  error,
  value: { LOG_LEVEL, NODE_ENV, USER_SERVICE_URI, JWT_ANONYMOUS },
} = configSchema.validate(configToValidate, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  console.log('Something went wrong with the provided environment variables.');
  process.exit(1);
}

const config: Config = {
  APP: {
    LOG_LEVEL,
    NODE_ENV,
  },
  AUTH: { JWT_ANONYMOUS },
  SERVICES: {
    USER: USER_SERVICE_URI,
  },
};

export default config;
