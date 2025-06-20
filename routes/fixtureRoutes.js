import express from 'express';
const router = express.Router();
import { createFixtures, getFixtures, getFixtureById, scoreFixtureById, deleteAllFixtures, calculateClassicScores, calculateH2HScores, createPlayerFixtures,
        getPlayerFixtures,
       calculatePlayerFixScores } from '../controllers/fixtureController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/', getFixtures);
router.get('/:id', getFixtureById);
router.post('/', createFixtures);
router.delete('/', deleteAllFixtures);
router.patch("/calculate-classic-scores", calculateClassicScores);
router.patch("/calculate-h2h-scores", calculateH2HScores);
router.post("/create-player-fixtures", createPlayerFixtures);
router.patch("/calculate-player-fixture-scores", calculatePlayerFixScores);
router.get("/player-fixtures", getPlayerFixtures);
router.post("/score-fixture/:fixtureId", scoreFixtureById);


export default router;