import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || 'redis123',
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
};

class RedisClient {
  constructor() {
    this.client = new Redis(redisConfig);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('✅ Redis conectado exitosamente');
    });

    this.client.on('error', (err) => {
      console.error('❌ Error de conexión Redis:', err);
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Reconectando a Redis...');
    });
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting from Redis:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Error setting to Redis:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Error deleting from Redis:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Error checking key existence in Redis:', error);
      return false;
    }
  }

  async flushAll() {
    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error('Error flushing Redis:', error);
      return false;
    }
  }

  async disconnect() {
    await this.client.disconnect();
  }
}

export const redis = new RedisClient();
export default redis;