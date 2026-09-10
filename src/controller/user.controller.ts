import { Request, Response } from "express";
import logger from "../utils/logger";
import User from "../modals/user.model";

class UserController {
  public getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users = await User.find({});
      return res.status(200).json({ success: true, users });
    } catch (error) {
      logger.error("Failed to get users", { error });
      return res
        .status(500)
        .json({ success: false, message: "Failed to get users." });
    }
  };
}

export default UserController;
