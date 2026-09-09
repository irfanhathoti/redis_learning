import { NextFunction, Request, Response } from "express";
import User, { IUser, UserStatus } from "../modals/user.model";

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      req.session.destroy(() => {});

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      req.session.destroy(() => {});

      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
