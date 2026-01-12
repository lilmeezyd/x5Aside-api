import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createTeam, deleteAllTeams, deleteTeam, getTeamTotalPoints,  getTeamById, getTeams } from '../controllers/teamController.js';

router.get('/', getTeams);
router.post('/', protect, createTeam);
router.delete('/', protect, deleteAllTeams);
router.get('/total', getTeamTotalPoints)
router.get('/:id', protect, getTeamById);
router.delete('/:id', protect, deleteTeam);
export default router;