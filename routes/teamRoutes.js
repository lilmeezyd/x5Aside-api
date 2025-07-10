import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createTeam, deleteAllTeams, deleteTeam,  getTeamById, getTeams } from '../controllers/teamController.js';

router.get('/', protect, getTeams);
router.post('/', createTeam);
router.delete('/', deleteAllTeams);
router.get('/:id', getTeamById);
router.delete('/:id', deleteTeam);
export default router;