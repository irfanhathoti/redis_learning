import redisClient from "../config/redis";
import logger from "../utils/logger";

class CacheService {
  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error("Cache get failed", {
        error,
        key,
      });

      return null;
    }
  }

  public async set(
    key: string,
    data: unknown,
    ttlSeconds = 300,
  ): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(data), {
        EX: ttlSeconds,
      });
    } catch (error) {
      logger.error("Cache set failed", {
        error,
        key,
      });
    }
  }

  public async deleteKey(key: string): Promise<boolean> {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error("Cache delete failed", {
        error,
        key,
      });
      return false;
    }
  }
}

export default CacheService;
