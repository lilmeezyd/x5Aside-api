import express from 'express';
const router = express.Router();
import { createFixtures, getFixtures, getFixtureById, scoreFixtureById, deleteAllFixtures, calculateClassicScores, calculateH2HScores, createPlayerFixtures,
        getPlayerFixtures,
       calculatePlayerFixScores,
       getCurrentFixtures, getNextFixtures } from '../controllers/fixtureController.js';
import { cronAuth } from '../middleware/cronMiddleware.js'
import { protect } from '../middleware/authMiddleware.js';

router.get('/', getFixtures);
router.post('/', protect, createFixtures);
router.delete('/', protect, deleteAllFixtures);
router.patch("/calculate-classic-scores", protect, calculateClassicScores);
router.patch("/calculate-h2h-scores", protect, calculateH2HScores);
router.post("/create-player-fixtures", protect, createPlayerFixtures);
router.patch("/calculate-player-fixture-scores", protect, calculatePlayerFixScores);
router.get("/player-fixtures", getPlayerFixtures);
router.get('/current', getCurrentFixtures);
router.get('/next', getNextFixtures);
router.post("/score-fixture/:fixtureId", scoreFixtureById);
router.get('/:id', getFixtureById)

/* using cron jobs */
router.patch("/calculate-classic-scores-cron", cronAuth, calculateClassicScores);
router.patch("/calculate-h2h-scores-cron", cronAuth, calculateH2HScores);
router.patch("/calculate-player-fixture-scores-cron", cronAuth, calculatePlayerFixScores);



export default router;