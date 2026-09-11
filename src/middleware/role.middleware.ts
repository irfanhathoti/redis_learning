import { NextFunction, Response } from "express";

import { AuthenticatedRequest } from "./auth.middleware";
import { UserRole } from "../modals/user.model";

export const allowRoles =
  (...roles: UserRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };

// for routes where users may act on their own record, e.g. /users/:id
export const allowSelfOrRoles =
  (param: string, ...roles: UserRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const isSelf = String(req.user._id) === req.params[param];

    if (!isSelf && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
