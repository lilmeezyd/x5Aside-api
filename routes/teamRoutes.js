import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createTeam } from '../controllers/teamController.js';
import { getTeamById, getTeams } from '../controllers/teamController.js';

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);

export default router;