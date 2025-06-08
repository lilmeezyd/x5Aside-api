import express from 'express';
const router = express.Router();
import { createFixtures, getFixtures, getFixtureById, scoreFixtureById, deleteAllFixtures } from '../controllers/fixtureController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/', getFixtures);
router.get('/:id', getFixtureById);
router.post('/', createFixtures);
router.delete('/', deleteAllFixtures);
router.post("/score-fixture/:fixtureId", scoreFixtureById);


export default router;