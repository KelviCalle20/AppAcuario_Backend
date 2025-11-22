import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const userController = new UserController();

router.get("/", userController.getAll.bind(userController));
router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
router.put("/:id", userController.update.bind(userController));
router.patch("/:id/status", userController.changeStatus.bind(userController));
router.delete("/:id", userController.delete.bind(userController));

export default router;

