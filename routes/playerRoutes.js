import express from 'express';
const router = express.Router();
import { createPlayer, getPlayers, deleteAllPlayers, deletePlayer,   fetchAndStorePlayerEventPoints,
        updateLeadingScorers,
        getLeadingScorers, updatePlayer,
       getPlayerEventPoints } from '../controllers/playerController.js';
import { cronAuth } from '../middleware/cronMiddleware.js'

import { protect, roles } from '../middleware/authMiddleware.js';
import ROLES from "../config/permissions.js";

router.post('/', protect, createPlayer);
router.get('/', getPlayers);
router.delete('/', protect, roles(ROLES.ADMIN), deleteAllPlayers);


router.put('/sync-event-points', protect, roles(ROLES.ADMIN), fetchAndStorePlayerEventPoints);
router.post('/update-leading-scorers', protect, roles(ROLES.ADMIN), updateLeadingScorers);
/* Cron jobs */
router.post('/update-leading-scorers-cron', cronAuth, updateLeadingScorers);
router.put('/sync-event-points-cron', cronAuth, fetchAndStorePlayerEventPoints);


router.get('/get-leading-scorers', getLeadingScorers);
router.patch('/:id', protect, roles(ROLES.ADMIN), updatePlayer);
router.delete('/:id', protect, roles(ROLES.ADMIN), deletePlayer);
router.get('/:playerId/event-points', protect, roles(ROLES.ADMIN),  getPlayerEventPoints);



export default router;
