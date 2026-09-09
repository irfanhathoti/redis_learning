import { Router } from "express";
import AuthController from "../controller/auth.controllers";
import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";
import { UserRole } from "../modals/user.model";

const router = Router();

const authController = new AuthController();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/me", requireAuth, authController.me);

router.delete(
  "/deleteUser",
  requireAuth,
  allowRoles(UserRole.ADMIN),
  authController.deleteUser,
);

export default router;
