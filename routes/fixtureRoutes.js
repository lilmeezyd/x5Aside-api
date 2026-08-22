import express from "express";
const router = express.Router();
import {
  createFixtures,
  getFixtures,
  getFixtureById,
  scoreFixtureById,
  deleteAllFixtures,
  calculateClassicScores,
  calculateClassicProScores,
  calculateH2HScores,
  createPlayerFixtures,
  getPlayerFixtures,
  calculatePlayerFixScores,
  getCurrentFixtures,
  getNextFixtures,
  createProFixtures,
} from "../controllers/fixtureController.js";
import { cronAuth } from "../middleware/cronMiddleware.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";

router.get("/", getFixtures);
router.post("/", protect, roles(ROLES.ADMIN), createFixtures);
router.delete("/", protect, roles(ROLES.ADMIN), deleteAllFixtures);
router.post(
  "/create-pro-fixtures",
  protect,
  roles(ROLES.ADMIN),
  createProFixtures,
);
router.patch(
  "/calculate-classic-scores",
  protect,
  roles(ROLES.ADMIN),
  calculateClassicScores,
);
router.patch(
  "/calculate-classic-pro-scores",
  protect,
  roles(ROLES.ADMIN),
  calculateClassicProScores,
);

router.patch(
  "/calculate-h2h-scores",
  protect,
  roles(ROLES.ADMIN),
  calculateH2HScores,
);
router.post(
  "/create-player-fixtures",
  protect,
  roles(ROLES.ADMIN),
  createPlayerFixtures,
);
router.patch(
  "/calculate-player-fixture-scores",
  protect,
  roles(ROLES.ADMIN),
  calculatePlayerFixScores,
);
router.get("/player-fixtures", getPlayerFixtures);
router.get("/current", getCurrentFixtures);
router.get("/next", getNextFixtures);
router.post("/score-fixture/:fixtureId", scoreFixtureById);
router.get("/:id", getFixtureById);

/* using cron jobs */
router.patch(
  "/calculate-classic-scores-cron",
  cronAuth,
  calculateClassicScores,
);

router.patch(
  "/calculate-classic-pro-scores-cron",
  cronAuth,
  calculateClassicProScores,
);

router.patch("/calculate-h2h-scores-cron", cronAuth, calculateH2HScores);
router.patch(
  "/calculate-player-fixture-scores-cron",
  cronAuth,
  calculatePlayerFixScores,
);

export default router;
