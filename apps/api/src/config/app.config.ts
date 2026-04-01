import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  url: process.env.APP_URL || 'http://localhost:3000',
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173',
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    path: process.env.SWAGGER_PATH || 'api/docs',
  },
}));
