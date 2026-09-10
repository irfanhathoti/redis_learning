import { Router } from "express";
import UserController from "../controller/user.controller";
import { requireAuth } from "../middleware/auth.middleware";

const userControler = new UserController();

const router = Router();

router.get("/", requireAuth, userControler.getUsers);

export default router;
