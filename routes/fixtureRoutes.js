import express from 'express';
const router = express.Router();
import { createFixture, scoreFixtureById } from '../controllers/fixtureController.js';
import { protect } from '../middleware/authMiddleware.js';


router.post('/', protect, createFixture);


router.post("/score-fixture/:fixtureId", scoreFixtureById);


export default router;