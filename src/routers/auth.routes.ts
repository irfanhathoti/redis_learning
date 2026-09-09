import { Router } from "express";
import AuthController from "../controller/auth.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

const authController = new AuthController();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.get("/me", requireAuth, authController.me);

export default router;
