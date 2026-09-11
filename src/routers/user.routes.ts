import { Router } from "express";
import UserController from "../controller/user.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { allowRoles, allowSelfOrRoles } from "../middleware/role.middleware";
import { UserRole } from "../modals/user.model";

const userControler = new UserController();

const router = Router();

router.get(
  "/",
  requireAuth,
  allowRoles(UserRole.SUPER_ADMIN),
  userControler.getUsers,
);
router.get(
  "/:id",
  requireAuth,
  allowSelfOrRoles("id", UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userControler.getUser,
);

export default router;
