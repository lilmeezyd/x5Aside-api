import express from 'express';
const router = express.Router();
import { createFixtures, getFixtures, getFixtureById, scoreFixtureById, deleteAllFixtures, calculateClassicScores, calculateH2HScores, createPlayerFixtures } from '../controllers/fixtureController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/', getFixtures);
router.get('/:id', getFixtureById);
router.post('/', createFixtures);
router.delete('/', deleteAllFixtures);
router.post("/calculate-classic-scores", calculateClassicScores);
router.post("/calculate-h2h-scores", calculateH2HScores);
router.post("/create-player-fixtures", createPlayerFixtures);
router.post("/score-fixture/:fixtureId", scoreFixtureById);


export default router;