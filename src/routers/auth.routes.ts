import { Router } from "express";
import AuthController from "../controller/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";
import { UserRole } from "../modals/user.model";
import loginRateLimiter from "../middleware/loginRateLimiter.middleware";

const router = Router();

const authController = new AuthController();

router.post("/register", authController.register);

router.post("/login", loginRateLimiter, authController.login);

router.post("/logout", authController.logout);

router.get("/me", requireAuth, authController.me);

router.delete(
  "/deleteUser/:userId",
  requireAuth,
  allowRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  authController.deleteUser,
);

export default router;
