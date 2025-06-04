import express from 'express';
const router = express.Router();
import { createFixture } from '../controllers/fixtureController.js';
import { protect } from '../middleware/authMiddleware.js';
import scoreFixtureById from "../controllers/scoreFixtureById";

router.post('/', protect, createFixture);


router.post("/score-fixture/:fixtureId", scoreFixtureById);


export default router;