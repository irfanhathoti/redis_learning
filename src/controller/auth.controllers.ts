import { Request, Response } from "express";
import mongoose from "mongoose";
import logger from "../utils/logger";
import User, { UserRole, UserStatus } from "../modals/user.model";
import bcrypt from "bcrypt";
import {
  regenerateSession,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "../config/session";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validate";
import z from "zod";

class AuthController {
  //register
  public register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        logger.error("Validation feild required field.");
        return res.status(400).json({
          message: "Validation failed",
          status: false,
          errors: z.treeifyError(result.error),
        });
      }

      // zod already trimmed and lowercased these
      const { name, email, password } = result.data;

      const existEmail = await User.findOne({
        email,
      });
      if (existEmail) {
        return res.status(409).json({
          message: "Email already registered",
          status: false,
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        name,
        email,
        passwordHash,
      });
      logger.info("User register successfully", { email });
      return res.status(201).json({
        status: true,
        message: "User registered successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      // unique index fires when two signups race past the findOne above
      if ((error as { code?: number }).code === 11000) {
        return res.status(409).json({
          message: "Email already registered",
          status: false,
        });
      }

      logger.error("Field to register", { error });
      return res.status(500).json({
        success: false,
        message: "User registration failed",
      });
    }
  };

  //login
  public login = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        logger.warn("Fields required.");
        return res.status(400).json({
          success: false,
          message: "Validation failed.",
          errors: z.treeifyError(result.error),
        });
      }
      const { email, password } = result.data;

      const user = await User.findOne({
        email,
      }).select("+passwordHash");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const passwordValidate = await user.comparePassword(password);
      if (!passwordValidate) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (user.status !== UserStatus.ACTIVE) {
        return res
          .status(403)
          .json({ success: false, message: "Account is not active" });
      }

      await regenerateSession(req);

      req.session.userId = user._id.toString();

      user.lastLoginAt = new Date();

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("Login failed", {
        error,
      });

      return res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Logout field",
        });
        return;
      }
      res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions);

      res.status(200).json({
        success: true,
        message: "Logout successfully",
      });
    });
  };

  public me = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<Response> => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to get user." });
    }
  };

  public deleteUser = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { userId } = req.params;

      if (!userId || !mongoose.isValidObjectId(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "A valid userId is required" });
      }

      const { deletedCount } = await User.deleteOne({
        _id: userId,
      });

      if (deletedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res
        .status(200)
        .json({ success: true, message: "User successfully deleted" });
    } catch (error) {
      logger.error("Failed to delete user", { error });
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
  };
}

export default AuthController;
