import redisClient from "../config/redis";
import logger from "../utils/logger";

export const userCacheKey = (id: string) => `user:${id}`;
export const usersListCacheKey = (limit: number, skip: number) =>
  `users:list:${limit}:${skip}`;
export const USERS_LIST_PATTERN = "users:list:*";

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

  // SCAN rather than KEYS so a big keyspace doesn't block Redis
  public async deleteByPattern(pattern: string): Promise<number> {
    let deleted = 0;
    try {
      for await (const keys of redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      })) {
        if (keys.length) deleted += await redisClient.del(keys);
      }
    } catch (error) {
      logger.error("Cache pattern delete failed", { error, pattern });
    }
    return deleted;
  }
}

export default CacheService;
