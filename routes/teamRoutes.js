import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createTeam, deleteAllTeams, deleteTeam,  getTeamById, getTeams } from '../controllers/teamController.js';

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.delete('/:id', deleteTeam);
router.delete('/', deleteAllTeams);

export default router;