import express from "express";
const router = express.Router();
import upload from "../middleware/uploadMiddleware.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
import {
  createTeam,
  createProTeamAndMembers,
  deleteAllTeams,
  deleteTeam,
  getTeamTotalPoints,
  getTeamById,
  getTeams,
  getPicks,
  editPicks,
  getPicksWithPoints,
} from "../controllers/teamController.js";

router.get("/", getTeams);
router.post("/", protect, roles(ROLES.ADMIN), createTeam);
router.delete("/", protect, roles(ROLES.ADMIN), deleteAllTeams);
router.get("/total", getTeamTotalPoints);
router.get("/picks", protect, roles(ROLES.COMMUNITY), getPicks);
router.get("/:id", getTeamById);
router.get("/event/:id/picksWithPoints", getPicksWithPoints);
router.put("/event/:id/picks", protect, roles(ROLES.COMMUNITY), editPicks);
router.delete("/:id", protect, roles(ROLES.ADMIN), deleteTeam);
router.post(
  "/createProTeamAndMembers",
  upload.single("file"),
  protect,
  roles(ROLES.COMMUNITY),
  createProTeamAndMembers,
);
export default router;
