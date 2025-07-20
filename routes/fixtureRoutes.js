import express from 'express';
const router = express.Router();
import { createFixtures, getFixtures, getFixtureById, scoreFixtureById, deleteAllFixtures, calculateClassicScores, calculateH2HScores, createPlayerFixtures,
        getPlayerFixtures,
       calculatePlayerFixScores } from '../controllers/fixtureController.js';
import { cronAuth } from '../middleware/cronMiddleware.js'
import { protect } from '../middleware/authMiddleware.js';

router.get('/', getFixtures);
router.post('/', createFixtures);
router.delete('/', deleteAllFixtures);
router.patch("/calculate-classic-scores", calculateClassicScores);
router.patch("/calculate-h2h-scores", calculateH2HScores);
router.post("/create-player-fixtures", createPlayerFixtures);
router.patch("/calculate-player-fixture-scores", calculatePlayerFixScores);
router.get("/player-fixtures", getPlayerFixtures);
router.post("/score-fixture/:fixtureId", scoreFixtureById);
router.get('/:id', getFixtureById)

/* using cron jobs */
router.patch("/calculate-classic-scores-cron", cronAuth, calculateClassicScores);
router.patch("/calculate-h2h-scores-cron", cronAuth, calculateH2HScores);
router.patch("/calculate-player-fixture-scores-cron", cronAuth, calculatePlayerFixScores);



export default router;