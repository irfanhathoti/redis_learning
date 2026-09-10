import { Request, Response } from "express";
import logger from "../utils/logger";
import User from "../modals/user.model";
import CacheService from "../services/cache.service";

class UserController {
  private cacheService = new CacheService();
  public getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { limit, skip } = req.body;
      const users = await User.find({})
        .limit(limit || 10)
        .skip(skip || 0);
      return res.status(200).json({ success: true, users });
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
