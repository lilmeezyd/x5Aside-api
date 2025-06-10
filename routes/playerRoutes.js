import express from 'express';
const router = express.Router();
import { createPlayer, getPlayers, deleteAllPlayers, deletePlayer, fetchAndStorePlayerEventPoints,
       getPlayerEventPoints } from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', createPlayer);
router.get('/', getPlayers);
router.delete('/', deleteAllPlayers);
router.delete('/:id', deletePlayer);
router.put('/sync-event-points', fetchAndStorePlayerEventPoints);
router.get('/:playerId/event-points', getPlayerEventPoints);

export default router;
