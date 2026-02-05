import { Environment } from '../constants/enum.constants';

/** Default values when env vars are not set */
const DEFAULT_PORT = 3000;
const DEFAULT_WEATHER_API_KEY = 'mock_key';
const DEFAULT_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Returns application configuration from environment variables.
 * Used by ConfigModule to expose config to the application.
 * Missing optional values fall back to defaults.
 */
const envConfigs = () => ({
  env: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === Environment.Production,
  isDevelopment: process.env.NODE_ENV === Environment.Development,
  isTest: process.env.NODE_ENV === Environment.Test,

  port: parseInt(process.env.PORT ?? String(DEFAULT_PORT), 10) || DEFAULT_PORT,

  appPrefixes: {
    apiPrefix: process.env.API_URI ?? 'api',
    swaggerPrefix: process.env.SWAGGER_URI ?? 'api',
  },

  weather: {
    apiKey: process.env.WEATHER_API_KEY ?? DEFAULT_WEATHER_API_KEY,
    apiUrl: process.env.WEATHER_API_URL ?? DEFAULT_WEATHER_API_URL,
  },

  auth: {
    mockEmail: process.env.AUTH_MOCK_EMAIL ?? 'user@example.com',
    mockPassword: process.env.AUTH_MOCK_PASSWORD ?? 'Password123',
    mockToken: process.env.AUTH_MOCK_TOKEN ?? 'mockToken123',
  },

  jwt: {
    validToken: process.env.JWT_VALID_TOKEN ?? 'validToken123',
  },
  cache: {
    host: process.env.CACHE_HOST ?? 'localhost',
    port: parseInt(process.env.CACHE_PORT ?? String(6379), 10) || 6379,
    password: process.env.CACHE_PASSWORD ?? 'password',
  },
});

export default envConfigs;
