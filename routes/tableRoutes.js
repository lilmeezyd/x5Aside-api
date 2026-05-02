import express from "express";
const router = express.Router();
import {
  getClassicTable,
  getH2HTable,
  getPlayerTable,
  updateClassicTable,
  updateH2HTable,
  updatePlayerTable,
  getPartialClassicTable,
  getPartialH2HTable,
  getPartialPlayerTable,
} from "../controllers/tableController.js";
import { protect } from "../middleware/authMiddleware.js";

router.get("/classic", getClassicTable);
router.get("/h2h", getH2HTable);
router.get("/players", getPlayerTable);
router.get("/classic/startGW/:sid/endGW/:eid", getPartialClassicTable);
router.get("/h2h/startGW/:sid/endGW/:eid", getPartialH2HTable);
router.get("/players/startGW/:sid/endGW/:eid", getPartialPlayerTable);
router.patch("/update-classic", protect, updateClassicTable);
router.patch("/update-h2h", protect, updateH2HTable);
router.patch("/update-players", protect, updatePlayerTable);

export default router;
