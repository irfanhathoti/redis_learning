import { Request, Response } from "express";
import logger from "../utils/logger";
import User from "../modals/user.model";
import CacheService from "../services/cache.service";

class UserController {
  private cacheService = new CacheService();
  public getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

      const skip = Math.max(Number(req.query.skip) || 0, 0);

      const cacheKey = `users:list:${limit}:${skip}`;

      const cachedUsers = await this.cacheService.get(cacheKey);

      if (cachedUsers) {
        return res.status(200).json({
          success: false,
          source: "cache",
          data: cachedUsers,
        });
      }

      const [users, total] = await Promise.all([
        User.find({}).select("-passwordHash").limit(limit).skip(skip).lean(),

        User.countDocuments(),
      ]);


      const result = {
        users,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + users.length < total,
        },
      };

      await this.cacheService.set(cacheKey, result, 300);

      return res.status(200).json({
        success: true,
        source: "database",
        data: result,
      });
    } catch (error) {
      logger.error("Failed to get users", { error });
      return res
        .status(500)
        .json({ success: false, message: "Failed to get users." });
    }
  };
  public getUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "user id required" });
      }
      const cacheKey = `user:${id}`;
      const cachedUser = await this.cacheService.get(cacheKey);
      if (cachedUser) {
        return res
          .status(200)
          .json({ success: true, source: "cache", data: cachedUser });
      }
      const user = await User.findById(id).select("-passwordHash").lean();
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      await this.cacheService.set(cacheKey, user, 300);
      return res
        .status(200)
        .json({ success: true, data: user, source: "database" });
    } catch (error) {
      logger.error("Failed to fetch user");
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch user" });
    }
  };
}

export default UserController;
