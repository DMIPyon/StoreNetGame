import { createClient } from 'redis';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
redisClient.connect()
  .then(() => logger.info('Redis connected'))
  .catch((err) => logger.error({ err }, 'Redis connection failed')); 