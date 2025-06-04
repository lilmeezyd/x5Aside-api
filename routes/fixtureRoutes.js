import express from 'express';
const router = express.Router();
import { createFixture } from '../controllers/fixtureController.js';
import { protect } from '../middleware/authMiddleware.js';
const scoreFixtureById = require("../controllers/scoreFixtureById");

router.post('/', protect, createFixture);


router.post("/score-fixture/:fixtureId", scoreFixtureById);


export default router;