import express from 'express';
const router = express.Router();
import { createPlayer, getPlayers, deleteAllPlayers, deletePlayer } from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', createPlayer);
router.get('/', getPlayers);
router.delete('/', deleteAllPlayers);
router.delete('/:id', deletePlayer);

export default router;
