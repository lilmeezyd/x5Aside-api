import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createTeam } from '../controllers/teamController.js';

router.post('/', createTeam);

export default router;