import express from 'express';
const router = express.Router();
import { createPlayer, getPlayers } from '../controllers/playerController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createPlayer);
router.get('/', getPlayers)

export default router;
