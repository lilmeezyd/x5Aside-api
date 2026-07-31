import express from "express";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();
import {
  login,
  register,
  logout,
  getProfile,
  registerTeamManager,
  getRegisteredTeamManagers,
  deleteTeamManager
} from "../controllers/userController.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.post("/registerTeamManager", protect, roles(ROLES.ADMIN), registerTeamManager)
router.get("/getRegisteredTeamManagers", protect, roles(ROLES.ADMIN), getRegisteredTeamManagers)
router.delete("/teamManagers/:id", protect, roles(ROLES.ADMIN), deleteTeamManager)

export default router;
