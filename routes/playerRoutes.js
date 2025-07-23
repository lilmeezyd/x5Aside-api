import express from 'express';
const router = express.Router();
import { createPlayer, getPlayers, deleteAllPlayers, deletePlayer,   fetchAndStorePlayerEventPoints,
        updateLeadingScorers,
        getLeadingScorers, updatePlayer,
       getPlayerEventPoints } from '../controllers/playerController.js';
import { cronAuth } from '../middleware/cronMiddleware.js'

import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createPlayer);
router.get('/', getPlayers);
router.delete('/', protect, deleteAllPlayers);


router.put('/sync-event-points', protect, fetchAndStorePlayerEventPoints);
router.post('/update-leading-scorers', protect, updateLeadingScorers);
/* Cron jobs */
router.post('/update-leading-scorers-cron', cronAuth, updateLeadingScorers);
router.put('/sync-event-points-cron', cronAuth, fetchAndStorePlayerEventPoints);


router.get('/get-leading-scorers', getLeadingScorers);
router.patch('/:id', protect, updatePlayer);
router.delete('/:id', protect, deletePlayer);
router.get('/:playerId/event-points', protect,  getPlayerEventPoints);



export default router;
