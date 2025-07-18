import express from 'express';
const router = express.Router();
import { createPlayer, getPlayers, deleteAllPlayers, deletePlayer,   fetchAndStorePlayerEventPoints,
        updateLeadingScorers,
        getLeadingScorers, updatePlayer,
       getPlayerEventPoints } from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', createPlayer);
router.get('/', getPlayers);
router.delete('/', deleteAllPlayers);
router.put('/sync-event-points', fetchAndStorePlayerEventPoints);
router.post('/update-leading-scorers', updateLeadingScorers);
router.get('/get-leading-scorers', getLeadingScorers);
router.patch('/:id', updatePlayer);
router.delete('/:id', deletePlayer);
router.get('/:playerId/event-points', getPlayerEventPoints);

export default router;
